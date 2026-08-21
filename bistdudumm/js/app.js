/* =============================================================================
   app.js  –  Screens, Navigation, Spiellogik
   ============================================================================= */

import { CATEGORIES, GRADIENTS, gradientCss, gradientOf, veilFor } from './categories.js';
import { WORDS, placeholder } from './words.js';
import {
  Store, DEFAULT_SETTINGS, drawWords, markUsed, poolProgress,
  saveRound, totals, statsSummary, shuffle, uid,
} from './store.js';
import { Sound } from './audio.js';
import { Haptics } from './haptics.js';
import { motion, Motion } from './motion.js';
import { Ai, AiNotConfiguredError } from './ai.js';
import { CONFIG } from './config.js';
import * as T from './copy.js';

/* ------------------------------------------------------------- Mini-Helfer */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const on = (el, ev, fn, o) => el && el.addEventListener(ev, fn, o);
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const raf = () => new Promise(r => requestAnimationFrame(r));

let toastTimer;
function toast(msg, ms = 2400) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), ms);
}

/* --------------------------------------------------------------- Zustand -- */
const G = {
  screen: 'splash',
  cat: null,
  words: [],
  idx: 0,
  hits: [],
  misses: [],
  score: 0,
  combo: 0,
  running: false,
  paused: false,
  remaining: 0,
  deadline: 0,
  lastSecond: -1,
  rafId: 0,
  prepAngle: null,
  prepHinting: false,
  landscapeSince: 0,
  gravityAngle: 0,
  sensorState: 'unknown',   // unknown | granted | denied | unsupported
  useButtons: false,
  wakeLock: null,
  prepTimer: null,
  prepProgress: 0,
  lastRoundId: null,
  boardTab: 'totals',
};

/* ============================================================================
   KATEGORIEN
   ========================================================================== */
const builtinIds = new Set(CATEGORIES.map(c => c.id));

function allCategories() {
  const custom = (Store.state.customCategories || []).map(c => ({ ...c, custom: true }));
  return [...CATEGORIES, ...custom];
}
function catById(id) { return allCategories().find(c => c.id === id) || null; }

function wordsFor(cat) {
  if (!cat) return [];
  if (cat.custom) return (cat.words || []).filter(Boolean);
  const w = WORDS[cat.id];
  return (Array.isArray(w) && w.length) ? w : placeholder(25);
}

/* ============================================================================
   NAVIGATION
   ========================================================================== */
const SCREENS = ['splash', 'home', 'prep', 'round', 'result', 'board'];

function show(name, { silent = false } = {}) {
  if (G.screen === name) return;
  const from = $(`#screen-${G.screen}`);
  const to = $(`#screen-${name}`);
  if (from) { from.classList.add('is-leaving'); from.classList.remove('is-active'); }
  setTimeout(() => from && from.classList.remove('is-leaving'), 320);
  if (to) to.classList.add('is-active');
  G.screen = name;
  document.body.dataset.screen = name;
  if (!silent) Sound.whoosh(name !== 'home');
  const sc = to && to.querySelector('.scroll');
  if (sc) sc.scrollTop = 0;
}

/* ============================================================================
   THEME
   ========================================================================== */
function applyTheme() {
  const s = Store.settings;
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.dataset.contrast = s.highContrast ? 'high' : 'normal';
  $('#btnTheme').textContent = s.theme === 'dark' ? '☀️' : '🌙';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', s.theme === 'dark' ? '#100823' : '#FFF4E4');
}

function toggleTheme() {
  Store.set('settings.theme', Store.settings.theme === 'dark' ? 'light' : 'dark');
  applyTheme();
  Sound.tap(); Haptics.light();
}

/* ============================================================================
   SPLASH
   ========================================================================== */
function buildSplash() {
  const title = $('#splashTitle');
  title.innerHTML = ['Bist', 'Du', 'Dumm?!']
    .map((w, i) => `<span style="animation-delay:${120 + i * 110}ms">${w}</span>`)
    .join(' ');
  $('#splashTag').textContent = T.pick(T.SPLASH_TAGLINES);
}

/* ============================================================================
   HOME
   ========================================================================== */
function renderHome() {
  const cats = allCategories();
  const n = Store.state.rounds.length + 1;
  $('#homeGreeting').textContent = T.pick(T.HOME_GREETINGS).replace('{n}', n);
  $('#homeSub').textContent =
    `${cats.length} Kategorien · ${Store.settings.roundSeconds} Sekunden · null Ausreden`;
  $('#catCount').textContent = `${cats.length}`;
  $('#verLabel').textContent = CONFIG.version;
  renderRecent();
  renderGrid();
}

function renderRecent() {
  const ids = (Store.state.recent || []).slice(0, 8);
  const wrap = $('#recentWrap');
  const row = $('#recentRow');
  const list = ids.map(catById).filter(Boolean);
  wrap.hidden = list.length === 0;
  row.innerHTML = list.map(c => `
    <button class="chip is-grad" data-cat="${esc(c.id)}" style="--grad:${gradientCss(c.g)}">
      <span>${c.emoji}</span><span>${esc(c.name)}</span>
    </button>`).join('');
}

