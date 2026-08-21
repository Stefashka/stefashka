/* =============================================================================
   legal.js  –  Impressum & Datenschutzerklärung
   -----------------------------------------------------------------------------
   ⚠️  ZUM AUSFÜLLEN: Nur der Block `LEGAL` unten muss angefasst werden.
   Solange bei `email` noch der Platzhalter steht, zeigt die App im Impressum
   eine rote Warnung an – damit die Seite nicht unvollständig online geht.

   Hinweis: Diese Texte sind sorgfältig zusammengestellt, aber keine
   Rechtsberatung. Für ein privates, nicht kommerzielles Freizeitprojekt ohne
   Werbung, Verkauf und Nutzerkonten decken sie den üblichen Rahmen ab.
   ============================================================================= */

export const LEGAL = {
  name:    'Stefanie Eichwald',
  street:  'Oberhofstraße 55',
  city:    '88045 Friedrichshafen',
  country: 'Deutschland',

  // Pflichtangabe nach § 5 DDG
  email:   'Stefanie.Eichwald@web.de',

  // Optional. Leer lassen = wird nicht angezeigt. Ohne Telefonnummer ist das
  // Impressum vollständig, solange eine E-Mail-Adresse vorhanden ist.
  phone:   '',

  updated: 'August 2026',

  // Region deines Supabase-Projekts, z. B. 'eu-central-1 (Frankfurt)'.
  // Nachzusehen im Supabase-Dashboard unter Project Settings → General → Region.
  // ⚠️ Pflichtangabe für die Datenschutzerklärung – solange hier der
  //    Platzhalter steht, warnt die App.
  supabaseRegion: 'BITTE-EINTRAGEN',
};

export const legalIncomplete = () => missingMail() || missingRegion();

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const missingMail   = () => LEGAL.email.includes('BITTE-EINTRAGEN');
const missingRegion = () => LEGAL.supabaseRegion.includes('BITTE-EINTRAGEN');

const regionText = () => missingRegion()
  ? '<span style="color:var(--bad)">Region noch nicht eingetragen</span>'
  : esc(LEGAL.supabaseRegion);

const mail = () => missingMail()
  ? '<span style="color:var(--bad)">noch nicht eingetragen</span>'
  : `<a href="mailto:${esc(LEGAL.email)}" style="color:var(--accent-flat)">${esc(LEGAL.email)}</a>`;

const address = () => `${esc(LEGAL.name)}<br>${esc(LEGAL.street)}<br>` +
                      `${esc(LEGAL.city)}<br>${esc(LEGAL.country)}`;

/* --------------------------------------------------------------- Impressum */
export function impressumHtml() {
  return `
  ${legalIncomplete() ? `
    <div class="legal-warn">
      <strong>Noch nicht vollständig.</strong> In <code>js/legal.js</code> fehlt:
      ${[
        missingMail()   ? 'die E-Mail-Adresse (Pflicht nach § 5 DDG)' : '',
        missingRegion() ? 'die Region des Supabase-Projekts (für die Datenschutzerklärung)' : '',
      ].filter(Boolean).join(' · ')}
    </div>` : ''}

  <h3 class="legal-h">Angaben gemäß § 5 DDG</h3>
  <p class="legal-p">${address()}</p>

  <h3 class="legal-h">Kontakt</h3>
  <p class="legal-p">
    E-Mail: ${mail()}
    ${LEGAL.phone ? `<br>Telefon: ${esc(LEGAL.phone)}` : ''}
  </p>

  <h3 class="legal-h">Verantwortlich für den Inhalt</h3>
  <p class="legal-p">${esc(LEGAL.name)}, Anschrift wie oben.</p>

  <h3 class="legal-h">Art des Angebots</h3>
  <p class="legal-p">
    „Bist Du Dumm?!“ ist ein privates, nicht kommerzielles Freizeitprojekt.
    Es werden keine Waren oder Dienstleistungen angeboten, es gibt keine
    Werbung, keine Einnahmen und keine Nutzerkonten.
  </p>

  <h3 class="legal-h">Haftung für Inhalte</h3>
  <p class="legal-p">
    Als Diensteanbieterin bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte in
    dieser Anwendung nach den allgemeinen Gesetzen verantwortlich. Nach
    §§ 8 bis 10 DDG bin ich als Diensteanbieterin jedoch nicht verpflichtet,
    übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
    Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
  </p>

  <h3 class="legal-h">Urheberrecht</h3>
  <p class="legal-p">
    Die in dieser Anwendung erstellten Inhalte und Werke unterliegen dem
    deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.
  </p>

  <p class="legal-stand">Stand: ${esc(LEGAL.updated)}</p>`;
}

