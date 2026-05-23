import { Pool } from "pg";

/**
 * Lazy Postgres connection pool.
 *
 * Returns null if DATABASE_URL is not set, so dashboard pages can fall back
 * to the bundled demo fixtures (used for local dev and the YouTube demo
 * before the bot has reviewed any real PRs).
 */
let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const p = getPool();
  if (!p) return [];
  const res = await p.query(sql, params);
  return res.rows as T[];
}
