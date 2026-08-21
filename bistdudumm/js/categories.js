/* =============================================================================
   categories.js  –  Kategorie-Metadaten (Name, Emoji, Farbverlauf)
   Die Begriffe selbst liegen in js/words.js.
   ============================================================================= */

/** Kuratierte Farbverläufe. Bewusst eine begrenzte Palette – das hält das
 *  Kategorie-Raster ruhig und „designed“ statt bunt-zusammengewürfelt. */
export const GRADIENTS = {
  grass:   ['#5BE49B', '#12A150'],
  ocean:   ['#4CC9F0', '#1078C9'],
  sky:     ['#93C5FD', '#2563EB'],
  grape:   ['#C77DFF', '#7B2CBF'],
  indigo:  ['#8B9CFF', '#3B3FD8'],
  berry:   ['#FF8FD4', '#C81D77'],
  rose:    ['#FF9AA5', '#E01E5A'],
  flame:   ['#FFA95C', '#F2542D'],
  gold:    ['#FFD75E', '#E08A00'],
  lime:    ['#D3F26A', '#6FA30A'],
  teal:    ['#5FE3D0', '#0E9488'],
  plum:    ['#B48CFF', '#5B21B6'],
  crimson: ['#FF7A7A', '#A81B1B'],
  sand:    ['#FFC98B', '#C2660A'],
  mint:    ['#7CF0C8', '#109C74'],
  ink:     ['#9DBBFF', '#3446B5'],
};

/** Reihenfolge = Reihenfolge im Raster. */
export const CATEGORIES = [
  { id: 'tiere',            name: 'Tiere',                        emoji: '🦁', g: 'grass'   },
  { id: 'zu',               name: 'Zeppelin Universität',         emoji: '🎓', g: 'indigo'  },
  { id: 'hobbys',           name: 'Hobbys',                       emoji: '🎨', g: 'berry'   },
  { id: 'laender',          name: 'Länder',                       emoji: '🌍', g: 'ocean'   },
  { id: 'hauptstaedte',     name: 'Hauptstädte',                  emoji: '🏛️', g: 'plum'    },
  { id: 'essen',            name: 'Essen',                        emoji: '🍕', g: 'flame'   },
  { id: 'krankheiten',      name: 'Krankheiten & Beschwerden',    emoji: '🤢', g: 'lime'    },
  { id: 'serien',           name: 'Bekannte populäre Serien',     emoji: '📺', g: 'crimson' },
  { id: 'sitcoms90',        name: 'Sitcoms der 90er',             emoji: '📼', g: 'gold'    },
  { id: 'ue18',             name: 'Ü18',                          emoji: '🔞', g: 'rose', adult: true },
  { id: 'haushalt',         name: 'Haushalt',                     emoji: '🧽', g: 'sky'     },
  { id: 'berufe',           name: 'Berufe',                       emoji: '👷', g: 'sand'    },
  { id: 'automarken',       name: 'Automarken',                   emoji: '🏎️', g: 'ink'     },
  { id: 'neunziger',        name: 'Die 90er',                     emoji: '💿', g: 'grape'   },
  { id: 'marken',           name: 'Marken',                       emoji: '🏷️', g: 'berry'   },
  { id: 'games',            name: 'Computerspiele',               emoji: '🎮', g: 'indigo'  },
  { id: 'duos',             name: 'Berühmte Duos',                emoji: '👯', g: 'rose'    },
  { id: 'personen',         name: 'Berühmte Personen',            emoji: '🌟', g: 'gold'    },
  { id: 'brettspiele',      name: 'Brettspiele',                  emoji: '🎲', g: 'mint'    },
  { id: 'buecher',          name: 'Bücher',                       emoji: '📚', g: 'plum'    },
  { id: 'zweitausender',    name: 'Die 2000er',                   emoji: '📱', g: 'teal'    },
  { id: 'zehner',           name: 'Die 2010er',                   emoji: '🤳', g: 'berry'   },
  { id: 'fiktiv',           name: 'Fiktive Charaktere',           emoji: '🦸', g: 'sky'     },
  { id: 'filme',            name: 'Populäre Filme',               emoji: '🎬', g: 'crimson' },
  { id: 'fruechte',         name: 'Früchte',                      emoji: '🍓', g: 'rose'    },
  { id: 'gegenstaende',     name: 'Gegenstände',                  emoji: '📦', g: 'ink'     },
  { id: 'kueche',           name: 'Küchenutensilien',             emoji: '🍳', g: 'sand'    },
  { id: 'maerchen',         name: 'Märchen',                      emoji: '🏰', g: 'grape'   },
  { id: 'instrumente',      name: 'Musikinstrumente',             emoji: '🎺', g: 'gold'    },
  { id: 'angewohnheiten',   name: 'Schlechte Angewohnheiten',     emoji: '🚬', g: 'crimson' },
  { id: 'taenze',           name: 'Tänze',                        emoji: '💃', g: 'berry'   },
  { id: 'urlaub',           name: 'Urlaub',                       emoji: '🏖️', g: 'ocean'   },
  { id: 'jugendwoerter',    name: 'Jugendwörter',                 emoji: '🗣️', g: 'lime'    },
  { id: 'skandale',         name: 'Skandale der letzten 10 Jahre',emoji: '💣', g: 'flame'   },
  { id: 'laeden',           name: 'Einkaufsläden',                emoji: '🛒', g: 'teal'    },
  { id: 'technik',          name: 'Technische Geräte',            emoji: '🔌', g: 'sky'     },
  // --- am 21.08.2026 ergänzt ---
  { id: 'dating',           name: 'Dating & Tinder',              emoji: '💘', g: 'rose'    },
  { id: 'versaut',          name: 'Versaute Dinge',               emoji: '🍑', g: 'berry', adult: true },
  { id: 'typischdeutsch',   name: 'Typisch Deutsch',              emoji: '🥨', g: 'gold'    },
  { id: 'memes',            name: 'Memes & Internet',             emoji: '🐸', g: 'teal'    },
];

