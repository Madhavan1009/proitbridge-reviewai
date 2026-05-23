export type Severity = "critical" | "high" | "medium" | "low" | "nit";

export type Category =
  | "bug"
  | "security"
  | "performance"
  | "test"
  | "style"
  | "docs";

export type PRStatus = "open" | "merged" | "closed";

export type ReviewStatus =
  | "queued"
  | "reviewing"
  | "completed"
  | "resolved"
  | "changes-requested";

export interface Finding {
  id: number;
  pr_id: number;
  file_path: string;
  line_number: number;
  severity: Severity;
  category: Category;
  message: string;
  suggestion: string | null;
  rationale: string | null;
  github_comment_id: number | null;
  resolved: boolean;
  accepted: boolean | null;
  created_at: string;
  resolved_at: string | null;
}

export interface PullRequest {
  id: number;
  github_pr_id: number;
  repo: string;
  pr_number: number;
  title: string;
  author: string;
  head_sha: string;
  status: PRStatus;
  total_findings: number;
  reviewed_at: string;
  merged_at: string | null;
  findings_by_severity?: Record<Severity, number>;
}

export interface DashboardStats {
  prs_reviewed_week: number;
  findings_posted_week: number;
  suggestions_accepted_week: number;
  accept_rate_pct: number;
  recent_prs: PullRequest[];
  severity_trend: Array<{
    day: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    nit: number;
  }>;
  category_breakdown: Record<Category, number>;
  top_files: Array<{ file: string; count: number }>;
  accept_rate_trend: Array<{ day: string; rate: number }>;
}

export interface RepoConfig {
  repo: string;
  min_severity_to_post: Severity;
  max_findings_per_pr: number;
  enabled: boolean;
}
