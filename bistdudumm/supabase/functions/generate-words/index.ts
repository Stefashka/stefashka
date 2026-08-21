/* =============================================================================
   generate-words  –  Supabase Edge Function
   -----------------------------------------------------------------------------
   Nimmt ein Thema entgegen und liefert eine Liste deutscher Spielbegriffe.
   Der API-Schlüssel des Sprachmodells liegt AUSSCHLIESSLICH hier auf dem
   Server – niemals im Browser.

   Deployment (einmalig) – im Ordner `bistdudumm/` ausführen,
   dort liegt der Unterordner `supabase/`:
     supabase login
     supabase link --project-ref dczolqwshfapsnpwsasy
     supabase secrets set ANTHROPIC_API_KEY=sk-ant-…
     supabase secrets set ALLOWED_ORIGINS=https://DEINE-DOMAIN.de
     supabase functions deploy generate-words --no-verify-jwt

   `--no-verify-jwt` ist nötig, weil die App niemanden anmeldet. Der Schutz
   läuft stattdessen über die Origin-Prüfung und das Ratenlimit unten.
   ============================================================================= */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

/** Günstig und schnell – für Wortlisten völlig ausreichend.
 *  Über das Secret AI_MODEL umstellbar, z. B. auf claude-sonnet-5. */
const MODEL = Deno.env.get('AI_MODEL') ?? 'claude-haiku-4-5';

const MAX_COUNT = 60;
const MAX_TOPIC_LENGTH = 120;

/** Kommagetrennt, z. B. "https://meine-domain.de,http://localhost:8080".
 *  Leer = alle Herkünfte erlaubt (nur zum Ausprobieren sinnvoll). */
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',').map(s => s.trim()).filter(Boolean);

/* ------------------------------------------------------------ Ratenlimit --
   Bewusst simpel: eine Zählung pro IP im Arbeitsspeicher. Edge Functions
   laufen ggf. in mehreren Instanzen, das hier hält also keinen gezielten
   Angriff auf – es verhindert aber, dass ein Versehen (Endlosschleife,
   Dauerklicken) die API-Kosten hochtreibt. Für harten Schutz bräuchte es
   eine Tabelle in der Datenbank.
   -------------------------------------------------------------------------- */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) hits.clear();          // Notbremse gegen Speicherwachstum
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/* ------------------------------------------------------------------ CORS -- */
function cors(origin: string | null): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.length === 0
    || (origin !== null && ALLOWED_ORIGINS.includes(origin));
  return {
    'Access-Control-Allow-Origin': allowed && origin ? origin : (ALLOWED_ORIGINS[0] ?? '*'),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });
}

/* ------------------------------------------------------------- Prompting -- */
function systemPrompt(spicy: boolean): string {
  return [
    'Du erzeugst Begriffe für ein deutsches Erklär- und Pantomimespiel',
    '(Prinzip „Heads Up“: einer hält das Handy an die Stirn, die anderen',
    'umschreiben oder mimen den Begriff).',
    '',
    'Regeln:',
    '- Ein bis drei Wörter pro Begriff, überwiegend Substantive oder feste Wendungen.',
    '- Konkret und darstellbar. Abstrakte Konzepte nur, wenn sie sich gut umschreiben lassen.',
    '- Gute Mischung aus einfach und knifflig, aber nichts extrem Nischiges.',
    '- Keine Dopplungen, keine Nummerierung, keine Erklärungen in Klammern.',
    '- Deutsche Rechtschreibung, Substantive großgeschrieben.',
    spicy
      ? '- Erwachsenenhumor, Anzüglichkeiten und derbe Begriffe sind ausdrücklich erwünscht.'
      : '- Jugendfrei. Nichts Anstößiges, nichts Diskriminierendes.',
    '',
    'Antworte AUSSCHLIESSLICH mit einem JSON-Array aus Strings.',
    'Kein Fließtext, keine Code-Zäune, keine Einleitung.',
    'Beispiel: ["Waschbär","Achterbahn","Schnappatmung"]',
  ].join('\n');
}

/** Das Modell antwortet meistens sauber – aber eben nur meistens. */
function extractWords(text: string): string[] {
  let raw = String(text ?? '').trim();
  raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start !== -1 && end > start) raw = raw.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Letzter Rettungsanker: zeilenweise lesen.
    // Dabei alles aussortieren, was nach Fließtext aussieht – sonst landet
    // eine Entschuldigung des Modells als „Begriff“ in der Kategorie.
    return raw.split('\n')
      .map(l => l.replace(/^[\s\-*\d.)"']+/, '').replace(/["',]+$/, '').trim())
      .filter(l =>
        l.length > 0 &&
        l.length <= 40 &&
        l.split(/\s+/).length <= 4 &&
        !/[.!?:;]$/.test(l));
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map(w => String(w).trim())
    .filter(w => w.length > 0 && w.length <= 60);
}

/* ------------------------------------------------------------------ Route - */
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Nur POST erlaubt.' }, 405, origin);
  }

  // Herkunft prüfen, sobald eine Liste hinterlegt ist
  if (ALLOWED_ORIGINS.length > 0 && (!origin || !ALLOWED_ORIGINS.includes(origin))) {
    return json({ error: 'Diese Herkunft ist nicht freigegeben.' }, 403, origin);
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unbekannt';
  if (rateLimited(ip)) {
    return json({ error: 'Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen.' }, 429, origin);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY ist nicht gesetzt.');
    return json({ error: 'Der Generator ist auf dem Server nicht konfiguriert.' }, 500, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Ungültige Anfrage.' }, 400, origin);
  }

  const topic = String(body.topic ?? '').trim().slice(0, MAX_TOPIC_LENGTH);
  if (topic.length < 2) {
    return json({ error: 'Bitte ein Thema angeben.' }, 400, origin);
  }
  const count = Math.min(Math.max(parseInt(String(body.count ?? 30), 10) || 30, 5), MAX_COUNT);
  const spicy = body.spicy === true;
  const exclude = Array.isArray(body.exclude)
    ? body.exclude.map(String).slice(0, 200)
    : [];

  const userPrompt = [
    `Thema: ${topic}`,
    `Anzahl: ${count}`,
    exclude.length
      ? `Diese Begriffe kommen bereits vor und dürfen NICHT wiederholt werden:\n${exclude.join(', ')}`
      : '',
  ].filter(Boolean).join('\n\n');

  try {
    const ai = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        temperature: 1,
        system: systemPrompt(spicy),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!ai.ok) {
      const detail = await ai.text();
      console.error('Anthropic-Fehler', ai.status, detail.slice(0, 500));
      const msg = ai.status === 401
        ? 'Der hinterlegte API-Schlüssel wird abgelehnt.'
        : ai.status === 429
          ? 'Das Sprachmodell ist gerade überlastet. Gleich nochmal versuchen.'
          : 'Das Sprachmodell hat nicht geantwortet.';
      return json({ error: msg }, 502, origin);
    }

    const data = await ai.json();
    const text = data?.content?.[0]?.text ?? '';
    const words = [...new Set(extractWords(text))].slice(0, count);

    if (words.length === 0) {
      return json({ error: 'Es kamen keine brauchbaren Begriffe zurück. Anderes Thema probieren?' }, 502, origin);
    }
    return json({ words, model: MODEL }, 200, origin);

  } catch (err) {
    console.error('Unerwarteter Fehler', err);
    return json({ error: 'Beim Erzeugen ist etwas schiefgegangen.' }, 500, origin);
  }
});
