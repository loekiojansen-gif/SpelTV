import { PubItem, DrinkItem, ChallengeItem, GameState, CourseTemplate, HistoricalGame } from '../types';

export const STORAGE_KEY = 'pub_golf_pro_save_v2_nl';
export const STORAGE_KEY_TEMPLATES = 'pub_golf_pro_templates_v1';
export const STORAGE_KEY_HISTORY = 'pub_golf_pro_history_v1';

export const EINDHOVEN_PUBS: PubItem[] = [
  { id: 'p-ehv-spijker', name: 'Spijker', location: 'Stratumseind' },
  { id: 'p-ehv-thomas', name: 'Thomas', location: 'Stratumseind' },
  { id: 'p-ehv-costa', name: 'Costa', location: 'Stratumseind' },
  { id: 'p-ehv-villa', name: 'Villa', location: 'Stratumseind' },
  { id: 'p-ehv-fat-one', name: 'Fat one', location: 'Stratumseind' },
  { id: 'p-ehv-trace', name: 'Tracé', location: 'Stratumseind' },
  { id: 'p-ehv-shots', name: 'Shots', location: 'Stratumseind' },
  { id: 'p-ehv-tipsy-duck', name: 'Tipsy duck', location: 'Stratumseind' },
  { id: 'p-ehv-borrelbar', name: 'Borrelbar', location: 'Stratumseind' },
  { id: 'p-ehv-lempke', name: 'Lempke', location: 'Stratumseind' },
  { id: 'p-ehv-peppers', name: 'Peppers', location: 'Stratumseind' },
  { id: 'p-ehv-miller', name: 'Miller', location: 'Stratumseind' },
  { id: 'p-ehv-the-jack', name: 'The Jack', location: 'Stratumseind' },
  { id: 'p-ehv-singing-goat', name: 'Singing goat', location: 'Stratumseind' },
  { id: 'p-ehv-witte-gijt', name: 'Witte gijt', location: 'Stratumseind' },
  { id: 'p-ehv-altstadt', name: 'Altstadt', location: 'Stratumseind' },
  { id: 'p-ehv-club-blush', name: 'Club blush', location: 'Stratumseind' },
  { id: 'p-ehv-kix', name: 'Kix', location: 'Stratumseind' },
  { id: 'p-ehv-eighty-one', name: 'Eighty one', location: 'Stratumseind' },
  { id: 'p-ehv-feestfabriek', name: 'Feestfabriek', location: 'Stratumseind' },
  { id: 'p-ehv-belgisch-biercafe', name: 'Belgisch biercafe', location: 'Stratumseind' },
  { id: 'p-ehv-dugout', name: 'Dugout', location: 'Stratumseind' },
  { id: 'p-ehv-ameezing', name: 'Ameezing', location: 'Stratumseind' },
  { id: 'p-ehv-barkeet', name: 'Barkeet', location: 'Stratumseind' },
  { id: 'p-ehv-rgb', name: 'RGB', location: 'Stratumseind' },
];

export const EINDHOVEN_DRINKS: DrinkItem[] = [
  { id: 'd-ehv-bier', name: 'Bier', category: 'Bier' },
  { id: 'd-ehv-wit', name: 'Wit', category: 'Speciaalbier' },
  { id: 'd-ehv-blond', name: 'Blond', category: 'Speciaalbier' },
  { id: 'd-ehv-triple', name: 'Triple', category: 'Speciaalbier' },
  { id: 'd-ehv-guinness', name: 'Guinness', category: 'Bier' },
  { id: 'd-ehv-rosebier', name: 'Rosebier', category: 'Bier' },
  { id: 'd-ehv-witte-wijn', name: 'Witte Wijn', category: 'Wijn' },
  { id: 'd-ehv-rode-wijn', name: 'Rode wijn', category: 'Wijn' },
  { id: 'd-ehv-rose', name: 'Rose', category: 'Wijn' },
  { id: 'd-ehv-cava', name: 'Cava', category: 'Bubbels' },
  { id: 'd-ehv-wodka-redbull', name: 'Wodka redbull', category: 'Mix' },
  { id: 'd-ehv-baco', name: 'Baco', category: 'Mix' },
  { id: 'd-ehv-jagerbom', name: 'Jagerbom', category: 'Shot' },
  { id: 'd-ehv-cocktail', name: 'Cocktail', category: 'Cocktail' },
  { id: 'd-ehv-stelz', name: 'Stelz', category: 'Hard Seltzer' },
  { id: 'd-ehv-barman-bepaalt', name: 'Barman bepaalt', category: 'Verrassing' },
];

