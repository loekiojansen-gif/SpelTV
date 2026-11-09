import React from 'react';
import { SubAppId } from '../../types';
import { Hourglass } from 'lucide-react';
import { MiiFace } from '../MiiMaker/MiiFace';
import { NoiseVisual } from './NoiseChannel';

export const DEFAULT_CHANNEL_ORDER: string[] = [
  // Page 1 (0 - 11)
  'PUB_GOLF',
  'CHWAZI',
  'DICE',
  'SCORE_KEEPER',
  'WHEEL',
  'SLABAKKEN',
  'TEAM_MAKER',
  'TOURNAMENT',
  'CROCODILE',
  'BOMB',
  'CAMEL_RACE',
  'CARD_CATALOG',
  // Page 2 (12 - 23)
  'BOER_ZOEKT_VROUW',
  'MII_MAKER',
  'THIRTY_SECONDS',
  'WIE_IS',
  'NOISE_17',
  'NOISE_18',
  'NOISE_19',
  'NOISE_20',
  'NOISE_21',
  'NOISE_22',
  'NOISE_23',
  'NOISE_24',
];

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
    default:
      if (channelId.startsWith('NOISE_')) {
        return 'Binnenkort';
      }
      return channelId;
  }
}

export function isGameChannel(channelId: string): channelId is SubAppId {
  return [
    'PUB_GOLF',
    'CHWAZI',
    'DICE',
    'SCORE_KEEPER',
    'WHEEL',
    'SLABAKKEN',
    'TEAM_MAKER',
    'TOURNAMENT',
    'CROCODILE',
    'BOMB',
    'CAMEL_RACE',
    'CARD_CATALOG',
    'BOER_ZOEKT_VROUW',
    'MII_MAKER',
    'THIRTY_SECONDS',
    'WIE_IS',
  ].includes(channelId);
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
              <text x="26" y="58" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="sans-serif">2</text>
              <circle cx="26" cy="25" r="5.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
              <text x="26" y="28.5" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">🥈</text>

              <path d="M 36 22 L 64 22 L 64 76 L 36 76 Z" fill="#eab308" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="36" y="22" width="28" height="5" fill="#fef08a" />
              <text x="50" y="50" textAnchor="middle" fill="#ffffff" fontSize="21" fontWeight="900" fontFamily="sans-serif">1</text>
              <text x="50" y="14" textAnchor="middle" fontSize="13">👑</text>

              <path d="M 60 46 L 88 46 L 88 76 L 60 76 Z" fill="#c2410c" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="60" y="46" width="28" height="5" fill="#fed7aa" />
              <text x="74" y="65" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="sans-serif">3</text>
              <circle cx="74" cy="37" r="5" fill="#fed7aa" stroke="#c2410c" strokeWidth="1" />
              <text x="74" y="40.5" textAnchor="middle" fill="#7c2d12" fontSize="7" fontWeight="bold">🥉</text>
            </svg>
          </div>
        </div>
      );

    case 'WHEEL':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6] via-[#1d4ed8] to-[#1e3a8a] flex items-center justify-center overflow-hidden">
          <div className="absolute top-1.5 z-10 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-yellow-300 drop-shadow-md" />
          <div className="w-13 h-13 sm:w-16 sm:h-16 relative flex items-center justify-center animate-channel-wheel">
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1] via-[#8b5cf6] to-[#4338ca] flex items-center justify-center overflow-hidden">
          <div className="relative w-20 h-16 flex items-center justify-center animate-channel-float">
            <div className="absolute inset-0 flex items-center justify-center opacity-40 animate-channel-wheel">
              <svg viewBox="0 0 60 60" className="w-14 h-14">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="6 4" />
              </svg>
            </div>
            <div className="relative flex items-center justify-center gap-2 z-10">
              <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-black">
                A
              </div>
              <div className="w-8 h-8 rounded-full bg-sky-500 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-black">
                B
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
              <circle cx="36" cy="18" r="13" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
              <circle cx="36" cy="18" r="9" fill="#ffffff" />
              <ellipse cx="37" cy="19" rx="5" ry="6" fill="#0f172a" />
              <circle cx="38" cy="17" r="1.5" fill="#ffffff" />

              <circle cx="64" cy="18" r="13" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
              <circle cx="64" cy="18" r="9" fill="#ffffff" />
              <ellipse cx="63" cy="19" rx="5" ry="6" fill="#0f172a" />
              <circle cx="64" cy="17" r="1.5" fill="#ffffff" />

              <path d="M 22 28 Q 50 16 78 28 Q 80 40 76 45 Q 50 48 24 45 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" />

              <ellipse cx="50" cy="54" rx="33" ry="24" fill="#991b1b" stroke="#15803d" strokeWidth="2.5" />
              <ellipse cx="50" cy="58" rx="22" ry="14" fill="#ef4444" />

              <polygon points="30,38 34,44 38,38" fill="#ffffff" />
              <polygon points="38,39 42,46 46,39" fill="#ffffff" />
              <polygon points="46,40 50,47 54,40" fill="#ffffff" />
              <polygon points="54,39 58,46 62,39" fill="#ffffff" />
              <polygon points="62,38 66,44 70,38" fill="#ffffff" />

              <path d="M 20 58 Q 50 94 80 58 Q 84 80 50 88 Q 16 80 20 58 Z" fill="#16a34a" stroke="#15803d" strokeWidth="2" />

              <rect x="25" y="60" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="33" y="65" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="41" y="68" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="49" y="68" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="57" y="66" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="65" y="61" width="6" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            </svg>
          </div>
        </div>
      );

    case 'BOMB':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#450a0a] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:8px_8px]" />
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
          <div className="absolute bottom-0 inset-x-0 h-7 bg-gradient-to-t from-[#78350f]/60 to-transparent pointer-events-none" />
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center animate-channel-float z-10">
            <svg viewBox="0 0 100 80" className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
              <path d="M 64 54 L 74 74 L 78 74" stroke="#92400e" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 32 54 L 22 74 L 18 74" stroke="#92400e" strokeWidth="4.5" strokeLinecap="round" />
              <ellipse cx="48" cy="45" rx="23" ry="15" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
              <path d="M 38 40 Q 48 16 58 40 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
              <path d="M 38 38 Q 48 28 58 38 L 56 50 Q 48 53 40 50 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" />
              <text x="48" y="47" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">1</text>
              <path d="M 58 45 Q 74 34 72 18 Q 79 14 85 20 Q 81 27 68 45 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
              <circle cx="77" cy="20" r="1.8" fill="#0f172a" />
              <ellipse cx="72" cy="16" rx="1.5" ry="3" fill="#92400e" transform="rotate(-20 72 16)" />
              <path d="M 25 44 Q 18 54 20 62" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="49" cy="28" rx="4.5" ry="8" fill="#ef4444" />
              <circle cx="51" cy="20" r="5" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
              <circle cx="53" cy="20" r="1.5" fill="#0f172a" />
              <path d="M 76 60 L 76 38" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
              <polygon points="76,38 92,44 76,50" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
              <polygon points="76,38 84,41 76,44" fill="#0f172a" />
              <polygon points="84,41 92,44 84,47" fill="#0f172a" />
            </svg>
          </div>
        </div>
      );

    case 'CARD_CATALOG':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#5c2e17] via-[#3d1e0f] to-[#241108] flex items-center justify-center overflow-hidden p-2">
          <div className="relative w-full h-full rounded-md border-2 border-[#854d0e] bg-gradient-to-b from-[#291309] to-[#1a0a04] flex flex-col justify-between p-1 shadow-inner">
            <div className="w-full flex-1 flex items-end justify-center gap-1 pb-0.5 px-1 overflow-hidden">
              <div className="w-2.5 h-8 bg-red-700 rounded-t-xs border border-red-400 shadow-xs flex flex-col justify-center items-center">
                <div className="w-1.5 h-0.5 bg-yellow-300" />
              </div>
              <div className="w-3 h-9 bg-amber-600 rounded-t-xs border border-amber-300 shadow-xs flex flex-col justify-center items-center">
                <div className="w-2 h-0.5 bg-yellow-200" />
              </div>
              <div className="w-2.5 h-7.5 bg-emerald-700 rounded-t-xs border border-emerald-400 shadow-xs" />
              <div className="w-3 h-8.5 bg-blue-700 rounded-t-xs border border-blue-400 shadow-xs flex flex-col justify-center items-center">
                <div className="w-2 h-0.5 bg-white" />
              </div>
              <div className="w-2 h-7 bg-purple-700 rounded-t-xs border border-purple-400 shadow-xs" />
              <div className="w-2.5 h-8 bg-amber-500 rounded-t-xs border border-yellow-200 shadow-xs rotate-6 origin-bottom-left" />
            </div>
            <div className="w-full h-1.5 bg-gradient-to-r from-[#854d0e] via-[#a16207] to-[#854d0e] rounded-xs shadow-md border-t border-[#ca8a04]/60" />
            <div className="w-full flex-1 flex items-end justify-center gap-1 pb-0.5 px-1 overflow-hidden">
              <div className="w-3 h-8.5 bg-indigo-700 rounded-t-xs border border-indigo-400 shadow-xs flex flex-col justify-center items-center">
                <div className="w-2 h-0.5 bg-amber-300" />
              </div>
              <div className="w-2.5 h-7 bg-rose-600 rounded-t-xs border border-rose-300 shadow-xs" />
              <div className="w-3.5 h-9 bg-emerald-800 rounded-t-xs border border-emerald-300 shadow-xs flex flex-col justify-center items-center">
                <div className="w-2.5 h-0.5 bg-yellow-300" />
              </div>
              <div className="w-2.5 h-7.5 bg-amber-700 rounded-t-xs border border-amber-400 shadow-xs" />
              <div className="w-3 h-8 bg-sky-600 rounded-t-xs border border-sky-300 shadow-xs flex flex-col justify-center items-center">
                <div className="w-2 h-0.5 bg-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gradient-to-r from-[#713f12] via-[#854d0e] to-[#713f12] rounded-xs border-t border-[#ca8a04]/60" />
          </div>
        </div>
      );

    case 'BOER_ZOEKT_VROUW':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#86efac] to-[#15803d] flex items-center justify-center overflow-hidden">
          <div className="absolute top-1 right-2 w-7 h-7 rounded-full bg-yellow-300/80 blur-xs" />
          <div className="absolute top-2 left-2 text-xs opacity-75">☁️</div>
          <div className="absolute bottom-0 inset-x-0 h-7 bg-gradient-to-t from-[#14532d] to-[#16a34a] rounded-t-[100%]" />
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center animate-channel-float z-10">
            <div className="relative flex items-center justify-center">
              <svg width="58" height="40" viewBox="0 0 68 48" className="filter drop-shadow-md">
                <rect x="8" y="6" width="22" height="24" rx="3" fill="#15803d" stroke="#052e16" strokeWidth="1.5" />
                <rect x="11" y="9" width="16" height="12" rx="2" fill="#7dd3fc" />
                <rect x="30" y="16" width="28" height="15" rx="3" fill="#16a34a" stroke="#052e16" strokeWidth="1.5" />
                <rect x="33" y="4" width="3" height="12" fill="#334155" />
                <circle cx="18" cy="33" r="12" fill="#1e293b" stroke="#facc15" strokeWidth="2" />
                <circle cx="18" cy="33" r="4.5" fill="#facc15" />
                <circle cx="48" cy="37" r="8" fill="#1e293b" stroke="#facc15" strokeWidth="2" />
                <circle cx="48" cy="37" r="3" fill="#facc15" />
              </svg>
            </div>
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
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#2563eb]" />
          <div
            className="absolute inset-0 bg-[#facc15]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center bg-white/95 text-slate-900 rounded-2xl px-3.5 py-2 shadow-lg border border-slate-200/90 group-hover:scale-105 transition-transform">
            <div className="animate-hourglass-flip mb-0.5">
              <Hourglass className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[12px] font-black tracking-tight leading-none text-slate-900">
              30 <span className="text-blue-600">SEC</span>
            </span>
          </div>
        </div>
      );

    case 'WIE_IS':
      return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#facc15] via-[#fbbf24] to-[#f97316]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.85)_0%,rgba(250,204,21,0.6)_60%,rgba(249,115,22,0.8)_100%)]" />
          <div className="absolute top-2 left-2 text-xs opacity-60 pointer-events-none select-none">
            ⭐
          </div>
          <div className="absolute bottom-2 right-2 text-xs opacity-60 pointer-events-none select-none">
            ✨
          </div>
          <div className="absolute top-3 right-3 w-4 h-5 rounded-md bg-blue-600 border border-white shadow-xs rotate-12 opacity-75" />
          <div className="absolute bottom-3 left-3 w-4 h-5 rounded-md bg-red-600 border border-white shadow-xs -rotate-12 opacity-75" />
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center animate-channel-float z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
              <text
                x="52"
                y="75"
                textAnchor="middle"
                fill="#1e3a8a"
                fontSize="74"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                ?
              </text>
              <text
                x="50"
                y="72"
                textAnchor="middle"
                fill="url(#wieIsQGradVisual)"
                stroke="#ffffff"
                strokeWidth="3"
                fontSize="74"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                ?
              </text>
              <defs>
                <linearGradient id="wieIsQGradVisual" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      );

    default:
      return null;
  }
}
