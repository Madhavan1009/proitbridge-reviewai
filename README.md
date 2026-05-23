# ProITBridge ReviewAI

> **Code reviews that never sleep.**
> AI code review bot for GitHub pull requests — built on n8n, Claude 3.5 Sonnet,
> Next.js, and Postgres. Open source, free tier, self-hosted.

[![Deploy n8n on Railway](https://railway.app/button.svg)](https://railway.app)
[![Deploy frontend to Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](#license)

---

## 60-second pitch

You open a pull request. Ten seconds later, a bot has posted **inline review
comments** on every problem in your diff — SQL injections, missing tests,
race conditions, hardcoded secrets. Each one comes with a severity, a
rationale, and a one-click suggestion you can commit straight from the
GitHub UI. When you push the fix, the bot re-reviews and marks the comment
as resolved.

This is the open-source alternative to CodeRabbit ($24/dev/month) and
Cursor's review feature — running on infrastructure that costs **$0/month**
on the Railway and Vercel free tiers.

Built by [ProITBridge](https://proitbridge-ai-automation.vercel.app).

---

## Architecture

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
                            │  /                landing      │
                            │  /how-it-works    pipeline     │
                            │  /pricing         3 tiers      │
                            │  /docs            setup guide  │
                            │                                │
                            │ Authenticated:                 │
                            │  /dashboard       live queue   │
                            │  /findings        full table   │
                            │  /analytics       charts       │
                            │  /settings        config       │
                            └────────────────────────────────┘
```

No FastAPI middleman. n8n is the orchestrator. Next.js talks to Postgres
directly via server components.

---

## Stack

| Layer | Tool | Free tier? |
| --- | --- | --- |
| Orchestration | n8n self-hosted (Docker) on Railway | ✅ |
| Reviewer LLM | Claude 3.5 Sonnet (Anthropic API) | $5 free credits |
| Frontend | Next.js 14 · Tailwind · shadcn/ui patterns | ✅ Vercel |
| Database | Postgres on Railway | ✅ |
| Charts | Recharts + Framer Motion | ✅ |
| Workflow viz | React Flow | ✅ |
| Scheduler | GitHub Actions cron | ✅ |
| Optional static analysis | Semgrep CLI inside an n8n Code node | ✅ |

**Total monthly cost on free tier:** $0 + ~$0.01 per PR reviewed in Claude
inference.

---

## What it catches

| Category | Examples |
| --- | --- |
| 🔒 **Security** | SQL injection, XSS, hardcoded secrets, weak hashing, missing auth checks |
| 🐛 **Bugs** | Race conditions, null derefs, off-by-one, broken transactions, missing error paths |
| ⚡ **Performance** | N+1 queries, O(n²) loops, unbounded recursion, missing indexes |
| 🧪 **Missing tests** | Untested code paths in security or money-handling functions |

Findings are ranked by severity (critical → high → medium → low → nit) and
only critical/high/medium are posted by default. Configure per-repo
thresholds in the dashboard.

---

## Repository layout

```
proitbridge-reviewai/
├── README.md                         this file
├── DEPLOYMENT.md                     step-by-step Railway + Vercel + GitHub
├── PROJECT_BRIEF.md                  the original spec
├── .github/workflows/
│   └── weekly-digest.yml             Monday 09:00 IST cron
├── n8n/                              workflow specifications (markdown)
│   ├── pr-review.md
│   ├── pr-resync.md
│   ├── pr-merged.md
│   └── weekly-digest.md
├── frontend/                         Next.js 14 + Tailwind
│   ├── app/                          landing, how-it-works, pricing, docs, dashboard
│   ├── components/                   ui/, shell/, landing/, dashboard/, workflow/
│   ├── lib/                          db, types, utils, mockData
│   └── public/proitbridge-logo.png
├── prompts/
│   ├── reviewer.txt                  Claude system prompt
│   └── digest.txt                    weekly digest prompt
├── postgres/
│   └── schema.sql                    prs · findings · resolutions · views
└── demo-bad-prs/                     5 scripted bad PRs for the demo video
    ├── 01-sql-injection.md
    ├── 02-missing-tests.md
    ├── 03-perf-issue.md
    ├── 04-hardcoded-secret.md
    └── 05-race-condition.md
```

---

## Quick start (local dev)

You need: Docker, Node 20+, an Anthropic API key.

```bash
# 1. Clone
git clone https://github.com/Madhavan1009/proitbridge-reviewai
cd proitbridge-reviewai

# 2. Bring up Postgres + n8n locally
docker run -d --name pg \
  -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16
psql postgres://postgres:dev@localhost/postgres -c "CREATE DATABASE reviewai;"
psql postgres://postgres:dev@localhost/reviewai < postgres/schema.sql

docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=dev \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n:latest

# 3. Boot the frontend
cd frontend
cp .env.local.example .env.local
# edit DATABASE_URL=postgres://postgres:dev@localhost:5432/reviewai
npm install
npm run dev
```

Visit:
- `http://localhost:3000` — landing page
- `http://localhost:3000/dashboard` — dashboard (uses mock data until Postgres has rows)
- `http://localhost:5678` — n8n UI (admin/dev)

For production deploy, follow [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## How it works

**Mode 1 — Event-driven (real-time PR review)**

1. Developer opens a PR
2. GitHub fires `pull_request.opened` webhook
3. n8n receives, verifies HMAC signature
4. Loops over changed files (filters generated/vendor)
5. For each file: Claude reviews → returns JSON findings
6. For each finding: POSTs inline review comment to GitHub
7. POSTs summary comment with verdict + finding table
8. Stores findings in Postgres

**Mode 2 — Re-review on push**

1. Developer pushes a fix to the same PR
2. GitHub fires `pull_request.synchronize`
3. n8n compares new diff to existing findings in Postgres
4. For each finding still in the diff: re-asks Claude "still an issue?"
5. If resolved: posts "✅ Resolved in `<sha>`" reply, marks resolved
6. Updates summary comment

**Mode 3 — Merge changelog**

1. Developer merges the PR
2. GitHub fires `pull_request.closed` (merged=true)
3. n8n generates a one-line changelog entry via Claude
4. POSTs to Slack #releases (if configured)

**Mode 4 — Weekly digest**

1. GitHub Actions cron fires Monday 09:00 IST
2. n8n queries Postgres for last 7 days of reviews
3. Claude writes a 200-word team review-quality digest
4. Sent via email to the engineering manager

See [n8n/](./n8n) for the per-workflow specifications.

---

## Future enhancements

- **Auto-fix PRs** — bot opens its own PR against the developer's branch
  with all suggestions pre-committed
- **Repo insights** — "payments.py has 40% more findings than other files"
- **Custom rules** — `.aireview.yml` per repo: "always flag direct DB access"
- **Multi-LLM ensemble** — Claude + GPT-4 + Llama disagree → escalate
- **Pre-commit local mode** — `aireview check` CLI for local pre-push review
- **Linear/Jira sync** — auto-link findings to tickets
- **VS Code extension** — see findings inline in the editor

---

## License

MIT. Fork it, host it, modify it, sell it. Just don't take ProITBridge's
name off the dashboard footer — that's the only thing we ask.

---

## Credits

Built by **Madhavan** at [ProITBridge](https://proitbridge-ai-automation.vercel.app).

> **Strive For Better Future.**
