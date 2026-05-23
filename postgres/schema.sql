-- ProITBridge ReviewAI — Postgres schema
--
-- Apply with:
--   psql "$DATABASE_URL" < postgres/schema.sql
--
-- This is the single source of truth for the bot's persistent state.
-- The n8n workflows write to it; the Next.js dashboard reads from it.

BEGIN;

------------------------------------------------------------------------------
-- prs: one row per GitHub pull request the bot has seen
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prs (
  id              SERIAL PRIMARY KEY,
  github_pr_id    BIGINT UNIQUE NOT NULL,
  repo            TEXT NOT NULL,                 -- "owner/name"
  pr_number       INTEGER NOT NULL,
  title           TEXT NOT NULL,
  author          TEXT NOT NULL,
  head_sha        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open',  -- open | merged | closed
  total_findings  INTEGER NOT NULL DEFAULT 0,
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  merged_at       TIMESTAMPTZ,
  UNIQUE(repo, pr_number)
);

CREATE INDEX IF NOT EXISTS idx_prs_status ON prs(status);
CREATE INDEX IF NOT EXISTS idx_prs_reviewed ON prs(reviewed_at DESC);

------------------------------------------------------------------------------
-- findings: one row per inline review comment the bot has posted
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS findings (
  id                SERIAL PRIMARY KEY,
  pr_id             INTEGER NOT NULL REFERENCES prs(id) ON DELETE CASCADE,
  file_path         TEXT NOT NULL,
  line_number       INTEGER NOT NULL,
  severity          TEXT NOT NULL,    -- critical | high | medium | low | nit
  category          TEXT NOT NULL,    -- bug | security | performance | test | style | docs
  message           TEXT NOT NULL,
  suggestion        TEXT,
  rationale         TEXT,
  github_comment_id BIGINT,           -- the inline comment ID on GitHub
  resolved          BOOLEAN NOT NULL DEFAULT FALSE,
  accepted          BOOLEAN,          -- did the dev commit the bot's suggestion?
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ,
  CONSTRAINT severity_valid CHECK (severity IN
    ('critical','high','medium','low','nit')),
  CONSTRAINT category_valid CHECK (category IN
    ('bug','security','performance','test','style','docs'))
);

CREATE INDEX IF NOT EXISTS idx_findings_pr ON findings(pr_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_category ON findings(category);
CREATE INDEX IF NOT EXISTS idx_findings_created ON findings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_unresolved
  ON findings(pr_id) WHERE resolved = FALSE;

------------------------------------------------------------------------------
-- resolutions: audit log for every "marked resolved" event
-- (separate from findings.resolved so we can rebuild the timeline)
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resolutions (
  id            SERIAL PRIMARY KEY,
  finding_id    INTEGER NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  resolved_sha  TEXT NOT NULL,
  resolved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  detected_by   TEXT NOT NULL DEFAULT 'auto'   -- auto | human
);

CREATE INDEX IF NOT EXISTS idx_resolutions_finding ON resolutions(finding_id);

------------------------------------------------------------------------------
-- repo_config: per-repository thresholds and feature flags
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_config (
  repo                  TEXT PRIMARY KEY,
  min_severity_to_post  TEXT NOT NULL DEFAULT 'medium',
  max_findings_per_pr   INTEGER NOT NULL DEFAULT 5,
  enabled               BOOLEAN NOT NULL DEFAULT TRUE,
  notify_slack          BOOLEAN NOT NULL DEFAULT FALSE,
  slack_webhook_url     TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT min_sev_valid CHECK (min_severity_to_post IN
    ('critical','high','medium','low','nit'))
);

------------------------------------------------------------------------------
-- Analytics views
------------------------------------------------------------------------------

-- Daily accept rate, used by the analytics page line chart
CREATE OR REPLACE VIEW v_accept_rate AS
SELECT
  DATE_TRUNC('day', created_at)::DATE AS day,
  COUNT(*) FILTER (WHERE accepted = TRUE) AS accepted,
  COUNT(*) FILTER (WHERE accepted = FALSE) AS rejected,
  COUNT(*) AS total,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE accepted = TRUE)
    / NULLIF(COUNT(*) FILTER (WHERE accepted IS NOT NULL), 0)
  , 1) AS rate_pct
FROM findings
WHERE accepted IS NOT NULL
GROUP BY day
ORDER BY day DESC;

-- Daily severity counts, used by the stacked area chart
CREATE OR REPLACE VIEW v_severity_trend AS
SELECT
  DATE_TRUNC('day', created_at)::DATE AS day,
  COUNT(*) FILTER (WHERE severity = 'critical') AS critical,
  COUNT(*) FILTER (WHERE severity = 'high') AS high,
  COUNT(*) FILTER (WHERE severity = 'medium') AS medium,
  COUNT(*) FILTER (WHERE severity = 'low') AS low,
  COUNT(*) FILTER (WHERE severity = 'nit') AS nit,
  COUNT(*) AS total
FROM findings
GROUP BY day
ORDER BY day DESC;

-- Top files by finding count (last 30 days)
CREATE OR REPLACE VIEW v_top_files AS
SELECT
  file_path AS file,
  COUNT(*) AS count
FROM findings
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY file_path
ORDER BY count DESC
LIMIT 10;

-- Category breakdown for the donut (last 7 days)
CREATE OR REPLACE VIEW v_category_breakdown AS
SELECT
  category,
  COUNT(*) AS count
FROM findings
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY category;

COMMIT;
