# sample-pr/ — Ready-to-upload demo PR

A pre-built folder layout containing **4 intentionally bad files** across **4 different folders**, designed for a single PR that exercises every category the bot can detect.

```
sample-pr/
├── src/auth.py          ← SQL injection (Critical · Security)
├── api/stripe.py        ← Hardcoded API key (Critical · Security)
├── lib/dedup.py         ← O(n²) loop (Medium · Performance)
└── cache/counter.py     ← Race condition (High · Bug)
```

## Three ways to use it

### Option A — Copy the folder into your demo repo

```bash
# From the proitbridge-reviewai root
cp -r demo-bad-prs/sample-pr/* /path/to/proitbridge-reviewai-demo/

# Then in the demo repo
cd /path/to/proitbridge-reviewai-demo
git checkout -b demo-multi-file
git add src api lib cache
git commit -m "Add support endpoints across multiple modules"
git push -u origin demo-multi-file
gh pr create --fill
```

### Option B — Run the one-shot script

```bash
cd /path/to/proitbridge-reviewai-demo
node F:/ProITBridge/AI_Code_Automation/scripts/demo-live-recording.js
```

Creates the branch, writes all 4 files, commits, pushes, opens the PR.

### Option C — Type each file on camera (most cinematic)

For YouTube recording, you can type each `cat > file <<EOF ... EOF` block one at a time. Walk through each bug as you create the file. See [`../05-race-condition.md`](../05-race-condition.md) and friends for the per-file explanations.

## What the bot should catch

| File | Bug | Severity | Category |
|---|---|---|---|
| `src/auth.py` | SQL injection via f-string in query | **Critical** | Security |
| `src/auth.py` | No tests cover the get_user function | High | Test |
| `src/auth.py` | Module-level DB connection without cleanup | Medium | Bug |
| `api/stripe.py` | Hardcoded Stripe API key in source | **Critical** | Security |
| `api/stripe.py` | No idempotency key on charge — retries double-charge | Medium | Bug |
| `lib/dedup.py` | O(n²) nested loop — use Counter for O(n) | Medium | Performance |
| `lib/dedup.py` | Duplicate items added twice (each direction of pair) | Low | Bug |
| `cache/counter.py` | TOCTOU race condition in increment | **High** | Bug |
| `cache/counter.py` | bytes vs int — real Redis returns bytes | Medium | Bug |

Expected total: ~9 findings across 4 files (capped at 5/file). Bot completes in 15-30 seconds.

## Demo repo setup (one-time, before first recording)

```bash
# Create the public sandbox repo
gh repo create proitbridge-reviewai-demo --public \
  --description "Sandbox for testing ProITBridge ReviewAI bot" \
  --clone

# Add the webhook (replace <SECRET> with your GITHUB_WEBHOOK_SECRET)
gh api repos/Madhavan1009/proitbridge-reviewai-demo/hooks --method POST \
  --field name=web --field active=true \
  --raw-field 'config[url]=https://n8n-production-6b0c.up.railway.app/webhook/pr-review' \
  --raw-field 'config[content_type]=json' \
  --raw-field 'config[secret]=<SECRET>' \
  --raw-field 'events[]=pull_request'
```

That's all — every PR opened against this repo will be auto-reviewed by ReviewAI.
