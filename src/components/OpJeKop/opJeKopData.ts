export interface OpJeKopDeck {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Tailwind klassen voor de geselecteerde staat */
  activeClass: string;
  /** Tailwind klassen voor de categorie-badge in het woordenboek */
  badgeClass: string;
  words: string[];
}

const DIEREN = [
  'Olifant', 'Giraffe', 'Pinguïn', 'Kangoeroe', 'Krokodil', 'Dolfijn', 'Egel', 'Flamingo', 'Luiaard', 'Kameel',
  'Octopus', 'Eekhoorn', 'Papegaai', 'Nijlpaard', 'Zeehond', 'Vleermuis', 'Stokstaartje', 'Kikker', 'Slak', 'Pauw',
  'Haai', 'Koala', 'Gorilla', 'Zebra', 'Neushoorn', 'Uil', 'Bever', 'Kwal', 'Lama', 'Ooievaar',
  'Mol', 'Wasbeer', 'IJsbeer', 'Schildpad', 'Zeepaardje', 'Cavia', 'Goudvis', 'Mug', 'Lieveheersbeestje', 'Struisvogel',
  'Panda', 'Wolf', 'Vos', 'Hert', 'Konijn', 'Kip', 'Varken', 'Koe', 'Paard', 'Schaap',
  'Geit', 'Ezel', 'Kalkoen', 'Zwaan', 'Meeuw', 'Duif', 'Bij', 'Vlinder', 'Spin', 'Mier',
  'Jachtluipaard', 'Hyena', 'Walvis', 'Orka', 'Kreeft', 'Krab', 'Oester', 'Pelikaan', 'Toekan', 'Specht',
  'Kolibrie', 'Arend', 'Valk', 'Kraai', 'Ekster', 'Merel', 'Roodborstje', 'Hamster', 'Fret', 'Chinchilla',
  'Kameleon', 'Leguaan', 'Piranha', 'Sidderaal', 'Schotse Hooglander', 'Alpaca', 'Eland', 'Rendier', 'Bizon', 'Stekelvarken',
  'Hond', 'Kat', 'Haan', 'Wesp', 'Regenworm', 'Zeester', 'Chimpansee', 'Tijger', 'Leeuw', 'Adelaar',
];

const UITBEELDEN = [
  'Tanden poetsen', 'Fietsband plakken', 'Pannenkoek omdraaien', 'Selfie maken', 'Skiën', 'Autorijden', 'Vissen',
  'Schaatsen', 'Zwemmen', 'Gewichtheffen', 'Luchtgitaar spelen', 'Hond uitlaten', 'Luier verschonen', 'Stofzuigen',
  'Strijken', 'Surfen', 'Boksen', 'Paardrijden', 'Touwtjespringen', 'Koe melken', 'Tennissen', 'Bowlen',
  'Moonwalken', 'Ramen wassen', 'Haar föhnen', 'Scheren', 'Make-up opdoen', 'Ui snijden', 'Typen', 'Limbodansen',
  'Parachutespringen', 'Bergbeklimmen', 'Roeien', 'Golfen', 'Darten', 'Pizza bakken', 'Bier tappen', 'Plaatjes draaien',
  'Dirigeren', 'Jongleren', 'Koorddansen', 'Gamen', 'Sneeuwballen gooien', 'Vliegeren', 'Hoelahoepen', 'Yoga',
  'Cadeau inpakken', 'Band verwisselen', 'Behangen', 'Timmeren', 'Zagen', 'Grasmaaien', 'Barbecueën', 'Afwassen',
  'Bed opmaken', 'Tent opzetten', 'Kaarsjes uitblazen', 'Champagne ontkurken', 'Liften', 'Slaapwandelen',
  'Wijn proeven', 'Sinaasappel persen', 'Oesters slurpen', 'Spaghetti eten', 'Kauwgombel blazen', 'Nagels lakken',
  'Wenkbrauwen epileren', 'Oordopjes indoen', 'Contactlenzen indoen', 'Veters strikken', 'Stropdas knopen',
  'Koffie malen', 'Eieren klutsen', 'Deeg kneden', 'Schroeven indraaien', 'Plank schuren', 'Muur verven',
  'Karate', 'Balletdansen', 'Breakdansen', 'Salsa dansen', 'Trommelen', 'Trompet spelen', 'Viool spelen',
  'Foto maken', 'Duiken van de duikplank', 'Rolschaatsen', 'Step rijden', 'Tafeltennissen', 'Kegelen',
];

