# Rezepte

Eine reine HTML/CSS/JavaScript-Seite ohne Framework, ohne Build-Schritt und ohne
Server-Logik.

Die Seite liegt online unter `www.stefashka.de/dontbehangry`, im Repo also im
Ordner `dontbehangry` neben der Startseite.

**Die Adressen sind absolut** und beginnen mit `/dontbehangry/`. Das ist Absicht:
Wird die Seite ohne Schrägstrich am Ende aufgerufen – `…/dontbehangry` statt
`…/dontbehangry/` – und leitet der Server nicht um, dann lösen relative Pfade
eine Ebene zu hoch auf. Der Browser sucht `css/style.css` dann unter
`/css/style.css`, findet nichts, und die Seite kommt ohne Gestaltung und ohne
Rezepte an.

Zieht der Ordner um, sind genau **vier Stellen** zu ändern:

- `const BASIS = "/dontbehangry/";` in `js/app.js` – gilt für Bilder und Archivdateien
- die drei Verweise im Kopf von `index.html` auf `css/style.css`, `js/rezepte.js`
  und `js/app.js`, die vor dem JavaScript geladen werden und deshalb nichts von
  `BASIS` wissen können

In den Rezeptdaten selbst stehen die Pfade weiter relativ (`bilder/foto.jpg`) –
`BASIS` wird beim Anzeigen davorgesetzt.

```
dontbehangry/
├── index.html          Gerüst der Seite
├── css/style.css       Gestaltung (weiß, Alt-Rosa, plakativ, Druckansicht)
├── js/rezepte.js       ← HIER kommen die Rezepte rein. Nur diese Datei ändert sich.
├── js/app.js           Logik: Skalierung, Kalorien, Filter, Timer, Kochmodus
├── bilder/             ein Foto pro Rezept
└── quellen/            die archivierten Originale – der wichtigste Ordner
```

## Ein Rezept hinzufügen

Rezepte entstehen ausschließlich in `js/rezepte.js`. Die Seite selbst hat kein
Formular mehr – sie zeigt an, sie nimmt nichts entgegen. Das hält sie zu einem
Ordner ohne Server, ohne Konto und ohne Datenbank.

Am einfachsten: Screenshot, PDF, Zeitschriftenfoto oder Instagram-Link liefern –
ich pflege es ein. Von Hand geht es so: in `js/rezepte.js` einen neuen Block in
das `REZEPTE`-Array einfügen. Der Kommentarkopf der Datei beschreibt jedes Feld.
Die Reihenfolge im Array ist die Reihenfolge auf der Seite.

Drei Dinge, die man leicht falsch macht:

- **`kcal` gehört zur angegebenen Menge**, nicht zu 100 g. Bei „80 g Butter“
  stehen also die Kalorien von 80 g Butter (592), nicht die von 100 g.
- **`portionen`** ist die Menge, für die die Zutaten notiert sind. Alles andere
  rechnet die Seite daraus ab.
- **`fest: true`** bei Zutaten, die nicht mitwachsen sollen – „Mehl zum
  Arbeiten“, „Öl für die Form“.

## Was die Seite kann

**Menge einstellen.** Der Steller rechnet alle Zutaten und die Gesamtkalorien
mit. Gramm werden gerundet, Stück/EL/TL als Brüche gesetzt („1 ½ Zwiebeln“).

**Kalorien.** Liegen pro Zutat in den Daten, nicht pro Rezept. Dadurch ist die
Summe herleitbar, skaliert exakt mit, und der Wert pro Portion bleibt beim
Hochrechnen konstant. Überall als Schätzwert gekennzeichnet.

**Timer.** Zeitangaben im Schritttext werden automatisch antippbar. Bei einer
Spanne („20 bis 25 Minuten“) startet der **kleinere** Wert – dann schaut man
beim ersten sinnvollen Zeitpunkt nach, statt es zu überbacken. Mehrere Timer
laufen gleichzeitig, mit Pause und Signalton.

Erkannt werden ganze Zahlen, Kommazahlen und Brüche: „15 Minuten“,
„1 ½ Stunden“, „1,5 Stunden“, „½ Stunde“, „30 Sekunden“ und Thermomix-Angaben
wie „3 Min. / 37 °C / Stufe 1“. Nicht angesprungen werden Temperaturen
(„240 °C“), Maße („2 cm“) und Löffelmengen („1 TL“).

