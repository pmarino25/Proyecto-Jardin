import path from "node:path";

export type Row = Record<string, any>;

interface DbAdapter {
  all(sql: string, params?: any[]): Promise<Row[]>;
  get(sql: string, params?: any[]): Promise<Row | undefined>;
  run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number | bigint }>;
}

let adapterPromise: Promise<DbAdapter> | null = null;

// Convierte placeholders `?` (estilo sqlite) a `$1, $2, ...` (estilo postgres).
function toPgSql(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function createSqliteAdapter(): Promise<DbAdapter> {
  // Requiere Node >= 22.5. Uso el módulo nativo node:sqlite, sin dependencias
  // externas que necesiten descargar binarios (evita problemas en entornos
  // con red restringida).
  const { DatabaseSync } = await import("node:sqlite");
  const fs = await import("node:fs");
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "dev.db"));
  const { TABLES_SQLITE } = await import("./schema");
  db.exec(TABLES_SQLITE);

  return {
    async all(sql, params = []) {
      const rows = db.prepare(sql).all(...params) as Row[];
      // node:sqlite devuelve objetos con prototipo null, que Next.js no
      // puede pasar de un Server Component a un Client Component. Los
      // normalizamos acá a objetos planos para toda la app.
      return rows.map((r) => ({ ...r }));
    },
    async get(sql, params = []) {
      const row = db.prepare(sql).get(...params) as Row | undefined;
      return row ? { ...row } : undefined;
    },
    async run(sql, params = []) {
      const info = db.prepare(sql).run(...params);
      return { lastInsertRowid: info.lastInsertRowid };
    },
  };
}

async function createPgAdapter(connectionString: string): Promise<DbAdapter> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const { TABLES_POSTGRES } = await import("./schema");
  await pool.query(TABLES_POSTGRES);

  return {
    async all(sql, params = []) {
      const res = await pool.query(toPgSql(sql), params);
      return res.rows;
    },
    async get(sql, params = []) {
      const res = await pool.query(toPgSql(sql), params);
      return res.rows[0];
    },
    async run(sql, params = []) {
      const isInsert = /^\s*INSERT/i.test(sql);
      const finalSql =
        isInsert && !/RETURNING/i.test(sql) ? `${sql} RETURNING id` : sql;
      const res = await pool.query(toPgSql(finalSql), params);
      return { lastInsertRowid: res.rows[0]?.id };
    },
  };
}

// Si DATABASE_URL apunta a postgres, usamos Postgres (producción).
// Si no, usamos un archivo SQLite local (desarrollo / demo).
export function getDb(): Promise<DbAdapter> {
  if (!adapterPromise) {
    const url = process.env.DATABASE_URL;
    adapterPromise =
      url && url.startsWith("postgres")
        ? createPgAdapter(url)
        : createSqliteAdapter();
  }
  return adapterPromise;
}
