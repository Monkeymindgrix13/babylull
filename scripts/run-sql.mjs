/**
 * Run a .sql file against the Supabase Postgres database.
 *
 * Usage: node scripts/run-sql.mjs <path-to-sql-file>
 *
 * Reads SUPABASE_DB_PASSWORD from .env.local.
 * Project ref and connection details are configured below.
 */

import { readFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Read .env.local ──────────────────────────────────────────

const envFile = readFileSync(join(ROOT, ".env.local"), "utf-8");

function getEnv(key) {
  const match = envFile.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing ${key} in .env.local`);
  return match[1].trim();
}

const PROJECT_REF = "vpanlhwkrpzoowofsekm";
const DB_PASSWORD = getEnv("SUPABASE_DB_PASSWORD");

// ── Parse CLI args ───────────────────────────────────────────

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node scripts/run-sql.mjs <path-to-sql-file>");
  process.exit(1);
}

const sqlPath = resolve(sqlFile);
const sql = readFileSync(sqlPath, "utf-8");

console.log(`Running: ${sqlPath}`);
console.log(`Against: ${PROJECT_REF}.supabase.co\n`);

// ── Connect and execute ──────────────────────────────────────

const client = new pg.Client({
  host: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const result = await client.query(sql);

  if (Array.isArray(result)) {
    console.log(`Done — ${result.length} statement(s) executed.`);
  } else {
    console.log(`Done — ${result.command ?? "OK"} (${result.rowCount ?? 0} row(s))`);
  }
} catch (err) {
  console.error("SQL error:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
