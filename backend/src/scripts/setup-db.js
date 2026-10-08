import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "../config/env.js";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../sql",
);
const conn = await mysql.createConnection({
  ...env.db,
  multipleStatements: true,
});

const columnsOf = async (table) => {
  const [rows] = await conn.query(
    "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
    [env.db.database, table],
  );
  return rows.map((r) => r.name);
};

try {
  for (const file of ["schema.sql", "phase5.sql", "vision.sql", "notes.sql"]) {
    await conn.query(await fs.readFile(path.join(dir, file), "utf8"));
  }

  const cols = await columnsOf("tasks");
  if (!cols.includes("planned_date")) {
    await conn.query(
      "ALTER TABLE tasks ADD COLUMN planned_date DATE NULL AFTER due_date",
    );
    if (cols.includes("is_today")) {
      await conn.query(
        "UPDATE tasks SET planned_date = CURDATE() WHERE is_today = TRUE",
      );
    }
  }
  if (cols.includes("is_today")) {
    await conn.query("ALTER TABLE tasks DROP COLUMN is_today");
  }

  const [rows] = await conn.query("SHOW TABLES");
  console.log(`Done. ${rows.length} tables in the database:`);
  rows.forEach((r) => console.log(` - ${Object.values(r)[0]}`));
} catch (err) {
  console.error("Schema setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
