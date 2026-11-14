import { SubAppId } from '../../types';

export interface ChannelMeta {
  /** Soort kanaal, getoond als label in de voorvertoning */
  kind: string;
  /** Aantal spelers, bijvoorbeeld "3–10" */
  players: string;
  /** Hoe lang een potje ongeveer duurt */
  duration: string;
  /** Accentkleur van de voorvertoning */
  accent: string;
  /** Wat je nodig hebt naast je telefoon */
  needs?: string;
}

export const CHANNEL_META: Partial<Record<SubAppId, ChannelMeta>> = {
  PUB_GOLF: { kind: 'Kroegentocht', players: '2+', duration: 'Hele avond', accent: '#16a34a', needs: 'Kroegen' },
  CHWAZI: { kind: 'Loting', players: '2–10', duration: '10 sec', accent: '#4f46e5' },
  DICE: { kind: 'Hulpmiddel', players: '1+', duration: 'Vrij', accent: '#ea580c' },
  SCORE_KEEPER: { kind: 'Hulpmiddel', players: '2+', duration: 'Vrij', accent: '#d97706' },
  WHEEL: { kind: 'Loting', players: '1+', duration: '1 min', accent: '#2563eb' },
  SLABAKKEN: { kind: 'Teamspel', players: '4+', duration: '30–45 min', accent: '#059669' },
  TEAM_MAKER: { kind: 'Hulpmiddel', players: '4+', duration: '1 min', accent: '#7c3aed' },
  TOURNAMENT: { kind: 'Toernooi', players: '4+', duration: 'Hele avond', accent: '#ea580c' },
  CROCODILE: { kind: 'Geluksspel', players: '2+', duration: '2 min', accent: '#16a34a' },
  BOMB: { kind: 'Doorgeefspel', players: '3+', duration: '5–10 min', accent: '#dc2626' },
  CAMEL_RACE: { kind: 'Gokspel', players: '2+', duration: '5 min', accent: '#d97706' },
  CARD_CATALOG: { kind: 'Naslagwerk', players: '2+', duration: 'Vrij', accent: '#a16207', needs: 'Speelkaarten' },
  BOER_ZOEKT_VROUW: { kind: 'Drankspel', players: '3+', duration: '10–20 min', accent: '#65a30d' },
  MII_MAKER: { kind: 'Spelers', players: 'Iedereen', duration: 'Vrij', accent: '#0ea5e9' },
  THIRTY_SECONDS: { kind: 'Teamspel', players: '4+', duration: '20–40 min', accent: '#2563eb' },
  WIE_IS: { kind: 'Doorgeefspel', players: '3+', duration: '5–10 min', accent: '#f59e0b' },
  UNDERCOVER: { kind: 'Bluffspel', players: '3+', duration: '10–20 min', accent: '#0891b2' },
  OP_JE_KOP: { kind: 'Raadspel', players: '2+', duration: '5–15 min', accent: '#c026d3' },
  SNELSTE_VINGER: { kind: 'Reactiespel', players: '2–4', duration: '2–5 min', accent: '#ca8a04' },
  HOGER_LAGER: { kind: 'Kaartspel', players: '2+', duration: '5–15 min', accent: '#be123c' },
  NOOIT: { kind: 'Drankspel', players: '3+', duration: '10–30 min', accent: '#0d9488' },
  GOUDMIJNEN: { kind: 'Drankspel', players: '2+', duration: '10–20 min', accent: '#d97706' },
  SPECTRUM: { kind: 'Teamspel', players: '2+', duration: '15–25 min', accent: '#0284c7' },
};