const ETEN = [
  'Frikandel speciaal', 'Stroopwafel', 'Bitterbal', 'Kapsalon', 'Hagelslag', 'Erwtensoep', 'Pannenkoek', 'Kroket',
  'Tosti', 'Stamppot', 'Poffertjes', 'Drop', 'Haring', 'Oliebol', 'Patat met mayo', 'Kaasfondue',
  'Tompouce', 'Pindakaas', 'Appeltaart', 'Bossche bol', 'Kaassoufflé', 'Bamischijf', 'Saté', 'Nasi',
  'Spaghetti', 'Pizza Hawaï', 'Sushi', 'Hamburger', 'Taco', 'Croissant', 'Donut', 'Popcorn',
  'Suikerspin', 'IJsje', 'Chocoladeletter', 'Pepernoten', 'Beschuit met muisjes', 'Vla', 'Karnemelk', 'Chocomel',
  'Espresso', 'Cappuccino', 'Mojito', 'Gin-tonic', 'Radler', 'Rosé', 'Champagne', 'Advocaat',
  'Knakworst', 'Rookworst', 'Boerenkool', 'Zuurkool', 'Kibbeling', 'Gehaktbal', 'Uitsmijter', 'Wentelteefjes',
  'Slagroom', 'Pindasaus', 'Knoflooksaus', 'Borrelnootjes', 'Kipkorn', 'Mexicano', 'Berenhap', 'Broodje kroket',
  'Eierbal', 'Worstenbroodje', 'Zeeuwse bolus', 'Suikerbrood', 'Krentenbol', 'Ontbijtkoek', 'Speculaas', 'Kruimelvlaai',
  'Monchoutaart', 'Tiramisu', 'Crème brûlée', 'Panna cotta', 'Lasagne', 'Carbonara', 'Paella', 'Poké bowl',
  'Carpaccio', 'Bruschetta', 'Nachos', 'Guacamole', 'Hummus', 'Falafel', 'Shoarma', 'Döner',
  'Espresso Martini', 'Aperol Spritz', 'Hutspot', 'Babi Pangang', 'Loempia', 'Saucijzenbroodje', 'Frikandelbroodje',
  'Kaasbroodje', 'Spekkoek', 'Zoute drop', 'Goudse kaas', 'Oliebollen',
];

const FEEST = [
  'Carnaval', 'Koningsdag', 'Oud en Nieuw', 'Vrijgezellenfeest', 'Karaoke', 'Silent disco', 'Bierpong', 'Après-ski',
  'Festival', 'Huisfeest', 'Kroegentocht', 'Pubquiz', 'Sinterklaas', 'Bruiloft', 'Afterparty', 'Polonaise',
  'Kater', 'Portier', 'Garderobe', 'Barkruk', 'Bierviltje', 'Statiegeld', 'Confetti', 'Discobal',
  'Rookmachine', 'Stoelendans', 'Vuurwerk', 'Kampvuur', 'Barbecue', 'Polsbandje', 'Oordopjes', 'Taxi',
  'Nachtbus', 'Kebab', 'Meezinger', 'Indrinken', 'Rondje geven', 'Happy hour', 'Shotje', 'Bierfiets',
  'Glühwein', 'Kerstmarkt', 'Kermis', 'Botsauto', 'Reuzenrad', 'Zweefmolen', 'Oliebollenkraam', 'Schuimparty',
  'Verkleedfeest', 'Taart aansnijden', 'Ballonnen', 'Slingers', 'Fotohokje', 'Dansvloer', 'Fooienpot', 'Proosten',
  'Laatste ronde', 'Verjaardagskalender', 'Feestmuts', 'Surpriseparty', 'Gastenlijst', 'Vriendenweekend',
  'Festivalcamping', 'Partytent', 'Koelbox', 'IJsblokjes', 'Limoncellobar', 'Jukebox', 'Biertap', 'Fust',
  'Meter bier', 'Kratje', 'Bramenlikeur', 'Slingerlichtjes', 'Laserlicht', 'Stroboscoop', 'Stage diving',
  'Backstagepas', 'VIP-tafel', 'Vriendengroep', 'Groepsapp', 'Spelletjesavond', 'Boerengolf', 'Pubgolf',
  'Kerstborrel', 'Nieuwjaarsduik', 'Vrijmibo', 'Tuinfeest', 'Poolparty', 'Themafeest', 'Cantus', 'Kringverjaardag',
  'Adtje', 'Mexxen', 'Bussen', 'Brakke zondag',
];

