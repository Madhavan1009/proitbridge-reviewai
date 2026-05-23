# Demo Bad PRs — Scripted Fixtures

Five intentionally-broken PRs for the YouTube demo. Each one is designed
to make the bot catch a specific class of issue on camera.

## How to use these in the demo

1. Create a sandbox repo (e.g. `proitbridge-reviewai-demo`).
2. Configure the GitHub webhook → n8n (see `DEPLOYMENT.md` step 3).
3. For each fixture:
   - `git checkout -b demo-<n>-<name>`
   - Paste the bad code into the path shown.
   - `git add . && git commit -m "<the commit message from the fixture>"`
   - `gh pr create --fill --title "<the PR title>" --body "<short body>"`
   - Wait ~10 seconds — the bot should post inline comments matching the
     "What the bot should catch" section.
4. Record the screen as the comments appear.

## Why these specific bugs?

They cover the four "What it catches" categories from the landing page:

| Fixture | Severity | Category | Why it matters on camera |
| --- | --- | --- | --- |
| 01-sql-injection | Critical | Security | Universal — every developer recognizes SQL injection. Strong opener. |
| 02-missing-tests | High | Test | Subtle — the bot has to *not* see test coverage in the diff. Shows context. |
| 03-perf-issue | Medium | Performance | The O(n²) is visually obvious. Counter suggestion is satisfying. |
| 04-hardcoded-secret | Critical | Security | Money. Stripe key in source. Audience gasps. |
| 05-race-condition | High | Bug | Sophisticated find — proves the bot is more than a linter. |

The order matters for the video. Lead with SQL injection (most familiar),
end with the race condition (most impressive).

## Replaying the demo

If you re-record, **close all 5 PRs first** so they re-open as fresh events.
The bot uses `pull_request.opened` as the trigger — re-pushes fire
`pull_request.synchronize` instead, which goes through the re-review flow
(also useful to demo, just different).
