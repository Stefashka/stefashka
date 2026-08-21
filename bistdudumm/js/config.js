/* =============================================================================
   config.js  –  Verbindung zu Supabase
   -----------------------------------------------------------------------------
   Der „publishable key“ gehört ausdrücklich in den Browser – das ist sein
   Zweck. Er erlaubt für sich genommen nichts: Tabellenzugriffe schützt Row
   Level Security, und die Edge Function schützt sich über die Origin-Prüfung
   und ihr Ratenlimit. Der Service-Role-Key und der API-Schlüssel des
   Sprachmodells dürfen dagegen NIEMALS hier stehen.
   ============================================================================= */

export const CONFIG = {
  version: '1.5.0',

  supabase: {
    url: 'https://dczolqwshfapsnpwsasy.supabase.co',
    publishableKey: 'sb_publishable_xG0wEf8XnASCRpENcnvg6w_RMTDiJVS',
  },

  ai: {
    /** Name der Edge Function. Aufruf: POST {url}/functions/v1/{functionName} */
    functionName: 'generate-words',
    /** Auswahl im Editor */
    counts: [15, 25, 40],
    defaultCount: 25,
    /** Abbruch, falls der Server hängt */
    timeoutMs: 45000,
  },
};

export const isBackendConfigured = () =>
  Boolean(CONFIG.supabase.url && CONFIG.supabase.publishableKey);
