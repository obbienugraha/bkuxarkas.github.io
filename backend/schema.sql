PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS months_data (
  ym TEXT PRIMARY KEY,                 -- YYYY-MM
  rkas_html   TEXT,                    -- snapshot TBODY RKAS
  saved_html  TEXT,                    -- snapshot TBODY Data Tersimpan
  rkas_state  TEXT,                    -- JSON {rowKey:{sw:0/1, hl:0/1}}
  saved_state TEXT,                    -- JSON {rowKey:{sw:0/1, hl:0/1}}
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lists (
  kind  TEXT NOT NULL,                 -- 'pegawai' | 'belanja'
  value TEXT NOT NULL,
  PRIMARY KEY (kind, value)
);