export const EINDHOVEN_CHALLENGES: ChallengeItem[] = [
  {
    id: 'c-ehv-1',
    title: 'Random nummer bij shots',
    description: 'Kies een random nummer bij de shotsbar en drink het shotje op.',
  },
  {
    id: 'c-ehv-2',
    title: 'Steen papier schaar',
    description: 'Steen papier schaar: winnaar van duo drinkt.',
  },
  {
    id: 'c-ehv-3',
    title: 'De barman bepaalt',
    description: 'De barman bepaalt per duo een drankje.',
  },
  {
    id: 'c-ehv-4',
    title: 'Split the g',
    description: 'Split je hem (0 slagen) faal je (minimaal 2 slagen) of in een keer.',
  },
  {
    id: 'c-ehv-5',
    title: 'Maatje schenkt in',
    description: 'Je maatje schenkt het drankje in je mond.',
  },
  {
    id: 'c-ehv-6',
    title: 'Snelste adtje',
    description: 'Snelste adtje: snelste 1 slok, 2de 2 slokken etc.',
  },
  {
    id: 'c-ehv-7',
    title: 'Drink geblinddoekt',
    description: 'Drink geblinddoekt/ogen dicht.',
  },
  {
    id: 'c-ehv-8',
    title: 'Wodka of Water',
    description: 'Een iemand krijgt wodka de teamgenoot water, de rest moet raden wie de wodka had, wordt dit goed geraden extra slok/strafpunt voor het duo.',
  },
  {
    id: 'c-ehv-9',
    title: 'Adtje met ijsblokje',
    description: 'Adtje met ijsblokje in je mond.',
  },
  {
    id: 'c-ehv-10',
    title: 'Bieden op shots',
    description: 'Bieden, hoogste bod aan shots mag 3 strafslokken uitdelen.',
  },
  {
    id: 'c-ehv-11',
    title: 'Vingeren',
    description: 'Vingeren: evenveel rondes als teams.',
  },
  {
    id: 'c-ehv-12',
    title: 'Water adten of biertje drinken',
    description: 'Je mag deze ronde water adten of nog een biertje drinken en twee strafslokken uitdelen. Slagen tellen gewoon (ook bij water).',
  },
];

// Eindhoven Stratumseind is de standaardroute van Pub Golf Pro
export const DEFAULT_PUBS: PubItem[] = EINDHOVEN_PUBS;
export const DEFAULT_DRINKS: DrinkItem[] = EINDHOVEN_DRINKS;
export const DEFAULT_CHALLENGES: ChallengeItem[] = EINDHOVEN_CHALLENGES;