function renderGrid(filter = '') {
  const q = filter.trim().toLowerCase();
  const cats = allCategories().filter(c => !q || c.name.toLowerCase().includes(q));
  const grid = $('#catGrid');

  if (!cats.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
      <div class="big">🤷</div>Nichts gefunden. Vielleicht falsch geschrieben?</div>`;
    return;
  }

  grid.innerHTML = cats.map((c, i) => {
    const total = wordsFor(c).length;
    const p = poolProgress(c.id, total);
    return `
      <button class="cat ${c.custom ? 'is-custom' : ''} ${p > 0.02 ? 'has-pool' : ''}"
              data-cat="${esc(c.id)}"
              style="--grad:${gradientCss(c.g)};--d:${Math.min(i, 18) * 22}ms">
        <span class="ghost" aria-hidden="true">${c.emoji}</span>
        <span class="badge" aria-hidden="true">${c.emoji}</span>
        <span class="label">${esc(c.name)}</span>
        <span class="pool"><i style="width:${Math.round(p * 100)}%"></i></span>
      </button>`;
  }).join('');
}

/* ============================================================================
   START EINER RUNDE  (aus einer echten Nutzergeste heraus!)
   ========================================================================== */
let choosing = false;
async function chooseCategory(cat) {
  if (!cat || choosing) return;      // schützt vor Doppeltipp / Doppelstart
  choosing = true;
  try { await startChosen(cat); } finally { choosing = false; }
}

async function startChosen(cat) {
  const words = wordsFor(cat);
  if (words.length < 3) {
    Sound.error(); Haptics.fail();
    toast('Diese Kategorie hat zu wenige Begriffe. Mindestens 3, bitte.');
    return;
  }
  G.cat = cat;

  // WICHTIG: Die Sensorabfrage muss als Erstes kommen, solange die
  // Nutzergeste noch „frisch“ ist – Safari verlangt transiente Aktivierung.
  const sensorReady = ensureSensor();
  Sound.unlock();
  Sound.select(); Haptics.medium();
  await sensorReady;

  // zuletzt gespielt merken
  const rec = [cat.id, ...(Store.state.recent || []).filter(x => x !== cat.id)].slice(0, 8);
  Store.set('recent', rec);

  startPrep();
}

async function ensureSensor() {
  if (!Motion.available) { G.sensorState = 'unsupported'; return; }
  if (G.sensorState === 'granted') return;
  if (!Motion.needsPermission) { G.sensorState = 'granted'; return; }
  const res = await Motion.requestPermission();
  G.sensorState = res;
  if (res === 'denied') toast(T.SENSOR_DENIED, 3600);
}

/* ============================================================================
   PREP  –  Anleitung, laufende Kalibrierung, 3-2-1
   ========================================================================== */
function startPrep() {
  const cat = G.cat;
  show('prep');

  $('#prepCat').style.setProperty('--grad', gradientCss(cat.g));
  $('#prepCat').innerHTML = `<span>${cat.emoji}</span><span>${esc(cat.name)}</span>`;

  const team = currentTeam();
  $('#prepTeam').hidden = !team;
  if (team) $('#prepTeam').textContent = `${team.emoji || '👥'} ${team.name} ist dran`;

  $('#prepTitle').textContent = T.PREP_TITLE;
  $('#prepSub').textContent = T.pick(T.PREP_SUBS);
  $('#prepStage').innerHTML = `
    <div class="prep-orb" id="prepOrb">
      <svg class="orb-ring" viewBox="0 0 176 176" aria-hidden="true">
        <circle class="bg" cx="88" cy="88" r="77"></circle>
        <circle class="fg" cx="88" cy="88" r="77"></circle>
      </svg>
      <span class="phone-wave"></span><span class="phone-wave"></span>
      <div class="phone"></div>
    </div>`;
  $('#prepActions').hidden = false;
  $('#btnPrepStart').hidden = true;
  $('#prepStatus').textContent = '';
  $('#prepStatus').classList.remove('is-ready');

  G.useButtons = Store.settings.buttons === 'always';
  G.prepProgress = 0;
  G.prepAngle = null;
  document.querySelector('.prep-inner').classList.remove('is-counting');
  requestAnimationFrame(updatePrepOrientation);

  const sensorOk = G.sensorState === 'granted';

  if (sensorOk) {
    motion.reset();
    motion.threshold = Store.settings.tiltThreshold;
    motion.start();
    watchPosition();
    // Notausgang, falls die Erkennung zickt
    setTimeout(() => {
      if (G.screen === 'prep' && $('#btnPrepStart').hidden) {
        $('#btnPrepStart').hidden = false;
        $('#btnPrepStart').textContent = 'Trotzdem starten';
        $('#btnPrepStart').className = 'btn btn-ghost btn-sm';
      }
    }, 6500);
  } else {
    G.useButtons = true;
    $('#prepStatus').textContent =
      G.sensorState === 'denied' ? T.SENSOR_DENIED : T.NO_SENSOR;
    $('#btnPrepStart').hidden = false;
    $('#btnPrepStart').textContent = 'Los geht’s';
    $('#btnPrepStart').className = 'btn btn-primary';
  }
  requestWakeLock();
}

/* ------------------------------------------------- Ausrichtung der Anleitung
   Auf Telefonen wird der Vorbereitungs-Screen um 90° gedreht dargestellt.
   Das ist die Ansage „halt mich quer", ohne dass jemand etwas lesen muss.
   Sobald der Sensor bestätigt, dass wirklich quer gehalten wird, steht der
   Inhalt aufrecht – die Drehung wird dann zur Bestätigung statt zur Aufgabe.
   Auf Tablets und am Rechner passiert nichts davon.
   -------------------------------------------------------------------------- */
function applyPrepRotation(angle, instant = false) {
  const rotor = $('#prepRotor');
  const scr = $('#screen-prep');
  if (!rotor || !scr) return;
  // Beim Betreten sofort setzen – sonst schwenkt der übergroße Kasten
  // eine halbe Sekunde sichtbar durchs Bild.
  if (instant) rotor.style.transition = 'none';
  const W = scr.clientWidth, H = scr.clientHeight;
  const rotated = angle === 90 || angle === 270;
  const w = rotated ? H : W;
  const h = rotated ? W : H;
  rotor.style.width = w + 'px';
  rotor.style.height = h + 'px';
  rotor.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  rotor.classList.toggle('is-wide', w > h + 40);
  rotor.classList.toggle('is-flat', h < 330);
  if (instant) { void rotor.offsetWidth; rotor.style.transition = ''; }
}

/** Hält jemand das Handy gerade quer? Kommt aus der Schwerkraft und gilt
 *  unabhängig davon, ob das Betriebssystem die Seite schon gedreht hat. */
function heldLandscape() {
  if (G.sensorState !== 'granted' || !motion.hasData) return 0;
  const a = motion.screenAngle();
  return (a === 90 || a === 270) ? a : 0;
}

const viewportLandscape = () => window.innerWidth > window.innerHeight;

function updatePrepOrientation() {
  if (G.screen !== 'prep') return;
  const isPhone = Math.min(window.innerWidth, window.innerHeight) < 600;
  const sensed = heldLandscape();

  let target = 0;
  if (!viewportLandscape() && isPhone) {
    // Die Seite ist NICHT mitgedreht. Zwei mögliche Gründe:
    if (sensed && G.landscapeSince && performance.now() - G.landscapeSince > 700) {
      // (a) Drehsperre ist an und das Handy wird schon quer gehalten
      //     -> wir übernehmen die Drehung selbst.
      target = sensed;
    } else {
      // (b) Das Handy ist wirklich hochkant -> quergestellte Ansage.
      target = 90;
    }
  }
  // Bei gedrehter Seite (Auto-Rotation aktiv) bleibt target 0:
  // das Betriebssystem hat die Arbeit schon gemacht, wir dürfen NICHT
  // noch einmal drehen. Genau das war vorher der Fehler.

  G.landscapeSince = sensed
    ? (G.landscapeSince || performance.now())
    : 0;

  // Hinweis nur, solange noch niemand gedreht hat
  G.prepHinting = isPhone && !sensed && !viewportLandscape();

  if (target !== G.prepAngle) {
    const first = G.prepAngle === null;
    G.prepAngle = target;
    applyPrepRotation(target, first);
  }
  const hint = $('#turnHint');
  if (hint) hint.hidden = !G.prepHinting;
}

function watchPosition() {
  clearInterval(G.prepTimer);
  let noData = 0;
  const C = 483.8;                    // Umfang r=77

  G.prepTimer = setInterval(() => {
    if (G.screen !== 'prep') { clearInterval(G.prepTimer); return; }
    const orb = $('#prepOrb');
    const ring = orb && orb.querySelector('.fg');
    if (!ring) return;
    const s = motion.snapshot();
    updatePrepOrientation();

    if (!s.hasData) {
      if (++noData > 16) {           // ~1,6 s ohne Sensordaten
        clearInterval(G.prepTimer);
        G.sensorState = 'unsupported';
        G.useButtons = true;
        $('#prepStatus').textContent = T.NO_SENSOR;
        $('#btnPrepStart').hidden = false;
        $('#btnPrepStart').textContent = 'Los geht’s';
        $('#btnPrepStart').className = 'btn btn-primary';
      }
      return;
    }

    const good = s.upright && s.stable;
    G.prepProgress = clamp(G.prepProgress + (good ? 0.14 : -0.22), 0, 1);
    ring.style.strokeDashoffset = String(C * (1 - G.prepProgress));
    orb.classList.toggle('is-ready', good);

    const st = $('#prepStatus');
    if (good) { st.textContent = T.PREP_READY; st.classList.add('is-ready'); }
    else { st.textContent = s.upright ? 'Ruhig halten …' : 'Noch nicht senkrecht.'; st.classList.remove('is-ready'); }

    if (G.prepProgress >= 1) { clearInterval(G.prepTimer); runCountdown(); }
  }, 100);
}

async function runCountdown() {
  document.querySelector('.prep-inner').classList.add('is-counting');
  $('#prepActions').hidden = true;
  $('#prepStatus').textContent = '';
  $('#prepStatus').classList.remove('is-ready');
  $('#prepTitle').textContent = 'Achtung …';
  $('#prepSub').textContent = '';

  // Uhrwerk-Ticken über die gesamten drei Sekunden
  let tickCount = 0;
  const ticker = setInterval(() => {
    if (Store.settings.tickSound) Sound.tick(tickCount % 2 === 1, 0.85);
    updatePrepOrientation();     // dreht mit, falls jetzt noch gedreht wird
    tickCount++;
  }, 250);

  for (const n of [3, 2, 1]) {
    if (G.screen !== 'prep') { clearInterval(ticker); return; }
    $('#prepStage').innerHTML =
      `<div style="position:relative;display:grid;place-items:center">
         <span class="count-ring"></span>
         <div class="count-num">${n}</div>
       </div>`;
    Sound.countBeep(n); Haptics.countdown();
    await sleep(1000);
  }
  clearInterval(ticker);
  if (G.screen !== 'prep') return;
  startRound();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ============================================================================
   RUNDE
   ========================================================================== */
function startRound() {
  const cat = G.cat;
  const pool = wordsFor(cat);
  const seconds = Store.settings.roundSeconds;

  closePauseUi();
  G.words = drawWords(cat.id, pool, Math.max(60, Math.min(pool.length, 250)));
  G.idx = 0; G.hits = []; G.misses = []; G.score = 0; G.combo = 0;
  G.running = true;
  G.lastSecond = -1;
  G.deadline = performance.now() + seconds * 1000;

  $('#roundBg').style.setProperty('--grad', gradientCss(cat.g, 165));
  // nur so viel abdunkeln, wie für lesbare weiße Schrift nötig ist
  $('#roundBg').style.setProperty('--round-veil', String(veilFor(cat.g)));
  $('#hudCat').innerHTML = `<span>${cat.emoji}</span><span>${esc(cat.name)}</span>`;
  $('#hudScore').textContent = '0';
  $('#timerText').textContent = String(seconds);
  $('#timer').className = 'timer';

  const sensorOn = G.sensorState === 'granted' && motion.hasData;
  $('#fallbackBtns').hidden = !(G.useButtons || !sensorOn);
  $('#roundHint').hidden = !sensorOn;

  // Nulllage EXAKT jetzt einfrieren. Der Rückgabewert (Schwerkraftwinkel im
  // Geräte-Koordinatensystem) wird gemerkt, aber nicht blind angewendet –
  // siehe roundReadingAngle().
  if (sensorOn) G.gravityAngle = motion.freeze();
  else G.gravityAngle = G.prepAngle || 0;
  const angle = roundReadingAngle();

  show('round', { silent: true });
  Sound.go(); Haptics.start();

  applyRotation(angle);
  nextWord(true);
  // Nach dem Layout noch einmal messen – dann stimmen die Maße garantiert.
  requestAnimationFrame(() => { applyRotation(angle); fitWord(); });

  requestAnimationFrame(tickLoop);
  requestWakeLock();
}

/**
 * Wie muss der Spielbildschirm gedreht werden?
 * Hat das Betriebssystem die Seite bereits mitgedreht (Auto-Rotation an),
 * steht der Inhalt schon richtig – dann NICHT noch einmal drehen.
 * Nur bei gesperrter Drehung übernehmen wir den Schwerkraftwinkel.
 */
function roundReadingAngle() {
  return viewportLandscape() ? 0 : (G.gravityAngle || 0);
}

function applyRotation(angle) {
  const rotor = $('#roundRotor');
  const layer = $('.round-layer');
  const W = layer.clientWidth, H = layer.clientHeight;
  const rotated = angle === 90 || angle === 270;
  if (rotated) {
    rotor.style.width = H + 'px';
    rotor.style.height = W + 'px';
    rotor.style.padding = '16px 24px';
  } else {
    rotor.style.width = ''; rotor.style.height = ''; rotor.style.padding = '';
  }
  rotor.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  $('#roundStage').className = `round-stage rot-${angle}`;
}

function tickLoop(now) {
  if (!G.running) return;
  const total = Store.settings.roundSeconds * 1000;
  const left = Math.max(0, G.deadline - now);
  const frac = left / total;

  const C = 144.51;
  $('#timer .fg').style.strokeDashoffset = String(C * (1 - frac));

  const secs = Math.ceil(left / 1000);
  if (secs !== G.lastSecond) {
    G.lastSecond = secs;
    $('#timerText').textContent = String(secs);
    const t = $('#timer');
    t.classList.toggle('is-urgent', secs <= 20 && secs > 10);
    t.classList.toggle('is-critical', secs <= 10);
    if (secs <= 10 && secs > 0) { Sound.urgent(secs); Haptics.light(); }
    else if (Store.settings.tickSound && secs > 0) { Sound.tick(secs % 2 === 0, secs <= 25 ? 0.9 : 0.5); }
  }

  if (left <= 0) { endRound(); return; }
  G.rafId = requestAnimationFrame(tickLoop);
}

function nextWord(first = false) {
  if (G.idx >= G.words.length) { endRound(); return; }
  const w = G.words[G.idx];
  const el = $('#wordEl');
  el.textContent = w;
  if (!first) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }
  $('#wordCount').textContent = `${G.idx + 1} / ${G.words.length}`;
  fitWord();
}

/**
 * Schriftgröße an Box und Wortlänge anpassen: so groß wie möglich, nie
 * abgeschnitten, und Wörter werden nur im Notfall getrennt.
 */
function fitWord() {
  const stage = $('#roundStage');
  const el = $('#wordEl');
  const cnt = $('#wordCount');
  if (!stage || !el) return;

  const cs = getComputedStyle(stage);
  const availH = stage.clientHeight
    - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    - (cnt ? cnt.offsetHeight : 0) - 16;

  el.classList.remove('break-any');
  // .word ist width:100% – die Breite hängt nicht von der Schriftgröße ab
  const availW = el.clientWidth;
  if (availW <= 10 || availH <= 30) return;

  const fits = () => el.scrollHeight <= availH && el.scrollWidth <= availW + 1;

  /** Größte passende Schriftgröße per Intervallhalbierung (12 Schritte genügen). */
  const search = (breakAny) => {
    el.classList.toggle('break-any', breakAny);
    let lo = 20, hi = 200, best = 20;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = mid + 'px';
      if (fits()) { best = mid; lo = mid; } else { hi = mid; }
    }
    el.style.fontSize = best + 'px';
    return best;
  };

  // 1. Durchgang: nur an Leerzeichen umbrechen – so bleiben Wörter ganz.
  const plain = search(false);
  if (plain >= 60) return;

  // 2. Durchgang: bei einem einzelnen Monsterwort darf getrennt werden.
  //    Nur übernehmen, wenn es spürbar mehr Größe bringt.
  const broken = search(true);
  if (broken <= plain * 1.2) search(false);
}

function register(kind) {
  if (!G.running) return;
  const word = G.words[G.idx];
  if (word == null) return;

  if (kind === 'hit') {
    G.hits.push(word); G.score++; G.combo++;
    $('#hudScore').textContent = String(G.score);
    Sound.hit(G.combo - 1); Haptics.success();
    flash('hit', T.pick(T.HIT_WORDS));
    burstConfetti(Math.min(10 + G.combo * 3, 34));
  } else {
    G.misses.push(word); G.combo = 0;
    Sound.miss(); Haptics.fail();
    flash('miss', T.pick(T.MISS_WORDS));
  }
  G.idx++;
  nextWord();
}

function flash(kind, text) {
  const f = $('#flash');
  f.className = `flash ${kind}`;
  $('#flashText').textContent = text;
  void f.offsetWidth;
  f.classList.add('is-on');
  setTimeout(() => f.classList.remove('is-on'), 620);
}

const CONFETTI_COLORS = ['#C8FF4D', '#FF3D8A', '#38E1FF', '#FFD93D', '#A855F7', '#FF8A3D'];
function burstConfetti(n = 18) {
  const host = $('#confetti');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.left = (8 + Math.random() * 84) + '%';
    s.style.background = CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
    s.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    s.style.setProperty('--rot', (Math.random() * 1080 - 360) + 'deg');
    s.style.setProperty('--dur', (1.5 + Math.random() * 1.3) + 's');
    s.style.setProperty('--delay', (Math.random() * .18) + 's');
    s.style.width = (6 + Math.random() * 6) + 'px';
    s.style.height = (9 + Math.random() * 9) + 'px';
    frag.appendChild(s);
  }
  host.appendChild(frag);
  setTimeout(() => { while (host.firstChild && host.childElementCount > 90) host.removeChild(host.firstChild); }, 100);
  setTimeout(() => { host.innerHTML = ''; }, 3200);
}

/* ------------------------------------------------------- Pause / Abbruch -- */

function pauseRound() {
  if (!G.running || G.paused) return;
  G.running = false;
  G.paused = true;
  cancelAnimationFrame(G.rafId);
  G.remaining = Math.max(0, G.deadline - performance.now());

  $('#roundRotor').classList.add('is-paused');
  $('#pauseOverlay').hidden = false;
  $('#pauseActions').hidden = false;
  $('#pauseCount').hidden = true;
  $('#pauseTitle').textContent = 'Kurze Pause';
  $('#pauseSub').textContent = T.pick(T.PAUSE_SUBS);
  Sound.back(); Haptics.medium();
}

function closePauseUi() {
  G.paused = false;
  $('#pauseOverlay').hidden = true;
  $('#pauseActions').hidden = false;
  $('#pauseCount').hidden = true;
  $('#roundRotor').classList.remove('is-paused');
}

/** Weiterspielen – mit erneutem 3-2-1, weil das Handy zwischendurch bewegt wurde. */
async function resumeRound() {
  if (!G.paused) return;
  $('#pauseActions').hidden = true;
  $('#pauseTitle').textContent = 'Handy wieder vor die Brust';
  $('#pauseSub').textContent = '';
  const cd = $('#pauseCount');
  cd.hidden = false;

  for (const n of [3, 2, 1]) {
    if (G.screen !== 'round' || !G.paused) return;
    cd.textContent = String(n);
    cd.style.animation = 'none'; void cd.offsetWidth; cd.style.animation = '';
    Sound.countBeep(n); Haptics.countdown();
    await sleep(900);
  }
  if (G.screen !== 'round' || !G.paused) return;

  closePauseUi();

  // Nulllage neu einfrieren – die Haltung hat sich garantiert geändert
  if (G.sensorState === 'granted' && motion.hasData) {
    const angle = motion.freeze();
    applyRotation(angle);
    requestAnimationFrame(() => { applyRotation(angle); fitWord(); });
  }

  G.deadline = performance.now() + G.remaining;
  G.lastSecond = -1;
  G.running = true;
  Sound.go(); Haptics.start();
  requestAnimationFrame(tickLoop);
}

/** Runde sofort beenden, Punkte zählen trotzdem. */
function finishFromPause() {
  if (!G.paused) return;
  closePauseUi();
  G.running = true;         // damit endRound() greift
  endRound();
}

/** Runde wegwerfen – nichts wird gespeichert, keine Begriffe verbraucht. */
function discardRound() {
  closePauseUi();
  abortRound();
  Sound.back(); Haptics.heavy();
  toast('Verworfen. Als wäre nichts gewesen.');
  show('home'); renderHome();
}

function endRound() {
  if (!G.running) return;
  G.running = false;
  G.paused = false;
  cancelAnimationFrame(G.rafId);
  motion.stop();
  releaseWakeLock();

  Sound.end(); Haptics.end();

  const shown = [...G.hits, ...G.misses];
  markUsed(G.cat.id, shown);

  const team = currentTeam();
  const round = {
    catId: G.cat.id,
    catName: G.cat.name,
    teamId: team ? team.id : null,
    teamName: team ? team.name : null,
    score: G.score,
    hits: G.hits,
    misses: G.misses,
    seconds: Store.settings.roundSeconds,
  };
  saveRound(round);
  G.lastRoundId = Store.state.rounds[Store.state.rounds.length - 1].id;
  rotateTeam();

  setTimeout(() => renderResult(round), 480);
}

function abortRound() {
  G.running = false;
  G.paused = false;
  cancelAnimationFrame(G.rafId);
  motion.stop();
  releaseWakeLock();
  clearInterval(G.prepTimer);
  const rotor = $('#roundRotor');
  if (rotor) rotor.classList.remove('is-paused');
  const ov = $('#pauseOverlay');
  if (ov) ov.hidden = true;
}

/* ============================================================================
   AUSWERTUNG
   ========================================================================== */
function renderResult(round) {
  show('result');
  const v = T.verdictFor(round.score);
  $('#resultShout').textContent = T.pick(T.ROUND_END_SHOUTS);
  $('#resultCat').textContent = `${G.cat.emoji} ${G.cat.name}`;
  $('#resultVerdict').textContent = v.title;
  $('#resultLine').textContent = v.line;
  $('#resultCounts').textContent = `${round.hits.length} richtig · ${round.misses.length} gepasst`;

  // Punkte hochzählen
  const el = $('#resultScore');
  el.textContent = '0';
  let i = 0;
  const step = () => {
    if (i > round.score) return;
    el.textContent = String(i);
    if (i > 0) Sound.countUp(i);
    i++;
    if (i <= round.score) setTimeout(step, Math.max(45, 260 / Math.max(1, round.score)));
    else if (round.score >= 10) setTimeout(() => { Sound.fanfare(); burstConfetti(70); }, 180);
  };
  setTimeout(step, 360);

  const all = [
    ...round.hits.map(w => ({ w, hit: true })),
    ...round.misses.map(w => ({ w, hit: false })),
  ];
  $('#resultWords').innerHTML = all.length ? all.map((x, i) => `
    <div class="wl ${x.hit ? 'hit' : 'miss'}" style="--d:${Math.min(i, 14) * 35}ms">
      <span class="mark">${x.hit ? '✓' : '⏭'}</span>
      <span class="grow">${esc(x.w)}</span>
    </div>`).join('')
    : `<div class="empty">Kein einziger Begriff. Habt ihr geschlafen?</div>`;

  renderTeamAssign(round);
}

function renderTeamAssign(round) {
  const teams = Store.state.teams || [];
  const wrap = $('#teamAssignWrap');
  wrap.hidden = teams.length === 0;
  if (!teams.length) return;
  const rec = Store.state.rounds.find(r => r.id === G.lastRoundId);
  $('#teamAssign').innerHTML = teams.map(t => `
    <button class="chip ${rec && rec.teamId === t.id ? 'is-on' : ''}" data-team="${esc(t.id)}">
      <span>${t.emoji || '👥'}</span><span>${esc(t.name)}</span>
    </button>`).join('');
}

/* ============================================================================
   TEAMS
   ========================================================================== */
function currentTeam() {
  const teams = Store.state.teams || [];
  if (!teams.length) return null;
  const i = (Store.state.activeTeamIdx || 0) % teams.length;
  return teams[i];
}
function rotateTeam() {
  const teams = Store.state.teams || [];
  if (!teams.length) return;
  Store.set('activeTeamIdx', ((Store.state.activeTeamIdx || 0) + 1) % teams.length);
}

/* ============================================================================
   GESAMTSTAND / STATISTIK
   ========================================================================== */
function renderBoard() {
  const isTotals = G.boardTab === 'totals';
  $$('#boardTabs button').forEach(b => b.classList.toggle('is-on', b.dataset.tab === G.boardTab));
  $('#boardTotals').hidden = !isTotals;
  $('#boardStats').hidden = isTotals;
  isTotals ? renderTotals() : renderStats();
}

function renderTotals() {
  const list = totals();
  const host = $('#boardTotals');
  if (!list.length) {
    host.innerHTML = `<div class="empty"><div class="big">🥱</div>${T.EMPTY_TOTALS}</div>`;
    return;
  }
  const teams = Store.state.teams || [];
  host.innerHTML = `
    ${list.map((t, i) => `
      <div class="rank ${i === 0 ? 'top' : ''}">
        <div class="pos">${i === 0 ? '👑' : i + 1}</div>
        <div class="grow">
          <div class="rt">${esc(t.name)}</div>
          <div class="rs">${t.rounds} Runde${t.rounds === 1 ? '' : 'n'} ·
            ${t.shown ? Math.round(t.hits / t.shown * 100) : 0} % Trefferquote</div>
        </div>
        <div class="pts">${t.score}</div>
      </div>`).join('')}
    <button class="btn btn-ghost btn-sm" id="btnManageTeams" style="margin-top:14px">
      ${teams.length ? '👥 Teams verwalten' : '👥 Teams anlegen'}
    </button>
    <button class="btn btn-ghost btn-sm" id="btnResetTotals" style="margin-top:10px;color:var(--bad)">
      Gesamtstand zurücksetzen
    </button>`;

  on($('#btnManageTeams'), 'click', openTeams);
  on($('#btnResetTotals'), 'click', () => {
    Store.update(s => { s.rounds = []; s.activeTeamIdx = 0; });
    Sound.back(); Haptics.medium(); toast('Weg damit. Neuanfang.');
    renderBoard();
  });
}

function renderStats() {
  const s = statsSummary();
  const host = $('#boardStats');
  if (!s.rounds) {
    host.innerHTML = `<div class="empty"><div class="big">📉</div>${T.EMPTY_STATS}</div>`;
    return;
  }
  const mins = Math.round(s.seconds / 60);
  host.innerHTML = `
    <div class="stat-grid">
      <div class="stat"><div class="v">${s.rounds}</div><div class="k">RUNDEN</div></div>
      <div class="stat"><div class="v">${s.quota}%</div><div class="k">TREFFERQUOTE</div></div>
      <div class="stat"><div class="v">${s.hits}</div><div class="k">ERRATEN</div></div>
      <div class="stat"><div class="v">${s.misses}</div><div class="k">GEPASST</div></div>
      <div class="stat"><div class="v">${s.best}</div><div class="k">BESTE RUNDE</div></div>
      <div class="stat"><div class="v">${s.avg}</div><div class="k">Ø PRO RUNDE</div></div>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="eyebrow">Trefferquote</div>
      <div class="meter"><i style="width:${s.quota}%"></i></div>
      <p class="body" style="margin-top:10px">${esc(T.statComment(s.quota))}</p>
    </div>

    <div class="card" style="margin-top:12px">
      <div class="row"><div class="grow"><div class="rt">Lieblingskategorie</div>
        <div class="rs">${s.favourite
          ? esc(s.favourite.name) + ' · ' + s.favourite.rounds + ' Runde' + (s.favourite.rounds === 1 ? '' : 'n')
          : '–'}</div></div></div>
      <div class="row"><div class="grow"><div class="rt">Spielzeit gesamt</div>
        <div class="rs">${mins} Minuten deines Lebens</div></div></div>
      <div class="row"><div class="grow"><div class="rt">Begriffe gesehen</div>
        <div class="rs">${s.shown}</div></div></div>
    </div>`;
}

/* ============================================================================
   SHEETS
   ========================================================================== */
function openSheet(title, html, onMount) {
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = html;
  $('#sheet').classList.add('is-open');
  $('#sheetBackdrop').classList.add('is-open');
  Sound.tap();
  if (onMount) onMount($('#sheetBody'));
}
function closeSheet() {
  $('#sheet').classList.remove('is-open');
  $('#sheetBackdrop').classList.remove('is-open');
  Sound.back();
}

/* ------------------------------------------------------------ Einstellungen */
function openSettings() {
  const s = Store.settings;
  openSheet('Einstellungen', `
    <div class="field">
      <label>Rundendauer</label>
      <div class="seg" data-seg="roundSeconds">
        ${[60, 80, 100, 120, 150].map(v =>
          `<button data-v="${v}" class="${s.roundSeconds === v ? 'is-on' : ''}">${v}s</button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>Darstellung</label>
      <div class="seg" data-seg="theme">
        <button data-v="dark" class="${s.theme === 'dark' ? 'is-on' : ''}">🌙 Dunkel</button>
        <button data-v="light" class="${s.theme === 'light' ? 'is-on' : ''}">☀️ Hell</button>
      </div>
    </div>

    <div class="field">
      <label>Empfindlichkeit Neigungssensor</label>
      <div class="seg" data-seg="tiltThreshold">
        <button data-v="0.38" class="${s.tiltThreshold <= .42 ? 'is-on' : ''}">Sensibel</button>
        <button data-v="0.55" class="${s.tiltThreshold > .42 && s.tiltThreshold < .68 ? 'is-on' : ''}">Normal</button>
        <button data-v="0.72" class="${s.tiltThreshold >= .68 ? 'is-on' : ''}">Träge</button>
      </div>
    </div>

    <div class="field">
      <label>Fallback-Buttons</label>
      <div class="seg" data-seg="buttons">
        <button data-v="auto" class="${s.buttons === 'auto' ? 'is-on' : ''}">Nur wenn nötig</button>
        <button data-v="always" class="${s.buttons === 'always' ? 'is-on' : ''}">Immer zeigen</button>
      </div>
    </div>

    <div class="card" style="margin-top:6px">
      ${toggleRow('sound', '🔊 Sound', 'Töne für Richtig, Passen, Countdown', s.sound)}
      ${toggleRow('tickSound', '⏱️ Uhrticken', 'Hörbarer Sekundentakt in der Runde', s.tickSound)}
      ${toggleRow('haptics', '📳 Vibration', 'Auf dem iPhone eingeschränkt möglich', s.haptics)}
      ${toggleRow('highContrast', '🔆 Kontrastmodus', 'Für draußen und grelles Licht', s.highContrast)}
    </div>

    <button class="btn btn-ghost btn-sm" id="btnClearPools" style="margin-top:16px">
      🔄 Begriffs-Gedächtnis leeren
    </button>
    <button class="btn btn-ghost btn-sm" id="btnWipe" style="margin-top:10px;color:var(--bad)">
      Alles zurücksetzen
    </button>
    <p class="tiny" style="margin-top:16px;text-align:center;line-height:1.6">
      Version ${CONFIG.version} · Daten liegen nur auf diesem Gerät.<br>
      Neigungssensor: ${sensorStatusLabel()}<br>
      Einmal abgelehnt? iPhone: Einstellungen → Apps → Safari →
      Erweitert → Website-Daten löschen, dann Seite neu laden.
    </p>
  `, body => {
    $$('.seg', body).forEach(seg => {
      on(seg, 'click', e => {
        const b = e.target.closest('button[data-v]'); if (!b) return;
        const key = seg.dataset.seg;
        let v = b.dataset.v;
        if (key === 'roundSeconds') v = +v;
        if (key === 'tiltThreshold') v = +v;
        Store.set('settings.' + key, v);
        $$('button', seg).forEach(x => x.classList.toggle('is-on', x === b));
        Sound.tap(); Haptics.light();
        if (key === 'theme') applyTheme();
        if (key === 'roundSeconds') renderHome();
      });
    });

    $$('[data-toggle]', body).forEach(row => {
      on(row, 'click', () => {
        const key = row.dataset.toggle;
        const v = !Store.settings[key];
        Store.set('settings.' + key, v);
        row.querySelector('.switch').classList.toggle('is-on', v);
        if (key === 'sound') Sound.setEnabled(v);
        if (key === 'haptics') Haptics.setEnabled(v);
        if (key === 'highContrast') applyTheme();
        Sound.tap(); Haptics.light();
      });
    });

    on($('#btnClearPools', body), 'click', () => {
      Store.update(st => { st.pools = {}; });
      toast('Alle Begriffe sind wieder frisch.'); Sound.select(); renderGrid($('#catSearch').value);
    });
    on($('#btnWipe', body), 'click', async () => {
      await Store.reset();
      applyTheme(); renderHome(); closeSheet();
      toast('Alles weg. Als wärst du nie hier gewesen.');
    });
  });
}

function sensorStatusLabel() {
  return {
    granted: 'aktiv ✅',
    denied: 'abgelehnt ⛔️',
    unsupported: 'nicht verfügbar (Buttons werden genutzt)',
    unknown: 'wird beim ersten Start abgefragt',
  }[G.sensorState] || '–';
}

function toggleRow(key, title, sub, on_) {
  return `
    <div class="row" data-toggle="${key}">
      <div class="grow"><div class="rt">${title}</div><div class="rs">${sub}</div></div>
      <div class="switch ${on_ ? 'is-on' : ''}"><i></i></div>
    </div>`;
}

/* --------------------------------------------------------- Eigene Kategorie */
const EMOJI_CHOICES = ['🎉','🔥','💀','🍻','🧠','👻','🦄','🌮','🚀','🎤','🕹️','🐙','🪩','🧊','🎯','🍑','😈','🧨'];

function openCategoryEditor(existing = null) {
  const c = existing || { id: null, name: '', emoji: '🎉', g: 'grape', words: [] };
  const gradKeys = Object.keys(GRADIENTS);

  openSheet(existing ? 'Kategorie bearbeiten' : 'Eigene Kategorie', `
    <div class="field">
      <label>Name</label>
      <input class="input" id="ccName" maxlength="42" placeholder="z. B. Insider vom Junggesellenabschied" value="${esc(c.name)}">
    </div>

    <div class="field">
      <label>Icon</label>
      <div class="emoji-pick" id="ccEmoji">
        ${EMOJI_CHOICES.map(e => `<button data-e="${e}" class="${c.emoji === e ? 'is-on' : ''}">${e}</button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>Farbe</label>
      <div class="grad-pick" id="ccGrad">
        ${gradKeys.map(k => `<button data-g="${k}" class="${c.g === k ? 'is-on' : ''}" style="--grad:${gradientCss(k)}"></button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>Begriffe – einer pro Zeile</label>
      <textarea class="textarea" id="ccWords" placeholder="Currywurst&#10;Nacktschnecke&#10;Steuererklärung">${esc((c.words || []).join('\n'))}</textarea>
      <p class="tiny" id="ccCount" style="margin-top:6px"></p>
    </div>

    <div class="card" style="margin-bottom:16px;border-style:dashed">
      <div class="eyebrow" style="margin-bottom:8px">✨ Mit KI füllen</div>
      <input class="input" id="aiTopic" placeholder="${esc(T.AI_PLACEHOLDER)}">
      <div class="btn-row" style="margin-top:10px">
        <button class="btn btn-ghost btn-sm" id="aiSpicy">🌶️ Ü18: aus</button>
        <button class="btn btn-primary btn-sm" id="aiGo">Generieren</button>
      </div>
      <p class="tiny" id="aiHint" style="margin-top:10px;line-height:1.5">
        ${Ai.available ? 'Verbunden. Los geht’s.' : esc(T.AI_NOT_CONNECTED)}
      </p>
    </div>

    <button class="btn btn-primary" id="ccSave">${existing ? 'Speichern' : 'Kategorie anlegen'}</button>
    ${existing ? `<button class="btn btn-ghost btn-sm" id="ccDelete" style="margin-top:10px;color:var(--bad)">Löschen</button>` : ''}
  `, body => {
    let emoji = c.emoji, grad = c.g, spicy = false;

    const count = () => {
      const n = parseWords($('#ccWords', body).value).length;
      $('#ccCount', body).textContent = n
        ? `${n} Begriff${n === 1 ? '' : 'e'}${n < 3 ? ' – mindestens 3 bitte' : ''}`
        : 'Noch nichts. Mut zur Lücke ist hier keine Tugend.';
    };
    count();
    on($('#ccWords', body), 'input', count);

    on($('#ccEmoji', body), 'click', e => {
      const b = e.target.closest('button[data-e]'); if (!b) return;
      emoji = b.dataset.e;
      $$('button', $('#ccEmoji', body)).forEach(x => x.classList.toggle('is-on', x === b));
      Sound.tap(); Haptics.light();
    });
    on($('#ccGrad', body), 'click', e => {
      const b = e.target.closest('button[data-g]'); if (!b) return;
      grad = b.dataset.g;
      $$('button', $('#ccGrad', body)).forEach(x => x.classList.toggle('is-on', x === b));
      Sound.tap(); Haptics.light();
    });

    on($('#aiSpicy', body), 'click', e => {
      spicy = !spicy;
      e.currentTarget.textContent = spicy ? '🌶️ Ü18: an' : '🌶️ Ü18: aus';
      Sound.tap();
    });

    on($('#aiGo', body), 'click', async e => {
      const topic = $('#aiTopic', body).value.trim() || $('#ccName', body).value.trim();
      if (!topic) { toast('Erst ein Thema, dann Magie.'); Sound.error(); return; }
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = 'Denkt nach …';
      try {
        const words = await Ai.generate({ topic, spicy, exclude: parseWords($('#ccWords', body).value) });
        const ta = $('#ccWords', body);
        ta.value = [...parseWords(ta.value), ...words].join('\n');
        count(); Sound.fanfare(); Haptics.success();
        toast(`${words.length} Begriffe dazu.`);
      } catch (err) {
        Sound.error(); Haptics.fail();
        $('#aiHint', body).textContent = err instanceof AiNotConfiguredError
          ? T.AI_NOT_CONNECTED
          : `Hat nicht geklappt: ${err.message}`;
      } finally {
        btn.disabled = false; btn.textContent = 'Generieren';
      }
    });

    on($('#ccSave', body), 'click', () => {
      const name = $('#ccName', body).value.trim();
      const words = parseWords($('#ccWords', body).value);
      if (!name) { toast('Ohne Namen wird das nichts.'); Sound.error(); return; }
      if (words.length < 3) { toast('Mindestens 3 Begriffe. Streng dich an.'); Sound.error(); return; }

      Store.update(st => {
        if (existing) {
          const i = st.customCategories.findIndex(x => x.id === existing.id);
          if (i >= 0) st.customCategories[i] = { ...st.customCategories[i], name, emoji, g: grad, words };
        } else {
          st.customCategories.push({ id: 'c_' + uid(), name, emoji, g: grad, words, createdAt: Date.now() });
        }
      });
      Sound.select(); Haptics.success();
      toast(existing ? 'Gespeichert.' : 'Kategorie angelegt. Hoffentlich lustig.');
      closeSheet(); renderHome();
    });

    if (existing) {
      on($('#ccDelete', body), 'click', () => {
        Store.update(st => {
          st.customCategories = st.customCategories.filter(x => x.id !== existing.id);
        });
        Sound.back(); Haptics.heavy();
        toast('Gelöscht. Kein Verlust.');
        closeSheet(); renderHome();
      });
    }
  });
}

const parseWords = txt => [...new Set(
  String(txt).split(/\r?\n|;|,/).map(s => s.trim()).filter(Boolean)
)];

/* -------------------------------------------------------------------- Teams */
function openTeams() {
  const teams = Store.state.teams || [];
  openSheet('Teams', `
    <p class="body" style="margin-bottom:14px">
      Ohne Teams zählt die App einfach Runden. Mit Teams gibt es eine echte
      Rangliste – und die App sagt vor jeder Runde an, wer dran ist.
    </p>
    <div id="teamList">
      ${teams.length ? teams.map(t => `
        <div class="row" data-team="${esc(t.id)}">
          <span style="font-size:20px">${t.emoji || '👥'}</span>
          <div class="grow"><div class="rt">${esc(t.name)}</div></div>
          <button class="icon-btn" data-del="${esc(t.id)}" aria-label="Team löschen">🗑️</button>
        </div>`).join('')
      : `<div class="empty">Noch keine Teams. Auch okay.</div>`}
    </div>
    <div class="field" style="margin-top:16px">
      <label>Neues Team</label>
      <input class="input" id="teamName" placeholder="z. B. Die Ahnungslosen" maxlength="24">
    </div>
    <button class="btn btn-primary btn-sm" id="teamAdd">Team hinzufügen</button>
  `, body => {
    const TEAM_EMOJI = ['🐙', '🦊', '🐝', '🦖', '🐧', '🦩', '🐸', '🦔'];
    on($('#teamAdd', body), 'click', () => {
      const name = $('#teamName', body).value.trim();
      if (!name) { Sound.error(); toast('Name fehlt.'); return; }
      Store.update(st => {
        st.teams.push({ id: 't_' + uid(), name, emoji: TEAM_EMOJI[st.teams.length % TEAM_EMOJI.length] });
      });
      Sound.select(); Haptics.success();
      openTeams(); renderBoard();
    });
    on($('#teamList', body), 'click', e => {
      const b = e.target.closest('[data-del]'); if (!b) return;
      Store.update(st => { st.teams = st.teams.filter(t => t.id !== b.dataset.del); });
      Sound.back(); openTeams(); renderBoard();
    });
  });
}

/* ============================================================================
   WAKE LOCK  –  der Bildschirm darf während des Spiels nicht schlafen
   ========================================================================== */
async function requestWakeLock() {
  try {
    if (!('wakeLock' in navigator) || G.wakeLock) return;
    G.wakeLock = await navigator.wakeLock.request('screen');
    G.wakeLock.addEventListener('release', () => { G.wakeLock = null; });
  } catch { /* egal */ }
}
function releaseWakeLock() {
  try { G.wakeLock && G.wakeLock.release(); } catch {}
  G.wakeLock = null;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && (G.screen === 'round' || G.screen === 'prep')) requestWakeLock();
});

/* ============================================================================
   EVENTS
   ========================================================================== */
function wireEvents() {
  // Kategorie-Raster + Zuletzt-Chips
  on($('#catGrid'), 'click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    if (longPressed) { longPressed = false; return; }   // Editor war gerade offen
    chooseCategory(catById(b.dataset.cat));
  });
  on($('#recentRow'), 'click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    chooseCategory(catById(b.dataset.cat));
  });

  // Langes Drücken auf eine eigene Kategorie -> bearbeiten.
  // Wichtig: beim Scrollen abbrechen und den folgenden Klick schlucken,
  // sonst startet hinter dem Editor die Runde.
  let pressTimer = null, longPressed = false, startY = 0, startX = 0;
  const cancelPress = () => { clearTimeout(pressTimer); pressTimer = null; };

  on($('#catGrid'), 'pointerdown', e => {
    longPressed = false;
    const b = e.target.closest('[data-cat]'); if (!b) return;
    const cat = catById(b.dataset.cat);
    if (!cat || !cat.custom) return;
    startX = e.clientX; startY = e.clientY;
    pressTimer = setTimeout(() => {
      longPressed = true; pressTimer = null;
      Haptics.heavy(); Sound.tap();
      openCategoryEditor(Store.state.customCategories.find(c => c.id === cat.id));
    }, 520);
  });
  on($('#catGrid'), 'pointermove', e => {
    if (!pressTimer) return;
    if (Math.abs(e.clientY - startY) > 8 || Math.abs(e.clientX - startX) > 8) cancelPress();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
    on($('#catGrid'), ev, cancelPress, true));
  const homeScroll = document.querySelector('#screen-home .scroll');
  on(homeScroll, 'scroll', cancelPress, { passive: true });

  on($('#btnRandom'), 'click', () => {
    const cats = allCategories().filter(c => wordsFor(c).length >= 3);
    if (!cats.length) return;
    const cat = cats[(Math.random() * cats.length) | 0];
    const tile = $(`#catGrid [data-cat="${CSS.escape(cat.id)}"]`);
    if (tile) { tile.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    Haptics.heavy();
    chooseCategory(cat);
  });

  on($('#catSearch'), 'input', e => renderGrid(e.target.value));
  on($('#btnAddCat'), 'click', () => { Sound.tap(); openCategoryEditor(); });
  on($('#btnTheme'), 'click', toggleTheme);
  on($('#btnSettings'), 'click', () => { Sound.tap(); openSettings(); });
  on($('#btnBoard'), 'click', () => { show('board'); renderBoard(); });
  on($('#btnBoardBack'), 'click', () => show('home'));
  on($('#btnTeams'), 'click', openTeams);
  on($('#boardTabs'), 'click', e => {
    const b = e.target.closest('button[data-tab]'); if (!b) return;
    G.boardTab = b.dataset.tab; Sound.tap(); renderBoard();
  });

  // Prep
  on($('#btnPrepStart'), 'click', () => { clearInterval(G.prepTimer); runCountdown(); });
  on($('#btnPrepBack'), 'click', () => { abortRound(); Sound.back(); show('home'); renderHome(); });

  // Runde
  on($('#btnHit'), 'click', () => register('hit'));
  on($('#btnMiss'), 'click', () => register('miss'));
  on($('#btnRoundExit'), 'click', pauseRound);
  on($('#btnResume'), 'click', resumeRound);
  on($('#btnFinishNow'), 'click', finishFromPause);
  on($('#btnDiscard'), 'click', discardRound);
  motion.addEventListener('gesture', e => {
    if (!G.running) return;
    register(e.detail.dir === 'down' ? 'hit' : 'miss');
  });

  // Ergebnis
  on($('#btnNewCat'), 'click', () => { show('home'); renderHome(); });
  on($('#btnResultHome'), 'click', () => { show('home'); renderHome(); });
  on($('#btnAgain'), 'click', () => chooseCategory(G.cat));
  on($('#btnToBoard'), 'click', () => { show('board'); renderBoard(); });
  on($('#teamAssign'), 'click', e => {
    const b = e.target.closest('[data-team]'); if (!b) return;
    const team = (Store.state.teams || []).find(t => t.id === b.dataset.team);
    Store.update(st => {
      const r = st.rounds.find(x => x.id === G.lastRoundId);
      if (r && team) { r.teamId = team.id; r.teamName = team.name; }
    });
    Sound.tap(); Haptics.light();
    $$('#teamAssign .chip').forEach(c => c.classList.toggle('is-on', c === b));
  });

  // Sheet
  on($('#sheetClose'), 'click', closeSheet);
  on($('#sheetBackdrop'), 'click', closeSheet);
  // Auf dem iPhone schiebt sich die Tastatur über das Eingabefeld –
  // deshalb das fokussierte Feld nach dem Öffnen sichtbar scrollen.
  on($('#sheetBody'), 'focusin', e => {
    const el = e.target;
    if (!el.matches('input, textarea')) return;
    setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 320);
  });

  // Tastatur (Desktop-Test + Barrierefreiheit)
  on(window, 'keydown', e => {
    if (G.screen === 'round') {
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); register('hit'); }
      if (e.key === 'ArrowUp') { e.preventDefault(); register('miss'); }
      if (e.key === 'Escape') { G.paused ? resumeRound() : pauseRound(); }
    } else if (e.key === 'Escape') {
      if ($('#sheet').classList.contains('is-open')) closeSheet();
      else if (G.screen !== 'home' && G.screen !== 'splash') { abortRound(); show('home'); renderHome(); }
    }
  });

  // Dreht das Betriebssystem die Seite mitten im Spiel, muss die eigene
  // Drehung sofort nachziehen – sonst steht der Begriff quer.
  const reflow = () => {
    if (G.screen === 'prep') { G.prepAngle = null; updatePrepOrientation(); }
    if (G.screen === 'round') {
      const a = roundReadingAngle();
      applyRotation(a);
      requestAnimationFrame(() => { applyRotation(a); fitWord(); });
    }
  };
  on(window, 'resize', reflow);
  on(window, 'orientationchange', () => setTimeout(reflow, 280));

  // Erste Berührung: Audio freischalten
  const unlockOnce = async () => { await Sound.unlock(); };
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev =>
    window.addEventListener(ev, unlockOnce, { once: true, passive: true }));

  // Doppeltipp-Zoom auf iOS unterbinden
  let lastTouch = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouch < 320) e.preventDefault();
    lastTouch = now;
  }, { passive: false });
}

/* ============================================================================
   BOOT
   ========================================================================== */
async function boot() {
  await Store.init();
  applyTheme();
  Sound.setEnabled(Store.settings.sound);
  Haptics.setEnabled(Store.settings.haptics);
  Haptics.init();

  buildSplash();
  renderHome();
  wireEvents();

  if (Motion.available) G.sensorState = Motion.needsPermission ? 'unknown' : 'granted';
  else G.sensorState = 'unsupported';

  // Splash lässt sich antippen – niemand mag Wartezeiten zweimal
  let skipped = false;
  const skip = () => { skipped = true; };
  $('#screen-splash').addEventListener('pointerdown', skip, { once: true });

  for (let i = 0; i < 26 && !skipped; i++) await sleep(100);
  show('home', { silent: true });
  Store.set('settings.seenIntro', true);

  // PWA-Shortcut „Zufallskategorie“
  if (new URLSearchParams(location.search).has('random')) {
    const b = $('#btnRandom');
    b.classList.add('nudge');
    setTimeout(() => b.classList.remove('nudge'), 2600);
  }
}

boot();
