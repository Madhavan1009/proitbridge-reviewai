import type {
  DashboardStats,
  Finding,
  PullRequest,
} from "./types";

/**
 * Demo fixtures used by the dashboard when DATABASE_URL is not set
 * (or when the table is empty). Matches the schema in postgres/schema.sql.
 *
 * These are the same patterns the bot will detect in the demo PRs:
 * SQL injection, hardcoded secret, missing tests, O(n^2), race condition.
 */

const now = () => new Date().toISOString();
const minutesAgo = (n: number) =>
  new Date(Date.now() - n * 60_000).toISOString();
const hoursAgo = (n: number) =>
  new Date(Date.now() - n * 3_600_000).toISOString();
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString();

export const mockPRs: PullRequest[] = [
  {
    id: 1,
    github_pr_id: 1001,
    repo: "Madhavan1009/payments-svc",
    pr_number: 142,
    title: "Add user lookup by ID for support dashboard",
    author: "raj-dev",
    head_sha: "a1b2c3d",
    status: "open",
    total_findings: 3,
    reviewed_at: minutesAgo(2),
    merged_at: null,
    findings_by_severity: {
      critical: 1,
      high: 1,
      medium: 1,
      low: 0,
      nit: 0,
    },
  },
  {
    id: 2,
    github_pr_id: 1002,
    repo: "Madhavan1009/payments-svc",
    pr_number: 141,
    title: "Implement balance transfer between accounts",
    author: "sneha-eng",
    head_sha: "e5f6g7h",
    status: "open",
    total_findings: 4,
    reviewed_at: minutesAgo(18),
    merged_at: null,
    findings_by_severity: {
      critical: 2,
      high: 1,
      medium: 1,
      low: 0,
      nit: 0,
    },
  },
  {
    id: 3,
    github_pr_id: 1003,
    repo: "Madhavan1009/api-gateway",
    pr_number: 67,
    title: "Add Stripe charge endpoint",
    author: "raj-dev",
    head_sha: "i9j0k1l",
    status: "open",
    total_findings: 2,
    reviewed_at: hoursAgo(2),
    merged_at: null,
    findings_by_severity: {
      critical: 1,
      high: 0,
      medium: 1,
      low: 0,
      nit: 0,
    },
  },
  {
    id: 4,
    github_pr_id: 1004,
    repo: "Madhavan1009/api-gateway",
    pr_number: 66,
    title: "Cache layer for user sessions",
    author: "priya-eng",
    head_sha: "m2n3o4p",
    status: "merged",
    total_findings: 2,
    reviewed_at: hoursAgo(8),
    merged_at: hoursAgo(2),
    findings_by_severity: {
      critical: 0,
      high: 1,
      medium: 1,
      low: 0,
      nit: 0,
    },
  },
  {
    id: 5,
    github_pr_id: 1005,
    repo: "Madhavan1009/etl-jobs",
    pr_number: 24,
    title: "Bulk import endpoint with dedup",
    author: "sneha-eng",
    head_sha: "q5r6s7t",
    status: "open",
    total_findings: 1,
    reviewed_at: hoursAgo(12),
    merged_at: null,
    findings_by_severity: {
      critical: 0,
      high: 0,
      medium: 1,
      low: 0,
      nit: 0,
    },
  },
  {
    id: 6,
    github_pr_id: 1006,
    repo: "Madhavan1009/notifications",
    pr_number: 31,
    title: "Fix typo in welcome email",
    author: "raj-dev",
    head_sha: "u8v9w0x",
    status: "merged",
    total_findings: 0,
    reviewed_at: daysAgo(1),
    merged_at: daysAgo(1),
    findings_by_severity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      nit: 0,
    },
  },
];