const BEROEPEN = [
  'Tandarts', 'Piloot', 'Barman', 'Brandweerman', 'Kapper', 'Boer', 'Politieagent', 'DJ',
  'Chirurg', 'Leraar', 'Kok', 'Loodgieter', 'Postbode', 'Scheidsrechter', 'Steward', 'Vuilnisman',
  'Dierenarts', 'Advocaat', 'Buschauffeur', 'Timmerman', 'Influencer', 'Badmeester', 'Goochelaar', 'Astronaut',
  'Clown', 'Rechter', 'Tolk', 'Fotograaf', 'Bakker', 'Slager', 'Visboer', 'Glazenwasser',
  'Schoorsteenveger', 'Rijinstructeur', 'Verpleegkundige', 'Makelaar', 'Boswachter', 'Duiker', 'Stuntman', 'Weerman',
  'Nieuwslezer', 'Tuinman', 'Schilder', 'Elektricien', 'Caissière', 'Ober', 'Sommelier', 'Conducteur',
  'Kraanmachinist', 'Imker', 'Dominee', 'Tatoeëerder', 'Personal trainer', 'Programmeur', 'Detective', 'Burgemeester',
  'Minister-president', 'Koning', 'Strandwacht', 'Marktkoopman', 'Fysiotherapeut', 'Apotheker', 'Opticien', 'Notaris',
  'Accountant', 'Architect', 'Hovenier', 'Metselaar', 'Dakdekker', 'Stratenmaker', 'Automonteur', 'Fietsenmaker',
  'Treinmachinist', 'Luchtverkeersleider', 'Kapitein', 'Matroos', 'Fotomodel', 'Acteur', 'Regisseur', 'Cameraman',
  'Geluidstechnicus', 'Journalist', 'Schrijver', 'Bibliothecaris', 'Archeoloog', 'Bioloog', 'Scheikundige',
  'Schoonheidsspecialist', 'Hondentrimmer', 'Paparazzi', 'Bodyguard',
];

