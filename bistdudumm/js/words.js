/* =============================================================================
   words.js  –  DIE BEGRIFFSLISTEN
   -----------------------------------------------------------------------------
   Das ist die EINZIGE Datei, die ihr anfassen müsst, um echte Begriffe
   einzupflegen. Struktur:

       export const WORDS = {
         tiere: ['Elefant', 'Waschbär', 'Nacktmull'],
         laender: ['Portugal', 'Neuseeland'],
       }

   Die Schlüssel (tiere, laender …) sind die `id` aus js/categories.js.
   Fehlt eine Kategorie hier, greift automatisch der Platzhalter.

   Aktuell: bewusst nur Platzhalter „Loren Ipsum 1–25“, damit ihr beim Testen
   seht, ob Mischen / Nicht-Wiederholen / Rundenspeicher greifen.
   ============================================================================= */

/** Erzeugt ["Loren Ipsum 1", … "Loren Ipsum n"] */
export function placeholder(n = 25) {
  return Array.from({ length: n }, (_, i) => `Loren Ipsum ${i + 1}`);
}

/**
 * Echte Begriffe hier eintragen. Beispiel:
 *
 *   export const WORDS = {
 *     tiere: ['Elefant', 'Waschbär', 'Nacktmull', 'Alpaka'],
 *   };
 *
 * Alles, was hier NICHT steht, bekommt automatisch placeholder(25).
 */
export const WORDS = {
  // tiere: ['Elefant', 'Waschbär', 'Nacktmull'],
};
