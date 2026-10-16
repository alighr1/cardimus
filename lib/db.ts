import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const file = process.env.DATABASE_PATH ?? "data/cardimus.db";

const g = globalThis as unknown as { __db?: DatabaseSync };

function open() {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA busy_timeout = 10000"); // wait for locks instead of failing
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      contact TEXT NOT NULL,
      thumbnail TEXT NOT NULL DEFAULT '',
      hubspot_id TEXT,
      sync_error TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS cards_user ON cards(user_id, created_at DESC);
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
  `);
  return db;
}

/** Single shared connection, opened lazily on first use (so `next build` never touches the file). */
export const db = new Proxy({} as DatabaseSync, {
  get(_t, prop) {
    const real = (g.__db ??= open());
    const v = real[prop as keyof DatabaseSync];
    return typeof v === "function" ? v.bind(real) : v;
  },
});
