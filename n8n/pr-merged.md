# Workflow: pr-merged

**Trigger:** `pull_request.closed` where `merged === true`.
**Webhook path:** `/webhook/pr-merged`
**Goal:** Generate a changelog entry and notify the team.

## Node-by-node

### 1. Webhook (Trigger)

Same pattern as the other workflows, path `pr-merged`.

### 2. Code — HMAC verify

Same as pr-review.

### 3. IF — `action === "closed" AND merged === true`

End the workflow if the PR was closed without merging.

### 4. Set — Extract fields

- `pr_number`, `repo`, `title`, `author`, `merged_at`, `merged_by`

### 5. Postgres — Load findings summary for the PR

```sql
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE accepted = TRUE) AS accepted,
  ARRAY_AGG(DISTINCT category) AS categories
FROM findings
WHERE pr_id = (SELECT id FROM prs WHERE github_pr_id = $1);
```

### 6. HTTP — Claude: write a changelog entry

```
POST https://api.anthropic.com/v1/messages

System: You write release notes. Given a PR title and a finding summary,
write ONE sentence suitable for a #releases Slack channel. Format:
"<emoji> <repo>#<num>: <one-sentence summary> — by @<author>".
No prose before or after.

User: {{ JSON.stringify(prAndFindings) }}
```

### 7. HTTP — POST to Slack (if configured)

Check `repo_config.notify_slack` — if true, POST the changelog message to
`repo_config.slack_webhook_url`.

```
POST {{ slack_webhook_url }}

Body:
{
  "text": "{{ changelog_text }}"
}
```

### 8. Postgres — Mark PR merged

```sql
UPDATE prs
SET status = 'merged', merged_at = NOW()
WHERE github_pr_id = $1;
```

### 9. Postgres — Mark findings as part of a merged PR

```sql
UPDATE findings
SET accepted = COALESCE(accepted, TRUE)
WHERE pr_id = (SELECT id FROM prs WHERE github_pr_id = $1)
  AND resolved = TRUE
  AND accepted IS NULL;
```

Rationale: if a finding was resolved before merge, count it as accepted
(the developer either took the suggestion or made an equivalent fix).

## Optional: email instead of Slack

If `repo_config.notify_slack` is false, send the changelog as an email via
n8n's built-in Email node. Use `repo_config.slack_webhook_url` field
overloaded as the recipient address.

## Why this is the smallest workflow

The merge event itself doesn't need any AI reasoning beyond writing the
one-line changelog. It's primarily a database state transition plus a
notification.
