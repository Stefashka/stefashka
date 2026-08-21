/* =============================================================================
   ai.js  –  KI-Begriffsgenerator (UI-Hülle, Backend noch nicht angeschlossen)
   -----------------------------------------------------------------------------
   IST-ZUSTAND
   `generate()` prüft, ob in js/config.js eine Supabase-Instanz hinterlegt ist.
   Wenn nein -> klar formulierter Fehler, den die UI anzeigt. Kein Fake, keine
   erfundenen Begriffe.

   SOLL-ZUSTAND (später, ohne Umbau der UI)
   1. Supabase-Projekt anlegen, URL + anon-Key in js/config.js eintragen.
   2. Edge Function `generate-words` deployen (Beispiel unten).
   3. Fertig – dieser Client ruft sie bereits korrekt auf.

   ── supabase/functions/generate-words/index.ts ───────────────────────────────
   import Anthropic from 'npm:@anthropic-ai/sdk';

   Deno.serve(async (req) => {
     const { topic, count = 30, spicy = false } = await req.json();
     const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
     const msg = await anthropic.messages.create({
       model: 'claude-sonnet-4-5',
       max_tokens: 1200,
       system: `Du erzeugst Begriffe für ein Pantomime-/Erklärspiel auf Deutsch.
                Nur Substantive oder feste Begriffe, 1–3 Wörter, gut darstellbar.
                ${spicy ? 'Erwachsenenhumor erlaubt.' : 'Jugendfrei.'}
                Antworte AUSSCHLIESSLICH als JSON-Array von Strings.`,
       messages: [{ role: 'user', content: `Thema: ${topic}. Anzahl: ${count}.` }],
     });
     const words = JSON.parse(msg.content[0].text);
     return new Response(JSON.stringify({ words }), {
       headers: { 'Content-Type': 'application/json' },
     });
   });
   ─────────────────────────────────────────────────────────────────────────────
   ============================================================================= */

import { CONFIG, isBackendConfigured } from './config.js';

export class AiNotConfiguredError extends Error {
  constructor() { super('AI_NOT_CONFIGURED'); this.name = 'AiNotConfiguredError'; }
}

export const Ai = {
  get available() { return isBackendConfigured(); },

  /**
   * @param {{topic:string, count?:number, spicy?:boolean, exclude?:string[]}} opts
   * @returns {Promise<string[]>}
   */
  async generate({ topic, count = CONFIG.ai.defaultCount, spicy = false, exclude = [] }) {
    if (!isBackendConfigured()) throw new AiNotConfiguredError();

    const url = `${CONFIG.supabase.url.replace(/\/$/, '')}/functions/v1/${CONFIG.ai.functionName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: CONFIG.supabase.anonKey,
        Authorization: `Bearer ${CONFIG.supabase.anonKey}`,
      },
      body: JSON.stringify({
        topic,
        count: Math.min(count, CONFIG.ai.maxCount),
        spicy,
        exclude,
        language: 'de',
      }),
    });

    if (!res.ok) throw new Error(`KI-Dienst antwortet mit ${res.status}`);
    const data = await res.json();
    const words = Array.isArray(data.words) ? data.words : [];
    return [...new Set(words.map(w => String(w).trim()).filter(Boolean))];
  },
};
