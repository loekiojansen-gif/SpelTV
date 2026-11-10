import { getAllWords } from '../ThirtySeconds/thirtySecondsData';

export interface OpJeKopDeck {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Tailwind klassen voor de geselecteerde staat */
  activeClass: string;
  words: string[];
}

const DIEREN = [
  'Olifant', 'Giraffe', 'Pinguïn', 'Kangoeroe', 'Krokodil', 'Dolfijn', 'Egel', 'Flamingo', 'Luiaard', 'Kameel',
  'Octopus', 'Eekhoorn', 'Papegaai', 'Nijlpaard', 'Zeehond', 'Vleermuis', 'Stokstaartje', 'Kikker', 'Slak', 'Pauw',
  'Haai', 'Koala', 'Gorilla', 'Zebra', 'Neushoorn', 'Uil', 'Bever', 'Kwal', 'Lama', 'Ooievaar',
  'Mol', 'Wasbeer', 'IJsbeer', 'Schildpad', 'Zeepaardje', 'Cavia', 'Goudvis', 'Mug', 'Lieveheersbeestje', 'Struisvogel',
  'Panda', 'Wolf', 'Vos', 'Hert', 'Konijn', 'Kip', 'Varken', 'Koe', 'Paard', 'Schaap',
  'Geit', 'Ezel', 'Kalkoen', 'Zwaan', 'Meeuw', 'Duif', 'Bij', 'Vlinder', 'Spin', 'Mier',
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
];

const ETEN = [
  'Frikandel speciaal', 'Stroopwafel', 'Bitterbal', 'Kapsalon', 'Hagelslag', 'Erwtensoep', 'Pannenkoek', 'Kroket',
  'Tosti', 'Stamppot', 'Poffertjes', 'Drop', 'Haring', 'Oliebol', 'Patat met mayo', 'Kaasfondue',
  'Tompouce', 'Pindakaas', 'Appeltaart', 'Bossche bol', 'Kaassoufflé', 'Bamischijf', 'Saté', 'Nasi',
  'Spaghetti', 'Pizza Hawaï', 'Sushi', 'Hamburger', 'Taco', 'Croissant', 'Donut', 'Popcorn',
  'Suikerspin', 'IJsje', 'Chocoladeletter', 'Pepernoten', 'Beschuit met muisjes', 'Vla', 'Karnemelk', 'Chocomel',
  'Espresso', 'Cappuccino', 'Mojito', 'Gin-tonic', 'Radler', 'Rosé', 'Champagne', 'Advocaat',
  'Knakworst', 'Rookworst', 'Boerenkool', 'Zuurkool', 'Kibbeling', 'Gehaktbal', 'Uitsmijter', 'Wentelteefjes',
  'Slagroom', 'Pindasaus', 'Knoflooksaus', 'Borrelnootjes',
];

const FEEST = [
  'Carnaval', 'Koningsdag', 'Oud en Nieuw', 'Vrijgezellenfeest', 'Karaoke', 'Silent disco', 'Bierpong', 'Après-ski',
  'Festival', 'Huisfeest', 'Kroegentocht', 'Pubquiz', 'Sinterklaas', 'Bruiloft', 'Afterparty', 'Polonaise',
  'Kater', 'Portier', 'Garderobe', 'Barkruk', 'Bierviltje', 'Statiegeld', 'Confetti', 'Discobal',
  'Rookmachine', 'Stoelendans', 'Vuurwerk', 'Kampvuur', 'Barbecue', 'Polsbandje', 'Oordopjes', 'Taxi',
  'Nachtbus', 'Kebab', 'Meezinger', 'Indrinken', 'Rondje geven', 'Happy hour', 'Shotje', 'Bierfiets',
  'Glühwein', 'Kerstmarkt', 'Kermis', 'Botsauto', 'Reuzenrad', 'Zweefmolen', 'Oliebollenkraam', 'Schuimparty',
  'Verkleedfeest', 'Taart aansnijden', 'Ballonnen', 'Slingers', 'Fotohokje', 'Dansvloer', 'Fooienpot', 'Proosten',
  'Laatste ronde', 'Verjaardagskalender', 'Feestmuts', 'Surpriseparty',
];

const BEROEPEN = [
  'Tandarts', 'Piloot', 'Barman', 'Brandweerman', 'Kapper', 'Boer', 'Politieagent', 'DJ',
  'Chirurg', 'Leraar', 'Kok', 'Loodgieter', 'Postbode', 'Scheidsrechter', 'Steward', 'Vuilnisman',
  'Dierenarts', 'Advocaat', 'Buschauffeur', 'Timmerman', 'Influencer', 'Badmeester', 'Goochelaar', 'Astronaut',
  'Clown', 'Rechter', 'Tolk', 'Fotograaf', 'Bakker', 'Slager', 'Visboer', 'Glazenwasser',
  'Schoorsteenveger', 'Rijinstructeur', 'Verpleegkundige', 'Makelaar', 'Boswachter', 'Duiker', 'Stuntman', 'Weerman',
  'Nieuwslezer', 'Tuinman', 'Schilder', 'Elektricien', 'Caissière', 'Ober', 'Sommelier', 'Conducteur',
  'Kraanmachinist', 'Imker', 'Dominee', 'Tatoeëerder', 'Personal trainer', 'Programmeur', 'Detective', 'Burgemeester',
  'Minister-president', 'Koning', 'Strandwacht', 'Marktkoopman',
];

export const OP_JE_KOP_DECKS: OpJeKopDeck[] = [
  {
    id: 'mix',
    name: 'Alle woorden',
    emoji: '🎲',
    description: 'Het grote woordenboek',
    activeClass: 'bg-fuchsia-600 border-fuchsia-700 text-white',
    words: [],
  },
  {
    id: 'dieren',
    name: 'Dieren',
    emoji: '🦁',
    description: 'Van mier tot olifant',
    activeClass: 'bg-emerald-600 border-emerald-700 text-white',
    words: DIEREN,
  },
  {
    id: 'uitbeelden',
    name: 'Uitbeelden',
    emoji: '🎭',
    description: 'Zonder geluid voordoen!',
    activeClass: 'bg-indigo-600 border-indigo-700 text-white',
    words: UITBEELDEN,
  },
  {
    id: 'eten',
    name: 'Eten & Drinken',
    emoji: '🍟',
    description: 'Van frikandel tot mojito',
    activeClass: 'bg-orange-500 border-orange-600 text-white',
    words: ETEN,
  },
  {
    id: 'feest',
    name: 'Feest & Uitgaan',
    emoji: '🎉',
    description: 'Alles van een avondje stappen',
    activeClass: 'bg-pink-600 border-pink-700 text-white',
    words: FEEST,
  },
  {
    id: 'beroepen',
    name: 'Beroepen',
    emoji: '👷',
    description: 'Wat doe jij voor werk?',
    activeClass: 'bg-sky-600 border-sky-700 text-white',
    words: BEROEPEN,
  },
];

/** Alle woorden van een categorie; "mix" gebruikt het woordenboek van 30 Seconds (incl. eigen woorden). */
export function getDeckWords(deckId: string): string[] {
  const deck = OP_JE_KOP_DECKS.find(d => d.id === deckId);
  if (!deck || deck.id === 'mix') return getAllWords();
  return deck.words;
}

export function getDeckSize(deckId: string): number {
  return getDeckWords(deckId).length;
}
