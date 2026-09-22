// pgdb.js — PostgreSQL access for the school portal + registration pages.
//
// Browsers cannot connect to PostgreSQL directly, so every read/write goes
// through the whitelisted portal API on the learning server (api_server.py
// on :5055, proxied by Vite at /api/portal/*). The server talks to
// PostgreSQL with psycopg2 and auto-applies backend/POSTGRES_SCHEMA.sql.
//
// Every helper resolves to the same { data, error } shape the old
// supabase-js calls destructured, so page code stays minimal:
//   const { data, error } = await pgSelect('students', { select: '...' , eq: { ... } })
// Error objects carry the real PostgreSQL error code (23505 duplicate key,
// PGRST205 missing table, ...) in `code`.

const API = '/api/portal'

async function pgPost(path, body) {
  const r = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let j = null
  try { j = await r.json() } catch { /* non-JSON response */ }
  const error = j?.error || (r.ok ? null : { message: `HTTP ${r.status}`, code: '' })
  // Most portal endpoints answer { data: ..., error: ... }. /stats is the
  // exception: it historically returned its payload at the top level with no
  // `data` key. Keep that payload instead of dropping it to null, so pgStats()
  // can unwrap either shape (see below).
  const payload = (j && typeof j === 'object' && 'data' in j) ? j.data : (j ?? null)
  return { data: payload, error }
}

// SELECT — mirrors .from(table).select(cols).eq(k,v).in(col,vals).order(col).limit(n).maybeSingle()
// `limit` is capped server-side (default 5000, max 50000) so one page can
// never drag an entire table across the network.
export function pgSelect(table, opts = {}) {
  const {
    select = '*', eq = {}, in: inFilter = {},
    order = null, ascending = true, limit = null, single = false,
  } = opts
  return pgPost('/query', { table, select, eq, in: inFilter, order, ascending, limit, single })
}

// Aggregated dashboard analytics — counts/averages computed inside
// PostgreSQL (GROUP BY / COUNT / AVG). Use this instead of pulling whole
// tables into the browser to count them in JavaScript.
export function pgStats() {
  // Resolves to the analytics payload itself (not an envelope), because every
  // caller reads it as `s.registration` / `s.learning` / `s.error`.
  //
  // api_server.py answers /api/portal/stats either enveloped
  // ({ data: { learning, registration }, error }) or — on older builds — with
  // learning/registration at the top level. Unwrap whichever arrives so the
  // admin dashboard shows real numbers on both. Without this the payload was
  // silently dropped and every stat card read 0.
  return pgPost('/stats', {}).then(({ data, error }) => {
    const payload = (data && typeof data === 'object') ? data : {}
    return { ...payload, error: error || payload.error || null }
  })
}

// COUNT — mirrors .from(table).select('*', { count: 'exact', head: true })
export function pgCount(table, eq = {}) {
  return pgPost('/count', { table, eq })
}

// INSERT — mirrors .from(table).insert(row)
export function pgInsert(table, row) {
  return pgPost('/insert', { table, row })
}

// UPDATE — mirrors .from(table).update(row).eq(k, v)
export function pgUpdate(table, row, eq = {}) {
  return pgPost('/update', { table, row, eq })
}

// UPSERT — mirrors .from(table).upsert(row, { onConflict: 'a,b' })
export function pgUpsert(table, row, onConflict) {
  return pgPost('/upsert', { table, row, onConflict })
}
