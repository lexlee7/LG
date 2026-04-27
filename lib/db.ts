import postgres, { type Sql } from "postgres";

const connectionString = process.env.DATABASE_URL;

export const hasDatabase = Boolean(connectionString);

export const sql = connectionString
  ? postgres(connectionString, {
      ssl: connectionString.includes("localhost") ? "disable" : "require",
      max: 5,
      idle_timeout: 10,
      connect_timeout: 15,
    })
  : null;

export function ensureDb(): Sql {
  if (!sql) {
    throw new Error(
      "DATABASE_URL est manquante. Configurez PostgreSQL pour activer la persistance."
    );
  }

  return sql;
}

export async function closeDb() {
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}
