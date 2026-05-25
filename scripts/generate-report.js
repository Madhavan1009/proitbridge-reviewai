#!/usr/bin/env node
/**
 * Generate the ProITBridge ReviewAI project report as a Word document.
 *
 * Usage:
 *   node scripts/generate-report.js
 *
 * Output:
 *   F:\ProITBridge\AI_Code_Automation\ProITBridge_ReviewAI_Project_Report.docx
 */

const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  LevelFormat,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageBreak,
  PageNumber,
  TabStopType,
  TabStopPosition,
  TableOfContents,
  PositionalTab,
  PositionalTabAlignment,
  PositionalTabRelativeTo,
  PositionalTabLeader,
} = require("docx");

// ──────────────────────────── helpers ────────────────────────────
const NAVY = "0B1D3F";
const BRAND = "046BD2";
const CYAN = "22D3EE";
const SLATE_50 = "F8FAFC";
const SLATE_100 = "F1F5F9";
const SLATE_200 = "E2E8F0";
const SLATE_700 = "334155";
const SLATE_900 = "0F172A";

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const borders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
};

// 1-inch margins on US Letter: 12240 - 2880 = 9360 DXA content width.
const CONTENT_WIDTH = 9360;

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun(text)],
  });
const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun(text)],
  });
const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun(text)],
  });
const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, ...opts })],
  });
const bullet = (text) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun(text)],
  });
const numItem = (text) =>
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [new TextRun(text)],
  });
const code = (text) =>
  new Paragraph({
    spacing: { before: 60, after: 60 },
    shading: { fill: SLATE_50, type: ShadingType.CLEAR },
    children: [
      new TextRun({
        text,
        font: "Consolas",
        size: 18, // 9pt
        color: SLATE_900,
      }),
    ],
  });
const blank = () => new Paragraph({ children: [new TextRun("")] });

function tableHead(label) {
  return new TableCell({
    borders,
    width: { size: 0, type: WidthType.DXA },
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: label, bold: true, color: "FFFFFF", size: 20 }),
        ],
      }),
    ],
  });
}

function tableHeadBrand(label) {
  return new TableCell({
    borders,
    width: { size: 0, type: WidthType.DXA },
    shading: { fill: BRAND, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: label, bold: true, color: "FFFFFF", size: 20 }),
        ],
      }),
    ],
  });
}

function tableCell(text, opts = {}) {
  const isBold = !!opts.bold;
  const isCode = !!opts.code;
  return new TableCell({
    borders,
    width: { size: 0, type: WidthType.DXA },
    shading: opts.fill
      ? { fill: opts.fill, type: ShadingType.CLEAR }
      : undefined,
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isBold,
            font: isCode ? "Consolas" : "Arial",
            size: isCode ? 18 : 20,
            color: opts.color || SLATE_900,
          }),
        ],
      }),
    ],
  });
}

// Build a table given header row + data rows; columnWidths sum to CONTENT_WIDTH.
function buildTable(headerRow, dataRows, columnWidths) {
  const sum = columnWidths.reduce((a, b) => a + b, 0);
  if (sum !== CONTENT_WIDTH) {
    throw new Error(
      `columnWidths must sum to ${CONTENT_WIDTH} (got ${sum})`
    );
  }
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headerRow.map((h, i) => {
          const cell = h.brand ? tableHeadBrand(h.label) : tableHead(h.label);
          cell.options.width = { size: columnWidths[i], type: WidthType.DXA };
          return cell;
        }),
      }),
      ...dataRows.map(
        (row) =>
          new TableRow({
            children: row.map((cellSpec, i) => {
              const c = tableCell(cellSpec.text, cellSpec);
              c.options.width = {
                size: columnWidths[i],
                type: WidthType.DXA,
              };
              return c;
            }),
          })
      ),
    ],
  });
}

// ───────────────────────────── content ─────────────────────────────

const content = [];

