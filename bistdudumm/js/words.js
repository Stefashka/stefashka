/* =============================================================================
   words.js  –  DIE BEGRIFFSLISTEN
   -----------------------------------------------------------------------------
   Das ist die EINZIGE Datei, die ihr anfassen müsst, um Begriffe zu ändern.
   Struktur:

       export const WORDS = {
         tiere: ['Elefant', 'Waschbär', 'Nacktmull'],
         laender: ['Portugal', 'Neuseeland'],
       }

   Die Schlüssel (tiere, laender …) sind die `id` aus js/categories.js.
   Fehlt eine Kategorie hier, greift automatisch der Platzhalter.

   Aktuell: 40 Kategorien × 35 Begriffe = 1400 Stück, handverlesen.

   ZUR REIHENFOLGE
   ---------------
   Die Reihenfolge in dieser Datei ist für das Spiel egal. js/store.js zieht
   per drawWords() immer zuerst die Begriffe, die in dieser Kategorie noch
   NIE dran waren – gemischt. Erst wenn alle 35 verbraucht sind, wird der
   Topf neu gefüllt. Bei 60 Sekunden Rundenzeit schafft man grob 12–18
   Begriffe, man kann eine Kategorie also zwei bis drei Mal komplett
   durchspielen, bevor sich zum ersten Mal etwas wiederholt.

   Wer mehr Begriffe will: einfach unten in die Liste schreiben, Komma nicht
   vergessen. Doppelte Einträge stören nicht, sie machen die Wiederholung nur
   wahrscheinlicher.
   ============================================================================= */

/** Erzeugt ["Loren Ipsum 1", … "Loren Ipsum n"] – Notnagel für leere Kategorien. */
export function placeholder(n = 25) {
  return Array.from({ length: n }, (_, i) => `Loren Ipsum ${i + 1}`);
}

