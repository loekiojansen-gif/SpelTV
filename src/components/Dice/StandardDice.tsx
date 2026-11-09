import React, { useState, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { Dices, RotateCcw, Hash } from 'lucide-react';

type DieType = 'D6' | 'COIN';
type ActiveMode = 'DICE' | 'RNG';

export function StandardDice() {
  const [subMode, setSubMode] = useState<ActiveMode>('DICE');

  // Dice state
  const [dieCount, setDieCount] = useState<number>(2);
  const [dieType, setDieType] = useState<DieType>('D6');
  const [currentValues, setCurrentValues] = useState<number[]>([3, 4]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const rollingIntervalRef = useRef<number | null>(null);

  // RNG state
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [rngCount, setRngCount] = useState<number>(1);
  const [preventDuplicates, setPreventDuplicates] = useState<boolean>(true);
  const [drawnPool, setDrawnPool] = useState<number[]>([]);
  const [currentRngResult, setCurrentRngResult] = useState<number[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [displayNumber, setDisplayNumber] = useState<number | string>(77);

  // Target coin values during roll
  const [targetCoinVals, setTargetCoinVals] = useState<number[]>([2, 2]);

  // Presets without 1-6
  const presets = [
    { label: '1 - 10', min: 1, max: 10 },
    { label: '1 - 20', min: 1, max: 20 },
    { label: '1 - 50', min: 1, max: 50 },
    { label: '1 - 100', min: 1, max: 100 },
  ];

  // 3D Cube Rotation helper
  const getCubeRotation = (val: number) => {
    switch (val) {
      case 1:
        return 'rotateX(-18deg) rotateY(20deg)';
      case 2:
        return 'rotateX(-18deg) rotateY(-70deg)';
      case 3:
        return 'rotateX(-108deg) rotateY(20deg)';
      case 4:
        return 'rotateX(72deg) rotateY(20deg)';
      case 5:
        return 'rotateX(-18deg) rotateY(110deg)';
      case 6:
        return 'rotateX(-18deg) rotateY(200deg)';
      default:
        return 'rotateX(-18deg) rotateY(20deg)';
    }
  };

  // Roll dice action
  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    sounds.playDiceRoll();

    if (dieType === 'COIN') {
      const nextCoins = Array.from({ length: dieCount }).map(
        () => Math.floor(Math.random() * 2) + 1
      );
      setTargetCoinVals(nextCoins);

      setTimeout(() => {
        setCurrentValues(nextCoins);
        setIsRolling(false);
        sounds.playTick(950);
      }, 1350);
    } else {
      if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
      rollingIntervalRef.current = window.setInterval(() => {
        setCurrentValues(
          Array.from({ length: dieCount }).map(() => Math.floor(Math.random() * 6) + 1)
        );
      }, 60);

      setTimeout(() => {
        if (rollingIntervalRef.current) {
          clearInterval(rollingIntervalRef.current);
          rollingIntervalRef.current = null;
        }

        const finalValues = Array.from({ length: dieCount }).map(
          () => Math.floor(Math.random() * 6) + 1
        );

        setCurrentValues(finalValues);
        setIsRolling(false);
        sounds.playTick(950);
      }, 700);
    }
  };

  // RNG Generate logic
  const handleGenerateRNG = () => {
    if (min >= max || isGenerating) return;

    let available: number[] = [];
    if (preventDuplicates) {
      for (let i = min; i <= max; i++) {
        if (!drawnPool.includes(i)) available.push(i);
      }
      if (available.length < rngCount) {
        available = [];
        for (let i = min; i <= max; i++) available.push(i);
        setDrawnPool([]);
      }
    } else {
      for (let i = min; i <= max; i++) available.push(i);
    }

    setIsGenerating(true);
    sounds.playTick(600);

    let count = 0;
    const interval = window.setInterval(() => {
      const temp = Array.from({ length: rngCount }).map(
        () => available[Math.floor(Math.random() * available.length)] || min
      );
      setDisplayNumber(temp[0]);
      sounds.playTick(450 + count * 20);
      count++;

      if (count > 16) {
        clearInterval(interval);
        const selected: number[] = [];
        const poolCopy = [...available];

        for (let j = 0; j < rngCount; j++) {
          if (poolCopy.length === 0) break;
          const idx = Math.floor(Math.random() * poolCopy.length);
          selected.push(poolCopy[idx]);
          if (preventDuplicates) {
            poolCopy.splice(idx, 1);
          }
        }

        setCurrentRngResult(selected);
        setDisplayNumber(selected[0]);
        setIsGenerating(false);
        sounds.playWiiSelect();

        if (preventDuplicates) {
          setDrawnPool(prev => [...prev, ...selected]);
        }
      }
    }, 45);
  };

  const totalSum = currentValues.slice(0, dieCount).reduce((a, b) => a + b, 0);

  const renderPipsForFace = (val: number) => {
    const pips: Record<number, boolean[]> = {
      1: [false, false, false, false, true, false, false, false, false],
      2: [true, false, false, false, false, false, false, false, true],
      3: [true, false, false, false, true, false, false, false, true],
      4: [true, false, true, false, false, false, true, false, true],
      5: [true, false, true, false, true, false, true, false, true],
      6: [true, false, true, true, false, true, true, false, true],
    };
    const active = pips[val] || pips[1];

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 sm:w-14 sm:h-14 p-1.5 gap-1 pointer-events-none">
        {active.map((hasPip, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {hasPip && (
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900 shadow-inner" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const totalRange = max - min + 1;
  const remainingInPool = preventDuplicates
    ? Math.max(0, totalRange - drawnPool.length)
    : totalRange;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Sub-selector: Dobbelstenen vs Getal Generator - Casino Mahogany & Gold */}
      <div className="w-full mb-3 flex items-center justify-center p-1 bg-[#180e08]/90 rounded-2xl border-2 border-amber-500/50 shadow-md">
        <button
          onClick={() => {
            setSubMode('DICE');
            sounds.playTick(700);
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subMode === 'DICE'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 shadow-xs border border-amber-200'
              : 'text-amber-200/70 hover:text-amber-100'
          }`}
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Klassiek Rollen</span>
        </button>
        <button
          onClick={() => {
            setSubMode('RNG');
            sounds.playTick(800);
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subMode === 'RNG'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 shadow-xs border border-amber-200'
              : 'text-amber-200/70 hover:text-amber-100'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Willekeurig Getal</span>
        </button>
      </div>

      {subMode === 'DICE' ? (
        <>
          <div className="w-full rounded-3xl p-4 sm:p-5 mb-3 text-center bg-[#180e08]/90 border-2 border-amber-500/50 shadow-lg text-amber-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Standaard Dobbelstenen
              </span>
              <div className="flex items-center gap-1 bg-[#2a170d] p-0.5 rounded-xl border border-amber-900/50">
                {(['D6', 'COIN'] as DieType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setDieType(type);
                      sounds.playTick(800);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      dieType === type
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 shadow-xs'
                        : 'text-amber-200/70 hover:text-amber-100'
                    }`}
                  >
                    {type === 'COIN' ? 'Munt' : 'D6'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-900/40">
              <span className="text-xs font-bold text-amber-200/80">Aantal stenen:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      setDieCount(count);
                      setCurrentValues(prev => {
                        if (count > prev.length) {
                          return [...prev, ...Array(count - prev.length).fill(1)];
                        }
                        return prev.slice(0, count);
                      });
                      sounds.playTick(600);
                    }}
                    className={`w-7 h-7 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      dieCount === count
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 shadow-xs scale-105 border border-amber-200'
                        : 'bg-[#2a170d] text-amber-200/80 hover:bg-[#3d2214]'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Arena - Click to roll (Casino felt with dark mahogany wood trim, no dots) */}
          <div
            onClick={handleRoll}
            className="w-full rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden bg-gradient-to-b from-[#0f4f2c] via-[#0b3d22] to-[#062916] border-8 sm:border-[12px] border-[#361a10] shadow-[inset_0_4px_16px_rgba(0,0,0,0.7),0_12px_28px_rgba(0,0,0,0.5)] cursor-pointer group active:scale-[0.99] transition-transform select-none"
            title="Klik om te rollen"
          >
            {/* Inner gold rim and casino felt cloth sheen */}
            <div className="absolute inset-1.5 sm:inset-2.5 rounded-2xl border border-amber-400/30 pointer-events-none" />
            <div className="absolute w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-9 my-auto relative z-10 py-4">
              {currentValues.slice(0, dieCount).map((val, idx) => (
                <div key={idx} className="relative flex flex-col items-center justify-center">
                  {dieType === 'D6' && (
                    <div className="dice-cube-scene">
                      <div
                        className={`dice-cube ${isRolling ? 'animate-cube-tumble' : ''}`}
                        style={{
                          transform: isRolling ? undefined : getCubeRotation(val),
                        }}
                      >
                        <div className="dice-cube-solid-core" />
                        <div className="dice-face dice-face-1">{renderPipsForFace(1)}</div>
                        <div className="dice-face dice-face-6">{renderPipsForFace(6)}</div>
                        <div className="dice-face dice-face-2">{renderPipsForFace(2)}</div>
                        <div className="dice-face dice-face-5">{renderPipsForFace(5)}</div>
                        <div className="dice-face dice-face-3">{renderPipsForFace(3)}</div>
                        <div className="dice-face dice-face-4">{renderPipsForFace(4)}</div>
                      </div>
                    </div>
                  )}

                  {dieType === 'COIN' && (
                    <div className="coin-3d-scene">
                      <div
                        className={`coin-3d ${
                          isRolling
                            ? (targetCoinVals[idx] ?? val) === 2
                              ? 'animate-coin-flip-kop'
                              : 'animate-coin-flip-munt'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          transform: isRolling
                            ? undefined
                            : val === 2
                            ? 'rotateY(0deg)'
                            : 'rotateY(180deg)',
                        }}
                      >
                        <div className="coin-edge-layer" />
                        <div className="coin-face coin-face-front">
                          <span className="text-2xl sm:text-3xl leading-none filter drop-shadow-xs">👑</span>
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-black mt-0.5 text-amber-900">
                            Kop
                          </span>
                        </div>
                        <div className="coin-face coin-face-back">
                          <span className="text-2xl sm:text-3xl leading-none filter drop-shadow-xs">🪙</span>
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-black mt-0.5 text-amber-900">
                            Munt
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`w-14 sm:w-16 h-3.5 sm:h-4 bg-slate-800/25 rounded-full filter blur-[3px] mt-3 sm:mt-4 transition-all pointer-events-none ${
                      isRolling ? 'animate-dice-shadow' : 'opacity-40'
                    }`}
                  />
                </div>
              ))}
            </div>

            {dieType !== 'COIN' && (
              <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180e08]/95 border-2 border-amber-400 shadow-md relative z-10 pointer-events-none">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Totaal:
                </span>
                <span className="text-xl font-black text-amber-400">{totalSum}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleRoll}
            disabled={isRolling}
            className="w-full mt-3 py-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-600 text-amber-100 border-2 border-amber-400 font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-50"
          >
            <Dices className="w-5 h-5 fill-current text-amber-300" />
            <span>Gooi Dobbelstenen! 🎲</span>
          </button>
        </>
      ) : (
        /* RNG SubMode - Casino Mahogany & Gold Theme */
        <>
          <div className="w-full rounded-3xl p-4 sm:p-5 mb-4 bg-[#180e08]/90 border-2 border-amber-500/50 shadow-xl text-amber-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Getal Generator Instellingen
              </span>
              {preventDuplicates && drawnPool.length > 0 && (
                <button
                  onClick={() => {
                    setDrawnPool([]);
                    setCurrentRngResult(null);
                    sounds.playTick(500);
                  }}
                  className="bg-amber-900/60 hover:bg-amber-800 text-amber-100 border border-amber-500/50 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Opnieuw</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  MINIMUM
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={e => setMin(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-2xl bg-white text-slate-950 border border-amber-300 font-black text-center outline-none shadow-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  MAXIMUM
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={e => setMax(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-2xl bg-white text-slate-950 border border-amber-300 font-black text-center outline-none shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3">
              <span className="text-[11px] font-bold text-amber-400/80 mr-1 shrink-0">Presets:</span>
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

            <div className="flex items-center justify-between pt-2 border-t border-amber-900/50 text-xs font-semibold text-amber-200/90">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preventDuplicates}
                  onChange={e => setPreventDuplicates(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span>Zonder dubbelen ({remainingInPool} over)</span>
              </label>

              <div className="flex items-center gap-1.5">
                <span>Aantal:</span>
                {[1, 2, 3].map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setRngCount(c);
                      sounds.playTick(600);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-black cursor-pointer transition-all ${
                      rngCount === c
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

          <div
            onClick={handleGenerateRNG}
            className="w-full rounded-3xl p-8 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden bg-gradient-to-b from-[#1a0e08] via-[#24130a] to-[#120804] border-2 border-amber-500/60 shadow-2xl text-center cursor-pointer active:scale-[0.99] transition-transform"
            title="Klik om een getal te trekken"
          >
            <div className="absolute w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            {currentRngResult && currentRngResult.length > 1 ? (
              <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                {currentRngResult.map((num, idx) => (
                  <div
                    key={idx}
                    className="w-18 h-18 rounded-2xl bg-gradient-to-b from-[#3a1d0f] to-[#200e06] border-2 border-amber-400 shadow-xl flex items-center justify-center text-3xl font-black text-amber-300"
                  >
                    {num}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`font-black text-7xl sm:text-8xl tracking-tight transition-transform duration-100 relative z-10 ${
                  isGenerating ? 'scale-110 text-yellow-400' : 'text-amber-400 drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]'
                }`}
              >
                {displayNumber}
              </div>
            )}

            <span className="text-xs font-bold text-amber-300/70 mt-3 relative z-10 uppercase tracking-widest">
              Bereik: {min} t/m {max}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
