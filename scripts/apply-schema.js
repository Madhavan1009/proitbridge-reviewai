#!/usr/bin/env node
/**
 * Apply postgres/schema.sql to a Postgres instance.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." node scripts/apply-schema.js
 *
 * Idempotent — re-running on an existing schema is safe (all CREATE
 * statements in schema.sql use IF NOT EXISTS or CREATE OR REPLACE).
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

const schemaPath = path.join(__dirname, "..", "postgres", "schema.sql");
const sql = fs.readFileSync(schemaPath, "utf-8");

const client = new Client({
  connectionString: url,
  ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
});

(async () => {
  console.log("Connecting to Postgres…");
  await client.connect();
  console.log("Connected. Applying schema…");
  await client.query(sql);
  console.log("Schema applied ✓");

  const { rows } = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Tables:", rows.map((r) => r.table_name).join(", "));

  const { rows: views } = await client.query(
    "SELECT table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Views:", views.map((r) => r.table_name).join(", "));

  await client.end();
  console.log("Done.");
})().catch((err) => {
  console.error("Schema apply failed:");
  console.error(err.message);
  process.exit(1);
});
