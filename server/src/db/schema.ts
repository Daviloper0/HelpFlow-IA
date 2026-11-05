import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = process.env.DB_PATH ?? path.join(DATA_DIR, 'helpflow.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS tests (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    method          TEXT    NOT NULL CHECK(method IN ('GET','POST','PUT','PATCH','DELETE')),
    description     TEXT    NOT NULL DEFAULT '',
    route           TEXT    NOT NULL,
    request_body    TEXT    NOT NULL DEFAULT '',
    expected_status INTEGER NOT NULL,
    expected_body   TEXT    NOT NULL DEFAULT '',
    category        TEXT    NOT NULL CHECK(category IN ('success','validation','expected-error')),
    created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE IF NOT EXISTS executions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id         INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    actual_status   INTEGER NOT NULL,
    actual_body     TEXT    NOT NULL DEFAULT '',
    passed          INTEGER NOT NULL CHECK(passed IN (0,1)),
    failure_message TEXT    NOT NULL DEFAULT '',
    ran_at          INTEGER NOT NULL,
    duration_ms     INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_executions_test_id_ran_at
    ON executions(test_id, ran_at DESC);
`);

// Migrations — use try/exec to avoid creating any Statement objects during init.
// SQLite raises "duplicate column name" (SQLITE_ERROR) if the column already exists; we swallow it.
function addCol(sql: string) { try { db.exec(sql); } catch { /* already exists */ } }

addCol(`ALTER TABLE executions ADD COLUMN actual_request_body TEXT NOT NULL DEFAULT ''`);
addCol(`ALTER TABLE executions ADD COLUMN actual_route TEXT NOT NULL DEFAULT ''`);
addCol(`ALTER TABLE tests ADD COLUMN capture_path TEXT NOT NULL DEFAULT ''`);
addCol(`ALTER TABLE tests ADD COLUMN capture_as TEXT NOT NULL DEFAULT ''`);
try {
  db.exec(`ALTER TABLE tests ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`);
  // Seed existing rows: sort_order = id * 10 (leaves room for intermediate values)
  db.exec(`UPDATE tests SET sort_order = id * 10 WHERE sort_order = 0`);
} catch { /* already exists */ }

// suite_runs table
db.exec(`
  CREATE TABLE IF NOT EXISTS suite_runs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ran_at     INTEGER NOT NULL,
    total      INTEGER NOT NULL DEFAULT 0,
    passed     INTEGER NOT NULL DEFAULT 0,
    failed     INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    hidden     INTEGER NOT NULL DEFAULT 0 CHECK(hidden IN (0,1))
  );
`);

addCol(`ALTER TABLE executions ADD COLUMN suite_run_id INTEGER REFERENCES suite_runs(id)`);

db.exec(`
  CREATE TABLE IF NOT EXISTS doc_routes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    method         TEXT    NOT NULL CHECK(method IN ('GET','POST','PUT','PATCH','DELETE')),
    route          TEXT    NOT NULL,
    title          TEXT    NOT NULL,
    request_body   TEXT    NOT NULL DEFAULT '',
    success_status INTEGER NOT NULL,
    success_body   TEXT    NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS doc_route_errors (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL REFERENCES doc_routes(id) ON DELETE CASCADE,
    status   INTEGER NOT NULL,
    body     TEXT    NOT NULL DEFAULT ''
  );
`);

addCol(`ALTER TABLE doc_routes ADD COLUMN description TEXT NOT NULL DEFAULT ''`);

// Close the database before the process exits so better-sqlite3 Statement
// cleanup hooks are removed while the Node environment is still alive.
function closeDb() { try { db.close(); } catch { /* already closed */ } }
process.once('SIGTERM', () => { closeDb(); process.kill(process.pid, 'SIGTERM'); });
process.once('SIGINT',  () => { closeDb(); process.kill(process.pid, 'SIGINT'); });
process.on('exit', closeDb);
