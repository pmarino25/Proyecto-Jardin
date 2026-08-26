// Definición de tablas. Sintaxis compatible con SQLite (dev) y Postgres (producción)
// gracias a que db.ts adapta los tipos automáticamente al conectar.

export const TABLES_SQLITE = `
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'pendiente',
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  space_type TEXT,
  style TEXT,
  budget TEXT,
  desired_elements TEXT,
  comments TEXT,
  photo_data TEXT,
  generated_image_data TEXT,
  generated_image_error TEXT,
  suggested_items TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pendiente',
  payment_amount REAL,
  mp_preference_id TEXT,
  mp_payment_id TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price REAL NOT NULL DEFAULT 0,
  unit TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT,
  total_amount REAL NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pendiente',
  payment_link TEXT,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  product_id INTEGER,
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
);
`;

export const TABLES_POSTGRES = `
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pendiente',
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  space_type TEXT,
  style TEXT,
  budget TEXT,
  desired_elements TEXT,
  comments TEXT,
  photo_data TEXT,
  generated_image_data TEXT,
  generated_image_error TEXT,
  suggested_items TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pendiente',
  payment_amount DOUBLE PRECISION,
  mp_preference_id TEXT,
  mp_payment_id TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  unit TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pendiente',
  payment_link TEXT,
  mp_preference_id TEXT,
  mp_payment_id TEXT
);

CREATE TABLE IF NOT EXISTS quote_items (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES quotes(id),
  product_id INTEGER,
  description TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
  unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  subtotal DOUBLE PRECISION NOT NULL DEFAULT 0
);
`;
