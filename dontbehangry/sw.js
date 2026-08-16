/* ══════════════════════════════════════════════════════════════════
   Offline-Speicher

   Die Sammlung soll auch dann funktionieren, wenn das WLAN in der
   Küche wegbricht. Der Ansatz ist bewusst „Netz zuerst":

   Solange eine Verbindung besteht, kommt jede Datei frisch vom Server
   und wird nebenbei abgelegt. Nur wenn das Netz nicht antwortet,
   springt die Ablage ein. Das ist etwas langsamer als „Ablage zuerst",
   hat aber einen entscheidenden Vorteil: Wenn du den Ordner neu
   hochlädst, siehst du die neue Fassung sofort und musst nichts
   leeren.

   Version hochzählen, wenn sich der Kern der Seite ändert – dann
   räumt der Speicher beim nächsten Start auf.
   ══════════════════════════════════════════════════════════════════ */

const ABLAGE = "rezepte-v1";

/* Was schon beim ersten Besuch mitgenommen wird, damit die Seite auch
   dann steht, wenn du sie offline zum ersten Mal öffnest. */
const KERN = [
  "./",
  "index.html",
  "css/style.css",
  "js/rezepte.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const ablage = await caches.open(ABLAGE);
    /* Einzeln statt addAll: eine fehlende Datei darf nicht die ganze
       Einrichtung scheitern lassen. */
    await Promise.all(KERN.map(pfad =>
      ablage.add(new Request(pfad, { cache: "reload" })).catch(() => {})
    ));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const namen = await caches.keys();
    await Promise.all(namen.filter(n => n !== ABLAGE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const anfrage = e.request;
  if (anfrage.method !== "GET") return;

  const adresse = new URL(anfrage.url);
  if (adresse.origin !== self.location.origin) return;   /* fremde Server nicht anfassen */

  e.respondWith((async () => {
    try {
      /* Netz zuerst, aber nicht ewig warten – nach fünf Sekunden gilt
         die Verbindung als tot und die Ablage übernimmt. */
      const antwort = await Promise.race([
        fetch(anfrage),
        new Promise((_, weg) => setTimeout(() => weg(new Error("zu langsam")), 5000))
      ]);
      if (antwort && antwort.ok && antwort.type === "basic") {
        const ablage = await caches.open(ABLAGE);
        ablage.put(anfrage, antwort.clone());
      }
      return antwort;
    } catch (e2) {
      const abgelegt = await caches.match(anfrage, { ignoreSearch: true });
      if (abgelegt) return abgelegt;
      /* Seitenaufrufe landen notfalls auf der Startseite – besser als
         die Fehlerseite des Browsers. */
      if (anfrage.mode === "navigate") {
        const start = await caches.match("index.html") || await caches.match("./");
        if (start) return start;
      }
      return new Response("Offline und nicht in der Ablage.", {
        status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
