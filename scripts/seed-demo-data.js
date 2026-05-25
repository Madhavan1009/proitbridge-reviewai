#!/usr/bin/env node
/**
 * Seed Railway Postgres with rich, realistic demo data for the dashboard.
 *
 * Inserts ~15 PRs across 5 repos with ~40 findings. Demo rows are
 * segregated by github_pr_id in the 9_000_000–9_999_999 range so they
 * never collide with real GitHub PR IDs (which are global integers but
 * sit far above this range on real repos).
 *
 * Re-running the script wipes the previous demo set and re-inserts —
 * so it's safe to run as many times as you want.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." node scripts/seed-demo-data.js
 */

const path = require("path");
const { Client } = require("pg");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

const client = new Client({
  connectionString: url,
  ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
});

// ─────────────────────────────── helpers ───────────────────────────────

const DEMO_ID_START = 9_000_000;
const DEMO_ID_END = 9_999_999;

const minutesAgo = (n) =>
  new Date(Date.now() - n * 60_000).toISOString();
const hoursAgo = (n) =>
  new Date(Date.now() - n * 3_600_000).toISOString();
const daysAgo = (n) =>
  new Date(Date.now() - n * 86_400_000).toISOString();

// ─────────────────────────────── data ──────────────────────────────────

// 15 demo PRs
const prs = [
  // Recently opened, lots of findings
  {
    id: 9_000_001,
    repo: "Madhavan1009/payments-svc",
    pr_number: 247,
    title: "Add user lookup by ID for support dashboard",
    author: "raj-dev",
    head_sha: "a1b2c3d4e5f",
    status: "open",
    reviewed_at: minutesAgo(3),
    merged_at: null,
  },
  {
    id: 9_000_002,
    repo: "Madhavan1009/payments-svc",
    pr_number: 246,
    title: "Refund flow rewrite with new state machine",
    author: "sneha-eng",
    head_sha: "b2c3d4e5f6a",
    status: "open",
    reviewed_at: minutesAgo(18),
    merged_at: null,
  },
  {
    id: 9_000_003,
    repo: "Madhavan1009/api-gateway",
    pr_number: 89,
    title: "Add Stripe charge endpoint for one-off payments",
    author: "raj-dev",
    head_sha: "c3d4e5f6a7b",
    status: "open",
    reviewed_at: hoursAgo(2),
    merged_at: null,
  },
  {
    id: 9_000_004,
    repo: "Madhavan1009/etl-jobs",
    pr_number: 41,
    title: "Bulk import endpoint with dedup",
    author: "sneha-eng",
    head_sha: "d4e5f6a7b8c",
    status: "open",
    reviewed_at: hoursAgo(4),
    merged_at: null,
  },
  {
    id: 9_000_005,
    repo: "Madhavan1009/notifications",
    pr_number: 33,
    title: "Push notification retry with exponential backoff",
    author: "priya-eng",
    head_sha: "e5f6a7b8c9d",
    status: "open",
    reviewed_at: hoursAgo(7),
    merged_at: null,
  },

  // Recently merged
  {
    id: 9_000_006,
    repo: "Madhavan1009/api-gateway",
    pr_number: 88,
    title: "Token validation refactor",
    author: "priya-eng",
    head_sha: "f6a7b8c9d0e",
    status: "merged",
    reviewed_at: hoursAgo(14),
    merged_at: hoursAgo(11),
  },
  {
    id: 9_000_007,
    repo: "Madhavan1009/payments-svc",
    pr_number: 245,
    title: "Balance transfer atomic transaction",
    author: "sneha-eng",
    head_sha: "a7b8c9d0e1f",
    status: "merged",
    reviewed_at: daysAgo(1),
    merged_at: hoursAgo(20),
  },
  {
    id: 9_000_008,
    repo: "Madhavan1009/notifications",
    pr_number: 32,
    title: "Fix typo in welcome email template",
    author: "raj-dev",
    head_sha: "b8c9d0e1f2a",
    status: "merged",
    reviewed_at: daysAgo(1),
    merged_at: daysAgo(1),
  },
  {
    id: 9_000_009,
    repo: "Madhavan1009/frontend-web",
    pr_number: 156,
    title: "Mobile responsive fix for dashboard sidebar",
    author: "priya-eng",
    head_sha: "c9d0e1f2a3b",
    status: "merged",
    reviewed_at: daysAgo(2),
    merged_at: daysAgo(2),
  },
  {
    id: 9_000_010,
    repo: "Madhavan1009/api-gateway",
    pr_number: 87,
    title: "Rate limiter race condition fix",
    author: "dev-3",
    head_sha: "d0e1f2a3b4c",
    status: "merged",
    reviewed_at: daysAgo(3),
    merged_at: daysAgo(3),
  },
  {
    id: 9_000_011,
    repo: "Madhavan1009/etl-jobs",
    pr_number: 40,
    title: "Memory leak in batch processor worker",
    author: "priya-eng",
    head_sha: "e1f2a3b4c5d",
    status: "merged",
    reviewed_at: daysAgo(4),
    merged_at: daysAgo(3),
  },
  {
    id: 9_000_012,
    repo: "Madhavan1009/payments-svc",
    pr_number: 244,
    title: "Audit log query optimization (N+1 → batched)",
    author: "raj-dev",
    head_sha: "f2a3b4c5d6e",
    status: "merged",
    reviewed_at: daysAgo(5),
    merged_at: daysAgo(5),
  },
  {
    id: 9_000_013,
    repo: "Madhavan1009/frontend-web",
    pr_number: 155,
    title: "A11y improvements: keyboard nav + ARIA labels",
    author: "sneha-eng",
    head_sha: "a3b4c5d6e7f",
    status: "merged",
    reviewed_at: daysAgo(7),
    merged_at: daysAgo(6),
  },
  {
    id: 9_000_014,
    repo: "Madhavan1009/api-gateway",
    pr_number: 86,
    title: "Add health check endpoint with deep dependency probe",
    author: "dev-3",
    head_sha: "b4c5d6e7f8a",
    status: "merged",
    reviewed_at: daysAgo(8),
    merged_at: daysAgo(8),
  },
  {
    id: 9_000_015,
    repo: "Madhavan1009/etl-jobs",
    pr_number: 39,
    title: "CSV parser race condition under concurrent uploads",
    author: "raj-dev",
    head_sha: "c5d6e7f8a9b",
    status: "merged",
    reviewed_at: daysAgo(12),
    merged_at: daysAgo(11),
  },
];