export function gradientCss(key, angle = 155) {
  const [a, b] = GRADIENTS[key] || GRADIENTS.grape;
  return `linear-gradient(${angle}deg, ${a} 0%, ${b} 100%)`;
}

export function gradientOf(key) {
  return GRADIENTS[key] || GRADIENTS.grape;
}

/* ------------------------------------------------------------- Lesbarkeit --
   Auf gelben, limettengrünen oder mintfarbenen Verläufen ist weiße Schrift
   kaum lesbar. Deshalb wird die Textfarbe aus der Helligkeit des Verlaufs
   berechnet: helle Fläche -> sehr dunkler Ton in derselben Farbfamilie,
   dunkle Fläche -> Weiß. Formel: relative Leuchtdichte nach WCAG.
   -------------------------------------------------------------------------- */

const hex2rgb = h => {
  const v = h.replace('#', '');
  return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16));
};
const rgb2hex = ([r, g, b]) =>
  '#' + [r, g, b].map(x => Math.round(Math.max(0, Math.min(255, x)))
    .toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => {
  const A = hex2rgb(a), B = hex2rgb(b);
  return rgb2hex(A.map((x, i) => x + (B[i] - x) * t));
};
const luminance = hex => {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const [r, g, b] = hex2rgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const LIGHT_THRESHOLD = 0.42;

/** true, wenn der Verlauf so hell ist, dass weiße Schrift darauf untergeht. */
export function isLightGradient(key) {
  const [a, b] = gradientOf(key);
  return luminance(mix(a, b, 0.5)) > LIGHT_THRESHOLD;
}

/** Passende Textfarbe für eine Fläche mit diesem Verlauf. */
export function gradientInk(key) {
  if (!isLightGradient(key)) return '#FFFFFF';
  const [, b] = gradientOf(key);
  return mix(b, '#0B0518', 0.68);      // sehr dunkle Variante der Kategoriefarbe
}

/**
 * Wie stark muss die Kategoriefarbe abgedunkelt werden, damit weiße Schrift
 * darauf den gewünschten Kontrast erreicht? Adaptiv, damit kräftige Farben
 * (Beere, Traube, Karmin) bunt bleiben und nur helle Töne (Gold, Limette,
 * Minze) den nötigen Schleier bekommen.
 * @returns {number} Deckkraft zwischen 0 und 0.55
 */
export function veilFor(key, target = 4.5) {
  const [a, b] = gradientOf(key);
  const base = hex2rgb(mix(a, b, 0.5));
  const dark = [6, 2, 16];
  const lum = rgb => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  };
  for (let alpha = 0; alpha <= 0.55; alpha += 0.02) {
    const comp = base.map((x, i) => x * (1 - alpha) + dark[i] * alpha);
    if (1.05 / (lum(comp) + 0.05) >= target) return Math.round(alpha * 100) / 100;
  }
  return 0.55;
}