const PERSONEN = [
  'Max Verstappen', 'Johan Cruijff', 'Beyoncé', 'André van Duin', 'Koning Willem-Alexander',
  'Taylor Swift', 'Lionel Messi', 'Chantal Janzen', 'Gordon', 'Martien Meiland',
  'Barack Obama', 'Adele', 'Femke Bol', 'Cristiano Ronaldo', 'Koningin Máxima',
  'Albert Einstein', 'Rico Verhoeven', 'Guus Meeuwis', 'Elon Musk', 'Anouk',
  'Billie Eilish', 'Memphis Depay', 'Frans Bauer', 'Ed Sheeran', 'Sven Kramer',
  'Lady Gaga', 'Dafne Schippers', 'Freddie Mercury', 'Arjen Robben', 'Vincent van Gogh',
  'Michael Jackson', 'Epke Zonderland', 'Rihanna', 'Mathieu van der Poel', 'Wendy van Dijk',
  'Shakira', 'Virgil van Dijk', 'Linda de Mol', 'Tom Cruise', 'Joost Klein',
  'Davina Michelle', 'Kobe Bryant', 'Snollebollekes', 'Dua Lipa', 'Jochem Myjer',
  'Justin Bieber', 'Suzan & Freek', 'Usain Bolt', 'Najib Amhali', 'Brad Pitt',
  'Duncan Laurence', 'Kaj Gorgels', 'Lieke Martens', 'Martin Garrix', 'Armin van Buuren',
  'Tiësto', 'Rembrandt van Rijn', 'Anne Frank', 'Ruud Gullit', 'Marco Borsato',
  'Eva Jinek', 'Beau van Erven Dorens', 'Humberto Tan', 'Gerard Joling', 'René Froger',
  'Jan Smit', 'Paul de Leeuw', 'Katja Schuurman', 'Doutzen Kroes', 'Nikkie de Jager',
  'Enzo Knol', 'Freek Vonk', 'Arjen Lubach', 'Youp van ’t Hek', 'Herman Finkers',
  'Donald Trump', 'Nelson Mandela', 'Martin Luther King', 'Mahatma Gandhi', 'Julius Caesar',
  'Napoleon Bonaparte', 'Cleopatra', 'Leonardo da Vinci', 'William Shakespeare', 'Mozart',
  'Beethoven', 'Pablo Picasso', 'Stephen Hawking', 'Isaac Newton', 'Charles Darwin',
  'Marie Curie', 'Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Oprah Winfrey',
  'Eminem', 'Snoop Dogg', 'Madonna', 'Ariana Grande', 'Bruno Mars',
  'Leonardo DiCaprio', 'Johnny Depp', 'Will Smith', 'Dwayne Johnson', 'Margot Robbie',
  'Roger Federer', 'Rafael Nadal', 'Serena Williams', 'Lewis Hamilton', 'Michael Jordan',
  'Zlatan Ibrahimović', 'Kylian Mbappé', 'Muhammad Ali', 'Harry Potter', 'Darth Vader',
  'James Bond', 'Sherlock Holmes', 'Spider-Man', 'Batman', 'SpongeBob SquarePants',
  'Super Mario', 'Pikachu', 'Mickey Mouse', 'Donald Duck', 'Sinterklaas',
];

const PLAATSEN = [
  'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen', 'Maastricht', 'Breda',
  'Tilburg', 'Nijmegen', 'Haarlem', 'Parijs', 'Londen', 'New York', 'Tokio', 'Rome',
  'Berlijn', 'Barcelona', 'Sydney', 'Rio de Janeiro', 'Venetië', 'Athene', 'Los Angeles', 'Las Vegas',
  'Nederland', 'België', 'Duitsland', 'Frankrijk', 'Spanje', 'Italië', 'Griekenland', 'Portugal',
  'Engeland', 'Zweden', 'Noorwegen', 'Zwitserland', 'Oostenrijk', 'Egypte', 'Marokko', 'Turkije',
  'Verenigde Staten', 'Canada', 'Mexico', 'Brazilië', 'Australië', 'Japan', 'China', 'Thailand',
  'Indonesië', 'Zuid-Afrika', 'IJsland', 'Curaçao', 'Aruba', 'Suriname', 'Ibiza', 'Bali',
  'De Eiffeltoren', 'De Piramides van Gizeh', 'De Chinese Muur', 'Het Colosseum', 'De Taj Mahal',
  'Het Vrijheidsbeeld', 'De Big Ben', 'De Scheve Toren van Pisa', 'De Sagrada Família', 'De Mount Everest',
  'De Grand Canyon', 'De Niagara Watervallen', 'De Sahara', 'De Amazone', 'De Noordpool',
  'De Zuidpool', 'De Waddeneilanden', 'Keukenhof', 'Madurodam', 'De Efteling',
  'Walibi Holland', 'Artis', 'Het Rijksmuseum', 'Het Anne Frank Huis', 'De Domtoren',
  'De Erasmusbrug', 'De Euromast', 'Het Binnenhof', 'De Afsluitdijk', 'Kinderdijk',
  'Giethoorn', 'Zaanse Schans', 'Scheveningen', 'De Veluwe', 'Drielandenpunt',
  'Johan Cruijff ArenA', 'De Kuip', 'Ziggo Dome', 'Circuit Zandvoort', 'Machu Picchu',
  'Golden Gate Bridge', 'Times Square', 'Burj Khalifa', 'Disneyland Parijs', 'Buckingham Palace',
];