**Thermomix.** `thermomix: true` setzt eine Marke neben die Kategorie, auf
Karte und Detailseite. Im Filterfeld gibt es dazu die Gruppe „Gerät“, und die
Suche findet solche Rezepte über „thermomix“ oder „tm“.

Setzen, wenn das Rezept die Maschine **braucht** – also in Thermomix-Angaben
notiert ist („3 Min./37°/St.1“) oder ohne Hochleistungsmixer nur mit Umweg
gelingt. Nicht setzen bei Rezepten, die man im Thermomix machen *könnte*, die
aber genauso von Hand gehen. Faustregel: Steht im Original ein Gerät, gilt die
Marke – steht keines da, bleibt sie `false`.

**Kochmodus.** Ein Schritt groß auf dem Bildschirm, Zutaten einen Griff weit
weg, Pfeiltasten oder große Knöpfe zum Blättern, Escape beendet. Das Display
bleibt an, solange der Browser das unterstützt (Wake-Lock). Haken gelten in
beiden Ansichten – was im Kochmodus erledigt ist, ist es auch im Rezept.

**Filter.** Ernährung (vegan, vegetarisch, laktosefrei, glutenfrei) wird
UND-verknüpft, dazu Gesamtzeit und „hat jetzt Saison“. Die Suche greift
zusätzlich auf Zutaten zu – „feta“ findet das Ofengemüse.

**Sicherung.** Der Knopf im Fuß legt eine JSON-Datei mit allen Rezepten und
deinen Einstellungen ab. Beim Einlesen werden gewählte Mengen und die
Einkaufsliste zurückgeholt. Die **Rezepte selbst kann die Seite nicht
zurückschreiben** – dafür müsste sie auf die Festplatte schreiben, was ein
Browser nicht darf. Sie stecken aber vollständig in der Datei und können nach
`js/rezepte.js` zurückkopiert werden. Die Seite sagt beim Einlesen ehrlich, wenn
in der Datei mehr Rezepte stecken als geladen sind.

## Ansehen und veröffentlichen

Ein Doppelklick auf `index.html` genügt **nicht** mehr – die absoluten Adressen
zeigen dann auf die Wurzel der Festplatte. Stattdessen einen kleinen Server im
**übergeordneten** Ordner starten, damit die Ebene `/dontbehangry/` existiert:

```bash
cd <Ordner über dem Projekt> && python3 -m http.server 8000
```

Dann `http://localhost:8000/dontbehangry/` aufrufen. Der Projektordner muss dafür
`dontbehangry` heißen. Das lohnt sich, weil ein Server sich in
zwei Punkten anders verhält als ein Doppelklick – und genau so verhält sich auch
GitHub Pages.

Zwei Fallen:

- Der Browser hält `app.js` im Zwischenspeicher. Kommt eine Änderung nicht an,
  mit anderer Adresse laden: `http://localhost:8000/index.html?v=2`
- Ein Aufruf, der sich nur im `#`-Teil unterscheidet, lädt das Dokument **nicht**
  neu – dann läuft weiter der alte Stand.

Zum Veröffentlichen wird der Ordnerinhalt nach `dontbehangry/` ins Repo
kopiert. Dateinamen sind im Netz **groß-/kleinschreibungsempfindlich**, auf dem
Mac nicht: Was lokal läuft, kann online 404 liefern, wenn ein Buchstabe anders
geschrieben ist. Eine leere Datei `.nojekyll` in der Wurzel des Repos schaltet
Jekyll ab, das sonst Ordner mit führendem Unterstrich stillschweigend übergeht.

`bilder/originale/` und `quellen/` gehen beim Hochladen mit und sind dann
öffentlich abrufbar – dort liegt fremdes Material.

## Was gespeichert wird

Gewählte Mengen, Haken und Einkaufsliste liegen im `localStorage`
des jeweiligen Geräts unter dem Schlüssel `rezepte.v1`. Nichts davon verlässt
den Browser, es gibt keine Konten und kein Tracking. Wer die Seite auf Handy
und Laptop öffnet, hat zwei getrennte Listen – die Sicherungsdatei ist der Weg
von einem Gerät zum anderen.
