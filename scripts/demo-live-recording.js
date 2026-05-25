#!/usr/bin/env node
/**
 * Demo runner — creates a rich multi-file demo PR that exercises every
 * category of finding the bot detects.
 *
 * Run this from INSIDE the proitbridge-reviewai-demo repo:
 *   cd /tmp/proitbridge-reviewai-demo
 *   node /f/ProITBridge/AI_Code_Automation/scripts/demo-live-recording.js
 *
 * Or from the main repo with --target-dir:
 *   node scripts/demo-live-recording.js --target-dir /tmp/proitbridge-reviewai-demo
 *
 * What it does:
 *   1. Ensures clean main branch
 *   2. Creates a fresh branch demo-multi-<timestamp>
 *   3. Writes 4 intentionally bad files in 4 different folders:
 *        - src/auth.py          (SQL injection · CRITICAL · security)
 *        - api/stripe.py        (Hardcoded API key · CRITICAL · security)
 *        - lib/dedup.py         (O(n²) loop · MEDIUM · performance)
 *        - cache/counter.py     (Race condition · HIGH · bug)
 *   4. Commits + pushes the branch
 *   5. Opens a PR via `gh pr create`
 *
 * Within ~30 seconds the bot should post ~8-12 inline comments + 1 summary.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── parse args ───
const args = process.argv.slice(2);
let targetDir = process.cwd();
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--target-dir" && args[i + 1]) {
    targetDir = path.resolve(args[i + 1]);
    i++;
  }
}

if (!fs.existsSync(path.join(targetDir, ".git"))) {
  console.error(`❌ Not a git repo: ${targetDir}`);
  console.error(
    "   cd into proitbridge-reviewai-demo (or pass --target-dir <path>)."
  );
  process.exit(1);
}

// ─── helpers ───
function sh(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, {
    stdio: opts.silent ? "pipe" : "inherit",
    cwd: targetDir,
  });
}

function writeFile(filePath, content) {
  const full = path.join(targetDir, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(`  + ${filePath}`);
}

// ─── prepare branch ───
const branch = `demo-multi-${Math.floor(Date.now() / 1000)}`;
console.log(`\n🎬 Branch: ${branch}\n`);

try {
  sh("git checkout main", { silent: true });
} catch {
  console.warn("(no main branch — staying on current)");
}
try {
  sh("git pull --rebase", { silent: true });
} catch {
  console.warn("(pull skipped)");
}

sh(`git checkout -b ${branch}`);

console.log("\n📝 Writing 4 intentionally-bad files in 4 folders...\n");

// ─── File 1: src/auth.py — SQL injection ───
writeFile(
  "src/auth.py",
  `"""User authentication and lookup utilities."""
import sqlite3

db = sqlite3.connect("app.db")


def get_user(user_id):
    """Look up a user by ID — used by the support dashboard."""
    query = f"SELECT * FROM users WHERE id={user_id}"
    return db.execute(query).fetchone()


def list_users():
    return db.execute("SELECT id, email FROM users LIMIT 100").fetchall()
`
);

// ─── File 2: api/stripe.py — Hardcoded secret ───
writeFile(
  "api/stripe.py",
  `"""External payment integrations."""
import stripe

STRIPE_KEY = "<PASTE_REAL_LOOKING_STRIPE_KEY_WHEN_RECORDING>"


def charge_card(card, amount):
    """Charge a card via Stripe."""
    return stripe.Charge.create(
        api_key=STRIPE_KEY,
        amount=amount,
        currency="usd",
        source=card,
    )
`
);

// ─── File 3: lib/dedup.py — O(n²) performance ───
writeFile(
  "lib/dedup.py",
  `"""General-purpose utilities."""


def find_duplicates(items):
    """Return items that appear more than once in the input list."""
    duplicates = []
    for i in range(len(items)):
        for j in range(len(items)):
            if i != j and items[i] == items[j]:
                duplicates.append(items[i])
    return duplicates
`
);

// ─── File 4: cache/counter.py — Race condition ───
writeFile(
  "cache/counter.py",
  `"""Redis-backed cache helpers for the rate limiter."""
import redis

cache = redis.Redis()


def increment_counter(key):
    """Increment a counter stored in the cache."""
    value = cache.get(key) or 0
    cache.set(key, value + 1)
    return value + 1
`
);

// ─── commit + push + PR ───
console.log("\n📤 Committing + pushing + opening PR...\n");

sh("git add src api lib cache");
sh('git commit -m "Add support endpoints across auth/payments/cache modules"');
sh(`git push -u origin ${branch}`);

const prBody =
  "Multi-module demo PR showcasing ReviewAI catching 4 distinct bug categories:\\n\\n" +
  "- src/auth.py — SQL injection vulnerability\\n" +
  "- api/stripe.py — Hardcoded API key\\n" +
  "- lib/dedup.py — O(n²) performance anti-pattern\\n" +
  "- cache/counter.py — TOCTOU race condition\\n";

sh(
  `gh pr create --fill --title "Add support endpoints across multiple modules" --body "${prBody}"`
);

console.log(
  "\n✅ Demo PR opened. The bot should land comments across all 4 files within ~30 seconds."
);
console.log(`📺 Run \`gh pr view --web\` to open the PR in your browser.\n`);