// Findings — keyed by demo pr_id (github_pr_id), distributed across PRs
const findings = [
  // PR #1 — Add user lookup (the live demo bug)
  {
    pr_demo_id: 9_000_001,
    file_path: "src/auth.py",
    line_number: 10,
    severity: "critical",
    category: "security",
    message:
      "SQL injection via f-string — user_id is interpolated directly into the query.",
    suggestion:
      'cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))',
    rationale:
      "Any attacker who controls user_id can break out of the query and read other tables. Use parameterized queries.",
    resolved: false,
    accepted: null,
    minutes_ago: 3,
  },
  {
    pr_demo_id: 9_000_001,
    file_path: "src/auth.py",
    line_number: 14,
    severity: "high",
    category: "test",
    message: "No tests cover the new get_user code path.",
    suggestion: null,
    rationale:
      "auth.py is a security boundary. Add a test asserting both valid and malformed user_id behavior.",
    resolved: false,
    accepted: null,
    minutes_ago: 3,
  },
  {
    pr_demo_id: 9_000_001,
    file_path: "src/auth.py",
    line_number: 5,
    severity: "medium",
    category: "bug",
    message: "Module-level DB connection without error handling or cleanup.",
    suggestion: null,
    rationale:
      "Defer connection creation to a function, or use a context manager. As-is, an unreachable DB at import time crashes the whole module.",
    resolved: false,
    accepted: null,
    minutes_ago: 3,
  },

  // PR #2 — Refund flow rewrite
  {
    pr_demo_id: 9_000_002,
    file_path: "src/refunds.py",
    line_number: 47,
    severity: "critical",
    category: "security",
    message: "Refund amount is not validated against original payment amount.",
    suggestion:
      "if refund_amount > original_payment.amount:\n    raise ValueError('refund exceeds original')",
    rationale:
      "Without this check, an attacker can request a refund larger than the original payment.",
    resolved: false,
    accepted: null,
    minutes_ago: 18,
  },
  {
    pr_demo_id: 9_000_002,
    file_path: "src/refunds.py",
    line_number: 60,
    severity: "critical",
    category: "bug",
    message: "Refund state transitions not wrapped in DB transaction.",
    suggestion:
      "with db.transaction():\n    update_status('refunded')\n    insert_audit_log(...)",
    rationale:
      "If the second write fails, the audit log is missing — but the payment is already marked refunded.",
    resolved: false,
    accepted: null,
    minutes_ago: 18,
  },
  {
    pr_demo_id: 9_000_002,
    file_path: "src/refunds.py",
    line_number: 71,
    severity: "high",
    category: "test",
    message: "No tests for the new partial-refund branch.",
    suggestion: null,
    rationale: "Add tests covering full refund, partial refund, and over-refund attempt.",
    resolved: false,
    accepted: null,
    minutes_ago: 18,
  },
  {
    pr_demo_id: 9_000_002,
    file_path: "src/refunds.py",
    line_number: 38,
    severity: "medium",
    category: "performance",
    message: "N+1 query: fetching original_payment inside loop.",
    suggestion: null,
    rationale:
      "Batch-load all original payments once, then look up by ID inside the loop.",
    resolved: false,
    accepted: null,
    minutes_ago: 18,
  },
  {
    pr_demo_id: 9_000_002,
    file_path: "src/refunds.py",
    line_number: 25,
    severity: "low",
    category: "docs",
    message: "Docstring missing on the new RefundStateMachine class.",
    suggestion: null,
    rationale: "Public API surface — add a docstring explaining state transitions.",
    resolved: false,
    accepted: null,
    minutes_ago: 18,
  },

  // PR #3 — Stripe charge endpoint
  {
    pr_demo_id: 9_000_003,
    file_path: "src/api.py",
    line_number: 12,
    severity: "critical",
    category: "security",
    message: "Stripe API key hardcoded in source.",
    suggestion: 'STRIPE_KEY = os.environ["STRIPE_KEY"]',
    rationale:
      "Once a live secret hits git history, rotate it immediately. Anyone with repo read access has prod-charge capability.",
    resolved: false,
    accepted: null,
    minutes_ago: 120,
  },
  {
    pr_demo_id: 9_000_003,
    file_path: "src/api.py",
    line_number: 18,
    severity: "medium",
    category: "bug",
    message: "No idempotency key on the charge — retries will double-charge.",
    suggestion: null,
    rationale:
      "Stripe.Charge.create supports idempotency_key — generate a unique one per request.",
    resolved: false,
    accepted: null,
    minutes_ago: 120,
  },

  // PR #4 — Bulk import dedup
  {
    pr_demo_id: 9_000_004,
    file_path: "src/etl/bulk_import.py",
    line_number: 38,
    severity: "medium",
    category: "performance",
    message: "Dedup uses O(n²) nested loop on the incoming batch.",
    suggestion:
      "from collections import Counter\nreturn [x for x, c in Counter(items).items() if c > 1]",
    rationale:
      "On 50k-item batches this jumps from 5ms to 12s. Counter is O(n) and clearer.",
    resolved: false,
    accepted: null,
    minutes_ago: 240,
  },

  // PR #5 — Push notif retry
  {
    pr_demo_id: 9_000_005,
    file_path: "src/notifications/push.py",
    line_number: 22,
    severity: "high",
    category: "bug",
    message: "Retry loop has no max-attempt cap — can run forever on permanent failures.",
    suggestion:
      "for attempt in range(MAX_RETRIES):\n    if try_push(): return\n    time.sleep(backoff(attempt))",
    rationale:
      "Permanent failures (revoked tokens, deleted users) would cause infinite retries.",
    resolved: false,
    accepted: null,
    minutes_ago: 420,
  },
  {
    pr_demo_id: 9_000_005,
    file_path: "src/notifications/push.py",
    line_number: 31,
    severity: "medium",
    category: "performance",
    message: "Backoff uses fixed sleep instead of exponential.",
    suggestion: "time.sleep(2 ** attempt)",
    rationale: "Linear backoff under thundering-herd will overwhelm the push gateway.",
    resolved: false,
    accepted: null,
    minutes_ago: 420,
  },

  // PR #6 — Token validation (MERGED, accepted)
  {
    pr_demo_id: 9_000_006,
    file_path: "src/auth/tokens.py",
    line_number: 56,
    severity: "high",
    category: "security",
    message: "JWT verification uses HS256 without verifying the algorithm header.",
    suggestion:
      'payload = jwt.decode(token, SECRET, algorithms=["HS256"])',
    rationale:
      "Without 'algorithms=', an attacker can sign with 'none' and bypass verification.",
    resolved: true,
    accepted: true,
    hours_ago: 14,
  },
  {
    pr_demo_id: 9_000_006,
    file_path: "src/auth/tokens.py",
    line_number: 78,
    severity: "high",
    category: "test",
    message: "No tests for the new refresh-token rotation path.",
    suggestion: null,
    rationale: "Add tests for: valid rotation, expired refresh, replay attempt.",
    resolved: true,
    accepted: true,
    hours_ago: 14,
  },

  // PR #7 — Balance transfer transaction (MERGED, accepted)
  {
    pr_demo_id: 9_000_007,
    file_path: "src/payments.py",
    line_number: 18,
    severity: "critical",
    category: "security",
    message: "Balance transfer not wrapped in DB transaction.",
    suggestion:
      "with db.transaction():\n    db.execute(...debit...)\n    db.execute(...credit...)",
    rationale:
      "A crash between debit and credit silently destroys customer funds.",
    resolved: true,
    accepted: true,
    hours_ago: 22,
  },
  {
    pr_demo_id: 9_000_007,
    file_path: "src/payments.py",
    line_number: 18,
    severity: "critical",
    category: "security",
    message: "SQL injection via f-string on `amount` and `from_id`.",
    suggestion: null,
    rationale: "Parameterize so user-supplied values can't change SQL structure.",
    resolved: true,
    accepted: true,
    hours_ago: 22,
  },
  {
    pr_demo_id: 9_000_007,
    file_path: "src/payments.py",
    line_number: 14,
    severity: "high",
    category: "bug",
    message: "No validation that amount is positive.",
    suggestion:
      "if amount <= 0:\n    raise ValueError('amount must be positive')",
    rationale: "Negative amounts let a sender drain the receiver's balance.",
    resolved: true,
    accepted: true,
    hours_ago: 22,
  },
  {
    pr_demo_id: 9_000_007,
    file_path: "src/payments.py",
    line_number: 14,
    severity: "high",
    category: "test",
    message: "No test file added for money-handling function.",
    suggestion: null,
    rationale: "Money-handling code needs unit tests covering edge cases.",
    resolved: true,
    accepted: true,
    hours_ago: 22,
  },

  // PR #9 — Mobile responsive (MERGED, 1 low accepted)
  {
    pr_demo_id: 9_000_009,
    file_path: "frontend/components/Sidebar.tsx",
    line_number: 24,
    severity: "low",
    category: "style",
    message: "Hard-coded breakpoint instead of using tailwind class.",
    suggestion: "className=\"lg:flex hidden\"",
    rationale: "Match the project's existing breakpoint conventions.",
    resolved: true,
    accepted: true,
    days_ago: 2,
  },

  // PR #10 — Rate limiter race (MERGED, accepted)
  {
    pr_demo_id: 9_000_010,
    file_path: "src/cache.py",
    line_number: 9,
    severity: "high",
    category: "bug",
    message: "TOCTOU race: get-then-set is not atomic under concurrent requests.",
    suggestion: "cache.incr(key)",
    rationale: "Two simultaneous callers can read old value and both write old+1, losing an increment.",
    resolved: true,
    accepted: true,
    days_ago: 3,
  },
  {
    pr_demo_id: 9_000_010,
    file_path: "src/cache.py",
    line_number: 12,
    severity: "high",
    category: "test",
    message: "No concurrent-access test for the new rate limiter.",
    suggestion: null,
    rationale: "Add a stress test with 100 concurrent increments asserting final == 100.",
    resolved: true,
    accepted: true,
    days_ago: 3,
  },

  // PR #11 — Memory leak (MERGED, 1 medium accepted)
  {
    pr_demo_id: 9_000_011,
    file_path: "src/workers/batch.py",
    line_number: 67,
    severity: "medium",
    category: "performance",
    message: "Unbounded queue growth — workers don't drain fast enough on backlog.",
    suggestion: "queue = Queue(maxsize=10_000)",
    rationale: "Cap the queue size; producers should block (or drop) rather than balloon memory.",
    resolved: true,
    accepted: true,
    days_ago: 4,
  },

  // PR #12 — Audit log optimization (MERGED, 1 medium accepted)
  {
    pr_demo_id: 9_000_012,
    file_path: "src/audit/queries.py",
    line_number: 41,
    severity: "medium",
    category: "performance",
    message: "Missing index on (user_id, created_at) — query is doing a sequential scan.",
    suggestion:
      "CREATE INDEX idx_audit_user_created ON audit_log(user_id, created_at DESC);",
    rationale: "EXPLAIN shows seq scan on 4M-row table. Index drops p95 from 8s to ~50ms.",
    resolved: true,
    accepted: true,
    days_ago: 5,
  },

  // PR #13 — A11y improvements (MERGED, 2 low, 1 accepted)
  {
    pr_demo_id: 9_000_013,
    file_path: "frontend/components/Button.tsx",
    line_number: 14,
    severity: "low",
    category: "docs",
    message: "Missing aria-label on icon-only button.",
    suggestion: 'aria-label="Close dialog"',
    rationale: "Screen readers can't announce icon-only buttons without an aria-label.",
    resolved: true,
    accepted: true,
    days_ago: 6,
  },
  {
    pr_demo_id: 9_000_013,
    file_path: "frontend/components/Modal.tsx",
    line_number: 22,
    severity: "low",
    category: "bug",
    message: "Focus trap doesn't restore focus to triggering element on close.",
    suggestion: null,
    rationale: "Save document.activeElement on open; restore on unmount.",
    resolved: true,
    accepted: false,
    days_ago: 6,
  },

  // PR #14 — Push notif retry (MERGED, 3 medium accepted)
  {
    pr_demo_id: 9_000_014,
    file_path: "src/health.py",
    line_number: 28,
    severity: "medium",
    category: "bug",
    message: "Health check times out the whole endpoint if any dependency is slow.",
    suggestion: "Wrap each dependency check in asyncio.wait_for with 2s timeout",
    rationale: "k8s liveness probe fails if redis is slow — but the app is actually fine.",
    resolved: true,
    accepted: true,
    days_ago: 8,
  },

  // PR #15 — CSV parser race (MERGED, 2 critical accepted)
  {
    pr_demo_id: 9_000_015,
    file_path: "src/etl/csv_parser.py",
    line_number: 51,
    severity: "critical",
    category: "bug",
    message: "Shared parser state across concurrent uploads — corrupts row counts.",
    suggestion: null,
    rationale: "Move parser state into per-upload scope. Currently the module-level dict is a bug magnet.",
    resolved: true,
    accepted: true,
    days_ago: 11,
  },
  {
    pr_demo_id: 9_000_015,
    file_path: "src/etl/csv_parser.py",
    line_number: 72,
    severity: "critical",
    category: "security",
    message: "CSV injection: user-controlled cells written without sanitization.",
    suggestion:
      "if cell.startswith(('=', '+', '-', '@')):\n    cell = \"'\" + cell",
    rationale:
      "Excel/Sheets interprets cells starting with = as formulas — could fire RCE on export.",
    resolved: true,
    accepted: true,
    days_ago: 11,
  },
];

