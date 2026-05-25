import { query } from "./db";
import { mockFindings, mockPRs, mockStats } from "./mockData";
import type {
  Category,
  DashboardStats,
  Finding,
  PullRequest,
  Severity,
} from "./types";

/**
 * Live-data queries with mock fallback.
 *
 * Each function tries Postgres first. If DATABASE_URL isn't set, the
 * query errors, or the table is empty, we fall back to the bundled
 * mock fixtures so the dashboard ALWAYS looks good — useful both for
 * local dev and for the YouTube demo before the bot has reviewed any
 * real PRs.
 */

type AnyRow = Record<string, unknown>;

const num = (v: unknown, dflt = 0): number => {
  if (v === null || v === undefined) return dflt;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isNaN(n) ? dflt : n;
};

const str = (v: unknown, dflt = ""): string =>
  v === null || v === undefined ? dflt : String(v);

const isoOrNow = (v: unknown): string => {
  if (!v) return new Date().toISOString();
  if (v instanceof Date) return v.toISOString();
  return String(v);
};

// ─────────────────────────────── PRs ───────────────────────────────

export async function getRecentPRs(): Promise<PullRequest[]> {
  try {
    const rows = await query<AnyRow>(`
      SELECT
        p.id, p.github_pr_id, p.repo, p.pr_number, p.title, p.author,
        p.head_sha, p.status, p.merged_at, p.reviewed_at,
        COALESCE((SELECT COUNT(*) FROM findings f WHERE f.pr_id = p.id), 0) AS actual_findings,
        COALESCE((SELECT COUNT(*) FROM findings f WHERE f.pr_id = p.id AND f.severity = 'critical'), 0) AS crit,
        COALESCE((SELECT COUNT(*) FROM findings f WHERE f.pr_id = p.id AND f.severity = 'high'), 0) AS high_,
        COALESCE((SELECT COUNT(*) FROM findings f WHERE f.pr_id = p.id AND f.severity = 'medium'), 0) AS med,
        COALESCE((SELECT COUNT(*) FROM findings f WHERE f.pr_id = p.id AND f.severity = 'low'), 0) AS low_,
        COALESCE((SELECT COUNT(*) FROM findings f WHERE f.pr_id = p.id AND f.severity = 'nit'), 0) AS nit
      FROM prs p
      ORDER BY p.reviewed_at DESC
      LIMIT 50
    `);

    if (!rows || rows.length === 0) return mockPRs;

    return rows.map<PullRequest>((r) => ({
      id: num(r.id),
      github_pr_id: num(r.github_pr_id),
      repo: str(r.repo),
      pr_number: num(r.pr_number),
      title: str(r.title).trim(),
      author: str(r.author),
      head_sha: str(r.head_sha).slice(0, 7),
      status: (str(r.status, "open") as PullRequest["status"]) || "open",
      total_findings: num(r.actual_findings),
      reviewed_at: isoOrNow(r.reviewed_at),
      merged_at: r.merged_at ? isoOrNow(r.merged_at) : null,
      findings_by_severity: {
        critical: num(r.crit),
        high: num(r.high_),
        medium: num(r.med),
        low: num(r.low_),
        nit: num(r.nit),
      },
    }));
  } catch (e) {
    console.warn(
      "[queries] getRecentPRs falling back to mock:",
      (e as Error).message
    );
    return mockPRs;
  }
}

// ───────────────────────────── Findings ─────────────────────────────

