import React from 'react';
import { SubAppId } from '../../types';
import { Hourglass } from 'lucide-react';
import { MiiFace } from '../MiiMaker/MiiFace';
import { NoiseVisual } from './NoiseChannel';
import {
  OpJeKopVisual,
  SnelsteVingerVisual,
  HogerLagerVisual,
  NooitVisual,
  GoudmijnenVisual,
  SpectrumVisual,
} from './NewChannelVisuals';

export const DEFAULT_CHANNEL_ORDER: string[] = [
  // Page 1 (0 - 11): Spelers, tools, rad, dobbel/vingeren, krokodil en gok/kaartspellen
  'MII_MAKER',
  'SCORE_KEEPER',
  'CARD_CATALOG',
  'TEAM_MAKER',
  'TOURNAMENT',
  'WHEEL',
  'CHWAZI',
  'DICE',
  'CROCODILE',
  'HOGER_LAGER',
  'BOER_ZOEKT_VROUW',
  'CAMEL_RACE',
  // Page 2 (12 - 23): Reactie-, woord- & uitgebreide gezelschapsspellen, met Pub Golf als afsluiter
  'SNELSTE_VINGER',
  'BOMB',
  'NOOIT',
  'OP_JE_KOP',
  'UNDERCOVER',
  'WIE_IS',
  'THIRTY_SECONDS',
  'SLABAKKEN',
  'GOUDMIJNEN',
  'SPECTRUM',
  'PUB_GOLF',
  'NOISE_24',
];

const GAME_CHANNEL_IDS = DEFAULT_CHANNEL_ORDER.filter(id => !id.startsWith('NOISE_'));
const CHANNEL_ORDER_KEY = 'party_channels_custom_order_v4';

/**
 * Laadt de zelf ingedeelde kanaalvolgorde.
 * Kanalen die er sinds de vorige versie bij zijn gekomen schuiven automatisch
 * in de eerste lege "Binnenkort" plek, zodat een eigen indeling bewaard blijft.
 */
export function loadChannelOrder(): string[] {
  try {
    const saved = localStorage.getItem(CHANNEL_ORDER_KEY);
    if (!saved) return DEFAULT_CHANNEL_ORDER;

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_CHANNEL_ORDER.length) {
      return DEFAULT_CHANNEL_ORDER;
    }

    const rawOrder = parsed as string[];
    // Converteer eventueel bewaarde 'SPION' naar een lege 'NOISE_22' tegel
    const order = rawOrder.map(id => (id === 'SPION' ? 'NOISE_22' : id));
    const isKnown = (id: unknown) =>
      typeof id === 'string' && (id.startsWith('NOISE_') || GAME_CHANNEL_IDS.includes(id));
    if (!order.every(isKnown) || new Set(order).size !== order.length) {
      return DEFAULT_CHANNEL_ORDER;
    }

    const next = [...order];
    for (const gameId of GAME_CHANNEL_IDS) {
      if (next.includes(gameId)) continue;
      const freeSlot = next.findIndex(id => id.startsWith('NOISE_'));
      if (freeSlot === -1) return DEFAULT_CHANNEL_ORDER;
      next[freeSlot] = gameId;
    }
    return next;
  } catch {
    return DEFAULT_CHANNEL_ORDER;
  }
}

