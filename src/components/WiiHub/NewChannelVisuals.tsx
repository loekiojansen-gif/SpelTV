/**
 * Kanaal-artwork voor de nieuwe spellen.
 * Zelfde opzet als de bestaande kanalen: een gekleurde achtergrond die de hele tegel vult
 * met in het midden een klein, bewegend plaatje.
 */

export function OpJeKopVisual() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#f0abfc] via-[#c026d3] to-[#701a75] flex items-center justify-center overflow-hidden">
      <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-white/20 blur-md" />
      <div className="absolute bottom-1 right-2 text-[10px] opacity-70 select-none">✨</div>
      <div className="relative w-18 h-16 flex items-center justify-center z-10">
        <svg viewBox="0 0 100 88" className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] overflow-visible">
          {/* Hoofd */}
          <circle cx="50" cy="60" r="25" fill="#fed7aa" stroke="#9a3412" strokeWidth="2" />
          <ellipse cx="41" cy="60" rx="3" ry="4" fill="#1e293b" />
          <ellipse cx="59" cy="60" rx="3" ry="4" fill="#1e293b" />
          <circle cx="42" cy="58.5" r="1" fill="#ffffff" />
          <circle cx="60" cy="58.5" r="1" fill="#ffffff" />
          <path d="M 40 70 Q 50 79 60 70" fill="none" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="33" cy="67" r="3.5" fill="#fb7185" opacity="0.55" />
          <circle cx="67" cy="67" r="3.5" fill="#fb7185" opacity="0.55" />

          {/* Telefoon op het voorhoofd die naar voren en achteren kantelt */}
          <g className="animate-opjekop-tilt" style={{ transformOrigin: '50px 40px' }}>
            <rect x="20" y="10" width="60" height="32" rx="6" fill="#1e1b4b" stroke="#ffffff" strokeWidth="2" />
            <rect x="25" y="14" width="50" height="24" rx="3" fill="#ffffff" />
            <text x="50" y="33" textAnchor="middle" fill="#a21caf" fontSize="20" fontWeight="900" fontFamily="system-ui, sans-serif">
              ?!
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export function SnelsteVingerVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#2563eb]">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#f87171] to-[#dc2626]"
        style={{ clipPath: 'polygon(0 0, 62% 0, 38% 100%, 0 100%)' }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#60a5fa] to-[#1d4ed8]"
        style={{ clipPath: 'polygon(62% 0, 100% 0, 100% 100%, 38% 100%)' }}
      />
      {/* Twee vingertoppen die om de beurt oplichten */}
      <div className="absolute left-[14%] bottom-[18%] w-5 h-5 rounded-full border-2 border-white/90 bg-white/25 animate-zap-pad" />
      <div
        className="absolute right-[14%] top-[18%] w-5 h-5 rounded-full border-2 border-white/90 bg-white/25 animate-zap-pad"
        style={{ animationDelay: '0.9s' }}
      />
      <div className="relative w-14 h-16 flex items-center justify-center z-10 animate-zap-bolt">
        <svg viewBox="0 0 60 80" className="w-full h-full filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]">
          <path
            d="M 36 2 L 8 44 L 27 44 L 20 78 L 52 32 L 32 32 Z"
            fill="#fde047"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M 34 10 L 16 40 L 29 40" fill="none" stroke="#fef9c3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function HogerLagerVisual() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#fb7185] via-[#be123c] to-[#4c0519] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:9px_9px]" />
      <div className="relative w-20 h-16 flex items-center justify-center z-10">
        {/* Linker kaart */}
        <div className="absolute left-2.5 top-2 w-8 h-11 rounded-md bg-white border border-slate-300 shadow-lg -rotate-12 flex flex-col items-center justify-center leading-none">
          <span className="text-[13px] font-black text-slate-900">7</span>
          <span className="text-[13px] text-slate-900 -mt-0.5">♠</span>
        </div>
        {/* Rechter kaart */}
        <div className="absolute right-2.5 top-2 w-8 h-11 rounded-md bg-white border border-slate-300 shadow-lg rotate-12 flex flex-col items-center justify-center leading-none animate-channel-float">
          <span className="text-[13px] font-black text-red-600">K</span>
          <span className="text-[13px] text-red-600 -mt-0.5">♥</span>
        </div>
        {/* Pijlen omhoog en omlaag */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-2 flex flex-col items-center gap-8 z-10">
          <div className="animate-arrow-up">
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[11px] border-b-lime-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
          </div>
          <div className="animate-arrow-down">
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[11px] border-t-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NooitVisual() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#5eead4] via-[#0d9488] to-[#134e4a] flex items-center justify-center overflow-hidden">
      <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full bg-white/15 blur-md" />
      <div className="relative w-20 h-16 flex items-center justify-center z-10">
        {/* Tekstballon met drie puntjes */}
        <div className="absolute right-0 -top-0.5 px-1.5 py-1 rounded-lg rounded-bl-none bg-white shadow-md flex items-center gap-0.5">
          <span className="w-1 h-1 rounded-full bg-teal-700 animate-typing-dot" />
          <span className="w-1 h-1 rounded-full bg-teal-700 animate-typing-dot" style={{ animationDelay: '0.18s' }} />
          <span className="w-1 h-1 rounded-full bg-teal-700 animate-typing-dot" style={{ animationDelay: '0.36s' }} />
        </div>
        <div className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] animate-channel-float mt-1.5 -ml-3 select-none">
          😇
        </div>
        <div className="absolute right-1 bottom-0 text-xl rotate-12 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] select-none">
          🍺
        </div>
      </div>
    </div>
  );
}

