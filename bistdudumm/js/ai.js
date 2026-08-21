/* =============================================================================
   ai.js  –  Client für den KI-Begriffsgenerator
   -----------------------------------------------------------------------------
   Ruft die Supabase Edge Function `generate-words` auf. Der API-Schlüssel des
   Sprachmodells liegt dort auf dem Server, nicht hier.
   Siehe supabase/functions/generate-words/index.ts
   ============================================================================= */

import { CONFIG, isBackendConfigured } from './config.js';

export class AiNotConfiguredError extends Error {
  constructor() { super('AI_NOT_CONFIGURED'); this.name = 'AiNotConfiguredError'; }
}

/** Fehler, deren Text direkt in der Oberfläche angezeigt werden darf. */
export class AiError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'AiError'; this.status = status; }
}

const endpoint = () =>
  `${CONFIG.supabase.url.replace(/\/$/, '')}/functions/v1/${CONFIG.ai.functionName}`;

export const Ai = {
  get available() { return isBackendConfigured(); },

  /**
   * @param {{topic:string, count?:number, spicy?:boolean, exclude?:string[]}} opts
   * @returns {Promise<string[]>}
   */
  async generate({ topic, count = CONFIG.ai.defaultCount, spicy = false, exclude = [] }) {
    if (!isBackendConfigured()) throw new AiNotConfiguredError();

    const key = CONFIG.supabase.publishableKey;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CONFIG.ai.timeoutMs);

    let res;
    try {
      res = await fetch(endpoint(), {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'Content-Type': 'application/json',
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          topic: String(topic).trim().slice(0, 120),
          count,
          spicy,
          // begrenzen: sonst wird der Prompt unnötig lang
          exclude: exclude.slice(-120),
          language: 'de',
        }),
      });
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new AiError('Der Server hat zu lange gebraucht. Nochmal versuchen?');
      }
      throw new AiError('Keine Verbindung. Bist du online?');
    }
    clearTimeout(timer);

    let data = null;
    try { data = await res.json(); } catch { /* gleich unten behandelt */ }

    if (!res.ok) {
      const serverMsg = data && typeof data.error === 'string' ? data.error : '';
      if (res.status === 404) {
        throw new AiError('Die Funktion „' + CONFIG.ai.functionName +
          '“ ist noch nicht bei Supabase veröffentlicht.', 404);
      }
      if (res.status === 401 || res.status === 403) {
        throw new AiError(serverMsg ||
          'Zugriff verweigert. Ist die Domain in ALLOWED_ORIGINS eingetragen?', res.status);
      }
      throw new AiError(serverMsg || `Der Server meldet Fehler ${res.status}.`, res.status);
    }

    const words = Array.isArray(data && data.words) ? data.words : [];
    const clean = [...new Set(
      words.map(w => String(w).trim()).filter(w => w.length > 0 && w.length <= 60)
    )];
    if (!clean.length) throw new AiError('Es kamen keine Begriffe zurück.');
    return clean;
  },
};
