# Workflow: pr-review

**Trigger:** `pull_request.opened` (and `ready_for_review`) on any watched repo.
**Webhook path:** `/webhook/pr-review`
**Goal:** Post inline Claude-generated review comments on the PR within ~10s.

## Node-by-node

### 1. Webhook (Trigger)

- **Path:** `pr-review`
- **HTTP Method:** POST
- **Response Mode:** Immediately (n8n acknowledges to GitHub fast; the rest
  runs async).
- **Response Code:** 200

### 2. Code — Verify HMAC signature

Reject the request if the signature header doesn't match the shared secret.
GitHub signs every webhook body with `GITHUB_WEBHOOK_SECRET`.

```javascript
const crypto = require('crypto');
const signature = $input.first().headers['x-hub-signature-256'];
const payload = JSON.stringify($input.first().body);
const expected = 'sha256=' + crypto
  .createHmac('sha256', $env.GITHUB_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (!signature || signature !== expected) {
  throw new Error('Invalid HMAC — request rejected');
}

return $input.first();
```

### 3. IF — Filter to opened / ready_for_review

```
{{ $json.body.action }} === "opened"
  OR {{ $json.body.action }} === "ready_for_review"
```

If false, end the workflow (do nothing).

### 4. Set — Extract key fields

Pull out the variables we'll reference repeatedly:

```
owner       = {{ $json.body.repository.owner.login }}
repo        = {{ $json.body.repository.name }}
pr_number   = {{ $json.body.number }}
pr_title    = {{ $json.body.pull_request.title }}
author      = {{ $json.body.pull_request.user.login }}
head_sha    = {{ $json.body.pull_request.head.sha }}
github_pr_id = {{ $json.body.pull_request.id }}
```

### 5. HTTP — GET /repos/{owner}/{repo}/pulls/{pr}/files

GitHub API call to list changed files in the PR.

- **Method:** GET
- **URL:** `https://api.github.com/repos/{{ $json.owner }}/{{ $json.repo }}/pulls/{{ $json.pr_number }}/files`
- **Authentication:** GitHub credential

### 6. Code — Filter out generated / huge files

```javascript
const skipPatterns = [
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /\.min\.js$/,
  /^dist\//,
  /^build\//,
  /generated/i,
  /vendor\//,
];

return $input.first().json
  .filter(f => !skipPatterns.some(p => p.test(f.filename)))
  .filter(f => f.changes < 500)
  .map(f => ({ json: f }));
```

### 7. Split In Batches (batchSize: 1)

Process one file at a time so we can rate-limit Claude calls and POST
comments serially.

### 8. HTTP — GET file content

Fetch the full file at the head SHA so Claude has full context.

- **Method:** GET
- **URL:** `https://api.github.com/repos/{{ owner }}/{{ repo }}/contents/{{ $json.filename }}?ref={{ head_sha }}`
- **Authentication:** GitHub credential

Decode the base64 content:
```javascript
const content = Buffer.from($input.first().json.content, 'base64').toString();
return { json: { ...$input.first().json, decoded_content: content } };
```

### 9. HTTP — POST Anthropic Messages API

```
POST https://api.anthropic.com/v1/messages

Headers:
  x-api-key: {{ $credentials.anthropic.api_key }}
  anthropic-version: 2023-06-01
  content-type: application/json

Body:
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 4096,
  "system": "<paste prompts/reviewer.txt verbatim>",
  "messages": [{
    "role": "user",
    "content": "File: {{ $json.filename }}\n\nFull content:\n{{ $json.decoded_content }}\n\nDiff:\n{{ $json.patch }}"
  }]
}
```

### 10. Code — Parse JSON findings

Claude returns a JSON array as its single text response. Parse defensively.

```javascript
const text = $input.first().json.content[0].text.trim();
// Find the first [ and last ] — strip any markdown or prose
const start = text.indexOf('[');
const end = text.lastIndexOf(']');
if (start === -1 || end === -1) {
  return { json: { findings: [], file: $('Set').first().json.filename } };
}
const findings = JSON.parse(text.slice(start, end + 1));
return { json: { findings, file: $('Set').first().json.filename } };
```

### 11. Code — Filter by severity threshold

Read the per-repo threshold from `repo_config`, default to `medium`.

```javascript
const SEV_ORDER = { critical: 4, high: 3, medium: 2, low: 1, nit: 0 };
const minSev = $('Get repo config').first().json.min_severity_to_post || 'medium';
const cutoff = SEV_ORDER[minSev];

const filtered = $input.first().json.findings
  .filter(f => SEV_ORDER[f.severity] >= cutoff)
  .slice(0, 5); // hard cap

return { json: { ...$input.first().json, findings: filtered } };
```

### 12. Split (each finding)

### 13. HTTP — POST inline review comment

```
POST https://api.github.com/repos/{{ owner }}/{{ repo }}/pulls/{{ pr_number }}/comments

Body:
{
  "body": "🤖 **{{ severityEmoji }} {{ $json.severity | upper }} · {{ categoryEmoji }} {{ $json.category }}**\n\n{{ $json.message }}\n\n```suggestion\n{{ $json.suggestion }}\n```\n\n_Rationale:_ {{ $json.rationale }}\n\n— Reviewed by [ProITBridge ReviewAI]({{ dashboardUrl }})",
  "commit_id": "{{ head_sha }}",
  "path": "{{ file }}",
  "line": {{ $json.line }},
  "side": "RIGHT"
}
```

Capture the returned comment `id` for the next step.

### 14. Postgres — INSERT INTO findings

```sql
INSERT INTO findings (
  pr_id, file_path, line_number, severity, category, message,
  suggestion, rationale, github_comment_id
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
);
```

(Look up `pr_id` from the `prs` table, INSERTing if it doesn't exist yet.)

### 15. (after all files done) — Aggregate findings, POST summary comment

```
POST https://api.github.com/repos/{{ owner }}/{{ repo }}/issues/{{ pr_number }}/comments

Body:
{
  "body": "<formatted markdown summary — see prompts/digest.txt for the inline-comment summary template>"
}
```

### 16. Postgres — INSERT/UPDATE prs row

```sql
INSERT INTO prs (github_pr_id, repo, pr_number, title, author, head_sha, total_findings)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (repo, pr_number) DO UPDATE
SET head_sha = EXCLUDED.head_sha,
    total_findings = EXCLUDED.total_findings,
    reviewed_at = NOW();
```

## Error handling

- If Claude returns non-JSON, log to n8n executions and skip the file (don't fail the whole workflow).
- If a GitHub POST fails with 422 (invalid line), retry once with `position` instead of `line`.
- Postgres failures should NOT block the GitHub comments — wrap in try/catch.

## Estimated latency

For a 3-file PR:
- HMAC verify: <10ms
- GitHub list files: ~200ms
- 3× (fetch content + Claude review + comment post): 3 × ~3s = ~9s
- Total: **~10 seconds end-to-end**
