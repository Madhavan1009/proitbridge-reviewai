#!/usr/bin/env node
/**
 * Validate the n8n workflow JSON before importing.
 *
 * Checks:
 *   1. File is valid JSON.
 *   2. Every node has the required fields (id, name, type, typeVersion,
 *      position, parameters).
 *   3. Node names are unique (n8n keys connections by name).
 *   4. Every connection source/target references a real node.
 *   5. The workflow has a trigger (a node whose type ends in Webhook,
 *      schedule, manualTrigger, etc.).
 *
 * Usage:  node scripts/validate-workflow.js n8n/pr-review.json
 */

const fs = require("fs");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-workflow.js <workflow.json>");
  process.exit(1);
}

const raw = fs.readFileSync(file, "utf-8");
let wf;
try {
  wf = JSON.parse(raw);
} catch (e) {
  console.error("✗ Not valid JSON:", e.message);
  process.exit(1);
}

const errs = [];

// ---- shape checks ----
if (!wf.name) errs.push("missing top-level `name`");
if (!Array.isArray(wf.nodes)) errs.push("missing top-level `nodes` array");
if (!wf.connections || typeof wf.connections !== "object")
  errs.push("missing top-level `connections` object");

// ---- node checks ----
const seen = new Set();
const byName = new Map();
const required = ["id", "name", "type", "typeVersion", "position", "parameters"];

for (const node of wf.nodes || []) {
  for (const k of required) {
    if (!(k in node))
      errs.push(`node ${JSON.stringify(node.name) || "?"} missing \`${k}\``);
  }
  if (seen.has(node.name)) errs.push(`duplicate node name: ${node.name}`);
  seen.add(node.name);
  byName.set(node.name, node);

  if (
    !Array.isArray(node.position) ||
    node.position.length !== 2 ||
    typeof node.position[0] !== "number"
  ) {
    errs.push(`node ${node.name} has invalid position`);
  }
}

// ---- connection checks ----
for (const [srcName, conn] of Object.entries(wf.connections || {})) {
  if (!byName.has(srcName))
    errs.push(`connection source "${srcName}" is not a node`);
  if (!Array.isArray(conn.main))
    errs.push(`connection "${srcName}" has no main[] array`);
  for (const outputArr of conn.main || []) {
    for (const target of outputArr) {
      if (!byName.has(target.node))
        errs.push(
          `connection "${srcName}" → "${target.node}" is missing target node`
        );
    }
  }
}

// ---- trigger check ----
const triggerSuffixes = ["webhook", "trigger", "cron", "schedule"];
const hasTrigger = (wf.nodes || []).some((n) =>
  triggerSuffixes.some((s) => n.type.toLowerCase().includes(s))
);
if (!hasTrigger) errs.push("no trigger node found");

// ---- report ----
console.log(`Workflow: ${wf.name}`);
console.log(`Nodes: ${(wf.nodes || []).length}`);
console.log(`Connections (sources): ${Object.keys(wf.connections || {}).length}`);
console.log("");

if (errs.length === 0) {
  console.log("✓ Validation passed.");
  process.exit(0);
} else {
  console.log("✗ Errors:");
  for (const e of errs) console.log("  - " + e);
  process.exit(1);
}
