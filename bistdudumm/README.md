# Bist Du Dumm?! 🎉

Das Erklärspiel für Freunde mit fragwürdigem Allgemeinwissen.
Kategorie wählen → Handy vor die Brust → raten → kippen.

Eine **Progressive Web App**: kein App Store, kein Download, aber nach dem
Hinzufügen zum Home-Bildschirm fühlt sie sich an wie eine native iPhone-App –
eigenes Icon, Vollbild, offline spielbar.

---

> ### ⚠️ Doppelklick auf `index.html` funktioniert **nicht**
>
> Dann bleibt nur der Startbildschirm stehen und nichts passiert. Das ist kein
> Fehler, sondern eine Sicherheitsregel des Browsers: Öffnet man eine Datei per
> Doppelklick, läuft sie unter `file://`. Moderne JavaScript-Module dürfen dort
> aus Sicherheitsgründen keine weiteren Dateien nachladen – die App startet also
> nie.
>
> **Zwei Lösungen:**
>
> 1. **Richtig:** deployen (siehe unten). Dann läuft alles, inklusive Sensor.
> 2. **Schnell für zwischendurch:** Mini-Server **eine Ebene über** dem Ordner
>    starten – nicht darin, sonst finden die Pfade nichts:
>    ```bash
>    cd /pfad/zum/repo        # hier liegt der Ordner bistdudumm
>    python3 -m http.server 8080
>    ```
>    und `http://localhost:8080/bistdudumm/` öffnen. Design und Spielablauf
>    funktionieren dann komplett – nur das Kippen nicht, denn dafür verlangt
>    iOS zwingend HTTPS.

---

## Inhalt

