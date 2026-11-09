import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import {
  Dices,
  RotateCcw,
  Lock,
  Unlock,
  Check,
  Trophy,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface ScoreCategory {
  id: string;
  name: string;
  description: string;
  section: 'upper' | 'lower';
}

const CATEGORIES: ScoreCategory[] = [
  { id: 'ones', name: 'Enen (1)', description: 'Som van alle enen', section: 'upper' },
  { id: 'twos', name: 'Tweeën (2)', description: 'Som van alle tweeën', section: 'upper' },
  { id: 'threes', name: 'Drieën (3)', description: 'Som van alle drieën', section: 'upper' },
  { id: 'fours', name: 'Vieren (4)', description: 'Som van alle vieren', section: 'upper' },
  { id: 'fives', name: 'Vijven (5)', description: 'Som van alle vijven', section: 'upper' },
  { id: 'sixes', name: 'Zessen (6)', description: 'Som van alle zessen', section: 'upper' },
  { id: 'three_kind', name: 'Three of a Kind', description: 'Min. 3 gelijken: som van alle 5', section: 'lower' },
  { id: 'four_kind', name: 'Carré (4 of a Kind)', description: 'Min. 4 gelijken: som van alle 5', section: 'lower' },
  { id: 'full_house', name: 'Full House (25 pt)', description: '3 gelijken + 2 gelijken', section: 'lower' },
  { id: 'small_straight', name: 'Kleine Straat (30 pt)', description: '4 opeenvolgende stenen', section: 'lower' },
  { id: 'large_straight', name: 'Grote Straat (40 pt)', description: '5 opeenvolgende stenen', section: 'lower' },
  { id: 'yahtzee', name: 'YAHTZEE (50 pt)', description: '5 gelijke dobbelstenen!', section: 'lower' },
  { id: 'chance', name: 'Chance (Kans)', description: 'Vrije som van alle stenen', section: 'lower' },
];

export function YahtzeeGame() {
  const [currentValues, setCurrentValues] = useState<number[]>([1, 2, 3, 4, 5]);
  const [lockedDice, setLockedDice] = useState<boolean[]>([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState<number>(3); // 3, 2, 1, 0
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState<boolean>(false);

  const rollingIntervalRef = useRef<number | null>(null);

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

  // Toggle lock for die idx
  const handleToggleLock = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isRolling || rollsLeft === 3) return; // Cannot hold before first roll
    setLockedDice(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
    sounds.playTick(lockedDice[idx] ? 450 : 750);
  };

  // Roll dice
  const handleRoll = () => {
    if (isRolling || rollsLeft <= 0) return;

    let activeLocks = lockedDice;
    if (activeLocks.every(Boolean)) {
      activeLocks = [false, false, false, false, false];
      setLockedDice(activeLocks);
    }

    setIsRolling(true);
    sounds.playDiceRoll();

    if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
    rollingIntervalRef.current = window.setInterval(() => {
      setCurrentValues(prev =>
        prev.map((val, idx) => (activeLocks[idx] ? val : Math.floor(Math.random() * 6) + 1))
      );
    }, 60);

    setTimeout(() => {
      if (rollingIntervalRef.current) {
        clearInterval(rollingIntervalRef.current);
        rollingIntervalRef.current = null;
      }

      const final = currentValues.map((val, idx) =>
        activeLocks[idx] ? val : Math.floor(Math.random() * 6) + 1
      );
      setCurrentValues(final);
      setIsRolling(false);
      setRollsLeft(prev => prev - 1);
      sounds.playTick(950);
    }, 700);
  };

  // Calculate potential score for a category based on current dice
  const calculateScoreForCategory = (catId: string, dice: number[]): number => {
    const sumAll = dice.reduce((a, b) => a + b, 0);
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    dice.forEach(d => {
      counts[d] = (counts[d] || 0) + 1;
    });

    switch (catId) {
      case 'ones':
        return (counts[1] || 0) * 1;
      case 'twos':
        return (counts[2] || 0) * 2;
      case 'threes':
        return (counts[3] || 0) * 3;
      case 'fours':
        return (counts[4] || 0) * 4;
      case 'fives':
        return (counts[5] || 0) * 5;
      case 'sixes':
        return (counts[6] || 0) * 6;
      case 'three_kind':
        return Object.values(counts).some(c => c >= 3) ? sumAll : 0;
      case 'four_kind':
        return Object.values(counts).some(c => c >= 4) ? sumAll : 0;
      case 'full_house': {
        const vals = Object.values(counts).filter(c => c > 0);
        const isFH = (vals.includes(3) && vals.includes(2)) || vals.includes(5);
        return isFH ? 25 : 0;
      }
      case 'small_straight': {
        const unique = Array.from(new Set(dice)).sort();
        const str = unique.join('');
        const hasSS =
          str.includes('1234') || str.includes('2345') || str.includes('3456');
        return hasSS ? 30 : 0;
      }
      case 'large_straight': {
        const unique = Array.from(new Set(dice)).sort();
        const str = unique.join('');
        const hasLS = str === '12345' || str === '23456';
        return hasLS ? 40 : 0;
      }
      case 'yahtzee':
        return Object.values(counts).some(c => c === 5) ? 50 : 0;
      case 'chance':
        return sumAll;
      default:
        return 0;
    }
  };

  // Claim category
  const handleClaimCategory = (catId: string) => {
    if (scores[catId] !== undefined || rollsLeft === 3) return; // Cannot claim before rolling

    const earned = calculateScoreForCategory(catId, currentValues);
    const newScores = { ...scores, [catId]: earned };
    setScores(newScores);

    // Audio / celebration
    if (catId === 'yahtzee' && earned === 50) {
      sounds.playFanfare();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } else {
      sounds.playCorrectDing();
    }

    // Reset turn for next round
    setLockedDice([false, false, false, false, false]);
    setRollsLeft(3);

    // Check game over
    if (Object.keys(newScores).length === CATEGORIES.length) {
      setGameOver(true);
      sounds.playFanfare();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    }
  };

  // Totals
  const upperCategories = CATEGORIES.filter(c => c.section === 'upper');
  const upperSubtotal = upperCategories.reduce((acc, cat) => acc + (scores[cat.id] ?? 0), 0);
  const upperBonus = upperSubtotal >= 63 ? 35 : 0;
  const upperTotal = upperSubtotal + upperBonus;

  const lowerCategories = CATEGORIES.filter(c => c.section === 'lower');
  const lowerTotal = lowerCategories.reduce((acc, cat) => acc + (scores[cat.id] ?? 0), 0);
  const grandTotal = upperTotal + lowerTotal;

  const handleResetGame = () => {
    setScores({});
    setRollsLeft(3);
    setLockedDice([false, false, false, false, false]);
    setCurrentValues([1, 2, 3, 4, 5]);
    setGameOver(false);
    sounds.playTick(500);
  };

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
      <div className="grid grid-cols-3 grid-rows-3 w-10 h-10 sm:w-12 sm:h-12 p-1 gap-1 pointer-events-none">
        {active.map((hasPip, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {hasPip && (
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-900 shadow-inner" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Yahtzee Header Card - Casino Brown & Gold */}
      <div className="w-full rounded-3xl p-3.5 sm:p-4 mb-3 bg-[#180e08]/90 border-2 border-amber-500/50 shadow-xl text-amber-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="font-black text-white text-base sm:text-lg tracking-tight">
                Yahtzee
              </h2>
              <span className="text-[10px] font-bold text-amber-300 block -mt-0.5">
                Gooi 3x per beurt, zet stenen vast en vul de scorekaart in!
              </span>
            </div>
          </div>

          <button
            onClick={handleResetGame}
            className="bg-amber-900/60 hover:bg-amber-800 text-amber-100 border border-amber-500/50 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Nieuw Spel</span>
          </button>
        </div>

        {/* Turn status bar */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-900/50 text-xs font-bold">
          <span className="text-amber-300/80">
            {rollsLeft === 3
              ? 'Begin je beurt met de 1e worp'
              : rollsLeft > 0
              ? `Nog ${rollsLeft} ${rollsLeft === 1 ? 'worp' : 'worpen'} over`
              : 'Worpen op! Kies een vakje op de scorekaart.'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-2xs">
            Worp {4 - rollsLeft} / 3
          </span>
        </div>
      </div>

      {/* 5 Dices Arena - Casino felt with dark mahogany wood trim */}
      <div className="w-full rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden bg-gradient-to-b from-[#0f4f2c] via-[#0b3d22] to-[#062916] border-8 sm:border-[10px] border-[#361a10] shadow-[inset_0_4px_16px_rgba(0,0,0,0.7),0_12px_28px_rgba(0,0,0,0.5)] select-none mb-3">
        {/* Inner gold line and felt sheen */}
        <div className="absolute inset-1.5 sm:inset-2 rounded-2xl border border-amber-400/30 pointer-events-none" />
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-auto relative z-10 py-2">
          {currentValues.map((val, idx) => {
            const isLocked = lockedDice[idx];

            return (
              <div
                key={idx}
                onClick={e => handleToggleLock(idx, e)}
                className={`relative flex flex-col items-center justify-center p-1.5 rounded-2xl cursor-pointer transition-all ${
                  isLocked
                    ? 'bg-amber-100/90 ring-3 ring-amber-400 shadow-md scale-105'
                    : 'hover:bg-slate-100/80 active:scale-95'
                }`}
                title={rollsLeft === 3 ? 'Gooi eerst!' : isLocked ? 'Loslaten' : 'Vastzetten'}
              >
                <div className="mb-1">
                  {isLocked ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black shadow-xs">
                      <Lock className="w-2 h-2" />
                      <span>Vast</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-300">
                      {rollsLeft < 3 ? 'Los' : '-'}
                    </span>
                  )}
                </div>

                <div className="dice-cube-scene scale-85 sm:scale-95">
                  <div
                    className={`dice-cube ${isRolling && !isLocked ? 'animate-cube-tumble' : ''}`}
                    style={{
                      transform: isRolling && !isLocked ? undefined : getCubeRotation(val),
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

                <div
                  className={`w-12 h-3 bg-slate-800/25 rounded-full filter blur-[2px] mt-2 transition-all pointer-events-none ${
                    isRolling && !isLocked ? 'animate-dice-shadow' : 'opacity-40'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Roll Button */}
        <button
          onClick={handleRoll}
          disabled={isRolling || rollsLeft <= 0}
          className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-40 border border-amber-300"
        >
          <Dices className="w-5 h-5 fill-current" />
          <span>
            {rollsLeft === 3
              ? 'Eerste Worp Gooien 🎲'
              : rollsLeft > 0
              ? `Gooi Losse Stenen (${rollsLeft} over)`
              : 'Kies een vakje hieronder ⬇️'}
          </span>
        </button>
      </div>

      {/* YAHTZEE SCORECARD BLOCK - Casino Brown & Gold */}
      <div className="w-full rounded-3xl p-3.5 sm:p-4 bg-[#180e08]/90 border-2 border-amber-500/50 shadow-xl text-amber-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-white uppercase tracking-wider">
            Yahtzee Scorekaart
          </span>
          <span className="text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-0.5 rounded-full shadow-2xs">
            Totaal: {grandTotal} pt
          </span>
        </div>

        {/* Section 1: Upper Part */}
        <div className="mb-3">
          <span className="text-[10px] font-black text-amber-300/80 uppercase tracking-widest block mb-1">
            Bovenste Helft (Bonus +35 pt bij 63+)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {upperCategories.map(cat => {
              const isFilled = scores[cat.id] !== undefined;
              const potential = calculateScoreForCategory(cat.id, currentValues);

              return (
                <button
                  key={cat.id}
                  onClick={() => handleClaimCategory(cat.id)}
                  disabled={isFilled || rollsLeft === 3}
                  className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                    isFilled
                      ? 'bg-[#2a170d]/90 border-amber-800/40 opacity-90 cursor-default text-amber-200'
                      : rollsLeft < 3
                      ? 'bg-[#2a170d] hover:bg-[#3d2214] border-amber-500/60 shadow-2xs cursor-pointer text-white'
                      : 'bg-[#1f120a] border-amber-950 opacity-60 text-amber-400/50 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{cat.name}</div>
                  </div>
                  <div className="text-right">
                    {isFilled ? (
                      <span className="text-xs font-black text-white">{scores[cat.id]}</span>
                    ) : rollsLeft < 3 ? (
                      <span className="text-xs font-black text-amber-400">+{potential}</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-500/40">-</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Upper Total & Bonus */}
          <div className="mt-1.5 flex items-center justify-between px-2 text-[11px] font-bold text-amber-300/80">
            <span>Subtotaal: {upperSubtotal} / 63 pt</span>
            <span>Bonus (+35): <strong className={upperBonus > 0 ? 'text-amber-300 font-black' : ''}>{upperBonus} pt</strong></span>
          </div>
        </div>

        {/* Section 2: Lower Part */}
        <div>
          <span className="text-[10px] font-black text-amber-300/80 uppercase tracking-widest block mb-1">
            Onderste Helft (Combinaties)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {lowerCategories.map(cat => {
              const isFilled = scores[cat.id] !== undefined;
              const potential = calculateScoreForCategory(cat.id, currentValues);

              return (
                <button
                  key={cat.id}
                  onClick={() => handleClaimCategory(cat.id)}
                  disabled={isFilled || rollsLeft === 3}
                  className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                    isFilled
                      ? 'bg-[#2a170d]/90 border-amber-800/40 opacity-90 cursor-default text-amber-200'
                      : rollsLeft < 3
                      ? 'bg-[#2a170d] hover:bg-[#3d2214] border-amber-500/60 shadow-2xs cursor-pointer text-white'
                      : 'bg-[#1f120a] border-amber-950 opacity-60 text-amber-400/50 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{cat.name}</div>
                    <div className="text-[10px] text-amber-300/70">{cat.description}</div>
                  </div>
                  <div className="text-right">
                    {isFilled ? (
                      <span className="text-xs font-black text-white">{scores[cat.id]}</span>
                    ) : rollsLeft < 3 ? (
                      <span className="text-xs font-black text-amber-400">+{potential}</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-500/40">-</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grand Total Footer */}
        <div className="mt-3 pt-2 border-t border-amber-900/50 flex items-center justify-between">
          <span className="text-xs font-black text-white">TOTAAL GENERALE:</span>
          <span className="text-lg font-black text-amber-400">{grandTotal} punten</span>
        </div>
      </div>
    </div>
  );
}