export async function getAllFindings(limit = 200): Promise<Finding[]> {
  try {
    const rows = await query<AnyRow>(
      `SELECT id, pr_id, file_path, line_number, severity, category,
              message, suggestion, rationale, github_comment_id,
              resolved, accepted,
              created_at::text AS created_at,
              resolved_at::text AS resolved_at
       FROM findings
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    if (!rows || rows.length === 0) return mockFindings;

    return rows.map<Finding>((r) => ({
      id: num(r.id),
      pr_id: num(r.pr_id),
      file_path: str(r.file_path),
      line_number: num(r.line_number),
      severity: (str(r.severity, "medium") as Severity) || "medium",
      category: (str(r.category, "bug") as Category) || "bug",
      message: str(r.message),
      suggestion: r.suggestion ? str(r.suggestion) : null,
      rationale: r.rationale ? str(r.rationale) : null,
      github_comment_id: r.github_comment_id ? num(r.github_comment_id) : null,
      resolved: Boolean(r.resolved),
      accepted: r.accepted === null ? null : Boolean(r.accepted),
      created_at: isoOrNow(r.created_at),
      resolved_at: r.resolved_at ? isoOrNow(r.resolved_at) : null,
    }));
  } catch (e) {
    console.warn(
      "[queries] getAllFindings falling back to mock:",
      (e as Error).message
    );
    return mockFindings;
  }
}

// ──────────────────────── Dashboard stats ────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Single round-trip aggregate of all stat counters
    const aggRows = await query<AnyRow>(`
      WITH last7 AS (
        SELECT * FROM findings WHERE created_at > NOW() - INTERVAL '7 days'
      )
      SELECT
        (SELECT COUNT(DISTINCT pr_id) FROM last7) AS prs_reviewed_week,
        (SELECT COUNT(*) FROM last7) AS findings_posted_week,
        (SELECT COUNT(*) FROM last7 WHERE accepted = TRUE) AS suggestions_accepted_week,
        (SELECT COUNT(*) FROM last7 WHERE accepted IS NOT NULL) AS decided_findings
    `);

    if (
      !aggRows ||
      aggRows.length === 0 ||
      num(aggRows[0].findings_posted_week) === 0
    ) {
      // No real data yet — show mock so the dashboard demo still works.
      return mockStats;
    }

    const agg = aggRows[0];
    const decided = num(agg.decided_findings);
    const accepted = num(agg.suggestions_accepted_week);
    const accept_rate_pct = decided > 0
      ? Math.round((100 * accepted) / decided)
      : 0;

    // Trends (last 7 days)
    const trendRows = await query<AnyRow>(`
      SELECT day::text AS day, critical, high, medium, low, nit, total
      FROM v_severity_trend
      WHERE day > NOW()::date - INTERVAL '7 days'
      ORDER BY day ASC
      LIMIT 14
    `);

    const acceptRows = await query<AnyRow>(`
      SELECT day::text AS day, rate_pct
      FROM v_accept_rate
      WHERE day > NOW()::date - INTERVAL '14 days'
      ORDER BY day ASC
      LIMIT 14
    `);

    const catRows = await query<AnyRow>(`
      SELECT category, count FROM v_category_breakdown
    `);

    const topFileRows = await query<AnyRow>(`
      SELECT file, count FROM v_top_files
    `);

    // Build category breakdown with all keys defaulted to 0
    const category_breakdown: Record<Category, number> = {
      bug: 0,
      security: 0,
      performance: 0,
      test: 0,
      style: 0,
      docs: 0,
    };
    for (const row of catRows) {
      const k = str(row.category) as Category;
      if (k in category_breakdown) category_breakdown[k] = num(row.count);
    }

    return {
      prs_reviewed_week: num(agg.prs_reviewed_week),
      findings_posted_week: num(agg.findings_posted_week),
      suggestions_accepted_week: accepted,
      accept_rate_pct,
      recent_prs: await getRecentPRs(),
      severity_trend: trendRows.map((r) => ({
        day: str(r.day),
        critical: num(r.critical),
        high: num(r.high),
        medium: num(r.medium),
        low: num(r.low),
        nit: num(r.nit),
      })),
      category_breakdown,
      top_files: topFileRows.map((r) => ({
        file: str(r.file),
        count: num(r.count),
      })),
      accept_rate_trend: acceptRows.map((r) => ({
        day: str(r.day),
        rate: num(r.rate_pct),
      })),
    };
  } catch (e) {
    console.warn(
      "[queries] getDashboardStats falling back to mock:",
      (e as Error).message
    );
    return mockStats;
  }
}

// ──────── Helper: is the DB live and populated? ────────
export async function dataSource(): Promise<"live" | "mock"> {
  try {
    const rows = await query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM findings"
    );
    if (rows && rows.length > 0 && parseInt(rows[0].count, 10) > 0) {
      return "live";
    }
    return "mock";
  } catch {
    return "mock";
  }
}
