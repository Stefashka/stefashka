/* ============================================================
   Rezepte – Anwendungslogik
   ============================================================ */

"use strict";

const SPEICHER = "rezepte.v1";

/* Ort der Seite auf dem Server, mit Schrägstrich vorn und hinten.
   Damit stehen Bild- und Archivadressen absolut im HTML und stimmen auch
   dann, wenn die Adresse ohne Schrägstrich am Ende aufgerufen wird –
   „…/dontbehangry“ ohne Schrägstrich würde relative Pfade sonst eine
   Ebene zu hoch auflösen, und weder Bilder noch Archivdateien kämen an.

   Zieht der Ordner um, wird nur diese Zeile geändert – und die drei
   Verweise im Kopf von index.html, die vor dem JavaScript geladen werden.
   Für den Betrieb ohne Server (Doppelklick auf index.html) muss hier ""
   stehen, dann gelten wieder Pfade relativ zur Datei. */
const BASIS = "/dontbehangry/";

/** Aus „bilder/foto.jpg“ wird „/dontbehangry/bilder/foto.jpg“. */
const adresse = pfad => {
  if (!pfad) return pfad;
  if (/^([a-z]+:|\/)/i.test(pfad)) return pfad;   // schon absolut oder mit Domain
  return BASIS + pfad;
};

/* Quellenarten, bei denen ein fehlendes Archiv ein echtes Risiko ist. */
const FLUECHTIG = ["Instagram", "Website", "PDF", "Zeitschrift"];

/* ─────────── Speicher ─────────── */

const leererStand = () => ({
  portionen: {},      // { "rezept-id": 6 }
  abgehakt: {},       // { "rezept-id": { z: [0,3], s: [1] } }
  einkauf: []         // [{ id: "rezept-id", portionen: 6 }]
});

let stand = laden();

/** Bringt einen von außen kommenden Stand in eine Form, mit der die
    Seite sicher arbeiten kann. Eine beschädigte oder fremde Sicherung
    darf die Sammlung nicht unbenutzbar machen: Was nicht passt, wird
    verworfen, der Rest bleibt erhalten. */
function standPruefen(roh) {
  const s = leererStand();
  if (!roh || typeof roh !== "object") return s;

  if (roh.portionen && typeof roh.portionen === "object") {
    for (const [id, n] of Object.entries(roh.portionen))
      if (typeof n === "number" && n >= 1 && n <= 99) s.portionen[id] = Math.round(n);
  }

  if (roh.abgehakt && typeof roh.abgehakt === "object") {
    for (const [id, h] of Object.entries(roh.abgehakt)) {
      if (!h || typeof h !== "object") continue;
      const zahlen = w => Array.isArray(w) ? w.filter(n => Number.isInteger(n) && n >= 0) : [];
      s.abgehakt[id] = { z: zahlen(h.z), s: zahlen(h.s) };
    }
  }

  if (Array.isArray(roh.einkauf)) {
    s.einkauf = roh.einkauf
      .filter(e => e && typeof e === "object" && typeof e.id === "string")
      .map(e => ({ id: e.id, portionen: (typeof e.portionen === "number" && e.portionen >= 1 && e.portionen <= 99) ? Math.round(e.portionen) : null }));
  }
  return s;
}

/** Einträge, deren Rezept es nicht mehr gibt – etwa weil eine id in
    js/rezepte.js umbenannt wurde. Sie wären in der Schublade unsichtbar,
    würden aber weiterzählen und ließen sich nicht mehr entfernen. */
function einkaufAufraeumen() {
  const vorher = stand.einkauf.length;
  stand.einkauf = stand.einkauf.filter(e => REZEPTE.some(r => r.id === e.id));
  return vorher - stand.einkauf.length;
}

function laden() {
  try {
    const roh = localStorage.getItem(SPEICHER);
    return standPruefen(roh ? JSON.parse(roh) : null);
  } catch (e) {
    return leererStand();
  }
}

/** Gibt false zurück, wenn nicht gespeichert werden konnte –
    Aufrufer, bei denen Datenverlust wehtut, melden das weiter. */
function sichern() {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(stand));
    return true;
  } catch (e) {
    return false;
  }
}

/* ─────────── Fokus in Overlays ─────────── */

/* Kochmodus und Einkaufsliste legen sich über die Seite. Ohne Fesselung
   wandert die Tabulatortaste in den Teil dahinter, den man gar nicht
   sieht – man tippt dann blind auf Knöpfe unter dem Overlay. Und beim
   Schließen soll der Fokus dorthin zurück, wo er herkam. */
const FOKUSSIERBAR = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, summary, [tabindex]:not([tabindex="-1"])';

const fokusHer = { koch: null, einkauf: null };

function offenesOverlay() {
  const koch = document.getElementById("kochmodus");
  const einkauf = document.getElementById("einkauf");
  if (koch && !koch.hidden) return koch;
  if (einkauf && !einkauf.hidden) return einkauf;
  return null;
}

document.addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const overlay = offenesOverlay();
  if (!overlay) return;
  const ziele = Array.from(overlay.querySelectorAll(FOKUSSIERBAR))
    .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
  if (!ziele.length) return;
  const erste = ziele[0], letzte = ziele[ziele.length - 1];
  const drin = overlay.contains(document.activeElement);
  if (e.shiftKey && (!drin || document.activeElement === erste)) { e.preventDefault(); letzte.focus(); }
  else if (!e.shiftKey && (!drin || document.activeElement === letzte)) { e.preventDefault(); erste.focus(); }
});

/** Fokus zurückgeben, aber nur wenn er noch im Overlay steht – sonst
    würde ein Klick woanders wieder weggerissen. */
function fokusZurueck(schluessel, overlay) {
  const ziel = fokusHer[schluessel];
  fokusHer[schluessel] = null;
  if (!ziel || !document.body.contains(ziel)) return;
  if (overlay && !overlay.contains(document.activeElement) && document.activeElement !== document.body) return;
  ziel.focus();
}

/* ─────────── Hilfsmittel ─────────── */

const $  = (s, w = document) => w.querySelector(s);
const $$ = (s, w = document) => Array.from(w.querySelectorAll(s));

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Das Rezept zu einer Adresse, oder undefined. */
const rezeptNach = id => REZEPTE.find(r => r.id === id);

const zahlDE = n => n.toLocaleString("de-DE");

function datumDE(iso) {
  const t = String(iso).split("-");
  return t.length === 3 ? `${t[2]}.${t[1]}.${t[0]}` : iso;
}

const BRUECHE = [
  [0, ""], [0.125, "⅛"], [0.25, "¼"], [1 / 3, "⅓"], [0.375, "⅜"],
  [0.5, "½"], [0.625, "⅝"], [2 / 3, "⅔"], [0.75, "¾"], [0.875, "⅞"], [1, ""]
];

const METRISCH = ["g", "kg", "ml", "l"];

/** Menge lesbar machen: Gramm/Milliliter gerundet, Stück/EL/TL als Bruch. */
function formatMenge(wert, einheit) {
  if (wert == null) return "";
  if (wert === 0) return "0";

  if (METRISCH.includes(einheit)) {
    if (wert >= 100) return String(Math.round(wert / 5) * 5);
    if (wert >= 10)  return String(Math.round(wert));
    return String(Math.round(wert * 10) / 10).replace(".", ",");
  }

  if (wert >= 20) return String(Math.round(wert));

  const ganz = Math.floor(wert);
  const rest = wert - ganz;
  let beste = BRUECHE[0];
  for (const b of BRUECHE) {
    if (Math.abs(b[0] - rest) < Math.abs(beste[0] - rest)) beste = b;
  }

  let zahl = ganz;
  let bruch = beste[1];
  if (beste[0] === 1) { zahl += 1; bruch = ""; }

  if (zahl === 0 && !bruch) return "etwas";
  if (zahl === 0) return bruch;
  return bruch ? zahl + " " + bruch : String(zahl);
}

