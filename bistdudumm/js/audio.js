/* =============================================================================
   audio.js  –  Komplett synthetisierte Sound-Engine (Web Audio API)
   -----------------------------------------------------------------------------
   Keine Audiodateien: alles wird zur Laufzeit erzeugt. Vorteile:
     • 0 kB Ladezeit, funktioniert offline
     • kein Knacken/Latenz durch Dekodieren
     • Tonhöhen lassen sich dynamisch anpassen (z. B. Combo-Töne)
   iOS-Besonderheiten, die hier bedient werden:
     • AudioContext startet suspendiert -> unlock() bei der ersten Geste
     • navigator.audioSession = 'playback' -> spielt auch bei Stumm-Schalter
   ============================================================================= */

let ctx = null;
let master = null;
let bus = null;         // -> Kompressor -> master
let verb = null;        // Hall-Send
let enabled = true;
let unlocked = false;

/* --------------------------------------------------------------- Aufbau --- */

function build() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC({ latencyHint: 'interactive' });

  master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 22;
  comp.ratio.value = 8;
  comp.attack.value = 0.003;
  comp.release.value = 0.18;
  comp.connect(master);

  bus = ctx.createGain();
  bus.gain.value = 1;
  bus.connect(comp);

  // kleiner, heller Raum – macht alles „teurer“
  const conv = ctx.createConvolver();
  conv.buffer = impulse(1.15, 2.6);
  verb = ctx.createGain();
  verb.gain.value = 0.16;
  verb.connect(conv);
  conv.connect(comp);

  return ctx;
}

function impulse(seconds, decay) {
  const rate = ctx.sampleRate;
  const len = Math.max(1, (rate * seconds) | 0);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

function noiseBuffer(seconds = 0.4) {
  const len = (ctx.sampleRate * seconds) | 0;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/* -------------------------------------------------------------- Bausteine - */

function env(node, t, { a = 0.004, d = 0.12, peak = 0.5, sustain = 0, r = 0.05, hold = 0 } = {}) {
  const g = node.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
  if (sustain > 0) {
    g.exponentialRampToValueAtTime(Math.max(0.0002, sustain), t + a + d);
    g.setValueAtTime(Math.max(0.0002, sustain), t + a + d + hold);
    g.exponentialRampToValueAtTime(0.0001, t + a + d + hold + r);
    return t + a + d + hold + r;
  }
  g.exponentialRampToValueAtTime(0.0001, t + a + d);
  return t + a + d;
}

function tone(freq, t, opts = {}) {
  if (!ctx) return;
  const {
    type = 'sine', detune = 0, send = 0.25, pan = 0,
    glideTo = null, glideTime = 0.12, filter = null, ...envOpts
  } = opts;

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.detune.value = detune;
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + glideTime);

  const g = ctx.createGain();
  let last = osc;

  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = filter.type || 'lowpass';
    f.frequency.setValueAtTime(filter.freq ?? 2000, t);
    if (filter.to) f.frequency.exponentialRampToValueAtTime(filter.to, t + (filter.time ?? 0.2));
    f.Q.value = filter.q ?? 1;
    last.connect(f); last = f;
  }
  last.connect(g);

  const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (p) { p.pan.value = pan; g.connect(p); p.connect(bus); if (send) p.connect(verb); }
  else { g.connect(bus); if (send) g.connect(verb); }

  const end = env(g, t, envOpts);
  osc.start(t);
  osc.stop(end + 0.05);
}

