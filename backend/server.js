import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';

const PORT   = process.env.PORT   || 5175;
const ORIGIN = process.env.ORIGIN || '*';
const DBPATH = process.env.DB_PATH || './data/simplebos.db';

// ensure DB dir
const dbDir = DBPATH.split('/').slice(0, -1).join('/');
if (dbDir && !fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DBPATH);
const schema = fs.readFileSync(new URL('./schema.sql', import.meta.url)).toString();
db.exec(schema);

const app = express();
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get('/data/:ym', (req, res) => {
  const ym = req.params.ym;
  const row = db.prepare(`
    SELECT ym, rkas_html, saved_html, rkas_state, saved_state, updated_at
    FROM months_data WHERE ym = ?
  `).get(ym);
  if (!row) return res.json({ ym, rkas_html: null, saved_html: null, rkas_state: "{}", saved_state: "{}", updated_at: null });
  res.json(row);
});

app.post('/data', (req, res) => {
  const { ym, rkas_html, saved_html, rkas_state, saved_state } = req.body || {};
  if (!ym || typeof ym !== 'string') return res.status(400).json({ error: 'ym (YYYY-MM) required' });
  db.prepare(`
    INSERT INTO months_data (ym, rkas_html, saved_html, rkas_state, saved_state, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(ym) DO UPDATE SET
      rkas_html   = excluded.rkas_html,
      saved_html  = excluded.saved_html,
      rkas_state  = excluded.rkas_state,
      saved_state = excluded.saved_state,
      updated_at  = datetime('now')
  `).run(ym, rkas_html || null, saved_html || null, rkas_state || "{}", saved_state || "{}");
  res.json({ ok: true, ym });
});

app.get('/lists', (_req, res) => {
  const rows = db.prepare(`SELECT kind, value FROM lists ORDER BY kind, value`).all();
  res.json({
    pegawai: rows.filter(r => r.kind==='pegawai').map(r => r.value),
    belanja: rows.filter(r => r.kind==='belanja').map(r => r.value),
  });
});

app.post('/lists', (req, res) => {
  const { pegawai = [], belanja = [], mode = 'merge' } = req.body || {};
  const insert = db.prepare(`INSERT OR IGNORE INTO lists (kind, value) VALUES (?, ?)`);
  const del = db.prepare(`DELETE FROM lists WHERE kind = ?`);
  const tx = db.transaction(() => {
    if (mode === 'replace') { del.run('pegawai'); del.run('belanja'); }
    for (const v of pegawai) if (v) insert.run('pegawai', String(v).toUpperCase());
    for (const v of belanja) if (v) insert.run('belanja', String(v).toUpperCase());
  });
  tx();
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`[simplebos-db-server] http://localhost:${PORT}`));