const MEDIA = [
  'Wie is de Mol?', 'Titanic', 'The Lion King', 'Goede Tijden Slechte Tijden', 'Boer Zoekt Vrouw',
  'Squid Game', 'Expeditie Robinson', 'Friends', 'Game of Thrones', 'Avatar',
  'De Luizenmoeder', 'Stranger Things', 'Star Wars', 'Breaking Bad', 'Flodder',
  'Jurassic Park', 'De Slimste Mens', 'Wednesday', 'Bassie & Adriaan', 'Peaky Blinders',
  'Bohemian Rhapsody', 'The Masked Singer', 'Het Klokhuis', 'Jeugdjournaal', 'Miljoenenjacht',
  'Gooische Vrouwen', 'Top Gun', 'Eurovisie Songfestival', 'Beste Zangers', 'Barbie',
  'Temptation Island', 'First Dates', 'Lego Masters', 'Heel Holland Bakt', 'De Verraders',
  'Kopen Zonder Kijken', 'B&B Vol Liefde', 'Chateau Meiland', 'Mocro Maffia', 'Flikken Maastricht',
  'Baantjer', 'New Kids', 'Soldaat van Oranje', 'Lord of the Rings', 'The Matrix',
  'Inception', 'Interstellar', 'The Dark Knight', 'Forrest Gump', 'The Godfather',
  'The Hangover', 'Home Alone', 'Toy Story', 'Finding Nemo', 'Frozen',
  'The Simpsons', 'South Park', 'Rick and Morty', 'The Office', 'How I Met Your Mother',
  'La Casa de Papel', 'The Crown', 'Black Mirror', 'The Last of Us', 'Catan',
  'Ticket to Ride', 'Carcassonne', 'Regenwormen', 'Weerwolven van Wakkerdam', 'Stef Stuntpiloot',
  'Twister', 'Ganzenbord', 'Mens Erger Je Niet', 'Risk', 'Cluedo',
  'Stratego', 'Rummikub', 'Scrabble', 'Yahtzee', 'Monopoly',
  'Party & Co', 'Trivial Pursuit', 'Wii Sports', 'Mario Kart', 'Minecraft',
  'Fortnite', 'Grand Theft Auto', 'Call of Duty', 'EA FC / FIFA', 'Pokémon Go',
  'Tetris', 'Pac-Man', 'Donkey Kong', 'Rad van Fortuin', 'Lingo',
];

const ALGEMENE_KENNIS = [
  'Zwaartekracht', 'Fotosynthese', 'Democratie', 'Grondwet', 'Tweede Kamer', 'Prinsjesdag',
  'Bevrijdingsdag', 'Elfstedentocht', 'Deltawerken', 'Zonnestelsel', 'Melkweg', 'Zwart gat',
  'Maanverduistering', 'Zonsverduistering', 'Noorderlicht', 'Regenboog', 'Onweer', 'Vulkaanuitbarsting',
  'Aardbeving', 'Tsunami', 'Broeikaseffect', 'Ozonlaag', 'Evolutietheorie', 'DNA',
  'Relativiteitstheorie', 'Pythagoras', 'Kompas', 'Telescoop', 'Microscoop', 'Thermometer',
  'Stethoscoop', 'Satelliet', 'Internet', 'Kunstmatige intelligentie', 'Bitcoin', 'Inflatie',
  'Beurskrach', 'Belastingdienst', 'Paspoort', 'Rijbewijs', 'Olympische Spelen', 'Tour de France',
  'Champions League', 'Formule 1', 'Gouden Schoen', 'Nobelprijs', 'Oscar', 'Euro',
  'Klavertje vier', 'Horoscoop', 'Middeleeuwen', 'Renaissance', 'Industriële Revolutie', 'Koude Oorlog',
  'Tweede Wereldoorlog', 'Berlijnse Muur', 'Apollo 11', 'Maanlanding', 'Gutenberg boekdrukkunst', 'Stoommachine',
  'Elektriciteit', 'Gloeilamp', 'Batterij', 'Zonnepaneel', 'Windmolen', 'Kernenergie',
  'Zuurstof', 'Koolstofdioxide', 'Waterstof', 'Diamant', 'Goudkoorts', 'Magnetisme',
  'Geluidssnelheid', 'Lichtsnelheid', 'Sfinx', 'Hierogliefen', 'Mythologie', 'Grieks alfabet',
  'Romeinse cijfers', 'Morsecode', 'Braille', 'Gebarentaal', 'Esperanto', 'Origami',
  'Haiku', 'Symfonie', 'Opera', 'Renaissancekunst', 'Kubisme', 'Impressionisme',
  'De Nachtwacht', 'Zonnebloemen', 'Mona Lisa', 'Het Meisje met de Parel', 'UNESCO Werelderfgoed',
  'Rode Kruis', 'Verenigde Naties', 'Europese Unie', 'NAVO', 'Wereldgezondheidsorganisatie',
];

