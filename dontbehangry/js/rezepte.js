/* ============================================================
   REZEPTDATEN
   ============================================================

   Das ist die einzige Datei, die beim Einpflegen neuer Rezepte
   angefasst wird. Aufbau eines Rezepts:

   {
     id:          "kurz-und-eindeutig",     // wird Teil der Adresse: #/rezept/kurz-und-eindeutig
     titel:       "…",
     untertitel:  "…",                      // ein Satz, erscheint auf der Karte
     kategorie:   "Süß" | "Brot" | "Deftig" | "Aufstrich",

     bild:        { datei: "bilder/name.jpg", alt: "…" },   // optional, siehe unten
     herkunft:    { … },                                    // siehe QUELLENARCHIV

     portionen:      12,                    // für DIESE Mengen sind die Zutaten gedacht
     portionenName:  "Stück",               // "Portionen" | "Stück" | "Scheiben" | "Gläser" …
     zeit:        { aktiv: 20, ruhe: 0, garen: 15 },   // Minuten, jeweils optional
     schwierigkeit: "Einfach" | "Mittel" | "Anspruchsvoll",
     thermomix:   true,                     // Thermomix-Rezept? siehe unten

     ernaehrung:  ["vegetarisch"],          // nur aus der festen Liste, siehe ERNAEHRUNG
     saison:      [7, 8, 9],                // Monate 1–12; leer = ganzjährig
     marken:      ["Blätterteig", "…"],     // freie Stichwörter, mitdurchsucht

     zutaten:     [ … ],                    // siehe ZUTATEN
     schritte:    ["…", "…"],
     notiz:       "…"                       // optional, erscheint als farbiger Kasten
   }

   ── BILD ────────────────────────────────────────────────────
   { datei:  "bilder/pastel-de-nata.jpg",
     alt:    "Kurze Bildbeschreibung",
     fokus:  "left 30%",          // optional, siehe unten
     quelle: "eigenes Foto" }     // optional, aber bei fremden Fotos Pflicht

   `quelle` erscheint als kleine Zeile unter dem großen Bild. Steht dort
   „eigenes Foto“, wird es ohne Zusatz gezeigt; alles andere erscheint als
   „Foto: …“. Bei fremden Aufnahmen immer setzen – sonst weiß man nach
   zwei Jahren nicht mehr, welches Bild man selbst gemacht hat.

   Datei in den Ordner `bilder/` legen. Querformat wirkt am besten,
   etwa 1600 px breit reicht völlig. Fehlt das Feld, zeigt die Karte
   eine schlichte Platzhalterfläche – die Seite bleibt heil.

   Die Karte zeigt 4:3, die Detailseite 16:9. Weil kein Foto beide
   Formate genau trifft, schneidet die Seite zu – standardmäßig
   mittig. Sitzt das Motiv am Rand, `fokus` setzen: derselbe Wert
   wie CSS `object-position`, also z. B. "left 30%", "right center"
   oder "50% 20%". Erst am gerenderten Bild prüfen, dann festlegen.

   ── QUELLENARCHIV ───────────────────────────────────────────
   herkunft: {
     typ:     "Instagram" | "Zeitschrift" | "PDF" | "Website" | "Familie" | "Eigenes",
     text:    "@konto  ·  Heft 4/2024, S. 38  ·  von wem auch immer",
     url:     "https://…",                   // optional, Originaladresse
     archiv:  "quellen/name-quelle.pdf",     // optional, ABER: siehe unten
     erfasst: "2026-07-31"                   // wann ins Archiv geholt
   }

   `archiv` ist das eigentlich Wichtige. Instagram-Beiträge werden
   gelöscht, Zeitschriften-Websites verschwinden, Links verrotten.
   Deshalb: Screenshot oder PDF des Originals in den Ordner `quellen/`
   legen und hier eintragen. Nur dann ist die Herkunft in fünf Jahren
   noch da. Die Seite zeigt sichtbar an, wenn ein Archiv fehlt.

   ── ZUTATEN ─────────────────────────────────────────────────
   zutaten: [
     { gruppe: "Creme", posten: [
         { menge: 250, einheit: "ml", name: "Milch", kcal: 160 },
         { menge: null, einheit: "", name: "Salz", kcal: 0, notiz: "eine Prise" },
         { menge: null, einheit: "", name: "Fett für die Form", kcal: 25, fest: true }
     ]}
   ]
   • menge: null  → keine Zahl anzeigen (z. B. „Salz“, „Pfeffer“)
   • kcal:        Kalorien für GENAU DIE ANGEGEBENE MENGE, nicht pro 100 g.
                  Wird mitskaliert. Ohne nennenswerte Energie: 0.
   • fest: true   → Menge wächst beim Hochrechnen NICHT mit
                  („Mehl zum Arbeiten“, „Fett für die Form“)
   • notiz:       kleine Zusatzzeile unter der Zutat

   ── THERMOMIX ───────────────────────────────────────────────
   `thermomix: true` setzt eine Marke neben die Kategorie – auf der
   Karte und auf der Detailseite. Im Filterfeld gibt es dazu die
   Gruppe „Gerät“, und die Suche findet solche Rezepte über
   „thermomix“ oder „tm“.

   Setz es, wenn das Rezept die Maschine BRAUCHT – entweder weil es in
   Thermomix-Angaben notiert ist („3 Min./37°/St.1“ = Zeit / Temperatur /
   Stufe), oder weil es ohne Hochleistungsmixer nur mit Umweg geht.

   Nicht setzen bei Rezepten, die man im Thermomix machen KÖNNTE, die
   aber genauso von Hand gelingen – sonst sagt die Marke am Ende nichts
   mehr aus. Faustregel: Steht im Original ein Gerät, gilt die Marke.
   Steht keines da, bleibt sie false.

   ── SCHRITTE UND TIMER ──────────────────────────────────────
   Zeitangaben im Schritttext werden automatisch zu antippbaren
   Timern: „15 Minuten backen“, „12 bis 18 Stunden gehen lassen“,
   „30 Sekunden“. Bei einer Spanne startet der Timer mit dem
   KLEINEREN Wert – dann schaut man beim ersten sinnvollen
   Zeitpunkt nach, statt es zu überbacken.

   ============================================================ */

const KATEGORIEN = ["Süß", "Brot", "Deftig", "Aufstrich"];

/* Feste Liste – nur diese Werte gehören in `ernaehrung`. */
const ERNAEHRUNG = ["vegan", "vegetarisch", "laktosefrei", "glutenfrei"];

const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni",
                "Juli", "August", "September", "Oktober", "November", "Dezember"];