export const WORDS = {
  /* Tiere */
  tiere: [
    'Elefant', 'Waschbär', 'Faultier', 'Igel', 'Giraffe', 'Nacktmull', 'Eichhörnchen',
    'Pinguin', 'Fledermaus', 'Alpaka', 'Krake', 'Marienkäfer', 'Nashorn', 'Seepferdchen',
    'Dackel', 'Erdmännchen', 'Chamäleon', 'Biber', 'Möwe', 'Stinktier', 'Ameisenbär', 'Koala',
    'Reh', 'Qualle', 'Papagei', 'Maulwurf', 'Flamingo', 'Kamel', 'Wildschwein', 'Schnecke',
    'Adler', 'Otter', 'Frettchen', 'Heuschrecke', 'Walross',
  ],

  /* Zeppelin Universität */
  zu: [
    'Fallenbrunn', 'Seemooser Horn', 'ZF Campus', 'Humboldt-Jahr', 'Zeppelin-Projekt',
    'Mensa', 'SPE', 'CME', 'PAIR', 'Bibliothek', 'Klausurenphase', 'Hausarbeit',
    'Bewerbungsgespräch', 'Studiengebühren', 'PioneerPort', 'seekult', 'ZU Daily', 'Welle20',
    'Soapbox', 'whyknot', 'Erstiwoche', 'Graf Zeppelin', 'Bodensee', 'Uferpromenade',
    'Zeppelin Museum', 'Katamaran nach Konstanz', 'Semesterticket', 'WG-Zimmer', 'Kleingruppe',
    'Interdisziplinarität', 'Gastvortrag', 'Exkursion', 'Bachelorarbeit', 'Strandbad',
    'Luftschiff',
  ],

  /* Hobbys */
  hobbys: [
    'Stricken', 'Bouldern', 'Angeln', 'Töpfern', 'Gärtnern', 'Backen', 'Fotografieren',
    'Wandern', 'Puzzeln', 'Schach', 'Yoga', 'Joggen', 'Malen', 'Tauchen', 'Gitarre spielen',
    'Briefmarken sammeln', 'Skifahren', 'Nähen', 'Bogenschießen', 'Imkern',
    'Vogelbeobachtung', 'Modellbau', 'Kochen', 'Klettern', 'Tagebuch schreiben', 'Radfahren',
    'Segeln', 'Karaoke', 'Skaten', 'Reiten', 'Häkeln', 'Geocaching', 'Schwimmen', 'Lesen',
    'Tanzen',
  ],

  /* Länder */
  laender: [
    'Italien', 'Japan', 'Brasilien', 'Ägypten', 'Norwegen', 'Australien', 'Kanada', 'Indien',
    'Griechenland', 'Island', 'Mexiko', 'Südafrika', 'Türkei', 'Niederlande', 'Portugal',
    'Thailand', 'Schweiz', 'Polen', 'Argentinien', 'Marokko', 'Neuseeland', 'Irland',
    'Vietnam', 'Kroatien', 'Peru', 'Finnland', 'Kenia', 'Kuba', 'Österreich', 'Spanien',
    'China', 'Schweden', 'Nepal', 'Kolumbien', 'Luxemburg',
  ],

  /* Hauptstädte */
  hauptstaedte: [
    'Berlin', 'Paris', 'Rom', 'Tokio', 'Madrid', 'Wien', 'London', 'Athen', 'Kairo', 'Moskau',
    'Amsterdam', 'Lissabon', 'Prag', 'Oslo', 'Stockholm', 'Kopenhagen', 'Warschau',
    'Budapest', 'Dublin', 'Brüssel', 'Bern', 'Helsinki', 'Reykjavik', 'Ottawa', 'Canberra',
    'Neu-Delhi', 'Bangkok', 'Peking', 'Nairobi', 'Buenos Aires', 'Havanna', 'Ankara', 'Seoul',
    'Zagreb', 'Bukarest',
  ],

  /* Essen */
  essen: [
    'Currywurst', 'Lasagne', 'Sushi', 'Döner', 'Rosenkohl', 'Tiramisu', 'Käsespätzle',
    'Pommes', 'Pfannkuchen', 'Gulasch', 'Falafel', 'Kartoffelsalat', 'Sauerkraut', 'Burrito',
    'Rührei', 'Bratwurst', 'Königsberger Klopse', 'Müsli', 'Nudelauflauf', 'Schnitzel',
    'Ramen', 'Hummus', 'Griesbrei', 'Maultaschen', 'Toast Hawaii', 'Linsensuppe',
    'Pizza Margherita', 'Frikadelle', 'Croissant', 'Chili con Carne', 'Kartoffelpuffer',
    'Milchreis', 'Paella', 'Wrap', 'Labskaus',
  ],

  /* Krankheiten & Beschwerden */
  krankheiten: [
    'Schnupfen', 'Kopfschmerzen', 'Sonnenbrand', 'Muskelkater', 'Schluckauf', 'Migräne',
    'Husten', 'Fieber', 'Zahnschmerzen', 'Heuschnupfen', 'Rückenschmerzen', 'Übelkeit',
    'Windpocken', 'Nasenbluten', 'Blasenentzündung', 'Sodbrennen', 'Hexenschuss', 'Grippe',
    'Halsschmerzen', 'Krämpfe', 'Ohrenschmerzen', 'Kater', 'Schwindel', 'Bandscheibenvorfall',
    'Allergie', 'Blähungen', 'Verstauchung', 'Sehnenscheidenentzündung', 'Warze', 'Herzrasen',
    'Tinnitus', 'Schlaflosigkeit', 'Reisekrankheit', 'Bindehautentzündung',
    'Gehirnerschütterung',
  ],

  /* Bekannte populäre Serien */
  serien: [
    'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office', 'Dark', 'Squid Game',
    'Haus des Geldes', 'Friends', 'The Crown', 'Black Mirror', 'Sherlock', 'Peaky Blinders',
    'Tatort', 'Grey’s Anatomy', 'The Walking Dead', 'Chernobyl', 'Sopranos', 'Narcos',
    'The Last of Us', 'Wednesday', 'Lost', 'Simpsons', 'Bridgerton', 'Emily in Paris',
    'How I Met Your Mother', 'Vikings', 'Better Call Saul', 'Suits', 'Lindenstraße',
    'The Boys', 'Mad Men', 'Sex Education', 'Ted Lasso', 'Rick and Morty', 'Der Bergdoktor',
  ],

  /* Sitcoms der 90er */
  sitcoms90: [
    'Friends', 'Eine schrecklich nette Familie', 'Alf', 'Full House', 'Der Prinz von Bel-Air',
    'Seinfeld', 'Roseanne', 'Hör mal wer da hämmert', 'Frasier', 'Die Nanny',
    'Alle unter einem Dach', 'Wer ist hier der Boss', 'Sabrina – total verhext', 'Mr. Bean',
    'Familie Heinz Becker', 'Die Camper', 'Hausmeister Krause', 'Nikola', 'Ritas Welt',
    'Girl Friends', 'Das Amt', 'Salto Postale', 'Ein Herz und eine Seele', 'Die Simpsons',
    'King of Queens', 'Spin City', 'Dharma und Greg', 'Hinterm Mond gleich links',
    'Das Leben und Ich', 'Sister Sister', 'Alle lieben Raymond', 'Ein Bayer auf Rügen',
    'Zwei Männer am Herd', 'Eine starke Familie', 'Die wilden Siebziger',
  ],

  /* Ü18 */
  ue18: [
    'Tequila-Shot', 'Flirten', 'Knutschen', 'Wahrheit oder Pflicht', 'Flaschendrehen', 'Dessous',
    'Junggesellenabschied', 'Nachtclub', 'Tinder-Date', 'One-Night-Stand',
    'Liebesbrief', 'Verhütung', 'Wilde Nacht', 'Sauna', 'Heiratsantrag', 'Hotelzimmer',
    'Flitterwochen', 'Hochzeitsnacht', 'Rendezvous', 'Kuscheln', 'Peinliche Anmache',
    'Erste Liebe', 'Kussmund', 'Massageöl', 'Herzklopfen', 'Verführung', 'Rosen schenken',
    'Sekt', 'Absacker', 'Morgen danach', 'Balztanz', 'Knistern', 'Rotwein',
    'Kerzenlicht', 'Spitzenwäsche',
  ],

  /* Haushalt */
  haushalt: [
    'Staubsauger', 'Bügeleisen', 'Wäscheleine', 'Spülmaschine', 'Besen', 'Mülltrennung',
    'Wischmopp', 'Klopapier', 'Waschmaschine', 'Staubwedel', 'Fensterputzen', 'Schuhregal',
    'Bettwäsche wechseln', 'Gießkanne', 'Abwasch', 'Kehrblech', 'Wäschekorb',
    'Toilettenbürste', 'Schrubben', 'Steckdose', 'Glühbirne wechseln', 'Kleiderbügel',
    'Nähkästchen', 'Backofen putzen', 'Spinnweben', 'Bügelbrett', 'Küchenrolle',
    'Waschmittel', 'Heizung entlüften', 'Regal aufbauen', 'Sperrmüll', 'Teppich klopfen',
    'Ordnung schaffen', 'Vorratsschrank', 'Rasenmähen',
  ],

  /* Berufe */
  berufe: [
    'Bäcker', 'Feuerwehrmann', 'Lehrerin', 'Pilot', 'Metzger', 'Krankenpflegerin', 'Anwalt',
    'Klempner', 'Friseurin', 'Landwirt', 'Dachdecker', 'Zahnarzt', 'Kellner',
    'Schornsteinfeger', 'Polizistin', 'Müllmann', 'Architektin', 'Tierarzt', 'Busfahrer',
    'Programmiererin', 'Hebamme', 'Elektriker', 'Koch', 'Bibliothekarin', 'Pfarrer',
    'Fotograf', 'Gärtner', 'Schauspielerin', 'Steuerberater', 'Bestatter', 'Fluglotse',
    'Winzer', 'Physiotherapeutin', 'Schreiner', 'Postbote',
  ],

  /* Automarken */
  automarken: [
    'Volkswagen', 'BMW', 'Mercedes', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini', 'Toyota',
    'Ford', 'Opel', 'Fiat', 'Renault', 'Peugeot', 'Skoda', 'Seat', 'Volvo', 'Tesla', 'Jaguar',
    'Mini', 'Rolls-Royce', 'Bentley', 'Maserati', 'Hyundai', 'Kia', 'Mazda', 'Nissan',
    'Honda', 'Subaru', 'Land Rover', 'Jeep', 'Citroën', 'Alfa Romeo', 'Bugatti', 'Smart',
    'Trabant',
  ],

  /* Die 90er */
  neunziger: [
    'Tamagotchi', 'Game Boy', 'Diskette', 'Walkman', 'Yo-Yo', 'Pokémon-Karten', 'Kassette',
    'Windows 95', 'Spice Girls', 'Backstreet Boys', 'Nirvana', 'Titanic', 'Jurassic Park',
    'Baywatch', 'Nokia 3210', 'Modem-Geräusch', 'Videothek', 'Inline-Skates', 'Tazos',
    'Schlaghose', 'Bravo-Heft', 'Diddl-Maus', 'Furby', 'Boombox', 'CD-Player', 'Trolls',
    'Nintendo 64', 'Tetris', 'MTV', 'VHS-Kassette', 'Buffalo-Schuhe', 'Beanie Babies',
    'Overhead-Projektor', 'Telefonzelle', 'Poesiealbum',
  ],

  /* Marken */
  marken: [
    'Nutella', 'Nike', 'Coca-Cola', 'Apple', 'Lego', 'Ikea', 'Haribo', 'Adidas', 'Milka',
    'Tempo', 'Persil', 'Nivea', 'Tesa', 'Maggi', 'Bahlsen', 'Ritter Sport', 'Red Bull',
    'Rolex', 'Chanel', 'Levi’s', 'Puma', 'Samsung', 'Bosch', 'Miele', 'Thermomix',
    'Playmobil', 'Barbie', 'Duplo', 'Toffifee', 'Kinderschokolade', 'Fanta', 'Jägermeister',
    'Birkenstock', 'Steiff', 'Pril',
  ],

  /* Computerspiele */
  games: [
    'Minecraft', 'Tetris', 'Super Mario', 'Pac-Man', 'Fortnite', 'Die Sims', 'Counter-Strike',
    'League of Legends', 'Zelda', 'Pokémon', 'Among Us', 'FIFA', 'GTA', 'Animal Crossing',
    'Candy Crush', 'Angry Birds', 'World of Warcraft', 'Sonic', 'Donkey Kong', 'Tomb Raider',
    'Assassin’s Creed', 'Portal', 'Doom', 'Anno', 'Age of Empires', 'Snake', 'Rocket League',
    'Mario Kart', 'Elden Ring', 'Roblox', 'Solitär', 'Moorhuhn', 'Need for Speed',
    'Half-Life', 'Street Fighter',
  ],

  /* Berühmte Duos */
  duos: [
    'Tom und Jerry', 'Bert und Ernie', 'Batman und Robin', 'Asterix und Obelix',
    'Dick und Doof', 'Bonnie und Clyde', 'Mario und Luigi', 'Sherlock und Watson',
    'Hänsel und Gretel', 'Max und Moritz', 'Timon und Pumbaa', 'Tim und Struppi',
    'Romeo und Julia', 'Adam und Eva', 'Yin und Yang', 'Simon und Garfunkel',
    'Siegfried und Roy', 'Bud Spencer und Terence Hill', 'Beavis und Butt-Head',
    'Pinky und der Brain', 'Statler und Waldorf', 'Shrek und Esel', 'Han Solo und Chewbacca',
    'R2-D2 und C-3PO', 'Barbie und Ken', 'Micky und Minnie', 'Thelma und Louise',
    'SpongeBob und Patrick', 'Chip und Chap', 'Lilo und Stitch', 'Woody und Buzz',
    'Wallace und Gromit', 'Kermit und Miss Piggy', 'Loriot und Evelyn Hamann',
    'Zwei wie Pech und Schwefel',
  ],

  /* Berühmte Personen */
  personen: [
    'Albert Einstein', 'Angela Merkel', 'Michael Jackson', 'Marilyn Monroe', 'Nelson Mandela',
    'Cleopatra', 'Napoleon', 'Leonardo da Vinci', 'Mutter Teresa', 'Charlie Chaplin',
    'Elvis Presley', 'Greta Thunberg', 'Barack Obama', 'Königin Elisabeth', 'Freddie Mercury',
    'Steve Jobs', 'Frida Kahlo', 'Beethoven', 'Anne Frank', 'Muhammad Ali', 'Mahatma Gandhi',
    'Marie Curie', 'Papst Franziskus', 'Karl Lagerfeld', 'Helmut Kohl', 'Boris Becker',
    'Dieter Bohlen', 'Heidi Klum', 'Elon Musk', 'Taylor Swift', 'Cristiano Ronaldo',
    'Lionel Messi', 'Wolfgang Amadeus Mozart', 'Vincent van Gogh',
    'Johann Wolfgang von Goethe',
  ],

  /* Brettspiele */
  brettspiele: [
    'Mensch ärgere Dich nicht', 'Monopoly', 'Schach', 'Scrabble', 'Risiko',
    'Siedler von Catan', 'Uno', 'Dame', 'Halma', 'Kniffel', 'Tabu', 'Activity', 'Cluedo',
    'Trivial Pursuit', 'Backgammon', 'Mühle', 'Skat', 'Mau-Mau', 'Memory', 'Vier gewinnt',
    'Jenga', 'Twister', 'Rommé', 'Doppelkopf', 'Malefiz', 'Carcassonne', 'Dixit', 'Werwolf',
    'Codenames', 'Das verrückte Labyrinth', 'Sagaland', 'Tempo kleine Schnecke', 'Solitär',
    'Domino', 'Poker',
  ],

  /* Bücher */
  buecher: [
    'Harry Potter', 'Herr der Ringe', 'Die Bibel', 'Der kleine Prinz', 'Faust', 'Das Parfum',
    'Die Verwandlung', 'Tintenherz', 'Das Tagebuch der Anne Frank', 'Der Vorleser', 'Momo',
    'Die unendliche Geschichte', 'Der Hobbit', 'Krieg und Frieden', 'Der Steppenwolf',
    'Die Blechtrommel', 'Der Schwarm', 'Effi Briest', 'Der Zauberberg', 'Sofies Welt',
    'Der Herr der Fliegen', '1984', 'Schöne neue Welt', 'Der Alchimist', 'Die Wolke',
    'Der Räuber Hotzenplotz', 'Pippi Langstrumpf', 'Das Dschungelbuch', 'Der Medicus',
    'Tschick', 'Die Tribute von Panem', 'Der Da Vinci Code', 'Illuminati',
    'Die Känguru-Chroniken', 'Der Fänger im Roggen',
  ],

  /* Die 2000er */
  zweitausender: [
    'iPod', 'MSN Messenger', 'StudiVZ', 'Klingelton', 'Nokia-Handy', 'Emo-Frisur',
    'Skinny Jeans', 'MySpace', 'Hüftjeans', 'YouTube-Start', 'Facebook', 'Wii', 'Guitar Hero',
    'Trucker-Cap', 'Digitalkamera', 'USB-Stick', 'Motorola Razr', 'Fußball-WM 2006',
    'Sommermärchen', 'Big Brother', 'Deutschland sucht den Superstar', 'Tokio Hotel',
    'Britney Spears', 'Harry Potter Hype', 'Herr der Ringe Trilogie', 'Matrix',
    'SMS schreiben', 'Klapphandy', 'iTunes', 'Napster', 'Chatroom', 'ICQ', 'Second Life',
    'Segway', 'Crocs',
  ],

  /* Die 2010er */
  zehner: [
    'Selfie-Stick', 'Instagram', 'Snapchat', 'Fidget Spinner', 'Hoverboard',
    'Eiskübel-Challenge', 'Pokémon Go', 'Netflix-Abend', 'Airbnb', 'Uber', 'Emoji', 'Hashtag',
    'Man Bun', 'Undercut', 'Bart-Trend', 'Craft Beer', 'Avocado-Toast', 'Smoothie-Bowl',
    'Vinyl-Comeback', 'Festivalbändchen', 'Jutebeutel', 'Fitness-Tracker', 'Whatsapp-Gruppe',
    'Serienmarathon', 'Tinder', 'Vine', 'Dab', 'Harlem Shake', 'Gangnam Style', 'Despacito',
    'Escape Room', 'Foodtruck', 'E-Scooter', 'Bullet Journal', 'Hygge',
  ],

  /* Fiktive Charaktere */
  fiktiv: [
    'Harry Potter', 'Darth Vader', 'Pippi Langstrumpf', 'Sherlock Holmes', 'Spider-Man',
    'Winnie Puuh', 'Dracula', 'Mary Poppins', 'James Bond', 'Gollum', 'Peter Pan',
    'Robin Hood', 'Frankensteins Monster', 'Kapitän Ahab', 'Der Grinch', 'Homer Simpson',
    'SpongeBob', 'Wonder Woman', 'Indiana Jones', 'Rotkäppchen', 'Käpt’n Blaubär', 'Pumuckl',
    'Bibi Blocksberg', 'Der Sandmann', 'Michel aus Lönneberga', 'Ronja Räubertochter',
    'Frodo', 'Hermine Granger', 'Joker', 'Yoda', 'Shrek', 'Alice im Wunderland',
    'Der kleine Prinz', 'Tarzan', 'Aschenputtel',
  ],

  /* Populäre Filme */
  filme: [
    'Titanic', 'Der Pate', 'Jurassic Park', 'Forrest Gump', 'Pulp Fiction', 'Matrix',
    'Fight Club', 'Der König der Löwen', 'Findet Nemo', 'Avatar', 'Inception',
    'Das Schweigen der Lämmer', 'Der Herr der Ringe', 'Zurück in die Zukunft', 'E.T.',
    'Der weiße Hai', 'Shining', 'Rocky', 'Dirty Dancing', 'Pretty Woman',
    'Ziemlich beste Freunde', 'Das Leben der Anderen', 'Good Bye Lenin',
    'Der Schuh des Manitu', 'Fluch der Karibik', 'Interstellar', 'Joker', 'Parasite',
    'Der Club der toten Dichter', 'Sieben', 'Alien', 'Gladiator', 'Frozen', 'Toy Story',
    'Der Zauberer von Oz',
  ],

  /* Früchte */
  fruechte: [
    'Apfel', 'Banane', 'Erdbeere', 'Ananas', 'Kiwi', 'Wassermelone', 'Kirsche', 'Zitrone',
    'Mango', 'Himbeere', 'Pflaume', 'Weintraube', 'Birne', 'Pfirsich', 'Orange',
    'Granatapfel', 'Feige', 'Stachelbeere', 'Brombeere', 'Aprikose', 'Papaya', 'Litschi',
    'Johannisbeere', 'Dattel', 'Kokosnuss', 'Mandarine', 'Grapefruit', 'Rhabarber',
    'Heidelbeere', 'Maracuja', 'Quitte', 'Sanddorn', 'Physalis', 'Nektarine', 'Holunderbeere',
  ],

  /* Gegenstände */
  gegenstaende: [
    'Regenschirm', 'Schlüsselbund', 'Brille', 'Kerze', 'Wecker', 'Geldbörse', 'Spiegel',
    'Koffer', 'Taschenlampe', 'Bügelschloss', 'Schere', 'Klebeband', 'Feuerzeug', 'Kompass',
    'Lupe', 'Zollstock', 'Nagelfeile', 'Kopfhörer', 'Rucksack', 'Lineal', 'Radiergummi',
    'Locher', 'Tacker', 'Fernbedienung', 'Gießkanne', 'Regenschirmständer', 'Sonnenbrille',
    'Portemonnaie', 'Haarbürste', 'Handtuch', 'Ladekabel', 'Schuhlöffel', 'Bilderrahmen',
    'Thermoskanne', 'Pinzette',
  ],

  /* Küchenutensilien */
  kueche: [
    'Kochlöffel', 'Sieb', 'Schneebesen', 'Pfannenwender', 'Nudelholz', 'Dosenöffner', 'Reibe',
    'Kartoffelstampfer', 'Sparschäler', 'Messbecher', 'Knoblauchpresse', 'Salatschleuder',
    'Pfanne', 'Topflappen', 'Backblech', 'Mixer', 'Waffeleisen', 'Küchenwaage', 'Trichter',
    'Eiswürfelform', 'Korkenzieher', 'Teesieb', 'Suppenkelle', 'Bratenthermometer', 'Wok',
    'Auflaufform', 'Zitronenpresse', 'Muffinform', 'Schnellkochtopf', 'Spätzlepresse',
    'Wasserkocher', 'Toaster', 'Espressokanne', 'Schaschlikspieß', 'Kaffeefilter',
  ],

  /* Märchen */
  maerchen: [
    'Rotkäppchen', 'Aschenputtel', 'Schneewittchen', 'Dornröschen', 'Hänsel und Gretel',
    'Rumpelstilzchen', 'Der Froschkönig', 'Rapunzel', 'Die Bremer Stadtmusikanten',
    'Der gestiefelte Kater', 'Das tapfere Schneiderlein', 'Frau Holle', 'Die Sterntaler',
    'Der Wolf und die sieben Geißlein', 'Tischlein deck dich', 'Die Prinzessin auf der Erbse',
    'Das hässliche Entlein', 'Die kleine Meerjungfrau', 'Die Schneekönigin',
    'Peter und der Wolf', 'Ali Baba', 'Aladin', 'Sindbad', 'Der Rattenfänger von Hameln',
    'Die Gänsemagd', 'Der süße Brei', 'Hans im Glück', 'Brüderchen und Schwesterchen',
    'Der Däumling', 'Das Mädchen mit den Schwefelhölzern', 'Die sieben Raben',
    'Die goldene Gans', 'Der Zwerg Nase', 'Die Bienenkönigin', 'Des Kaisers neue Kleider',
  ],

  /* Musikinstrumente */
  instrumente: [
    'Gitarre', 'Klavier', 'Geige', 'Trompete', 'Schlagzeug', 'Flöte', 'Saxofon', 'Harfe',
    'Cello', 'Akkordeon', 'Mundharmonika', 'Posaune', 'Kontrabass', 'Triangel', 'Xylofon',
    'Orgel', 'Ukulele', 'Klarinette', 'Dudelsack', 'Djembe', 'Banjo', 'Tuba', 'Panflöte',
    'Maracas', 'Tamburin', 'Blockflöte', 'Waldhorn', 'Oboe', 'Zither', 'Sitar', 'Marimba',
    'Becken', 'Keyboard', 'Kastagnetten', 'Alphorn',
  ],

  /* Schlechte Angewohnheiten */
  angewohnheiten: [
    'Nägelkauen', 'Rauchen', 'Zu spät kommen', 'Handy am Tisch', 'Schmatzen', 'Fingerknacken',
    'In der Nase bohren', 'Ins Wort fallen', 'Prokrastinieren', 'Schnarchen', 'Zappeln',
    'Zu laut telefonieren', 'Ungeduldig hupen', 'Sockenberg neben dem Bett', 'Türen knallen',
    'Kaugummi laut kauen', 'Wegschauen beim Abwasch', 'Duschen ohne Vorhang', 'Snoozen',
    'Kalte Füße ins Bett', 'Zähneknirschen', 'Klopapier nicht nachfüllen', 'Aufschieben',
    'Selbstgespräche', 'Ständig unterbrechen', 'Ungefragt Ratschläge geben',
    'Ellenbogen auf dem Tisch', 'Fluchen', 'Zu viel Kaffee', 'Schlüssel verlegen',
    'Mundgeruch ignorieren', 'Nachts Kühlschrank plündern', 'Wäsche liegen lassen',
    'Zu laut lachen', 'Auf dem Sofa einschlafen',
  ],

  /* Tänze */
  taenze: [
    'Walzer', 'Tango', 'Salsa', 'Breakdance', 'Ballett', 'Cha-Cha-Cha', 'Hip-Hop', 'Foxtrott',
    'Samba', 'Rumba', 'Discofox', 'Polka', 'Flamenco', 'Stepptanz', 'Bauchtanz',
    'Wiener Walzer', 'Jive', 'Twist', 'Moonwalk', 'Macarena', 'Ententanz', 'Lambada',
    'Sirtaki', 'Charleston', 'Quickstep', 'Zumba', 'Line Dance', 'Pole Dance',
    'Schuhplattler', 'Limbo', 'Boogie-Woogie', 'Pogo', 'Contemporary', 'Paso Doble',
    'Slowfox',
  ],

  /* Urlaub */
  urlaub: [
    'Koffer packen', 'Sonnencreme', 'Strandtuch', 'Liegestuhl', 'Reisepass', 'Flughafen',
    'All-inclusive', 'Sandburg', 'Schnorcheln', 'Souvenir', 'Postkarte', 'Hotelbuffet',
    'Wanderschuhe', 'Camping', 'Wohnmobil', 'Kreuzfahrt', 'Handtuch auf der Liege',
    'Sonnenbrand', 'Reiseführer', 'Zeltplatz', 'Mietwagen', 'Stau am Gotthard', 'Fernweh',
    'Jetlag', 'Cocktail am Pool', 'Schnappschuss', 'Berghütte', 'Skilift', 'Reiseapotheke',
    'Städtetrip', 'Ferienwohnung', 'Rucksackreise', 'Sightseeing', 'Strandkorb',
    'Verspätung am Gate',
  ],

  /* Jugendwörter */
  jugendwoerter: [
    'Lost', 'Cringe', 'Smash', 'Goofy', 'Aura', 'Das crazy', '67', 'Crashout', 'Digga',
    'Peak', 'Ragebait', 'Schere', 'Süper', 'Macker', 'Gute Käse', 'Goonen', 'Checkst du',
    'Sheesh', 'Sus', 'Slay', 'Rizz', 'NPC', 'Talahon', 'Sigma', 'Delulu', 'Flexen', 'Simp',
    'Mid', 'No Cap', 'Skibidi', 'Mewing', 'Ehrenmann', 'Bratan', 'Wild', 'Auf jeden',
  ],

  /* Skandale der letzten 10 Jahre */
  skandale: [
    'Dieselgate', 'Wirecard', 'Cum-Ex', 'Ibiza-Affäre', 'Maskenaffäre', 'Panama Papers',
    'Pandora Papers', 'Cambridge Analytica', 'Sommermärchen-Affäre', 'FIFA-Korruption',
    'Doping-Skandal', 'Nord Stream', 'Flughafen BER', 'Elbphilharmonie', 'PKW-Maut',
    'Gorch Fock', 'Berateraffäre', 'Böhmermann-Gedicht', 'Spiegel-Fälschungen',
    'Plagiatsaffäre', 'Fipronil-Eier', 'Glyphosat-Streit', 'Diesel-Fahrverbot',
    'Schummelsoftware', 'Bilanzfälschung', 'Steuerhinterziehung', 'Geldwäsche', 'Bestechung',
    'Untersuchungsausschuss', 'Rücktritt', 'Vertuschung', 'Whistleblower', 'Datenleck',
    'Hackerangriff', 'Aktiencrash',
  ],

  /* Einkaufsläden */
  laeden: [
    'Aldi', 'Lidl', 'Edeka', 'Rewe', 'Penny', 'Netto', 'Kaufland', 'dm', 'Rossmann', 'Müller',
    'Media Markt', 'Saturn', 'Ikea', 'H&M', 'Zara', 'C&A', 'Deichmann', 'Douglas', 'Thalia',
    'Obi', 'Bauhaus', 'Hornbach', 'Decathlon', 'Fressnapf', 'Depot', 'Tchibo', 'Woolworth',
    'Action', 'TEDi', 'Norma', 'Globus', 'Bäckerei', 'Apotheke', 'Späti', 'Wochenmarkt',
  ],

  /* Technische Geräte */
  technik: [
    'Föhn', 'Toaster', 'Bohrmaschine', 'Staubsauger', 'Mikrowelle', 'Drucker', 'Beamer',
    'Router', 'Waschmaschine', 'Kaffeemaschine', 'Nähmaschine', 'Rasenmäher', 'Bügeleisen',
    'Fernseher', 'Smartphone', 'Tablet', 'Laptop', 'Kopfhörer', 'Spielekonsole', 'Smartwatch',
    'Drohne', 'Saugroboter', 'Heißluftfritteuse', 'Standmixer', 'Elektrozahnbürste',
    'Rasierapparat', 'Ventilator', 'Luftbefeuchter', 'Akkuschrauber', 'Hochdruckreiniger',
    'Navigationsgerät', 'Ladegerät', 'Wärmepumpe', 'Küchenwaage', 'Diktiergerät',
  ],

  /* Dating & Tinder */
  dating: [
    'Swipen', 'Match', 'Ghosting', 'Erstes Date', 'Profilbild', 'Bio schreiben', 'Superlike',
    'Blind Date', 'Rote Rose', 'Kino-Date', 'Schmetterlinge im Bauch', 'Korb bekommen',
    'Anmachspruch', 'Beziehungsstatus', 'Fremdgehen', 'Friendzone', 'Kennenlernphase',
    'Situationship', 'Breadcrumbing', 'Love Bombing', 'Speeddating', 'Verkuppeln',
    'Ex-Partner', 'Herz-Emoji', 'Sprachnachricht', 'Gelesen ohne Antwort', 'Date absagen',
    'Rechnung teilen', 'Erster Kuss', 'Eltern vorstellen', 'Beziehungsgespräch',
    'Trennung per Nachricht', 'Online-Profil', 'Verabredung', 'Katzenbild im Profil',
  ],

  /* Versaute Dinge */
  versaut: [
    'Kondom', 'Reizwäsche', 'Handschellen', 'Sexspielzeug', 'Stripclub', 'Rotlichtviertel',
    'Peepshow', 'Nacktbaden', 'Freikörperkultur', 'Morgenlatte', 'Zungenkuss', 'Knutschfleck',
    'Playboy', 'Aktfoto', 'Striptease', 'Tabledance', 'Pole Dance', 'Schlafzimmerblick',
    'Bettgeflüster', 'Liebesschaukel', 'Federboa', 'Latexanzug', 'Ölmassage', 'Nacktkalender',
    'Sprühsahne', 'Augenbinde', 'Rollenspiel', 'Quickie', 'Dirty Talk', 'Gleitgel', 'Sexshop',
    'Bordell', 'Nacktputzen', 'Liebesbiss', 'Pornoschnauzer',
  ],

  /* Typisch Deutsch */
  typischdeutsch: [
    'Pfandflasche', 'Mülltrennung', 'Autobahn', 'Bratwurst', 'Gartenzwerg', 'Schrebergarten',
    'Sonntagsruhe', 'Bausparvertrag', 'Anmeldebestätigung', 'Bahnverspätung', 'Spätzle',
    'Weißwurst', 'Oktoberfest', 'Karneval', 'Kehrwoche', 'Betriebsrat', 'Feierabendbier',
    'Pünktlichkeit', 'Steuererklärung', 'Winterreifenpflicht', 'Baumarkt am Samstag',
    'Tatort am Sonntag', 'Freibad', 'Grillen im Park', 'Handtuch auf der Liege',
    'Bienenstich', 'Krankenkassenkarte', 'Versicherungsvertreter', 'Duden', 'Fußgängerampel',
    'Brötchen holen', 'Kleingartenverein', 'Wanderurlaub', 'Schützenfest',
    'Doppelte Buchführung',
  ],

  /* Memes & Internet */
  memes: [
    'Doge', 'Grumpy Cat', 'Rickroll', 'Distracted Boyfriend', 'This is fine', 'Nyan Cat',
    'Trollface', 'Harlem Shake', 'Ice Bucket Challenge', 'Katzenvideo', 'Pepe', 'Stonks',
    'Woman Yelling at Cat', 'Galaxy Brain', 'Skibidi Toilet', 'Chad', 'Karen', 'Facepalm',
    'Copypasta', 'Clickbait', 'Shitstorm', 'Hashtag', 'GIF', 'Emoji', 'Livestream',
    'Influencer', 'Unboxing', 'Reaction Video', 'Speedrun', 'Fail-Video', 'Captcha',
    '404-Fehler', 'Autokorrektur-Fail', 'Ladebalken', 'Kettenbrief',
  ],
};
