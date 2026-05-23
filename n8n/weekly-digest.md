# Workflow: weekly-digest

**Trigger:** GitHub Actions cron (Monday 09:00 IST) hits this webhook.
**Webhook path:** `/webhook/weekly-digest`
**Goal:** Email a 200-word review-quality digest to the engineering manager.

## Why a webhook trigger (not n8n's cron node)

We want the digest to fire reliably even if the n8n instance is briefly
down — GitHub Actions retries failed workflow runs, n8n's internal scheduler
does not. Plus, having the schedule live in `.github/workflows/weekly-digest.yml`
keeps it visible in the repo.

## Node-by-node

### 1. Webhook (Trigger)

Path `weekly-digest`. Same HMAC verify pattern as the other workflows
(GitHub Actions can sign the request body with the same shared secret).

### 2. Postgres — Aggregate the week

Single big query that pulls everything the prompt needs:

```sql
WITH last_week AS (
  SELECT * FROM findings WHERE created_at > NOW() - INTERVAL '7 days'
),
prev_week AS (
  SELECT * FROM findings
  WHERE created_at > NOW() - INTERVAL '14 days'
    AND created_at <= NOW() - INTERVAL '7 days'
)
SELECT
  (SELECT COUNT(DISTINCT pr_id) FROM last_week) AS prs_reviewed,
  (SELECT COUNT(*) FROM last_week) AS findings_posted,
  (SELECT COUNT(*) FROM last_week WHERE accepted = TRUE) AS accepted,
  (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE accepted = TRUE)
                / NULLIF(COUNT(*) FILTER (WHERE accepted IS NOT NULL), 0), 1)
   FROM last_week) AS accept_rate_pct,
  (SELECT COUNT(*) FROM prev_week) AS prev_findings_posted,
  (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE accepted = TRUE)
                / NULLIF(COUNT(*) FILTER (WHERE accepted IS NOT NULL), 0), 1)
   FROM prev_week) AS prev_accept_rate_pct,
  (SELECT json_agg(t) FROM (
    SELECT category, COUNT(*) AS count
    FROM last_week
    GROUP BY category
    ORDER BY count DESC
    LIMIT 3
  ) t) AS top_categories,
  (SELECT json_agg(t) FROM (
    SELECT file_path, COUNT(*) AS count
    FROM last_week
    GROUP BY file_path
    ORDER BY count DESC
    LIMIT 3
  ) t) AS top_files,
  (SELECT json_build_object(
    'pr_number', p.pr_number,
    'repo', p.repo,
    'unresolved', (SELECT COUNT(*) FROM last_week f
                   WHERE f.pr_id = p.id AND f.resolved = FALSE)
  ) FROM prs p
  WHERE p.status = 'open'
  ORDER BY (SELECT COUNT(*) FROM last_week f
            WHERE f.pr_id = p.id AND f.resolved = FALSE) DESC
  LIMIT 1) AS slowest_pr;
```

### 3. HTTP — Claude: write the digest

```
POST https://api.anthropic.com/v1/messages

System: <paste prompts/digest.txt verbatim>
User: {{ JSON.stringify(aggregateData) }}
```

### 4. Email — Send the digest

n8n's Email node, configured with SMTP credentials (Gmail app password
works fine on the free tier).

```
To: {{ $env.DIGEST_RECIPIENT_EMAIL }}
Subject: ReviewAI · Weekly Digest · {{ formatDate(now()) }}
Body: {{ claude_digest_text }}
```

### 5. (Optional) Postgres — Log that the digest was sent

```sql
INSERT INTO digest_runs (sent_at, recipient, payload)
VALUES (NOW(), $1, $2);
```

(Add a `digest_runs` table if you want this — it's not in `schema.sql` v1.)

## Expected output (illustrative)

> Hey Engineering,
>
> ReviewAI reviewed 12 PRs across 3 repos this week, posting 47 findings.
> Developers accepted 71% of suggestions — up 6 points from last week.
>
> The standout signal: src/payments.py received 8 findings (4 critical) —
> this file is now the highest-flag concentration in the codebase and is a
> good candidate for a refactor sprint. Top categories this week were bugs
> (12), test gaps (11), and security (9), which suggests the team is
> shipping faster than tests can keep up.
>
> Worth pairing on payments.py next sprint? The slowest PR (payments-svc#138)
> still has 5 unresolved findings after 4 days — might be worth checking in
> with the author. And the test-gap trend is recoverable — adding a coverage
> threshold to CI for security-boundary files would catch most of these
> automatically.
>
> — ReviewAI · Strive For Better Future
