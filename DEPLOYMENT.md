# DEPLOYMENT — Railway + Vercel + GitHub

Full step-by-step deploy of ProITBridge ReviewAI. Total time: ~30 minutes.
Total cost: $0 + ~$0.01 per PR reviewed.

---

## Prerequisites

Create accounts (all free tier):

- [ ] [Railway](https://railway.app) — hosts n8n + Postgres
- [ ] [Vercel](https://vercel.com) — hosts the dashboard
- [ ] [Anthropic Console](https://console.anthropic.com) — Claude API key
- [ ] [GitHub](https://github.com) — source + webhook source

Tools on your machine:

```bash
node --version   # >= 20
npm --version    # >= 10
git --version    # any recent
openssl version  # for generating secrets
```

Generate two secrets you'll need:

```bash
openssl rand -hex 32   # → use for GITHUB_WEBHOOK_SECRET
openssl rand -hex 32   # → use for N8N_ENCRYPTION_KEY
```

Save them in a scratchpad — you'll paste them into Railway in step 2.

---

## Step 1 — Fork the repo

```bash
git clone https://github.com/Madhavan1009/proitbridge-reviewai
cd proitbridge-reviewai
```

Or fork via the GitHub UI and clone your fork.

---

## Step 2 — Railway: Postgres + n8n

### 2a. Create the project

1. Railway dashboard → **New Project** → **Empty Project**
2. Rename to `proitbridge-reviewai`.

### 2b. Add Postgres

1. Inside the project → **+ New** → **Database** → **PostgreSQL**
2. Wait ~30s for provisioning.
3. Click the Postgres service → **Variables** → copy `DATABASE_URL` (the
   "Postgres Connection URL" — starts with `postgres://`).

### 2c. Apply the schema

In a terminal where you can reach Railway's Postgres (it's public by default
on free tier):

```bash
psql "<paste DATABASE_URL here>" < postgres/schema.sql
```

You should see `CREATE TABLE` × 4, `CREATE INDEX` × N, `CREATE VIEW` × 4.

### 2d. Add n8n

1. Back in the project → **+ New** → **Empty Service**
2. Click the new service → **Settings**:
   - **Source** → **Docker Image** → `n8nio/n8n:latest`
   - **Port** → `5678`
3. **Variables** tab — add all of:

```
N8N_HOST=<will-fill-in-step-2e>
N8N_PROTOCOL=https
WEBHOOK_URL=https://<will-fill-in-step-2e>/
N8N_PORT=5678
N8N_ENCRYPTION_KEY=<paste your second openssl rand>
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<a strong password you'll remember>

# Persistence — n8n uses the same Postgres
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=<from Postgres service variables>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=railway
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=<from Postgres service variables>

# App-specific
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_WEBHOOK_SECRET=<paste your first openssl rand>
```

4. **Volumes** tab — mount a volume at `/home/node/.n8n` (so workflows
   persist across container restarts).

### 2e. Generate the public domain

1. n8n service → **Settings** → **Networking** → **Generate Domain**
2. You'll get something like `proitbridge-reviewai-n8n.up.railway.app`
3. Go back to **Variables** and fill in:
   - `N8N_HOST=proitbridge-reviewai-n8n.up.railway.app`
   - `WEBHOOK_URL=https://proitbridge-reviewai-n8n.up.railway.app/`

Railway will re-deploy the service with the new env vars (~30s).

### 2f. Smoke-test n8n

Open `https://<your-n8n>.up.railway.app` in a browser. Log in with the
basic-auth credentials. You should see the n8n workflow editor.

---

## Step 3 — n8n: import workflows

You have two options:

**Option A — Build from the markdown specs** (recommended for first deploy):

Open each file in [n8n/](./n8n) and reproduce the nodes in the n8n UI.
Takes ~20 minutes per workflow but you'll understand every step.

**Option B — Import a JSON** (if someone in the org has already exported):

In the n8n UI → workflow list → **... menu** → **Import from File** → pick
`n8n/pr-review.json`. Repeat for each.

### Wire credentials

n8n needs three credentials. Create each via **Credentials** → **New**:

1. **Anthropic API**
   - Type: HTTP Header Auth
   - Name: `x-api-key`
   - Value: your Anthropic key
   - Also add header `anthropic-version: 2023-06-01` in the workflow's HTTP node

2. **GitHub**
   - Type: GitHub API (built-in)
   - Personal access token with `repo` scope (or a GitHub App)

3. **Postgres**
   - Type: Postgres (built-in)
   - Paste the same `DATABASE_URL` from step 2b

### Activate the workflows

For each workflow, flip the **Active** toggle at the top right. Without
this, the webhook URLs won't accept requests.

### Note the webhook URLs

Click the **Webhook** trigger node in each workflow — copy the **Production
URL**. They'll look like:

- `https://<n8n>.up.railway.app/webhook/pr-review`
- `https://<n8n>.up.railway.app/webhook/pr-resync`
- `https://<n8n>.up.railway.app/webhook/pr-merged`
- `https://<n8n>.up.railway.app/webhook/weekly-digest`

---

## Step 4 — GitHub: configure the webhook

Pick a repo to point the bot at. For the demo, create
`proitbridge-reviewai-demo` (empty repo, add a `README.md` to initialize).

1. Repo → **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL:** `https://<n8n>.up.railway.app/webhook/pr-review`
3. **Content type:** `application/json`
4. **Secret:** paste the same `GITHUB_WEBHOOK_SECRET` from step 2d
5. **Which events?** → **Let me select** → check only **Pull requests**
6. **Active:** ✅
7. **Add webhook**

GitHub will send a ping immediately. Confirm a green ✓ next to the webhook
in the list.

### Add a second webhook for the resync flow

Repeat the steps above with payload URL `/webhook/pr-resync` (same secret,
same events). Alternatively, route synchronize events through `/pr-review`
and branch inside n8n — both work.

### Add a third for merged

Same pattern for `/webhook/pr-merged`.

> **Tip:** You can also use ONE webhook URL `/webhook/github` and branch
> inside n8n on `action` and `merged`. Simpler config, slightly busier
> workflow. Either works.

---

## Step 5 — Vercel: deploy the frontend

### 5a. Push the frontend to GitHub

If you forked, this is already on GitHub. If you cloned vanilla:

```bash
git remote set-url origin https://github.com/<you>/proitbridge-reviewai
git push -u origin main
```

### 5b. Import on Vercel

1. Vercel dashboard → **Add New** → **Project**
2. Import your fork
3. **Root Directory:** `frontend`
4. **Framework Preset:** Next.js (auto-detected)
5. **Environment Variables:**

```
DATABASE_URL=<the same Railway Postgres URL>
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://<n8n>.up.railway.app/webhook/pr-review
```

6. **Deploy**

After ~2 minutes you'll have:
- `https://<your-project>.vercel.app` — landing page
- `https://<your-project>.vercel.app/dashboard` — dashboard

---

## Step 6 — GitHub Actions: weekly digest cron

The repo already has `.github/workflows/weekly-digest.yml`. Two secrets to add:

1. Repo → **Settings** → **Secrets and variables** → **Actions** → **New secret**
2. Add:
   - `N8N_WEBHOOK_URL` = `https://<n8n>.up.railway.app/webhook/weekly-digest`
   - `N8N_WEBHOOK_SECRET` = the same `GITHUB_WEBHOOK_SECRET`

The cron will fire every Monday at 09:00 IST (03:30 UTC). You can trigger
it manually from the **Actions** tab to test.

---

## Step 7 — Test end-to-end

In the demo repo:

```bash
git checkout -b demo-sql-injection
cat > src/auth.py <<'PY'
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id={user_id}"
    return db.execute(query).fetchone()
PY
mkdir -p src && git add src/auth.py
git commit -m "Add user lookup"
git push -u origin demo-sql-injection
gh pr create --fill --title "Add user lookup by ID"
```

Within ~10 seconds, the bot should post:
- An inline comment on `src/auth.py:2` flagging the SQL injection
- A summary comment on the PR

Open the dashboard at `https://<your-project>.vercel.app/dashboard` — the
PR should appear in the live queue with 1 critical finding.

---

## Troubleshooting

### n8n webhook returns 404

The workflow isn't activated. Open it in the n8n UI and flip the **Active**
toggle.

### "Invalid HMAC signature" in n8n executions

The webhook secret in GitHub doesn't match `GITHUB_WEBHOOK_SECRET` on the
n8n side. Re-paste from your scratchpad.

### Claude returns prose instead of JSON

The reviewer prompt is the strict bouncer. If you've edited
`prompts/reviewer.txt`, the "Output JSON only" rule may have been weakened.
Compare against the original and reapply the strict rules.

### Vercel deploys but the dashboard is empty

`DATABASE_URL` not set, or the bot hasn't reviewed any PRs yet. The
dashboard falls back to bundled mock data when Postgres is empty — open the
network tab to confirm.

### Postgres connection refused

Railway's Postgres uses SSL. The `lib/db.ts` file in the frontend already
handles this (`ssl: { rejectUnauthorized: false }` when the URL isn't
localhost). If you're connecting from elsewhere, you need the equivalent.

### Railway free tier exhausted

Railway gives $5/month free, which is enough for n8n + Postgres at light
use. If you exceed it, n8n pauses. Either upgrade Railway or migrate n8n to
Fly.io (also has a free tier).

---

## Production hardening checklist

For a real deployment beyond the demo:

- [ ] Enable GitHub App auth instead of personal access tokens
- [ ] Rotate `GITHUB_WEBHOOK_SECRET` and `N8N_ENCRYPTION_KEY` quarterly
- [ ] Put the dashboard behind auth (Vercel password protection or NextAuth)
- [ ] Add a Sentry/Logflare integration for n8n executions
- [ ] Backup Postgres daily (Railway has built-in backups on paid tiers)
- [ ] Add rate-limiting on the n8n webhooks (cloudflare in front, or n8n's
  built-in rate limit node)
- [ ] Audit log every Claude call to a separate table for billing transparency

---

## Done

You now have a working AI code-review bot. Push a PR. Watch the bot review
it. Tune the prompt at `prompts/reviewer.txt`. Adjust the severity
thresholds in the dashboard's `/settings` page.

The whole stack is yours — fork, modify, ship.

> **Strive For Better Future.**