// ─────────────────────────────── insert ───────────────────────────────

(async () => {
  console.log("Connecting to Postgres…");
  await client.connect();
  console.log("Connected. Wiping previous demo data…");

  // Delete previous demo rows so re-runs don't accumulate
  await client.query(
    `DELETE FROM findings
       WHERE pr_id IN (SELECT id FROM prs WHERE github_pr_id BETWEEN $1 AND $2)`,
    [DEMO_ID_START, DEMO_ID_END]
  );
  await client.query(
    `DELETE FROM prs WHERE github_pr_id BETWEEN $1 AND $2`,
    [DEMO_ID_START, DEMO_ID_END]
  );

  console.log(`Inserting ${prs.length} PRs…`);

  // Map demo github_pr_id -> real prs.id (assigned by Postgres)
  const realPrId = new Map();

  for (const pr of prs) {
    const { rows } = await client.query(
      `INSERT INTO prs
         (github_pr_id, repo, pr_number, title, author, head_sha,
          status, total_findings, reviewed_at, merged_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9)
       RETURNING id`,
      [
        pr.id,
        pr.repo,
        pr.pr_number,
        pr.title,
        pr.author,
        pr.head_sha,
        pr.status,
        pr.reviewed_at,
        pr.merged_at,
      ]
    );
    realPrId.set(pr.id, rows[0].id);
  }

  console.log(`Inserting ${findings.length} findings…`);

  for (const f of findings) {
    const prId = realPrId.get(f.pr_demo_id);
    if (!prId) {
      console.warn(
        `  skipping finding for demo pr ${f.pr_demo_id} — no matching PR`
      );
      continue;
    }
    const createdAt = f.minutes_ago
      ? minutesAgo(f.minutes_ago)
      : f.hours_ago
      ? hoursAgo(f.hours_ago)
      : f.days_ago
      ? daysAgo(f.days_ago)
      : minutesAgo(60);
    const resolvedAt = f.resolved
      ? f.minutes_ago
        ? minutesAgo(Math.max(0, f.minutes_ago - 30))
        : f.hours_ago
        ? hoursAgo(Math.max(0, f.hours_ago - 1))
        : f.days_ago
        ? daysAgo(Math.max(0, f.days_ago - 1))
        : null
      : null;

    await client.query(
      `INSERT INTO findings
         (pr_id, file_path, line_number, severity, category,
          message, suggestion, rationale, github_comment_id,
          resolved, accepted, created_at, resolved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9, $10, $11, $12)`,
      [
        prId,
        f.file_path,
        f.line_number,
        f.severity,
        f.category,
        f.message,
        f.suggestion,
        f.rationale,
        f.resolved,
        f.accepted,
        createdAt,
        resolvedAt,
      ]
    );
  }

  // Update total_findings counters
  await client.query(`
    UPDATE prs
       SET total_findings = COALESCE(
         (SELECT COUNT(*) FROM findings WHERE findings.pr_id = prs.id),
         0
       )
     WHERE github_pr_id BETWEEN $1 AND $2
  `, [DEMO_ID_START, DEMO_ID_END]);

  // Quick verification
  const { rows: prCount } = await client.query(
    `SELECT COUNT(*)::int AS n FROM prs WHERE github_pr_id BETWEEN $1 AND $2`,
    [DEMO_ID_START, DEMO_ID_END]
  );
  const { rows: fCount } = await client.query(
    `SELECT COUNT(*)::int AS n FROM findings WHERE pr_id IN
       (SELECT id FROM prs WHERE github_pr_id BETWEEN $1 AND $2)`,
    [DEMO_ID_START, DEMO_ID_END]
  );

  console.log(`Inserted ${prCount[0].n} demo PRs · ${fCount[0].n} demo findings.`);
  await client.end();
  console.log("Done.");
})().catch((err) => {
  console.error("Seed failed:");
  console.error(err.message);
  process.exit(1);
});
