# n8n Workflows

This folder contains **specifications** for the four n8n workflows that
power ReviewAI. The JSON exports come **after** you build the workflows in
the n8n UI — they're easier to assemble interactively than to author by hand.

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| [pr-review](./pr-review.md) | GitHub `pull_request.opened` | Main reviewer: read the diff, call Claude, post inline comments |
| [pr-resync](./pr-resync.md) | GitHub `pull_request.synchronize` | Re-review on push; mark resolved findings |
| [pr-merged](./pr-merged.md) | GitHub `pull_request.closed` (merged=true) | Generate changelog entry, post to Slack |
| [weekly-digest](./weekly-digest.md) | GitHub Actions cron | Email a weekly review-quality summary |

## Building order

Build them in this order — each one reuses credentials and patterns from
the previous:

1. **pr-review** — get the happy path working end-to-end first
2. **pr-resync** — once review works, layer in resolution detection
3. **pr-merged** — easy follow-on
4. **weekly-digest** — read-only, build last

## Credentials you'll need in n8n

Set these as n8n Credentials (not env vars) so workflows can reference them:

- **Anthropic API** — header auth, `x-api-key: $ANTHROPIC_API_KEY`,
  plus `anthropic-version: 2023-06-01`
- **GitHub** — personal access token with `repo` scope, or a GitHub App
  for the org
- **Postgres** — the Railway connection string from your Postgres service

## Exporting JSON

Once each workflow is built and tested:

1. Open the workflow in the n8n UI
2. Menu (⋯ top right) → **Download**
3. Save as `pr-review.json` / `pr-resync.json` / etc. in this folder
4. Commit to git — these are the canonical workflow definitions

That way the next person who forks the repo can import the JSONs straight in
and just wire their own credentials.

## Why specs and not JSON?

n8n workflow JSONs are awkward to author by hand — they reference internal
node IDs that don't exist until you create them in the UI, and credentials
are referenced by per-instance UUIDs that vary between deployments. Building
in the UI and exporting is faster and produces cleaner exports.