/* --------------------------------------------------------- Datenschutz --- */
export function datenschutzHtml() {
  return `
  ${missingRegion() ? `
    <div class="legal-warn">
      <strong>Noch nicht vollständig.</strong> In <code>js/legal.js</code> fehlt
      bei <code>supabaseRegion</code> der Serverstandort deines Supabase-Projekts.
      Steht im Supabase-Dashboard unter Project&nbsp;Settings → General → Region.
    </div>` : ''}
  <div class="legal-lead">
    Kurz gesagt: Diese App setzt keine Cookies, bindet keine Analyse- oder
    Werbedienste ein und verlangt kein Nutzerkonto. Alles, was du einstellst
    oder erspielst, bleibt auf deinem Gerät. Die einzige Ausnahme ist der
    KI-Begriffsgenerator – und der läuft nur, wenn du ihn selbst antippst
    (Punkt 4).
  </div>

  <h3 class="legal-h">1. Verantwortliche</h3>
  <p class="legal-p">${address()}<br>E-Mail: ${mail()}</p>

  <h3 class="legal-h">2. Daten auf deinem Gerät</h3>
  <p class="legal-p">
    Die App speichert im lokalen Speicher deines Browsers (localStorage):
    deine Einstellungen (Rundendauer, Hell-/Dunkelmodus, Kontrastmodus, Ton und
    Vibration), selbst angelegte Kategorien, Punktestände, Teams, die Statistik
    sowie die Information, welche Begriffe zuletzt gezogen wurden.
  </p>
  <p class="legal-p">
    Diese Daten verlassen dein Gerät nicht und sind für mich nicht einsehbar.
    Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG in Verbindung mit
    Art. 6 Abs. 1 lit. f DSGVO – die Speicherung ist für die von dir gewünschte
    Funktion unbedingt erforderlich.
  </p>
  <p class="legal-p">
    Löschen kannst du alles jederzeit selbst: in den Einstellungen unter
    „Alles zurücksetzen“ oder indem du die Website-Daten in deinem Browser
    löschst.
  </p>

  <h3 class="legal-h">3. Bewegungs- und Lagesensor</h3>
  <p class="legal-p">
    Für die Kippsteuerung fragt die App die Erlaubnis ab, auf Bewegung und
    Ausrichtung des Geräts zuzugreifen. Die Sensordaten werden ausschließlich
    im Browser auf deinem Gerät verarbeitet, nicht gespeichert und nicht
    übertragen. Verweigerst du die Erlaubnis, funktioniert das Spiel mit
    Bildschirmtasten weiter.
  </p>

  <h3 class="legal-h">4. KI-Begriffsgenerator (nur auf Knopfdruck)</h3>
  <p class="legal-p">
    Im Kategorie-Editor gibt es die Möglichkeit, Begriffe automatisch erzeugen
    zu lassen. <strong>Diese Funktion läuft ausschließlich dann, wenn du sie
    aktiv auslöst</strong> – im normalen Spielbetrieb passiert nichts davon.
  </p>
  <p class="legal-p">
    Wenn du auf „Generieren“ tippst, wird das von dir eingegebene Thema, die
    gewünschte Anzahl, die Einstellung „Ü18“ und die Liste der bereits
    vorhandenen Begriffe an eine Serverfunktion in meinem Supabase-Projekt
    übertragen. Von dort geht der Text weiter an das Sprachmodell Claude von
    Anthropic, das die Begriffe erzeugt. Zurück kommt nur die Wortliste.
  </p>
  <p class="legal-p">
    Übertragen wird ausschließlich, was du in das Themenfeld schreibst.
    Bitte gib dort keine personenbezogenen Daten ein – für die Funktion sind
    sie nicht nötig.
  </p>
  <p class="legal-p">
    Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO. Die Nutzung ist freiwillig,
    das Antippen des Buttons gilt als Einwilligung. Widerrufen kannst du sie,
    indem du die Funktion einfach nicht mehr benutzt.
  </p>
  <p class="legal-p">
    Beteiligte Auftragsverarbeiter:
  </p>
  <p class="legal-p">
    <strong>Supabase, Inc.</strong> (Datenbank- und Serverfunktionen),
    Kontakt privacy@supabase.com. Serverstandort dieses Projekts:
    ${regionText()}. Supabase verarbeitet Daten unter anderem in den USA und
    Singapur und stützt Übermittlungen in Drittländer auf die
    Standardvertragsklauseln der Europäischen Kommission.
  </p>
  <p class="legal-p">
    <strong>Anthropic PBC</strong>, 548 Market Street, PMB 90375,
    San Francisco, CA 94104, USA (Sprachmodell). Nach den kommerziellen
    Nutzungsbedingungen von Anthropic werden über die Programmierschnittstelle
    übermittelte Inhalte nicht zum Training der Modelle verwendet.
    Datenschutzkontakt: privacy@anthropic.com
  </p>
  <p class="legal-p">
    Weder ich noch die Anwendung speichern die eingegebenen Themen. Die
    erzeugten Begriffe landen ausschließlich in deiner Kategorie auf deinem
    Gerät.
  </p>

  <h3 class="legal-h">5. Hosting durch Vercel</h3>
  <p class="legal-p">
    Diese Anwendung wird gehostet von Vercel Inc.,
    440 N Barranca Avenue #4133, Covina, CA 91723, USA.
  </p>
  <p class="legal-p">
    Beim Aufruf verarbeitet Vercel technisch notwendige Server-Logdaten, in der
    Regel: IP-Adresse, Datum und Uhrzeit des Abrufs, die abgerufene Datei, die
    übertragene Datenmenge, Browsertyp und Betriebssystem. Diese Verarbeitung
    ist erforderlich, um die App auszuliefern und den Betrieb abzusichern.
    Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
    einem sicheren und stabilen Betrieb).
  </p>
  <p class="legal-p">
    Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.
    Da Vercel seinen Sitz in den USA hat, kann es zu einer Übermittlung in ein
    Drittland kommen. Vercel ist nach dem EU-U.S. Data Privacy Framework
    zertifiziert und setzt ergänzend die Standardvertragsklauseln der
    Europäischen Kommission ein.
  </p>
  <p class="legal-p">
    EU-Vertretung von Vercel: EDPO, Avenue Huart Hamoir 71, 1030 Brüssel,
    Belgien. Datenschutzkontakt: privacy@vercel.com
  </p>

  <h3 class="legal-h">6. Was nicht passiert</h3>
  <p class="legal-p">
    Kein Tracking, keine Profilbildung, keine Werbung, keine automatisierte
    Entscheidungsfindung und keine Weitergabe an Dritte – abgesehen von der
    unter Punkt 5 beschriebenen technischen Verarbeitung durch den Hoster.
  </p>

  <h3 class="legal-h">7. Speicherdauer</h3>
  <p class="legal-p">
    Daten auf deinem Gerät bleiben so lange gespeichert, bis du sie löschst.
    Server-Logdaten werden von Vercel nach dessen eigenen Vorgaben nur
    kurzzeitig vorgehalten.
  </p>

  <h3 class="legal-h">8. Deine Rechte</h3>
  <p class="legal-p">
    Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16),
    Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
    Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Wende dich dafür
    an die oben genannte E-Mail-Adresse.
  </p>
  <p class="legal-p">
    Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren.
    Zuständig ist der Landesbeauftragte für den Datenschutz und die
    Informationsfreiheit Baden-Württemberg, Lautenschlagerstraße 20,
    70173 Stuttgart.
  </p>

  <p class="legal-stand">Stand: ${esc(LEGAL.updated)}</p>`;
}