export function saveChannelOrder(order: string[]): void {
  try {
    localStorage.setItem(CHANNEL_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Opslag niet beschikbaar
  }
}

export function clearChannelOrder(): void {
  try {
    localStorage.removeItem(CHANNEL_ORDER_KEY);
  } catch {
    // Opslag niet beschikbaar
  }
}

export function getChannelTitle(channelId: string): string {
  switch (channelId) {
    case 'PUB_GOLF':
      return 'Pub Golf';
    case 'CHWAZI':
      return 'Vingeren';
    case 'DICE':
      return 'Dobbelstenen';
    case 'SCORE_KEEPER':
      return 'Scorebord';
    case 'WHEEL':
      return 'Rad van Fortuin';
    case 'SLABAKKEN':
      return 'Slabakken';
    case 'TEAM_MAKER':
      return 'Team Maker';
    case 'TOURNAMENT':
      return 'Toernooi';
    case 'CROCODILE':
      return 'Krokodil';
    case 'BOMB':
      return 'Tikkende Bom';
    case 'CAMEL_RACE':
      return 'Kamelenrace';
    case 'CARD_CATALOG':
      return 'Bibliotheek';
    case 'BOER_ZOEKT_VROUW':
      return 'Boer zoekt Vrouw';
    case 'MII_MAKER':
      return 'Spelers';
    case 'THIRTY_SECONDS':
      return '30 Seconds';
    case 'WIE_IS':
      return 'Wie is?';
    case 'UNDERCOVER':
      return 'Undercover';
    case 'OP_JE_KOP':
      return 'Op je Kop';
    case 'SNELSTE_VINGER':
      return 'Snelste Vinger';
    case 'HOGER_LAGER':
      return 'Hoger of Lager';
    case 'NOOIT':
      return 'Ik heb nog nooit';
    case 'GOUDMIJNEN':
      return 'Goudmijnen';
    case 'SPECTRUM':
      return 'Spectrum';
    default:
      if (channelId.startsWith('NOISE_')) {
        return 'Binnenkort';
      }
      return channelId;
  }
}

export function isGameChannel(channelId: string): channelId is SubAppId {
  return GAME_CHANNEL_IDS.includes(channelId);
}

interface ChannelVisualProps {
  channelId: string;
  pubGolfActive?: boolean;
  slabakkenActive?: boolean;
  onTapNoise?: (channelNumber: string) => void;
}

export function ChannelVisual({
  channelId,
  pubGolfActive = false,
  slabakkenActive = false,
  onTapNoise,
}: ChannelVisualProps) {
  // Handle Noise Channels (returns pure div, no button)
  if (channelId.startsWith('NOISE_')) {
    const num = channelId.replace('NOISE_', '');
    return <NoiseVisual channelNumber={num} />;
  }

  // Visual contents for each game
  switch (channelId) {
    case 'PUB_GOLF':
      return (
        <div className="absolute inset-0 overflow-hidden flex flex-col justify-end">
          {/* Sunny Sky with Soft Cloud Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#60a5fa] via-[#93c5fd] to-[#dbeafe]">
            <div className="absolute top-2 left-3 w-8 h-2.5 rounded-full bg-white/75 blur-[0.5px]" />
            <div className="absolute top-3 right-3 w-11 h-3 rounded-full bg-white/70 blur-[0.5px]" />
          </div>

          {pubGolfActive && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-yellow-300 border border-white animate-pulse z-20" />
          )}

          {/* Lush Rolling Green Fairway Hills */}
          <div className="absolute bottom-0 inset-x-0 h-[58%] overflow-hidden">
            {/* Back Green Ridge */}
            <div className="absolute -bottom-2 -left-4 w-[125%] h-14 rounded-[100%] bg-gradient-to-t from-[#15803d] to-[#22c55e]" />
            {/* Foreground Undulating Fairway */}
            <div className="absolute -bottom-4 -left-2 w-[115%] h-13 rounded-[100%] bg-gradient-to-t from-[#14532d] via-[#16a34a] to-[#4ade80]" />

            {/* Hole / Round Cup on the LEFT */}
            <div className="absolute left-3 bottom-2 w-5 h-5 rounded-full bg-slate-900 border-2 border-emerald-950 shadow-inner z-5" />

            {/* Golf Ball: Smoothly putting from right to left into hole */}
            <div className="absolute left-5 bottom-2.5 z-8 animate-golf-putt-rtl">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>

          {/* Flagstick & Vibrant Red Triangular Flag on the LEFT */}
          <div className="absolute left-3.5 bottom-2.5 h-14 w-6 flex items-start z-15 pointer-events-none">
            <div className="w-0.5 h-full bg-gradient-to-b from-white via-slate-200 to-slate-400 shadow-xs" />
            <svg width="20" height="13" viewBox="0 0 20 13" className="drop-shadow-sm -ml-0.5 mt-2.5">
              <path d="M 1,1 L 18,6.5 L 1,12 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      );

    case 'CHWAZI':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1] via-[#4f46e5] to-[#312e81] flex items-center justify-center overflow-hidden">
          <div className="relative w-20 h-16 flex items-center justify-center">
            <div
              className="relative w-15 h-11 rounded-lg bg-slate-950 border-2 border-cyan-400/90 shadow-xl overflow-hidden flex items-center justify-center"
              style={{
                transform: 'perspective(220px) rotateX(42deg) rotateZ(-12deg) scale(0.95)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.6), inset 0 0 10px rgba(6,182,212,0.5)',
              }}
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:6px_6px]" />
              <div className="w-6 h-6 rounded-full border border-cyan-300 animate-ping opacity-80" />
              <div className="absolute w-10 h-10 rounded-full border border-fuchsia-400 animate-chwazi-pulse opacity-60" />
            </div>

            <div className="absolute -top-1.5 right-3.5 z-10 animate-chwazi-finger-tap">
              <span className="text-3xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] block">
                👇
              </span>
            </div>
          </div>
        </div>
      );

    case 'DICE':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#ea580c] via-[#c2410c] to-[#9a3412] flex items-center justify-center overflow-hidden">
          <div className="relative w-20 h-16 flex items-center justify-center gap-2">
            <div className="animate-dice-roll-a z-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-white via-slate-100 to-slate-200 border-1.5 border-white shadow-lg flex items-center justify-center p-1">
                <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full p-0.5 pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ml-auto" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-auto" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ml-auto mt-auto" />
                </div>
              </div>
            </div>

            <div className="animate-dice-roll-b z-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-white via-slate-100 to-slate-200 border-1.5 border-white shadow-lg flex items-center justify-center p-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'SCORE_KEEPER':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#b45309] flex items-center justify-center overflow-hidden">
          <div className="relative w-20 h-16 flex items-end justify-center pb-0.5 animate-channel-float">
            <svg viewBox="0 0 100 80" className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
              <path d="M 12 36 L 40 36 L 40 76 L 12 76 Z" fill="#94a3b8" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="12" y="36" width="28" height="5" fill="#cbd5e1" />
              <text x="26" y="60" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="sans-serif">2</text>

              <path d="M 36 22 L 64 22 L 64 76 L 36 76 Z" fill="#eab308" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="36" y="22" width="28" height="5" fill="#fef08a" />
              <text x="50" y="52" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="sans-serif">1</text>
              <text x="50" y="15" textAnchor="middle" fontSize="14">👑</text>

              <path d="M 60 46 L 88 46 L 88 76 L 60 76 Z" fill="#c2410c" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="60" y="46" width="28" height="5" fill="#fed7aa" />
              <text x="74" y="67" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="sans-serif">3</text>
            </svg>
          </div>
        </div>
      );

    case 'WHEEL':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6] via-[#1d4ed8] to-[#1e3a8a] flex items-center justify-center overflow-hidden">
          <div className="relative w-13 h-13 sm:w-16 sm:h-16 flex items-center justify-center">
            {/* Spinning Wheel */}
            <div className="w-full h-full animate-channel-wheel">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <path d="M 50,50 L 50,0 A 50,50 0 0,1 85.35,14.65 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 50,50 L 85.35,14.65 A 50,50 0 0,1 100,50 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 50,50 L 100,50 A 50,50 0 0,1 85.35,85.35 Z" fill="#84cc16" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 50,50 L 85.35,85.35 A 50,50 0 0,1 50,100 Z" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 50,50 L 50,100 A 50,50 0 0,1 14.65,85.35 Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 50,50 L 14.65,85.35 A 50,50 0 0,1 0,50 Z" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 50,50 L 0,50 A 50,50 0 0,1 14.65,14.65 Z" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 50,50 L 14.65,14.65 A 50,50 0 0,1 50,0 Z" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="48" fill="none" stroke="#fef08a" strokeWidth="3" />
                <circle cx="50" cy="50" r="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="50" cy="50" r="5" fill="#f59e0b" />
              </svg>
            </div>
            {/* Vast wijzertje dat exact aansluit op de buitenrand van het rad op elk schermformaat */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none filter drop-shadow-md">
              <svg width="14" height="13" viewBox="0 0 14 13">
                <polygon points="7,12 1,1 13,1" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      );

    case 'SLABAKKEN':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857] flex items-center justify-center overflow-hidden">
          {slabakkenActive && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-yellow-300 border border-white animate-pulse z-20" />
          )}
          <div className="relative w-20 h-16 flex items-center justify-center animate-channel-float">
            <div className="absolute -top-1 inset-x-0 h-6 flex items-center justify-center pointer-events-none z-10">
              <div className="w-3.5 h-2.5 bg-white border border-slate-300 rounded-2xs shadow-md -rotate-12 animate-pulse -mr-1" />
              <div className="w-4 h-3 bg-amber-100 border border-amber-300 rounded-2xs shadow-sm rotate-12 -mt-1.5" />
              <div className="w-3.5 h-2.5 bg-white border border-slate-300 rounded-2xs shadow-md -rotate-6 ml-0.5" />
            </div>
            <div className="text-4xl sm:text-5xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] mt-2">
              🥗
            </div>
          </div>
        </div>
      );

    case 'TEAM_MAKER':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#4f46e5] via-[#4338ca] to-[#312e81] flex items-center justify-center overflow-hidden">
          {/* Subtle Team Court & Dashed Midline */}
          <div className="absolute inset-x-2 bottom-2.5 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center pointer-events-none">
            <div className="h-full border-r border-dashed border-white/20" />
          </div>

          <div className="relative w-28 h-18 flex items-center justify-center select-none">
            {/* Team A (Red / Rose Group on Left) */}
            <div className="absolute left-2.5 bottom-3 flex items-end -space-x-1 z-10">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#fed7aa] border border-black/30 shadow-xs" />
                <div className="w-4 h-4.5 rounded-t-md bg-rose-500 border border-black/20 shadow-xs flex items-center justify-center text-[6px] font-black text-white">
                  A
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#fed7aa] border border-black/30 shadow-xs" />
                <div className="w-4.5 h-5 rounded-t-md bg-rose-600 border border-black/20 shadow-xs flex items-center justify-center text-[7px] font-black text-white">
                  A
                </div>
              </div>
            </div>

            {/* Team B (Blue / Sky Group on Right) */}
            <div className="absolute right-2.5 bottom-3 flex items-end -space-x-1 z-10">
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#fed7aa] border border-black/30 shadow-xs" />
                <div className="w-4.5 h-5 rounded-t-md bg-sky-600 border border-black/20 shadow-xs flex items-center justify-center text-[7px] font-black text-white">
                  B
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#fed7aa] border border-black/30 shadow-xs" />
                <div className="w-4 h-4.5 rounded-t-md bg-sky-500 border border-black/20 shadow-xs flex items-center justify-center text-[6px] font-black text-white">
                  B
                </div>
              </div>
            </div>

            {/* Walking Player Moving Between Teams */}
            <div className="absolute bottom-3 animate-team-walker z-20 pointer-events-none">
              <div className="flex flex-col items-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#fed7aa] border border-black/40" />
                <div className="w-4 h-5 rounded-t-md bg-gradient-to-b from-amber-300 to-amber-500 border border-black/30 shadow-sm flex items-center justify-center text-[7px] font-black text-slate-950">
                  {/* Bliksemschichtje verwijderd per gebruikersinstructie */}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'TOURNAMENT':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#f97316] via-[#ea580c] to-[#c2410c] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <svg viewBox="0 0 80 60" className="w-full h-full p-1 stroke-white fill-none" strokeWidth="2">
              <path d="M 10 15 L 25 15 L 25 25 L 40 25" />
              <path d="M 10 35 L 25 35 L 25 25" />
              <path d="M 70 15 L 55 15 L 55 25 L 40 25" />
              <path d="M 70 35 L 55 35 L 55 25" />
              <circle cx="40" cy="25" r="4" fill="#fef08a" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="relative flex items-center justify-center animate-channel-float z-10">
            <div className="text-4xl sm:text-5xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
              🏆
            </div>
          </div>
        </div>
      );

    case 'CROCODILE':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#15803d] via-[#16a34a] to-[#14532d] flex items-center justify-center overflow-hidden">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center animate-channel-float z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
              {/* Ogen van de krokodil */}
              <circle cx="36" cy="18" r="13" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
              <circle cx="36" cy="18" r="9" fill="#ffffff" />
              <ellipse cx="37" cy="19" rx="5" ry="6" fill="#0f172a" />
              <circle cx="38" cy="17" r="1.5" fill="#ffffff" />

              <circle cx="64" cy="18" r="13" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
              <circle cx="64" cy="18" r="9" fill="#ffffff" />
              <ellipse cx="63" cy="19" rx="5" ry="6" fill="#0f172a" />
              <circle cx="64" cy="17" r="1.5" fill="#ffffff" />

              {/* Binnenkant bek */}
              <ellipse cx="50" cy="54" rx="33" ry="24" fill="#991b1b" stroke="#15803d" strokeWidth="2.5" />
              <ellipse cx="50" cy="58" rx="22" ry="14" fill="#ef4444" />

              {/* Bovenkaak & snuit met sippe boog (omlaag aflopend naar de hoeken) */}
              <path
                d="M 22 28 Q 50 16 78 28 Q 82 38 76 46 Q 50 36 24 46 Q 18 38 22 28 Z"
                fill="#22c55e"
                stroke="#15803d"
                strokeWidth="2"
              />

              {/* Bovenste tanden: afgeronde blokjes die perfect aansluiten in een sippe boog ⌒ */}
              <rect x="27" y="41" width="6" height="7.5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="34" y="38" width="6" height="7.5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="42" y="36" width="6" height="7.5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="52" y="36" width="6" height="7.5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="60" y="38" width="6" height="7.5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="67" y="41" width="6" height="7.5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

              {/* Onderkaak & onderste tanden met periodieke bijt-animatie */}
              <g className="animate-croc-chomp">
                <path d="M 20 58 Q 50 94 80 58 Q 84 80 50 88 Q 16 80 20 58 Z" fill="#16a34a" stroke="#15803d" strokeWidth="2" />

                <rect x="25" y="58" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <rect x="33" y="62" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <rect x="41" y="64" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <rect x="49" y="64" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <rect x="57" y="62" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <rect x="65" y="58" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              </g>
            </svg>
          </div>
        </div>
      );

    case 'BOMB':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#450a0a] flex items-center justify-center overflow-hidden">
          {/* Geel-zwarte afzettingstape op de achtergrond */}
          <div
            className="absolute -top-3 -left-6 w-32 h-4.5 -rotate-25 border-y border-black/40 shadow-md pointer-events-none opacity-90"
            style={{ background: 'repeating-linear-gradient(45deg, #eab308, #eab308 10px, #0f172a 10px, #0f172a 20px)' }}
          />
          <div
            className="absolute -bottom-2 -right-4 w-36 h-4.5 -rotate-15 border-y border-black/40 shadow-md pointer-events-none opacity-90"
            style={{ background: 'repeating-linear-gradient(45deg, #eab308, #eab308 10px, #0f172a 10px, #0f172a 20px)' }}
          />
          <div
            className="absolute top-1/2 -right-6 w-28 h-3.5 rotate-35 border-y border-black/40 shadow-sm pointer-events-none opacity-85"
            style={{ background: 'repeating-linear-gradient(45deg, #eab308, #eab308 8px, #0f172a 8px, #0f172a 16px)' }}
          />

          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center animate-channel-float z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
              <path
                d="M 52 35 Q 58 18 70 18 Q 78 18 78 26"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="78" cy="26" r="4.5" fill="#fef08a" className="animate-ping origin-center" />
              <circle cx="78" cy="26" r="3" fill="#f97316" />
              <polygon points="78,20 80,24 84,26 80,28 78,32 76,28 72,26 76,24" fill="#fbbf24" />
              <rect x="44" y="32" width="16" height="6" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
              <circle cx="52" cy="62" r="28" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="52" cy="62" r="27" fill="url(#bombGradUnique)" />
              <ellipse cx="42" cy="50" rx="9" ry="5" fill="#ffffff" opacity="0.25" transform="rotate(-30 42 50)" />
              <defs>
                <radialGradient id="bombGradUnique" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="60%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#090d16" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      );

    case 'CAMEL_RACE':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] flex items-center justify-center overflow-hidden">
          <div className="absolute top-2 right-4 w-9 h-9 rounded-full bg-white/40 blur-xs pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#78350f]/50 to-transparent pointer-events-none" />

          {/* Kameel met galopperende beentjes (zonder racebaan) */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center animate-channel-float z-10">
            <svg viewBox="0 0 100 80" className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
              {/* Achterste beentjes (achtergrond laag) */}
              <g className="animate-camel-back-b" style={{ transformOrigin: '32px 54px' }}>
                <path d="M 32 54 L 20 74 L 16 74" stroke="#78350f" strokeWidth="3.8" strokeLinecap="round" />
              </g>
              <g className="animate-camel-front-b" style={{ transformOrigin: '64px 54px' }}>
                <path d="M 64 54 L 76 74 L 80 74" stroke="#78350f" strokeWidth="3.8" strokeLinecap="round" />
              </g>

              {/* Lichaam & Bult */}
              <ellipse cx="48" cy="45" rx="23" ry="15" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
              <path d="M 38 40 Q 48 16 58 40 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />

              {/* Zadel & Nummer */}
              <path d="M 38 38 Q 48 28 58 38 L 56 50 Q 48 53 40 50 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" />
              <text x="48" y="47" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">1</text>

              {/* Hals, Kop & Oortje */}
              <path d="M 58 45 Q 74 34 72 18 Q 79 14 85 20 Q 81 27 68 45 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
              <circle cx="77" cy="20" r="1.8" fill="#0f172a" />
              <ellipse cx="72" cy="16" rx="1.5" ry="3" fill="#92400e" transform="rotate(-20 72 16)" />
              <path d="M 25 44 Q 18 54 20 62" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />

              {/* Jockey poppetje */}
              <ellipse cx="49" cy="28" rx="4.5" ry="8" fill="#ef4444" />
              <circle cx="51" cy="20" r="5" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
              <circle cx="53" cy="20" r="1.5" fill="#0f172a" />

              {/* Voorste beentjes (voorgrond laag, beweegt dynamisch mee) */}
              <g className="animate-camel-back-a" style={{ transformOrigin: '32px 54px' }}>
                <path d="M 32 54 L 24 74 L 20 74" stroke="#92400e" strokeWidth="4.5" strokeLinecap="round" />
              </g>
              <g className="animate-camel-front-a" style={{ transformOrigin: '64px 54px' }}>
                <path d="M 64 54 L 72 74 L 76 74" stroke="#92400e" strokeWidth="4.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      );

    case 'CARD_CATALOG':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#451a03] via-[#291309] to-[#1a0a04] flex items-center justify-center overflow-hidden p-1.5">
          <svg viewBox="0 0 100 80" className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            {/* Kast omlijsting / Buitenkader */}
            <rect x="2" y="2" width="96" height="76" rx="4" fill="#3e1b07" stroke="#78350f" strokeWidth="2.5" />
            <rect x="5" y="5" width="90" height="70" rx="2" fill="#1c0b03" />

            {/* BOVENSTE PLANK BOEKEN (bodem exact op y=38) */}
            {/* Boek 1: Rood */}
            <rect x="10" y="12" width="10" height="26" rx="1.5" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
            <rect x="12" y="15" width="6" height="2" fill="#fef08a" />
            <rect x="12" y="32" width="6" height="2" fill="#fef08a" />
            {/* Boek 2: Goud / Oker */}
            <rect x="22" y="10" width="11" height="28" rx="1.5" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
            <line x1="27.5" y1="14" x2="27.5" y2="34" stroke="#fef08a" strokeWidth="1" strokeDasharray="2 2" />
            {/* Boek 3: Smaragdgroen */}
            <rect x="35" y="15" width="10" height="23" rx="1.5" fill="#15803d" stroke="#166534" strokeWidth="0.8" />
            <rect x="37" y="24" width="6" height="5" fill="#facc15" rx="0.5" />
            {/* Boek 4: Kobaltblauw */}
            <rect x="47" y="11" width="11" height="27" rx="1.5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.8" />
            <rect x="49" y="14" width="7" height="1.5" fill="#ffffff" />
            <rect x="49" y="33" width="7" height="1.5" fill="#ffffff" />
            {/* Boek 5: Paars */}
            <rect x="60" y="16" width="9" height="22" rx="1.5" fill="#7e22ce" stroke="#6b21a8" strokeWidth="0.8" />
            {/* Boek 6 & 7: Leunend naar rechts tegen zijwand */}
            <g transform="rotate(14 74 38)">
              <rect x="71" y="14" width="9" height="24" rx="1.5" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
              <rect x="73" y="18" width="5" height="1.5" fill="#ffffff" />
            </g>

            {/* MIDDENPLANK (bodem voor bovenste boeken, rustend op y=38) */}
            <rect x="4" y="38" width="92" height="4.5" rx="1" fill="#78350f" stroke="#92400e" strokeWidth="1" />
            <line x1="4" y1="38.5" x2="96" y2="38.5" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />

            {/* ONDERSTE PLANK BOEKEN (bodem exact op y=70) */}
            {/* Boek 8: Indigo */}
            <rect x="11" y="46" width="12" height="24" rx="1.5" fill="#4338ca" stroke="#3730a3" strokeWidth="0.8" />
            <rect x="13" y="50" width="8" height="2" fill="#fef08a" />
            {/* Boek 9: Donkerrood / Karmijn */}
            <rect x="25" y="44" width="9" height="26" rx="1.5" fill="#b91c1c" stroke="#991b1b" strokeWidth="0.8" />
            <line x1="29.5" y1="48" x2="29.5" y2="66" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3 1.5" />
            {/* Boek 10: Diep teal */}
            <rect x="36" y="48" width="12" height="22" rx="1.5" fill="#0f766e" stroke="#115e59" strokeWidth="0.8" />
            <rect x="39" y="56" width="6" height="6" fill="#fde047" rx="0.5" />
            {/* Boek 11: Zonnig geel-bruin */}
            <rect x="50" y="45" width="10" height="25" rx="1.5" fill="#b45309" stroke="#92400e" strokeWidth="0.8" />
            <rect x="52" y="48" width="6" height="1.5" fill="#ffffff" />
            <rect x="52" y="66" width="6" height="1.5" fill="#ffffff" />
            {/* Boek 12: Hemelsblauw */}
            <rect x="62" y="47" width="11" height="23" rx="1.5" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
            <circle cx="67.5" cy="58" r="2.5" fill="#fef08a" />
            {/* Boek 13: Zwart/Goud leer */}
            <rect x="75" y="43" width="12" height="27" rx="1.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
            <rect x="78" y="47" width="6" height="2" fill="#fbbf24" />
            <rect x="78" y="64" width="6" height="2" fill="#fbbf24" />

            {/* ONDERSTE PLANK (bodem voor onderste boeken, rustend op y=70) */}
            <rect x="4" y="70" width="92" height="4.5" rx="1" fill="#78350f" stroke="#92400e" strokeWidth="1" />
            <line x1="4" y1="70.5" x2="96" y2="70.5" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
          </svg>
        </div>
      );

    case 'BOER_ZOEKT_VROUW':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#86efac] to-[#15803d] flex items-center justify-center overflow-hidden">
          <div className="absolute top-1.5 right-2 w-7 h-7 rounded-full bg-yellow-300/85 blur-xs pointer-events-none" />
          <div className="absolute top-2 left-2 text-xs opacity-80 pointer-events-none select-none">☁️</div>

          {/* Vloer en tractor in één vector: sluit naadloos aan op elk schermformaat */}
          <div className="w-full h-full relative flex items-center justify-center">
            <svg viewBox="0 0 100 80" className="w-full h-full filter drop-shadow-md">
              <defs>
                <linearGradient id="farmHillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="35%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#14532d" />
                </linearGradient>
              </defs>

              {/* Weide vloer waar de tractor wielen exact op staan (kruintje op y=55) */}
              <path
                d="M 0 55 Q 50 48 100 55 L 100 80 L 0 80 Z"
                fill="url(#farmHillGrad)"
                stroke="#14532d"
                strokeWidth="1.5"
              />
              <path
                d="M 0 63 Q 50 58 100 63 L 100 80 L 0 80 Z"
                fill="#14532d"
                opacity="0.35"
              />

              {/* Tractor trilt levendig met ronkende motor en staat 100% op de vloer */}
              <g className="animate-tractor-rumble">
                {/* Uitlaat met uitlaatgas wolkje */}
                <rect x="68" y="24" width="2.5" height="10" fill="#334155" rx="1" />
                <circle cx="70" cy="20" r="2.2" fill="#ffffff" opacity="0.75" />

                {/* Motorkap & Grill */}
                <rect x="50" y="32" width="25" height="15" rx="2" fill="#16a34a" stroke="#052e16" strokeWidth="1.5" />
                <rect x="71" y="34" width="3" height="9" rx="1" fill="#facc15" />
                <line x1="56" y1="36" x2="68" y2="36" stroke="#15803d" strokeWidth="1.2" />
                <line x1="56" y1="40" x2="68" y2="40" stroke="#15803d" strokeWidth="1.2" />

                {/* Cabine met glas */}
                <rect x="28" y="22" width="22" height="25" rx="3" fill="#15803d" stroke="#052e16" strokeWidth="1.5" />
                <rect x="31" y="25" width="16" height="13" rx="2" fill="#7dd3fc" stroke="#052e16" strokeWidth="1" />
                <rect x="26" y="20" width="26" height="3" rx="1.5" fill="#166534" />

                {/* Achterwiel: rust precies op vloer y=55 */}
                <circle cx="38" cy="44" r="11" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                <circle cx="38" cy="44" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                <circle cx="38" cy="44" r="1.8" fill="#1e293b" />

                {/* Voorwiel: rust precies op vloer y=55 */}
                <circle cx="68" cy="47.5" r="7.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                <circle cx="68" cy="47.5" r="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                <circle cx="68" cy="47.5" r="1.2" fill="#1e293b" />
              </g>
            </svg>
          </div>
        </div>
      );

    case 'MII_MAKER':
      return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#7dd3fc] via-[#bae6fd] to-[#f0f9ff]">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/90 to-transparent flex flex-col justify-end">
            <div className="w-full h-px bg-sky-200/60 mb-2" />
            <div className="w-full h-px bg-sky-200/40 mb-2" />
          </div>
          <div className="relative flex items-end justify-center gap-1 sm:gap-2 z-10 scale-90 sm:scale-100 group-hover:scale-105 transition-transform duration-300">
            <div className="w-9 h-11 sm:w-11 sm:h-13 -mr-1">
              <MiiFace
                avatar={{
                  id: 'preview-1',
                  name: 'Lisa',
                  skinColor: '#d99758',
                  hairStyle: 'bob',
                  hairColor: '#b45309',
                  eyeStyle: 'happy',
                  eyeColor: '#2563eb',
                  eyebrowStyle: 'arched',
                  mouthStyle: 'smile',
                  glasses: 'none',
                  facialHair: 'none',
                  blush: true,
                  favoriteColor: '#ec4899',
                  createdAt: 0,
                }}
                size={44}
              />
            </div>
            <div className="w-11 h-13 sm:w-13 sm:h-15 z-10">
              <MiiFace
                avatar={{
                  id: 'preview-2',
                  name: 'Tom',
                  skinColor: '#fed7aa',
                  hairStyle: 'spiky',
                  hairColor: '#78350f',
                  eyeStyle: 'normal',
                  eyeColor: '#16a34a',
                  eyebrowStyle: 'normal',
                  mouthStyle: 'big_smile',
                  glasses: 'square',
                  facialHair: 'beard',
                  blush: false,
                  favoriteColor: '#3b82f6',
                  createdAt: 0,
                }}
                size={52}
              />
            </div>
            <div className="w-9 h-11 sm:w-11 sm:h-13 -ml-1">
              <MiiFace
                avatar={{
                  id: 'preview-3',
                  name: 'Bas',
                  skinColor: '#fed7aa',
                  hairStyle: 'curly',
                  hairColor: '#dc2626',
                  eyeStyle: 'round',
                  eyeColor: '#78350f',
                  eyebrowStyle: 'thick',
                  mouthStyle: 'smile',
                  glasses: 'none',
                  facialHair: 'goatee',
                  blush: false,
                  favoriteColor: '#eab308',
                  createdAt: 0,
                }}
                size={44}
              />
            </div>
          </div>
        </div>
      );

    case 'THIRTY_SECONDS':
      return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#eab308]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(250,204,21,0.45)_0%,transparent_75%)]" />

          {/* Smooth Occasional Flipping Emoji-Style Hourglass without any text */}
          <div className="relative z-10 flex items-center justify-center animate-hourglass-spin filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]">
            <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18">
              {/* Top Wooden Base */}
              <rect x="22" y="10" width="56" height="8" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
              <rect x="25" y="13" width="50" height="2" rx="1" fill="#f59e0b" opacity="0.6" />

              {/* Bottom Wooden Base */}
              <rect x="22" y="82" width="56" height="8" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
              <rect x="25" y="85" width="50" height="2" rx="1" fill="#f59e0b" opacity="0.6" />

              {/* Glass Bulbs Container */}
              <path
                d="M 28 18 C 28 40, 44 48, 48 50 C 44 52, 28 60, 28 82 L 72 82 C 72 60, 56 52, 52 50 C 56 48, 72 40, 72 18 Z"
                fill="url(#hourglassGlassGrad)"
                stroke="#ffffff"
                strokeWidth="2.5"
                opacity="0.95"
              />

              {/* Top Sand Pile */}
              <path
                d="M 32 30 C 35 24, 65 24, 68 30 C 64 42, 54 48, 50 50 C 46 48, 36 42, 32 30 Z"
                fill="url(#hourglassSandGrad)"
              />

              {/* Trickling Sand Stream */}
              <line x1="50" y1="50" x2="50" y2="76" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="3 1" />

              {/* Bottom Sand Mound */}
              <ellipse cx="50" cy="78" rx="16" ry="4" fill="url(#hourglassSandGrad)" />

              {/* Glass Highlight Shine Curve */}
              <path
                d="M 33 22 C 33 36, 44 44, 46 47"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.75"
              />

              <defs>
                <linearGradient id="hourglassGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="hourglassSandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      );

    case 'WIE_IS':
      return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]">
          {/* Subtle Light Studio Spotlight Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(59,130,246,0.18)_0%,transparent_72%)]" />
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-slate-400/25 to-transparent pointer-events-none" />

          {/* Three Identical Normal People Pointing at Each Other (Iconic Meme Standoff) */}
          <div className="relative w-28 h-20 flex items-center justify-center animate-spiderman-bob filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
            <svg viewBox="0 0 120 90" className="w-full h-full">
              {/* Ground Shadow Ellipses */}
              <ellipse cx="32" cy="76" rx="16" ry="4.5" fill="#64748b" opacity="0.35" />
              <ellipse cx="88" cy="76" rx="16" ry="4.5" fill="#64748b" opacity="0.35" />
              <ellipse cx="60" cy="56" rx="13" ry="3.5" fill="#64748b" opacity="0.3" />

              {/* FIGURE 3 (Center Top / Facing forward pointing down at both) */}
              <g transform="translate(60, 36)">
                {/* Legs (Blue Jeans) */}
                <path d="M -6 4 L -5 18 L -2 18 L -1 7 L 1 7 L 2 18 L 5 18 L 6 4 Z" fill="#1e3a8a" />
                {/* White Sneakers */}
                <rect x="-6" y="17" width="4.5" height="2.2" rx="0.8" fill="#ffffff" />
                <rect x="-6" y="18.5" width="4.5" height="0.7" rx="0.3" fill="#334155" />
                <rect x="1.5" y="17" width="4.5" height="2.2" rx="0.8" fill="#ffffff" />
                <rect x="1.5" y="18.5" width="4.5" height="0.7" rx="0.3" fill="#334155" />
                {/* Torso (Casual T-shirt) */}
                <path d="M -6 4 L 6 4 L 5 -6 L -5 -6 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.8" />
                {/* Neck */}
                <rect x="-2" y="-7.5" width="4" height="2.5" fill="#fed7aa" />
                {/* Normal Head */}
                <ellipse cx="0" cy="-13.5" rx="5.8" ry="6.2" fill="#fed7aa" />
                {/* Hair */}
                <path d="M -6 -13 C -6 -19 0 -20 6 -19 C 6 -14 5 -13 4 -14 C 2 -18 -3 -18 -5 -13 Z" fill="#3f2314" />
                {/* Expressive accusatory eyes looking between both */}
                <circle cx="-2.2" cy="-13.5" r="1.1" fill="#0f172a" />
                <circle cx="-1.9" cy="-14" r="0.4" fill="#ffffff" />
                <circle cx="2.2" cy="-13.5" r="1.1" fill="#0f172a" />
                <circle cx="2.5" cy="-14" r="0.4" fill="#ffffff" />
                {/* Incredulous eyebrows */}
                <path d="M -3.8 -15.5 L -1.2 -15.8" stroke="#3f2314" strokeWidth="0.7" strokeLinecap="round" />
                <path d="M 3.8 -15.5 L 1.2 -15.8" stroke="#3f2314" strokeWidth="0.7" strokeLinecap="round" />
                {/* Open mouth */}
                <circle cx="0" cy="-9.8" r="1.1" fill="#991b1b" />
                {/* Left arm pointing down-left at Figure 1 */}
                <path d="M -5 -4 L -9 -1" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M -9 -1 L -15 3" stroke="#fed7aa" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="-15" cy="3" r="1.4" fill="#fed7aa" />
                <path d="M -15 3 L -19 5" stroke="#fed7aa" strokeWidth="1.6" strokeLinecap="round" />
                {/* Right arm pointing down-right at Figure 2 */}
                <path d="M 5 -4 L 9 -1" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M 9 -1 L 15 3" stroke="#fed7aa" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="15" cy="3" r="1.4" fill="#fed7aa" />
                <path d="M 15 3 L 19 5" stroke="#fed7aa" strokeWidth="1.6" strokeLinecap="round" />
              </g>

              {/* FIGURE 1 (Left / Facing Right Pointing 👉) */}
              <g transform="translate(30, 56)">
                {/* Legs (Blue Jeans) */}
                <path d="M -4 8 L -7 22 L -3 22 L -1 10 L 2 22 L 6 22 L 3 8 Z" fill="#1e3a8a" />
                {/* White Sneakers */}
                <rect x="-8.5" y="21" width="6.5" height="2.5" rx="1" fill="#ffffff" />
                <rect x="-8.5" y="22.7" width="6.5" height="0.8" rx="0.3" fill="#334155" />
                <rect x="2" y="21" width="6.5" height="2.5" rx="1" fill="#ffffff" />
                <rect x="2" y="22.7" width="6.5" height="0.8" rx="0.3" fill="#334155" />
                {/* Torso (Casual T-shirt) */}
                <path d="M -6 -4 L 5 -4 L 3 8 L -5 8 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.8" />
                {/* Neck */}
                <rect x="-2" y="-6.5" width="4" height="3" fill="#fed7aa" />
                {/* Normal Head */}
                <circle cx="0" cy="-13" r="6.5" fill="#fed7aa" />
                {/* Hair */}
                <path d="M -6.5 -13 C -6.5 -19 0 -21 6 -17 C 7 -15 6 -13 4 -13 C 2 -17 -3 -17 -5 -12 Z" fill="#3f2314" />
                {/* Ear */}
                <ellipse cx="-2" cy="-13" rx="1.2" ry="1.8" fill="#fed7aa" />
                {/* Accusing Eye looking right 👉 */}
                <circle cx="2.8" cy="-13.5" r="1.1" fill="#0f172a" />
                <circle cx="3.2" cy="-14" r="0.4" fill="#ffffff" />
                {/* Eyebrow */}
                <path d="M 1 -15.5 L 4.5 -14.8" stroke="#3f2314" strokeWidth="0.8" strokeLinecap="round" />
                {/* Nose */}
                <path d="M 5.5 -13 L 6.8 -12 L 5.5 -11" fill="none" stroke="#fed7aa" strokeWidth="1" strokeLinejoin="round" />
                {/* Open mouth */}
                <path d="M 2.5 -10.5 Q 4.5 -10.5 3.5 -9.2" fill="#991b1b" stroke="#7f1d1d" strokeWidth="0.5" />
                {/* Left arm bent on hip */}
                <path d="M -5 -4 L -7 0" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M -7 0 L -8 4 L -5 5" fill="none" stroke="#fed7aa" strokeWidth="2.2" strokeLinecap="round" />
                {/* Right arm outstretched pointing right 👉 at Figure 2 */}
                <path d="M 3 -3 L 8 -2.5" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                <path d="M 8 -2.5 L 19 -2" stroke="#fed7aa" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="19" cy="-2" r="1.8" fill="#fed7aa" />
                {/* Extended index finger */}
                <path d="M 19 -2 L 26 -2" stroke="#fed7aa" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              {/* FIGURE 2 (Right / Facing Left Pointing 👈) */}
              <g transform="translate(90, 56) scale(-1, 1)">
                {/* Legs (Blue Jeans) */}
                <path d="M -4 8 L -7 22 L -3 22 L -1 10 L 2 22 L 6 22 L 3 8 Z" fill="#1e3a8a" />
                {/* White Sneakers */}
                <rect x="-8.5" y="21" width="6.5" height="2.5" rx="1" fill="#ffffff" />
                <rect x="-8.5" y="22.7" width="6.5" height="0.8" rx="0.3" fill="#334155" />
                <rect x="2" y="21" width="6.5" height="2.5" rx="1" fill="#ffffff" />
                <rect x="2" y="22.7" width="6.5" height="0.8" rx="0.3" fill="#334155" />
                {/* Torso (Casual T-shirt) */}
                <path d="M -6 -4 L 5 -4 L 3 8 L -5 8 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.8" />
                {/* Neck */}
                <rect x="-2" y="-6.5" width="4" height="3" fill="#fed7aa" />
                {/* Normal Head */}
                <circle cx="0" cy="-13" r="6.5" fill="#fed7aa" />
                {/* Hair */}
                <path d="M -6.5 -13 C -6.5 -19 0 -21 6 -17 C 7 -15 6 -13 4 -13 C 2 -17 -3 -17 -5 -12 Z" fill="#3f2314" />
                {/* Ear */}
                <ellipse cx="-2" cy="-13" rx="1.2" ry="1.8" fill="#fed7aa" />
                {/* Accusing Eye looking right in local space (so left when flipped) */}
                <circle cx="2.8" cy="-13.5" r="1.1" fill="#0f172a" />
                <circle cx="3.2" cy="-14" r="0.4" fill="#ffffff" />
                {/* Eyebrow */}
                <path d="M 1 -15.5 L 4.5 -14.8" stroke="#3f2314" strokeWidth="0.8" strokeLinecap="round" />
                {/* Nose */}
                <path d="M 5.5 -13 L 6.8 -12 L 5.5 -11" fill="none" stroke="#fed7aa" strokeWidth="1" strokeLinejoin="round" />
                {/* Open mouth */}
                <path d="M 2.5 -10.5 Q 4.5 -10.5 3.5 -9.2" fill="#991b1b" stroke="#7f1d1d" strokeWidth="0.5" />
                {/* Left arm bent on hip */}
                <path d="M -5 -4 L -7 0" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M -7 0 L -8 4 L -5 5" fill="none" stroke="#fed7aa" strokeWidth="2.2" strokeLinecap="round" />
                {/* Right arm outstretched pointing left (right in flipped coordinates) */}
                <path d="M 3 -3 L 8 -2.5" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                <path d="M 8 -2.5 L 19 -2" stroke="#fed7aa" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="19" cy="-2" r="1.8" fill="#fed7aa" />
                {/* Extended index finger */}
                <path d="M 19 -2 L 26 -2" stroke="#fed7aa" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      );

    case 'UNDERCOVER':
      return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#050814] via-[#0b1329] to-[#1e1035]">
          {/* Deep Cosmic Starfield & Nebula Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(6,182,212,0.3)_0%,rgba(168,85,247,0.18)_50%,transparent_100%)]" />
          
          {/* Distant Twinkling Stars */}
          <div className="absolute top-2 left-3 w-1 h-1 rounded-full bg-cyan-200 animate-ping opacity-75" />
          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-purple-300 opacity-80" />
          <div className="absolute bottom-3 left-4 w-1 h-1 rounded-full bg-cyan-300 opacity-60" />
          <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-sky-200 opacity-70" />

          {/* Luminous Light Blue Tractor Beam Cone directly UNDER the UFO */}
          <div
            className="absolute top-8 w-22 h-14 bg-gradient-to-b from-cyan-300/65 via-sky-400/30 to-transparent pointer-events-none"
            style={{ clipPath: 'polygon(36% 0%, 64% 0%, 100% 100%, 0% 100%)' }}
          />

          {/* Light Blue Ground Scan Halo */}
          <div className="absolute bottom-1 w-16 h-3 rounded-[100%] bg-cyan-300/40 blur-xs pointer-events-none" />

          {/* Custom SVG Flying Saucer (Placed Higher, No Yellow Beam!) */}
          <div className="absolute top-2 z-10 flex flex-col items-center justify-center animate-channel-float filter drop-shadow-[0_0_12px_rgba(6,182,212,0.85)]">
            <svg viewBox="0 0 80 44" className="w-16 h-10 sm:w-18 sm:h-11">
              {/* Glass Cockpit Dome */}
              <ellipse cx="40" cy="18" rx="14" ry="12" fill="url(#ufoDomeGrad)" stroke="#38bdf8" strokeWidth="1.2" />
              {/* Mysterious alien eyes silhouette inside */}
              <ellipse cx="37" cy="18" rx="1.8" ry="3" fill="#0284c7" transform="rotate(-15 37 18)" />
              <ellipse cx="43" cy="18" rx="1.8" ry="3" fill="#0284c7" transform="rotate(15 43 18)" />

              {/* Upper Saucer Rim */}
              <ellipse cx="40" cy="24" rx="34" ry="9" fill="url(#ufoHullUpper)" stroke="#0284c7" strokeWidth="1" />
              {/* Glowing Rim Lights (Turquoise / Cyan) */}
              <circle cx="16" cy="25" r="2.2" fill="#67e8f9" />
              <circle cx="28" cy="27" r="2.5" fill="#67e8f9" />
              <circle cx="40" cy="28" r="2.8" fill="#67e8f9" />
              <circle cx="52" cy="27" r="2.5" fill="#67e8f9" />
              <circle cx="64" cy="25" r="2.2" fill="#67e8f9" />

              {/* Lower Saucer Base (Direct emitter for the light blue beam) */}
              <ellipse cx="40" cy="27" rx="18" ry="5.5" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
              <ellipse cx="40" cy="28" rx="10" ry="3" fill="#38bdf8" />

              <defs>
                <linearGradient id="ufoDomeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="ufoHullUpper" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="45%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      );

    case 'OP_JE_KOP':
      return <OpJeKopVisual />;

    case 'SNELSTE_VINGER':
      return <SnelsteVingerVisual />;

    case 'HOGER_LAGER':
      return <HogerLagerVisual />;

    case 'NOOIT':
      return <NooitVisual />;

    case 'GOUDMIJNEN':
      return <GoudmijnenVisual />;

    case 'SPECTRUM':
      return <SpectrumVisual />;

    default:
      return null;
  }
}
