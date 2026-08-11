# Bilder

```
bilder/
├── pastel-de-nata.jpg      ← fertig zugeschnitten, wird auf der Seite gezeigt
├── joghurtkruste.jpg
├── …
└── originale/              ← unveränderte Vorlage, nie überschreiben
    ├── pastel_de_nata.jpg
    └── …
```

Das Original bleibt in `originale/` liegen und wird nie überschrieben. Kommt
später ein anderer Bildausschnitt in Frage, lässt sich neu zuschneiden, ohne
dass Bildqualität verloren geht.

## Ablegen und eintragen

Dateiname wie die Rezept-`id`, dann findet man sich später wieder. Danach im
Rezept in `js/rezepte.js` eintragen:

```js
bild: {
  datei:  "bilder/pastel-de-nata.jpg",
  alt:    "Ein Pastel de Nata mit dunkel gefleckter Creme auf einem weißen Teller",
  fokus:  "left 30%",
  quelle: "eigenes Foto"
}
```

## Illustration statt Foto

Wenn kein brauchbares Foto da ist, geht auch eine gezeichnete SVG-Datei –
siehe `soljanka.svg`. Vorteile: winzige Dateigröße (5 KB), in jeder Größe
scharf, und keine Urheberfrage. Nachteil: es sieht eben gezeichnet aus.

SVG wird genauso eingetragen wie ein Foto:

```js
bild: {
  datei:  "bilder/soljanka.svg",
  alt:    "Illustration: Soljanka in einem ovalen Teller …",
  quelle: "Illustration, gezeichnet nach dem Foto auf dem Rezeptblatt"
}
```

Wichtig ist ein `viewBox` im SVG und ein Seitenverhältnis von 3:2
(z. B. `viewBox="0 0 600 400"`), damit der Zuschnitt wie bei Fotos passt.

## `quelle` – wem das Bild gehört

Erscheint als kleine Zeile unter dem großen Foto. `"eigenes Foto"` wird ohne
Zusatz gezeigt, alles andere als „Foto: …“.

**Bei fremden Aufnahmen immer setzen.** Zwei Gründe: Nach zwei Jahren weiß man
sonst nicht mehr, welches Bild man selbst gemacht hat. Und sollte die Seite
irgendwann doch ins Netz gehen, sieht man auf einen Blick, welche Bilder vorher
ersetzt werden müssen – fremde Fotos darf man nicht ohne Erlaubnis
veröffentlichen, auch nicht mit Nachweis.

Wasserzeichen im Bild **nicht** wegschneiden. Sie sind die Urheberkennzeichnung
des Fotografen; sie zu entfernen wäre schlimmer, als das Bild gar nicht zu
verwenden.

Der `alt`-Text beschreibt das Bild in einem knappen Satz. Er wird vorgelesen,
wenn jemand die Seite mit einem Screenreader nutzt, und erscheint, falls die
Datei einmal fehlt.

Solange kein Bild eingetragen ist, zeigt die Karte eine schlichte
Platzhalterfläche mit dem Kategorienamen. Die Seite bleibt also heil, auch
wenn erst die Hälfte der Rezepte ein Foto hat.

## Format und Zuschnitt

Die Seite braucht **Querformat**: die Karte in der Übersicht zeigt 4:3, das
große Bild auf der Detailseite 16:9. Rund 1600 px Breite reicht völlig.

Ein gutes Maß für die eigene Datei ist **3:2** – das liegt zwischen den beiden
Formaten, sodass in keiner Richtung viel verloren geht.

Handyfotos sind meist Hochformat. Zuschneiden geht ohne Zusatzprogramm mit
`sips`, das auf jedem Mac dabei ist:

```bash
sips --cropOffset 1080 0 -c 786 1179 originale/foto.jpg --out neues-rezept.jpg
```

`--cropOffset` sind Abstand von **oben** und von **links**, `-c` ist
**Höhe** und **Breite** – in dieser Reihenfolge, was leicht zu verwechseln ist.

## `fokus` – wohin zugeschnitten wird

Weil kein Foto 4:3 und 16:9 gleichzeitig trifft, schneidet die Seite zu.
Standardmäßig mittig. Sitzt das Motiv am Rand, wird es dabei angeschnitten –
genau das passiert beim Pastel de Nata, das links im Bild liegt.

`fokus` nimmt dieselben Werte wie CSS `object-position` und legt fest, welche
Bildkante beim Zuschneiden erhalten bleibt:

| Wert            | Wirkung                                  |
|-----------------|------------------------------------------|
| `"left 30%"`    | linke Kante bleibt, etwas oberhalb Mitte |
| `"right center"`| rechte Kante bleibt                      |
| `"50% 20%"`     | waagerecht mittig, oberer Bildbereich    |

Nicht raten: Bild eintragen, Übersicht **und** Detailseite ansehen, dann den
Wert festlegen.
