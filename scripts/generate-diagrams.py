#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate workflow diagrams as PNG images for the ProITBridge ReviewAI report.

Outputs:
  assets/diagram-architecture.png   — high-level system architecture
  assets/diagram-workflow.png       — the 19-node pr-review pipeline
  assets/diagram-sample-run.png     — end-to-end timeline of a sample PR
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont

# Make stdout safe on Windows cp1252 consoles
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# ────────────────────────── palette ──────────────────────────
NAVY = (11, 29, 63)
BRAND = (4, 107, 210)
CYAN = (34, 211, 238)
EMERALD = (16, 185, 129)
AMBER = (245, 158, 11)
RED = (220, 38, 38)
ROSE = (244, 63, 94)
VIOLET = (167, 139, 250)
SLATE_900 = (15, 23, 42)
SLATE_700 = (51, 65, 85)
SLATE_500 = (100, 116, 139)
SLATE_300 = (203, 213, 225)
SLATE_200 = (226, 232, 240)
SLATE_100 = (241, 245, 249)
SLATE_50 = (248, 250, 252)
WHITE = (255, 255, 255)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(OUT_DIR, exist_ok=True)


# ────────────────────────── font helpers ──────────────────────────
def get_font(size: int, bold: bool = False):
    """Try Arial first, then DejaVu, then default."""
    candidates = []
    if bold:
        candidates += [
            "C:/Windows/Fonts/arialbd.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
    else:
        candidates += [
            "C:/Windows/Fonts/arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def text_size(draw, text, font):
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]
    except Exception:
        return draw.textlength(text, font=font), font.size


def rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def box(
    draw,
    cx,
    cy,
    w,
    h,
    title,
    subtitle=None,
    fill=WHITE,
    border=BRAND,
    title_color=NAVY,
    sub_color=SLATE_500,
):
    """Draw a rounded box centered on (cx, cy)."""
    x0, y0 = cx - w // 2, cy - h // 2
    x1, y1 = cx + w // 2, cy + h // 2
    # subtle drop shadow
    draw.rounded_rectangle(
        (x0 + 3, y0 + 3, x1 + 3, y1 + 3),
        radius=10,
        fill=(0, 0, 0, 18) if len(fill) == 4 else SLATE_200,
    )
    rounded_rect(draw, (x0, y0, x1, y1), 10, fill=fill, outline=border, width=2)
    title_font = get_font(15, bold=True)
    sub_font = get_font(12)
    tw, th = text_size(draw, title, title_font)
    if subtitle:
        sw, sh = text_size(draw, subtitle, sub_font)
        total_h = th + 4 + sh
        draw.text(
            (cx - tw // 2, cy - total_h // 2),
            title,
            font=title_font,
            fill=title_color,
        )
        draw.text(
            (cx - sw // 2, cy - total_h // 2 + th + 4),
            subtitle,
            font=sub_font,
            fill=sub_color,
        )
    else:
        draw.text((cx - tw // 2, cy - th // 2), title, font=title_font, fill=title_color)


def arrow(draw, x1, y1, x2, y2, color=BRAND, width=2, label=None):
    """Straight arrow from (x1,y1) to (x2,y2) with a triangular head."""
    draw.line((x1, y1, x2, y2), fill=color, width=width)
    # arrowhead
    import math

    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_len = 12
    arrow_angle = math.pi / 6  # 30°
    ax1 = x2 - arrow_len * math.cos(angle - arrow_angle)
    ay1 = y2 - arrow_len * math.sin(angle - arrow_angle)
    ax2 = x2 - arrow_len * math.cos(angle + arrow_angle)
    ay2 = y2 - arrow_len * math.sin(angle + arrow_angle)
    draw.polygon([(x2, y2), (ax1, ay1), (ax2, ay2)], fill=color)
    if label:
        f = get_font(11)
        mx, my = (x1 + x2) // 2, (y1 + y2) // 2
        tw, th = text_size(draw, label, f)
        # white pill behind label
        pad = 3
        draw.rounded_rectangle(
            (mx - tw // 2 - pad, my - th // 2 - pad, mx + tw // 2 + pad, my + th // 2 + pad),
            radius=4,
            fill=WHITE,
            outline=SLATE_300,
            width=1,
        )
        draw.text((mx - tw // 2, my - th // 2), label, font=f, fill=SLATE_700)


def header(draw, x, y, title, sub=None):
    f1 = get_font(22, bold=True)
    f2 = get_font(13)
    draw.text((x, y), title, font=f1, fill=NAVY)
    if sub:
        draw.text((x, y + 30), sub, font=f2, fill=SLATE_500)


# ────────────────────── diagram 1: architecture ──────────────────────
def diagram_architecture():
    W, H = 1400, 900
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)

    header(
        d,
        40,
        30,
        "System Architecture",
        "GitHub → n8n → Claude → Postgres → Dashboard",
    )

    # GitHub PR (trigger)
    box(
        d,
        180,
        220,
        220,
        80,
        "GitHub PR Opens",
        "pull_request.opened",
        fill=(245, 250, 255),
        border=NAVY,
    )

    # n8n orchestrator (big central box)
    n8n_cx, n8n_cy = 700, 400
    n8n_w, n8n_h = 360, 240
    rounded_rect(
        d,
        (n8n_cx - n8n_w // 2, n8n_cy - n8n_h // 2,
         n8n_cx + n8n_w // 2, n8n_cy + n8n_h // 2),
        14,
        fill=(248, 252, 255),
        outline=BRAND,
        width=3,
    )
    title_f = get_font(18, bold=True)
    sub_f = get_font(12)
    d.text((n8n_cx - 90, n8n_cy - 100), "n8n Orchestrator", font=title_f, fill=NAVY)
    d.text((n8n_cx - 90, n8n_cy - 75), "Railway · Docker", font=sub_f, fill=SLATE_500)
    # Inner steps
    steps = [
        "1. HMAC verify",
        "2. Fetch PR files",
        "3. Loop per file",
        "4. Call Claude",
        "5. Parse findings",
        "6. Post inline comments",
        "7. Insert to Postgres",
    ]
    sf = get_font(11)
    for i, step in enumerate(steps):
        d.text((n8n_cx - 130, n8n_cy - 45 + i * 17), step, font=sf, fill=SLATE_700)

    # Claude
    box(
        d,
        1180,
        220,
        220,
        80,
        "Claude 4.5",
        "Anthropic API",
        fill=(255, 250, 245),
        border=AMBER,
    )

    # Postgres
    box(
        d,
        1180,
        500,
        220,
        80,
        "PostgreSQL",
        "Railway · 4 tables + 4 views",
        fill=(245, 255, 250),
        border=EMERALD,
    )

    # GitHub inline comments (output)
    box(
        d,
        180,
        500,
        220,
        80,
        "Inline Comments",
        "Posted on the PR diff",
        fill=(255, 245, 250),
        border=ROSE,
    )

    # Dashboard
    box(
        d,
        700,
        770,
        420,
        90,
        "Next.js Dashboard",
        "Vercel · server components query Postgres live",
        fill=(245, 250, 255),
        border=BRAND,
    )

    # ────── arrows ──────
    # PR → n8n (webhook)
    arrow(d, 290, 220, 525, 340, color=NAVY, label="webhook")
    # n8n → Claude
    arrow(d, 875, 340, 1070, 220, color=AMBER, label="HTTPS · diff + prompt")
    # Claude → n8n
    arrow(d, 1070, 250, 875, 380, color=AMBER, label="JSON findings")
    # n8n → Postgres
    arrow(d, 880, 430, 1070, 480, color=EMERALD, label="INSERT findings")
    # n8n → GitHub inline comments
    arrow(d, 525, 430, 290, 480, color=ROSE, label="POST comment")
    # Postgres → Dashboard
    arrow(d, 1180, 540, 850, 745, color=EMERALD, label="SELECT")
    # Dashboard auto-refresh self loop hint
    f = get_font(11, bold=True)
    d.text(
        (530, 832),
        "↻ Auto-refresh every 15s",
        font=f,
        fill=BRAND,
    )

    out_path = os.path.join(OUT_DIR, "diagram-architecture.png")
    img.save(out_path, "PNG")
    print(f"✓ {out_path}")


# ────────────────────── diagram 2: pr-review workflow ──────────────────────
def diagram_workflow():
    """The 19-node pr-review pipeline laid out as 3 rows."""
    W, H = 1800, 1000
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)

    header(
        d,
        40,
        30,
        "pr-review · n8n Workflow",
        "19 nodes from webhook to summary comment",
    )

    # Layout — 3 rows
    # Row 1: linear setup (webhook → respond → hmac → IF → extract → upsert)
    # Row 2: loop body (get files → filter → split → loop → ...)
    # Row 3: per-finding actions + done branch

    box_w, box_h = 165, 60
    y1 = 130
    y2 = 320
    y3 = 510
    y4 = 760

    # Node colors per category
    TRIGGER = (245, 252, 255)
    CODE = (255, 252, 245)
    HTTP = (250, 245, 255)
    PG = (245, 255, 250)
    IF = (255, 245, 250)
    SPLIT = (255, 250, 240)

    def n(cx, cy, kind, name, short=None):
        colors = {
            "trigger": (TRIGGER, NAVY),
            "code": (CODE, AMBER),
            "http": (HTTP, BRAND),
            "pg": (PG, EMERALD),
            "if": (IF, ROSE),
            "split": (SPLIT, VIOLET),
        }
        fill, border = colors.get(kind, (WHITE, SLATE_500))
        box(d, cx, cy, box_w, box_h, name, subtitle=short, fill=fill, border=border)

    # Row 1 — linear setup (6 nodes)
    nodes_r1 = [
        (130, y1, "trigger", "Webhook", "POST /pr-review"),
        (320, y1, "trigger", "Respond 200", "fast ack"),
        (510, y1, "code", "Verify HMAC", "crypto check"),
        (700, y1, "if", "IF opened", "filter action"),
        (890, y1, "code", "Extract Fields", "owner, sha, …"),
        (1080, y1, "pg", "Upsert PR Row", "RETURNING id"),
    ]
    for cx, cy, k, name, s in nodes_r1:
        n(cx, cy, k, name, s)

    # Row 2 — fetch + loop setup (3 nodes)
    nodes_r2 = [
        (1270, y1, "http", "Get PR Files", "GitHub API"),
        (1460, y1, "code", "Filter Files", "skip generated"),
        (1650, y1, "split", "Split Files", "batchSize 1"),
    ]
    for cx, cy, k, name, s in nodes_r2:
        n(cx, cy, k, name, s)

    # Row 3 — loop body (8 nodes, left to right)
    nodes_r3 = [
        (1650, y2, "http", "Get Content", "fetch base64"),
        (1460, y2, "code", "Decode + Build", "claudeBody"),
        (1270, y2, "http", "Call Claude", "POST messages"),
        (1080, y2, "code", "Parse Findings", "enrich each"),
        (890, y2, "code", "Filter Sev", "drop low/nit"),
        (700, y2, "split", "Split Findings", "1 per item"),
        (510, y2, "http", "Post Inline", "GitHub comment"),
        (320, y2, "pg", "Insert Finding", "row per item"),
    ]
    for cx, cy, k, name, s in nodes_r3:
        n(cx, cy, k, name, s)

    # Row 4 — done branch (2 nodes, separate)
    nodes_r4 = [
        (1500, y4, "pg", "Count Findings", "totals by sev"),
        (1700, y4, "http", "Post Summary", "issue comment"),
    ]
    for cx, cy, k, name, s in nodes_r4:
        n(cx, cy, k, name, s)

    # ────── arrows ──────
    # Row 1 left→right
    for i in range(len(nodes_r1) - 1):
        x1 = nodes_r1[i][0] + box_w // 2
        x2 = nodes_r1[i + 1][0] - box_w // 2
        arrow(d, x1, y1, x2, y1, color=BRAND, width=2)
    # Row 1 last → Row 2 first
    arrow(d, nodes_r1[-1][0] + box_w // 2, y1, nodes_r2[0][0] - box_w // 2, y1, color=BRAND)
    # Row 2 left→right
    for i in range(len(nodes_r2) - 1):
        x1 = nodes_r2[i][0] + box_w // 2
        x2 = nodes_r2[i + 1][0] - box_w // 2
        arrow(d, x1, y1, x2, y1, color=BRAND)
    # Split Files → loop branch: go down to Row 3 first node
    arrow(
        d,
        nodes_r2[-1][0],
        y1 + box_h // 2,
        nodes_r3[0][0],
        y2 - box_h // 2,
        color=VIOLET,
        label="loop output",
    )
    # Row 3 right→left
    for i in range(len(nodes_r3) - 1):
        x1 = nodes_r3[i][0] - box_w // 2
        x2 = nodes_r3[i + 1][0] + box_w // 2
        arrow(d, x1, y2, x2, y2, color=BRAND)
    # Last loop node (Insert Finding) → back up to Split Files (loop continuation)
    # Draw an L-shaped path
    last_x = nodes_r3[-1][0]
    d.line((last_x, y2 - box_h // 2, last_x, y3), fill=VIOLET, width=2)
    d.line((last_x, y3, nodes_r2[-1][0], y3), fill=VIOLET, width=2)
    arrow(d, nodes_r2[-1][0], y3, nodes_r2[-1][0], y1 + box_h // 2, color=VIOLET, label="iterate")

    # Split Files → done branch: go down further to Row 4
    arrow(
        d,
        nodes_r2[-1][0] + 30,
        y1 + box_h // 2,
        nodes_r4[0][0],
        y4 - box_h // 2,
        color=EMERALD,
        label="done output",
    )
    # Row 4 left → right
    arrow(d, nodes_r4[0][0] + box_w // 2, y4, nodes_r4[1][0] - box_w // 2, y4, color=EMERALD)

    # Legend
    lf = get_font(11)
    lx, ly = 40, 920
    items = [
        ("Trigger", TRIGGER, NAVY),
        ("Code", CODE, AMBER),
        ("HTTP", HTTP, BRAND),
        ("Postgres", PG, EMERALD),
        ("IF", IF, ROSE),
        ("Split", SPLIT, VIOLET),
    ]
    d.text((lx, ly), "Legend:", font=get_font(11, bold=True), fill=SLATE_700)
    cur_x = lx + 60
    for label, fill, border in items:
        rounded_rect(d, (cur_x, ly - 3, cur_x + 20, ly + 14), 4, fill=fill, outline=border, width=2)
        d.text((cur_x + 26, ly), label, font=lf, fill=SLATE_700)
        cur_x += 110

    out_path = os.path.join(OUT_DIR, "diagram-workflow.png")
    img.save(out_path, "PNG")
    print(f"✓ {out_path}")


# ────────────────────── diagram 3: sample end-to-end ──────────────────────
def diagram_sample_run():
    """Timeline of a single sample PR being reviewed."""
    W, H = 1400, 600
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)

    header(
        d,
        40,
        30,
        "Sample End-to-End Run",
        "A developer opens a SQL-injection PR — bot reviews in 8.2 seconds",
    )

    # Timeline base
    timeline_y = 280
    start_x, end_x = 100, 1300
    d.line((start_x, timeline_y, end_x, timeline_y), fill=SLATE_300, width=3)

    # Time markers
    steps = [
        (0.0, "git push", "Developer pushes branch", NAVY),
        (1.2, "PR opens", "GitHub fires webhook", BRAND),
        (1.5, "n8n receives", "HMAC verified · IF passes", AMBER),
        (3.0, "Get files", "1 file: src/auth.py", BRAND),
        (5.2, "Claude reviews", "Returns 3 JSON findings", AMBER),
        (7.0, "Comments post", "3 inline + 1 summary", ROSE),
        (8.2, "DB inserted", "3 rows in findings table", EMERALD),
    ]

    max_t = 9.0
    f_time = get_font(13, bold=True)
    f_label = get_font(12, bold=True)
    f_sub = get_font(11)

    for t, label, sub, color in steps:
        x = int(start_x + (end_x - start_x) * (t / max_t))
        # Dot on timeline
        d.ellipse((x - 8, timeline_y - 8, x + 8, timeline_y + 8), fill=color, outline=WHITE, width=2)
        # Time label above
        time_txt = f"{t}s"
        tw, th = text_size(d, time_txt, f_time)
        d.text((x - tw // 2, timeline_y - 32), time_txt, font=f_time, fill=color)
        # Step label below (alternating up/down to avoid collision)
        # All below for simplicity, with staggered y
        idx = steps.index((t, label, sub, color))
        offset = 30 + (idx % 2) * 60
        lw, lh = text_size(d, label, f_label)
        d.text((x - lw // 2, timeline_y + offset), label, font=f_label, fill=NAVY)
        sw, sh = text_size(d, sub, f_sub)
        d.text((x - sw // 2, timeline_y + offset + 18), sub, font=f_sub, fill=SLATE_500)

    # Output card on the right (findings landed)
    rounded_rect(d, (980, 460, 1340, 570), 10, fill=SLATE_50, outline=EMERALD, width=2)
    d.text((1000, 472), "✓ Result", font=get_font(13, bold=True), fill=EMERALD)
    out_lines = [
        "• 3 inline comments on the PR",
        "• 1 summary comment with severity table",
        "• 3 findings rows in Postgres",
        "• Dashboard reflects new PR within 15s",
    ]
    for i, line in enumerate(out_lines):
        d.text((1000, 495 + i * 18), line, font=get_font(11), fill=SLATE_700)

    out_path = os.path.join(OUT_DIR, "diagram-sample-run.png")
    img.save(out_path, "PNG")
    print(f"✓ {out_path}")


if __name__ == "__main__":
    diagram_architecture()
    diagram_workflow()
    diagram_sample_run()
    print("\nAll diagrams generated in", OUT_DIR)