export function GoudmijnenVisual() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#451a03] via-[#271509] to-[#0f0804] flex items-center justify-center overflow-hidden">
      {/* Warme lantaarngloed achter de mijnwand */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-16 rounded-full bg-amber-400/25 blur-md pointer-events-none" />

      {/* Houten mijnschacht balkjes */}
      <div className="absolute left-0 inset-y-0 w-2 bg-gradient-to-r from-[#78350f] to-[#451a03] border-r border-[#92400e]/60" />
      <div className="absolute right-0 inset-y-0 w-2 bg-gradient-to-l from-[#78350f] to-[#451a03] border-l border-[#92400e]/60" />
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-[#78350f] to-[#451a03] border-b border-[#92400e]/60" />

      <div className="relative w-22 h-16 flex items-center justify-center z-10">
        {/* Rotsblok met goudader rechtsonder */}
        <svg viewBox="0 0 100 76" className="w-full h-full overflow-visible filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)]">
          {/* Rotsblok */}
          <polygon
            points="38,68 32,46 48,32 72,30 86,44 80,68"
            fill="#44403c"
            stroke="#78716c"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon points="48,32 72,30 62,48 42,46" fill="#57534e" />
          {/* Goudklompjes in de rots */}
          <polygon points="56,42 66,40 69,49 58,52" fill="#fbbf24" stroke="#fef08a" strokeWidth="1.2" />
          <polygon points="44,53 53,51 55,59 45,61" fill="#f59e0b" stroke="#fde047" strokeWidth="1" />
          <circle cx="71" cy="37" r="2" fill="#fef08a" />

          {/* Dynamietstaven links */}
          <g transform="translate(12, 34) rotate(-14)">
            <path d="M 8 2 Q 11 -3 15 -2" fill="none" stroke="#fde047" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="15" cy="-2" r="2.5" fill="#f97316" />
            <rect x="2" y="4" width="5" height="22" rx="1.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
            <rect x="7" y="2" width="5" height="24" rx="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
            <rect x="1.5" y="10" width="11" height="3.5" fill="#1e293b" />
          </g>

          {/* Zwaaiende pikhouweel */}
          <g className="animate-pickaxe-swing">
            {/* Steel */}
            <rect x="26" y="22" width="5" height="34" rx="2.5" fill="#b45309" stroke="#451a03" strokeWidth="1.2" transform="rotate(36 28 38)" />
            {/* IJzeren kop */}
            <path
              d="M 24 12 Q 42 10 52 24 L 46 27 Q 38 18 24 19 Q 16 19 11 24 L 8 19 Q 15 12 24 12 Z"
              fill="#cbd5e1"
              stroke="#475569"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M 45 21 L 52 24 L 48 27" fill="#f8fafc" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function SpectrumVisual() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617] flex items-center justify-center overflow-hidden">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-16 rounded-full bg-cyan-400/20 blur-md pointer-events-none" />
      <div className="relative w-24 h-16 flex items-center justify-center z-10">
        <svg viewBox="0 0 100 72" className="w-full h-full overflow-visible filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.65)]">
          {/* Buitenring halve cirkel */}
          <path
            d="M 10 64 A 40 40 0 0 1 90 64 L 74 64 A 24 24 0 0 0 26 64 Z"
            fill="#1e293b"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          {/* Doelzones (2 - 3 - 4 - 3 - 2) */}
          <path d="M 16 44 A 40 40 0 0 1 28 30 L 37 44 A 24 24 0 0 0 29 52 Z" fill="#0ea5e9" />
          <path d="M 28 30 A 40 40 0 0 1 42 25 L 45 41 A 24 24 0 0 0 37 44 Z" fill="#f59e0b" />
          <path d="M 42 25 A 40 40 0 0 1 58 25 L 55 41 A 24 24 0 0 0 45 41 Z" fill="#ef4444" />
          <path d="M 58 25 A 40 40 0 0 1 72 30 L 63 44 A 24 24 0 0 0 55 41 Z" fill="#f59e0b" />
          <path d="M 72 30 A 40 40 0 0 1 84 44 L 71 52 A 24 24 0 0 0 63 44 Z" fill="#0ea5e9" />

          {/* Draaiende wijzer */}
          <g className="animate-spectrum-needle">
            <line x1="50" y1="64" x2="50" y2="20" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="64" x2="50" y2="20" stroke="#fecaca" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="50" cy="20" r="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
          </g>

          {/* Draaiknop */}
          <circle cx="50" cy="64" r="7" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
          <circle cx="50" cy="64" r="3" fill="#ef4444" />
        </svg>
      </div>
    </div>
  );
}