export const DEFAULT_TEMPLATES: CourseTemplate[] = [
  {
    id: 'tpl-eindhoven',
    name: 'Eindhoven Stratumseind',
    city: 'Eindhoven',
    createdAt: Date.now() - 3600000 * 24 * 1,
    pubs: EINDHOVEN_PUBS,
    drinks: EINDHOVEN_DRINKS,
    challenges: EINDHOVEN_CHALLENGES,
  },
  {
    id: 'tpl-amsterdam',
    name: 'Amsterdam Centrum',
    city: 'Amsterdam',
    createdAt: Date.now() - 3600000 * 24 * 5,
    pubs: [
      { id: 'p-ams-1', name: "Café De Dokter", location: "Rozenboomsteeg" },
      { id: 'p-ams-2', name: "Café 't Smalle", location: "Egelantiersgracht" },
      { id: 'p-ams-3', name: "De Drie Fleschjes", location: "Gravenstraat" },
      { id: 'p-ams-4', name: "Café Gollem", location: "Raamsteeg" },
      { id: 'p-ams-5', name: "Bierbrouwerij 't IJ", location: "Funenkade" },
      { id: 'p-ams-6', name: "Café Brandon", location: "Keizersgracht" },
    ],
    drinks: [
      { id: 'd-ams-1', name: "Vaasje Heineken / Amstel", category: "Bier" },
      { id: 'd-ams-2', name: "Kopstootje (Jonge Jenever)", category: "Shot" },
      { id: 'd-ams-3', name: "IJwit van 't IJ", category: "Speciaalbier" },
      { id: 'd-ams-4', name: "Salmari Shot", category: "Shot" },
      { id: 'd-ams-5', name: "Amsterdams Blondje", category: "Speciaalbier" },
    ],
    challenges: [
      { id: 'c-ams-1', title: "Zing een André Hazes klassieker", description: "Zing luidkeels 'Zij Gelooft In Mij' met heel het café mee (-1 bonus).", type: 'challenge' },
      { id: 'c-ams-2', title: "Geef een fietser voorrang / High-five", description: "Groet een passerende fietser met volle overtuiging.", type: 'challenge' },
      { id: 'c-ams-3', title: "Kopstootje Adje", description: "Bier en jenever tegelijk achterover (+1 straf of -1 bij meesterschap).", type: 'punishment' },
    ]
  },
  {
    id: 'tpl-utrecht',
    name: 'Utrecht Oudegracht',
    city: 'Utrecht',
    createdAt: Date.now() - 3600000 * 24 * 3,
    pubs: [
      { id: 'p-utr-1', name: "Café België", location: "Oudegracht" },
      { id: 'p-utr-2', name: "De Drie Dorstige Herten", location: "Lange Nieuwstraat" },
      { id: 'p-utr-3', name: "Café Olivier", location: "Achter Clarenburg" },
      { id: 'p-utr-4', name: "Het Oude Pothuys", location: "Oudegracht a/d Werf" },
      { id: 'p-utr-5', name: "De Zaak", location: "Korte Minrebroederstraat" },
    ],
    drinks: [
      { id: 'd-utr-1', name: "Dommelsch / Gulpener Fluitje", category: "Bier" },
      { id: 'd-utr-2', name: "Oproer Craft Beer", category: "Speciaalbier" },
      { id: 'd-utr-3', name: "Tequila Reposado", category: "Shot" },
      { id: 'd-utr-4', name: "De Moersleutel Stout", category: "Speciaalbier" },
    ],
    challenges: [
      { id: 'c-utr-1', title: "Domtoren Stand", description: "Sta op 1 been tijdens het drinken van je eerste slok (-1 bonus).", type: 'challenge' },
      { id: 'c-utr-2', title: "Werfkelders Whispers", description: "Fluister alleen maar in echo-stem zolang je aan de werf bent.", type: 'challenge' },
    ]
  }
];

