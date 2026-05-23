# Workflow: pr-resync

**Trigger:** `pull_request.synchronize` (new commits pushed to an open PR).
**Webhook path:** `/webhook/pr-resync`
**Goal:** Re-review only what changed, mark resolved findings.

## Why this is separate from pr-review

The opened workflow does a fresh review from scratch. This workflow is
**stateful** — it compares the new diff against existing findings in
Postgres and reasons about which findings are now obsolete vs still valid.

## Node-by-node

### 1. Webhook (Trigger)

Same as pr-review, path `pr-resync`.

### 2. Code — HMAC verify

Same as pr-review step 2.

### 3. IF — `action === "synchronize"`

End the workflow otherwise.

### 4. Set — Extract fields

Same as pr-review step 4, plus:
- `before_sha = {{ $json.body.before }}`
- `after_sha = {{ $json.body.after }}`

### 5. HTTP — Compare commits

```
GET /repos/{owner}/{repo}/compare/{before_sha}...{after_sha}
```

This gives the list of files touched in the push (smaller than "all files in PR").

### 6. Postgres — Load existing findings

```sql
SELECT id, file_path, line_number, severity, category, message,
       suggestion, rationale, github_comment_id
FROM findings
WHERE pr_id = (SELECT id FROM prs WHERE github_pr_id = $1)
  AND resolved = FALSE;
```

### 7. Code — Match findings to touched lines

For each unresolved finding, check whether its line was touched in the push.

```javascript
const findings = $('Load findings').all().map(i => i.json);
const touchedFiles = $('Compare commits').first().json.files;

const candidates = findings.filter(f => {
  const file = touchedFiles.find(tf => tf.filename === f.file_path);
  if (!file) return false;
  // Quick check: was anything within ±3 lines of the finding touched?
  const lineRange = parseLineRanges(file.patch);
  return lineRange.some(([from, to]) =>
    f.line_number >= from - 3 && f.line_number <= to + 3
  );
});

return candidates.map(c => ({ json: c }));
```

### 8. Split (each candidate)

### 9. HTTP — Fetch the relevant snippet

Pull the lines around the original finding's line in the new file content.

### 10. HTTP — Ask Claude "is this still an issue?"

```
POST https://api.anthropic.com/v1/messages

System: You are confirming whether a previously-flagged code-review issue
has been fixed. Respond with a JSON object: {"still_an_issue": true|false,
"reason": "<one sentence>"}. Output JSON only.

User:
Original finding: {{ original_message }}
Original suggestion: {{ original_suggestion }}
Original line: {{ original_line }}

New code at that location:
{{ new_snippet }}
```

### 11. IF — `still_an_issue === false`

If the finding is fixed:

- **HTTP POST** — reply to the original comment:
  ```
  POST /repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies
  body: "✅ Resolved in {{ after_sha[:7] }}"
  ```
- **Postgres UPDATE** — `SET resolved = TRUE, accepted = TRUE, resolved_at = NOW()`
- **Postgres INSERT** — into `resolutions` for the audit log

If still an issue: do nothing (don't double-post).

### 12. After all candidates — re-run pr-review for net-new lines

Files that touched lines outside the original-finding zone may have *new*
issues. Run a smaller version of the pr-review pipeline on just the newly
added lines (skip lines already covered by an existing finding).

### 13. Postgres — UPDATE prs row

```sql
UPDATE prs
SET head_sha = $1, reviewed_at = NOW()
WHERE github_pr_id = $2;
```

### 14. HTTP — Update summary comment

Find the original summary comment (we stored its ID in step 15 of pr-review),
PATCH it with the new finding totals and a "Re-reviewed at {{ time }}" footer.

## Edge cases

- **Force push:** `before_sha` won't exist in the repo. Fall back to
  re-running the full pr-review pipeline.
- **PR was opened then immediately pushed:** Both workflows fire. n8n
  handles concurrency via execution ordering, but as insurance, the resync
  workflow checks `prs.reviewed_at` and skips if the row was created < 5s ago.