export const mockFindings: Finding[] = [
  {
    id: 1,
    pr_id: 1,
    file_path: "src/auth.py",
    line_number: 47,
    severity: "critical",
    category: "security",
    message:
      "SQL injection via f-string — user_id is interpolated directly into the query.",
    suggestion:
      'cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))',
    rationale:
      "Any attacker who controls user_id can break out of the query and read or modify other tables. Use parameterized queries.",
    github_comment_id: 5510001,
    resolved: false,
    accepted: null,
    created_at: minutesAgo(2),
    resolved_at: null,
  },
  {
    id: 2,
    pr_id: 1,
    file_path: "src/auth.py",
    line_number: 52,
    severity: "high",
    category: "test",
    message: "No tests cover the new get_user code path.",
    suggestion: null,
    rationale:
      "auth.py is a security boundary. Add a test asserting both valid and malformed user_id behavior.",
    github_comment_id: 5510002,
    resolved: false,
    accepted: null,
    created_at: minutesAgo(2),
    resolved_at: null,
  },
  {
    id: 3,
    pr_id: 1,
    file_path: "src/auth.py",
    line_number: 60,
    severity: "medium",
    category: "bug",
    message:
      "fetchone() may return None — caller assumes a tuple and will crash on KeyError.",
    suggestion:
      "row = cursor.fetchone()\nif row is None:\n    raise UserNotFound(user_id)",
    rationale: "Add an explicit None check before unpacking.",
    github_comment_id: 5510003,
    resolved: false,
    accepted: null,
    created_at: minutesAgo(2),
    resolved_at: null,
  },
  {
    id: 4,
    pr_id: 2,
    file_path: "src/payments.py",
    line_number: 18,
    severity: "critical",
    category: "security",
    message:
      "Balance transfer is not wrapped in a transaction — a crash between the two UPDATEs will lose money.",
    suggestion:
      "with db.transaction():\n    db.execute(\"UPDATE accounts SET balance = balance - %s WHERE id = %s\", (amount, from_id))\n    db.execute(\"UPDATE accounts SET balance = balance + %s WHERE id = %s\", (amount, to_id))",
    rationale:
      "Without atomicity, a network blip between the debit and credit silently destroys customer funds.",
    github_comment_id: 5510004,
    resolved: false,
    accepted: true,
    created_at: minutesAgo(18),
    resolved_at: null,
  },
  {
    id: 5,
    pr_id: 2,
    file_path: "src/payments.py",
    line_number: 18,
    severity: "critical",
    category: "security",
    message: "SQL injection via f-string on `amount` and `from_id`.",
    suggestion: null,
    rationale:
      "Same as above — parameterize the query so user-supplied values can't change the SQL structure.",
    github_comment_id: 5510005,
    resolved: false,
    accepted: null,
    created_at: minutesAgo(18),
    resolved_at: null,
  },
  {
    id: 6,
    pr_id: 2,
    file_path: "src/payments.py",
    line_number: 14,
    severity: "high",
    category: "bug",
    message: "No validation that `amount` is positive — negative amounts would credit the source.",
    suggestion:
      "if amount <= 0:\n    raise ValueError(\"amount must be positive\")",
    rationale:
      "A negative-amount transfer effectively lets a sender drain the receiver's balance.",
    github_comment_id: 5510006,
    resolved: false,
    accepted: null,
    created_at: minutesAgo(18),
    resolved_at: null,
  },
  {
    id: 7,
    pr_id: 3,
    file_path: "src/api.py",
    line_number: 12,
    severity: "critical",
    category: "security",
    message: "Stripe API key is hardcoded in source. Move to environment variable.",
    suggestion:
      'STRIPE_KEY = os.environ["STRIPE_KEY"]',
    rationale:
      "Once a live secret hits git history, rotate it immediately. Anyone with repo read access has prod-charge capability.",
    github_comment_id: 5510007,
    resolved: false,
    accepted: null,
    created_at: hoursAgo(2),
    resolved_at: null,
  },
  {
    id: 8,
    pr_id: 4,
    file_path: "src/cache.py",
    line_number: 9,
    severity: "high",
    category: "bug",
    message: "TOCTOU race condition: get-then-set is not atomic under concurrent requests.",
    suggestion: "cache.incr(key)",
    rationale:
      "Two simultaneous callers can both read the old value and both write old+1, losing an increment.",
    github_comment_id: 5510008,
    resolved: true,
    accepted: true,
    created_at: hoursAgo(8),
    resolved_at: hoursAgo(3),
  },
  {
    id: 9,
    pr_id: 5,
    file_path: "src/utils.py",
    line_number: 22,
    severity: "medium",
    category: "performance",
    message: "find_duplicates is O(n²) — use a Counter for O(n).",
    suggestion:
      "from collections import Counter\nreturn [x for x, c in Counter(items).items() if c > 1]",
    rationale:
      "On a 50k-item batch this jumps from ~5ms to ~12s. The Counter approach is both faster and more readable.",
    github_comment_id: 5510009,
    resolved: false,
    accepted: null,
    created_at: hoursAgo(12),
    resolved_at: null,
  },
];

const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(Date.now() - (6 - i) * 86_400_000);
  return d.toISOString().slice(0, 10);
});

export const mockStats: DashboardStats = {
  prs_reviewed_week: 12,
  findings_posted_week: 47,
  suggestions_accepted_week: 33,
  accept_rate_pct: 71,
  recent_prs: mockPRs,
  severity_trend: [
    { day: days[0], critical: 0, high: 2, medium: 3, low: 1, nit: 0 },
    { day: days[1], critical: 1, high: 1, medium: 2, low: 2, nit: 1 },
    { day: days[2], critical: 0, high: 3, medium: 4, low: 1, nit: 0 },
    { day: days[3], critical: 2, high: 2, medium: 1, low: 0, nit: 1 },
    { day: days[4], critical: 1, high: 4, medium: 2, low: 1, nit: 0 },
    { day: days[5], critical: 0, high: 1, medium: 3, low: 2, nit: 1 },
    { day: days[6], critical: 1, high: 2, medium: 2, low: 1, nit: 0 },
  ],
  category_breakdown: {
    bug: 12,
    security: 9,
    performance: 7,
    test: 11,
    style: 5,
    docs: 3,
  },
  top_files: [
    { file: "src/payments.py", count: 8 },
    { file: "src/auth.py", count: 6 },
    { file: "src/api.py", count: 5 },
    { file: "src/cache.py", count: 4 },
    { file: "src/utils.py", count: 4 },
    { file: "src/db.py", count: 3 },
    { file: "src/users.py", count: 3 },
  ],
  accept_rate_trend: [
    { day: days[0], rate: 62 },
    { day: days[1], rate: 65 },
    { day: days[2], rate: 68 },
    { day: days[3], rate: 64 },
    { day: days[4], rate: 70 },
    { day: days[5], rate: 73 },
    { day: days[6], rate: 71 },
  ],
};

export function getFindingsForPr(prId: number): Finding[] {
  return mockFindings.filter((f) => f.pr_id === prId);
}
