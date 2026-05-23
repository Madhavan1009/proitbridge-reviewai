# PROJECT BRIEF — ProITBridge ReviewAI

> **Paste this entire file as the first message in a new Claude chat.**
> Self-contained. No prior conversation required. Builds the full project.

---

## PROJECT TITLE

**ProITBridge ReviewAI** — AI Code Review Bot for GitHub Pull Requests.

(Project #5 of the YouTube series "Top 5 AI Engineering Projects" by ProITBridge.)

---

## THE PITCH (one sentence)

A self-hosted bot that watches a GitHub repository, reads every pull request the
moment it opens, and posts **inline review comments** like a senior staff engineer
would — finding bugs, security issues, missing tests, and bad patterns. Then it
**re-reviews automatically when the developer pushes a fix**.

This is the open-source alternative to CodeRabbit ($24/dev/mo) and Cursor's
review feature, built entirely on free-tier infrastructure.

---

## CONTEXT FOR THE BUILDER

This is the **fifth and final project** in a YouTube series about AI engineering.
The previous 4 (Meeting AI, Content Repurposer, Cold Email Agent, Research Paper
RAG) are already shipped. This one is the finale.

Project #1 in the same series was **ProITBridge AI — Engineering Workflow
Automation**, a FastAPI + Zapier + Next.js stack:

- Repo: <https://github.com/Madhavan1009/proitbridge-ai-automation>
- Live: <https://proitbridge-ai-automation.vercel.app>

This new project must look like it's from the **same product family** — same
brand, same color palette, same logo, same alternating-section landing-page
aesthetic. It is **NOT** a fork. It's a new repo with the same brand DNA.

The landing page is the hero of the project. When a YouTube viewer first sees
the URL on screen, the landing page itself should communicate the product's value
in 3 seconds. Build it like a real production SaaS, not a demo dashboard.

---

## THE PROBLEM IT SOLVES

| Before | After |
| --- | --- |
| PRs sit unreviewed for 2–5 days | AI review posted within 10 seconds of PR open |
| Junior devs miss security/perf issues | Bot flags SQL injection, missing tests, perf bugs automatically |
| Senior eng burns 4–6 hrs/week on code review | Bot handles the first pass; humans review the AI's findings |
| Inconsistent review quality across the team | Same standards applied to every PR, every time |
| "Looks good to me" reviews that miss bugs | Every finding has line number + severity + suggested fix |
| Manual changelog writing on every release | Auto-generated from PR titles + AI summaries |

---

## TWO AUTOMATION MODES

### Mode 1 — Event-driven (real-time PR review)

```
Developer opens a PR
  → GitHub fires pull_request.opened webhook
  → n8n receives, verifies HMAC signature
  → Loop over changed files (filter generated/vendor)
  → For each file: Claude reviews → returns JSON findings
  → For each finding: POST inline review comment to GitHub
  → POST summary comment with verdict + finding table
  → Store findings in Postgres (per-PR state)

Developer pushes a fix to same PR
  → GitHub fires pull_request.synchronize event
  → n8n re-reviews only changed lines
  → For each previous finding: still an issue? Mark resolved if fixed.
  → POST "✅ Resolved in <sha>" reply to the resolved comments
  → Update summary comment

PR merged
  → GitHub fires pull_request.closed (merged=true)
  → n8n generates changelog entry
  → POST to Slack #releases
  → Mark all findings as merged in Postgres
```

### Mode 2 — Scheduled (weekly review-quality digest)

```
GitHub Actions cron (Monday 09:00 IST)
  → n8n queries Postgres for last 7 days of reviews
  → Computes: PRs reviewed, findings per severity, accept rate,
              top categories, slowest-to-merge PRs
  → Claude writes a team review-quality digest
  → Sent via email to engineering manager
```

---

## TECH STACK

| Layer | Tool | Free Tier? | Why this choice |
| --- | --- | --- | --- |
| Orchestration | **n8n self-hosted (Docker)** | ✅ Railway | Code nodes, loops, sub-workflows, native LangChain |
| Reviewer LLM | **Claude 3.5 Sonnet (Anthropic API)** | $5 free credits | Best code reasoning; structured JSON output |
| Frontend | **Next.js 14 + Tailwind + shadcn/ui** | ✅ Vercel | Same stack as previous ProITBridge project |
| Database | **Postgres (Railway)** | ✅ Railway | Persistent finding state, accept-rate analytics |
| Dashboard charts | **Recharts + Framer Motion** | ✅ | Same as ProITBridge AI |
| Workflow viz | **React Flow** | ✅ | For the /how-it-works page |
| Source | **GitHub** (Madhavan1009 org) | ✅ | |
| Scheduler | **GitHub Actions cron** | ✅ | Same pattern as ProITBridge AI |
| Static analysis (optional) | Semgrep CLI in n8n Code node | ✅ | Run alongside Claude for security patterns |

**Crucially:** This stack has **no FastAPI middleman**. n8n is the orchestrator,
Next.js talks directly to Postgres via server actions. Simpler than ProITBridge
AI's architecture.

---

## ARCHITECTURE DIAGRAM (paste into your README)

```
                      GitHub Pull Request opens
                                 │
                                 ▼
                  ┌──────────────────────────────────┐
                  │  n8n on Railway (Docker)         │
                  │  Webhook: /webhook/pr-review     │
                  │                                  │
                  │  Workflow steps:                 │
                  │  1. Verify HMAC signature        │
                  │  2. Fetch PR files via Octokit   │
                  │  3. Filter generated files       │
                  │  4. Loop: for each source file:  │
                  │     - Get full file content      │
                  │     - Send (file + diff) to LLM  │
                  │     - Parse JSON findings        │
                  │     - Optional: Semgrep scan     │
                  │  5. Dedupe + rank findings       │
                  │  6. POST inline review comments  │
                  │  7. POST summary comment         │
                  │  8. INSERT findings to Postgres  │
                  └────────┬──────────────┬──────────┘
                           │              │
                           ▼              ▼
              ┌────────────────┐   ┌──────────────────┐
              │ Anthropic API  │   │ Postgres (Railway)│
              │ Claude 3.5     │   │ - prs            │
              │ Sonnet         │   │ - findings       │
              └────────────────┘   │ - resolutions    │
                                   └──────────┬───────┘
                                              │
                                              ▼
                            ┌────────────────────────────────┐
                            │ Next.js dashboard (Vercel)     │
                            │                                │
                            │ Public:                        │
                            │  / (landing page)              │
                            │  /how-it-works                 │
                            │  /pricing (mock for video)     │
                            │  /docs                         │
                            │                                │
                            │ Authenticated:                 │
                            │  /dashboard (live PR queue)    │
                            │  /findings (table)             │
                            │  /analytics (charts)           │
                            │  /settings (config per repo)   │
                            └────────────────────────────────┘
```

---

## REPOSITORY STRUCTURE

```
proitbridge-reviewai/
├── README.md                         Deploy buttons + 60s pitch + GIF
├── DEPLOYMENT.md                     Step-by-step Railway + Vercel + GitHub
├── PROJECT_BRIEF.md                  (this file)
├── .gitignore
├── .github/
│   └── workflows/
│       └── weekly-digest.yml         Mode 2 cron (Monday 09:00 IST)
├── n8n/
│   ├── pr-review.json                Main workflow (exported)
│   ├── pr-resync.json                Re-review on push
│   ├── pr-merged.json                Changelog generator
│   └── weekly-digest.json            Mode 2 workflow
├── frontend/                         Next.js 14 + Tailwind
│   ├── app/
│   │   ├── layout.tsx                Root layout, brand metadata
│   │   ├── page.tsx                  Landing page (SaaS-style hero)
│   │   ├── how-it-works/page.tsx     Workflow visualizer + explainer
│   │   ├── pricing/page.tsx          3-tier pricing (mock for video)
│   │   ├── docs/page.tsx             Setup guide for forkers
│   │   ├── dashboard/
│   │   │   ├── page.tsx              Live PR queue
│   │   │   ├── findings/page.tsx     All findings table
│   │   │   ├── analytics/page.tsx    Charts: accept rate, severity mix
│   │   │   └── settings/page.tsx     Configure repos, thresholds
│   │   └── api/                      Next.js API routes (read Postgres)
│   ├── components/
│   │   ├── shell/                    Sidebar, Topbar, AppShell
│   │   ├── ui/                       Section, StatCard, RiskBadge, etc.
│   │   ├── landing/                  Hero, FeaturesGrid, DemoEmbed, etc.
│   │   ├── dashboard/                ReviewQueue, FindingCard, etc.
│   │   └── workflow/                 React Flow visualizer
│   ├── lib/
│   │   ├── db.ts                     Postgres client (drizzle or pg)
│   │   ├── types.ts                  Shared TypeScript types
│   │   └── utils.ts
│   ├── public/
│   │   └── proitbridge-logo.png      ← Copy from previous project
│   ├── package.json
│   ├── tailwind.config.ts            Same palette as ProITBridge AI
│   ├── tsconfig.json
│   ├── next.config.js
│   └── vercel.json
├── prompts/
│   ├── reviewer.txt                  Claude system prompt for code review
│   └── digest.txt                    Claude prompt for weekly digest
├── postgres/
│   └── schema.sql                    DDL for prs, findings, resolutions
└── demo-bad-prs/                     Pre-scripted bad PRs for video recording
    ├── 01-sql-injection.md
    ├── 02-missing-tests.md
    ├── 03-perf-issue.md
    ├── 04-hardcoded-secret.md
    └── 05-race-condition.md
```

---

## BRAND IDENTITY (carry over from ProITBridge AI)

### Logo
`F:\ProITBridge\AI_Automation_\frontend\public\proitbridge-logo.png`
(copy to new project's `frontend/public/`)

### Brand name
**ProITBridge** — *Strive For Better Future.*

Product line within that brand: **ReviewAI** (for this project).
Display: `ProITBridge ReviewAI`

### Color palette (Tailwind tokens)

```typescript
colors: {
  navy: {
    950: "#071633",   // darkest background
    900: "#0b1d3f",
    800: "#102a55",
    700: "#19366b",
  },
  brand: {
    50:  "#d9f8fd",
    100: "#bff0fb",
    200: "#8de4f7",
    300: "#5fd6f3",
    400: "#22d3ee",   // cyan accent
    500: "#046bd2",   // primary blue
    600: "#045cb4",
    700: "#034a91",
    800: "#063b73",
    900: "#0b1d3f",
  },
  cyan: { 100: "#d9f8fd", 400: "#22d3ee", 500: "#22d3ee" },
  risk: {
    critical: "#dc2626",  // bright red
    high:     "#ef4444",
    medium:   "#f59e0b",
    low:      "#22c55e",
    nit:      "#94a3b8",
  },
}
```

### Backgrounds & gradients

```typescript
backgroundImage: {
  "brand-gradient":
    "linear-gradient(135deg, #045cb4 0%, #046bd2 50%, #22d3ee 100%)",
  "brand-radial":
    "radial-gradient(circle at 20% 0%, rgba(34, 211, 238, 0.18), transparent 45%), radial-gradient(circle at 80% 100%, rgba(4, 107, 210, 0.22), transparent 45%)",
}
```

### Visual rhythm
Alternating dark/light section bands on long pages (landing, how-it-works,
docs). Dashboard is all-dark. **Reuse the `Section` component from ProITBridge
AI** — copy `frontend/components/ui/Section.tsx` from
<https://github.com/Madhavan1009/proitbridge-ai-automation>.

### Default theme
Dark mode only. No light mode toggle for v1.

---

## LANDING PAGE SPEC (this is the hero of the project — make it real)

### Section 1 — HERO (dark navy, ProITBridge brand logo top-left)
- Eyebrow chip: `🛡 PROJECT #5 · YOUTUBE SERIES FINALE`
- H1: "Code reviews that **never sleep.**"
- Subtitle: "ProITBridge ReviewAI watches your pull requests 24/7. Senior-engineer-quality feedback in 10 seconds, inline on the diff, with one-click fixes. Self-hosted, open source, $0 infrastructure."
- Two CTAs: `Try the Live Demo →` and `View on GitHub`
- Side visual: animated mock of a GitHub PR with comments appearing one by one
- Stats strip: "10s avg review · 71% suggestions accepted · 4 critical bugs caught this week"

### Section 2 — DEMO (light, embedded video player)
- Embed a 60-second screen recording (your YouTube short demo)
- Below: "What you just saw in 60 seconds: PR opened → AI reviews → developer accepts suggestion → AI re-reviews and marks resolved. All hands-off."

### Section 3 — HOW IT WORKS (dark, React Flow workflow)
- Interactive React Flow diagram (steal from ProITBridge AI `WorkflowFlow.tsx`)
- Adapt nodes: GitHub PR → n8n → Claude → Static Analysis → Inline Comments
- 4 step cards below explaining each stage

### Section 4 — WHAT IT CATCHES (light, feature grid)
4-column grid with icon + title + example:
- 🔒 **Security** — SQL injection, hardcoded secrets, XSS
- 🐛 **Bugs** — Race conditions, null derefs, off-by-one
- ⚡ **Performance** — N+1 queries, O(n²) loops, unbounded loops
- 🧪 **Missing tests** — Detects untested code paths in changed files

### Section 5 — BEFORE / AFTER (dark, two-column table)
The "before vs after" table from this brief, but visualized as a side-by-side
comparison with red ❌ vs green ✅ icons.

### Section 6 — PRICING (light, 3 tiers — MOCK for video)
- **Self-hosted** (Free) — Fork the repo, deploy it yourself. Unlimited PRs.
- **Cloud Starter** ($19/mo) — 1 org, unlimited PRs, hosted by us.
- **Cloud Team** ($49/mo) — Multi-org, priority Claude, custom rules.
- (These are mock for the YouTube demo. Note in small print: "Pricing is illustrative for the demo. The product is open-source — fork it and host it free.")

### Section 7 — TECH STACK BAND (dark)
Logos and chip badges: n8n · Claude · Next.js · Postgres · Railway · Vercel · GitHub

### Section 8 — FOOTER CTA (dark gradient)
- Big logo
- "Strive For Better Future"
- Buttons: `Deploy Your Own` · `Read the Docs` · `Star on GitHub`
- Footer links + © 2026 ProITBridge

---

## DASHBOARD PAGES SPEC

### `/dashboard` — Live PR Queue
- Header: "Active reviews" + filter chips (status: all / pending / approved / changes-requested)
- Real-time list of PRs being / recently reviewed
- Each row: PR title, repo, author, findings count by severity, status badge, time
- Click row → expand to show findings inline

### `/dashboard/findings`
- Full table of all findings across all PRs
- Filters: severity, category, repo, accepted/rejected, time range
- Each row: file:line, severity badge, category chip, message, accepted?

### `/dashboard/analytics`
- 4 stat cards: PRs reviewed (this week), findings posted, suggestions accepted, % accept rate
- Charts:
  - 7-day trend: findings per day stacked by severity
  - Donut: category breakdown
  - Bar: top 10 files with most findings
  - Line: accept rate over time (the killer metric — proves AI is useful)

### `/dashboard/settings`
- Per-repo config: severity threshold to post, max findings per PR
- Anthropic API key (encrypted)
- Webhook URL display + regenerate secret
- Slack / email notification preferences

---

## n8n WORKFLOW SPEC

### Workflow 1: `pr-review.json`

```
[Webhook Trigger]   POST /webhook/pr-review
                    HMAC verify in next node
                          ↓
[Code: verify HMAC]  X-Hub-Signature-256 vs GITHUB_WEBHOOK_SECRET
                          ↓
[IF: action == "opened" OR action == "ready_for_review"]
                          ↓
[HTTP: GitHub API]   GET /repos/{owner}/{repo}/pulls/{pr}/files
                          ↓
[Code: filter files] Skip: package-lock.json, *.min.js, dist/*, .lock, generated
                     Skip files with > 500 lines changed
                          ↓
[Split In Batches: 1 file at a time]
                          ↓
[HTTP: GitHub API]   GET /repos/{owner}/{repo}/contents/{path}
                     Get full file content for context
                          ↓
[HTTP: Anthropic]    POST messages
                     model: claude-3-5-sonnet-20241022
                     system: <reviewer prompt — see prompts/reviewer.txt>
                     user: { file_path, full_content, diff }
                     response_format: text (parse JSON manually)
                          ↓
[Code: parse JSON]   Robust parser — find first [...] block in response
                     Validate each finding has line, severity, message
                          ↓
[Code: filter by severity threshold]
                     Default: post only critical + high + medium
                          ↓
[Split: each finding]
                          ↓
[HTTP: GitHub API]   POST /repos/{owner}/{repo}/pulls/{pr}/comments
                     body: <formatted comment with suggestion block>
                     commit_id: <head_sha>
                     path: <file>
                     line: <line in new file>
                     side: "RIGHT"
                          ↓
[Postgres: INSERT INTO findings]
                          ↓
[After all files done]
                          ↓
[HTTP: GitHub API]   POST /repos/{owner}/{repo}/issues/{pr}/comments
                     Summary comment with verdict + finding table
                          ↓
[Postgres: INSERT INTO prs]   status, total_findings, head_sha, reviewed_at
```

### Workflow 2: `pr-resync.json`

Triggered on `pull_request.synchronize`. Same structure but:
- Compare new diff to existing findings in Postgres
- For each finding: was the line touched in new commits?
  - YES + AI confirms now-fine → mark resolved, post "✅ Resolved in <sha>"
  - YES + AI still flags → leave original (don't double-post)
  - NO → leave as-is
- Update summary comment with new totals

### Workflow 3: `pr-merged.json`

Triggered on `pull_request.closed` where `merged == true`.
- Generate changelog entry from PR title + AI summary
- POST to Slack #releases (or email if no Slack)
- Mark all findings for this PR as `merged=true` in Postgres

### Workflow 4: `weekly-digest.json`

Triggered by GitHub Actions cron weekly.
- SELECT findings from Postgres WHERE created_at > NOW() - 7 days
- Aggregate: count by severity, category, repo, accept rate
- Claude writes a 200-word "review quality digest"
- Email to configured recipient

---

## POSTGRES SCHEMA

```sql
CREATE TABLE prs (
  id              SERIAL PRIMARY KEY,
  github_pr_id    BIGINT UNIQUE NOT NULL,
  repo            TEXT NOT NULL,
  pr_number       INTEGER NOT NULL,
  title           TEXT NOT NULL,
  author          TEXT NOT NULL,
  head_sha        TEXT NOT NULL,
  status          TEXT DEFAULT 'open',   -- open, merged, closed
  total_findings  INTEGER DEFAULT 0,
  reviewed_at     TIMESTAMP DEFAULT NOW(),
  merged_at       TIMESTAMP,
  UNIQUE(repo, pr_number)
);

CREATE TABLE findings (
  id              SERIAL PRIMARY KEY,
  pr_id           INTEGER REFERENCES prs(id) ON DELETE CASCADE,
  file_path       TEXT NOT NULL,
  line_number     INTEGER NOT NULL,
  severity        TEXT NOT NULL,         -- critical, high, medium, nit
  category        TEXT NOT NULL,         -- bug, security, performance, test, style
  message         TEXT NOT NULL,
  suggestion      TEXT,
  rationale       TEXT,
  github_comment_id BIGINT,              -- the inline comment ID on GitHub
  resolved        BOOLEAN DEFAULT FALSE,
  accepted        BOOLEAN,               -- did the dev commit the suggestion?
  created_at      TIMESTAMP DEFAULT NOW(),
  resolved_at     TIMESTAMP
);

CREATE INDEX idx_findings_pr ON findings(pr_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_created ON findings(created_at);

-- Analytics view
CREATE VIEW v_accept_rate AS
SELECT
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) FILTER (WHERE accepted = TRUE) AS accepted,
  COUNT(*) FILTER (WHERE accepted = FALSE) AS rejected,
  COUNT(*) AS total
FROM findings
WHERE accepted IS NOT NULL
GROUP BY day
ORDER BY day DESC;
```

---

## THE CLAUDE SYSTEM PROMPT (save to `prompts/reviewer.txt`)

```
You are a senior staff engineer doing a careful code review on a GitHub pull
request. Your goal is to find real, actionable issues — not nitpicks.

You will receive:
1. The full file content (for context)
2. The diff showing changed lines

Review ONLY the changed lines. Use the full file for context.

Output a JSON array. Each finding must have this shape:
{
  "line": <integer — line number in the NEW file>,
  "severity": "critical" | "high" | "medium" | "nit",
  "category": "bug" | "security" | "performance" | "test" | "style" | "docs",
  "message": "<one sentence describing the issue>",
  "suggestion": "<corrected code as a single string, OR null>",
  "rationale": "<one or two sentences explaining why this matters>"
}

Severity guidance:
- critical: security vulnerabilities, data loss bugs, production crashes
- high: bugs likely to cause incorrect behavior in common paths, missing tests
       for critical functions
- medium: performance issues, code smells that will cause future bugs,
         missing input validation
- nit: style preferences, naming, comments — only flag if VERY obvious

Strict rules:
- Maximum 5 findings per file. Pick the most important.
- For "suggestion", output ONLY the corrected lines, no surrounding context.
- If the diff is fine, return an empty array [].
- Never flag formatting if a formatter is used (Black, Prettier, gofmt).
- Never flag missing comments unless the code is genuinely confusing.
- Never repeat a finding for the same issue on multiple lines.

Output JSON only. No prose before or after. No markdown code fences.
```

---

## DEPLOYMENT PLAN

### Phase 1 — Local development (Day 1)

- Clone the repo template (this brief generates it)
- Spin up local Postgres via Docker
- Spin up local n8n via `npx n8n` or Docker
- Set up `frontend/.env.local` with `DATABASE_URL` and `ANTHROPIC_API_KEY`
- Run `next dev` — landing page should render

### Phase 2 — Railway deploy (Day 2)

Railway is preferred because the user already has 1 project deployed there.

1. New Railway project → "Empty Project"
2. Add service: **PostgreSQL** (Railway template) → note `DATABASE_URL`
3. Add service: **n8n** (use Docker image `n8nio/n8n:latest`)
   - Mount volume at `/home/node/.n8n` for workflow persistence
   - Env vars:
     - `N8N_HOST=<your-railway-domain>.up.railway.app`
     - `N8N_PROTOCOL=https`
     - `WEBHOOK_URL=https://<your-railway-domain>.up.railway.app/`
     - `DB_TYPE=postgresdb`
     - `DB_POSTGRESDB_HOST=<from-railway-postgres>`
     - `DB_POSTGRESDB_PORT=5432`
     - `DB_POSTGRESDB_DATABASE=railway`
     - `DB_POSTGRESDB_USER=postgres`
     - `DB_POSTGRESDB_PASSWORD=<from-railway>`
     - `N8N_ENCRYPTION_KEY=<random-32-char>`
     - `N8N_BASIC_AUTH_ACTIVE=true`
     - `N8N_BASIC_AUTH_USER=admin`
     - `N8N_BASIC_AUTH_PASSWORD=<random-strong-pass>`
     - `ANTHROPIC_API_KEY=<your-claude-key>`
     - `GITHUB_WEBHOOK_SECRET=<random-32-char>`
4. Open Railway domain → n8n UI → login with admin credentials
5. Import `n8n/pr-review.json`, `n8n/pr-resync.json`, `n8n/pr-merged.json`
6. Activate each workflow
7. Copy the webhook URL: `https://<n8n>.up.railway.app/webhook/pr-review`

### Phase 3 — GitHub webhook (Day 2)

1. Pick a demo repo (or create one)
2. Settings → Webhooks → Add webhook
   - Payload URL: `https://<n8n>.up.railway.app/webhook/pr-review`
   - Content type: `application/json`
   - Secret: same as `GITHUB_WEBHOOK_SECRET`
   - Events: select `Pull requests`
3. Save → confirm green ✓ ping delivery

### Phase 4 — Apply Postgres schema (Day 2)

```bash
# Railway provides a connection string
psql "$DATABASE_URL" < postgres/schema.sql
```

### Phase 5 — Vercel deploy (Day 3)

1. Push frontend to GitHub
2. Vercel → Import Project → Root: `frontend/`
3. Env vars:
   - `DATABASE_URL` (Railway Postgres external connection URL)
   - `NEXT_PUBLIC_N8N_WEBHOOK_URL` (the n8n webhook for the manual test button)
4. Deploy → confirm landing page loads

### Phase 6 — GitHub Actions cron (Day 4, optional)

`.github/workflows/weekly-digest.yml` fires Monday 09:00 IST →
hits n8n workflow `weekly-digest.json` via webhook.

---

## BUILD SEQUENCE — 7-DAY PLAN

| Day | Goal | Recordable? |
| --- | --- | --- |
| **1** | Repo scaffold (this brief). Local n8n + Postgres. First webhook receives + logs. | No |
| **2** | Railway deploy. n8n imports first workflow. Receives ping from GitHub. | No |
| **3** | Add Claude integration. First AI review posts to a real PR. | **Partial — start b-roll** |
| **4** | Inline comments + suggestion blocks. Re-review on synchronize. | **YES — record demo** |
| **5** | Next.js landing page + /dashboard list view + connect to Postgres. | **YES — record dashboard** |
| **6** | Analytics page (charts), polish landing page hero, fix demo bad-PR fixtures. | **YES — final recording** |
| **7** | README + DEPLOYMENT.md + video editing. | Publishing day. |

---

## YOUTUBE DEMO SCRIPT (60 seconds — record on day 6)

```
[0:00–0:05]  Title overlay: "I Built an AI Code Reviewer in a Week"
             Background: scrolling GitHub PR with inline comments

[0:05–0:12]  Show terminal:
             $ git checkout -b demo-bad-pr
             $ # show the file with SQL injection
             $ git commit -am "Quick fix for user lookup"
             $ gh pr create --fill

[0:12–0:20]  Cut to GitHub PR page — empty, freshly opened
             Watch for 5 seconds → AI bot comment appears

[0:20–0:30]  Zoom in on the comment:
             "🔒 Critical: SQL injection — line 47"
             Show the suggestion block

[0:30–0:38]  Click "Commit suggestion" button
             PR now shows: ✅ Original comment marked resolved
             "10 seconds later, the bot's been re-reviewed."

[0:38–0:50]  Cut to ProITBridge ReviewAI dashboard
             Show: "12 PRs reviewed · 47 findings · 71% accepted"
             Brief pan over the analytics charts

[0:50–0:60]  End card with logo:
             "ProITBridge ReviewAI"
             "Open source · Free tier · Link in description"
             "Strive For Better Future"
```

---

## DEMO REPO FIXTURES (create these BEFORE recording)

Create a repo `proitbridge-reviewai-demo` with these intentionally-bad files:

### `src/auth.py` (SQL injection target)
```python
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id={user_id}"
    return db.execute(query).fetchone()
```
**Bot should catch:** SQL injection via f-string.

### `src/payments.py` (missing validation + tests)
```python
def transfer(from_id, to_id, amount):
    db.execute(f"UPDATE accounts SET balance = balance - {amount} WHERE id = {from_id}")
    db.execute(f"UPDATE accounts SET balance = balance + {amount} WHERE id = {to_id}")
```
**Bot should catch:** No transaction wrapper, no validation, SQL injection, no tests file.

### `src/api.py` (hardcoded secret)
```python
STRIPE_KEY = "<YOUR_STRIPE_LIVE_KEY>"  # redacted placeholder

def charge_card(card, amount):
    stripe.Charge.create(api_key=STRIPE_KEY, amount=amount, source=card)
```
**Bot should catch:** Hardcoded API key (use env var).

### `src/utils.py` (O(n²) performance)
```python
def find_duplicates(items):
    duplicates = []
    for i in range(len(items)):
        for j in range(len(items)):
            if i != j and items[i] == items[j]:
                duplicates.append(items[i])
    return duplicates
```
**Bot should catch:** Quadratic complexity, suggest Counter or set.

### `src/cache.py` (race condition)
```python
def increment_counter(key):
    value = cache.get(key) or 0
    cache.set(key, value + 1)
```
**Bot should catch:** TOCTOU race condition, use atomic INCR.

Each fixture is a separate PR you open during recording. If the bot is working,
it catches all of them.

---

## REUSABLE COMPONENTS FROM ProITBridge AI

Copy these files directly from the previous repo
(<https://github.com/Madhavan1009/proitbridge-ai-automation>):

| File | Purpose | Modifications needed |
| --- | --- | --- |
| `frontend/components/ui/Section.tsx` | Alternating dark/light section wrapper | None — use as-is |
| `frontend/components/ui/StatCard.tsx` | Stat card with tone="dark"/"light" | None |
| `frontend/components/ui/RiskBadge.tsx` | Severity chips | Add "critical" tier |
| `frontend/components/ui/EmptyState.tsx` | Empty state component | None |
| `frontend/components/ui/Skeleton.tsx` | Loading skeleton | None |
| `frontend/components/ui/SectionHeader.tsx` | Section header | None |
| `frontend/components/shell/AppShell.tsx` | Layout shell | Update nav items |
| `frontend/components/shell/Sidebar.tsx` | Sidebar with logo | Replace nav items |
| `frontend/components/shell/Topbar.tsx` | Top bar | Update titles map |
| `frontend/app/globals.css` | Global styles + Tailwind layers | None |
| `frontend/tailwind.config.ts` | Color palette + theme | Add `critical` risk color |
| `frontend/lib/utils.ts` | `cn`, `timeAgo`, `formatDate` | None |
| `frontend/public/proitbridge-logo.png` | Brand logo | None |

That's about 60% of the UI work done from day 1.

---

## ENV VARS REFERENCE

### Frontend (`frontend/.env.local`)
```
DATABASE_URL=postgres://...railway...
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n.up.railway.app/webhook/pr-review
```

### n8n (Railway service env vars)
```
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_WEBHOOK_SECRET=<32-char-random>
DATABASE_URL=postgres://...
N8N_ENCRYPTION_KEY=<32-char-random>
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<strong-pass>
WEBHOOK_URL=https://your-n8n.up.railway.app/
N8N_HOST=your-n8n.up.railway.app
N8N_PROTOCOL=https
```

### GitHub Actions secrets
```
N8N_WEBHOOK_URL=https://your-n8n.up.railway.app/webhook/weekly-digest
N8N_WEBHOOK_SECRET=<same-as-GITHUB_WEBHOOK_SECRET>
```

---

## MVP DEFINITION — WHAT'S IN vs OUT for v1

### ✅ IN
- Single GitHub repo watched (the demo repo)
- Claude reviews changed lines, posts inline comments
- Suggestion blocks (one-click commit)
- Re-review on synchronize event
- Resolved comment detection
- Summary PR comment with finding table
- Dashboard: landing + /dashboard list + /findings table + basic /analytics
- Postgres state for accept-rate tracking
- Deployable to Railway + Vercel
- HMAC signature verification

### ❌ OUT (note as "Future enhancements" in README)
- Multi-repo / multi-tenant config UI
- Postgres-based per-repo rules (just hardcoded prompts)
- Semgrep integration (mention but don't ship)
- Multi-LLM ensemble (Claude only for v1)
- Auto-fix PR creation (bot opens its own fix PR)
- Custom `.aireview.yml` config file per repo
- Pre-commit CLI mode
- Slack OAuth integration (use webhook URL only)
- Billing / Stripe integration
- Auth (admin password protects /dashboard for v1)

---

## FUTURE ENHANCEMENTS (mention in README)

- **Auto-fix PRs** — bot opens its own PR against the developer's branch with all
  suggestions pre-committed
- **Repo insights** — "payments.py has 40% more findings than other files"
- **Custom rules** — `.aireview.yml` per repo: "always flag direct DB access"
- **Multi-LLM ensemble** — Claude + GPT-4 + Llama disagree → escalate
- **Pre-commit local mode** — `aireview check` CLI for local pre-push review
- **Linear/Jira sync** — auto-link findings to tickets
- **VS Code extension** — see findings inline in editor
- **Multi-org SaaS** — full multi-tenant with auth, billing, tier limits

---

## KEY DECISIONS (locked in, do not re-debate)

1. **n8n over Zapier** — needed for loops, code nodes, multi-step orchestration
2. **Claude over GPT-4 / Groq** — best code reasoning; the 10s review latency is fine
3. **Railway over Render for n8n** — user has existing Railway experience; better Docker support
4. **Vercel for frontend** — same as ProITBridge AI; one-click deploy
5. **Postgres over JSON files** — accept-rate analytics need real queries; Railway gives free Postgres
6. **Next.js App Router** — same as ProITBridge AI; familiar
7. **No FastAPI middleman** — Next.js server actions hit Postgres directly
8. **Dark mode only** — same as ProITBridge AI; less work
9. **ProITBridge ReviewAI** as the product name — under the ProITBridge brand
10. **Same logo + palette as ProITBridge AI** — visual continuity for the YouTube series

---

## REFERENCES

- **Previous project repo (ProITBridge AI)**:
  <https://github.com/Madhavan1009/proitbridge-ai-automation>
- **Previous project live**:
  <https://proitbridge-ai-automation.vercel.app>
- **Brand logo on disk**:
  `F:\ProITBridge\AI_Automation_\frontend\public\proitbridge-logo.png`
- **n8n docs**: <https://docs.n8n.io>
- **Claude API**: <https://docs.anthropic.com/en/api/getting-started>
- **GitHub PR comments API**:
  <https://docs.github.com/en/rest/pulls/comments>
- **Railway docs**: <https://docs.railway.app>

---

## TASK FOR YOU (THE BUILDER)

When the user starts a new chat and pastes this brief:

1. **Confirm understanding** of the project in one paragraph
2. **Initialize the repo** at `F:\ProITBridge\AI_Code_Automation\` with:
   - `README.md` with deploy badges + 60s pitch
   - `frontend/` Next.js project scaffolded with the same brand DNA
   - `n8n/` folder with placeholder JSON files (workflow exports come after building in n8n)
   - `postgres/schema.sql`
   - `prompts/reviewer.txt`
   - `demo-bad-prs/` with the 5 fixture files
   - `DEPLOYMENT.md` with Railway + Vercel walkthrough
3. **Build the landing page first** — this is the project's hero
4. **Copy the reusable components** from ProITBridge AI by reading from the disk path above (NOT by re-downloading from GitHub — the files exist locally)
5. **Set up the Postgres schema** in `postgres/schema.sql`
6. **Write the Claude system prompt** in `prompts/reviewer.txt`
7. **Scaffold the dashboard pages** (`/dashboard`, `/findings`, `/analytics`) with empty states + mock data so they look good in the YouTube demo even before the backend is wired
8. **Generate the demo-bad-prs fixtures** with realistic code samples
9. **Provide deployment guide for Railway** (n8n + Postgres) and Vercel (frontend)
10. **Do NOT build the n8n workflow JSONs upfront** — those are built interactively in the n8n UI by the user. Provide a markdown specification of each workflow's nodes instead, so they can replicate it.

**Critical instruction:** The landing page MUST look like a real production SaaS, not a developer demo. Use the same alternating-section pattern, glass cards, gradient buttons, and brand logo as ProITBridge AI. The first 3 seconds on the page should communicate the product's value.

---

## END OF BRIEF — START BUILDING
