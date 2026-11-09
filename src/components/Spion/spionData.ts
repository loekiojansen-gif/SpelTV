export interface SpionPack {
  id: string;
  name: string;
  emoji: string;
  words: string[];
}

export const SPION_PACKS: SpionPack[] = [
  {
    id: 'locaties',
    name: 'Locaties',
    emoji: '📍',
    words: [
      'Supermarkt', 'Vliegveld', 'Strand', 'Bioscoop', 'Ziekenhuis', 'School', 'Camping', 'Kermis',
      'Zwembad', 'Bibliotheek', 'Tandarts', 'Voetbalstadion', 'Kroeg', 'Sportschool', 'Treinstation', 'Dierentuin',
      'Casino', 'Pretpark', 'Kapper', 'Tankstation', 'Museum', 'Skipiste', 'Bouwmarkt', 'Kerk',
    ],
  },
  {
    id: 'eten',
    name: 'Eten & Drinken',
    emoji: '🍟',
    words: [
      'Frikandel speciaal', 'Stroopwafel', 'Bitterballen', 'Pizza', 'Sushi', 'Kapsalon', 'Hagelslag', 'Erwtensoep',
      'Pannenkoek', 'Kroket', 'Tosti', 'Stamppot', 'Poffertjes', 'Drop', 'Haring', 'Oliebol',
      'Patat', 'Kaasfondue', 'Tompouce', 'Barbecue', 'Hamburger', 'Spaghetti', 'IJsje', 'Appeltaart',
    ],
  },
  {
    id: 'feest',
    name: 'Feest & Uitgaan',
    emoji: '🎉',
    words: [
      'Carnaval', 'Koningsdag', 'Oud en Nieuw', 'Vrijgezellenfeest', 'Karaoke', 'Silent disco', 'Bierpong', 'Après-ski',
      'Festival', 'Huisfeest', 'Kroegentocht', 'Pubquiz', 'Sinterklaasavond', 'Bruiloft', 'Afterparty', 'Verkleedfeest',
      'Kerstdiner', 'Verjaardag', 'Schuimparty', 'Kampvuur', 'Bedrijfsborrel', 'Diploma-uitreiking', 'Babyshower', 'Nieuwjaarsduik',
    ],
  },
  {
    id: 'beroepen',
    name: 'Beroepen',
    emoji: '👷',
    words: [
      'Tandarts', 'Piloot', 'Barman', 'Brandweerman', 'Kapper', 'Boer', 'Politieagent', 'DJ',
      'Chirurg', 'Leraar', 'Kok', 'Loodgieter', 'Postbode', 'Scheidsrechter', 'Vuilnisman', 'Dierenarts',
      'Advocaat', 'Buschauffeur', 'Timmerman', 'Influencer', 'Badmeester', 'Goochelaar', 'Astronaut', 'Clown',
    ],
  },
  {
    id: 'vakantie',
    name: 'Vakantie',
    emoji: '✈️',
    words: [
      'Cruiseschip', 'Wintersport', 'Caravan', 'All-inclusive resort', 'Stedentrip', 'Safari', 'Backpacken', 'Douane',
      'Hostel', 'Wadlopen', 'Vakantiepark', 'Nachttrein', 'Huurauto', 'Woestijn', 'Tropisch eiland', 'Berghut',
      'Efteling', 'Waddeneiland', 'Autosnelweg', 'Veerboot', 'Souvenirwinkel', 'Zwembad met glijbaan', 'Camperplaats', 'Skilift',
    ],
  },
  {
    id: 'sport',
    name: 'Sport & Spel',
    emoji: '⚽',
    words: [
      'Voetbal', 'Schaatsen', 'Darten', 'Hockey', 'Tennis', 'Wielrennen', 'Zwemmen', 'Boksen',
      'Golf', 'Bowlen', 'Formule 1', 'Korfbal', 'Padel', 'Volleybal', 'Paardrijden', 'Skiën',
      'Schaken', 'Poker', 'Tafeltennis', 'Marathon', 'Judo', 'Surfen', 'Biljart', 'Elfstedentocht',
    ],
  },
];

export function getSpionPack(packId: string): SpionPack {
  return SPION_PACKS.find(p => p.id === packId) ?? SPION_PACKS[0];
}