export const INITIAL_GAME_STATE: GameState = {
  view: 'home',
  isGameActive: false,
  isGameFinished: false,
  pubs: DEFAULT_PUBS,
  drinks: DEFAULT_DRINKS,
  challenges: DEFAULT_CHALLENGES,
  players: [
    { id: 'p1', name: 'Daan' },
    { id: 'p2', name: 'Thomas' },
    { id: 'p3', name: 'Lars' },
    { id: 'p4', name: 'Sophie' },
    { id: 'p5', name: 'Bram' },
    { id: 'p6', name: 'Emma' },
  ],
  teams: [],
  currentRoundNumber: 1,
  rounds: [],
};

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_GAME_STATE;
    const parsed = JSON.parse(raw);

    // Migrate legacy generic mock pubs (Café De Gouden Bal) to the standard Eindhoven Stratumseind route
    const hasLegacyPubs =
      Array.isArray(parsed.pubs) &&
      parsed.pubs.some((p: PubItem) => p.id === 'pub-1' && p.name === 'Café De Gouden Bal');

    return {
      ...INITIAL_GAME_STATE,
      ...parsed,
      isPermanentlyFinished: Boolean(parsed.isPermanentlyFinished),
      pubs: hasLegacyPubs || !Array.isArray(parsed.pubs) || parsed.pubs.length === 0 ? EINDHOVEN_PUBS : parsed.pubs,
      drinks: hasLegacyPubs || !Array.isArray(parsed.drinks) || parsed.drinks.length === 0 ? EINDHOVEN_DRINKS : parsed.drinks,
      challenges: hasLegacyPubs || !Array.isArray(parsed.challenges) || parsed.challenges.length === 0 ? EINDHOVEN_CHALLENGES : parsed.challenges,
      players:
        Array.isArray(parsed.players) && parsed.players.length > 0
          ? parsed.players
          : loadRememberedPlayers().length > 0
          ? loadRememberedPlayers().map((name, i) => ({ id: `p-rem-${i}`, name }))
          : INITIAL_GAME_STATE.players,
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
      rounds: Array.isArray(parsed.rounds) ? parsed.rounds : [],
    };
  } catch (err) {
    console.error('Fout bij het laden van Pub Golf state uit localStorage:', err);
    return INITIAL_GAME_STATE;
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Fout bij het opslaan van Pub Golf state in localStorage:', err);
  }
}

export function clearGameProgress(prevState: GameState): GameState {
  const reset: GameState = {
    ...prevState,
    view: 'home',
    isGameActive: false,
    isGameFinished: false,
    isPermanentlyFinished: false,
    teams: [],
    currentRoundNumber: 1,
    rounds: [],
    startedAt: undefined,
    finishedAt: undefined,
  };
  saveGameState(reset);
  return reset;
}

// -------------------------------------------------------------
// Templates Management
// -------------------------------------------------------------
export function loadTemplates(): CourseTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!raw) {
      // Seed default templates
      saveTemplates(DEFAULT_TEMPLATES);
      return DEFAULT_TEMPLATES;
    }
    const parsed: CourseTemplate[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveTemplates(DEFAULT_TEMPLATES);
      return DEFAULT_TEMPLATES;
    }

    // Always keep standard Eindhoven Stratumseind template updated with the exact official options
    const hasEindhoven = parsed.some(t => t.id === 'tpl-eindhoven');
    const updated = parsed.map(tpl => {
      if (tpl.id === 'tpl-eindhoven') {
        return {
          ...tpl,
          name: 'Eindhoven Stratumseind',
          city: 'Eindhoven',
          pubs: EINDHOVEN_PUBS,
          drinks: EINDHOVEN_DRINKS,
          challenges: EINDHOVEN_CHALLENGES,
        };
      }
      return tpl;
    });

    if (!hasEindhoven) {
      const ehvTpl = DEFAULT_TEMPLATES.find(t => t.id === 'tpl-eindhoven')!;
      updated.unshift(ehvTpl);
    }

    saveTemplates(updated);
    return updated;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplates(templates: CourseTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  } catch (err) {
    console.error('Fout bij het opslaan van templates:', err);
  }
}

// -------------------------------------------------------------
// History Management
// -------------------------------------------------------------
export function loadGameHistory(): HistoricalGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGameToHistory(game: HistoricalGame): void {
  try {
    const current = loadGameHistory();
    // Prepend most recent
    const updated = [game, ...current.filter(g => g.id !== game.id)];
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Fout bij het opslaan van toernooigeschiedenis:', err);
  }
}

export function deleteGameFromHistory(id: string): HistoricalGame[] {
  try {
    const current = loadGameHistory();
    const updated = current.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (err) {
    console.error('Fout bij het legen van geschiedenis:', err);
  }
}

// -------------------------------------------------------------
// Remembered Player Names
// -------------------------------------------------------------
export const STORAGE_KEY_REMEMBERED_PLAYERS = 'pub_golf_remembered_player_names';

export function loadRememberedPlayers(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMEMBERED_PLAYERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((n) => typeof n === 'string' && n.trim().length > 0);
    }
  } catch (err) {
    console.error('Fout bij het laden van onthouden spelers:', err);
  }
  return [];
}

