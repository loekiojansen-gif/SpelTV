export interface SlabakkenCategory {
  id: string;
  name: string;
  emoji: string;
  placeholder: string;
  isCustom?: boolean;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  roundScores: [number, number, number]; // Round 1, 2, 3
}

export interface SlabakkenSlip {
  id: string;
  word: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  authorId: string;
  authorName: string;
}

export const DEFAULT_CATEGORY_PRESETS: SlabakkenCategory[] = [
  {
    id: 'bekend',
    name: 'Bekend Persoon',
    emoji: '⭐',
    placeholder: 'Bijv. Max Verstappen, Beyoncé, André Hazes...',
  },
  {
    id: 'dier',
    name: 'Dier',
    emoji: '🦁',
    placeholder: 'Bijv. Olifant, Kameel, Pinguïn, Golden retriever...',
  },
  {
    id: 'voorwerp',
    name: 'Voorwerp',
    emoji: '🔦',
    placeholder: 'Bijv. Kurkentrekker, Fietsbel, Wasknijper, Toverstaf...',
  },
  {
    id: 'eten_borrel',
    name: 'Eten, Drinken of Borrel',
    emoji: '🍻',
    placeholder: 'Bijv. Frikandel speciaal, Bierpong, Kater...',
  },
  {
    id: 'actie_situatie',
    name: 'Actie of Situatie',
    emoji: '🎭',
    placeholder: 'Bijv. Slaapwandelen, Striptease, Moonwalk...',
  },
  {
    id: 'media_film',
    name: 'Film, Serie of Muziek',
    emoji: '🎬',
    placeholder: 'Bijv. Titanic, Wie is de Mol, Bohemian Rhapsody...',
  },
  {
    id: 'vakantie_locatie',
    name: 'Plaats of Bestemming',
    emoji: '🏖️',
    placeholder: 'Bijv. Chersonissos, Texel, IKEA ballenbak...',
  },
];