/* Einheiten, die sich in der Mehrzahl beugen. g, ml, EL, TL und die
   Abkürzung Stk bleiben gleich und stehen deshalb nicht hier. */
const EINHEIT_MEHRZAHL = {
  "Rolle": "Rollen", "Dose": "Dosen", "Glas": "Gläser", "Packung": "Packungen",
  "Prise": "Prisen", "Zehe": "Zehen", "Scheibe": "Scheiben",
  "Stange": "Stangen", "Blatt": "Blätter", "Stück": "Stück"
};

const einheitForm = (einheit, menge) =>
  (menge != null && menge > 1 && EINHEIT_MEHRZAHL[einheit]) || einheit;

/** „2 Rollen“, „½ Rolle“, „250 ml“ – Menge und Einheit als fertiger Text. */
const mengeText = (menge, einheit) =>
  [formatMenge(menge, einheit), einheitForm(einheit, menge)].filter(Boolean).join(" ");

function formatZeit(minuten) {
  if (!minuten) return "–";
  if (minuten < 60) return minuten + " min";
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  return h + " h" + (m ? " " + m + " min" : "");
}

const gesamtZeit = r => (r.zeit.aktiv || 0) + (r.zeit.ruhe || 0) + (r.zeit.garen || 0);

const allePosten = r => r.zutaten.flatMap(g => g.posten);

/** Kalorien für die Basismenge, wie in den Daten hinterlegt. */
const kcalBasis = r => allePosten(r).reduce((s, p) => s + (p.kcal || 0), 0);

/** Kalorien für eine hochgerechnete Menge. Zutaten mit `fest: true`
    wachsen nicht mit – das Fett für die Form bleibt dasselbe, egal für
    wie viele Portionen gebacken wird. */
const kcalFuerFaktor = (r, faktor) =>
  allePosten(r).reduce((s, p) => s + (p.kcal || 0) * (p.fest ? 1 : faktor), 0);

/** Kalorien pro Portion – bleibt beim Skalieren konstant. */
const kcalProPortion = r => Math.round(kcalBasis(r) / r.portionen);

function gewaehltePortionen(r) {
  const p = stand.portionen[r.id];
  return (typeof p === "number" && p >= 1 && p <= 99) ? p : r.portionen;
}

function einheitEinzahl(r) {
  const n = r.portionenName;
  if (n === "Portionen") return "pro Portion";
  if (n === "Stück")     return "pro Stück";
  if (n === "Scheiben")  return "pro Scheibe";
  if (n === "Gläser")    return "pro Glas";
  return "pro " + n;
}

function toast(text) {
  const t = $("#toast");
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toast._uhr);
  toast._uhr = setTimeout(() => { t.hidden = true; }, 2800);
}

/* ============================================================
   TIMER
   Zeitangaben im Schritttext werden zu antippbaren Knöpfen.
   Bei einer Spanne („20 bis 25 Minuten“) startet der KLEINERE
   Wert – dann schaut man beim ersten sinnvollen Zeitpunkt nach.
   ============================================================ */

/* Erfasst „15 Minuten“, „20 bis 25 Minuten“, „1,5 Stunden“ und
   „1 ½ Stunden“. Die Bruch-Variante steht zuerst, sonst würde bei
   „1 ½ Stunden“ nur die 1 gelesen und der Timer wäre zu kurz. */
const ZEIT_RE = /((?:\d+(?:[.,]\d+)?\s*)?[½¼¾⅓⅔⅛]|\d+(?:[.,]\d+)?)(?:\s*(?:bis|und|–|-)\s*(\d+(?:[.,]\d+)?))?\s*(Sekunden?|Sek\.?|Minuten?|Min\.?|Stunden?|Std\.?)(?![a-zäöüß])/g;

const BRUCH_WERT = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125 };

/** „1 ½“ → 1.5, „1,5“ → 1.5, „½“ → 0.5 */
function zahlAus(text) {
  let rest = String(text).trim();
  let wert = 0;
  for (const b in BRUCH_WERT) {
    if (rest.indexOf(b) !== -1) { wert += BRUCH_WERT[b]; rest = rest.replace(b, "").trim(); }
  }
  if (rest) {
    const n = Number(rest.replace(",", "."));
    if (isFinite(n)) wert += n;
  }
  return wert;
}

function sekundenAus(zahl, einheit) {
  const e = einheit.toLowerCase();
  if (e.indexOf("sek") === 0) return Math.round(zahl);
  if (e.indexOf("min") === 0) return Math.round(zahl * 60);
  return Math.round(zahl * 3600);
}

/** Schritttext escapen und Zeitangaben in Timer-Knöpfe verwandeln. */
function mitTimern(text) {
  return esc(text).replace(ZEIT_RE, (treffer, a, b, einheit) => {
    /* Bei einer Spanne der KLEINERE Wert – das ist der erste
       sinnvolle Zeitpunkt zum Nachschauen, nicht der letzte. */
    const sek = sekundenAus(zahlAus(a), einheit);
    if (!sek || sek > 86400) return treffer;
    return `<button type="button" class="zeitKnopf" data-sek="${sek}" title="Timer über ${esc(treffer)} starten">${treffer}</button>`;
  });
}

/* Ein laufender Timer merkt sich den Zeitpunkt, zu dem er klingelt –
   nicht die verbleibenden Sekunden. Ein Zähler, der pro Intervall eins
   abzieht, verliert genau die Zeit, in der der Browser das Intervall
   drosselt: bei gesperrtem Bildschirm steht er praktisch still. Ein
   fester Zielzeitpunkt überlebt das. Angehaltene Timer merken sich
   stattdessen ihren Rest. */
let timer = [];       // [{ nr, titel, endeMs, restSek, laeuft, fertig }]
let timerNr = 0;
let timerUhr = null;

const timerRest = t => t.laeuft && !t.fertig
  ? Math.max(0, Math.round((t.endeMs - Date.now()) / 1000))
  : t.restSek;

function timerUhrPruefen() {
  const laufen = timer.some(t => t.laeuft && !t.fertig);
  if (laufen && !timerUhr) timerUhr = setInterval(timerTick, 500);
  if (!laufen && timerUhr) { clearInterval(timerUhr); timerUhr = null; }
}

function timerStarten(sek, titel) {
  timerNr += 1;
  timer.push({ nr: timerNr, titel: titel, endeMs: Date.now() + sek * 1000, restSek: sek, laeuft: true, fertig: false });
  timerUhrPruefen();
  zeichneTimer();
  toast(`Timer läuft: ${timerText(sek)}`);
}

function timerTick() {
  timer.forEach(t => {
    if (!t.laeuft || t.fertig) return;
    t.restSek = timerRest(t);
    if (t.restSek <= 0) {
      t.restSek = 0; t.fertig = true; t.laeuft = false;
      piep();
      toast(`Fertig: ${t.titel}`);
    }
  });
  timerUhrPruefen();
  zeichneTimer();
}

/* Kommt das Gerät aus dem Ruhezustand zurück, sofort nachziehen statt
   auf den nächsten Tick zu warten. */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && timer.length) timerTick();
});

