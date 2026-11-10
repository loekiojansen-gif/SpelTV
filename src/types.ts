export interface PubItem {
  id: string;
  name: string;
  location?: string;
}

export interface DrinkItem {
  id: string;
  name: string;
  category?: string;
}

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  type?: 'challenge' | 'punishment'; // uitdaging of straf
}

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  playerNames: string[];
  color: string;
}

export interface Round {
  roundNumber: number;
  pubId: string;
  drinkId: string;
  challengeId: string;
  scores: Record<string, number>; // teamId -> score (slokken/strafpunten, kan ook negatief zijn!)
  timestamp: number;
  notes?: string;
}

export interface CourseTemplate {
  id: string;
  name: string;
  city?: string;
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
  createdAt: number;
  isCustom?: boolean;
}

export interface HistoricalGame {
  id: string;
  finishedAt: number;
  startedAt?: number;
  holesCount: number;
  teams: Team[];
  rounds: Round[];
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
  winningTeamName: string;
  winningScore: number;
}

export type GameView = 'home' | 'team-setup' | 'active-game' | 'post-game';

export type SubAppId = 'HUB' | 'PUB_GOLF' | 'CHWAZI' | 'DICE' | 'SCORE_KEEPER' | 'RNG' | 'WHEEL' | 'SLABAKKEN' | 'TEAM_MAKER' | 'TOURNAMENT' | 'CROCODILE' | 'BOMB' | 'CAMEL_RACE' | 'CARD_CATALOG' | 'BOER_ZOEKT_VROUW' | 'MII_MAKER' | 'THIRTY_SECONDS' | 'WIE_IS' | 'UNDERCOVER' | 'OP_JE_KOP' | 'SNELSTE_VINGER' | 'HOGER_LAGER' | 'NOOIT';

export type MiiHeadShape = 'round' | 'oval' | 'square' | 'triangle' | 'wide' | 'heart';
export type MiiHairStyle =
  | 'short'
  | 'spiky'
  | 'parted'
  | 'curly'
  | 'long'
  | 'bald'
  | 'bob'
  | 'afro'
  | 'ponytail'
  | 'buzzcut'
  | 'undercut'
  | 'dreadlocks'
  | 'braids'
  | 'bun'
  | 'wavy'
  | 'side_fringe'
  | 'middle_part';

export type MiiFacialHair =
  | 'none'
  | 'mustache'
  | 'beard'
  | 'goatee'
  | 'stubble'
  | 'handlebar'
  | 'chinstrap'
  | 'soul_patch'
  | 'walrus';

export type MiiHeadwear =
  | 'none'
  | 'cap'
  | 'beanie'
  | 'party_hat'
  | 'crown'
  | 'cowboy'
  | 'bandana'
  | 'beret'
  | 'chef';

export type MiiMoleStyle =
  | 'none'
  | 'mole_cheek'
  | 'mole_chin'
  | 'freckles'
  | 'mole_lip'
  | 'scar';

export interface MiiAvatar {
  id: string;
  name: string;
  gender?: 'm' | 'f' | 'other';
  skinColor: string;
  headShape?: MiiHeadShape;
  headScaleX?: number;
  headScaleY?: number;
  hairStyle: MiiHairStyle;
  hairColor: string;
  hairScale?: number;
  hairScaleX?: number;
  hairScaleY?: number;
  hairOffsetX?: number;
  hairOffsetY?: number;
  eyeStyle: 'normal' | 'happy' | 'wink' | 'round' | 'cool' | 'dots';
  eyeColor: string;
  eyeScale?: number;
  eyeScaleX?: number;
  eyeScaleY?: number;
  eyeOffsetX?: number;
  eyeOffsetY?: number;
  eyebrowStyle: 'normal' | 'thick' | 'arched' | 'flat';
  mouthStyle: 'smile' | 'big_smile' | 'teeth' | 'smirk' | 'neutral' | 'o';
  mouthScale?: number;
  mouthScaleX?: number;
  mouthScaleY?: number;
  mouthOffsetX?: number;
  mouthOffsetY?: number;
  noseStyle?: 'classic' | 'button' | 'triangle' | 'pointed' | 'round' | 'dots';
  noseScale?: number;
  noseScaleX?: number;
  noseScaleY?: number;
  noseOffsetX?: number;
  noseOffsetY?: number;
  earStyle?: 'normal' | 'small' | 'large' | 'pointed' | 'round' | 'none';
  earScale?: number;
  earScaleX?: number;
  earScaleY?: number;
  facialHair?: MiiFacialHair;
  facialHairColor?: string;
  facialHairScaleX?: number;
  facialHairScaleY?: number;
  facialHairOffsetX?: number;
  facialHairOffsetY?: number;
  glasses?: 'none' | 'round' | 'square' | 'sunglasses';
  headwear?: MiiHeadwear;
  headwearColor?: string;
  headwearScaleX?: number;
  headwearScaleY?: number;
  headwearOffsetX?: number;
  headwearOffsetY?: number;
  moleStyle?: MiiMoleStyle;
  moleScale?: number;
  moleOffsetX?: number;
  moleOffsetY?: number;
  blush?: boolean;
  favoriteColor: string;
  createdAt: number;
}

export interface ScoreKeeperPlayer {
  id: string;
  name: string;
  score: number;
  color: string;
  history: number[];
}

export interface ScoreKeeperRoundEntry {
  roundNumber: number;
  deltas: Record<string, number>;
  timestamp: number;
  note?: string;
}

export interface WheelSlice {
  id: string;
  text: string;
  color: string;
}

export interface GameState {
  view: GameView;
  isGameActive: boolean;
  isGameFinished: boolean;
  isPermanentlyFinished?: boolean;
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
  players: Player[];
  teams: Team[];
  currentRoundNumber: number;
  rounds: Round[];
  startedAt?: number;
  finishedAt?: number;
  templates?: CourseTemplate[];
  history?: HistoricalGame[];
}

