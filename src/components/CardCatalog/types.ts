export type GameCategory = 'all' | 'kaarten' | 'dobbelstenen' | 'muziek' | 'party' | 'custom';

export interface CardMeaning {
  key: string; // e.g. "2", "J", "31", "Schoppen 3"
  action: string; // e.g. "Drinken", "Quizmaster"
  description?: string;
  badgeColor?: string;
}

export interface CardGame {
  id: string;
  title: string;
  subtitle: string;
  category: 'kaarten' | 'dobbelstenen' | 'muziek' | 'party';
  required: string[];
  players: string; // e.g. "3 - 10 spelers"
  intensity: number; // 1 to 5 (biertjes schaal)
  durationMinutes?: string; // e.g. "15 - 30 min"
  description: string;
  rulesSteps?: { title: string; content: string }[];
  cardMeanings?: CardMeaning[];
  musicNeeded?: string[];
  tips?: string[];
  coverColor: 'burgundy' | 'emerald' | 'sapphire' | 'amber' | 'amethyst' | 'espresso' | 'crimson';
  iconEmoji: string;
  isCustom?: boolean;
  createdAt?: number;
}