function timerText(sek) {
  const h = Math.floor(sek / 3600);
  const m = Math.floor((sek % 3600) / 60);
  const s = sek % 60;
  const zwei = n => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${zwei(m)}:${zwei(s)}` : `${m}:${zwei(s)}`;
}

/* Merkt sich, welche Timer zuletzt gezeichnet wurden. Wird der Stapel
   jede Sekunde neu gebaut, verliert der Fokus auf Pause/Schließen jedes
   Mal seinen Halt – mit der Tastatur wäre ein laufender Timer dann nicht
   zu bedienen – und ein Screenreader liest die Live-Region jedes Mal neu
   vor. Solange sich nur die Zahl ändert, wird deshalb nur sie ersetzt. */
let timerGezeichnet = "";

function zeichneTimer() {
  const stapel = $("#timerStapel");
  const kennung = timer.map(t => `${t.nr}:${t.laeuft ? 1 : 0}:${t.fertig ? 1 : 0}`).join(",");

  if (kennung === timerGezeichnet) {
    timer.forEach(t => {
      const feld = $(`[data-zeit="${t.nr}"]`, stapel);
      if (feld) {
        const text = t.fertig ? "fertig" : timerText(t.restSek);
        if (feld.textContent !== text) feld.textContent = text;
      }
    });
    return;
  }
  timerGezeichnet = kennung;

  stapel.innerHTML = timer.map(t => `
    <div class="timer${t.fertig ? " timer--fertig" : ""}">
      <span class="timer__zeit" data-zeit="${t.nr}">${t.fertig ? "fertig" : timerText(t.restSek)}</span>
      <span class="timer__titel">${esc(t.titel)}</span>
      ${t.fertig ? "" : `<button type="button" class="timer__knopf" data-pause="${t.nr}" aria-label="${t.laeuft ? "Anhalten" : "Weiterlaufen"}">${t.laeuft ? "❙❙" : "▶"}</button>`}
      <button type="button" class="timer__knopf" data-stopp="${t.nr}" aria-label="Timer entfernen">&times;</button>
    </div>`).join("");

  $$("[data-pause]", stapel).forEach(b => b.addEventListener("click", () => {
    const t = timer.find(x => x.nr === Number(b.dataset.pause));
    if (!t) return;
    if (t.laeuft) { t.restSek = timerRest(t); t.laeuft = false; }
    else { t.endeMs = Date.now() + t.restSek * 1000; t.laeuft = true; }
    timerUhrPruefen();
    zeichneTimer();
  }));

  $$("[data-stopp]", stapel).forEach(b => b.addEventListener("click", () => {
    timer = timer.filter(x => x.nr !== Number(b.dataset.stopp));
    timerUhrPruefen();
    zeichneTimer();
  }));
}

/** Dreifacher Signalton, ohne Tondatei. */
function piep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const t0 = ctx.currentTime;
    [0, 0.34, 0.68].forEach(d => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.setValueAtTime(0, t0 + d);
      g.gain.linearRampToValueAtTime(0.22, t0 + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.26);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0 + d); o.stop(t0 + d + 0.3);
    });
    setTimeout(() => ctx.close(), 1600);
  } catch (e) { /* Ton ist Beiwerk, Timer läuft trotzdem. */ }
}

/** Klicks auf Zeitangaben – egal ob im Detail oder im Kochmodus. */
document.addEventListener("click", e => {
  const b = e.target.closest(".zeitKnopf");
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  timerStarten(Number(b.dataset.sek), b.textContent.trim());
});

/* ============================================================
   FILTER
   ============================================================ */

let filter = {
  kategorie: "Alle",
  suche: "",
  ernaehrung: [],
  maxZeit: 0,        // 0 = egal, sonst Minuten
  nurSaison: false,
  nurThermomix: false
};

const filterAnzahl = () =>
  filter.ernaehrung.length + (filter.maxZeit ? 1 : 0) +
  (filter.nurSaison ? 1 : 0) + (filter.nurThermomix ? 1 : 0);

const monatJetzt = () => new Date().getMonth() + 1;

const inSaison = r => !r.saison || r.saison.length === 0 || r.saison.includes(monatJetzt());

function passtZumFilter(r) {
  if (filter.kategorie !== "Alle" && r.kategorie !== filter.kategorie) return false;

  if (filter.ernaehrung.length) {
    const hat = r.ernaehrung || [];
    if (!filter.ernaehrung.every(e => hat.includes(e))) return false;
  }

  if (filter.maxZeit && gesamtZeit(r) > filter.maxZeit) return false;
  if (filter.nurSaison && !inSaison(r)) return false;
  if (filter.nurThermomix && !r.thermomix) return false;

  const q = filter.suche.trim().toLowerCase();
  if (!q) return true;

  const heu = [
    r.titel, r.untertitel, r.kategorie,
    (r.marken || []).join(" "),
    (r.ernaehrung || []).join(" "),
    r.thermomix ? "thermomix tm" : "",
    allePosten(r).map(p => p.name).join(" ")
  ].join(" ").toLowerCase();

  return q.split(/\s+/).every(teil => heu.includes(teil));
}

function zeichneFilterFeld() {
  const chip = (an, attr, wert, text) =>
    `<button type="button" class="fChip" ${attr}="${esc(wert)}" aria-pressed="${an}">${esc(text)}</button>`;

  $("#filterFeld").innerHTML = `
    <div class="filterFeld__gruppe">
      <span class="filterFeld__marke">Ernährung</span>
      <div class="filterFeld__chips">
        ${ERNAEHRUNG.map(e => chip(filter.ernaehrung.includes(e), "data-ern", e, e)).join("")}
      </div>
    </div>
    <div class="filterFeld__gruppe">
      <span class="filterFeld__marke">Gesamtzeit</span>
      <div class="filterFeld__chips">
        ${chip(filter.maxZeit === 30, "data-zeit", "30", "unter 30 min")}
        ${chip(filter.maxZeit === 60, "data-zeit", "60", "unter 1 Stunde")}
        ${chip(filter.maxZeit === 180, "data-zeit", "180", "unter 3 Stunden")}
      </div>
    </div>
    <div class="filterFeld__gruppe">
      <span class="filterFeld__marke">Saison</span>
      <div class="filterFeld__chips">
        ${chip(filter.nurSaison, "data-saison", "1", "hat jetzt im " + MONATE[monatJetzt() - 1] + " Saison")}
      </div>
    </div>
    <div class="filterFeld__gruppe">
      <span class="filterFeld__marke">Gerät</span>
      <div class="filterFeld__chips">
        ${chip(filter.nurThermomix, "data-tm", "1", "Thermomix")}
      </div>
    </div>
    ${filterAnzahl() ? `<button type="button" class="filterFeld__weg" id="filterWeg">Alle Filter zurücksetzen</button>` : ""}
  `;

  $$("#filterFeld [data-ern]").forEach(b => b.addEventListener("click", () => {
    const e = b.dataset.ern;
    const i = filter.ernaehrung.indexOf(e);
    if (i === -1) filter.ernaehrung.push(e); else filter.ernaehrung.splice(i, 1);
    zeichneListe();
  }));

  $$("#filterFeld [data-zeit]").forEach(b => b.addEventListener("click", () => {
    const z = Number(b.dataset.zeit);
    filter.maxZeit = filter.maxZeit === z ? 0 : z;
    zeichneListe();
  }));

  $$("#filterFeld [data-saison]").forEach(b => b.addEventListener("click", () => {
    filter.nurSaison = !filter.nurSaison;
    zeichneListe();
  }));

  $$("#filterFeld [data-tm]").forEach(b => b.addEventListener("click", () => {
    filter.nurThermomix = !filter.nurThermomix;
    zeichneListe();
  }));

  const weg = $("#filterWeg");
  if (weg) weg.addEventListener("click", () => {
    filter.ernaehrung = []; filter.maxZeit = 0;
    filter.nurSaison = false; filter.nurThermomix = false;
    zeichneListe();
  });
}

/* ============================================================
   ÜBERSICHT
   ============================================================ */

function zeichneKategorien() {
  const anzahl = k => REZEPTE.filter(r => k === "Alle" || r.kategorie === k).length;
  const knoepfe = ["Alle", ...KATEGORIEN].map(k => `
    <button type="button" class="reiter__knopf" data-kat="${esc(k)}"
            aria-pressed="${filter.kategorie === k}">
      ${esc(k)}<span class="reiter__zahl">${anzahl(k)}</span>
    </button>`);


  $("#kategorien").innerHTML = knoepfe.join("");
}

/** Bildquelle: die Datei aus `bilder/`, sofern eine hinterlegt ist. */
function bildQuelle(r) {
  return (r.bild && r.bild.datei) ? adresse(r.bild.datei) : null;
}

/* Wohin die Bildfläche ankert, wenn sie zuschneiden muss. Ohne Angabe
   schneidet CSS mittig – bei Motiven am Rand ist das genau falsch.
   Nur harmlose Werte durchlassen, das landet in einem style-Attribut. */
function fokusWert(bild) {
  const f = bild && bild.fokus;
  return (typeof f === "string" && /^[a-z0-9 .%]{1,24}$/i.test(f)) ? f : null;
}

function bildHtml(r, klasse) {
  const quelle = bildQuelle(r);
  if (quelle) {
    const fokus = fokusWert(r.bild);
    return `<div class="${klasse}"><img src="${esc(quelle)}" alt="${esc(r.bild.alt || r.titel)}"
      loading="lazy"${fokus ? ` style="object-position:${esc(fokus)}"` : ""}></div>`;
  }
  return `<div class="${klasse} ${klasse}--leer" aria-hidden="true"><span>${esc(r.kategorie)}</span></div>`;
}

/** Bildnachweis unter dem großen Foto. Fremde Aufnahmen sollen erkennbar
    fremd sein – sonst weiß man später nicht mehr, was eigen ist. */
function bildNachweisHtml(r) {
  if (!r.bild || !r.bild.quelle) return "";
  /* Trägt der Wert seine Art schon selbst („eigenes Foto“,
     „Illustration …“), wird er unverändert gezeigt. Sonst ist es
     eine fremde Aufnahme und bekommt „Foto: “ davor. */
  const eigenerName = /^(eigen|illustration|zeichnung|grafik)/i.test(r.bild.quelle);
  return `<p class="rBildQuelle">${eigenerName ? "" : "Foto: "}${esc(r.bild.quelle)}</p>`;
}

function karteHtml(r) {
  return `
  <li class="karte">
    <a class="karte__link" href="#/rezept/${esc(r.id)}">
      ${bildHtml(r, "karte__bild")}
      <div class="karte__text">
        <span class="karte__kat">${esc(r.kategorie)}${r.thermomix ? ` <span class="tmMarke" title="Thermomix-Rezept">Thermomix</span>` : ""}</span>
        <h2 class="karte__titel">${esc(r.titel)}</h2>
        <p class="karte__unter">${esc(r.untertitel)}</p>
        <div class="karte__meta">
          <span>${formatZeit(gesamtZeit(r))}</span>
          <span>${zahlDE(kcalProPortion(r))} kcal ${esc(einheitEinzahl(r))}</span>
          <span>${esc(r.schwierigkeit)}</span>
        </div>
      </div>
    </a>
  </li>`;
}

function zeichneListe() {
  zeichneKategorien();
  zeichneFilterFeld();

  const p = $("#filterZahl");
  p.textContent = filterAnzahl();
  p.hidden = filterAnzahl() === 0;

  const treffer = REZEPTE.filter(passtZumFilter);
  $("#karten").innerHTML = treffer.map(karteHtml).join("");
  $("#leer").hidden = treffer.length > 0;
  $("#karten").hidden = treffer.length === 0;

  $("#treffer").textContent = treffer.length + " " + (treffer.length === 1 ? "Rezept" : "Rezepte");

  $("#leer").textContent = REZEPTE.length === 0
    ? "Noch kein Rezept da. Der erste Block gehört in js/rezepte.js."
    : "Dazu passt kein Rezept. Vielleicht einen Filter lösen?";
}

/* ============================================================
   DETAIL
   ============================================================ */

function zutatenHtml(r, faktor) {
  const ab = (stand.abgehakt[r.id] && stand.abgehakt[r.id].z) || [];
  let i = -1;

  return r.zutaten.map(gruppe => {
    const posten = gruppe.posten.map(p => {
      i++;
      const menge = p.fest || p.menge == null ? p.menge : p.menge * faktor;
      const text = mengeText(menge, p.einheit);
      const istAb = ab.includes(i);
      return `
        <button type="button" class="zPosten${istAb ? " zPosten--ab" : ""}"
                data-zutat="${i}" aria-pressed="${istAb}">
          <span class="zPosten__menge">${esc(text)}</span>
          <span class="zName">${esc(p.name)}</span>
          ${p.notiz ? `<span class="zNotiz">${esc(p.notiz)}</span>` : ""}
        </button>`;
    }).join("");

    return `<div class="zGruppe">
      ${gruppe.gruppe ? `<h3 class="zGruppe__titel">${esc(gruppe.gruppe)}</h3>` : ""}
      ${posten}
    </div>`;
  }).join("");
}

function kalorienHtml(r, faktor) {
  const gesamt = Math.round(kcalFuerFaktor(r, faktor));
  const portionen = gewaehltePortionen(r);

  const traeger = allePosten(r)
    .filter(p => (p.kcal || 0) > 0)
    .sort((a, b) => b.kcal - a.kcal)
    .slice(0, 5);

  return `
  <div class="kBox">
    <div class="kZeile">
      <span class="kMarke">Geschätzt ${esc(einheitEinzahl(r))}</span>
      <span class="kWert kWert--gross">${zahlDE(kcalProPortion(r))} kcal</span>
    </div>
    <div class="kZeile">
      <span class="kMarke">Gesamt für ${portionen} ${esc(r.portionenName)}</span>
      <span class="kWert">${zahlDE(gesamt)} kcal</span>
    </div>
    <details class="kDetails">
      <summary>Woraus sich das ergibt</summary>
      <ol>
        ${traeger.map(p => `<li><span>${esc(p.name)}</span><span>${zahlDE(Math.round(p.kcal * (p.fest ? 1 : faktor)))} kcal</span></li>`).join("")}
      </ol>
    </details>
    <p class="kFuss">
      Schätzwert, berechnet aus den Zutatenmengen mit Standardwerten.
      Je nach Marke, Fettgehalt und Größe der Zutaten weicht das ab –
      als Größenordnung taugt es, als Ernährungsberatung nicht.
    </p>
  </div>`;
}

function quelleHtml(r) {
  const h = r.herkunft;
  if (!h) return "";

  const fluechtig = FLUECHTIG.includes(h.typ);
  const links = [];

  if (h.url) {
    links.push(`<a href="${esc(h.url)}" target="_blank" rel="noopener noreferrer">Original öffnen ↗</a>`);
  }
  if (h.archiv) {
    links.push(`<a href="${esc(adresse(h.archiv))}" target="_blank" rel="noopener noreferrer">Archivierte Kopie</a>`);
  }

  const warnung = (fluechtig && !h.archiv)
    ? `<p class="quelle__warnung">
         Kein Archiv hinterlegt. ${esc(h.typ)}-Quellen verschwinden – wenn der Beitrag
         gelöscht wird, ist die Herkunft weg. Screenshot oder PDF in den Ordner
         <code>quellen/</code> legen und im Rezept als <code>archiv</code> eintragen.
       </p>`
    : "";

  return `
  <div class="quelle">
    <div class="quelle__marke">Herkunft</div>
    <p class="quelle__zeile"><strong>${esc(h.typ)}</strong>${h.text ? " · " + esc(h.text) : ""}</p>
    ${links.length ? `<p class="quelle__links">${links.join('<span class="quelle__trenn">·</span>')}</p>` : ""}
    ${h.erfasst ? `<p class="quelle__datum">erfasst am ${esc(datumDE(h.erfasst))}</p>` : ""}
    ${warnung}
  </div>`;
}

function schritteHtml(r) {
  const ab = (stand.abgehakt[r.id] && stand.abgehakt[r.id].s) || [];
  /* Achtung: der Schritt darf kein <button> sein, weil im Text
     Timer-Knöpfe stehen – verschachtelte Buttons sind ungültig.
     Abhaken übernimmt der Kreis, der Text ist zusätzlich klickbar. */
  return r.schritte.map((s, i) => `
    <li class="schritt${ab.includes(i) ? " schritt--ab" : ""}" data-schrittnr="${i}">
      <button type="button" class="schritt__haken" data-haken="${i}"
              aria-pressed="${ab.includes(i)}" aria-label="Schritt ${i + 1} abhaken">
        <span class="schritt__nr" aria-hidden="true">${i + 1}</span>
      </button>
      <div class="schritt__text">${mitTimern(s)}</div>
    </li>`).join("");
}

function zeichneDetail(r) {
  const portionen = gewaehltePortionen(r);
  const faktor = portionen / r.portionen;
  const imKorb = stand.einkauf.some(e => e.id === r.id);
  const saison = (r.saison && r.saison.length)
    ? r.saison.map(m => MONATE[m - 1]).join(", ")
    : null;

  $("#ansichtDetail").innerHTML = `
    <div class="wrap">
      <a class="zurueck" href="#/"><span>←</span><span>Alle Rezepte</span></a>

      <span class="rKat">${esc(r.kategorie)}${r.thermomix ? ` <span class="tmMarke">Thermomix</span>` : ""}</span>
      <h1 class="rTitel">${esc(r.titel)}</h1>
      <p class="rUnter">${esc(r.untertitel)}</p>

      ${bildQuelle(r) ? bildHtml(r, "rBild") + bildNachweisHtml(r) : ""}

      ${(r.ernaehrung || []).length || (r.marken || []).length ? `
      <div class="rMarken">
        ${(r.ernaehrung || []).map(m => `<span class="marke__chip marke__chip--ern">${esc(m)}</span>`).join("")}
        ${(r.marken || []).map(m => `<span class="marke__chip">${esc(m)}</span>`).join("")}
        ${saison ? `<span class="marke__chip marke__chip--saison">Saison: ${esc(saison)}</span>` : ""}
      </div>` : ""}

      <div class="rMeta">
        <div class="rMeta__zelle">
          <div class="rMeta__marke">Zeit gesamt</div>
          <div class="rMeta__wert">${formatZeit(gesamtZeit(r))}</div>
        </div>
        <div class="rMeta__zelle">
          <div class="rMeta__marke">Davon Arbeit</div>
          <div class="rMeta__wert">${formatZeit(r.zeit.aktiv)}</div>
        </div>
        <div class="rMeta__zelle">
          <div class="rMeta__marke">Aufwand</div>
          <div class="rMeta__wert">${esc(r.schwierigkeit)}</div>
        </div>
        <div class="rMeta__zelle">
          <div class="rMeta__marke">${esc(einheitEinzahl(r)).replace("pro ", "Je ")}</div>
          <div class="rMeta__wert">${zahlDE(kcalProPortion(r))} kcal</div>
        </div>
      </div>

      <div class="rRaster">

        <div class="spalte spalte--zutaten">
          <h2 class="spalte__titel">Zutaten</h2>

          <div class="steller">
            <span class="steller__marke">${esc(r.portionenName)}</span>
            <div class="steller__gruppe">
              <button type="button" class="steller__knopf" data-schritt="-1"
                      ${portionen <= 1 ? "disabled" : ""} aria-label="Weniger">−</button>
              <input class="steller__feld" id="portionenFeld" type="number" min="1" max="99"
                     value="${portionen}" aria-label="${esc(r.portionenName)}">
              <button type="button" class="steller__knopf" data-schritt="1"
                      ${portionen >= 99 ? "disabled" : ""} aria-label="Mehr">+</button>
            </div>
          </div>

          <div id="zutatenListe">${zutatenHtml(r, faktor)}</div>

          <div class="zFuss">
            <button type="button" class="knopf knopf--voll" id="btnKochen">Kochmodus starten</button>
            <button type="button" class="knopf knopf--rand" id="btnKorb">
              ${imKorb ? "Einkaufsliste aktualisieren" : "Auf die Einkaufsliste"}
            </button>
            <button type="button" class="knopf knopf--nackt" id="btnHaken">Haken zurücksetzen</button>
            <button type="button" class="knopf knopf--nackt" id="btnDruck">Drucken</button>
          </div>

          <div id="kalorien">${kalorienHtml(r, faktor)}</div>
          ${quelleHtml(r)}
        </div>

        <div class="spalte spalte--schritte">
          <h2 class="spalte__titel">
            <span>Zubereitung</span>
            <span class="spalte__hinweis">Zeitangaben antippen startet einen Timer</span>
          </h2>

          <ol class="schritte" id="schritte">${schritteHtml(r)}</ol>

          ${r.notiz ? `
          <div class="notizBox">
            <div class="notizBox__marke">Mein Hinweis</div>
            <p>${esc(r.notiz)}</p>
          </div>` : ""}
        </div>

      </div>
    </div>
  `;

  bindeDetail(r);
}

/* ─────────── Detail: Ereignisse ─────────── */

function bindeDetail(r) {
  const neuZeichnenMengen = () => {
    const portionen = gewaehltePortionen(r);
    const faktor = portionen / r.portionen;
    $("#zutatenListe").innerHTML = zutatenHtml(r, faktor);
    $("#kalorien").innerHTML = kalorienHtml(r, faktor);
    $("#portionenFeld").value = portionen;
    $$(".steller__knopf").forEach(b => {
      const s = Number(b.dataset.schritt);
      b.disabled = (s < 0 && portionen <= 1) || (s > 0 && portionen >= 99);
    });
    /* Liegt das Rezept auf der Einkaufsliste, Menge mitziehen. */
    const e = stand.einkauf.find(x => x.id === r.id);
    if (e) { e.portionen = portionen; zeichneEinkauf(); }
    sichern();
  };

  const setzePortionen = n => {
    stand.portionen[r.id] = Math.min(99, Math.max(1, Math.round(n) || 1));
    neuZeichnenMengen();
  };

  $$(".steller__knopf").forEach(b => {
    b.addEventListener("click", () => setzePortionen(gewaehltePortionen(r) + Number(b.dataset.schritt)));
  });

  $("#portionenFeld").addEventListener("change", e => setzePortionen(Number(e.target.value)));

  $("#zutatenListe").addEventListener("click", e => {
    const b = e.target.closest("[data-zutat]");
    if (b) hakenSetzen(r, "z", Number(b.dataset.zutat));
  });

  $("#schritte").addEventListener("click", e => {
    if (e.target.closest(".zeitKnopf")) return;
    const li = e.target.closest("[data-schrittnr]");
    if (li) hakenSetzen(r, "s", Number(li.dataset.schrittnr));
  });

  $("#btnHaken").addEventListener("click", () => {
    stand.abgehakt[r.id] = { z: [], s: [] };
    sichern();
    zeichneDetail(r);
    toast("Alle Haken entfernt");
  });

  $("#btnDruck").addEventListener("click", () => window.print());

  $("#btnKochen").addEventListener("click", () => kochStarten(r));

  $("#btnKorb").addEventListener("click", () => {
    const portionen = gewaehltePortionen(r);
    const da = stand.einkauf.find(e => e.id === r.id);
    if (da) da.portionen = portionen;
    else stand.einkauf.push({ id: r.id, portionen: portionen });
    sichern();
    zeichneEinkauf();
    zeichneKorbZahl();
    $("#btnKorb").textContent = "Einkaufsliste aktualisieren";
    toast(`${r.titel} für ${portionen} ${r.portionenName} auf der Liste`);
  });
}

/** Haken setzen – wirkt in Detailansicht und Kochmodus gleichzeitig. */
function hakenSetzen(r, art, nr) {
  stand.abgehakt[r.id] = stand.abgehakt[r.id] || { z: [], s: [] };
  const liste = stand.abgehakt[r.id][art] = stand.abgehakt[r.id][art] || [];
  const pos = liste.indexOf(nr);
  const an = pos === -1;
  if (an) liste.push(nr); else liste.splice(pos, 1);
  sichern();

  if (art === "z") {
    const b = $(`#zutatenListe [data-zutat="${nr}"]`);
    if (b) { b.classList.toggle("zPosten--ab", an); b.setAttribute("aria-pressed", String(an)); }
  } else {
    const li = $(`#schritte [data-schrittnr="${nr}"]`);
    if (li) {
      li.classList.toggle("schritt--ab", an);
      const h = $("[data-haken]", li);
      if (h) h.setAttribute("aria-pressed", String(an));
    }
  }
  return an;
}

