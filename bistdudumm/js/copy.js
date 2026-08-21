/* =============================================================================
   copy.js  –  Sämtliche Texte der App an einem Ort.
   Tonfall: bissig, schwarzhumorig, liebevoll gemein. Nichts für Kinder.
   Wer die App zahmer will, tauscht einfach die Strings hier aus.
   ============================================================================= */

export const pick = (arr, avoid) => {
  if (arr.length < 2) return arr[0];
  let v;
  do { v = arr[(Math.random() * arr.length) | 0]; } while (v === avoid);
  return v;
};

/* --- Splash ---------------------------------------------------------------- */
export const SPLASH_TAGLINES = [
  'Gleich weiß es die ganze Runde.',
  'Es liegt nicht an der Kategorie.',
  'Erwartungen: niedrig. Zu Recht.',
  'Ein Spiel. Viele Enttäuschungen.',
  'Warnung: enthält Denken.',
  'Möge der Dümmste verlieren.',
  'Freundschaften wurden schon für weniger beendet.',
  'Du hast das nicht durchdacht, oder?',
  'Heute schon blamiert? Nein? Gleich.',
  'Bereit, dich zu enttäuschen.',
];

/* --- Startbildschirm ------------------------------------------------------- */
export const HOME_GREETINGS = [
  'Such dir was aus.',
  'Worin willst du versagen?',
  'Eine Kategorie. Ein Ego. Viel Glück.',
  'Wähl weise. Oder halt so wie immer.',
  'Runde {n}. Es wird nicht besser.',
  'Zeig, was du nicht kannst.',
];

/* --- Vorbereitung / Kalibrierung ------------------------------------------- */
export const PREP_TITLE = 'Halte das Handy vor deine Brust';
export const PREP_SUBS = [
  'Nicht schummeln. Wir sehen alles.',
  'Und jetzt schön still halten.',
  'Locker aus dem Handgelenk.',
  'Die anderen müssen es lesen können.',
];
export const PREP_READY = 'Perfekt. Nicht bewegen.';

/* --- Feedback in der Runde -------------------------------------------------- */
export const HIT_WORDS  = ['Richtig!', 'Na also!', 'Zufall.', 'Glück gehabt.', 'Sieh an.', 'Doch nicht dumm.', 'Respekt.', 'Boom.', 'Weiter so!', 'Ok, gut.'];
export const MISS_WORDS = ['Passen.', 'Feigling.', 'Zu schwer, hm?', 'Aufgegeben.', 'Schwach.', 'Nächster.', 'Mutig war das nicht.', 'Weg damit.'];

/* --- Rundenende ------------------------------------------------------------ */
/** Verdikte nach Punktzahl – erstes passendes `max` gewinnt. */
export const VERDICTS = [
  { max: 0,        title: 'Totalschaden',        line: 'Null Punkte. Nicht einen. Das muss man erst mal schaffen.' },
  { max: 2,        title: 'Ausbaufähig',         line: 'Immerhin hast du durchgehend geatmet.' },
  { max: 5,        title: 'Bemüht',              line: 'Nicht gut. Nicht schlimm. Einfach … da.' },
  { max: 9,        title: 'Überraschend brauchbar', line: 'Deine Freunde sind verwirrt. Du auch.' },
  { max: 14,       title: 'Verdächtig gut',      line: 'Wer hat geschummelt – du oder die anderen?' },
  { max: 21,       title: 'Beängstigend',        line: 'Das war unnötig gut. Gib mal das Handy weiter.' },
  { max: Infinity, title: 'Legende',             line: 'Entweder Genie oder eure Erklärungen sind illegal.' },
];

export function verdictFor(score) {
  return VERDICTS.find(v => score <= v.max) || VERDICTS[VERDICTS.length - 1];
}

export const ROUND_END_SHOUTS = ['Zeit um!', 'Vorbei.', 'Aus die Maus.', 'Ende.', 'Das war’s.'];

/* --- Pause ----------------------------------------------------------------- */
export const PAUSE_SUBS = [
  'Das Wort ist versteckt. Keine Sorge.',
  'Die Uhr steht. Nutz die Zeit weise.',
  'Falsche Kategorie erwischt? Passiert den Besten.',
  'Niemand schaut. Außer allen.',
  'Kalte Füße bekommen?',
];

/* --- Leere Zustände / Hinweise --------------------------------------------- */
export const EMPTY_CUSTOM   = 'Noch keine eigene Kategorie. Wie einfallslos.';
export const EMPTY_STATS    = 'Noch keine Statistik. Du hast ja auch noch nichts geleistet.';
export const EMPTY_TOTALS   = 'Noch kein Gesamtstand. Spiel erst mal eine Runde.';
export const NO_SENSOR      = 'Kein Neigungssensor. Dann eben mit den Daumen.';
export const SENSOR_DENIED  = 'Bewegungszugriff abgelehnt. Wir spielen mit Buttons weiter – dein Verlust.';

/* --- Statistik ------------------------------------------------------------- */
export const STAT_COMMENTS = [
  { max: 20,       line: 'Eine Trefferquote, die man nicht laut vorlesen sollte.' },
  { max: 40,       line: 'Statistisch gesehen: Pech. Realistisch gesehen: du.' },
  { max: 60,       line: 'Genau in der Mitte. Der langweiligste Ort überhaupt.' },
  { max: 80,       line: 'Ganz ordentlich. Sag es aber niemandem, sonst wirst du eingeladen.' },
  { max: Infinity, line: 'Beeindruckend. Und ein bisschen unheimlich.' },
];
export function statComment(pct) {
  return (STAT_COMMENTS.find(v => pct <= v.max) || STAT_COMMENTS[STAT_COMMENTS.length - 1]).line;
}

/* --- KI-Kategorien --------------------------------------------------------- */
export const AI_PLACEHOLDER = 'z. B. „Dinge, die auf einem Festival kaputtgehen“';
export const AI_NOT_CONNECTED =
  'Der KI-Generator ist vorbereitet, aber noch nicht angeschlossen. ' +
  'Sobald Supabase dranhängt, füllt er die Kategorie automatisch. ' +
  'Bis dahin: selber tippen, wie in der Steinzeit.';
