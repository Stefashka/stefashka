/* =============================================================================
   store.js  –  Persistenz-Layer
   -----------------------------------------------------------------------------
   Bewusst hinter einem Adapter gekapselt. Heute: localStorage.
   Morgen: Supabase – dann nur `LocalAdapter` gegen einen `SupabaseAdapter`
   tauschen, der dieselben vier Methoden anbietet (readAll / writeAll).
   Die App liest synchron aus dem Cache und schreibt gebündelt/asynchron weg –
   genau das Verhalten, das man bei einem Netzwerk-Backend ohnehin braucht.
   ============================================================================= */

const KEY = 'bdd.state.v1';

export const DEFAULT_SETTINGS = {
  theme: 'dark',            // 'dark' | 'light'
  highContrast: false,
  roundSeconds: 80,
  sound: true,
  haptics: true,
  tickSound: true,
  buttons: 'auto',          // 'auto' | 'always'  – Fallback-Buttons
  tiltThreshold: 0.55,      // 0.35 (sensibel) … 0.75 (träge)
  seenIntro: false,
};

const EMPTY = {
  settings: { ...DEFAULT_SETTINGS },
  customCategories: [],     // {id,name,emoji,g,words[],createdAt}
  pools: {},                // catId -> { used: [] }
  rounds: [],               // {id,catId,catName,teamId,teamName,score,hits[],misses[],at,seconds}
  teams: [],                // {id,name,emoji}
  activeTeamIdx: 0,
  recent: [],               // zuletzt gespielte catIds
};

/** Tiefe Kopie. Bewusst per JSON statt structuredClone – der Zustand ist reines
 *  JSON, und so läuft es auch auf iOS 15.0–15.3 und älteren Android-WebViews. */
const clone = o => JSON.parse(JSON.stringify(o));

/* --------------------------------------------------------------- Adapter -- */

const LocalAdapter = {
  async readAll() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async writeAll(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch { return false; }
  },
};

/* ---------------------------------------------------------------- Store --- */

let adapter = LocalAdapter;
let state = clone(EMPTY);
let flushTimer = null;
const listeners = new Set();

export const Store = {
  /** Adapter austauschen (später: SupabaseAdapter) */
  useAdapter(a) { adapter = a; },

  async init() {
    const loaded = await adapter.readAll();
    if (loaded) {
      state = {
        ...clone(EMPTY),
        ...loaded,
        settings: { ...DEFAULT_SETTINGS, ...(loaded.settings || {}) },
      };
    }
    return state;
  },

  get state() { return state; },
  get settings() { return state.settings; },

  set(path, value) {
    const parts = path.split('.');
    let o = state;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = value;
    this.flush();
    return value;
  },

  update(fn) { fn(state); this.flush(); return state; },

  flush() {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      adapter.writeAll(state);
      listeners.forEach(l => l(state));
    }, 60);
  },

  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  async reset() {
    state = clone(EMPTY);
    await adapter.writeAll(state);
  },
};

/* ------------------------------------------------------------- Wortpool --- */
/**
 * Zieht `count` Begriffe. Regel aus der User Story:
 * Zuerst kommen alle Begriffe dran, die in vorherigen Runden noch NICHT
 * gezogen wurden. Erst wenn der Vorrat leer ist, wird neu gemischt.
 */
export function drawWords(catId, allWords, count) {
  if (!allWords.length) return [];
  const pool = state.pools[catId] || (state.pools[catId] = { used: [] });
  const usedSet = new Set(pool.used);

  let fresh = shuffle(allWords.filter(w => !usedSet.has(w)));
  const out = fresh.slice(0, count);

  if (out.length < count) {
    // Vorrat erschöpft -> Runde zurücksetzen und mit dem Rest auffüllen
    pool.used = [];
    const rest = shuffle(allWords.filter(w => !out.includes(w)));
    out.push(...rest.slice(0, count - out.length));
  }
  Store.flush();
  return out;
}

/** Nach der Runde: tatsächlich gezeigte Begriffe als „verbraucht“ markieren. */
export function markUsed(catId, words) {
  const pool = state.pools[catId] || (state.pools[catId] = { used: [] });
  const set = new Set(pool.used);
  words.forEach(w => set.add(w));
  pool.used = [...set];
  Store.flush();
}

export function poolProgress(catId, total) {
  const used = state.pools[catId]?.used?.length || 0;
  return total ? Math.min(1, used / total) : 0;
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* --------------------------------------------------------------- Runden --- */

export function saveRound(round) {
  state.rounds.push({ id: uid(), at: Date.now(), ...round });
  if (state.rounds.length > 500) state.rounds = state.rounds.slice(-500);
  Store.flush();
}

export function totals() {
  const byTeam = new Map();
  for (const r of state.rounds) {
    const key = r.teamId || '__solo__';
    const name = r.teamName || 'Ohne Team';
    const t = byTeam.get(key) || { id: key, name, score: 0, rounds: 0, hits: 0, shown: 0 };
    t.name = name;
    t.score += r.score;
    t.rounds += 1;
    t.hits += r.hits.length;
    t.shown += r.hits.length + r.misses.length;
    byTeam.set(key, t);
  }
  return [...byTeam.values()].sort((a, b) => b.score - a.score);
}

export function statsSummary() {
  const rounds = state.rounds;
  const hits = rounds.reduce((s, r) => s + r.hits.length, 0);
  const misses = rounds.reduce((s, r) => s + r.misses.length, 0);
  const shown = hits + misses;
  const best = rounds.reduce((m, r) => Math.max(m, r.score), 0);
  const seconds = rounds.reduce((s, r) => s + (r.seconds || 0), 0);
  const byCat = new Map();
  for (const r of rounds) {
    const c = byCat.get(r.catId) || { name: r.catName, rounds: 0, score: 0 };
    c.rounds++; c.score += r.score; byCat.set(r.catId, c);
  }
  const favourite = [...byCat.values()].sort((a, b) => b.rounds - a.rounds)[0] || null;
  return {
    rounds: rounds.length, hits, misses, shown, best, seconds,
    quota: shown ? Math.round((hits / shown) * 100) : 0,
    avg: rounds.length ? +(hits / rounds.length).toFixed(1) : 0,
    favourite,
  };
}

export function uid() {
  return 'x' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}