/* ============================================================
   KOCHMODUS
   Großer Text, ein Schritt, Display bleibt an.
   ============================================================ */

/* Wörter, die beim Zuordnen von Zutaten zu Schritten nichts aussagen.
   Ohne die Liste würde „Salz und schwarzer Pfeffer“ über das „und“
   in praktisch jedem Schritt auftauchen. */
const STOPPWOERTER = new Set([
  "und", "oder", "für", "mit", "zum", "zur", "aus", "der", "die", "das", "den", "dem",
  "von", "vom", "nach", "etwa", "auch", "ein", "eine", "einen", "einem", "einer",
  "nur", "sehr", "gut", "fein", "klein", "groß", "große", "großer", "grobe",
  "frisch", "frische", "frischer", "kalt", "kalte", "kalter", "warm", "warme",
  "nicht", "schwarzer", "schwarze", "gemahlen", "gemahlene", "gemahlener",
  "getrocknet", "getrocknete", "gewürfelt", "entsteint", "weich", "hart",
  "halbe", "halber", "halbes", "mundgerecht", "edelsüß", "natur"
]);

/* Wörter, die im Schritttext das Handwerk beschreiben, aber als Wortteil
   in Zutatennamen stecken. Ohne diese Liste zieht „in Würfel schneiden“
   den Brühwürfel an, „scharf anbraten“ den mittelscharfen Senf und
   „bei mittlerer Hitze“ ebenfalls. */