// ─── COVER PAGE ───
content.push(
  new Paragraph({ spacing: { before: 2400 }, children: [new TextRun("")] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "ProITBridge",
        font: "Arial",
        size: 80,
        bold: true,
        color: BRAND,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80 },
    children: [
      new TextRun({
        text: "ReviewAI",
        font: "Arial",
        size: 60,
        bold: true,
        color: CYAN,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({
        text: "AI Code Review Bot for GitHub Pull Requests",
        font: "Arial",
        size: 32,
        color: SLATE_700,
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600 },
    children: [
      new TextRun({
        text: "PROJECT REPORT",
        font: "Arial",
        size: 24,
        bold: true,
        color: SLATE_700,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100 },
    children: [
      new TextRun({
        text: "End-to-End Architecture, Workflow, Deployment & Operations",
        font: "Arial",
        size: 20,
        color: SLATE_700,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400 },
    children: [
      new TextRun({
        text: "Prepared by ProITBridge Engineering",
        size: 22,
        color: SLATE_700,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80 },
    children: [
      new TextRun({
        text: "Strive For Better Future",
        size: 22,
        italics: true,
        color: BRAND,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({
        text: new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        size: 20,
        color: SLATE_700,
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ─── TABLE OF CONTENTS ───
content.push(
  h1("Table of Contents"),
  new TableOfContents("Contents", {
    hyperlink: true,
    headingStyleRange: "1-2",
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ─── 1. EXECUTIVE SUMMARY ───
content.push(
  h1("1. Executive Summary"),
  p(
    "ProITBridge ReviewAI is a self-hosted, open-source AI-powered code review bot for GitHub pull requests. The bot watches a configured GitHub organization, automatically reviews every pull request opened against any of its watched repositories, and posts inline review comments with severity ratings, categorical classifications, and one-click code suggestions — all within ten seconds of PR creation."
  ),
  p(
    "The system replaces the manual first-pass code review burden that senior engineers typically carry, freeing them to focus on architecture-level reviews while the bot handles consistency checks, security gates, and pattern enforcement. Every PR receives the same standard of scrutiny, every time."
  ),
  p(
    "Built end-to-end on a one hundred percent free-tier infrastructure stack (Railway, Vercel, GitHub Actions, Anthropic API free credits), ReviewAI is the open-source alternative to commercial offerings like CodeRabbit (priced at $24 per developer per month) and integrated IDE review tools. The total operational cost is approximately one cent per pull request reviewed, derived solely from Claude API inference costs."
  ),
  p(
    "This report provides a comprehensive end-to-end documentation of the project covering the problem statement, target users, system architecture, component breakdown, complete workflow, file-level repository structure, deployment guide, end-to-end sample execution, and future roadmap."
  )
);

// ─── 2. THE PROBLEM ───
content.push(
  h1("2. The Problem ReviewAI Solves"),
  h2("2.1 Why Code Review Is Broken at Most Teams"),
  p(
    "Code review is universally accepted as critical engineering practice yet universally under-resourced. Across the industry, several systemic failure modes recur:"
  ),
  bullet(
    "Pull requests sit unreviewed for two to five days because senior engineers are pulled into more urgent work."
  ),
  bullet(
    "Junior engineers miss security vulnerabilities, performance traps, and concurrency bugs that experienced reviewers spot in seconds."
  ),
  bullet(
    "Senior engineers spend four to six hours per week on first-pass code review work that is largely mechanical pattern-matching, taking time away from architecture, mentoring, and high-leverage tasks."
  ),
  bullet(
    "Review quality varies wildly between team members. The same code change can receive a thorough review from one engineer and a perfunctory LGTM from another."
  ),
  bullet(
    "Many reviews are approved with a 'looks good to me' comment that adds zero value and provides no audit trail."
  ),
  bullet(
    "Release notes and changelogs are written manually after each release, often skipped under deadline pressure, leading to opaque release histories."
  ),
  h2("2.2 The ReviewAI Solution"),
  p(
    "ReviewAI addresses every one of these failure modes by automating the first-pass review using Anthropic's Claude language model. The bot:"
  ),
  bullet(
    "Reviews every PR within ten seconds of opening, eliminating the multi-day backlog."
  ),
  bullet(
    "Catches SQL injection, hardcoded secrets, race conditions, null dereferences, missing tests, and performance anti-patterns with consistent accuracy."
  ),
  bullet(
    "Handles the mechanical first pass entirely, so senior engineers only see PRs that have already been triaged."
  ),
  bullet(
    "Applies identical review standards to every PR from every author across every repository."
  ),
  bullet(
    "Generates structured findings with line number, severity tier, category, suggested fix, and rationale for every issue."
  ),
  bullet(
    "Auto-generates one-line changelog entries when PRs merge and produces a weekly review-quality digest for engineering management."
  )
);

// ─── 3. BEFORE / AFTER ───
content.push(
  h1("3. Before vs After ReviewAI"),
  p(
    "The following comparison illustrates the operational impact of deploying ReviewAI across a typical engineering organization."
  ),
  blank(),
  buildTable(
    [
      { label: "Before ReviewAI" },
      { label: "After ReviewAI", brand: true },
    ],
    [
      [
        { text: "PRs sit unreviewed for 2 to 5 days" },
        { text: "AI review posted within 10 seconds of PR open" },
      ],
      [
        { text: "Junior developers miss security and performance issues" },
        {
          text: "Bot flags SQL injection, leaked secrets, race conditions, and slow paths automatically",
        },
      ],
      [
        { text: "Senior engineers burn 4-6 hours per week on first-pass review" },
        { text: "Bot handles the first pass; humans focus on architecture" },
      ],
      [
        { text: "Inconsistent review quality across team members" },
        { text: "Same standards applied to every PR, every time" },
      ],
      [
        { text: "'Looks good to me' reviews that miss real bugs" },
        {
          text: "Every finding has line number, severity, category, suggestion, and rationale",
        },
      ],
      [
        { text: "Manual changelog writing on every release" },
        { text: "Auto-generated from PR titles and AI summaries" },
      ],
      [
        { text: "No review analytics or accept-rate tracking" },
        {
          text: "Full Postgres-backed analytics: severity trends, accept rate, most-flagged files",
        },
      ],
    ],
    [4680, 4680]
  ),
  blank()
);

// ─── 4. TARGET USERS ───
content.push(
  h1("4. Target Users and Use Cases"),
  h2("4.1 Who Should Use ReviewAI"),
  bullet(
    "Engineering managers who want to reclaim senior-engineer hours currently spent on first-pass review."
  ),
  bullet(
    "Lead developers and tech leads responsible for code quality across multiple repositories."
  ),
  bullet(
    "Security engineers seeking a consistent automated gate against common vulnerability classes."
  ),
  bullet(
    "Startup CTOs operating with small teams who need leverage to maintain code quality at scale."
  ),
  bullet(
    "Open-source maintainers who want to triage incoming contributions without overwhelming volunteer reviewer time."
  ),
  bullet(
    "Enterprise platform teams looking for a customizable, self-hosted alternative to commercial code-review services."
  ),
  bullet(
    "Educational institutions teaching software engineering who want to give students real-time review feedback on assignments."
  ),
  h2("4.2 Use Cases by Industry"),
  buildTable(
    [{ label: "Industry" }, { label: "Primary Use Case" }],
    [
      [
        { text: "Fintech and Payments", bold: true },
        {
          text: "Catch money-handling bugs (missing transactions, validation gaps) and security issues (SQL injection, hardcoded keys) before they reach production",
        },
      ],
      [
        { text: "Healthcare and HIPAA", bold: true },
        {
          text: "Enforce data-access patterns, flag PII leaks, ensure audit logging on every patient record touch",
        },
      ],
      [
        { text: "SaaS and Web Services", bold: true },
        {
          text: "Maintain code quality across a fast-moving codebase with frequent feature deploys",
        },
      ],
      [
        { text: "E-commerce", bold: true },
        {
          text: "Validate cart and checkout flows, prevent race conditions on inventory, flag perf issues before peak traffic",
        },
      ],
      [
        { text: "Education Tech", bold: true },
        {
          text: "Give students instant feedback on coding assignments without overloading instructors",
        },
      ],
      [
        { text: "Open Source", bold: true },
        {
          text: "Triage incoming PRs so maintainer time is spent on architectural decisions, not pattern-matching",
        },
      ],
    ],
    [2600, 6760]
  ),
  blank()
);

// ─── 5. TECH STACK ───
content.push(
  h1("5. Technology Stack"),
  p(
    "ReviewAI is intentionally built on the simplest possible production stack. There is no FastAPI middleman, no Kubernetes, no microservices, no message queues. Each component has a single clear responsibility."
  ),
  buildTable(
    [
      { label: "Layer" },
      { label: "Technology" },
      { label: "Purpose" },
      { label: "Free Tier" },
    ],
    [
      [
        { text: "Orchestration", bold: true },
        { text: "n8n self-hosted (Docker)" },
        { text: "Webhook handler, workflow engine" },
        { text: "Yes (Railway)" },
      ],
      [
        { text: "Reviewer LLM", bold: true },
        { text: "Anthropic Claude 4.5" },
        { text: "Code reasoning, finding generation" },
        { text: "$5 starter credit" },
      ],
      [
        { text: "Frontend", bold: true },
        { text: "Next.js 14 + Tailwind CSS" },
        { text: "Dashboard, landing page, docs" },
        { text: "Yes (Vercel)" },
      ],
      [
        { text: "Database", bold: true },
        { text: "PostgreSQL 16" },
        { text: "Findings persistence, analytics" },
        { text: "Yes (Railway)" },
      ],
      [
        { text: "Charts", bold: true },
        { text: "Recharts + Framer Motion" },
        { text: "Analytics visualizations" },
        { text: "Yes (open source)" },
      ],
      [
        { text: "Workflow Visualizer", bold: true },
        { text: "React Flow" },
        { text: "Pipeline diagram on landing page" },
        { text: "Yes (open source)" },
      ],
      [
        { text: "Source Hosting", bold: true },
        { text: "GitHub" },
        { text: "Source code, PR webhooks" },
        { text: "Yes" },
      ],
      [
        { text: "Scheduling", bold: true },
        { text: "GitHub Actions cron" },
        { text: "Weekly digest trigger" },
        { text: "Yes" },
      ],
    ],
    [1900, 2400, 3460, 1600]
  ),
  blank(),
  p(
    "Total monthly cost on the free tier configuration: $0 for infrastructure plus approximately $0.01 per pull request reviewed (Claude inference cost on the Haiku model)."
  )
);

// ─── 6. ARCHITECTURE ───
content.push(
  h1("6. System Architecture"),
  h2("6.1 High-Level Architecture Diagram"),
  p(
    "The following diagram shows the full system flow from a GitHub pull request event through to inline comments, persistent storage, and dashboard visualization."
  ),
  code(`                      GitHub Pull Request opens
                                 │
                                 ▼
                  ┌──────────────────────────────────┐
                  │  n8n on Railway (Docker)         │
                  │  Webhook: /webhook/pr-review     │
                  │                                  │
                  │  Workflow steps:                 │
                  │  1. Respond 200 (fast ack)       │
                  │  2. Verify HMAC signature        │
                  │  3. Filter to opened action      │
                  │  4. Extract PR fields            │
                  │  5. Upsert prs row in Postgres   │
                  │  6. GET PR files via Octokit     │
                  │  7. Filter generated files       │
                  │  8. Loop per source file:        │
                  │     - GET full file content      │
                  │     - Decode base64 + build body │
                  │     - POST to Anthropic Claude   │
                  │     - Parse JSON findings        │
                  │     - Filter by severity         │
                  │     - Split into individual rows │
                  │     - POST inline comment        │
                  │     - INSERT finding to Postgres │
                  │  9. After loop:                  │
                  │     - Count findings             │
                  │     - POST summary comment       │
                  └────────┬──────────────┬──────────┘
                           │              │
                           ▼              ▼
              ┌────────────────┐   ┌──────────────────┐
              │ Anthropic API  │   │ Postgres (Railway)│
              │ Claude 4.5     │   │ - prs            │
              │ Haiku / Sonnet │   │ - findings       │
              └────────────────┘   │ - resolutions    │
                                   │ - repo_config    │
                                   └──────────┬───────┘
                                              │
                                              ▼
                            ┌────────────────────────────────┐
                            │ Next.js dashboard (Vercel)     │
                            │                                │
                            │ Public:                        │
                            │  / (landing page)              │
                            │  /how-it-works                 │
                            │  /pricing                      │
                            │  /docs                         │
                            │                                │
                            │ Authenticated:                 │
                            │  /dashboard (live PR queue)    │
                            │  /findings (table)             │
                            │  /analytics (charts)           │
                            │  /settings (per-repo config)   │
                            └────────────────────────────────┘`),
  h2("6.2 Component Responsibilities"),
  buildTable(
    [{ label: "Component" }, { label: "Responsibility" }],
    [
      [
        { text: "GitHub Webhook", bold: true },
        {
          text: "Fires pull_request.opened events to n8n; signs payloads with HMAC-SHA256 for verification",
        },
      ],
      [
        { text: "n8n Orchestrator", bold: true },
        {
          text: "Receives webhook, verifies signature, fetches PR files, calls Claude per file, posts inline comments back to GitHub, writes findings to Postgres",
        },
      ],
      [
        { text: "Anthropic Claude API", bold: true },
        {
          text: "Receives file content + diff, returns structured JSON findings with line, severity, category, message, suggestion, rationale",
        },
      ],
      [
        { text: "PostgreSQL", bold: true },
        {
          text: "Persists prs (one row per PR seen), findings (one row per inline comment), resolutions (audit log), repo_config (per-repo thresholds)",
        },
      ],
      [
        { text: "Next.js Dashboard", bold: true },
        {
          text: "Reads Postgres via server components, renders PR queue, findings table, analytics charts; falls back to mock fixtures when DB is empty",
        },
      ],
      [
        { text: "GitHub API (return)", bold: true },
        {
          text: "Receives inline review comments and summary issue comments posted by n8n",
        },
      ],
    ],
    [2400, 6960]
  ),
  blank()
);

// ─── 7. END-TO-END WORKFLOW ───
content.push(
  h1("7. End-to-End Workflow"),
  h2("7.1 Mode 1: Event-driven PR Review"),
  p(
    "The primary mode of operation. A developer opens a pull request on a watched repository, and within ten seconds the bot has posted inline review comments and a summary comment."
  ),
  numItem("Developer opens a PR on Madhavan1009/proitbridge-reviewai-demo."),
  numItem(
    "GitHub fires a pull_request webhook with action 'opened' to the n8n webhook URL, signed with X-Hub-Signature-256."
  ),
  numItem(
    "n8n's Respond 200 node returns HTTP 200 immediately so GitHub does not retry."
  ),
  numItem(
    "The Verify HMAC code node recomputes the signature using GITHUB_WEBHOOK_SECRET and rejects if it does not match."
  ),
  numItem(
    "The IF node filters to only 'opened' and 'ready_for_review' actions; other actions short-circuit."
  ),
  numItem(
    "Extract PR Fields lifts owner, repo, pr_number, title, author, head_sha, and github_pr_id into structured fields."
  ),
  numItem(
    "Upsert PR Row writes (or updates) the prs row in Postgres and returns the auto-generated id."
  ),
  numItem(
    "Get PR Files calls the GitHub Files API to list every file changed in the PR with its patch."
  ),
  numItem(
    "Filter Files drops generated artifacts (package-lock.json, *.min.js, dist/, build/, vendor/) and files with more than 500 changed lines."
  ),
  numItem(
    "Split Files iterates each remaining file. For each iteration, the workflow continues through the loop branch."
  ),
  numItem(
    "Get File Content fetches the full file body via the GitHub Contents API."
  ),
  numItem(
    "Decode Content unwraps base64 and assembles the full Claude request body (model, max_tokens, system prompt, user message)."
  ),
  numItem(
    "Call Claude posts the body to https://api.anthropic.com/v1/messages with the Header Auth credential."
  ),
  numItem(
    "Parse Findings extracts the JSON array from Claude's text response and enriches each finding with file path, pr_db_id, owner, repo, pr_number, head_sha, and a pre-built commentBody."
  ),
  numItem(
    "Filter By Severity drops nit/low findings (default threshold is medium) and caps at five findings per file."
  ),
  numItem(
    "Split Findings emits one item per finding for downstream processing."
  ),
  numItem(
    "Post Inline Comment posts a review comment to the GitHub PR using the pre-built commentBody, with severity emoji, suggestion block, and rationale."
  ),
  numItem(
    "Insert Finding writes the finding to Postgres with a reference to the GitHub comment ID."
  ),
  numItem(
    "After all files are processed, Count Findings queries the totals by severity for this PR."
  ),
  numItem(
    "Post Summary Comment posts a final issue comment to the PR with a markdown table of severity counts and a link to the dashboard."
  ),
  p(
    "Total wall-clock latency for a typical three-file PR is approximately eight to fifteen seconds end-to-end, dominated by the Claude API calls."
  ),
  h2("7.2 Mode 2: Re-review on Push (Planned)"),
  p(
    "When a developer pushes additional commits to an open PR, GitHub fires pull_request.synchronize. The pr-resync workflow (spec in n8n/pr-resync.md) is designed to:"
  ),
  bullet("Compare the new diff against existing findings in Postgres."),
  bullet(
    "For each finding still visible in the diff, ask Claude 'is this still an issue?' on the new code."
  ),
  bullet(
    "If a finding is resolved, post a '✅ Resolved in <sha>' reply to the original comment and mark resolved in Postgres."
  ),
  bullet(
    "Update the summary comment to reflect the new total."
  ),
  h2("7.3 Mode 3: Changelog on Merge (Planned)"),
  p(
    "When a PR is merged, GitHub fires pull_request.closed with merged=true. The pr-merged workflow generates a one-line changelog entry via Claude and posts it to Slack #releases (or sends an email) plus updates the prs row to status='merged'."
  ),
  h2("7.4 Mode 4: Weekly Review-Quality Digest"),
  p(
    "Every Monday at 09:00 IST, a GitHub Actions cron fires an HMAC-signed webhook to n8n. The weekly-digest workflow queries Postgres for the past 7 days of findings, computes accept rate and severity distribution, sends the aggregate to Claude with a digest-writing prompt, and emails the resulting 200-word summary to the engineering manager."
  )
);

// ─── 8. REPOSITORY STRUCTURE ───
content.push(
  h1("8. Repository Structure"),
  p(
    "The project is organized as a single repository containing all infrastructure code, frontend source, backend workflow specifications, database schema, and supporting documentation."
  ),
  code(`proitbridge-reviewai/
├── README.md                      Top-level overview with deploy badges
├── DEPLOYMENT.md                  Step-by-step Railway + Vercel + GitHub guide
├── PROJECT_BRIEF.md               Original product brief
├── .github/workflows/
│   └── weekly-digest.yml          Monday 09:00 IST GitHub Actions cron
├── n8n/                           Workflow specifications + JSON exports
│   ├── README.md                  Overview of all 4 workflows
│   ├── pr-review.md               Main reviewer spec (16 nodes)
│   ├── pr-review.json             Importable n8n workflow JSON (19 nodes)
│   ├── pr-resync.md               Re-review on push spec
│   ├── pr-merged.md               Merge-changelog spec
│   └── weekly-digest.md           Weekly digest spec
├── frontend/                      Next.js 14 + Tailwind dashboard
│   ├── app/                       App router pages
│   │   ├── layout.tsx             Root layout, brand metadata
│   │   ├── page.tsx               Landing page composition
│   │   ├── how-it-works/page.tsx  Pipeline deep-dive
│   │   ├── pricing/page.tsx       3-tier mock pricing
│   │   ├── docs/page.tsx          Setup guide for forkers
│   │   └── dashboard/
│   │       ├── layout.tsx         AppShell wrapper
│   │       ├── page.tsx           Live PR queue (server component)
│   │       ├── findings/page.tsx  All findings table
│   │       ├── analytics/page.tsx Charts + weekly-digest preview
│   │       └── settings/page.tsx  Per-repo configuration
│   ├── components/
│   │   ├── ui/                    Section, StatCard, SeverityBadge, etc.
│   │   ├── shell/                 Sidebar, Topbar, AppShell, MarketingNav
│   │   ├── landing/               Hero, DemoSection, BeforeAfter, etc.
│   │   ├── dashboard/             PRRow, FindingsClient, charts, AutoRefreshChip
│   │   └── workflow/              WorkflowFlow (React Flow)
│   ├── lib/
│   │   ├── db.ts                  Postgres connection pool
│   │   ├── queries.ts             Dashboard queries with mock fallback
│   │   ├── types.ts               Shared TypeScript types
│   │   ├── utils.ts               cn, timeAgo, severity helpers
│   │   └── mockData.ts            Bundled demo fixtures
│   ├── public/
│   │   └── proitbridge-logo.png   Brand mark
│   ├── package.json
│   ├── tailwind.config.ts         Brand palette
│   ├── tsconfig.json
│   ├── next.config.js
│   └── vercel.json
├── prompts/
│   ├── reviewer.txt               Claude system prompt for code review
│   └── digest.txt                 Claude prompt for weekly digest
├── postgres/
│   └── schema.sql                 prs, findings, resolutions, repo_config + 4 views
├── demo-bad-prs/                  Scripted bad PR fixtures for video
│   ├── README.md
│   ├── 01-sql-injection.md
│   ├── 02-missing-tests.md
│   ├── 03-perf-issue.md
│   ├── 04-hardcoded-secret.md
│   └── 05-race-condition.md
└── scripts/                       Operations + maintenance scripts
    ├── apply-schema.js            Apply postgres/schema.sql
    ├── seed-demo-data.js          Insert 15 demo PRs + 29 findings
    ├── validate-workflow.js       Pre-import shape-check for n8n JSON
    └── generate-report.js         This document generator`)
);

// ─── 9. DATABASE SCHEMA ───
content.push(
  h1("9. Database Schema"),
  p(
    "Postgres provides the persistent state for both the bot (write side) and the dashboard (read side). The schema is intentionally minimal: four tables and four views, designed for both transactional INSERT throughput and analytical aggregations."
  ),
  h2("9.1 prs Table"),
  p(
    "One row per pull request the bot has ever seen. Uniquely keyed by (repo, pr_number) for idempotent upserts when a PR is re-opened or pushed."
  ),
  code(`CREATE TABLE prs (
  id              SERIAL PRIMARY KEY,
  github_pr_id    BIGINT UNIQUE NOT NULL,
  repo            TEXT NOT NULL,
  pr_number       INTEGER NOT NULL,
  title           TEXT NOT NULL,
  author          TEXT NOT NULL,
  head_sha        TEXT NOT NULL,
  status          TEXT DEFAULT 'open',
  total_findings  INTEGER DEFAULT 0,
  reviewed_at     TIMESTAMPTZ DEFAULT NOW(),
  merged_at       TIMESTAMPTZ,
  UNIQUE(repo, pr_number)
);`),
  h2("9.2 findings Table"),
  p(
    "One row per inline review comment the bot has posted. Foreign-keyed to prs with ON DELETE CASCADE so deleting a PR removes its findings."
  ),
  code(`CREATE TABLE findings (
  id                SERIAL PRIMARY KEY,
  pr_id             INTEGER REFERENCES prs(id) ON DELETE CASCADE,
  file_path         TEXT NOT NULL,
  line_number       INTEGER NOT NULL,
  severity          TEXT NOT NULL,   -- critical|high|medium|low|nit
  category          TEXT NOT NULL,   -- bug|security|performance|test|style|docs
  message           TEXT NOT NULL,
  suggestion        TEXT,
  rationale         TEXT,
  github_comment_id BIGINT,
  resolved          BOOLEAN DEFAULT FALSE,
  accepted          BOOLEAN,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);`),
  h2("9.3 Analytics Views"),
  p(
    "Four views power the dashboard analytics page without requiring complex client-side aggregation."
  ),
  bullet(
    "v_accept_rate — daily accepted/rejected/total findings with computed rate_pct."
  ),
  bullet(
    "v_severity_trend — daily severity counts (critical, high, medium, low, nit, total)."
  ),
  bullet(
    "v_top_files — top 10 most-flagged files in the last 30 days."
  ),
  bullet(
    "v_category_breakdown — finding counts per category in the last 7 days."
  )
);

// ─── 10. FRONTEND DASHBOARD ───
content.push(
  h1("10. Frontend Dashboard"),
  p(
    "The Next.js 14 dashboard provides both a public marketing surface (landing, how-it-works, pricing, docs) and an authenticated operations dashboard for the bot itself. The marketing pages use a dark navy hero theme; the dashboard pages use a clean light theme with white cards on a slate-50 background."
  ),
  h2("10.1 Public Marketing Pages"),
  buildTable(
    [{ label: "Page" }, { label: "Purpose" }],
    [
      [
        { text: "/", code: true },
        {
          text: "Landing page with hero, animated PR mock, React Flow architecture diagram, before/after comparison, pricing tiers, tech stack band, and CTA footer",
        },
      ],
      [
        { text: "/how-it-works", code: true },
        {
          text: "Deep dive into the pipeline with code samples for each of the 5 stages (webhook → HMAC → fetch files → Claude review → inline comments)",
        },
      ],
      [
        { text: "/pricing", code: true },
        {
          text: "Three-tier pricing (Self-hosted, Cloud Starter, Cloud Team) plus FAQ covering common questions",
        },
      ],
      [
        { text: "/docs", code: true },
        {
          text: "Six-step setup guide for forkers: clone repo, provision Postgres, deploy n8n, import workflows, configure GitHub webhook, deploy dashboard",
        },
      ],
    ],
    [2400, 6960]
  ),
  blank(),
  h2("10.2 Operations Dashboard"),
  buildTable(
    [{ label: "Page" }, { label: "Purpose" }],
    [
      [
        { text: "/dashboard", code: true },
        {
          text: "Live PR queue with stat strip (PRs reviewed week, findings posted, suggestions accepted, accept rate), filter pills, and expandable PR rows showing inline findings",
        },
      ],
      [
        { text: "/dashboard/findings", code: true },
        {
          text: "Full filterable table of every finding ever posted, with search, severity filter, category filter, and direct GitHub links",
        },
      ],
      [
        { text: "/dashboard/analytics", code: true },
        {
          text: "Four charts (severity trend stacked area, category donut, accept rate line, top files bar) plus a weekly-digest preview",
        },
      ],
      [
        { text: "/dashboard/settings", code: true },
        {
          text: "Per-repository configuration: enable/pause, min severity threshold, max findings per PR, plus secrets management and a one-click Open-n8n CTA",
        },
      ],
    ],
    [2400, 6960]
  ),
  blank(),
  h2("10.3 Live Data and Auto-Refresh"),
  p(
    "Each dashboard page is a Next.js server component that queries Postgres directly via lib/queries.ts on every request. A DataSourcePill in the page header indicates whether the data is live (green pulsing dot) or mock fallback (gray dot). An AutoRefreshChip ticks down a 15-second countdown and triggers router.refresh() to re-query Postgres without losing client state (filters, scroll position, expanded rows)."
  )
);

// ─── 11. DEPLOYMENT ───
content.push(
  h1("11. Deployment Guide"),
  p(
    "The full deployment from scratch takes approximately thirty minutes and requires only free-tier accounts on Railway, Vercel, GitHub, and Anthropic."
  ),
  h2("11.1 Prerequisites"),
  numItem("Free Railway account at railway.app (provides $5 monthly credit)."),
  numItem("Free Vercel account at vercel.com."),
  numItem(
    "Anthropic Console account at console.anthropic.com (provides $5 starter credit)."
  ),
  numItem("GitHub account with admin access to a repository to test against."),
  h2("11.2 Phase 1: Provision Postgres on Railway"),
  numItem(
    "Open railway.app → New Project → Provision PostgreSQL → wait for green active status."
  ),
  numItem(
    "Click the Postgres service → Variables tab → enable Public Networking → copy DATABASE_PUBLIC_URL."
  ),
  numItem(
    "Apply the schema: DATABASE_URL=\"<url>\" node scripts/apply-schema.js"
  ),
  numItem(
    "Verify: 4 tables (prs, findings, resolutions, repo_config) + 4 views are created."
  ),
  h2("11.3 Phase 2: Deploy n8n on Railway"),
  numItem(
    "Same project → New → Empty Service → Settings → Source → Docker Image: n8nio/n8n:latest."
  ),
  numItem(
    "Generate Domain in Networking section; copy the resulting URL."
  ),
  numItem(
    "Set Target Port to 5678 in the Networking section."
  ),
  numItem(
    "Add 16 environment variables in the Variables tab (N8N_HOST, WEBHOOK_URL, ANTHROPIC_API_KEY, GITHUB_WEBHOOK_SECRET, NODE_FUNCTION_ALLOW_BUILTIN=crypto, N8N_BLOCK_ENV_ACCESS_IN_NODE=false, etc — see DEPLOYMENT.md for the full list)."
  ),
  numItem(
    "Wait for active status, then open the URL and complete the n8n owner-account setup."
  ),
  numItem(
    "Create three credentials: Anthropic API (Header Auth with x-api-key), GitHub API (PAT with repo scope), Postgres (connection details)."
  ),
  numItem(
    "Import n8n/pr-review.json via the workflow list → Import from File."
  ),
  numItem(
    "Wire each red-dot node to its credential, Save, then Publish the workflow."
  ),
  h2("11.4 Phase 3: Configure GitHub Webhook"),
  numItem(
    "Create a sandbox repo (proitbridge-reviewai-demo) or pick an existing one."
  ),
  numItem(
    "Repository Settings → Webhooks → Add webhook."
  ),
  numItem(
    "Payload URL: https://<your-n8n>.up.railway.app/webhook/pr-review"
  ),
  numItem("Content type: application/json"),
  numItem(
    "Secret: paste the same value used for GITHUB_WEBHOOK_SECRET in n8n."
  ),
  numItem("Events: Let me select → Pull requests."),
  numItem(
    "Save; confirm a green checkmark next to the webhook indicating successful ping delivery."
  ),
  h2("11.5 Phase 4: Deploy Frontend to Vercel"),
  numItem(
    "Push the repository to GitHub if not already pushed."
  ),
  numItem(
    "Vercel dashboard → Add New → Project → import the repo."
  ),
  numItem("Set Root Directory to frontend/."),
  numItem(
    "Add environment variables DATABASE_URL (Railway Postgres URL) and NEXT_PUBLIC_N8N_URL (the n8n Railway URL)."
  ),
  numItem(
    "Deploy. After approximately two minutes the dashboard is live at https://<project>.vercel.app/dashboard."
  ),
  h2("11.6 Phase 5: GitHub Actions Weekly Digest Cron"),
  numItem(
    "Add repository secrets N8N_WEBHOOK_URL (the weekly-digest webhook) and N8N_WEBHOOK_SECRET (matching GITHUB_WEBHOOK_SECRET)."
  ),
  numItem(
    "The .github/workflows/weekly-digest.yml file is already in the repo; it fires Mondays at 09:00 IST."
  )
);

// ─── 12. SAMPLE END-TO-END RUN ───
content.push(
  h1("12. Sample End-to-End Execution"),
  p(
    "The following sample demonstrates a real end-to-end run of the bot against a deliberately broken pull request."
  ),
  h2("12.1 Step 1: Open a Bad PR"),
  p(
    "From the demo repository, create a branch containing a Python file with a SQL injection vulnerability."
  ),
  code(`cd /tmp/proitbridge-reviewai-demo
git checkout -b demo-sql-injection
mkdir -p src
cat > src/auth.py <<'PY'
"""User authentication and lookup utilities."""

import sqlite3

db = sqlite3.connect("app.db")


def get_user(user_id):
    """Look up a user by ID — used by the support dashboard."""
    query = f"SELECT * FROM users WHERE id={user_id}"
    return db.execute(query).fetchone()
PY
git add src/auth.py
git commit -m "Add user lookup endpoint for support team"
git push -u origin demo-sql-injection
gh pr create --fill`),
  h2("12.2 Step 2: Observe the Bot's Response (within 10 seconds)"),
  p(
    "GitHub's webhook delivers to n8n. The pipeline executes through all 19 nodes. The bot posts three inline comments on the PR."
  ),
  blank(),
  buildTable(
    [
      { label: "Comment #" },
      { label: "Line" },
      { label: "Severity" },
      { label: "Category" },
      { label: "Finding" },
    ],
    [
      [
        { text: "1", bold: true },
        { text: "10" },
        { text: "Critical", color: "DC2626", bold: true },
        { text: "Security" },
        {
          text: "SQL injection vulnerability: user_id is interpolated directly into the query string without parameterization",
        },
      ],
      [
        { text: "2", bold: true },
        { text: "14" },
        { text: "High", color: "EF4444", bold: true },
        { text: "Test" },
        {
          text: "No tests cover the new get_user code path; auth.py is a security boundary and needs coverage",
        },
      ],
      [
        { text: "3", bold: true },
        { text: "5" },
        { text: "Medium", color: "F59E0B", bold: true },
        { text: "Bug" },
        {
          text: "Module-level DB connection created without error handling or cleanup; unreachable DB at import time crashes the whole module",
        },
      ],
    ],
    [1100, 800, 1300, 1300, 4860]
  ),
  blank(),
  h2("12.3 Step 3: Bot Posts a Summary Comment"),
  p(
    "After the per-finding loop completes, the bot posts a single summary issue comment on the PR with a severity table."
  ),
  code(`## 🤖 ReviewAI · Review Summary

**3 findings** across this PR

| Severity | Count |
| --- | ---: |
| 🔴 Critical | 1 |
| 🟠 High | 1 |
| 🟡 Medium | 1 |
| 🟢 Low | 0 |
| ⚪ Nit | 0 |

See inline comments above for details. Push a fix and I'll re-review
automatically.

— ProITBridge ReviewAI · Strive For Better Future`),
  h2("12.4 Step 4: Findings Land in Postgres"),
  p(
    "All three findings are inserted into the findings table, linked to the prs row for this PR. The dashboard at /dashboard refreshes within 15 seconds and shows the new PR at the top of the queue."
  ),
  h2("12.5 Step 5: Dashboard Reflects the New Data"),
  p(
    "The Live PR Queue, Findings table, and Analytics page all update on the next auto-refresh (15-second interval) or on manual refresh. The 'Live data · Postgres' pill confirms the data is sourced from the real database, not from mock fixtures."
  )
);

// ─── 13. COST ANALYSIS ───
content.push(
  h1("13. Cost Analysis"),
  p(
    "ReviewAI's operational cost is dominated by Anthropic Claude inference, with all infrastructure components running on free tiers."
  ),
  buildTable(
    [
      { label: "Component" },
      { label: "Free Tier Limit" },
      { label: "Cost After Free Tier" },
    ],
    [
      [
        { text: "Railway Postgres", bold: true },
        { text: "$5/month credit covers small Postgres" },
        { text: "$5+/month if exceeded" },
      ],
      [
        { text: "Railway n8n", bold: true },
        { text: "Same $5 credit, light usage" },
        { text: "$5+/month if exceeded" },
      ],
      [
        { text: "Vercel Frontend", bold: true },
        { text: "Unlimited static + 100GB bandwidth/mo" },
        { text: "$20/month Pro tier" },
      ],
      [
        { text: "GitHub", bold: true },
        { text: "Unlimited public + 2,000 Action minutes" },
        { text: "$4/user/month Team tier" },
      ],
      [
        { text: "Claude Haiku Inference", bold: true },
        { text: "$5 starter credit (≈5,000 PRs reviewed)" },
        { text: "~$0.01 per PR thereafter" },
      ],
      [
        { text: "Claude Sonnet Inference", bold: true },
        { text: "$5 starter credit (≈500 PRs reviewed)" },
        { text: "~$0.10 per PR thereafter" },
      ],
    ],
    [2400, 3960, 3000]
  ),
  blank(),
  p(
    "For a team of 5 engineers opening approximately 100 PRs per month, total operational cost on Haiku is approximately one US dollar per month. On Sonnet, the same volume costs approximately ten dollars per month."
  )
);

// ─── 14. FUTURE ENHANCEMENTS ───
content.push(
  h1("14. Future Enhancements"),
  p(
    "The following enhancements are designed and partially specified in the repository but not yet built."
  ),
  bullet(
    "Auto-fix PRs: bot opens its own follow-up PR against the developer's branch with all suggestions pre-committed."
  ),
  bullet(
    "Repo insights: surface patterns like 'payments.py has 40% more findings than other files this quarter'."
  ),
  bullet(
    "Custom rules per repository via a .aireview.yml file (e.g., 'always flag direct DB access in services/')."
  ),
  bullet(
    "Multi-LLM ensemble: when Claude, GPT-4, and Llama disagree on a finding, escalate to a human reviewer."
  ),
  bullet(
    "Pre-commit local mode: an aireview-check CLI for developers to run reviews locally before pushing."
  ),
  bullet(
    "Linear / Jira integration: auto-link findings to the originating ticket for traceability."
  ),
  bullet(
    "VS Code extension: surface findings inline in the editor during development."
  ),
  bullet(
    "Multi-organization SaaS: full multi-tenant cloud deployment with auth, billing, and tier limits."
  ),
  bullet(
    "Re-review on push (pr-resync workflow): mark findings resolved when their lines are touched and the issue is now fixed."
  ),
  bullet(
    "Merge changelog (pr-merged workflow): auto-generated one-line release notes posted to Slack on merge."
  )
);

// ─── 15. KEY DECISIONS ───
content.push(
  h1("15. Key Architectural Decisions"),
  p(
    "The following decisions shaped the architecture and are documented here so contributors understand the trade-offs."
  ),
  numItem(
    "n8n over Zapier — n8n supports loops, code nodes, and multi-step orchestration that Zapier's simpler model cannot express."
  ),
  numItem(
    "Claude over GPT-4 or Llama — Claude produces the most reliable structured JSON code-review output. The 10-second latency is acceptable for an async workflow."
  ),
  numItem(
    "Railway over Render for n8n — Railway has better Docker support, native Postgres provisioning, and simpler env-var management."
  ),
  numItem(
    "Vercel for frontend — same as Railway, the deployment story is one-click. Server components on Vercel get fresh data on every request."
  ),
  numItem(
    "Postgres over a JSON file or document store — accept-rate analytics and severity trends need real SQL views; Postgres on Railway is free anyway."
  ),
  numItem(
    "Next.js App Router with server components — direct DB queries from page components eliminate the need for a separate API layer."
  ),
  numItem(
    "No FastAPI middleman — n8n is the orchestrator; the frontend hits Postgres directly via server components. Two services instead of three."
  ),
  numItem(
    "Light dashboard theme + dark marketing hero — the dashboard is data-dense and benefits from white backgrounds with clear borders; the marketing pages need the contrast of a dark hero for brand impact."
  )
);

// ─── 16. CONCLUSION ───
content.push(
  h1("16. Conclusion"),
  p(
    "ProITBridge ReviewAI demonstrates that production-grade engineering automation can be built from a small number of well-chosen components without any commercial dependencies. The full stack — orchestration, AI inference, persistence, and frontend — runs on free-tier infrastructure with operational cost limited to per-PR Claude inference."
  ),
  p(
    "For engineering teams adopting the system, the immediate benefit is reclaimed senior-engineer hours and consistent code-review quality. For the broader open-source community, the project serves as a reference architecture for AI-augmented engineering tooling that any team can fork, customize, and self-host."
  ),
  p(
    "The codebase is MIT licensed and available at github.com/Madhavan1009/proitbridge-reviewai. The live deployment is at proitbridge-reviewai.vercel.app. Contributions, issues, and discussions are welcome."
  ),
  blank(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
    children: [
      new TextRun({
        text: "ProITBridge — Strive For Better Future",
        italics: true,
        color: BRAND,
        size: 22,
      }),
    ],
  })
);

// ─── 17. REFERENCES ───
content.push(
  new Paragraph({ children: [new PageBreak()] }),
  h1("17. References and Links"),
  buildTable(
    [{ label: "Resource" }, { label: "URL" }],
    [
      [
        { text: "Source Repository", bold: true },
        { text: "github.com/Madhavan1009/proitbridge-reviewai", code: true },
      ],
      [
        { text: "Demo Sandbox Repository", bold: true },
        {
          text: "github.com/Madhavan1009/proitbridge-reviewai-demo",
          code: true,
        },
      ],
      [
        { text: "Live Dashboard", bold: true },
        { text: "proitbridge-reviewai.vercel.app", code: true },
      ],
      [
        { text: "n8n Documentation", bold: true },
        { text: "docs.n8n.io", code: true },
      ],
      [
        { text: "Anthropic Claude API", bold: true },
        {
          text: "docs.anthropic.com/en/api/getting-started",
          code: true,
        },
      ],
      [
        { text: "GitHub PR Comments API", bold: true },
        { text: "docs.github.com/en/rest/pulls/comments", code: true },
      ],
      [
        { text: "Railway Documentation", bold: true },
        { text: "docs.railway.app", code: true },
      ],
      [
        { text: "Vercel Documentation", bold: true },
        { text: "vercel.com/docs", code: true },
      ],
    ],
    [2400, 6960]
  ),
  blank(),
  blank(),
  p(
    "This report was generated programmatically from the project source. To regenerate after code changes:",
    { italics: true, color: SLATE_700 }
  ),
  code(`node scripts/generate-report.js`),
  blank(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({
        text: "— End of Report —",
        italics: true,
        color: SLATE_700,
        size: 18,
      }),
    ],
  })
);

// ─────────────────────────── document ───────────────────────────

const doc = new Document({
  creator: "ProITBridge Engineering",
  title: "ProITBridge ReviewAI Project Report",
  description:
    "End-to-end project report covering architecture, workflow, deployment, and operations of ProITBridge ReviewAI.",
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }, // 11pt
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: NAVY },
        paragraph: {
          spacing: { before: 360, after: 200 },
          outlineLevel: 0,
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: BRAND },
        paragraph: {
          spacing: { before: 240, after: 120 },
          outlineLevel: 1,
        },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: SLATE_700 },
        paragraph: {
          spacing: { before: 180, after: 80 },
          outlineLevel: 2,
        },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
            },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
            },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "ProITBridge ReviewAI · Project Report",
                  size: 18,
                  color: SLATE_700,
                }),
                new TextRun({
                  children: [
                    new PositionalTab({
                      alignment: PositionalTabAlignment.RIGHT,
                      relativeTo: PositionalTabRelativeTo.MARGIN,
                      leader: PositionalTabLeader.NONE,
                    }),
                    "Strive For Better Future",
                  ],
                  size: 18,
                  color: BRAND,
                  italics: true,
                }),
              ],
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 6,
                  color: BRAND,
                  space: 4,
                },
              },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "© " + new Date().getFullYear() + " ProITBridge",
                  size: 16,
                  color: SLATE_700,
                }),
                new TextRun({
                  children: [
                    new PositionalTab({
                      alignment: PositionalTabAlignment.RIGHT,
                      relativeTo: PositionalTabRelativeTo.MARGIN,
                      leader: PositionalTabLeader.NONE,
                    }),
                    "Page ",
                  ],
                  size: 16,
                  color: SLATE_700,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 16,
                  color: SLATE_700,
                }),
                new TextRun({
                  text: " of ",
                  size: 16,
                  color: SLATE_700,
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 16,
                  color: SLATE_700,
                }),
              ],
            }),
          ],
        }),
      },
      children: content,
    },
  ],
});

const outPath = path.join(
  __dirname,
  "..",
  "ProITBridge_ReviewAI_Project_Report.docx"
);

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(outPath, buffer);
    const sizeKB = Math.round(buffer.length / 1024);
    console.log(`✓ Report generated: ${outPath} (${sizeKB} KB)`);
  })
  .catch((err) => {
    console.error("✗ Report generation failed:", err);
    process.exit(1);
  });
