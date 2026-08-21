/* =============================================================================
   haptics.js  –  Vibration mit iOS-Notlösung
   -----------------------------------------------------------------------------
   Stand 2026: `navigator.vibrate()` gibt es in Safari auf dem iPhone NICHT.
   Bekannter (offiziell nicht dokumentierter) Workaround: das native
   Switch-Steuerelement `<input type="checkbox" switch>` löst beim Umschalten
   die System-Haptik aus. Wir halten ein unsichtbares Switch im DOM und
   „klicken“ es. Klappt es nicht, verlieren wir nichts – der Sound trägt das
   Feedback ohnehin.
   ============================================================================= */

let enabled = true;
let sw = null;
let lastAt = 0;

function ensureSwitch() {
  if (sw || typeof document === 'undefined') return sw;
  sw = document.createElement('input');
  sw.type = 'checkbox';
  sw.setAttribute('switch', '');
  sw.setAttribute('aria-hidden', 'true');
  sw.tabIndex = -1;
  sw.style.cssText =
    'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;';
  document.body.appendChild(sw);
  return sw;
}

function iosTap() {
  const el = ensureSwitch();
  if (!el) return;
  try { el.checked = !el.checked; el.dispatchEvent(new Event('change', { bubbles: false })); el.click(); } catch {}
}

const supportsVibrate = () =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function run(pattern) {
  if (!enabled) return;
  const t = performance.now();
  if (t - lastAt < 40) return;          // Spam-Schutz
  lastAt = t;
  if (supportsVibrate()) {
    try { navigator.vibrate(pattern); return; } catch {}
  }
  iosTap();
}

export const Haptics = {
  setEnabled(v) { enabled = v; },
  init() { ensureSwitch(); },

  light()    { run(8); },
  tap()      { run(12); },
  medium()   { run(22); },
  heavy()    { run([0, 38]); },

  success()  { run([0, 16, 45, 26]); },
  fail()     { run([0, 44, 60, 44]); },
  countdown(){ run(14); },
  start()    { run([0, 22, 70, 22, 70, 40]); },
  end()      { run([0, 60, 90, 60, 90, 130]); },
};