const PROZESSWOERTER = new Set([
  "würfel", "würfeln", "gewürfelte", "gewürfelten", "scheiben", "stücke", "stück",
  "hitze", "scharf", "mittlerer", "mittlere", "mittleren", "mittel",
  "große", "großen", "großer", "kleine", "kleinen", "heiße", "heißer",
  "dünn", "dünne", "dick", "dicke", "grob", "grobe", "streifen", "spalten",
  /* Geräte. „in den Mixtopf geben“ zog sonst das „Fett für den Topf“
     an, „auf ein Kuchengitter stürzen“ den Kuchen. */
  "mixtopf", "mixtopfes", "kuchengitter", "backblech", "backpapier",
  "rührgerät", "rührgeräts", "schneebesen", "küchenreibe", "messbecher"
]);

const WORT_RE = /[a-zà-ÿäöüß0-9]+/gi;

const woerter = text => (String(text).toLowerCase().match(WORT_RE) || [])
  .filter(w => !PROZESSWOERTER.has(w));

const kernwoerter = name => woerter(name)
  .filter(w => w.length >= 2 && !STOPPWOERTER.has(w) && !/^\d+$/.test(w));

/** Passt ein Kernwort zu einem der Wörter im Schritttext?
    Kurze Wörter wie „Ei“ nur exakt, längere auch als Wortteil –
    damit „Mehl“ im Schritt das „Weizenmehl“ der Zutat findet und
    „Zwiebeln“ die „Zwiebel“.

    BEIDE Wörter müssen dafür mindestens 4 Zeichen haben. Sonst trifft
    das „C“ aus „240 °C“ auf jede Zutat mit einem C im Namen – Milch,
    Creme, Zitronenschale. */