export function saveRememberedPlayers(names: string[]): void {
  try {
    const existing = loadRememberedPlayers();
    const set = new Set(existing);
    names.forEach((name) => {
      const trimmed = name.trim();
      if (trimmed) set.add(trimmed);
    });
    localStorage.setItem(STORAGE_KEY_REMEMBERED_PLAYERS, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Fout bij het opslaan van onthouden spelers:', err);
  }
}

// -------------------------------------------------------------
// Wii Mii Avatars Storage & Management
// -------------------------------------------------------------
import { MiiAvatar } from '../types';

export const STORAGE_KEY_MII_AVATARS = 'wii_party_mii_avatars_v1';

export const DEFAULT_MII_AVATARS: MiiAvatar[] = [
  {
    id: 'mii-tom',
    name: 'Tom',
    gender: 'm',
    skinColor: '#fed7aa',
    hairStyle: 'spiky',
    hairColor: '#78350f',
    eyeStyle: 'normal',
    eyeColor: '#0369a1',
    eyebrowStyle: 'normal',
    mouthStyle: 'smile',
    facialHair: 'none',
    glasses: 'none',
    blush: false,
    favoriteColor: '#3b82f6',
    createdAt: 1700000000000,
  },
  {
    id: 'mii-lisa',
    name: 'Lisa',
    gender: 'f',
    skinColor: '#fde68a',
    hairStyle: 'ponytail',
    hairColor: '#d97706',
    eyeStyle: 'happy',
    eyeColor: '#15803d',
    eyebrowStyle: 'arched',
    mouthStyle: 'big_smile',
    facialHair: 'none',
    glasses: 'round',
    blush: true,
    favoriteColor: '#ec4899',
    createdAt: 1700000001000,
  },
  {
    id: 'mii-bas',
    name: 'Bas',
    gender: 'm',
    skinColor: '#fcd34d',
    hairStyle: 'short',
    hairColor: '#1e1b4b',
    eyeStyle: 'cool',
    eyeColor: '#1e293b',
    eyebrowStyle: 'thick',
    mouthStyle: 'smirk',
    facialHair: 'beard',
    glasses: 'square',
    blush: false,
    favoriteColor: '#10b981',
    createdAt: 1700000002000,
  },
  {
    id: 'mii-sophie',
    name: 'Sophie',
    gender: 'f',
    skinColor: '#fed7aa',
    hairStyle: 'curly',
    hairColor: '#9a3412',
    eyeStyle: 'wink',
    eyeColor: '#78350f',
    eyebrowStyle: 'normal',
    mouthStyle: 'teeth',
    facialHair: 'none',
    glasses: 'none',
    blush: true,
    favoriteColor: '#f59e0b',
    createdAt: 1700000003000,
  },
];

export function loadMiiAvatars(): MiiAvatar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MII_AVATARS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MII_AVATARS, JSON.stringify(DEFAULT_MII_AVATARS));
      return DEFAULT_MII_AVATARS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_MII_AVATARS;
  } catch (err) {
    console.error('Fout bij het laden van Mii avatars:', err);
    return DEFAULT_MII_AVATARS;
  }
}

export function saveMiiAvatars(avatars: MiiAvatar[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MII_AVATARS, JSON.stringify(avatars));
    // Also sync names to remembered players
    saveRememberedPlayers(avatars.map(a => a.name));
  } catch (err) {
    console.error('Fout bij het opslaan van Mii avatars:', err);
  }
}

export function addMiiAvatar(avatar: MiiAvatar): MiiAvatar[] {
  const current = loadMiiAvatars();
  const existingIdx = current.findIndex(a => a.id === avatar.id);
  let updated: MiiAvatar[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = avatar;
  } else {
    updated = [avatar, ...current];
  }
  saveMiiAvatars(updated);
  return updated;
}

export function deleteMiiAvatar(id: string): MiiAvatar[] {
  const current = loadMiiAvatars();
  const updated = current.filter(a => a.id !== id);
  saveMiiAvatars(updated);
  return updated;
}