export interface CustomOpJeKopWord {
  id: string;
  word: string;
  deckId: string;
}

export interface OpJeKopWordEntry {
  word: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  badgeClass: string;
  customId?: string;
}

const STORAGE_CUSTOM_OPJEKOP_KEY = 'party_channels_op_je_kop_custom_words_v1';

export const OP_JE_KOP_DECKS: OpJeKopDeck[] = [
  {
    id: 'mix',
    name: 'Alle woorden',
    emoji: '🎲',
    description: 'Mix van alle categorieën',
    activeClass: 'bg-fuchsia-600 border-fuchsia-700 text-white',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    words: [],
  },
  {
    id: 'personen',
    name: 'Personen',
    emoji: '🌟',
    description: 'Bekende mensen & iconen',
    activeClass: 'bg-amber-500 border-amber-700 text-white',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    words: PERSONEN,
  },
  {
    id: 'algemeen',
    name: 'Algemene kennis',
    emoji: '🧠',
    description: 'Wetenschap, historie & weetjes',
    activeClass: 'bg-violet-600 border-violet-700 text-white',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-300',
    words: ALGEMENE_KENNIS,
  },
  {
    id: 'dieren',
    name: 'Dieren',
    emoji: '🦁',
    description: 'Van mier tot olifant',
    activeClass: 'bg-emerald-600 border-emerald-700 text-white',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    words: DIEREN,
  },
  {
    id: 'uitbeelden',
    name: 'Uitbeelden',
    emoji: '🎭',
    description: 'Zonder geluid voordoen!',
    activeClass: 'bg-indigo-600 border-indigo-700 text-white',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    words: UITBEELDEN,
  },
  {
    id: 'eten',
    name: 'Eten & Drinken',
    emoji: '🍟',
    description: 'Van frikandel tot mojito',
    activeClass: 'bg-orange-500 border-orange-600 text-white',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    words: ETEN,
  },
  {
    id: 'feest',
    name: 'Feest & Uitgaan',
    emoji: '🎉',
    description: 'Alles van een avondje stappen',
    activeClass: 'bg-pink-600 border-pink-700 text-white',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
    words: FEEST,
  },
  {
    id: 'beroepen',
    name: 'Beroepen',
    emoji: '👷',
    description: 'Wat doe jij voor werk?',
    activeClass: 'bg-sky-600 border-sky-700 text-white',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    words: BEROEPEN,
  },
  {
    id: 'plaatsen',
    name: 'Plaatsen & Landen',
    emoji: '🌍',
    description: 'Steden, landen & hotspots',
    activeClass: 'bg-teal-600 border-teal-700 text-white',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
    words: PLAATSEN,
  },
  {
    id: 'media',
    name: 'Films, TV & Games',
    emoji: '🎬',
    description: 'Series, shows & spellen',
    activeClass: 'bg-rose-600 border-rose-700 text-white',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    words: MEDIA,
  },
];

export const CONCRETE_OP_JE_KOP_DECKS = OP_JE_KOP_DECKS.filter(d => d.id !== 'mix');

