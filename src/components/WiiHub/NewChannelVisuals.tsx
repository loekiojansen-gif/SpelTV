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

export function SpionVisual() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#4338ca] via-[#1e1b4b] to-[#020617] flex items-center justify-center overflow-hidden">
      {/* Zoeklicht dat over de tegel zwaait */}
      <div
        className="absolute -top-4 left-1/2 w-[160%] h-[200%] animate-spion-sweep pointer-events-none"
        style={{
          transformOrigin: '50% 0%',
          background:
            'conic-gradient(from 168deg at 50% 0%, transparent 0deg, rgba(253,224,71,0.42) 9deg, rgba(253,224,71,0.42) 15deg, transparent 24deg)',
        }}
      />
      <div className="relative w-16 h-16 flex items-center justify-center animate-channel-float z-10">
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          {/* Opstaande kraag */}
          <path d="M 22 96 L 34 64 L 50 82 L 66 64 L 78 96 Z" fill="#475569" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 34 64 L 50 82 L 44 96 L 28 96 Z" fill="#64748b" />
          {/* Gezicht in de schaduw */}
          <path d="M 30 44 Q 30 76 50 78 Q 70 76 70 44 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          {/* Ogen die heen en weer loeren */}
          <g className="animate-spion-eyes">
            <ellipse cx="41" cy="55" rx="6" ry="3.6" fill="#ffffff" />
            <ellipse cx="59" cy="55" rx="6" ry="3.6" fill="#ffffff" />
            <circle cx="41" cy="55" r="2.2" fill="#0f172a" />
            <circle cx="59" cy="55" r="2.2" fill="#0f172a" />
          </g>
          {/* Hoed */}
          <path d="M 30 42 Q 31 14 50 14 Q 69 14 70 42 Z" fill="#0f172a" stroke="#020617" strokeWidth="2" />
          <rect x="30" y="33" width="40" height="7" fill="#ef4444" />
          <ellipse cx="50" cy="43" rx="38" ry="7" fill="#0f172a" stroke="#020617" strokeWidth="2" />
          <ellipse cx="42" cy="41" rx="12" ry="1.6" fill="#ffffff" opacity="0.18" />
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
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 flex flex-col items-center gap-6 z-10">
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
