#!/usr/bin/env node
/**
 * Generate the ProITBridge ReviewAI presentation script (Tanglish + English)
 * as a Word document — ready to use as a teleprompter for a live demo or
 * YouTube walkthrough.
 *
 * Output:
 *   ProITBridge_ReviewAI_Presentation_Script.docx
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
  ImageRun,
  AlignmentType,
  LevelFormat,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageBreak,
  PageNumber,
  PositionalTab,
  PositionalTabAlignment,
  PositionalTabRelativeTo,
  PositionalTabLeader,
  TableOfContents,
} = require("docx");

// ──────────────────────────── palette ────────────────────────────
const NAVY = "0B1D3F";
const BRAND = "046BD2";
const CYAN = "22D3EE";
const ROSE_DARK = "BE123C";
const EMERALD_DARK = "047857";
const SLATE_50 = "F8FAFC";
const SLATE_100 = "F1F5F9";
const SLATE_200 = "E2E8F0";
const SLATE_500 = "64748B";
const SLATE_700 = "334155";
const SLATE_900 = "0F172A";
const AMBER_BG = "FEF3C7";

const CONTENT_WIDTH = 9360;
const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const borders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
};

// Tamil-supporting font (Latha is shipped with Windows; falls back to Arial)
const TAMIL_FONT = "Latha";
const BODY_FONT = "Arial";
const MONO_FONT = "Consolas";

// ──────────────────────────── helpers ────────────────────────────
function blank() {
  return new Paragraph({ children: [new TextRun("")] });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun(text)],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun(text)],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, ...opts })],
  });
}

function code(text) {
  // Multi-line code block — split on newline into separate Paragraphs to
  // avoid losing formatting in Word.
  const lines = text.split("\n");
  return lines.map(
    (line, i) =>
      new Paragraph({
        spacing: { before: i === 0 ? 80 : 0, after: i === lines.length - 1 ? 80 : 0 },
        shading: { fill: SLATE_50, type: ShadingType.CLEAR },
        children: [
          new TextRun({
            text: line || " ",
            font: MONO_FONT,
            size: 18,
            color: SLATE_900,
          }),
        ],
      })
  );
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun(text)],
  });
}

function tableHead(label, fill) {
  return new TableCell({
    borders,
    width: { size: 0, type: WidthType.DXA },
    shading: { fill: fill || NAVY, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: label,
            bold: true,
            color: "FFFFFF",
            size: 20,
          }),
        ],
      }),
    ],
  });
}

function tableCell(content, opts = {}) {
  // content can be a string OR an array of Paragraphs/TextRuns
  let children;
  if (typeof content === "string") {
    children = [
      new Paragraph({
        children: [
          new TextRun({
            text: content,
            bold: !!opts.bold,
            font: opts.code ? MONO_FONT : opts.tamil ? TAMIL_FONT : BODY_FONT,
            size: opts.code ? 18 : opts.size || 20,
            color: opts.color || SLATE_900,
          }),
        ],
      }),
    ];
  } else if (Array.isArray(content) && content.every((c) => c instanceof Paragraph)) {
    children = content;
  } else {
    children = [
      new Paragraph({
        children: Array.isArray(content) ? content : [content],
      }),
    ];
  }
  return new TableCell({
    borders,
    width: { size: 0, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children,
  });
}

function buildTable(headerRow, dataRows, columnWidths) {
  const sum = columnWidths.reduce((a, b) => a + b, 0);
  if (sum !== CONTENT_WIDTH) {
    throw new Error(`columnWidths must sum to ${CONTENT_WIDTH} (got ${sum})`);
  }
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headerRow.map((h, i) => {
          const cell = tableHead(h.label, h.fill);
          cell.options.width = {
            size: columnWidths[i],
            type: WidthType.DXA,
          };
          return cell;
        }),
      }),
      ...dataRows.map(
        (row) =>
          new TableRow({
            children: row.map((cellSpec, i) => {
              let cell;
              if (cellSpec instanceof TableCell) {
                cell = cellSpec;
              } else {
                cell = tableCell(cellSpec.text, cellSpec);
              }
              cell.options.width = {
                size: columnWidths[i],
                type: WidthType.DXA,
              };
              return cell;
            }),
          })
      ),
    ],
  });
}

// Make a scene script row: speaker (Tanglish) on left, English/cues on right.
function speakerPara(text) {
  // Detects Tamil Unicode chars (U+0B80–U+0BFF) and switches font on those
  // runs so they render correctly.
  const runs = [];
  let buf = "";
  let bufTamil = false;
  for (const ch of text) {
    const isTamil = ch >= "஀" && ch <= "௿";
    if (buf === "") {
      buf = ch;
      bufTamil = isTamil;
    } else if (isTamil === bufTamil) {
      buf += ch;
    } else {
      runs.push(
        new TextRun({
          text: buf,
          font: bufTamil ? TAMIL_FONT : BODY_FONT,
          size: 22,
          color: SLATE_900,
        })
      );
      buf = ch;
      bufTamil = isTamil;
    }
  }
  if (buf) {
    runs.push(
      new TextRun({
        text: buf,
        font: bufTamil ? TAMIL_FONT : BODY_FONT,
        size: 22,
        color: SLATE_900,
      })
    );
  }
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: runs,
  });
}

function englishPara(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text,
        font: BODY_FONT,
        size: 20,
        color: SLATE_700,
        italics: true,
      }),
    ],
  });
}

function onScreenPara(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text: "📺 ON SCREEN: ",
        font: BODY_FONT,
        size: 18,
        color: ROSE_DARK,
        bold: true,
      }),
      new TextRun({
        text,
        font: BODY_FONT,
        size: 18,
        color: SLATE_700,
      }),
    ],
  });
}

function scene(num, title, duration, lines, screen, commands) {
  // Build the scene block: header, then a 2-column table (Tanglish | English),
  // optional ON SCREEN cue, optional command block.
  const blocks = [];
  blocks.push(
    new Paragraph({
      spacing: { before: 240, after: 60 },
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: `SCENE ${num} — ${title}`,
          bold: true,
          color: BRAND,
        }),
        new TextRun({
          text: `   (${duration})`,
          color: SLATE_500,
          size: 22,
        }),
      ],
    })
  );

  // Two-column table for the dialogue
  const dataRows = lines.map(([tanglish, english]) => [
    tableCell(speakerPara(tanglish), { fill: SLATE_50 }),
    tableCell(englishPara(english), {}),
  ]);
  // Wrap speakerPara/englishPara in tableCell needs cell that accepts Paragraph.
  // tableCell accepts string OR Paragraph arrays; rewire:
  const tableRows = lines.map(
    ([tanglish, english]) =>
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 4680, type: WidthType.DXA },
            shading: { fill: SLATE_50, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [speakerPara(tanglish)],
          }),
          new TableCell({
            borders,
            width: { size: 4680, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [englishPara(english)],
          }),
        ],
      })
  );
  blocks.push(
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [4680, 4680],
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            (() => {
              const c = tableHead("🎙  Speaker script (Tanglish)", BRAND);
              c.options.width = { size: 4680, type: WidthType.DXA };
              return c;
            })(),
            (() => {
              const c = tableHead("📝 English version", SLATE_700);
              c.options.width = { size: 4680, type: WidthType.DXA };
              return c;
            })(),
          ],
        }),
        ...tableRows,
      ],
    })
  );

  if (screen) {
    blocks.push(blank(), onScreenPara(screen));
  }

  if (commands) {
    blocks.push(
      blank(),
      new Paragraph({
        children: [
          new TextRun({
            text: "💻 COMMANDS TO RUN:",
            bold: true,
            color: EMERALD_DARK,
            size: 20,
          }),
        ],
      }),
      ...code(commands)
    );
  }

  return blocks;
}

// ───────────────────────────── content ─────────────────────────────
const content = [];

// COVER
content.push(
  new Paragraph({ spacing: { before: 2000 }, children: [new TextRun("")] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "ProITBridge ReviewAI",
        font: BODY_FONT,
        size: 64,
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
        text: "Live Demo Presentation Script",
        font: BODY_FONT,
        size: 36,
        color: SLATE_700,
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({
        text: "தமிழ் + English + Tanglish",
        font: TAMIL_FONT,
        size: 28,
        color: CYAN,
        bold: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 800 },
    children: [
      new TextRun({
        text: "🎙  Teleprompter-ready script for the AI Code Review Bot demo",
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
        text: "Estimated runtime: 10–12 minutes",
        size: 20,
        color: SLATE_500,
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000 },
    children: [
      new TextRun({
        text: "Strive For Better Future",
        size: 22,
        italics: true,
        color: BRAND,
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// HOW TO USE THIS SCRIPT
content.push(
  h1("How to Use This Script"),
  p(
    "This document is a teleprompter-style script for a 10–12 minute live demo of ProITBridge ReviewAI. It's written in three layers:"
  ),
  bullet(
    "Speaker script (LEFT column) — the natural Tanglish (mixed Tamil + English) you actually say. Use this for delivery."
  ),
  bullet(
    "English version (RIGHT column) — pure English for subtitles, transcripts, or international audiences."
  ),
  bullet(
    "ON SCREEN cues + COMMANDS — what to show in your screen recording / what to type into the terminal."
  ),
  blank(),
  p(
    "The script is broken into 11 scenes with timing estimates. Total runtime ≈ 10 minutes. You can shorten by dropping Scene 5 (Architecture deep-dive) or extend by spending more time on the dashboard tour in Scene 9."
  )
);

// PRE-RECORDING CHECKLIST
content.push(
  h1("Pre-Recording Checklist"),
  p("Before you hit record, make sure all this is ready:"),
  buildTable(
    [
      { label: "✓" },
      { label: "What to Prepare" },
      { label: "Where / How" },
    ],
    [
      [
        { text: "☐", bold: true },
        { text: "n8n workflow is published + active" },
        { text: "https://n8n-production-6b0c.up.railway.app", code: true },
      ],
      [
        { text: "☐", bold: true },
        { text: "Dashboard is live + seeded with demo data" },
        { text: "node scripts/seed-demo-data.js", code: true },
      ],
      [
        { text: "☐", bold: true },
        { text: "Demo sandbox repo cloned locally" },
        {
          text: "/tmp/proitbridge-reviewai-demo (clean main branch)",
          code: true,
        },
      ],
      [
        { text: "☐", bold: true },
        { text: "Browser tabs open in order" },
        {
          text: "Landing page → Dashboard → Demo repo GitHub page",
        },
      ],
      [
        { text: "☐", bold: true },
        { text: "Terminal ready in demo repo directory" },
        { text: "cd /tmp/proitbridge-reviewai-demo", code: true },
      ],
      [
        { text: "☐", bold: true },
        { text: "Screen recording at 1080p, 30 fps" },
        { text: "OBS / Loom / ScreenStudio" },
      ],
      [
        { text: "☐", bold: true },
        { text: "Mic check — no background hiss" },
        { text: "Test 10 seconds, listen back" },
      ],
      [
        { text: "☐", bold: true },
        { text: "Close Slack / WhatsApp / notifications" },
        { text: "Focus Mode on" },
      ],
    ],
    [500, 4660, 4200]
  ),
  new Paragraph({ children: [new PageBreak()] })
);

// ═════════════════════════════ SCENES ═════════════════════════════
content.push(h1("Scene-by-Scene Script"));

// SCENE 1 — Hook
content.push(
  ...scene(
    1,
    "Hook & Welcome",
    "0:00 – 0:30",
    [
      [
        "வணக்கம் friends! Naan Madhavan, ProITBridge la work pannren.",
        "Hello friends! I'm Madhavan from ProITBridge.",
      ],
      [
        "Indha video la naan oru AI bot pathi sollave porein — adhu unga GitHub PR ellathuyum auto-ave review pannum. Adhuvum just 10 seconds la!",
        "In this video I'll show you an AI bot that auto-reviews every GitHub PR — and it does it in just 10 seconds!",
      ],
      [
        "Best part? Idhu fully self-hosted, open source, and zero rupee infrastructure cost la work aagum. Let me show you live.",
        "The best part? It's fully self-hosted, open source, and runs on $0 infrastructure. Let me show you live.",
      ],
    ],
    "Open https://proitbridge-reviewai.vercel.app/ — landing page hero visible with the animated PR mock"
  )
);

// SCENE 2 — The Problem
content.push(
  ...scene(
    2,
    "The Problem (Yaar use pannanum?)",
    "0:30 – 1:30",
    [
      [
        "Konjam yosichu paaru — unga team la PR open aanaalum, atha review panna evlo time aagudhu? 2 days? 3 days?",
        "Think about it — in your team, when a PR opens, how long does it take to review? 2 days? 3 days?",
      ],
      [
        "Senior engineers ellaa periya tasks la busy ah irukkanga. Junior devs PR open pannita — oru small SQL injection, oru hardcoded API key, oru race condition — ellame easy ah miss aaidum.",
        "Senior engineers are busy with bigger tasks. When junior devs open PRs — small SQL injections, hardcoded API keys, race conditions — these get missed easily.",
      ],
      [
        "Production ku poita, periya issue. Money loss, security breach, customer escalation. Idhellam common.",
        "Once it hits production, it becomes a big issue. Money loss, security breach, customer escalations. Very common.",
      ],
      [
        "Adhukku enna solution? Manual review tough, time consuming. CodeRabbit mathiri tools $24 per developer per month — startups ku afford panna kashtam. Adhaan ReviewAI build pannen.",
        "What's the solution? Manual reviews are tough and slow. Tools like CodeRabbit cost $24/dev/month — hard for startups to afford. That's why I built ReviewAI.",
      ],
    ],
    "Scroll down to 'Before vs After' section on landing page — show the comparison table"
  )
);

// SCENE 3 — What is ReviewAI
content.push(
  ...scene(
    3,
    "What is ReviewAI?",
    "1:30 – 2:30",
    [
      [
        "So ReviewAI enna pannum? Simple ah sollanum na — neenga oru GitHub PR open pannina, 10 seconds kulla oru AI bot vandhu, oru senior engineer mathiri review pannum.",
        "What does ReviewAI do? Simply put — when you open a GitHub PR, within 10 seconds an AI bot reviews it like a senior engineer would.",
      ],
      [
        "Adhu enna catch pannum? SQL injection, hardcoded secrets, race condition, missing tests, performance issues — ellame.",
        "What does it catch? SQL injection, hardcoded secrets, race conditions, missing tests, performance issues — all of it.",
      ],
      [
        "Indha bot Anthropic Claude AI use pannum — adhuthaan oru top-tier language model code review ku.",
        "The bot uses Anthropic's Claude AI — currently the top-tier language model for code reasoning.",
      ],
      [
        "Avlo dhaan illa — oru full dashboard kuda kudukkrom. Live PR queue, all findings table, analytics charts — Postgres la data store aagum, real-time la update aagum.",
        "And it's not just the bot — there's a full dashboard too. Live PR queue, findings table, analytics — all backed by Postgres and updated in real time.",
      ],
    ],
    "Switch to landing page 'How It Works' section — show the React Flow workflow diagram"
  )
);

// SCENE 4 — For Whom
content.push(
  ...scene(
    4,
    "Yaarukku Useful? (Who is this for?)",
    "2:30 – 3:00",
    [
      [
        "Idhu yaarukku useful? Mukhya ah three types of teams ku:",
        "Who is this useful for? Mainly three types of teams:",
      ],
      [
        "One — Startups. Small team, lots of code, no senior reviewer time. Bot ah first-pass review pannra.",
        "First — Startups. Small team, lots of code, no senior reviewer time. The bot handles the first-pass review.",
      ],
      [
        "Two — Engineering managers. Senior engineers 4-6 hours per week first-pass review la spend pannranga. Adhukku replacement.",
        "Second — Engineering managers. Senior engineers spend 4-6 hours per week on first-pass reviews. This frees them up.",
      ],
      [
        "Three — Open source maintainers. PR ah triage panna helpful. Volunteer time wastage aagaadhu.",
        "Third — Open-source maintainers. Helps triage incoming PRs without overloading volunteer time.",
      ],
    ],
    "Stay on landing page — scroll to the target users section (optional)"
  )
);

// SCENE 5 — Architecture
content.push(
  ...scene(
    5,
    "How It Works (Architecture)",
    "3:00 – 4:00",
    [
      [
        "Inside enna nadakkudhu? Naan oru quick architecture kaapikren.",
        "What's happening inside? Let me show a quick architecture.",
      ],
      [
        "Five components dhaan — GitHub, n8n, Claude, Postgres, dashboard. Adhuvum mathiri.",
        "Just five components — GitHub, n8n, Claude, Postgres, dashboard. That's it.",
      ],
      [
        "GitHub PR open aana udane, webhook fire aagum. Adhu n8n ku poagum — Railway la host pannrom.",
        "When a GitHub PR opens, a webhook fires. It goes to n8n — which I host on Railway.",
      ],
      [
        "n8n indha 19 nodes oda workflow run pannum. HMAC verify, PR files fetch, per file la Claude ku send, findings parse, inline comments post — all in one pipeline.",
        "n8n runs a 19-node workflow. HMAC verify, fetch PR files, per file send to Claude, parse findings, post inline comments — one pipeline.",
      ],
      [
        "Claude reviews pannum, JSON return pannum. Adhu Postgres la store aagum. Dashboard live ah read pannum.",
        "Claude reviews and returns JSON. That gets stored in Postgres. The dashboard reads it live.",
      ],
      [
        "No FastAPI, no microservices, no Kubernetes. Romba simple, romba clean.",
        "No FastAPI, no microservices, no Kubernetes. Super simple, super clean.",
      ],
    ],
    "Open /how-it-works page OR show the architecture diagram PNG from assets/diagram-architecture.png"
  )
);

// SCENE 6 — Demo Setup
content.push(
  ...scene(
    6,
    "Demo Setup (Inga irundhu live)",
    "4:00 – 4:30",
    [
      [
        "OK, theory podhum. Live demo paakalaam.",
        "OK, enough theory. Let's see a live demo.",
      ],
      [
        "Naan oru demo repo create panniyirukken — proitbridge-reviewai-demo. Atha namma bot watch pannitu irukku. Pull request open pannina udane fire aagum.",
        "I've created a demo repo called proitbridge-reviewai-demo. Our bot is watching it. As soon as a PR opens, it fires.",
      ],
      [
        "Inga oru intentionally bad Python file irukku — SQL injection vulnerability oda. Atha PR ah open pannuvom, bot enna response panrudhunu paaruvom.",
        "I've prepared an intentionally bad Python file with a SQL injection vulnerability. We'll open a PR with it and watch the bot respond.",
      ],
    ],
    "Switch to terminal, ready in /tmp/proitbridge-reviewai-demo directory"
  )
);

// SCENE 7 — Open the bad PR
content.push(
  ...scene(
    7,
    "Open the Bad PR (Live)",
    "4:30 – 5:30",
    [
      [
        "Indha three commands run panren. Branch create, file write, push, PR open. Adhu mathiri.",
        "Three commands — create branch, write file, push, open PR. That's it.",
      ],
      [
        "Indha src/auth.py la SQL injection irukku — paaru — query string la user_id ah f-string la directly interpolate pannraan. Adhu romba dangerous.",
        "Look at src/auth.py — there's a SQL injection — the user_id is interpolated directly into the query string via f-string. Very dangerous.",
      ],
      [
        "Ippo PR open pannitu, bot enna sollum paaruvom. 10 seconds maximum.",
        "Now let me open the PR and watch what the bot says. Max 10 seconds.",
      ],
    ],
    "Run the commands below in the terminal — show the editor briefly showing src/auth.py",
    `git checkout -b demo-live-recording
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
git push -u origin demo-live-recording
gh pr create --fill --title "Add user lookup by ID"`
  )
);

// SCENE 8 — Watch the bot review
content.push(
  ...scene(
    8,
    "Watch the Bot Review (The Magic Moment)",
    "5:30 – 7:00",
    [
      [
        "Browser la GitHub PR page open pannitu wait pannuvom. 10 seconds kulla bot vandhu inline comments post pannum.",
        "Let's open the GitHub PR page and wait. Within 10 seconds the bot will post inline comments.",
      ],
      [
        "Andha! Paaru! Critical SQL injection finding vandhirukku line 10 la. Suggestion block kuda kudirukkaan — parameterized query use pannunga.",
        "There it is! Look — Critical SQL injection finding on line 10. With a suggestion block — use parameterized query.",
      ],
      [
        "Innum oru comment — High severity — no tests cover this code path. Auth.py is a security boundary nu sollirukku. Apdina test coverage venum.",
        "And another comment — High severity — no tests cover this code path. It mentions auth.py is a security boundary, so test coverage is needed.",
      ],
      [
        "Innum oru — Medium severity — module-level DB connection. Adhukku error handling illama, cleanup illama irukku. All three findings — within 8 seconds.",
        "Another one — Medium severity — module-level DB connection has no error handling, no cleanup. All three findings — within 8 seconds.",
      ],
      [
        "Best part? 'Commit suggestion' button — one click la fix accept pannidalaam. No copy paste.",
        "Best part? The 'Commit suggestion' button — one click to accept the fix. No copy-paste.",
      ],
      [
        "Bottom la oru summary comment kuda post panniyirukku — severity table, total count. Romba clean.",
        "At the bottom there's a summary comment too — severity table, total count. Super clean.",
      ],
    ],
    "Refresh the GitHub PR page; comments should be visible. Zoom in on each comment as you describe it."
  )
);

// SCENE 9 — Dashboard tour
content.push(
  ...scene(
    9,
    "Dashboard Tour (Inga ellame live)",
    "7:00 – 9:00",
    [
      [
        "Ippo dashboard ku poavom. Indha PR a, indha findings a — ellame Postgres la store aaiduchu. Adhu dashboard la real-time la appear aagum.",
        "Now let's go to the dashboard. This PR, these findings — all stored in Postgres. They appear in real time on the dashboard.",
      ],
      [
        "Top la stat cards paarungo — PRs reviewed, findings posted, accept rate. Real numbers from Postgres.",
        "Look at the stat cards at the top — PRs reviewed, findings posted, accept rate. Real numbers from Postgres.",
      ],
      [
        "Right side la oru green pill irukku — 'Live data · Postgres'. Adhu confirm pannudhu — real data, mock illa.",
        "Top-right corner has a green pill — 'Live data · Postgres'. That confirms — it's real data, not mock.",
      ],
      [
        "Pakkathula oru chip — 'Auto-refresh in 15s'. Antha countdown ah paaru — adhu 15 second oda automatic ah refresh aagum. New PR vandha udane appear aagum.",
        "Next to it — 'Auto-refresh in 15s' chip. Watch that countdown — every 15 seconds it auto-refreshes. New PRs appear automatically.",
      ],
      [
        "Indha live demo PR — top la first row la irukku. Click pannina, findings inline ah expand aagum. SQL injection finding intha suggestion block oda. Same content.",
        "This live demo PR — top row, first one. Click it — findings expand inline. SQL injection finding with its suggestion block. Same content.",
      ],
      [
        "All Findings tab — full table — every finding ever posted. Search, filter by severity, category.",
        "All Findings tab — full table — every finding ever posted. Search, filter by severity and category.",
      ],
      [
        "Analytics tab — charts. Severity trend, category donut, accept rate over time, top files. Engineering manager ku perfect.",
        "Analytics tab — charts. Severity trend, category donut, accept rate over time, top files. Perfect for engineering managers.",
      ],
      [
        "Settings la oru button irukku — 'Open n8n'. Click pannina, n8n backend directly open aagum. Workflow edit pannalaam, executions paakalaam.",
        "Settings page has an 'Open n8n' button — click it and the n8n backend opens directly. You can edit the workflow, view executions.",
      ],
    ],
    "Tour the dashboard: /dashboard → /dashboard/findings → /dashboard/analytics → /dashboard/settings → click Open n8n"
  )
);

// SCENE 10 — Cost + Stack
content.push(
  ...scene(
    10,
    "Cost a paatha?",
    "9:00 – 9:30",
    [
      [
        "Cost a paatha? Romba interesting.",
        "Want to know the cost? It's actually interesting.",
      ],
      [
        "Infrastructure ah free tier. Railway free credit la Postgres + n8n run aagum. Vercel la frontend host pannrom — fully free. GitHub Actions cron free.",
        "Infrastructure is free tier. Postgres + n8n run on Railway's free credit. Frontend on Vercel — fully free. GitHub Actions cron — free.",
      ],
      [
        "Claude API only la cost. Haiku model use pannina, per PR oru cent kanduppidalam. Sonnet use pannina ten cents. 100 PRs per month na, even Sonnet la ten dollars dhaan.",
        "Only Claude API has cost. Using Haiku, it's about one cent per PR. With Sonnet, ten cents. For 100 PRs/month, even Sonnet is just $10 total.",
      ],
      [
        "Compare panna CodeRabbit $24 per developer per month. 5 developer team na $120. ReviewAI la $10. 92% saving.",
        "Compare to CodeRabbit at $24/developer/month. For a 5-developer team that's $120. ReviewAI is $10. 92% saving.",
      ],
    ],
    "Show the cost analysis table from the report OR the pricing page mock"
  )
);

// SCENE 11 — Closing CTA
content.push(
  ...scene(
    11,
    "Closing & Call to Action",
    "9:30 – 10:30",
    [
      [
        "So that's ProITBridge ReviewAI. Open source, free tier, self-hosted, fully functional AI code review bot.",
        "So that's ProITBridge ReviewAI. Open source, free tier, self-hosted, fully functional AI code review bot.",
      ],
      [
        "Repo link description la kudukkiren — github.com/Madhavan1009/proitbridge-reviewai. Fork pannunga, star pannunga, deploy pannunga.",
        "Repo link in the description — github.com/Madhavan1009/proitbridge-reviewai. Fork it, star it, deploy it.",
      ],
      [
        "DEPLOYMENT.md la step-by-step guide irukku. 30 minutes la unga organization la setup pannalaam.",
        "DEPLOYMENT.md has step-by-step instructions. You can set it up for your organization in 30 minutes.",
      ],
      [
        "Indha video useful aana, like pannunga, subscribe pannunga. Adhu next video la bot ah extend panrathukana ideas pathi solren.",
        "If this video was useful, like and subscribe. In the next video I'll show ideas to extend the bot further.",
      ],
      [
        "Romba nandri! Strive For Better Future. Bye!",
        "Thanks a lot! Strive For Better Future. Bye!",
      ],
    ],
    "End card: show ProITBridge logo, repo URL, dashboard URL, 'Star on GitHub' CTA"
  ),
  new Paragraph({ children: [new PageBreak()] })
);

// ═════════════════════════════ APPENDICES ═════════════════════════════

// APPENDIX A — From-scratch setup commands
content.push(
  h1("Appendix A — From-Scratch Setup Commands"),
  p(
    "Run these in order to set up the project on a fresh machine. Use this if you want to demonstrate the full setup, or before a fresh recording."
  )
);

content.push(
  h2("A.1  Clone + install"),
  ...code(`git clone https://github.com/Madhavan1009/proitbridge-reviewai
cd proitbridge-reviewai
cd frontend
npm install
cd ..`),
  blank(),
  h2("A.2  Railway Postgres provisioning"),
  bullet("Open railway.app in browser"),
  bullet("New Project → Provision PostgreSQL"),
  bullet("Postgres service → Variables tab → enable Public Networking"),
  bullet("Copy DATABASE_PUBLIC_URL"),
  blank(),
  p("Then apply the schema from your terminal:"),
  ...code(`DATABASE_URL="postgresql://postgres:...@kodama.proxy.rlwy.net:.../railway" \\
  NODE_PATH="frontend/node_modules" \\
  node scripts/apply-schema.js`),
  blank(),
  h2("A.3  Seed demo data"),
  ...code(`DATABASE_URL="<same Postgres URL>" \\
  NODE_PATH="frontend/node_modules" \\
  node scripts/seed-demo-data.js`),
  p("This inserts 15 demo PRs + 29 findings so the dashboard looks populated."),
  blank(),
  h2("A.4  Generate secrets"),
  ...code(`# Three secrets needed for n8n
openssl rand -hex 32   # N8N_ENCRYPTION_KEY
openssl rand -base64 24 | tr -d '/+=' | cut -c1-24   # basic auth password
openssl rand -hex 32   # GITHUB_WEBHOOK_SECRET`),
  blank(),
  h2("A.5  Deploy n8n on Railway"),
  bullet("Same Railway project → New → Empty Service"),
  bullet("Source → Docker Image: n8nio/n8n:latest"),
  bullet("Networking → Generate Domain, set Target Port to 5678"),
  bullet(
    "Variables → paste the env-var block from DEPLOYMENT.md (includes NODE_FUNCTION_ALLOW_BUILTIN=crypto and N8N_BLOCK_ENV_ACCESS_IN_NODE=false)"
  ),
  bullet("Wait for active status, open the URL, complete owner-account setup"),
  blank(),
  h2("A.6  Import workflow + add credentials"),
  bullet("n8n UI → Import from File → n8n/pr-review.json"),
  bullet("Credentials → New → GitHub API (with a personal access token, repo scope)"),
  bullet("Credentials → New → Postgres (with the DATABASE_URL details)"),
  bullet("Credentials → New → Header Auth (name x-api-key, value sk-ant-...)"),
  bullet("Wire each red-dot node to its credential"),
  bullet("Save, then click Publish"),
  blank(),
  h2("A.7  Configure GitHub webhook"),
  bullet("Demo repo Settings → Webhooks → Add webhook"),
  bullet("Payload URL: https://<n8n>.up.railway.app/webhook/pr-review"),
  bullet("Content type: application/json"),
  bullet("Secret: paste GITHUB_WEBHOOK_SECRET"),
  bullet("Events: Let me select → Pull requests"),
  blank(),
  ...code(`# Or via gh CLI:
gh api repos/<owner>/<repo>/hooks --method POST \\
  --field name=web --field active=true \\
  --raw-field 'config[url]=https://<n8n>.up.railway.app/webhook/pr-review' \\
  --raw-field 'config[content_type]=json' \\
  --raw-field 'config[secret]=<GITHUB_WEBHOOK_SECRET>' \\
  --raw-field 'events[]=pull_request'`),
  blank(),
  h2("A.8  Deploy frontend to Vercel"),
  ...code(`cd frontend
vercel link --yes --project proitbridge-reviewai
# Add env vars
printf "<DATABASE_URL>" | vercel env add DATABASE_URL production
printf "<n8n URL>" | vercel env add NEXT_PUBLIC_N8N_URL production
vercel --prod --yes`),
  new Paragraph({ children: [new PageBreak()] })
);

// APPENDIX B — Live demo commands cheat sheet
content.push(
  h1("Appendix B — Live Demo Commands Cheat Sheet"),
  p(
    "Keep this open in a second monitor or printed page during recording. Copy-paste row by row in the terminal."
  ),
  buildTable(
    [{ label: "Moment in script" }, { label: "Command" }],
    [
      [
        { text: "Scene 6: Set up demo repo dir", bold: true },
        { text: "cd /tmp/proitbridge-reviewai-demo && git checkout main && git pull", code: true },
      ],
      [
        { text: "Scene 7: Create branch", bold: true },
        { text: "git checkout -b demo-live-recording", code: true },
      ],
      [
        { text: "Scene 7: Create the bad file (one-liner)", bold: true },
        {
          text: "mkdir -p src && curl -sS https://raw.githubusercontent.com/Madhavan1009/proitbridge-reviewai/main/demo-bad-prs/01-sql-injection.md | head -50 > /dev/null; cat demo-bad-prs/01-sql-injection.md  # then paste code into src/auth.py",
          code: true,
        },
      ],
      [
        { text: "Scene 7: Commit + push", bold: true },
        {
          text: "git add src/auth.py && git commit -m 'Add user lookup endpoint' && git push -u origin demo-live-recording",
          code: true,
        },
      ],
      [
        { text: "Scene 7: Open PR", bold: true },
        { text: "gh pr create --fill --title 'Add user lookup by ID'", code: true },
      ],
      [
        { text: "Scene 8: Open PR in browser", bold: true },
        {
          text: "gh pr view --web   (or refresh existing tab)",
          code: true,
        },
      ],
      [
        { text: "Scene 9: Open dashboard", bold: true },
        { text: "open https://proitbridge-reviewai.vercel.app/dashboard", code: true },
      ],
      [
        { text: "After demo: Clean up", bold: true },
        {
          text: "gh pr close <num> --comment 'demo cleanup' && git checkout main && git push origin --delete demo-live-recording",
          code: true,
        },
      ],
    ],
    [3000, 6360]
  ),
  blank(),
  blank(),
  h2("Reset dashboard demo data before recording"),
  p("Run this 5 minutes before recording so timestamps look fresh:"),
  ...code(`DATABASE_URL="<your Railway Postgres URL>" \\
  NODE_PATH="frontend/node_modules" \\
  node scripts/seed-demo-data.js`)
);

// APPENDIX C — Tips
content.push(
  new Paragraph({ children: [new PageBreak()] }),
  h1("Appendix C — Presenter Tips"),
  buildTable(
    [{ label: "Tip" }, { label: "Why" }],
    [
      [
        { text: "Slow down on technical terms", bold: true },
        {
          text: "Words like 'webhook', 'HMAC', 'parameterized query' — pause for half a second so non-Tamil viewers can follow",
        },
      ],
      [
        { text: "Show, don't tell", bold: true },
        {
          text: "Every time you mention a feature, switch to that view on screen within 2 seconds",
        },
      ],
      [
        { text: "Don't apologize for delays", bold: true },
        {
          text: "If the bot takes 12 seconds instead of 10, say 'AI is thinking' — don't apologize, it kills momentum",
        },
      ],
      [
        { text: "Use the auto-refresh chip", bold: true },
        {
          text: "Point at the countdown when explaining live updates — visual proof",
        },
      ],
      [
        { text: "End with the GitHub repo URL", bold: true },
        {
          text: "Pin a comment with the link as soon as you publish — biggest source of repo stars",
        },
      ],
      [
        { text: "Re-record only intro + outro", bold: true },
        {
          text: "The demo middle (Scenes 6-9) is the value — keep first take, redo bookends if needed",
        },
      ],
    ],
    [3000, 6360]
  ),
  blank(),
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

// ─────────────────────────── document ───────────────────────────
const doc = new Document({
  creator: "ProITBridge Engineering",
  title: "ProITBridge ReviewAI — Presentation Script",
  description:
    "Tanglish + English teleprompter script for the live demo of ProITBridge ReviewAI.",
  styles: {
    default: { document: { run: { font: BODY_FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, font: BODY_FONT, color: NAVY },
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
        run: { size: 28, bold: true, font: BODY_FONT, color: BRAND },
        paragraph: {
          spacing: { before: 240, after: 120 },
          outlineLevel: 1,
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
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "ProITBridge ReviewAI · Presentation Script",
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
                    "தமிழ் + English",
                  ],
                  size: 18,
                  color: BRAND,
                  font: TAMIL_FONT,
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
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: SLATE_700 }),
                new TextRun({ text: " of ", size: 16, color: SLATE_700 }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: SLATE_700 }),
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
  "ProITBridge_ReviewAI_Presentation_Script.docx"
);

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(outPath, buffer);
    const sizeKB = Math.round(buffer.length / 1024);
    console.log(`✓ Script generated: ${outPath} (${sizeKB} KB)`);
  })
  .catch((err) => {
    console.error("✗ Script generation failed:", err);
    process.exit(1);
  });