function resolveConcreteDeckId(deckId: string): string {
  return CONCRETE_OP_JE_KOP_DECKS.some(d => d.id === deckId) ? deckId : 'algemeen';
}

export function loadCustomOpJeKopWords(): CustomOpJeKopWord[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_OPJEKOP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (item): item is CustomOpJeKopWord =>
              Boolean(item && typeof item.id === 'string' && typeof item.word === 'string' && typeof item.deckId === 'string')
          )
          .map(item => ({
            ...item,
            deckId: resolveConcreteDeckId(item.deckId),
          }));
      }
    }
  } catch {
    // negeer opslagfout
  }
  return [];
}

export function saveCustomOpJeKopWords(items: CustomOpJeKopWord[]): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_OPJEKOP_KEY, JSON.stringify(items));
  } catch {
    // negeer opslagfout
  }
}

export function addCustomOpJeKopWord(word: string, deckId = 'algemeen'): CustomOpJeKopWord[] {
  const clean = word.trim().slice(0, 48);
  const resolvedDeckId = resolveConcreteDeckId(deckId);
  const current = loadCustomOpJeKopWords();
  if (!clean) return current;
  const exists = current.some(
    item => item.word.toLowerCase() === clean.toLowerCase() && item.deckId === resolvedDeckId
  );
  if (exists) return current;
  const created: CustomOpJeKopWord = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    word: clean,
    deckId: resolvedDeckId,
  };
  const next = [created, ...current];
  saveCustomOpJeKopWords(next);
  return next;
}

export function removeCustomOpJeKopWord(id: string): CustomOpJeKopWord[] {
  const current = loadCustomOpJeKopWords();
  const next = current.filter(item => item.id !== id);
  saveCustomOpJeKopWords(next);
  return next;
}

/** Geeft alle woorden terug met hun exacte categorie (ook voor "Alle woorden" en het woordenboek). */
export function getWordEntriesForDeck(deckId: string): OpJeKopWordEntry[] {
  const custom = loadCustomOpJeKopWords();
  const targetDecks =
    deckId === 'mix'
      ? CONCRETE_OP_JE_KOP_DECKS
      : CONCRETE_OP_JE_KOP_DECKS.filter(d => d.id === deckId);

  const seen = new Set<string>();
  const entries: OpJeKopWordEntry[] = [];

  if (deckId === 'eigen') {
    for (const c of custom) {
      const key = `${c.deckId}:${c.word.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const deck = CONCRETE_OP_JE_KOP_DECKS.find(d => d.id === c.deckId) ?? CONCRETE_OP_JE_KOP_DECKS[1];
      entries.push({
        word: c.word.trim(),
        categoryId: deck.id,
        categoryName: deck.name,
        categoryEmoji: deck.emoji,
        badgeClass: deck.badgeClass,
        customId: c.id,
      });
    }
    return entries;
  }

  // Eigen woorden eerst tonen
  for (const c of custom) {
    if (deckId !== 'mix' && c.deckId !== deckId) continue;
    const key = c.word.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const deck = CONCRETE_OP_JE_KOP_DECKS.find(d => d.id === c.deckId) ?? CONCRETE_OP_JE_KOP_DECKS[1];
    entries.push({
      word: c.word.trim(),
      categoryId: deck.id,
      categoryName: deck.name,
      categoryEmoji: deck.emoji,
      badgeClass: deck.badgeClass,
      customId: c.id,
    });
  }

  for (const deck of targetDecks) {
    for (const rawWord of deck.words) {
      const clean = rawWord.trim();
      const key = clean.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      entries.push({
        word: clean,
        categoryId: deck.id,
        categoryName: deck.name,
        categoryEmoji: deck.emoji,
        badgeClass: deck.badgeClass,
      });
    }
  }

  return entries;
}

/** Alle woorden van een categorie; elk woord hoort altijd bij een concrete categorie. */
export function getDeckWords(deckId: string): string[] {
  return getWordEntriesForDeck(deckId).map(entry => entry.word);
}

export function getDeckSize(deckId: string): number {
  return getDeckWords(deckId).length;
}