function wortTrifft(kern, schrittWoerter) {
  return schrittWoerter.some(w => {
    if (w === kern) return true;
    if (kern.length < 4 || w.length < 4) return false;
    return w.includes(kern) || kern.includes(w);
  });
}

/* Kein Abgleich über gemeinsame Wortanfänge. Der Versuch, damit
   „Hühnchenstücke“ auf „Hühnerbrustfilet“ zu bringen, hat mehr kaputt
   gemacht als geholfen: „backen“ traf Backmalz, Backpulver und
   Backpapier. Die saubere Lösung ist, im Schritttext dasselbe Wort zu
   benutzen wie im Zutatennamen. */

/** Zutaten, die in diesem Schritt vorkommen – für die Mengen im Kochmodus.
    Nennt der Schritt eine Zutatengruppe („die Gewürze zugeben“), gilt
    die ganze Gruppe. */
/** Welche Zutaten nennt dieser Schritt beim Namen? */
function zutatenImText(r, text) {
  const sw = woerter(text);
  const treffer = [];
  (r.zutaten || []).forEach(gruppe => gruppe.posten.forEach(p => {
    if (kernwoerter(p.name).some(k => wortTrifft(k, sw))) treffer.push(p);
  }));
  return treffer;
}

/** Derselbe Name kann in zwei Gruppen stehen – „Mehl“ im Teig und in
    den Streuseln. Im Kochmodus wäre er dann zweimal zu sehen, mit
    verschiedenen Mengen und ohne erkennbaren Unterschied. */
function ohneDoppelte(posten) {
  const gesehen = new Set();
  return posten.filter(p => {
    const schluessel = p.name.toLowerCase();
    if (gesehen.has(schluessel)) return false;
    gesehen.add(schluessel);
    return true;
  });
}

function zutatenZuSchritt(r, nr) {
  const text = r.schritte[nr];
  const treffer = zutatenImText(r, text);
  if (treffer.length) return ohneDoppelte(treffer);

  /* Rückfall auf Gruppennamen: „Die Gewürze zugeben“ nennt keine
     einzelne Zutat, meint aber die ganze Gruppe.

     Aber nur beim ERSTEN Auftauchen der Gruppe. Gruppen heißen oft wie
     das, was aus ihnen entsteht – „Teig“, „Creme“, „Sauce“. Ein späterer
     Satz wie „die Creme in die Teigförmchen füllen“ meint das fertige
     Bauteil, nicht mehr die Rohzutaten. Wären die Mengen dort noch
     einmal zu sehen, würde man sie ein zweites Mal abwiegen. */
  const schonGenannt = new Set();
  for (let i = 0; i < nr; i++) {
    zutatenImText(r, r.schritte[i]).forEach(p => schonGenannt.add(p));
  }

  (r.zutaten || []).forEach(gruppe => {
    if (!gruppe.gruppe) return;
    if (!kernwoerter(gruppe.gruppe).some(k => wortTrifft(k, woerter(text)))) return;
    if (gruppe.posten.some(p => schonGenannt.has(p))) return;
    gruppe.posten.forEach(p => { if (treffer.indexOf(p) === -1) treffer.push(p); });
  });

  return ohneDoppelte(treffer);
}

let kochStand = { rezept: null, nr: 0 };
let wachLock = null;

async function wachHalten(an) {
  try {
    if (an) {
      if ("wakeLock" in navigator && !wachLock) {
        wachLock = await navigator.wakeLock.request("screen");
        wachLock.addEventListener("release", () => { wachLock = null; });
      }
    } else if (wachLock) {
      await wachLock.release();
      wachLock = null;
    }
  } catch (e) {
    wachLock = null;   /* Nicht überall verfügbar – kein Grund zu scheitern. */
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && kochStand.rezept) wachHalten(true);
});

function kochStarten(r) {
  fokusHer.koch = document.activeElement;
  kochStand = { rezept: r, nr: 0 };
  $("#kochmodus").hidden = false;
  document.body.classList.add("kochtAktiv");
  wachHalten(true);
  zeichneKoch();
}

function kochBeenden() {
  const buehne = $("#kochmodus");
  const warOffen = !buehne.hidden;
  kochStand = { rezept: null, nr: 0 };
  buehne.hidden = true;
  buehne.innerHTML = "";
  if (warOffen) fokusZurueck("koch", buehne);
  document.body.classList.remove("kochtAktiv");
  document.documentElement.style.removeProperty("--kochFuss");
  document.documentElement.style.removeProperty("--kochKopf");
  wachHalten(false);
}

function kochBlaettern(delta) {
  const r = kochStand.rezept;
  if (!r) return;
  kochStand.nr = Math.min(r.schritte.length - 1, Math.max(0, kochStand.nr + delta));
  zeichneKoch();
}

