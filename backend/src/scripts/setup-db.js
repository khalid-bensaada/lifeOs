import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "../config/env.js";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../sql/schema.sql",
);
const sql = await fs.readFile(file, "utf8");

const conn = await mysql.createConnection({
  ...env.db,
  multipleStatements: true,
});

try {
  await conn.query(sql);
  const [rows] = await conn.query("SHOW TABLES");
  console.log(`Done. ${rows.length} tables in the database:`);
  rows.forEach((r) => console.log(` - ${Object.values(r)[0]}`));
} catch (err) {
  console.error("Schema setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