1. [In 10 Minuten live: GitHub → Vercel → Domain](#1-in-10-minuten-live)
2. [Aufs iPhone legen](#2-aufs-iphone-legen)
2b. [Impressum vervollständigen](#2b-impressum-vervollständigen)
3. [Begriffe einpflegen](#3-begriffe-einpflegen)
4. [Wie das Kippen funktioniert](#4-wie-das-kippen-funktioniert)
5. [Projektstruktur](#5-projektstruktur)
6. [KI-Begriffsgenerator (Supabase)](#6-ki-begriffsgenerator-supabase)
7. [Bekannte Grenzen auf iOS](#7-bekannte-grenzen-auf-ios)
8. [Lokal entwickeln](#8-lokal-entwickeln)
9. [Was geprüft wurde](#9-was-geprüft-wurde)

---

## 1. In 10 Minuten live

### Schritt 1 – GitHub

```bash
cd /pfad/zum/repo          # die Ebene, in der der Ordner bistdudumm liegt
git init
git add .
git commit -m "Bist Du Dumm?! v1.1.0"
git branch -M main
git remote add origin git@github.com:DEIN-ACCOUNT/bist-du-dumm.git
git push -u origin main
```

### Schritt 2 – Vercel

1. [vercel.com](https://vercel.com) → **Add New… → Project**
2. Das GitHub-Repo auswählen → **Import**
3. Framework Preset: **Other**
   Build Command: *leer lassen*
   Output Directory: *leer lassen* (Vercel liefert das Repo-Root als statische Seite aus)
4. **Deploy**

Nach ca. 30 Sekunden gibt es eine URL – mit HTTPS. Die App liegt darunter im
Unterordner, also unter `…vercel.app/bistdudumm/`. Das mitgelieferte
`vercel.json` leitet `/` automatisch dorthin weiter, damit die nackte Domain
funktioniert.
**Das HTTPS ist keine Kür, sondern Pflicht:** iOS gibt den Neigungssensor nur
über eine sichere Verbindung frei.

Ab jetzt gilt: jeder `git push` auf `main` deployt automatisch neu.

### Schritt 3 – Eigene Domain

Vercel-Projekt → **Settings → Domains → Add** → Domain eintragen.
Vercel zeigt die nötigen DNS-Einträge an (meist ein `A`-Record auf
`76.76.21.21` oder ein `CNAME` auf `cname.vercel-dns.com`). Beim Domain-Anbieter
eintragen, 5–30 Minuten warten, fertig. Das TLS-Zertifikat stellt Vercel selbst aus.

> **Wichtig bei Updates:** In `sw.js` steht oben `const CACHE = 'bdd-v1.1.0';`.
> Bei jedem Deploy diese Zahl hochzählen – sonst zeigt der Service Worker bei
> bereits installierten Geräten die alte Version.

---

## 2. Aufs iPhone legen

1. Die Seite in **Safari** öffnen (nicht Chrome – nur Safari kann installieren)
2. **Teilen-Symbol** ⬆️ → **Zum Home-Bildschirm**
3. Icon erscheint auf dem Home-Bildschirm

Beim ersten Antippen einer Kategorie fragt iOS nach **Zugriff auf Bewegung und
Ausrichtung** → **Erlauben**. Ohne diese Erlaubnis funktioniert das Kippen nicht,
die App schaltet dann automatisch auf die Buttons „Richtig“ / „Passen“ um.

Versehentlich abgelehnt? iOS merkt sich das. Zurücksetzen über
*Einstellungen → Apps → Safari → Erweitert → Website-Daten → Eintrag löschen*,
danach die Seite neu laden.

---

## 2b. Impressum vervollständigen

In **`js/legal.js`** steht ganz oben ein kleiner Block mit den Angaben zur
verantwortlichen Person. Dort fehlt noch die **E-Mail-Adresse** – die ist nach
§ 5 DDG Pflicht:

```js
export const LEGAL = {
  name:    'Stefanie Eichwald',
  street:  'Oberhofstraße 55',
  city:    '88045 Friedrichshafen',
  email:   'Stefanie.Eichwald@web.de',
  phone:   '',                             // optional
};
```

Solange der Platzhalter drinsteht, zeigt die App im Impressum eine rote
Warnung an – damit die Seite nicht unvollständig online geht.

Erreichbar ist das Impressum an zwei Stellen: über die Fußzeile des
Startbildschirms und über Einstellungen → „Impressum & Datenschutz".

> Die Texte sind sorgfältig für ein privates, nicht kommerzielles Projekt ohne
> Werbung, Verkauf und Nutzerkonten zusammengestellt – aber keine
> Rechtsberatung. Bei kommerzieller Nutzung kämen Umsatzsteuer-ID und der
> Hinweis auf die EU-Streitschlichtungsplattform dazu.

---

## 3. Begriffe einpflegen

Alles Inhaltliche liegt in **`js/words.js`** – das ist die einzige Datei, die
für neue Begriffe angefasst werden muss:

```js
export const WORDS = {
  tiere:  ['Elefant', 'Waschbär', 'Nacktmull', 'Alpaka'],
  essen:  ['Currywurst', 'Tiramisu', 'Rosenkohl'],
  laender:['Portugal', 'Neuseeland', 'Bhutan'],
};
```

Die Schlüssel (`tiere`, `essen`, …) sind die `id`-Werte aus `js/categories.js`.
Jede Kategorie, die dort **nicht** auftaucht, bekommt automatisch die
Platzhalter „Loren Ipsum 1–25“.

**Stand jetzt:** alle 40 Standardkategorien sind mit je 35 handverlesenen
Begriffen gefüllt – 1400 Stück. Die Reihenfolge in der Datei ist egal, gezogen
wird gemischt (siehe „Merker für die Runden“ weiter unten).

Neue Kategorie anlegen → Eintrag in `js/categories.js` ergänzen:

```js
{ id: 'sprichwoerter', name: 'Sprichwörter', emoji: '💬', g: 'teal' },
```

Verfügbare Farbverläufe (`g`): `grass ocean sky grape indigo berry rose flame
gold lime teal plum crimson sand mint ink`.

**Merker für die Runden:** Die App speichert pro Kategorie, welche Begriffe
schon dran waren, und zieht in Folgerunden zuerst die noch ungenutzten. Erst
wenn der Vorrat leer ist, wird neu gemischt. Zurücksetzen lässt sich das in den
Einstellungen unter „Begriffs-Gedächtnis leeren“.

---

## 4. Wie das Kippen funktioniert

Aus `DeviceOrientationEvent` (alpha/beta/gamma) wird der Schwerkraftvektor im
Gerätekoordinatensystem berechnet:

```
g = ( cosβ·sinγ , −sinβ , −cosβ·cosγ )
```

Ausgewertet wird nur **gz**, also die Schwerkraft entlang der Bildschirm-Normalen:

| gz    | Bedeutung                      | Aktion    |
|-------|--------------------------------|-----------|
| ≈ 0   | Display senkrecht (Startpose)  | –         |
| → +1  | Display kippt nach unten       | ✅ Richtig |
| → −1  | Display kippt nach oben        | ⏭ Passen  |

Der Vorteil: **gz ist unabhängig von Hoch- oder Querformat.** Die Geste
funktioniert in jeder Haltung gleich.

**Kalibrierung:** Solange die Anleitung und der 3-2-1-Countdown laufen, zieht
die Nulllage permanent nach. Erst im Moment des Rundenstarts wird sie
eingefroren (`motion.freeze()`). Die Ausgangsposition wird also exakt dann
erfasst, wenn das Handy schon an der Brust ist – nicht beim Hochheben.

**Lesewinkel:** Beim Einfrieren wird zusätzlich `atan2(−gx, −gy)` berechnet und
auf 90° gerundet. Wird das Handy quer gehalten, dreht die App die komplette
Spieloberfläche mit – die Erklärenden lesen immer aufrecht.

**Querformat als Ansage:** Der Vorbereitungs-Screen wird auf Telefonen von
vornherein um 90° gedreht dargestellt. Niemand muss eine Anleitung lesen – ein
querstehender Bildschirm sagt von selbst „dreh mich". Zusätzlich steht unten
ein *nicht* mitgedrehter Hinweis „Handy quer drehen". Sobald der Sensor
bestätigt, dass wirklich quer gehalten wird, steht der Inhalt aufrecht und der
Hinweis verschwindet – wird andersherum gedreht, dreht die App mit.
Ohne Sensor übernimmt die Runde denselben Winkel wie die Anleitung, damit der
Begriff nicht plötzlich quer steht. Auf Tablets und am Rechner passiert nichts
davon (`Math.min(innerWidth, innerHeight) < 600`).

**Auto-Drehung vs. Drehsperre.** Entscheidend ist, ob das Betriebssystem die
Seite bereits gedreht hat. Das erkennt die App am Seitenverhältnis des
Fensters, nicht am Sensor:

| Handyhaltung | Seite gedreht? | Eigene Drehung |
|---|---|---|
| hochkant | nein | 90° – die Ansage „dreh mich" |
| quer, Auto-Drehung an | ja | **0°** – das System hat es schon erledigt |
| quer, Drehsperre an | nein | 90° bzw. 270°, passend zur Richtung |

Die Schwerkraft sagt nur, *ob* quer gehalten wird (dafür verschwindet der
Hinweis) – das *Wie viel* kommt aus dem Fenster. Beides zu addieren war der
Fehler in v1.2.0: bei Auto-Drehung stand alles doppelt gedreht.
Dreht das System mitten in der Runde, zieht die App über `resize` sofort nach.

Empfindlichkeit (Standard 0.55 ≈ 56° Neigung) ist in den Einstellungen
dreistufig einstellbar.

---

## 5. Projektstruktur

```
<repo-root>/
├── vercel.json              ⬅ MUSS hier liegen, nicht im Ordner darunter
├── .vercelignore            hält supabase/ aus dem Deployment raus
├── supabase/                ⬅ Edge Function, wird NICHT mit ausgeliefert
│   ├── config.toml
│   └── functions/generate-words/index.ts
└── bistdudumm/
    ├── index.html           Grundgerüst aller Screens
    ├── manifest.webmanifest PWA-Manifest (Name, Icons, Farben)
    ├── sw.js                Service Worker (Offline-Cache)
    ├── css/
    │   └── app.css          Komplettes Design-System
    ├── js/
    │   ├── app.js           Screens, Navigation, Spiellogik
    │   ├── categories.js    Kategorie-Metadaten + Farbverläufe
    │   ├── words.js         ⬅ HIER die Begriffe eintragen
    │   ├── copy.js          Alle Texte / Sprüche an einem Ort
    │   ├── store.js         Persistenz (heute localStorage, morgen Supabase)
    │   ├── audio.js         Synthetisierte Sounds (keine Audiodateien)
    │   ├── haptics.js       Vibration inkl. iOS-Notlösung
    │   ├── motion.js        Neigungssensor, Kalibrierung, Gesten
    │   ├── ai.js            KI-Begriffsgenerator (Hülle)
    │   ├── legal.js         ⬅ Impressum & Datenschutz (E-Mail eintragen!)
    │   └── config.js        Supabase-Zugangsdaten (noch leer)
    └── icons/               App-Icons in allen Größen
```

### Zu den Pfaden in `index.html`

Alle Verweise sind **absolut** notiert und enthalten den Ordnernamen:

```html
<link rel="stylesheet" href="/bistdudumm/css/app.css">
<script type="module" src="/bistdudumm/js/app.js"></script>
```

Der führende Schrägstrich ist entscheidend. Ohne ihn (`bistdudumm/js/app.js`)
sucht der Browser von der index.html aus weiter und landet bei
`/bistdudumm/bistdudumm/js/app.js` → weißer Bildschirm.

⚠️ **Groß- und Kleinschreibung zählt.** Auf dem Mac sind `Bistdudumm` und
`bistdudumm` dasselbe, auf Vercel (Linux) nicht. Der Ordner muss durchgehend
**klein** geschrieben sein: `bistdudumm` – sonst 404 nach dem Deploy, obwohl
es lokal lief.

Als Netz hängt an CSS und Skript ein `onerror`: Sollte der Ordner doch mal
anders heißen oder verschoben werden, lädt die App relativ nach und bleibt
spielbar (im Log stehen dann zwei 404-Meldungen, die nichts kaputtmachen).

`sw.js` und `manifest.webmanifest` behalten bewusst relative Pfade – sie
werden aus ihrem eigenen Ordner heraus aufgelöst und stimmen dadurch
automatisch.

Kein Build-Schritt, kein Bundler, keine Abhängigkeiten. Reine ES-Module –
Vercel liefert die Dateien direkt aus.

---

## 6. KI-Begriffsgenerator (Supabase)

Der Generator im Kategorie-Editor ist angeschlossen. Er braucht eine Sache, die
noch fehlt: die **Edge Function muss einmal veröffentlicht werden**. Bis dahin
meldet die App „Die Funktion generate-words ist noch nicht bei Supabase
veröffentlicht.“

### So funktioniert es

```
App (Browser)  ──POST──▶  Supabase Edge Function  ──▶  Claude (Anthropic)
                            generate-words
   ◀── Wortliste ──────────────────────────────────────┘
```

Der API-Schlüssel des Sprachmodells liegt **ausschließlich** in der Edge
Function als Secret. Er taucht nirgends im Browser auf. Der publishable key in
`js/config.js` darf dagegen öffentlich sein – das ist sein Zweck.

### Einmalig einrichten

```bash
# Supabase CLI installieren (macOS)
brew install supabase/tap/supabase

# im Repo-Root, also dort wo der Ordner supabase/ liegt
supabase login
supabase link --project-ref dczolqwshfapsnpwsasy

# Schlüssel hinterlegen – auf console.anthropic.com erzeugen
supabase secrets set ANTHROPIC_API_KEY=sk-ant-…

# Nur die eigene Domain darf die Funktion aufrufen
supabase secrets set ALLOWED_ORIGINS=https://DEINE-DOMAIN.de

# veröffentlichen
supabase functions deploy generate-words --no-verify-jwt
```

Zum Testen von localhost aus die Adresse mit in `ALLOWED_ORIGINS` aufnehmen,
kommagetrennt und ohne Leerzeichen:

```bash
supabase secrets set ALLOWED_ORIGINS=https://DEINE-DOMAIN.de,http://localhost:8080
```

### Prüfen, ob es läuft

```bash
curl -i -X POST \
  "https://dczolqwshfapsnpwsasy.supabase.co/functions/v1/generate-words" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_xG0wEf8XnASCRpENcnvg6w_RMTDiJVS" \
  -H "Origin: https://DEINE-DOMAIN.de" \
  -d '{"topic":"Dinge im Kühlschrank","count":10}'
```

Erwartet wird `{"words":[...],"model":"claude-haiku-4-5"}`.
Logs live mitlesen: `supabase functions logs generate-words --tail`

### Was eingebaut ist

| Schutz | Wirkung |
|---|---|
| `ALLOWED_ORIGINS` | Nur deine Domain darf die Funktion aufrufen |
| Ratenlimit | 20 Anfragen pro IP in 10 Minuten |
| `count` gedeckelt | Höchstens 60 Begriffe pro Aufruf |
| `max_tokens: 1500` | Begrenzt die Kosten pro Aufruf nach oben |

Das Ratenlimit liegt im Arbeitsspeicher der Funktion. Es fängt Versehen ab –
Dauerklicken, eine Schleife im Code. Gegen einen gezielten Angriff hilft es
nicht, dafür bräuchte es eine Tabelle in der Datenbank. Bei einem privaten
Partyspiel ist das vertretbar; wenn die Adresse breiter bekannt wird, solltest
du nachrüsten.

### Modell wechseln

Standard ist `claude-haiku-4-5` – schnell und günstig, für Wortlisten völlig
ausreichend. Umstellen ohne Codeänderung:

```bash
supabase secrets set AI_MODEL=claude-sonnet-5
```

### Was der Generator kostet

Ein Aufruf mit 40 Begriffen sind grob 700 Tokens Ein- und Ausgabe zusammen.
Bei Haiku bewegt sich das im Bereich von Bruchteilen eines Cents pro Aufruf.
Für das Befüllen aller 40 Kategorien reden wir über wenige Cent insgesamt.

### Datenschutz

Die Datenschutzerklärung wurde erweitert (Punkt 4). Wichtig: **Sie nennt den
Serverstandort deines Supabase-Projekts.** Den musst du einmal in
`js/legal.js` bei `supabaseRegion` eintragen – nachzusehen im Supabase-
Dashboard unter Project Settings → General → Region. Solange dort der
Platzhalter steht, warnt die App.

## 7. Bekannte Grenzen auf iOS

| Funktion | Status auf dem iPhone |
|---|---|
| Neigungssensor | ✅ nach Erlaubnis, nur über HTTPS |
| Sound | ✅ synthetisiert; `navigator.audioSession = 'playback'` sorgt dafür, dass es auch bei aktiviertem Stummschalter klingt |
| Bildschirm wachhalten | ✅ Wake Lock API |
| Offline | ✅ Service Worker |
| Vibration | ⚠️ `navigator.vibrate()` gibt es in Safari nicht. Die App nutzt den bekannten Switch-Trick; funktioniert er nicht, trägt der Sound das Feedback. |
| Ausrichtung sperren | ❌ nicht möglich – deshalb dreht die App den Inhalt selbst |
| Push-Nachrichten | ⚠️ nur für installierte PWAs, hier nicht genutzt |

---

## 8. Lokal entwickeln

ES-Module brauchen einen Server (`file://` funktioniert nicht):

```bash
cd /pfad/zum/repo        # NICHT in den Ordner bistdudumm hinein
python3 -m http.server 8080
```

Wichtig: den Server **eine Ebene über** dem Ordner starten und
`http://localhost:8080/bistdudumm/` aufrufen.

Auf dem Desktop gibt es keinen Neigungssensor – die App schaltet automatisch
auf Buttons um. Zusätzlich funktionieren Tastenkürzel:

| Taste | Wirkung |
|---|---|
| `↓` oder `Leertaste` | Richtig |
| `↑` | Passen |
| `Esc` | Runde abbrechen / Dialog schließen |

Für echte Sensortests: Handy und Rechner ins gleiche WLAN, mit
`npx serve . --ssl-cert …` oder einfacher über eine Vercel-Preview-URL testen
(jeder Branch bekommt automatisch eine eigene HTTPS-Adresse).

---

## 9. Was geprüft wurde

Automatisiert getestet (Chromium, Playwright), jeweils Start, Kategorieauswahl,
Kalibrierung, Runde, Pause, Auswertung, Gesamtstand und Statistik:

| Geprüft | Ergebnis |
|---|---|
| 9 Bildschirmgrößen von iPhone SE (375 px) bis Desktop (1280 px) und Querformat | kein Überlauf, kein abgeschnittener Text |
| Extremwort mit 42 Zeichen | passt sich automatisch an (67–152 px je nach Gerät) |
| Offline nach dem ersten Laden | App startet vollständig aus dem Cache |
| `localStorage` blockiert (Safari-Privatmodus) | App läuft, speichert nur nichts |
| Kein Web Audio | App läuft ohne Ton, keine Fehler |
| Kein Neigungssensor | schaltet automatisch auf Buttons um |
| Mehrfach-Tipp auf eine Kategorie | startet die Runde trotzdem nur einmal |
| Farbkontraste Text/Fläche | alle über 4,5:1 (WCAG AA) |
| Konsolenfehler | keine |

**Nicht automatisiert prüfbar, weil in dieser Umgebung nur die Chromium-Engine
verfügbar war:** Safari und Firefox. Stattdessen wurde jede verwendete Browser-
Funktion einzeln gegen die Safari-/Firefox-Unterstützung abgeglichen und alles
ersetzt, was neuer als iOS 15.0 bzw. Firefox 103 ist. Verbleibende
Einschränkungen stehen in Abschnitt 7.

Vor dem großen Einsatz trotzdem: einmal auf einem echten iPhone durchspielen.
Kippschwelle und Lautstärke lassen sich nur im echten Wohnzimmer beurteilen.

---

Viel Spaß. Und tut nicht so, als hättet ihr das Wort gekannt.