function noise(t, { peak = 0.3, a = 0.001, d = 0.06, freq = 3000, type = 'bandpass', q = 1, send = 0.1 } = {}) {
  if (!ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(Math.max(0.1, a + d + 0.05));
  const f = ctx.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  src.connect(f); f.connect(g); g.connect(bus);
  if (send) g.connect(verb);
  const end = env(g, t, { a, d, peak });
  src.start(t); src.stop(end + 0.05);
}

const now = () => (ctx ? ctx.currentTime + 0.001 : 0);

/* ------------------------------------------------------------- Öffentlich - */

export const Sound = {
  get ready() { return !!ctx && ctx.state === 'running'; },

  setEnabled(v) { enabled = v; if (master) master.gain.value = v ? 0.85 : 0; },

  /** Muss aus einer echten Nutzergeste heraus aufgerufen werden (iOS). */
  async unlock() {
    build();
    if (!ctx) return false;
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch { /* nicht unterstützt – egal */ }
    if (ctx.state !== 'running') { try { await ctx.resume(); } catch {} }
    if (!unlocked) {
      // stiller Anschub, damit iOS die Pipeline wirklich öffnet
      const b = ctx.createBufferSource();
      b.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      b.connect(ctx.destination); b.start(0);
      unlocked = true;
    }
    return ctx.state === 'running';
  },

  /* --- UI ---------------------------------------------------------------- */
  tap() {
    if (!enabled || !build()) return;
    const t = now();
    tone(660, t, { type: 'triangle', peak: 0.10, a: 0.002, d: 0.045, send: 0.1 });
    noise(t, { peak: 0.05, d: 0.025, freq: 5200, q: 0.8, send: 0 });
  },

  select() {
    if (!enabled || !build()) return;
    const t = now();
    tone(523.25, t, { type: 'triangle', peak: 0.16, a: 0.002, d: 0.09, send: 0.2 });
    tone(783.99, t + 0.055, { type: 'triangle', peak: 0.14, a: 0.002, d: 0.11, send: 0.25 });
  },

  back() {
    if (!enabled || !build()) return;
    const t = now();
    tone(520, t, { type: 'triangle', peak: 0.12, a: 0.002, d: 0.08, glideTo: 330, glideTime: 0.09, send: 0.15 });
  },

  whoosh(up = true) {
    if (!enabled || !build()) return;
    const t = now();
    noise(t, {
      peak: 0.14, a: 0.02, d: 0.28, q: 0.7,
      freq: up ? 700 : 2600, type: 'bandpass', send: 0.25,
    });
    tone(up ? 220 : 660, t, { type: 'sine', peak: 0.06, a: 0.02, d: 0.26, glideTo: up ? 660 : 220, glideTime: 0.24, send: 0.3 });
  },

  /* --- Uhr / Countdown ---------------------------------------------------- */
  /** Mechanisches Uhrenticken. `hi` = zweiter, hellerer Halbschlag. */
  tick(hi = false, gainMul = 1) {
    if (!enabled || !build()) return;
    const t = now();
    noise(t, { peak: 0.16 * gainMul, a: 0.0008, d: 0.018, freq: hi ? 3400 : 2400, type: 'bandpass', q: 6, send: 0.06 });
    tone(hi ? 1180 : 880, t, { type: 'square', peak: 0.045 * gainMul, a: 0.001, d: 0.022, send: 0.05,
      filter: { type: 'lowpass', freq: 4200 } });
  },

  /** 3 – 2 – 1: tiefer Gong pro Zahl, steigend. */
  countBeep(n) {
    if (!enabled || !build()) return;
    const t = now();
    const f = { 3: 392.00, 2: 466.16, 1: 587.33 }[n] || 440;
    tone(f, t, { type: 'triangle', peak: 0.30, a: 0.004, d: 0.10, sustain: 0.08, hold: 0.05, r: 0.22, send: 0.4 });
    tone(f * 2, t, { type: 'sine', peak: 0.10, a: 0.004, d: 0.18, send: 0.5 });
    noise(t, { peak: 0.07, d: 0.05, freq: 2600, q: 2, send: 0.2 });
  },

  /** Rundenstart. */
  go() {
    if (!enabled || !build()) return;
    const t = now();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(f, t + i * 0.055, { type: 'triangle', peak: 0.26, a: 0.004, d: 0.12, sustain: 0.06, hold: 0.03, r: 0.3, send: 0.45 });
    });
    noise(t, { peak: 0.12, a: 0.005, d: 0.35, freq: 1400, q: 0.6, send: 0.4 });
  },

  /** Letzte Sekunden – dringlicher Puls. */
  urgent(secondsLeft) {
    if (!enabled || !build()) return;
    const t = now();
    const f = 700 + (10 - Math.min(10, secondsLeft)) * 42;
    tone(f, t, { type: 'square', peak: 0.16, a: 0.002, d: 0.075, send: 0.18,
      filter: { type: 'lowpass', freq: 2600 } });
    noise(t, { peak: 0.07, d: 0.03, freq: 3200, q: 4, send: 0.1 });
  },

  /* --- Spielereignisse ---------------------------------------------------- */
  /** Treffer – heller, „befriedigender“ Glockenakkord; steigt mit der Combo. */
  hit(combo = 0) {
    if (!enabled || !build()) return;
    const t = now();
    const step = Math.min(combo, 6);
    const base = 523.25 * Math.pow(2, step / 12);
    [0, 4, 7, 12].forEach((semi, i) => {
      const f = base * Math.pow(2, semi / 12);
      tone(f, t + i * 0.028, {
        type: i === 3 ? 'sine' : 'triangle',
        peak: 0.30 - i * 0.045, a: 0.003, d: 0.11,
        sustain: 0.05, hold: 0.02, r: 0.34, send: 0.45,
        pan: (i - 1.5) * 0.08,
      });
    });
    // „Sparkle“ obendrauf
    tone(base * 4, t + 0.09, { type: 'sine', peak: 0.09, a: 0.004, d: 0.26, send: 0.6 });
    noise(t, { peak: 0.07, a: 0.002, d: 0.05, freq: 5200, q: 1.2, send: 0.3 });
  },

  /** Passen – kurzes, trocken absackendes Doppel-Blubb. */
  miss() {
    if (!enabled || !build()) return;
    const t = now();
    tone(311.13, t, { type: 'sawtooth', peak: 0.20, a: 0.003, d: 0.10, send: 0.15,
      filter: { type: 'lowpass', freq: 1600, to: 500, time: 0.16 } });
    tone(207.65, t + 0.085, { type: 'sawtooth', peak: 0.22, a: 0.003, d: 0.18, send: 0.2,
      filter: { type: 'lowpass', freq: 1200, to: 380, time: 0.2 } });
    noise(t, { peak: 0.05, d: 0.06, freq: 900, q: 1, send: 0.1 });
  },

  /** Rundenende – Hupe + Moll-Akkord. */
  end() {
    if (!enabled || !build()) return;
    const t = now();
    [220, 261.63, 329.63].forEach((f, i) =>
      tone(f, t, { type: 'sawtooth', peak: 0.16, a: 0.006, d: 0.2, sustain: 0.09, hold: 0.35, r: 0.5, send: 0.4,
        filter: { type: 'lowpass', freq: 2200, to: 900, time: 0.9 }, pan: (i - 1) * 0.25 }));
    noise(t, { peak: 0.10, a: 0.01, d: 0.7, freq: 700, q: 0.5, send: 0.4 });
    tone(110, t, { type: 'square', peak: 0.10, a: 0.01, d: 0.6, send: 0.2, filter: { type: 'lowpass', freq: 400 } });
  },

  /** Auswertung: aufsteigende Punkte-Zählung. */
  countUp(i = 0) {
    if (!enabled || !build()) return;
    const t = now();
    tone(660 * Math.pow(2, Math.min(i, 14) / 24), t, { type: 'triangle', peak: 0.10, a: 0.002, d: 0.05, send: 0.2 });
  },

  fanfare() {
    if (!enabled || !build()) return;
    const t = now();
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, t + i * 0.075, { type: 'triangle', peak: 0.24, a: 0.005, d: 0.14, sustain: 0.06, hold: 0.05, r: 0.4, send: 0.5 }));
  },

  error() {
    if (!enabled || !build()) return;
    const t = now();
    tone(180, t, { type: 'square', peak: 0.18, a: 0.003, d: 0.14, send: 0.1, filter: { type: 'lowpass', freq: 900 } });
    tone(174, t + 0.14, { type: 'square', peak: 0.16, a: 0.003, d: 0.16, send: 0.1, filter: { type: 'lowpass', freq: 800 } });
  },
};
