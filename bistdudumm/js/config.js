/* =============================================================================
   config.js  –  Alles, was später auf Supabase zeigt, steht hier.
   -----------------------------------------------------------------------------
   Solange `supabase.url` leer ist, läuft die App zu 100 % lokal
   (localStorage) und der KI-Generator zeigt nur seinen Platzhalter.
   ============================================================================= */

export const CONFIG = {
  version: '1.1.0',

  supabase: {
    url: '',          // z. B. 'https://xyzcompany.supabase.co'
    anonKey: '',      // öffentlicher anon-Key (kein Service-Key!)
  },

  ai: {
    /**
     * Name der Supabase Edge Function, die Begriffe generiert.
     * Aufruf: POST {url}/functions/v1/{functionName}
     * Body:    { topic: string, count: number, spicy: boolean, language: 'de' }
     * Antwort: { words: string[] }
     *
     * Der API-Key des Sprachmodells gehört AUSSCHLIESSLICH in die Edge
     * Function – niemals in diesen Client.
     */
    functionName: 'generate-words',
    defaultCount: 30,
    maxCount: 60,
  },
};

export const isBackendConfigured = () =>
  Boolean(CONFIG.supabase.url && CONFIG.supabase.anonKey);
