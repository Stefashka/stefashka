# Quellenarchiv

Hier liegt das Original zu jedem Rezept, das von außen kommt. Nicht als
Deko – als Versicherung.

**Warum das der wichtigste Ordner der ganzen Sammlung ist:** Instagram-Beiträge
werden gelöscht, Konten verschwinden, Zeitschriften-Websites werden abgeschaltet,
Links verrotten. Ein Link allein ist keine Herkunft, er ist ein Versprechen mit
Ablaufdatum. Wenn der Beitrag weg ist, weiß in fünf Jahren niemand mehr, woher
das Rezept eigentlich stammt.

## Was hier hineingehört

| Woher            | Was archivieren                                          |
|------------------|----------------------------------------------------------|
| Instagram        | Screenshot des Beitrags **samt Bildtext/Caption**        |
| Kochzeitschrift  | Foto oder Scan der Seite, plus Heftnummer und Seitenzahl |
| PDF              | das PDF selbst                                           |
| Website          | Als PDF drucken (Cmd + P → „Als PDF speichern“)          |

Dateiname wie die Rezept-`id`, dazu die Quelle:

```
zimtschnecken-kardamom-instagram.png
ofengemuese-feta-zitrone-essen-und-trinken-04-2024.pdf
```

Danach im Rezept eintragen:

```js
herkunft: {
  typ: "Instagram",
  text: "@konto",
  url: "https://www.instagram.com/p/…",
  archiv: "quellen/zimtschnecken-kardamom-instagram.png",
  erfasst: "2026-07-31"
}
```

Fehlt bei einer Quelle von außen das `archiv`, weist die Rezeptseite sichtbar
darauf hin. Das ist Absicht: eine stille Lücke merkt man erst, wenn es zu spät
ist.

Bei eigenen Rezepten (`typ: "Eigenes"` oder `"Familie"`) ist nichts zu
archivieren – da kommt auch kein Hinweis.
