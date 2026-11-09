import { useState, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { Hash, RotateCcw, Sparkles, History, Check, Copy } from 'lucide-react';

interface NumberHistoryItem {
  id: string;
  numbers: number[];
  range: string;
  time: string;
}

export function RandomNumberApp() {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(1);
  const [preventDuplicates, setPreventDuplicates] = useState<boolean>(true);
  const [drawnPool, setDrawnPool] = useState<number[]>([]);
  const [currentResult, setCurrentResult] = useState<number[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [displayNumber, setDisplayNumber] = useState<number | string>(77);
  const [history, setHistory] = useState<NumberHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const presets = [
    { label: '1 - 6', min: 1, max: 6 },
    { label: '1 - 10', min: 1, max: 10 },
    { label: '1 - 20', min: 1, max: 20 },
    { label: '1 - 50', min: 1, max: 50 },
    { label: '1 - 100', min: 1, max: 100 },
  ];

  const handleGenerate = () => {
    if (min >= max) return;
    if (isGenerating) return;

    // Check available pool if unique
    const totalPossible = max - min + 1;
    let available: number[] = [];
    if (preventDuplicates) {
      for (let i = min; i <= max; i++) {
        if (!drawnPool.includes(i)) available.push(i);
      }
      if (available.length < count) {
        // Pool exhausted, reset pool
        available = [];
        for (let i = min; i <= max; i++) available.push(i);
        setDrawnPool([]);
      }
    } else {
      for (let i = min; i <= max; i++) available.push(i);
    }

    setIsGenerating(true);

    // Animated fast rolling suspense numbers
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      const randomDisplay = Math.floor(Math.random() * (max - min + 1)) + min;
      setDisplayNumber(randomDisplay);
      sounds.playTick(500 + ticks * 25);

      if (ticks >= 14) {
        clearInterval(interval);

        // Pick winners
        const selected: number[] = [];
        const poolCopy = [...available];
        for (let c = 0; c < count; c++) {
          if (poolCopy.length === 0) break;
          const randomIndex = Math.floor(Math.random() * poolCopy.length);
          const chosen = poolCopy.splice(randomIndex, 1)[0];
          selected.push(chosen);
        }

        setCurrentResult(selected);
        setDisplayNumber(selected[0]);
        setIsGenerating(false);
        sounds.playWiiSelect();

        if (preventDuplicates) {
          setDrawnPool(prev => [...prev, ...selected]);
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setHistory(prev => [
          {
            id: Date.now().toString(),
            numbers: selected,
            range: `${min} - ${max}`,
            time: timeStr,
          },
          ...prev.slice(0, 14),
        ]);
      }
    }, 45);
  };

  const handleResetPool = () => {
    setDrawnPool([]);
    setCurrentResult(null);
    sounds.playTick(500);
  };

  const handleCopy = (item: NumberHistoryItem) => {
    navigator.clipboard.writeText(item.numbers.join(', '));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const totalRange = max - min + 1;
  const remainingInPool = preventDuplicates
    ? Math.max(0, totalRange - drawnPool.length)
    : totalRange;

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto px-4 pb-12 select-none">
      {/* Title Card - Casino Brown & Gold */}
      <div className="w-full rounded-3xl p-4 sm:p-5 mb-4 bg-[#180e08]/90 border-2 border-amber-500/50 shadow-xl text-amber-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔢</span>
            <h2 className="font-black text-white text-xl tracking-tight">
              Willekeurig Getal
            </h2>
          </div>
          {preventDuplicates && drawnPool.length > 0 && (
            <button
              onClick={handleResetPool}
              className="bg-amber-900/60 hover:bg-amber-800 text-amber-100 border border-amber-500/50 px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Pool Resetten</span>
            </button>
          )}
        </div>

        {/* Range Inputs: Min & Max */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
              Minimum (Vanaf)
            </label>
            <input
              type="number"
              value={min}
              onChange={e => setMin(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 rounded-2xl text-center font-black text-base bg-white text-slate-950 border border-amber-300 outline-none shadow-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
              Maximum (Tot en met)
            </label>
            <input
              type="number"
              value={max}
              onChange={e => setMax(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 rounded-2xl text-center font-black text-base bg-white text-slate-950 border border-amber-300 outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3">
          <span className="text-[11px] font-bold text-amber-400/80 mr-1 shrink-0">
            Presets:
          </span>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => {
                setMin(p.min);
                setMax(p.max);
                sounds.playTick(700);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                min === p.min && max === p.max
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 shadow-xs border border-amber-200'
                  : 'bg-[#2a170d] hover:bg-[#3d2214] text-amber-200 border border-amber-800/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Toggles: Duplicate prevention & Count */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-900/50 text-xs font-semibold text-amber-200/90">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preventDuplicates}
              onChange={e => setPreventDuplicates(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 accent-amber-500"
            />
            <span>Zonder dubbelen ({remainingInPool} over)</span>
          </label>

          <div className="flex items-center gap-1.5">
            <span>Aantal:</span>
            {[1, 2, 3].map(c => (
              <button
                key={c}
                onClick={() => {
                  setCount(c);
                  sounds.playTick(600);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-black cursor-pointer transition-all ${
                  count === c
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-xs'
                    : 'bg-[#2a170d] text-amber-300/80 border border-amber-800/40 hover:bg-[#3d2214]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Big Result Display Arena - Casino Felt */}
      <div className="w-full rounded-3xl p-8 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden bg-gradient-to-b from-[#0f4f2c] via-[#0b3d22] to-[#062916] border-8 sm:border-[10px] border-[#361a10] shadow-[inset_0_4px_16px_rgba(0,0,0,0.7),0_12px_28px_rgba(0,0,0,0.5)] text-center">
        {/* Glow backdrop */}
        <div className="absolute w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        {/* Numbers Display */}
        {currentResult && currentResult.length > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            {currentResult.map((num, idx) => (
              <div
                key={idx}
                className="w-18 h-18 rounded-2xl bg-gradient-to-b from-amber-400 to-yellow-500 border-2 border-white shadow-xl flex items-center justify-center text-3xl font-black text-slate-950"
              >
                {num}
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`font-black text-7xl sm:text-8xl text-amber-300 drop-shadow-[0_4px_16px_rgba(251,191,36,0.6)] tracking-tight transition-transform duration-100 relative z-10 font-mono ${
              isGenerating ? 'scale-110 text-yellow-200' : ''
            }`}
          >
            {displayNumber}
          </div>
        )}

        <span className="text-xs font-bold text-amber-300/80 mt-3 relative z-10 uppercase tracking-widest">
          Bereik: {min} t/m {max}
        </span>
      </div>

      {/* Big Action Button */}
      <div className="w-full mt-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-lg sm:text-xl shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200"
        >
          <Sparkles className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Trekken...' : 'GENEREER GETAL'}</span>
        </button>
      </div>

      {/* History Log - Casino Brown & Gold */}
      {history.length > 0 && (
        <div className="w-full rounded-3xl p-4 mt-4 bg-[#180e08]/90 border-2 border-amber-500/50 shadow-xl text-amber-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Getrokken Geschiedenis</span>
            </div>
            <button
              onClick={() => setHistory([])}
              className="text-[11px] font-bold text-amber-300/70 hover:text-white cursor-pointer"
            >
              Wissen
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pt-1">
            {history.map(item => (
              <div
                key={item.id}
                onClick={() => handleCopy(item)}
                className="px-3 py-1.5 rounded-xl bg-[#2a170d] border border-amber-700/50 text-xs font-bold text-amber-100 shadow-2xs flex items-center gap-2 cursor-pointer hover:border-amber-400"
                title="Klik om te kopiëren"
              >
                <span className="text-amber-400/70 text-[10px]">{item.time}</span>
                <span className="text-amber-300 font-extrabold text-sm">
                  {item.numbers.join(', ')}
                </span>
                {copiedId === item.id ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-amber-400/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