function zeichneKoch() {
  const r = kochStand.rezept;
  if (!r) return;
  const nr = kochStand.nr;
  const anzahl = r.schritte.length;
  const portionen = gewaehltePortionen(r);
  const faktor = portionen / r.portionen;
  const ab = (stand.abgehakt[r.id] && stand.abgehakt[r.id].s) || [];

  const zutaten = r.zutaten.map(g => `
    ${g.gruppe ? `<h3 class="kochZ__gruppe">${esc(g.gruppe)}</h3>` : ""}
    <ul class="kochZ__liste">
      ${g.posten.map(p => {
        const menge = p.fest || p.menge == null ? p.menge : p.menge * faktor;
        const t = mengeText(menge, p.einheit);
        return `<li><span>${esc(t)}</span><span>${esc(p.name)}</span></li>`;
      }).join("")}
    </ul>`).join("");

  $("#kochmodus").innerHTML = `
    <div class="koch__kopf">
      <div class="koch__wo">
        <h2 class="koch__titel">${esc(r.titel)}</h2>
        <div class="koch__zaehler">Schritt ${nr + 1} von ${anzahl} · ${portionen} ${esc(r.portionenName)}</div>
      </div>
      <button type="button" class="knopf knopf--rand" id="kochZu">Beenden</button>
    </div>

    <div class="koch__balken"><span style="width:${Math.round(((nr + 1) / anzahl) * 100)}%"></span></div>

    <div class="koch__buehne">
      <p class="koch__text">${mitTimern(r.schritte[nr])}</p>
      ${(() => {
        const dazu = zutatenZuSchritt(r, nr);
        if (!dazu.length) return "";
        /* Steht derselbe Name in zwei Gruppen – beim Datschi „Mehl“ im
           Teig und in den Streuseln – wäre sonst nicht klar, welche
           Menge gemeint ist. Dann kommt die Gruppe dazu. */
        const gruppeVon = p => (r.zutaten.find(g => g.posten.indexOf(p) !== -1) || {}).gruppe || "";
        const namen = allePosten(r).map(p => p.name);
        return `<div class="kochMengen">
          <span class="kochMengen__marke">Dafür brauchst du</span>
          <ul class="kochMengen__liste">
            ${dazu.map(p => {
              const menge = p.fest || p.menge == null ? p.menge : p.menge * faktor;
              const t = mengeText(menge, p.einheit);
              const mehrfach = namen.filter(n => n === p.name).length > 1;
              const g = mehrfach ? gruppeVon(p) : "";
              return `<li>${t ? `<b>${esc(t)}</b> ` : ""}${esc(p.name)}${g ? ` <i>${esc(g)}</i>` : ""}</li>`;
            }).join("")}
          </ul>
        </div>`;
      })()}
      <button type="button" class="koch__haken${ab.includes(nr) ? " koch__haken--ab" : ""}" id="kochHaken" aria-pressed="${ab.includes(nr)}">
        ${ab.includes(nr) ? "✓ erledigt" : "Als erledigt markieren"}
      </button>
    </div>

    <details class="kochZ">
      <summary>Zutaten für ${portionen} ${esc(r.portionenName)}</summary>
      <div class="kochZ__innen">${zutaten}</div>
    </details>

    <div class="koch__fuss">
      <button type="button" class="koch__nav" id="kochZurueck" ${nr === 0 ? "disabled" : ""}>← Zurück</button>
      <span class="koch__punkte">${r.schritte.map((s, i) => `<span class="koch__punkt${i === nr ? " koch__punkt--jetzt" : ""}${ab.includes(i) ? " koch__punkt--ab" : ""}"></span>`).join("")}</span>
      ${nr === anzahl - 1
        ? `<button type="button" class="koch__nav koch__nav--vor" id="kochFertig">Fertig ✓</button>`
        : `<button type="button" class="koch__nav koch__nav--vor" id="kochWeiter">Weiter →</button>`}
    </div>
  `;

  $("#kochZu").addEventListener("click", kochBeenden);
  $("#kochZurueck").addEventListener("click", () => kochBlaettern(-1));
  const weiter = $("#kochWeiter");
  if (weiter) weiter.addEventListener("click", () => kochBlaettern(1));
  const fertig = $("#kochFertig");
  if (fertig) fertig.addEventListener("click", () => { kochBeenden(); toast("Guten Appetit."); });

  $("#kochHaken").addEventListener("click", () => {
    hakenSetzen(r, "s", nr);
    zeichneKoch();
  });

  /* Beim Öffnen den Fokus in den Kochmodus setzen – sonst steht er noch
     auf „Kochmodus starten“ hinter dem Vollbild. Beim Weiterblättern
     bleibt er auf dem Knopf, den man gerade gedrückt hat. */
  const vorhanden = document.activeElement;
  if (!$("#kochmodus").contains(vorhanden) || vorhanden === document.body) {
    ($("#kochWeiter") || $("#kochFertig") || $("#kochZu")).focus();
  } else if (vorhanden.id === "kochWeiter" && !$("#kochWeiter")) {
    ($("#kochFertig") || $("#kochZu")).focus();
  } else {
    const gleicher = vorhanden.id ? $("#" + vorhanden.id) : null;
    if (gleicher) gleicher.focus();
  }

  kochFussMessen();
}

/* Höhe der Navigationsleiste an das Stylesheet melden. Der Timerstapel
   klebt unten links und lag sonst genau auf „Zurück“ und „Weiter“ –
   auf dem Handy waren die beiden Knöpfe damit nicht mehr zu treffen,
   sobald ein Timer lief. Die Höhe ändert sich mit Schriftgröße und
   Drehung des Geräts, deshalb wird sie gemessen statt geraten. */
function kochFussMessen() {
  const setz = (wahl, name) => {
    const el = $(wahl);
    if (!el) return;
    const hoehe = Math.round(el.getBoundingClientRect().height);
    if (hoehe > 0) document.documentElement.style.setProperty(name, hoehe + "px");
  };
  setz(".koch__fuss", "--kochFuss");
  /* Das Hinweisband wandert im Kochmodus nach oben – unten ist der
     Platz schon zweimal vergeben, an die Navigation und an die Timer. */
  setz(".koch__kopf", "--kochKopf");
}

window.addEventListener("resize", () => { if (kochStand.rezept) kochFussMessen(); });
window.addEventListener("orientationchange", () => {
  if (kochStand.rezept) setTimeout(kochFussMessen, 250);
});

document.addEventListener("keydown", e => {
  if (!kochStand.rezept) return;
  if (e.key === "ArrowRight") { e.preventDefault(); kochBlaettern(1); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); kochBlaettern(-1); }
  if (e.key === "Escape")     { e.preventDefault(); kochBeenden(); }
});

/* ============================================================
   EINKAUFSLISTE
   ============================================================ */

function zeichneKorbZahl() {
  const p = $("#einkaufZahl");
  /* Nur zählen, was die Schublade auch zeigen kann – sonst behauptet
     die Perle eine Zahl, zu der es keinen Eintrag gibt. */
  const anzahl = stand.einkauf.filter(e => rezeptNach(e.id)).length;
  p.textContent = anzahl;
  p.hidden = anzahl === 0;
}

function einkaufZeilen(eintrag) {
  const r = rezeptNach(eintrag.id);
  if (!r) return null;
  /* Fehlt die Menge – etwa aus einer alten oder fremden Sicherung –
     gilt die Menge, für die das Rezept notiert ist. */
  const portionen = (typeof eintrag.portionen === "number" && eintrag.portionen >= 1) ? eintrag.portionen : r.portionen;
  const faktor = portionen / r.portionen;
  const zeilen = allePosten(r).map(p => {
    const menge = p.fest || p.menge == null ? p.menge : p.menge * faktor;
    return {
      menge: mengeText(menge, p.einheit),
      name: p.name
    };
  });
  return { rezept: r, portionen: portionen, zeilen: zeilen };
}