const REZEPTE = [

  {
    id: "pastel-de-nata",
    titel: "Pastel de Nata",
    untertitel: "Blätterteig, Puddingcreme, 240 °C – in 35 Minuten wie in Lissabon.",
    kategorie: "Süß",
    bild: {
      datei: "bilder/pastel-de-nata.jpg",
      alt: "Ein Pastel de Nata mit dunkel gefleckter Creme auf einem weißen Teller",
      fokus: "left 30%",
      quelle: "eigenes Foto"
    },
    herkunft: {
      typ: "Website",
      text: "Marias Foodstyle",
      url: "https://mariasfoodstyle.de/rezepte/pastel-de-nata-selber-machen-einfaches-original-nahes-rezept/",
      archiv: "quellen/pastel-de-nata-marias-foodstyle.pdf",
      erfasst: "2026-07-31"
    },
    portionen: 12,
    portionenName: "Stück",
    zeit: { aktiv: 20, ruhe: 0, garen: 15 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: ["vegetarisch"],
    saison: [],
    marken: ["Blätterteig", "portugiesisch", "Muffinform", "unter 45 Minuten"],
    zutaten: [
      { gruppe: "Teig", posten: [
        { menge: 1,   einheit: "Rolle", name: "Blätterteig aus dem Kühlregal", kcal: 1018, notiz: "ca. 275 g" }
      ]},
      { gruppe: "Creme", posten: [
        { menge: 250, einheit: "ml", name: "Milch",                    kcal: 160 },
        { menge: 200, einheit: "ml", name: "Sahne",                    kcal: 580 },
        { menge: 100, einheit: "g",  name: "Rohrohrzucker",            kcal: 400 },
        { menge: 2,   einheit: "Stk",name: "Eigelb",                   kcal: 120, notiz: "Größe L" },
        { menge: 1,   einheit: "Stk",name: "Ei",                       kcal: 88,  notiz: "Größe L" },
        { menge: 25,  einheit: "g",  name: "Speisestärke",             kcal: 88 },
        { menge: 0.5, einheit: "Stk",name: "Vanilleschote",            kcal: 3,   notiz: "nur das Mark auskratzen" },
        { menge: null,einheit: "",   name: "Salz",                     kcal: 0,   notiz: "eine Prise" },
        { menge: 1,   einheit: "Stk",name: "Zitronenschale",           kcal: 0,   notiz: "optional, ohne das Weiße" }
      ]},
      { gruppe: "Zum Schluss", posten: [
        { menge: null,einheit: "",   name: "Zimt und Puderzucker zum Bestreuen", kcal: 50, notiz: "nach Geschmack" },
        { menge: null,einheit: "",   name: "Fett für die Muffinform",   kcal: 25, fest: true }
      ]}
    ],
    schritte: [
      "Ofen auf 240 °C Ober-/Unterhitze vorheizen – richtig heiß. Muffinblech aus Metall leicht fetten, kein Silikon: Metall gibt die Hitze direkt an den Teig weiter, sonst wird der Boden nicht knusprig.",
      "Blätterteig 15 Minuten vorher aus dem Kühlschrank holen, damit er sich rollen lässt, ohne zu brechen.",
      "Vanilleschote längs aufschlitzen und das Mark auskratzen. Milch und Sahne mit dem Vanillemark im Topf heiß machen, fast bis zum Kochen – so zieht das Aroma in die Flüssigkeit.",
      "In einer Schüssel Zucker, Speisestärke und Salz mischen. Ei und Eigelb dazugeben und glatt rühren.",
      "Die heiße Milch-Sahne langsam und unter ständigem Rühren dazugießen.",
      "Alles zurück in den Topf und bei mittlerer Hitze rührend aufblubbern lassen, bis es puddingdick ist.",
      "Wer mag: die Zitronenschale kurz ziehen lassen und dann herausnehmen.",
      "Ist die Creme vor dem Teig fertig, mit Frischhaltefolie direkt auf der Oberfläche abdecken – dann bildet sich keine Haut.",
      "Blätterteig ausrollen und ganz dicht der Länge nach aufrollen, dann in 12 gleiche Stücke schneiden.",
      "Teigstücke in die Muffinmulden setzen, mit den Fingern flach drücken und den Rand hochziehen.",
      "Die Creme vor dem Einfüllen abkühlen lassen, bis sie nur noch lauwarm ist – heiß eingefüllt weicht sie die untere Blätterteigschicht auf und der Boden bleibt labbrig.",
      "Creme in die Teigförmchen füllen, etwa ¾ voll. Mit Spritzbeutel geht es sauberer, ein Esslöffel reicht aber auch.",
      "Etwa 15 Minuten bei 240 °C backen, bis oben dunkle Flecken entstehen. Die Bräune im Auge behalten, jeder Ofen bäckt anders.",
      "Wer einen Grill im Ofen hat: plus 2 Minuten auf Grillstufe 3.",
      "10 Minuten auf einem Gitter abkühlen lassen, mit Löffel oder Gabel aus der Form heben und mit Zimt und Puderzucker bestreuen."
    ],
    notiz: "Die 240 °C sind der ganze Trick. Viele Rezepte backen bei 180 bis 200 °C – dann fehlen die dunklen Flecken und die Creme wird eher fest als cremig. Die Creme wird nur kurz aufgekocht und der Rest passiert im heißen Ofen."
  },

  {
    id: "joghurtkruste",
    titel: "Joghurtkruste",
    untertitel: "Topfbrot aus dem kalten Ofen, Joghurt macht die Krume saftig.",
    kategorie: "Brot",
    bild: null,
    herkunft: {
      typ: "Website",
      text: "Ikors – Kochen....meine Leidenschaft",
      url: "https://ikors.blogspot.com/2015/03/joghurtkruste.html",
      archiv: "quellen/joghurtkruste-ikors.txt",
      erfasst: "2026-07-31"
    },
    portionen: 16,
    portionenName: "Scheiben",
    zeit: { aktiv: 15, ruhe: 90, garen: 60 },
    schwierigkeit: "Einfach",
    thermomix: true,
    ernaehrung: ["vegetarisch"],
    saison: [],
    marken: ["Topfbrot", "Hefeteig", "kalter Ofen", "Zaubermeister"],
    zutaten: [
      { gruppe: "Hefewasser", posten: [
        { menge: 240, einheit: "g",  name: "Wasser",                    kcal: 0 },
        { menge: 10,  einheit: "g",  name: "frische Hefe",              kcal: 11 }
      ]},
      { gruppe: "Teig", posten: [
        { menge: 350, einheit: "g",  name: "Weizenmehl Type 550",       kcal: 1197 },
        { menge: 150, einheit: "g",  name: "Roggenmehl Type 1150",      kcal: 488 },
        { menge: 100, einheit: "g",  name: "Joghurt",                   kcal: 68, notiz: "im Original 3,8 %" },
        { menge: 2,   einheit: "TL", name: "Salz",                      kcal: 0 },
        { menge: 1,   einheit: "TL", name: "Honig",                     kcal: 21 },
        { menge: 1,   einheit: "TL", name: "Backmalz",                  kcal: 18, notiz: "im Original selbstgemacht · alternativ Zuckerrübensirup 1:1" },
        { menge: 2,   einheit: "EL", name: "weißer Balsamico",          kcal: 26 }
      ]},
      { gruppe: "Außerdem", posten: [
        { menge: null,einheit: "",   name: "Mehl zum Formen und Bestreuen", kcal: 30, fest: true },
        { menge: null,einheit: "",   name: "Fett für den Topf",         kcal: 25, fest: true }
      ]}
    ],
    schritte: [
      "Wasser und frische Hefe in den Mixtopf geben: 3 Min. / 37 °C / Stufe 1.",
      "Weizenmehl, Roggenmehl, Joghurt, Salz, Honig, Backmalz und Balsamico zugeben: 4 Min. / Knetstufe.",
      "Teig in eine gemehlte Schüssel geben, mit Mehl bestreuen und 1 ½ Stunden gehen lassen.",
      "Teig auf die gemehlte Arbeitsfläche geben, mehrmals zusammenfalten und zu einem Brot formen.",
      "Zaubermeister, Römertopf oder einen ähnlichen Topf mit Deckel einfetten und bemehlen.",
      "Brot hineinlegen, mit Mehl bestreuen und einschneiden. Deckel auflegen.",
      "Topf in den KALTEN Ofen auf die unterste Schiene stellen, dann auf 240 °C Ober-/Unterhitze aufheizen.",
      "50 bis 60 Minuten backen.",
      "Deckel abnehmen und ohne Deckel nachbräunen, bis die Kruste die gewünschte Farbe hat.",
      "Brot auf einem Gitter vollständig abkühlen lassen, bevor du es anschneidest."
    ],
    notiz: "Der kalte Ofen ist hier Absicht: Topf und Teig heizen gemeinsam auf, dadurch geht das Brot langsamer und gleichmäßiger auf. Nicht vorheizen, auch wenn es sich falsch anfühlt. Die Angaben „3 Min./37°/St.1“ und „4 Min./Knetstufe“ stammen aus dem Original und sind Thermomix-Stufen – ohne Thermomix: Hefe im lauwarmen Wasser auflösen und den Teig 5 Minuten mit der Maschine oder 10 Minuten von Hand kneten."
  },

  {
    id: "spinat-ricotta-cannelloni",
    titel: "Spinat-Ricotta-Cannelloni",
    untertitel: "Auflauf mit selbst gefüllten Röhren – lässt sich am Vortag vorbereiten.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "Website",
      text: "Jamie Oliver · „Spinach & ricotta cannelloni“",
      url: "https://www.jamieoliver.com/recipes/pasta/spinach-ricotta-cannelloni/",
      archiv: "quellen/spinat-ricotta-cannelloni-jamie-oliver.txt",
      erfasst: "2026-07-31"
    },
    portionen: 6,
    portionenName: "Portionen",
    zeit: { aktiv: 30, ruhe: 0, garen: 60 },
    schwierigkeit: "Mittel",
    thermomix: false,
    ernaehrung: ["vegetarisch"],
    saison: [],
    marken: ["Auflauf", "Ofen", "vorbereitbar", "italienisch"],
    zutaten: [
      { gruppe: "Tomatensauce", posten: [
        { menge: 1,   einheit: "Stk",  name: "Zwiebel",                    kcal: 48 },
        { menge: 2,   einheit: "Zehe" ,name: "Knoblauch",                  kcal: 9 },
        { menge: 800, einheit: "g",    name: "Pflaumentomaten aus der Dose", kcal: 160, notiz: "2 Dosen à 400 g" },
        { menge: 1,   einheit: "Stk",  name: "Lorbeerblatt",               kcal: 0 },
        { menge: 15,  einheit: "g",    name: "Basilikum",                  kcal: 6, notiz: "ein halbes Bund, Hälfte für die Sauce" },
        { menge: 1,   einheit: "Stk",  name: "Zitrone",                    kcal: 10, notiz: "nur die abgeriebene Schale einer halben" }
      ]},
      { gruppe: "Füllung", posten: [
        { menge: 400, einheit: "g",    name: "Spinat",                     kcal: 92 },
        { menge: 250, einheit: "g",    name: "Ricotta",                    kcal: 435 },
        { menge: 1,   einheit: "Stk",  name: "Ei",                         kcal: 88, notiz: "Größe L" },
        { menge: 30,  einheit: "g",    name: "Parmesan",                   kcal: 120, notiz: "im Original ohne Mengenangabe" },
        { menge: 0.25,einheit: "TL",   name: "Muskatnuss, gemahlen",       kcal: 0 }
      ]},
      { gruppe: "Zum Schichten und Backen", posten: [
        { menge: 150, einheit: "g",    name: "Cannelloni-Röhren",          kcal: 525, notiz: "etwa 14 Stück" },
        { menge: 250, einheit: "g",    name: "Mozzarella",                 kcal: 625, notiz: "2 Kugeln à 125 g" },
        { menge: 2,   einheit: "EL",   name: "Olivenöl zum Dünsten",       kcal: 265, notiz: "im Original ohne Mengenangabe" },
        { menge: 1,   einheit: "EL",   name: "Olivenöl zum Beträufeln",    kcal: 133 },
        { menge: null,einheit: "",     name: "Salz und schwarzer Pfeffer", kcal: 0 }
      ]}
    ],
    schritte: [
      "Ofen auf 180 °C Ober-/Unterhitze vorheizen.",
      "Spinat mit 1 EL Olivenöl und dem Muskat in einen großen Topf geben, salzen und pfeffern. Zugedeckt bei mittlerer Hitze zusammenfallen lassen, dann zum Abkühlen beiseitestellen.",
      "Zwiebel und Knoblauch fein würfeln. Zwiebel im selben Topf in 1 EL Olivenöl weich dünsten, ohne dass sie Farbe nimmt.",
      "Tomaten mit den Händen zerdrücken und zugeben. Knoblauch, Lorbeerblatt, die Hälfte des Basilikums und die abgeriebene Schale einer halben Zitrone dazu. 20 Minuten offen einkochen, bis die Sauce dicklich ist.",
      "Den abgekühlten Spinat kräftig ausdrücken – da kommt überraschend viel Wasser heraus – und fein hacken.",
      "Ei mit 2 TL geriebenem Parmesan verquirlen, mit dem Spinat und dem Ricotta vermengen und kräftig abschmecken.",
      "Die Masse in einen Spritzbeutel füllen und damit die Cannelloni füllen. Röhren in eine gefettete Auflaufform von etwa 20 × 25 cm legen.",
      "Lorbeerblatt aus der Sauce nehmen. Sauce über die Cannelloni geben, restliches Basilikum darauf verteilen, Mozzarella in Scheiben darüberlegen und mit 1 EL Olivenöl beträufeln. Restlichen Parmesan darüber reiben.",
      "35 bis 40 Minuten backen, bis die Oberfläche goldbraun ist. Wird sie zu schnell dunkel, mit Alufolie abdecken.",
      "Vor dem Servieren 5 Minuten ruhen lassen, dann lässt sich der Auflauf besser portionieren."
    ],
    notiz: "Der Spinat muss wirklich trocken sein. Bleibt Wasser drin, wird die Füllung matschig und verdünnt die Sauce in der Form – nach dem Ausdrücken sollte er sich fast krümelig anfühlen. Die Form lässt sich am Vortag füllen und abgedeckt kalt stellen, dann etwa 10 Minuten länger backen. Ohne Spritzbeutel: Cannelloni aufrecht in ein Glas stellen und mit einem Teelöffelstiel füllen."
  },

  {
    id: "curry-dattel-dip",
    titel: "Curry-Dattel-Dip",
    untertitel: "Fünf Minuten, ein Mixer, fertig. Süß-scharf zu Rohkost und Brot.",
    kategorie: "Aufstrich",
    bild: null,
    herkunft: {
      typ: "Instagram",
      text: "@geschmacksliebe",
      archiv: "quellen/curry-dattel-dip-geschmacksliebe.png",
      erfasst: "2026-07-31"
    },
    portionen: 8,
    portionenName: "Portionen",
    zeit: { aktiv: 5, ruhe: 0, garen: 0 },
    schwierigkeit: "Einfach",
    thermomix: true,
    ernaehrung: ["vegetarisch", "glutenfrei"],
    saison: [],
    marken: ["Dip", "ohne Kochen", "unter 10 Minuten", "Mixer"],
    zutaten: [
      { gruppe: "", posten: [
        { menge: 150, einheit: "g",    name: "Datteln, entsteint",       kcal: 423 },
        { menge: 2,   einheit: "Zehe" ,name: "Knoblauch",                kcal: 8 },
        { menge: 300, einheit: "g",    name: "Frischkäse natur",         kcal: 750 },
        { menge: 200, einheit: "g",    name: "Schmand",                  kcal: 480 },
        { menge: 2.5, einheit: "TL",   name: "Curry",                    kcal: 20 },
        { menge: 0.5, einheit: "TL",   name: "Salz",                     kcal: 0 },
        { menge: null,einheit: "",     name: "gemahlener Pfeffer",       kcal: 0, notiz: "nach Bedarf" }
      ]}
    ],
    schritte: [
      "Datteln und Knoblauch in den Mixtopf geben und auf höchster Stufe zerkleinern, bis keine groben Stücke mehr zu sehen sind.",
      "Frischkäse, Schmand, Curry und Salz zugeben und alles glatt verrühren lassen.",
      "Mit Pfeffer und Salz abschmecken."
    ],
    notiz: "Ohne Hochleistungsmixer: Datteln mit dem Messer sehr klein hacken – oder einen Tag vorher in Wasser einweichen, abgießen und vorsichtig mit dem Pürierstab pürieren. Die übrigen Zutaten lassen sich dann von Hand oder mit dem Pürierstab unterrühren. Das Original nennt nur „Hochleistungsmixer auf höchster Stufe“ und keine genauen Thermomix-Stufen – notier dir deine eigenen, sobald du sie einmal gefunden hast. Der Dip wird nach einer Stunde im Kühlschrank runder, weil das Curry durchzieht."
  },

  {
    id: "soljanka",
    titel: "Soljanka",
    untertitel: "Säuerlicher Wursteintopf mit Gewürzgurken – alles kommt in den Mixtopf.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "PDF",
      text: "ausgedrucktes Rezeptblatt, Titel dort „Ukrainische Soljanka“, Verfasser unbekannt",
      archiv: "quellen/russische_soljanka.png",
      erfasst: "2026-07-31"
    },
    portionen: 8,
    portionenName: "Portionen",
    zeit: { aktiv: 15, ruhe: 0, garen: 50 },
    schwierigkeit: "Einfach",
    thermomix: true,
    ernaehrung: [],
    saison: [],
    marken: ["Suppe", "Eintopf", "Wurst", "großer Topf", "Resteverwertung"],
    zutaten: [
      { gruppe: "Wurst und Fleisch", posten: [
        { menge: 200, einheit: "g",  name: "Salami, gewürfelt",          kcal: 780 },
        { menge: 200, einheit: "g",  name: "Jagdwurst, gewürfelt",       kcal: 500 },
        { menge: 200, einheit: "g",  name: "Geflügelwurst, gewürfelt",   kcal: 380 },
        { menge: 200, einheit: "g",  name: "Schinkenspeck, gewürfelt",   kcal: 700 }
      ]},
      { gruppe: "Gemüse und Würze", posten: [
        { menge: 3,   einheit: "Stk",name: "Zwiebeln",                   kcal: 180, notiz: "größere" },
        { menge: 3,   einheit: "Stk",name: "Paprikaschoten",             kcal: 140 },
        { menge: 30,  einheit: "g",  name: "Öl",                         kcal: 265 },
        { menge: 150, einheit: "g",  name: "Tomatenmark",                kcal: 123, notiz: "je nach Geschmack auch mehr" },
        { menge: 5,   einheit: "Stk",name: "Gewürzgurken",               kcal: 50,  notiz: "oder mehr, plus etwas Gurkenwasser" },
        { menge: 1,   einheit: "EL", name: "Sambal Oelek",               kcal: 14,  notiz: "oder 1 getrocknete Chilischote" },
        { menge: 2,   einheit: "Stk",name: "Lorbeerblätter",             kcal: 0 },
        { menge: 5,   einheit: "Stk",name: "Pimentkörner",               kcal: 0,   notiz: "muss aber nicht sein" },
        { menge: 1,   einheit: "TL", name: "Senf",                       kcal: 3 },
        { menge: 3,   einheit: "Zehe" , name: "Knoblauch, zerdrückt",    kcal: 13 },
        { menge: null,einheit: "",   name: "fette Brühe",                kcal: 20,  notiz: "am besten Brühwürfel, dann stimmt die Dosierung" },
        { menge: null,einheit: "",   name: "Wasser",                     kcal: 0,   notiz: "bis alles bedeckt ist" }
      ]},
      { gruppe: "Zum Servieren", posten: [
        { menge: 150, einheit: "g",  name: "saure Sahne",                kcal: 173 },
        { menge: 1,   einheit: "Stk",name: "Zitrone",                    kcal: 20,  notiz: "in Scheiben" }
      ]}
    ],
    schritte: [
      "Zwiebeln vierteln, Paprika in Stücke schneiden, beides in den Mixtopf geben und 5 Sek. / Stufe 5 zerkleinern.",
      "Öl, Wurst, Fleisch und Paprika in den Mixtopf geben, mit dem Spatel durchmischen und 5 Min. / Varoma / Linkslauf / Stufe 1 andünsten. Linkslauf nicht vergessen, sonst zerhackt es die Wurst.",
      "Wasser darübergießen, bis alles bedeckt ist. Lorbeerblätter, Pimentkörner, Tomatenmark, Brühwürfel, zerdrückten Knoblauch, Senf und Chilischote zugeben und 20 Min. / 100 °C / Linkslauf / Stufe 1 kochen.",
      "Gewürzgurken klein schneiden und mit etwas Gurkenwasser zugeben. Nochmals 20 Min. / 100 °C / Linkslauf / Stufe 1 kochen.",
      "Mit Gewürzgurkensud abschmecken, bis es dir schmeckt, und ein paar Minuten / 100 °C / Linkslauf / Stufe 1 verrühren. Wer mag, schmeckt zusätzlich mit Letscho ab.",
      "Lorbeerblätter herausnehmen. Mit einem Klecks saurer Sahne und einer Scheibe Zitrone servieren – so gehört sich das für eine echte Soljanka."
    ],
    notiz: "Das Säuerliche macht das Gericht: Gewürzgurken, Gurkensud und Zitrone. Trau dich beim Abschmecken, mehr Sud zu nehmen als du erst denkst. Beim Andünsten immer den Linkslauf einschalten, sonst wird aus den Wurstwürfeln Brei. Am zweiten Tag ist die Soljanka besser als am ersten, sie hält sich gut drei Tage im Kühlschrank."
  },

  {
    id: "san-sebastian-cheesecake",
    titel: "San Sebastian Cheesecake",
    untertitel: "Sieben Zutaten, dunkel gebacken, in der Mitte fast wie Pudding.",
    kategorie: "Süß",
    bild: null,
    herkunft: {
      typ: "Website",
      text: "einfachkochen.de",
      url: "https://www.einfachkochen.de/rezepte/san-sebastian-cheesecake-das-cremige-originalrezept",
      archiv: "quellen/san-sebastian-cheesecake-einfachkochen.txt",
      erfasst: "2026-08-01"
    },
    portionen: 12,
    portionenName: "Stück",
    zeit: { aktiv: 10, ruhe: 240, garen: 35 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: ["vegetarisch"],
    saison: [],
    marken: ["Käsekuchen", "spanisch", "Springform 22 cm", "wenig Zutaten", "ohne Boden"],
    zutaten: [
      { gruppe: "", posten: [
        { menge: 700, einheit: "g",  name: "Frischkäse",            kcal: 2380, notiz: "Doppelrahmstufe, nicht mager" },
        { menge: 250, einheit: "g",  name: "Zucker",                kcal: 1000 },
        { menge: 2,   einheit: "Pck",name: "Vanillezucker",         kcal: 64 },
        { menge: 5,   einheit: "Stk",name: "Eier",                  kcal: 380, notiz: "Größe M" },
        { menge: 400, einheit: "ml", name: "Schlagsahne",           kcal: 1160 },
        { menge: 30,  einheit: "g",  name: "Weizenmehl Type 405",   kcal: 103 },
        { menge: null,einheit: "",   name: "Salz",                  kcal: 0, notiz: "eine Prise" },
        { menge: null,einheit: "",   name: "Backpapier für die Form", kcal: 0, fest: true }
      ]}
    ],
    schritte: [
      "Ofen auf 210 °C Heißluft vorheizen. Eine hohe Springform von 22 cm mit Backpapier auslegen und das Papier mehrere Zentimeter über den Rand hinausstehen lassen – der Kuchen geht deutlich auf.",
      "Frischkäse, Zucker, Vanillezucker und Salz in einer großen Schüssel mit dem Schneebesen glatt rühren, bis keine Klümpchen mehr zu sehen sind.",
      "Die Eier einzeln unterrühren und jedes vollständig einarbeiten, bevor das nächste dazukommt.",
      "Mehl mit 6 EL der Sahne klümpchenfrei verrühren, dann zusammen mit der restlichen Sahne unter die Masse rühren.",
      "Teig in die Form gießen und etwa 35 Minuten backen, bis die Oberfläche deutlich dunkel wird. Die starke Bräunung ist gewollt – sie bringt den Karamellgeschmack.",
      "Kuchen vollständig in der Form abkühlen lassen, dann herauslösen.",
      "Mindestens 4 Stunden kalt stellen, besser über Nacht. Erst dann bekommt die Mitte ihre puddingartige Bindung."
    ],
    notiz: "Die fast verbrannt aussehende Oberfläche ist das Kennzeichen dieses Kuchens und keine Panne – ohne sie fehlt der Karamellton. Dafür braucht es die hohen 210 °C und Heißluft. Ebenso wichtig ist Frischkäse in Doppelrahmstufe: mit magerer Ware wird die Mitte nicht cremig, sondern fest. Zur Zeitangabe: Die Quelle nennt 45 Minuten, zählt darin aber nur Arbeit und Backzeit. Hier stehen zusätzlich 4 Stunden Kühlung, weil der Kuchen vorher nicht servierfähig ist."
  },

  {
    id: "zwetschgendatschi",
    titel: "Zwetschgendatschi",
    untertitel: "Quark-Öl-Teig ohne Gehzeit, ein ganzes Blech, dicke Zimtstreusel.",
    kategorie: "Süß",
    bild: null,
    herkunft: {
      typ: "Website",
      text: "Emma's Lieblingsstücke",
      url: "https://www.emmaslieblingsstuecke.com/saftiger-zwetschgen-datschi-aus-quark-oel-teig/",
      archiv: "quellen/zwetschgendatschi-emmaslieblingsstuecke.txt",
      erfasst: "2026-08-01"
    },
    portionen: 20,
    portionenName: "Stück",
    zeit: { aktiv: 30, ruhe: 0, garen: 35 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: ["vegetarisch"],
    saison: [8, 9, 10],
    marken: ["Blechkuchen", "Quark-Öl-Teig", "ohne Gehzeit", "Streusel"],
    zutaten: [
      { gruppe: "Teig", posten: [
        { menge: 150, einheit: "g",   name: "Speisequark",            kcal: 165, notiz: "20 %" },
        { menge: 6,   einheit: "EL",  name: "Milch",                  kcal: 58 },
        { menge: 6,   einheit: "EL",  name: "neutrales Speiseöl",     kcal: 796 },
        { menge: 100, einheit: "g",   name: "Zucker",                 kcal: 400 },
        { menge: 1,   einheit: "Pck", name: "Vanillezucker",          kcal: 32 },
        { menge: 300, einheit: "g",   name: "Mehl",                   kcal: 1026 },
        { menge: 1,   einheit: "Pck", name: "Backpulver",             kcal: 0 },
        { menge: null,einheit: "",    name: "Salz",                   kcal: 0, notiz: "eine Prise" }
      ]},
      { gruppe: "Belag", posten: [
        { menge: 1400,einheit: "g",   name: "Zwetschgen",             kcal: 658, notiz: "im Original 1,3 bis 1,5 kg" },
        { menge: 4,   einheit: "EL",  name: "brauner Zucker",         kcal: 234 }
      ]},
      { gruppe: "Zimtstreusel", posten: [
        { menge: 300, einheit: "g",   name: "Mehl",                   kcal: 1026 },
        { menge: 200, einheit: "g",   name: "kalte Butter",           kcal: 1480 },
        { menge: 200, einheit: "g",   name: "brauner Zucker",         kcal: 780 },
        { menge: 3,   einheit: "TL",  name: "Zimt",                   kcal: 38 }
      ]}
    ],
    schritte: [
      "Ofen auf 180 °C Ober-/Unterhitze vorheizen. Ein Blech von etwa 30 × 40 cm mit Backpapier auslegen oder einfetten.",
      "Quark, Milch, Öl, Zucker, Vanillezucker und Salz glatt verrühren. Mehl mit Backpulver mischen und unterkneten, bis ein glatter Teig entsteht – er muss nicht gehen.",
      "Teig direkt auf dem Blech ausrollen und bis in die Ecken drücken.",
      "Zwetschgen waschen, gut abtropfen lassen und entsteinen. Auf dem Teig verteilen und leicht andrücken.",
      "Mit 4 EL braunem Zucker bestreuen. Das bindet den Saft und hält den Teig unten trockener.",
      "Für die Streusel Mehl, kalte Butter, braunen Zucker und Zimt mit den Händen zu Krümeln verreiben und über den Zwetschgen verteilen.",
      "30 bis 35 Minuten backen, bis die Streusel goldbraun sind.",
      "Vollständig abkühlen lassen. Dazu passt Zimt-Schlagsahne."
    ],
    notiz: "Der Quark-Öl-Teig ist der Grund, warum ein ganzes Blech in einer Stunde fertig ist: keine Hefe, keine Gehzeit. Die Zwetschgen wirklich gut abtropfen lassen und den braunen Zucker nicht weglassen – beides entscheidet, ob der Boden knusprig bleibt oder durchweicht. Die Autorin ersetzt den Zucker für eine leichtere Variante teilweise oder ganz durch Erythrit oder Xylit."
  },

  {
    id: "griechischer-nudelsalat",
    titel: "Griechischer Nudelsalat",
    untertitel: "Oliven, Gurke, Tomate, Feta – in einer Viertelstunde gemischt.",
    kategorie: "Deftig",
    bild: {
      datei: "bilder/griechischer-nudelsalat.jpg",
      alt: "Griechischer Nudelsalat mit Fusilli, Tomaten, Gurke, schwarzen Oliven und Feta in einer weißen Schüssel",
      quelle: "Gaumenfreundin"
    },
    herkunft: {
      typ: "Website",
      text: "Gaumenfreundin",
      url: "https://www.gaumenfreundin.de/griechischer-nudelsalat-mit-oliven-gurken-und-feta/",
      archiv: "quellen/griechischer-nudelsalat-gaumenfreundin.txt",
      erfasst: "2026-08-01"
    },
    portionen: 6,
    portionenName: "Portionen",
    zeit: { aktiv: 15, ruhe: 20, garen: 0 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: ["vegetarisch"],
    saison: [6, 7, 8, 9],
    marken: ["Nudelsalat", "Grillbeilage", "vorbereitbar", "griechisch", "meal prep"],
    zutaten: [
      { gruppe: "Salat", posten: [
        { menge: 300, einheit: "g",   name: "Nudeln",                 kcal: 1050, notiz: "Fusilli oder ähnliche kurze Form" },
        { menge: 1,   einheit: "Stk", name: "rote Zwiebel",           kcal: 32, notiz: "klein" },
        { menge: 200, einheit: "g",   name: "Salatgurke",             kcal: 24, notiz: "eine halbe" },
        { menge: 250, einheit: "g",   name: "Tomaten",                kcal: 45 },
        { menge: 50,  einheit: "g",   name: "schwarze Oliven",        kcal: 73 },
        { menge: 80,  einheit: "g",   name: "Feta",                   kcal: 200 }
      ]},
      { gruppe: "Dressing", posten: [
        { menge: 1,   einheit: "Zehe" , name: "Knoblauch",            kcal: 4 },
        { menge: 5,   einheit: "EL",  name: "Olivenöl",               kcal: 600 },
        { menge: 3,   einheit: "EL",  name: "Rotweinessig",           kcal: 9 },
        { menge: 2,   einheit: "EL",  name: "Zitronensaft",           kcal: 7 },
        { menge: 1,   einheit: "TL",  name: "Oregano",                kcal: 13 },
        { menge: null,einheit: "",    name: "Salz und Pfeffer",       kcal: 0 }
      ]}
    ],
    schritte: [
      "Nudeln nach Packungsanweisung kochen, aber eher knapp – im Salat ziehen sie weiter Flüssigkeit und werden noch weicher.",
      "Zwiebel fein würfeln. Gurke und Tomaten in großzügige Stücke schneiden, nicht zu klein, sonst geben sie Wasser ab.",
      "Knoblauch fein hacken und mit Olivenöl, Rotweinessig, Zitronensaft und Oregano verquirlen. Mit Salz und Pfeffer abschmecken.",
      "Die noch warmen Nudeln direkt mit dem Dressing mischen – warm nehmen sie es besser auf.",
      "Sobald die Nudeln abgekühlt sind, Zwiebel, Gurke, Tomaten, Oliven und den zerbröselten Feta untermischen.",
      "Mindestens 20 Minuten durchziehen lassen und vor dem Servieren noch einmal abschmecken."
    ],
    notiz: "Zwei Dinge entscheiden über das Ergebnis: Die Nudeln knapp kochen, weil sie im Salat nachziehen. Und das Gemüse großzügig schneiden – kleine Würfel wässern den Salat. Beim Oregano nicht sparen, davon kommt der griechische Ton. Hält sich zwei bis drei Tage im Kühlschrank. Zur Kalorienangabe: Die Quelle nennt 252 kcal je Portion, hat dabei aber offenbar das Dressing nicht mitgezählt – allein die 5 EL Olivenöl sind rund 600 kcal. Hier ist alles eingerechnet."
  },

  {
    id: "jaegersauce",
    titel: "Jägersauce",
    untertitel: "Champignons, Butter, Sahne – dreißig Minuten einköcheln, ohne Messbecher.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "PDF",
      text: "Vorwerk · Rezeptkarte „Jägersauce – Jägersoße TM31“",
      archiv: "quellen/jaegersauce-vorwerk-tm31.png",
      erfasst: "2026-08-01"
    },
    portionen: 4,
    portionenName: "Portionen",
    zeit: { aktiv: 20, ruhe: 0, garen: 30 },
    schwierigkeit: "Einfach",
    thermomix: true,
    ernaehrung: [],
    saison: [],
    marken: ["Sauce", "Champignons", "zu Fleisch", "TM31"],
    zutaten: [
      { gruppe: "", posten: [
        { menge: 3,   einheit: "Stk", name: "Schalotten",                    kcal: 65 },
        { menge: 80,  einheit: "g",   name: "Butter",                        kcal: 592 },
        { menge: 400, einheit: "g",   name: "Champignons",                   kcal: 88, notiz: "frisch, in Scheiben" },
        { menge: 20,  einheit: "g",   name: "Tomatenmark",                   kcal: 16 },
        { menge: 30,  einheit: "g",   name: "Mehl",                          kcal: 103 },
        { menge: 250, einheit: "g",   name: "Brühe",                         kcal: 8 },
        { menge: 200, einheit: "g",   name: "Sahne",                         kcal: 580 },
        { menge: 1,   einheit: "EL",  name: "Sojasauce",                     kcal: 9 },
        { menge: 1,   einheit: "EL",  name: "italienische Kräuter",          kcal: 13, notiz: "getrocknet" },
        { menge: null,einheit: "",    name: "Piment",                        kcal: 0, notiz: "eine Prise" },
        { menge: null,einheit: "",    name: "Salz und Pfeffer",              kcal: 0 }
      ]}
    ],
    schritte: [
      "Schalotten in den Mixtopf geben und 3 Sek. / Stufe 5 hacken, dann mit dem Spatel nach unten schieben.",
      "Butter zugeben und Varoma / 3 Min. / Stufe 1 auslassen.",
      "Champignons und Tomatenmark zugeben und 100 °C / 10 Min. / Linkslauf / Sanftrührstufe garen.",
      "Mit dem Mehl bestäuben und 100 °C / 2 Min. / Linkslauf / Sanftrührstufe anschwitzen.",
      "Mit Brühe und Sahne ablöschen. Piment und die italienischen Kräuter zugeben und 100 °C / 30 Min. / Linkslauf / Sanftrührstufe ohne Messbecher einköcheln lassen.",
      "Zum Schluss mit Salz, Pfeffer und Sojasauce abschmecken."
    ],
    notiz: "Zwei Angaben aus der Karte entscheiden alles. Der Linkslauf hält die Champignonscheiben ganz – ohne ihn wird Pilzbrei daraus. Und die 30 Minuten müssen wirklich ohne Messbecher laufen: nur dann entweicht Dampf und die Sauce wird dick. Mit aufgesetztem Becher bleibt sie dünn. Die Karte nennt nur „Brühe“ ohne Sorte – mit Gemüsebrühe ist die Sauce vegetarisch, mit Fleischbrühe nicht. Deshalb steht hier keine Ernährungsmarke."
  },

  {
    id: "joghurtbroetchen",
    titel: "Schnelle Joghurtbrötchen",
    untertitel: "Keine Gehzeit, kalter Ofen – vom Teig zum Frühstück in 40 Minuten.",
    kategorie: "Brot",
    bild: null,
    herkunft: {
      typ: "Website",
      text: "Rezeptwelt · Thermomix Community, von Maulmont",
      url: "https://www.rezeptwelt.de/brot-broetchen-rezepte/schnelle-joghurtbroetchen/c3wwfc11-9c7b4-426187-cfcd2-pie1sx5m",
      archiv: "quellen/joghurtbroetchen-rezeptwelt.txt",
      erfasst: "2026-08-01"
    },
    portionen: 12,
    portionenName: "Stück",
    zeit: { aktiv: 10, ruhe: 0, garen: 30 },
    schwierigkeit: "Einfach",
    thermomix: true,
    ernaehrung: ["vegetarisch"],
    saison: [],
    marken: ["Brötchen", "ohne Gehzeit", "kalter Ofen", "Hefeteig", "Frühstück"],
    zutaten: [
      { gruppe: "", posten: [
        { menge: 150, einheit: "g",     name: "Milch",              kcal: 96 },
        { menge: 150, einheit: "g",     name: "Wasser",             kcal: 0 },
        { menge: 1,   einheit: "Würfel",name: "frische Hefe",       kcal: 44, notiz: "42 g" },
        { menge: 150, einheit: "g",     name: "Joghurt",            kcal: 92 },
        { menge: 600, einheit: "g",     name: "Weizenmehl",         kcal: 2052 },
        { menge: 1.5, einheit: "TL",    name: "Salz",               kcal: 0 },
        { menge: null,einheit: "",      name: "Zucker",             kcal: 0, notiz: "eine Prise" },
        { menge: null,einheit: "",      name: "Mehl zum Bestäuben", kcal: 20, fest: true }
      ]}
    ],
    schritte: [
      "Milch, Wasser und Hefe in den Mixtopf geben und 2 Min. / 37 °C / Stufe 2 verrühren.",
      "Joghurt, Mehl, Salz und Zucker zugeben und 3 Min. / Teigknetstufe kneten.",
      "Teig herausnehmen. Mit einem nassen Esslöffel 10 bis 12 Häufchen auf ein mit Backpapier belegtes Blech setzen – nass, sonst klebt der Teig am Löffel.",
      "Die Häufchen leicht mit Mehl bestäuben.",
      "Blech in den KALTEN Ofen schieben und bei 240 °C Ober-/Unterhitze 25 bis 30 Minuten backen.",
      "Auf einem Gitter abkühlen lassen – oder lauwarm aufreißen, dafür sind sie gemacht."
    ],
    notiz: "Der Teig ist klebrig, das ist so gewollt. Vom nassen Löffel löst er sich trotzdem; wenn gar nichts geht, etwas mehr Mehl oder etwas weniger Wasser. Der kalte Ofen ist derselbe Trick wie bei der Joghurtkruste: Brötchen und Ofen heizen zusammen auf, das ersetzt die Gehzeit. Tipp des Autors zum Mixtopf: kaltes Wasser bis über die Messer, 1 bis 2 Tropfen Spülmittel, kurz Stufe 10."
  },

  {
    id: "butter-chicken",
    titel: "Indisches Butter Chicken",
    untertitel: "Kokosmilch, Garam Masala, Hühnchen – eine Stunde, alles im Mixtopf.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "PDF",
      text: "Vorwerk · Rezeptkarte „Indisches Butter Chicken TM31“",
      archiv: "quellen/indisches_butter_chicken.png",
      erfasst: "2026-08-01"
    },
    portionen: 4,
    portionenName: "Portionen",
    zeit: { aktiv: 15, ruhe: 0, garen: 45 },
    schwierigkeit: "Einfach",
    thermomix: true,
    ernaehrung: [],
    saison: [],
    marken: ["Curry", "indisch", "Hühnchen", "zu Reis", "TM31"],
    zutaten: [
      { gruppe: "Basis", posten: [
        { menge: 1,   einheit: "Stk",  name: "Zwiebel",                 kcal: 48 },
        { menge: 3,   einheit: "Zehe", name: "Knoblauch",               kcal: 13, notiz: "im Original 2 bis 3" },
        { menge: 1,   einheit: "Stk",  name: "Ingwer",                  kcal: 12, notiz: "walnussgroß, etwa 15 g" },
        { menge: 30,  einheit: "g",    name: "Butter",                  kcal: 222 }
      ]},
      { gruppe: "Sauce", posten: [
        { menge: 90,  einheit: "g",    name: "Tomatenmark",             kcal: 74 },
        { menge: 3,   einheit: "EL",   name: "Joghurt",                 kcal: 27 },
        { menge: 400, einheit: "g",    name: "Kokosmilch",              kcal: 760, notiz: "eine Dose" }
      ]},
      { gruppe: "Gewürze", posten: [
        { menge: 1,   einheit: "EL",   name: "Thai-Currypulver",        kcal: 20 },
        { menge: 1,   einheit: "EL",   name: "Garam Masala",            kcal: 21 },
        { menge: 1,   einheit: "TL",   name: "Kurkuma",                 kcal: 11 },
        { menge: 0.25,einheit: "TL",   name: "grüne Currypaste",        kcal: 2 },
        { menge: 1,   einheit: "TL",   name: "Salz",                    kcal: 0 },
        { menge: null,einheit: "",     name: "Chilipulver",             kcal: 0, notiz: "nach Geschmack" }
      ]},
      { gruppe: "Fleisch", posten: [
        { menge: 500, einheit: "g",    name: "Hühnerbrustfilet",        kcal: 550, notiz: "mundgerecht gewürfelt" }
      ]}
    ],
    schritte: [
      "Zwiebel vierteln, Ingwer schälen. Zwiebel, Ingwer und Knoblauch in den Mixtopf geben und ca. 15 Sek. / Stufe 5 zerkleinern, dann mit dem Spatel nach unten schieben.",
      "Butter zugeben und 3 Min. / Varoma / Stufe 1 dünsten.",
      "Tomatenmark, Joghurt und Kokosmilch zugeben und 15 Min. / 100 °C / Stufe 2 reduzieren lassen – mit offenem Deckel, aber mit Spritzschutz.",
      "Die Gewürze zugeben und 3 Min. / Varoma / Stufe 1 weiter reduzieren lassen.",
      "Die gewürfelte Hühnerbrust zugeben und 30 Min. / 100 °C / Linkslauf / Sanftrührstufe mit aufgesetztem Messbecher garen lassen.",
      "Nachwürzen, falls nötig, und mit Reis oder Naan servieren."
    ],
    notiz: "Zwei Angaben aus der Karte sind leicht zu überlesen und entscheiden viel: Schritt 3 läuft mit OFFENEM Deckel und Spritzschutz, damit Flüssigkeit verdampfen kann – sonst bleibt die Sauce dünn. Und beim Hühnchen der Linkslauf mit aufgesetztem Messbecher, sonst zerfallen die Würfel. Zur Schärfe schreibt die Karte selbst: So notiert ist es dezent. Schärfer wird es mit gelber oder roter Currypaste statt der grünen, mit scharfem Curry oder mehr Chili. Für Kinder Currypaste und Chilipulver weglassen. Das Original ist ein Crockpot-Rezept und wurde für den Thermomix abgewandelt; als Beilage empfiehlt die Karte indisches Naan."
  },

  {
    id: "huehnchen-senfsauce",
    titel: "Hühnchen in cremiger Senfsauce",
    untertitel: "Mit knusprigen Ofenkartoffeln – Blech und Pfanne laufen parallel.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "PDF",
      text: "Marley Spoon · Rezeptkarte",
      archiv: "quellen/Huenchen_senf_II.png",
      erfasst: "2026-08-01"
    },
    portionen: 2,
    portionenName: "Portionen",
    zeit: { aktiv: 15, ruhe: 0, garen: 25 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: [],
    saison: [],
    marken: ["Ofenkartoffeln", "Pfanne", "Senfsauce", "unter 45 Minuten"],
    zutaten: [
      { gruppe: "Ofenkartoffeln", posten: [
        { menge: 500, einheit: "g",    name: "mehligkochende Kartoffeln", kcal: 380 },
        { menge: 5,   einheit: "g",    name: "Kartoffelgewürz",           kcal: 15, notiz: "auf der Karte „Sieglindes Erdäpfelgewürz“" }
      ]},
      { gruppe: "Pfanne", posten: [
        { menge: 250, einheit: "g",    name: "Hähnchenbrustfilet",        kcal: 275, notiz: "auf der Karte „1 Packung“" },
        { menge: 1,   einheit: "Stk",  name: "grüne Paprika",             kcal: 47 },
        { menge: 1,   einheit: "Stk",  name: "rote Zwiebel",              kcal: 40 },
        { menge: 5,   einheit: "g",    name: "Paprikapulver edelsüß",     kcal: 14 },
        { menge: 1,   einheit: "Stk",  name: "Geflügelbrühwürfel",        kcal: 10 },
        { menge: 70,  einheit: "ml",   name: "Wasser",                    kcal: 0 }
      ]},
      { gruppe: "Sauce", posten: [
        { menge: 150, einheit: "g",    name: "Crème fraîche",             kcal: 450 },
        { menge: 20,  einheit: "g",    name: "mittelscharfer Senf",       kcal: 13, notiz: "auf der Karte „1 Päckchen“" }
      ]},
      { gruppe: "Aus dem Vorrat", posten: [
        { menge: 2,   einheit: "EL",   name: "Olivenöl",                  kcal: 240, notiz: "je 1 bis 2 EL für Kartoffeln und Pfanne" },
        { menge: null,einheit: "",     name: "Salz und schwarzer Pfeffer",kcal: 0 }
      ]}
    ],
    schritte: [
      "Backofen auf 220 °C Umluft oder 240 °C Ober-/Unterhitze vorheizen. Kartoffeln je nach Größe halbieren oder vierteln, mit dem Kartoffelgewürz und 1 bis 2 EL Olivenöl vermengen und auf einem mit Backpapier belegten Blech verteilen. Etwa 25 bis 30 Minuten rösten, bis sie goldbraun und leicht knusprig sind.",
      "Währenddessen die Paprika vierteln, entkernen und in 1 bis 2 cm große Würfel schneiden. Zwiebel schälen, halbieren und fein würfeln.",
      "Das Hähnchenfleisch mit Küchenkrepp trocken tupfen und in 2 bis 3 cm große Würfel schneiden.",
      "Hähnchen in einer großen Pfanne mit 1 bis 2 EL Olivenöl bei hoher Hitze etwa 2 bis 3 Minuten scharf anbraten.",
      "Paprika und Zwiebel zugeben und bei mittlerer Hitze etwa 2 bis 3 Minuten mitbraten. Paprikapulver und Brühwürfel hinzufügen, mit 70 ml Wasser ablöschen und etwa 6 bis 8 Minuten bei niedriger Hitze köcheln lassen, dabei gelegentlich umrühren.",
      "Auf niedriger Stufe Crème fraîche und Senf unter das Hähnchen mischen. Sauce mit Salz und Pfeffer abschmecken und mit den Ofenkartoffeln anrichten."
    ],
    notiz: "Der Ablauf ist so gebaut, dass beides gleichzeitig fertig wird: Die Kartoffeln gehen zuerst in den Ofen und rösten, während in der Pfanne alles andere passiert. Crème fraîche und Senf erst bei niedriger Hitze unterrühren, sonst kann die Sauce gerinnen. Allergene laut Karte: Sellerie, Milch und Senf. Zur Kalorienangabe: Die Karte nennt 740 kcal je Portion, die Rechnung hier kommt auf 742 – für „1 Packung Hähnchenbrustfilet“ sind 250 g und für das Olivenöl 2 EL angesetzt."
  },

  {
    id: "mediterrane-hackrolle",
    titel: "Mediterrane Hackrolle",
    untertitel: "Hackbraten mit Schafskäsefüllung, dazu eine schnelle Tomatensoße.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "Zeitschrift",
      text: "Ausriss, ins eigene Rezeptbuch geklebt · mit handschriftlichen Notizen",
      archiv: "quellen/hackrolle-zeitschrift.jpg",
      erfasst: "2026-08-09"
    },
    portionen: 6,
    portionenName: "Portionen",
    zeit: { aktiv: 45, ruhe: 0, garen: 60 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: [],
    saison: [],
    marken: ["Hackbraten", "Schafskäse", "Ofen", "Tomatensoße", "für Gäste", "lässt sich vorbereiten"],
    zutaten: [
      { gruppe: "Füllung", posten: [
        { menge: 100, einheit: "g",   name: "getrocknete Tomaten in Öl", kcal: 260, notiz: "abgetropft gewogen, aus dem Glas" },
        { menge: 1,   einheit: "Bund",name: "Basilikum",                 kcal: 8,   notiz: "oder ein Töpfchen" },
        { menge: 200, einheit: "g",   name: "Schafskäse",                kcal: 500 },
        { menge: 200, einheit: "g",   name: "Doppelrahmfrischkäse",      kcal: 680 },
        { menge: null,einheit: "",    name: "Pfeffer",                   kcal: 0 }
      ]},
      { gruppe: "Hackrolle", posten: [
        { menge: 800, einheit: "g",   name: "gemischtes Hack",           kcal: 1920 },
        { menge: 2,   einheit: "Stk", name: "Zwiebeln",                  kcal: 80,  notiz: "die Hälfte kommt ins Hack, die Hälfte in die Soße" },
        { menge: 1,   einheit: "Stk", name: "Ei",                        kcal: 80 },
        { menge: 2,   einheit: "EL",  name: "Semmelbrösel",              kcal: 70 },
        { menge: null,einheit: "",    name: "Salz",                      kcal: 0 },
        { menge: null,einheit: "",    name: "Pfeffer",                   kcal: 0 },
        { menge: null,einheit: "",    name: "Öl für das Blech",          kcal: 20,  fest: true }
      ]},
      { gruppe: "Tomatensoße", posten: [
        { menge: 1,   einheit: "EL",  name: "Olivenöl",                  kcal: 88 },
        { menge: 500, einheit: "g",   name: "stückige Tomaten",          kcal: 100, notiz: "ein Paket" },
        { menge: null,einheit: "",    name: "Salz",                      kcal: 0 },
        { menge: null,einheit: "",    name: "Pfeffer",                   kcal: 0 },
        { menge: null,einheit: "",    name: "Zucker",                    kcal: 0, notiz: "eine Prise" }
      ]}
    ],
    schritte: [
      "Getrocknete Tomaten abtropfen lassen und würfeln. Basilikum waschen, trocken schütteln, die Blättchen in Streifen schneiden. Schafskäse zerbröckeln.",
      "Frischkäse, Schafskäse, Tomatenwürfel und Basilikum mit einer Gabel mischen und mit Pfeffer würzen.",
      "Backofen vorheizen: Ober-/Unterhitze 200 °C, Umluft 175 °C. Ein Backblech leicht einölen.",
      "Zwiebeln schälen und würfeln. Die Hälfte mit dem Hack, dem Ei und den Semmelbröseln verkneten, mit Salz und Pfeffer würzen. Die andere Hälfte für die Soße beiseitestellen.",
      "Hack auf Frischhaltefolie zu einem flachen Rechteck von etwa 25 × 35 cm formen. Die Schafskäsecreme daraufstreichen und dabei ringsum einen 1,5 cm breiten Rand frei lassen.",
      "Mithilfe der Folie von der kurzen Seite her aufrollen. Die Rolle fest andrücken, sonst fällt sie beim Backen auseinander. Mit der Naht nach unten auf das Blech legen.",
      "Im heißen Ofen 1 Stunde braten. Nach 45 Minuten 150 ml Wasser angießen.",
      "Inzwischen 1 EL Öl in einem Topf erhitzen und die restlichen Zwiebeln darin andünsten. Stückige Tomaten zugießen und aufkochen.",
      "Die Soße zugedeckt bei schwacher Hitze 15 Minuten köcheln lassen. Mit Salz, Pfeffer und einer Prise Zucker abschmecken.",
      "Hackrolle aufschneiden und die Tomatensoße dazureichen. Dazu passen Röstkartoffeln."
    ],
    notiz: "Die Rolle vor dem Backen fest andrücken, sonst fällt sie im Ofen auseinander. Wer mag, bereitet statt der Tomatensoße eine sahnige zu. Die Kalorien sind für gemischtes Hack gerechnet; mit magerem Rinderhack liegt der Wert deutlich niedriger."
  },

  {
    id: "erdbeertraum-schokoboden",
    titel: "Erdbeertraum mit Schokoboden",
    untertitel: "Dunkler Schokoladenkuchen unter rosa Sahne und dünnen Erdbeerscheiben.",
    kategorie: "Süß",
    bild: null,
    herkunft: {
      typ: "Zeitschrift",
      text: "Ausriss, ins eigene Rezeptbuch geklebt · Titel im Original teilweise überschrieben",
      archiv: "quellen/erdbeertraum-zeitschrift.jpg",
      erfasst: "2026-08-09"
    },
    portionen: 16,
    portionenName: "Stück",
    zeit: { aktiv: 40, ruhe: 120, garen: 35 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: ["vegetarisch"],
    saison: [5, 6, 7],
    marken: ["Erdbeeren", "Schokolade", "Ringform", "Savarinform", "Sahne", "für Gäste"],
    zutaten: [
      { gruppe: "Schokoteig", posten: [
        { menge: 200, einheit: "g",   name: "Zartbitterschokolade",   kcal: 1080 },
        { menge: 200, einheit: "g",   name: "Butter",                 kcal: 1480 },
        { menge: 250, einheit: "g",   name: "Mehl",                   kcal: 855 },
        { menge: 3,   einheit: "Stk", name: "Eier",                   kcal: 240, notiz: "Größe M" },
        { menge: 200, einheit: "g",   name: "Zucker",                 kcal: 800 },
        { menge: 1,   einheit: "TL",  name: "Vanillearoma",           kcal: 5,   notiz: "aus dem Fläschchen" },
        { menge: 1,   einheit: "EL",  name: "Kakao",                  kcal: 18 },
        { menge: 2,   einheit: "TL",  name: "Backpulver",             kcal: 0 },
        { menge: 1,   einheit: "TL",  name: "Natron",                 kcal: 0 },
        { menge: null,einheit: "",    name: "Butter für die Form",    kcal: 110, fest: true },
        { menge: null,einheit: "",    name: "Mehl zum Ausstäuben",    kcal: 34,  fest: true }
      ]},
      { gruppe: "Sahne", posten: [
        { menge: 400, einheit: "g",   name: "Schlagsahne",            kcal: 1160 },
        { menge: 2,   einheit: "Pck", name: "Sahnefestiger",          kcal: 55 },
        { menge: 4,   einheit: "EL",  name: "Zucker",                 kcal: 200 },
        { menge: null,einheit: "",    name: "rosa Lebensmittelfarbe", kcal: 0,   notiz: "2 bis 3 Messerspitzen, kann auch weggelassen werden" }
      ]},
      { gruppe: "Belag", posten: [
        { menge: 300, einheit: "g",   name: "Erdbeeren",              kcal: 96 }
      ]}
    ],
    schritte: [
      "Backofen vorheizen: Ober-/Unterhitze 175 °C, Umluft 150 °C. Eine Ring- oder Savarinform von etwa 1,4 Litern fetten und mit Mehl ausstäuben.",
      "Schokolade grob hacken und mit 200 g Butter im warmen Wasserbad schmelzen. Lauwarm abkühlen lassen.",
      "Eier, 200 g Zucker und Vanillearoma mit den Schneebesen des Rührgeräts cremig rühren.",
      "Mehl, Kakao, Backpulver und Natron mischen und zusammen mit der Schokomasse unter die Eimasse rühren.",
      "Teig in die Form geben, glatt streichen und im heißen Ofen 30 bis 35 Minuten backen.",
      "Den Kuchen herausnehmen und 15 Minuten in der Form ruhen lassen. Dann auf ein Kuchengitter stürzen und vollständig auskühlen lassen.",
      "Sahnefestiger mit 4 EL Zucker mischen. Sahne leicht cremig schlagen und dabei so viel Lebensmittelfarbe zugeben, bis sie mittelrosa ist.",
      "Sahnefestiger einrieseln lassen und weiterschlagen, bis die Sahne fest ist. Den Kuchen damit einstreichen und 1 Stunde kalt stellen.",
      "Erdbeeren waschen, putzen und trocken tupfen. In sehr dünne Scheiben schneiden – dicke Scheiben rutschen auf der Sahne weg.",
      "Die Erdbeerscheiben auf dem eingestrichenen Kuchen verteilen und dabei etwas andrücken."
    ],
    notiz: "Der Kuchen muss vollständig ausgekühlt sein, bevor die Sahne daraufkommt – dafür sind die zwei Stunden Wartezeit gedacht. Ohne Ring- oder Savarinform tut es jede andere Form mit 1,4 Litern Inhalt. Die rosa Lebensmittelfarbe ist reine Zierde und kann weggelassen werden. Die Erdbeeren wirklich dünn schneiden, dicke Scheiben rutschen auf der Sahne weg."
  },

  {
    id: "krosse-backkartoffeln-lachs",
    titel: "Krosse Backkartoffeln",
    untertitel: "Mit Räucherlachs, Kräuterquark und Apfel-Möhren-Salat.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "PDF",
      text: "Marley Spoon · Rezeptkarte",
      archiv: "quellen/backkartoffeln-marleyspoon.jpg",
      erfasst: "2026-08-09"
    },
    portionen: 2,
    portionenName: "Portionen",
    zeit: { aktiv: 15, ruhe: 0, garen: 25 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: ["glutenfrei"],
    saison: [],
    marken: ["Räucherlachs", "Ofenkartoffeln", "Möhrensalat", "Kräuterquark", "unter 45 Minuten"],
    zutaten: [
      { gruppe: "Kartoffeln", posten: [
        { menge: 800, einheit: "g",   name: "festkochende Kartoffeln",  kcal: 616 },
        { menge: 1,   einheit: "EL",  name: "Olivenöl",                 kcal: 88 },
        { menge: null,einheit: "",    name: "Salz",                     kcal: 0 }
      ]},
      { gruppe: "Apfel-Möhren-Salat", posten: [
        { menge: 2,   einheit: "Stk", name: "Karotten",                 kcal: 60 },
        { menge: 1,   einheit: "Stk", name: "Apfel",                    kcal: 80 },
        { menge: 25,  einheit: "g",   name: "Haselnüsse",               kcal: 160, notiz: "geschält" },
        { menge: 1,   einheit: "Stk", name: "unbehandelte Zitrone",     kcal: 20,  notiz: "Abrieb und Saft" },
        { menge: 1,   einheit: "EL",  name: "Olivenöl",                 kcal: 88,  notiz: "1 bis 2 EL fürs Dressing" },
        { menge: 1,   einheit: "EL",  name: "Essig",                    kcal: 3 },
        { menge: null,einheit: "",    name: "Zucker",                   kcal: 0,   notiz: "eine Prise" },
        { menge: null,einheit: "",    name: "Salz und Pfeffer",         kcal: 0 }
      ]},
      { gruppe: "Belag", posten: [
        { menge: 250, einheit: "g",   name: "Speisequark",              kcal: 400, notiz: "40 % Fett" },
        { menge: 10,  einheit: "g",   name: "frischer Schnittlauch",    kcal: 3 },
        { menge: 100, einheit: "g",   name: "Räucherlachsspitzen",      kcal: 190, notiz: "auf der Karte „1 Packung“" }
      ]}
    ],
    schritte: [
      "Den Backofen auf 200 °C Umluft oder 220 °C Ober-/Unterhitze vorheizen. Die Kartoffeln der Länge nach halbieren.",
      "Die Kartoffeln auf einem mit Backpapier ausgelegten Blech verteilen, mit 1 EL Olivenöl vermengen und salzen. Im Ofen 20 bis 30 Minuten goldbraun backen und nach der Hälfte der Zeit einmal wenden.",
      "Währenddessen die Karotten schälen und auf der groben Seite der Küchenreibe raspeln. Den Apfel vierteln, entkernen und ebenfalls raspeln.",
      "Die Haselnüsse grob hacken und in einer kleinen Pfanne ohne Öl bei mittlerer Hitze goldbraun rösten. Sie verbrennen schnell – zum Abkühlen sofort aus der Pfanne nehmen, sonst dunkeln sie nach.",
      "Die Schale der Zitrone abreiben, die Zitrone halbieren und auspressen. 1 bis 2 EL Olivenöl, 1 EL Essig, 1 bis 2 EL Zitronensaft und 1 TL Abrieb mit Salz, Zucker und Pfeffer zu einem Dressing verrühren.",
      "Karotten, Apfel und die gerösteten Haselnüsse mit dem Dressing vermischen.",
      "Den Schnittlauch fein hacken. Drei Viertel davon mit dem Quark und 2 bis 3 EL Wasser cremig rühren, mit Salz und Pfeffer abschmecken.",
      "Den Lachs mit einer Gabel oder den Fingern auseinanderzupfen, bei Bedarf die Haut mit einem scharfen Messer entfernen.",
      "Die Kartoffeln etwas aufbrechen, mit Quark und Lachs belegen und mit dem restlichen Schnittlauch bestreuen. Dazu den Apfel-Möhren-Salat servieren."
    ],
    notiz: "Die Haselnüsse rösten ohne Fett und werden von einer Sekunde zur nächsten zu dunkel – daneben stehen bleiben und sie danach sofort aus der heißen Pfanne holen. Der Quark darf ruhig locker sein, das Wasser macht ihn streichfähig. Allergene laut Karte: Fisch, Milch und Nüsse."
  },

  {
    id: "koenigsberger-klopse",
    titel: "Königsberger Klopse aus Rind",
    untertitel: "Kapernsauce, Salzkartoffeln, Schnittlauch – der ostpreußische Klassiker.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "PDF",
      text: "Marley Spoon · Rezeptkarte",
      archiv: "quellen/koenigsberger-klopse-marleyspoon.jpg",
      erfasst: "2026-08-09"
    },
    portionen: 2,
    portionenName: "Portionen",
    zeit: { aktiv: 20, ruhe: 0, garen: 20 },
    schwierigkeit: "Mittel",
    thermomix: false,
    ernaehrung: [],
    saison: [],
    marken: ["Kapern", "Salzkartoffeln", "Sahnesauce", "Klassiker", "Hackfleisch"],
    zutaten: [
      { gruppe: "Klopse", posten: [
        { menge: 250, einheit: "g",    name: "Rinderhackfleisch",        kcal: 525, notiz: "auf der Karte „1 Packung“" },
        { menge: 30,  einheit: "g",    name: "Semmelbrösel",             kcal: 105, notiz: "auf der Karte „1 Packung“" },
        { menge: 1,   einheit: "Stk",  name: "Zwiebel",                  kcal: 40,  notiz: "die Hälfte in die Klopse, die Hälfte in die Sauce" },
        { menge: 20,  einheit: "g",    name: "Butter",                   kcal: 148, notiz: "auf der Karte „1 Päckchen“" },
        { menge: 20,  einheit: "g",    name: "Petersilie und Schnittlauch", kcal: 7, notiz: "frisch, gemischt" },
        { menge: null,einheit: "",     name: "Salz und Pfeffer",         kcal: 0 }
      ]},
      { gruppe: "Sud und Sauce", posten: [
        { menge: 1,   einheit: "Würfel", name: "Rinderbrühwürfel",       kcal: 10 },
        { menge: 30,  einheit: "g",    name: "Kapern",                   kcal: 8,   notiz: "abgetropft, auf der Karte „1 Packung“" },
        { menge: 100, einheit: "ml",   name: "Schlagsahne",              kcal: 290, notiz: "die Karte liefert eine ganze Packung, gebraucht wird die Hälfte" },
        { menge: 1,   einheit: "EL",   name: "Weizenmehl",               kcal: 35 },
        { menge: 1,   einheit: "TL",   name: "Essig",                    kcal: 1,   notiz: "½ bis 1 TL, zum Abschmecken" }
      ]},
      { gruppe: "Kartoffeln", posten: [
        { menge: 500, einheit: "g",    name: "festkochende Kartoffeln",  kcal: 380 },
        { menge: null,einheit: "",     name: "Salz",                     kcal: 0 }
      ]}
    ],
    schritte: [
      "Die Zwiebel schälen, halbieren und fein würfeln. Die Butter in einer großen Pfanne bei mittlerer Hitze schmelzen und die Zwiebeln 1 bis 2 Minuten glasig dünsten. Die Pfanne beiseitestellen und die Zwiebeln abkühlen lassen.",
      "In einem großen Topf leicht gesalzenes Wasser für die Kartoffeln aufsetzen. Die Kartoffeln schälen, größere halbieren. Sobald das Wasser kocht, hineingeben und bei mittlerer Hitze 15 bis 20 Minuten gar kochen.",
      "In einem mittelgroßen Topf etwa 1 Liter Wasser aufkochen und den Brühwürfel darin auflösen.",
      "Die Semmelbrösel mit etwa 60 ml Wasser verrühren. Die Petersilienblätter von den Stängeln zupfen und fein hacken. Die Kapern abspülen, abtropfen lassen und die Hälfte grob hacken.",
      "Das Hackfleisch mit der Hälfte der Zwiebeln, den gehackten Kapern, der Hälfte der Petersilie und den eingeweichten Semmelbröseln vermengen und mit Salz und Pfeffer würzen.",
      "Aus der Masse 2 bis 3 cm große Klopse formen und vorsichtig in die Brühe geben. Bei niedriger Hitze 15 bis 20 Minuten gar ziehen lassen – die Brühe darf dabei nicht kochen.",
      "Die Klopse aus der Brühe nehmen und beiseitestellen, 200 ml Brühe abmessen. Die restlichen Zwiebeln in der Pfanne erneut erhitzen, 1 EL Mehl unterrühren und mit 100 bis 200 ml Brühe ablöschen.",
      "Die restlichen Kapern, die Sahne und die Klopse hinzugeben und mit Essig, Salz und Pfeffer abschmecken.",
      "Den Schnittlauch in feine Röllchen schneiden und unter die Kartoffeln heben. Mit den Klopsen und der Sauce anrichten und mit der restlichen Petersilie garnieren."
    ],
    notiz: "Der Sud darf nicht kochen, sonst fallen die Klopse auseinander – er soll nur leise ziehen. Das Mehl gibt der Sauce Bindung; die Sahne kommt erst zum Schluss dazu und wird nicht mehr stark erhitzt. Der Essig ist kein Beiwerk, sondern das, was die Kapernsauce rund macht: lieber vorsichtig herantasten. Allergene laut Karte: Gluten und Milch."
  },

  {
    id: "schnelle-pasta-bolognese",
    titel: "Schnelle Pasta bolognese",
    untertitel: "Mit geraspelten Karotten und frischem Basilikum – in einer halben Stunde fertig.",
    kategorie: "Deftig",
    bild: null,
    herkunft: {
      typ: "PDF",
      text: "Marley Spoon · Rezeptkarte",
      archiv: "quellen/pasta-bolognese-marleyspoon.jpg",
      erfasst: "2026-08-09"
    },
    portionen: 2,
    portionenName: "Portionen",
    zeit: { aktiv: 15, ruhe: 0, garen: 15 },
    schwierigkeit: "Einfach",
    thermomix: false,
    ernaehrung: [],
    saison: [],
    marken: ["Bolognese", "Pasta", "Vollkorn", "Basilikum", "unter 30 Minuten", "Feierabend"],
    zutaten: [
      { gruppe: "Sauce", posten: [
        { menge: 250, einheit: "g",     name: "Rinderhackfleisch",        kcal: 525, notiz: "auf der Karte „1 Packung“" },
        { menge: 1,   einheit: "Stk",   name: "Zwiebel",                  kcal: 40 },
        { menge: 1,   einheit: "Zehe",  name: "Knoblauch",                kcal: 4 },
        { menge: 3,   einheit: "Stk",   name: "Karotten",                 kcal: 94 },
        { menge: 400, einheit: "g",     name: "gehackte Tomaten",         kcal: 80,  notiz: "eine Dose" },
        { menge: 1,   einheit: "Würfel",name: "Rinderbrühwürfel",         kcal: 10 },
        { menge: 1,   einheit: "EL",    name: "Olivenöl",                 kcal: 132, notiz: "1 bis 2 EL" },
        { menge: 1,   einheit: "Pck",   name: "getrockneter Oregano",     kcal: 13 },
        { menge: null,einheit: "",      name: "Salz und Pfeffer",         kcal: 0 }
      ]},
      { gruppe: "Pasta und Garnitur", posten: [
        { menge: 250, einheit: "g",     name: "Vollkorn-Fusilli",         kcal: 875 },
        { menge: 30,  einheit: "g",     name: "italienischer Hartkäse",   kcal: 120, notiz: "auf der Karte „2 Stück“" },
        { menge: 10,  einheit: "g",     name: "frisches Basilikum",       kcal: 4 }
      ]}
    ],
    schritte: [
      "In einem mittelgroßen Topf ausreichend leicht gesalzenes Wasser für die Pasta zum Kochen bringen. Die Zwiebel schälen, halbieren und fein würfeln, den Knoblauch schälen und fein hacken.",
      "Die Karotten schälen und auf der groben Seite einer Küchenreibe raspeln.",
      "Das Hackfleisch in einer mittelgroßen Pfanne mit 1 bis 2 EL Olivenöl bei starker Hitze 3 bis 4 Minuten scharf anbraten und mit Salz und Pfeffer würzen.",
      "Zwiebel, Knoblauch und Karotten hinzugeben und 1 Minute mitbraten. Mit 200 ml Wasser und den gehackten Tomaten ablöschen, den Brühwürfel darin auflösen.",
      "Die Sauce bei schwacher Hitze 10 bis 15 Minuten köcheln lassen. Kocht sie zu schnell ein, etwas Wasser nachgießen. Mit Oregano, Salz und Pfeffer abschmecken.",
      "Sobald das Wasser kocht, die Pasta hineingeben und in 10 bis 12 Minuten bissfest kochen, dann abgießen und abtropfen lassen.",
      "Den Käse fein reiben. Die Basilikumblätter von den Stängeln zupfen, drei Viertel davon fein hacken und unter die Sauce rühren.",
      "Die Pasta mit der Sauce, dem geriebenen Käse und den restlichen Basilikumblättern servieren."
    ],
    notiz: "Die geraspelten Karotten sind hier kein Streckmittel, sondern das, was der Sauce ihre Süße gibt – gröber geraspelt bleiben sie spürbar, fein geraspelt verschwinden sie ganz. Pasta und Sauce laufen parallel: Das Nudelwasser kommt gleich zu Beginn auf den Herd. Allergene laut Karte: Gluten und Milch."
  }

];
