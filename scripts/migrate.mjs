// Runs every .sql file in migrations/ against DATABASE_URL, in order.
// Usage: node scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

// Load .env.local manually (no dotenv dependency).
try {
  const env = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const dir = join(root, "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const text = readFileSync(join(dir, file), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  const statements = text
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  console.log(`Running ${file} (${statements.length} statements)...`);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
}

console.log("Migrations complete.");