function zeichneEinkauf() {
  const koerper = $("#einkaufKoerper");
  const gruppen = stand.einkauf.map(einkaufZeilen).filter(Boolean);

  if (!gruppen.length) {
    koerper.innerHTML = `<p class="eLeer">Noch nichts drauf.<br>Öffne ein Rezept, stelle die Menge ein und tippe auf „Auf die Einkaufsliste“.</p>`;
    return;
  }

  koerper.innerHTML = gruppen.map(g => `
    <div class="eGruppe">
      <div class="eGruppe__kopf">
        <div>
          <div class="eGruppe__titel">${esc(g.rezept.titel)}</div>
          <div class="eGruppe__unter">für ${g.portionen} ${esc(g.rezept.portionenName)}</div>
        </div>
        <button type="button" class="eGruppe__weg" data-weg="${esc(g.rezept.id)}">entfernen</button>
      </div>
      <ul>
        ${g.zeilen.map(z => `<li><span>${esc(z.menge)}</span><span>${esc(z.name)}</span></li>`).join("")}
      </ul>
    </div>`).join("");

  $$("[data-weg]", koerper).forEach(b => {
    b.addEventListener("click", () => {
      stand.einkauf = stand.einkauf.filter(e => e.id !== b.dataset.weg);
      sichern();
      zeichneEinkauf();
      zeichneKorbZahl();
    });
  });
}

function einkaufAlsText() {
  return stand.einkauf.map(einkaufZeilen).filter(Boolean).map(g =>
    `${g.rezept.titel} – für ${g.portionen} ${g.rezept.portionenName}\n` +
    g.zeilen.map(z => `  ${z.menge ? z.menge + " " : ""}${z.name}`).join("\n")
  ).join("\n\n");
}

function einkaufOeffnen(auf) {
  const schublade = $("#einkauf");
  const warOffen = !schublade.hidden;
  if (auf && !warOffen) fokusHer.einkauf = document.activeElement;

  schublade.hidden = !auf;
  $("#schleier").hidden = !auf;
  $("#btnEinkauf").setAttribute("aria-expanded", String(auf));
  document.body.style.overflow = auf ? "hidden" : "";

  if (auf) { zeichneEinkauf(); $("#einkaufZu").focus(); }
  else if (warOffen) fokusZurueck("einkauf", schublade);
}

/* ============================================================
   SICHERUNG
   ============================================================ */

function sicherungHerunterladen() {
  const jetzt = new Date();
  const daten = {
    art: "rezepte-sicherung",
    version: 1,
    erstellt: jetzt.toISOString(),
    anzahlRezepte: REZEPTE.length,
    rezepte: REZEPTE,
    persoenlich: stand
  };
  const blob = new Blob([JSON.stringify(daten, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rezepte-sicherung-" + jetzt.toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Sicherung erstellt: ${REZEPTE.length} Rezepte`);
}

function sicherungEinlesen(datei) {
  const leser = new FileReader();
  leser.onload = () => {
    let daten;
    try {
      daten = JSON.parse(String(leser.result));
    } catch (e) {
      toast("Die Datei ist keine gültige Sicherung");
      return;
    }
    if (!daten || daten.art !== "rezepte-sicherung") {
      toast("Das sieht nicht nach einer Rezept-Sicherung aus");
      return;
    }

    if (daten.persoenlich) {
      stand = standPruefen(daten.persoenlich);
      einkaufAufraeumen();
      sichern();
      zeichneKorbZahl();
      zeichneEinkauf();
      route();
    }

    /* Rezepte selbst kann eine Website nicht zurückschreiben – js/rezepte.js
       liegt auf der Platte. Deshalb hier nur ehrlich melden, was in der
       Datei steckt, statt eine Wiederherstellung vorzutäuschen. */
    const drin = Array.isArray(daten.rezepte) ? daten.rezepte.length : 0;
    const fehlen = drin - REZEPTE.length;
    toast(fehlen > 0
      ? `Einstellungen übernommen. In der Datei stecken ${drin} Rezepte, geladen sind ${REZEPTE.length} – die ${fehlen} fehlenden müssen zurück in js/rezepte.js.`
      : `Einstellungen übernommen. ${drin} Rezepte in der Datei.`);
  };
  leser.onerror = () => toast("Die Datei konnte nicht gelesen werden");
  leser.readAsText(datei);
}

/* ─────────── Zwischenablage ─────────── */

async function inZwischenablage(text, meldung) {
  if (!text) { toast("Nichts zu kopieren"); return; }
  try {
    await navigator.clipboard.writeText(text);
    toast(meldung);
  } catch (e) {
    const t = document.createElement("textarea");
    t.value = text; document.body.appendChild(t); t.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(t);
    toast(ok ? meldung : "Kopieren hat nicht geklappt");
  }
}

/* ============================================================
   ADRESSZEILE / ANSICHTEN
   ============================================================ */

function route() {
  const treffer = location.hash.match(/^#\/rezept\/(.+)$/);
  /* Eine von Hand verstümmelte Adresse („%" ohne Ziffern) lässt
     decodeURIComponent werfen. Ohne Auffangnetz bliebe die Seite leer. */
  let kennung = null;
  if (treffer) {
    try { kennung = decodeURIComponent(treffer[1]); }
    catch (e) { kennung = treffer[1]; }
  }
  const r = kennung ? rezeptNach(kennung) : null;

  if (kochStand.rezept && (!r || r.id !== kochStand.rezept.id)) kochBeenden();

  if (r) {
    $("#ansichtListe").hidden = true;
    $("#ansichtDetail").hidden = false;
    document.title = r.titel + " · Rezepte";
    zeichneDetail(r);
  } else {
    $("#ansichtDetail").hidden = true;
    $("#ansichtDetail").innerHTML = "";
    $("#ansichtListe").hidden = false;
    document.title = "Rezepte";
    zeichneListe();
  }
  window.scrollTo(0, 0);
}

/* ============================================================
   START
   ============================================================ */

function start() {
  $("#kategorien").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b || !b.dataset.kat) return;
    filter.kategorie = b.dataset.kat;
    zeichneListe();
  });

  const feld = $("#suche");
  feld.addEventListener("input", () => {
    filter.suche = feld.value;
    $("#sucheLeeren").hidden = !feld.value;
    zeichneListe();
  });
  $("#sucheLeeren").addEventListener("click", () => {
    feld.value = ""; filter.suche = "";
    $("#sucheLeeren").hidden = true;
    zeichneListe(); feld.focus();
  });

  $("#btnFilter").addEventListener("click", () => {
    const auf = $("#filterFeld").hidden;
    $("#filterFeld").hidden = !auf;
    $("#btnFilter").setAttribute("aria-expanded", String(auf));
  });

  $("#btnEinkauf").addEventListener("click", () => einkaufOeffnen($("#einkauf").hidden));
  $("#einkaufZu").addEventListener("click", () => einkaufOeffnen(false));
  $("#schleier").addEventListener("click", () => einkaufOeffnen(false));

  $("#einkaufLeeren").addEventListener("click", () => {
    if (!stand.einkauf.length) return;
    stand.einkauf = [];
    sichern(); zeichneEinkauf(); zeichneKorbZahl();
    toast("Einkaufsliste geleert");
  });

  $("#einkaufKopieren").addEventListener("click", () => {
    const text = einkaufAlsText();
    if (!text) { toast("Die Liste ist leer"); return; }
    inZwischenablage(text, "In die Zwischenablage kopiert");
  });

  $("#btnExport").addEventListener("click", sicherungHerunterladen);
  $("#btnImport").addEventListener("click", () => $("#importDatei").click());
  $("#importDatei").addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) sicherungEinlesen(e.target.files[0]);
    e.target.value = "";
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!$("#einkauf").hidden) einkaufOeffnen(false);
  });

  window.addEventListener("hashchange", route);
  /* Beim Start einmal aufräumen: Einträge zu Rezepten, die es nicht
     mehr gibt, verschwinden endgültig statt unsichtbar weiterzuzählen. */
  if (einkaufAufraeumen()) sichern();
  zeichneKorbZahl();
  route();
}

document.addEventListener("DOMContentLoaded", start);
