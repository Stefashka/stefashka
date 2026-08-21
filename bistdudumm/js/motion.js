/* =============================================================================
   motion.js  –  Neigungssensor, Kalibrierung & Gestenerkennung
   -----------------------------------------------------------------------------
   MATHEMATIK
   Aus DeviceOrientationEvent (alpha, beta, gamma) lässt sich der
   Schwerkraftvektor im Geräte-Koordinatensystem berechnen:

       R = Rz(α) · Rx(β) · Ry(γ)              (W3C-Konvention)
       g_device = Rᵀ · (0,0,−1)
                = ( cosβ·sinγ ,  −sinβ ,  −cosβ·cosγ )

   Entscheidend ist gz – die Schwerkraft entlang der Bildschirm-Normalen:
       gz ≈  0   Display steht senkrecht  (Startposition: vor der Brust)
       gz → +1   Display zeigt nach unten (nach vorn gekippt)  → RICHTIG
       gz → −1   Display zeigt nach oben  (nach hinten gekippt) → PASSEN

   Der Clou: gz ist unabhängig davon, ob das Handy hoch- oder quer gehalten
   wird. Die Geste funktioniert also in jeder Haltung gleich.

   KALIBRIERUNG
   Solange `calibrating` aktiv ist (Anleitung + 3-2-1), zieht die Nulllage
   permanent nach. Erst `freeze()` beim Rundenstart friert sie ein – so wird
   die Ausgangsposition exakt beim Start erfasst und nicht schon beim Hochheben.
   ============================================================================= */

const DEG = Math.PI / 180;

export class Motion extends EventTarget {
  constructor() {
    super();
    this.raw = { gx: 0, gy: -1, gz: 0 };
    this.g = { gx: 0, gy: -1, gz: 0 };
    this.baseline = 0;
    this.calibrating = true;
    this.armed = true;
    this.lastTrigger = 0;
    this.threshold = 0.55;
    this.hasData = false;
    this.running = false;
    this._hist = [];
    this._handler = this._onOrient.bind(this);
  }

  /* ------------------------------------------------------------ Fähigkeiten */
  static get available() {
    return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
  }
  static get needsPermission() {
    return Motion.available && typeof DeviceOrientationEvent.requestPermission === 'function';
  }
  /** Muss aus einer echten Nutzergeste heraus aufgerufen werden (iOS, HTTPS). */
  static async requestPermission() {
    if (!Motion.available) return 'unsupported';
    if (!Motion.needsPermission) return 'granted';       // Android/Desktop
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      return res === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';                                    // z. B. ohne HTTPS
    }
  }

  /* ------------------------------------------------------------------ Lauf */
  start() {
    if (this.running || !Motion.available) return false;
    this.running = true;
    this.hasData = false;
    this._hist = [];
    window.addEventListener('deviceorientation', this._handler, { passive: true });
    return true;
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    window.removeEventListener('deviceorientation', this._handler);
  }

  reset() {
    this.calibrating = true;
    this.armed = true;
    this.lastTrigger = 0;
    this._hist = [];
  }

  /** Nulllage einfrieren – exakt beim Rundenstart aufrufen. */
  freeze() {
    this.calibrating = false;
    this.baseline = this.g.gz;
    this.armed = true;
    this.lastTrigger = performance.now();
    return this.screenAngle();
  }

  /* ------------------------------------------------------------- Auswertung */
  _onOrient(e) {
    if (e.beta == null || e.gamma == null) return;
    const b = e.beta * DEG, c = e.gamma * DEG;
    const gx = Math.cos(b) * Math.sin(c);
    const gy = -Math.sin(b);
    const gz = -Math.cos(b) * Math.cos(c);

    this.raw = { gx, gy, gz };
    const k = this.hasData ? 0.22 : 1;                    // Tiefpass
    this.g = {
      gx: this.g.gx + (gx - this.g.gx) * k,
      gy: this.g.gy + (gy - this.g.gy) * k,
      gz: this.g.gz + (gz - this.g.gz) * k,
    };
    this.hasData = true;

    // Verlauf für Stabilitätsprüfung (letzte ~500 ms)
    const t = performance.now();
    this._hist.push({ t, ...this.g });
    while (this._hist.length && t - this._hist[0].t > 500) this._hist.shift();

    if (this.calibrating) this.baseline = this.g.gz;

    this.dispatchEvent(new CustomEvent('data', { detail: this.snapshot() }));
    if (!this.calibrating) this._detect(t);
  }

  _detect(t) {
    const d = this.g.gz - this.baseline;
    const th = this.threshold;

    if (this.armed && t - this.lastTrigger > 420) {
      if (d >= th) {
        this.armed = false; this.lastTrigger = t;
        this.dispatchEvent(new CustomEvent('gesture', { detail: { dir: 'down', d } }));
      } else if (d <= -th) {
        this.armed = false; this.lastTrigger = t;
        this.dispatchEvent(new CustomEvent('gesture', { detail: { dir: 'up', d } }));
      }
    } else if (!this.armed && Math.abs(d) < th * 0.45) {
      this.armed = true;
    }
  }

  /* --------------------------------------------------------------- Zustand */
  snapshot() {
    const { gx, gy, gz } = this.g;
    return {
      gx, gy, gz,
      delta: gz - this.baseline,
      upright: Math.abs(gz) < 0.36,
      stable: this.isStable(),
      hasData: this.hasData,
    };
  }

  isStable(tol = 0.055) {
    if (this._hist.length < 5) return false;
    let minZ = 9, maxZ = -9, minX = 9, maxX = -9, minY = 9, maxY = -9;
    for (const h of this._hist) {
      minZ = Math.min(minZ, h.gz); maxZ = Math.max(maxZ, h.gz);
      minX = Math.min(minX, h.gx); maxX = Math.max(maxX, h.gx);
      minY = Math.min(minY, h.gy); maxY = Math.max(maxY, h.gy);
    }
    return (maxZ - minZ) < tol && (maxX - minX) < tol * 1.6 && (maxY - minY) < tol * 1.6;
  }

  /**
   * Lesewinkel für den Begriff: dreht den Inhalt so, dass er für die
   * Mitspieler:innen aufrecht steht – egal ob hoch oder quer gehalten.
   * φ = atan2(−gx, −gy), auf 90° gerundet.
   */
  screenAngle() {
    const { gx, gy } = this.g;
    if (Math.hypot(gx, gy) < 0.25) return 0;
    const deg = Math.atan2(-gx, -gy) * (180 / Math.PI);
    return ((Math.round(deg / 90) * 90) % 360 + 360) % 360;
  }
}

export const motion = new Motion();
