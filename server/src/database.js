import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from './utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// On Render/production the filesystem is read-only except /tmp
const DB_PATH = process.env.DB_PATH ||
  (process.env.NODE_ENV === 'production'
    ? '/tmp/reviews.db'
    : join(__dirname, '..', 'data', 'reviews.db'));


mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);


db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');


db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL CHECK(platform IN ('github', 'gitlab')),
    repo TEXT NOT NULL,
    pr_number INTEGER NOT NULL,
    pr_title TEXT NOT NULL DEFAULT '',
    pr_author TEXT NOT NULL DEFAULT '',
    pr_url TEXT NOT NULL DEFAULT '',
    branch TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'completed', 'failed')),
    issues_found TEXT NOT NULL DEFAULT '[]',
    summary TEXT NOT NULL DEFAULT '',
    error_message TEXT,
    files_reviewed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
  CREATE INDEX IF NOT EXISTS idx_reviews_platform ON reviews(platform);
  CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
  CREATE INDEX IF NOT EXISTS idx_reviews_repo ON reviews(repo);

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS review_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_review_logs_review ON review_logs(review_id);

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'email' CHECK(provider IN ('email', 'github', 'google', 'gitlab')),
    avatar_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON password_reset_tokens(user_id);
`);


const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
if (settingsCount.count === 0) {
  const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  const defaults = db.transaction((entries) => {
    for (const [key, value] of entries) {
      insert.run(key, value);
    }
  });
  defaults([
    ['github_token', ''],
    ['github_webhook_secret', ''],
    ['gitlab_token', ''],
    ['gitlab_url', 'https://gitlab.com'],
    ['gitlab_webhook_secret', ''],
    ['gemini_api_key', ''],
    ['gemini_model', 'gemini-2.5-flash'],
    ['min_severity', 'medium'],
    ['auto_review', 'true'],
    ['ignore_patterns', '*.lock,*.min.js,*.min.css,dist/**,node_modules/**,vendor/**'],
  ]);
}

logger.info('Database initialized', { path: DB_PATH });

export default db;
