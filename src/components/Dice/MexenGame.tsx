import React, { useState, useRef } from 'react';
import { sounds } from '../../utils/audio';
import {
  Dices,
  RotateCcw,
  Eye,
  Lock,
  Unlock,
  Sparkles,
  HelpCircle,
  Users,
  Plus,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';

interface MexPlayer {
  id: string;
  name: string;
  lives: number; // typically 6 lives
}

export function MexenGame() {
  const [currentValues, setCurrentValues] = useState<number[]>([2, 1]);
  const [lockedDice, setLockedDice] = useState<[boolean, boolean]>([false, false]);
  const [isCovered, setIsCovered] = useState<boolean>(false);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollCount, setRollCount] = useState<number>(1);
  const [maxRolls, setMaxRolls] = useState<number>(3); // 1, 2, or 3
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Optional party players & lives
  const [players, setPlayers] = useState<MexPlayer[]>([
    { id: 'p1', name: 'Speler 1', lives: 6 },
    { id: 'p2', name: 'Speler 2', lives: 6 },
  ]);
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [newPlayerName, setNewPlayerName] = useState<string>('');

  const rollingIntervalRef = useRef<number | null>(null);

  // 3D Cube Rotation
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

  // Toggle lock for die 0 or 1
  const handleToggleLock = (idx: 0 | 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isRolling) return;
    setLockedDice(prev => {
      const next: [boolean, boolean] = [...prev];
      next[idx] = !next[idx];
      return next;
    });
    sounds.playTick(lockedDice[idx] ? 450 : 750);
  };

  // Roll dice (respects single held die)
  const handleRoll = () => {
    if (isRolling) return;

    // If both are locked, unlock them
    let activeLocks = lockedDice;
    if (lockedDice[0] && lockedDice[1]) {
      activeLocks = [false, false];
      setLockedDice(activeLocks);
    }

    setIsRolling(true);
    sounds.playDiceRoll();

    if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
    rollingIntervalRef.current = window.setInterval(() => {
      setCurrentValues(prev => [
        activeLocks[0] ? prev[0] : Math.floor(Math.random() * 6) + 1,
        activeLocks[1] ? prev[1] : Math.floor(Math.random() * 6) + 1,
      ]);
    }, 60);

    setTimeout(() => {
      if (rollingIntervalRef.current) {
        clearInterval(rollingIntervalRef.current);
        rollingIntervalRef.current = null;
      }

      const final1 = activeLocks[0] ? currentValues[0] : Math.floor(Math.random() * 6) + 1;
      const final2 = activeLocks[1] ? currentValues[1] : Math.floor(Math.random() * 6) + 1;
      setCurrentValues([final1, final2]);
      setIsRolling(false);
      setRollCount(prev => prev + 1);
      sounds.playTick(950);
    }, 700);
  };

  // Calculate Mexen score
  const getMexScore = () => {
    const d1 = currentValues[0] || 1;
    const d2 = currentValues[1] || 1;
    const high = Math.max(d1, d2);
    const low = Math.min(d1, d2);

    if (high === 2 && low === 1) {
      return { score: '21', label: 'MEX! 👑', isMex: true, rank: 1000 };
    }
    if (high === low) {
      return { score: `${high * 100}`, label: `${high * 100} (Honderdtal)`, isDouble: true, rank: 500 + high * 10 };
    }
    const val = high * 10 + low;
    return { score: `${val}`, label: `${val}`, isNormal: true, rank: val };
  };

  const mexInfo = getMexScore();

  // Reset turn / pass to next player
  const handleNextPlayer = () => {
    setLockedDice([false, false]);
    setRollCount(1);
    setIsCovered(false);
    setIsPeeking(false);
    if (players.length > 0) {
      setActivePlayerIdx(prev => (prev + 1) % players.length);
    }
    sounds.playWiiSelect();
  };

  const handleLoseLife = (playerIdx: number) => {
    setPlayers(prev =>
      prev.map((p, i) => (i === playerIdx ? { ...p, lives: Math.max(0, p.lives - 1) } : p))
    );
    sounds.playBuzzer();
  };

  const handleAddPlayer = (e?: React.FormEvent, customName?: string) => {
    if (e) e.preventDefault();
    const raw = customName !== undefined ? customName : newPlayerName;
    const trimmed = raw.trim();
    if (!trimmed) return;
    setPlayers(prev => [...prev, { id: `mex-p-${Date.now()}`, name: trimmed, lives: 6 }]);
    if (customName === undefined) setNewPlayerName('');
    sounds.playTick(700);
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mexen Control Card - Casino Brown & Gold Style */}
      <div className="w-full rounded-3xl p-4 sm:p-5 mb-3 bg-[#180e08]/90 border-2 border-amber-500/50 shadow-xl text-amber-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍺</span>
            <div>
              <h2 className="font-black text-white text-base sm:text-lg tracking-tight">
                Mexen (Mexico)
              </h2>
              <span className="text-[10px] font-bold text-amber-300 block -mt-0.5">
                Gooi hoog, bluf onder de beker en verlies geen levens!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRulesModal(true)}
              className="text-xs font-black text-amber-200 bg-amber-900/60 hover:bg-amber-800 border border-amber-500/50 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Regels</span>
            </button>
          </div>
        </div>

        {/* Action Toggle Bar: Beker Afdekken & Max Worpen */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-900/50 gap-2 flex-wrap">
          <button
            onClick={() => {
              setIsCovered(prev => !prev);
              setIsPeeking(false);
              sounds.playTick(isCovered ? 500 : 700);
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isCovered
                ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 ring-2 ring-amber-300'
                : 'bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border border-amber-600/40'
            }`}
          >
            <span>🍺</span>
            <span>{isCovered ? 'Afgedekt onder Beker' : 'Dek af (Gesloten Mexen)'}</span>
          </button>

          {/* Worp counter & limit */}
          <div className="flex items-center gap-1 text-xs font-bold text-amber-300/80">
            <span>Worp: <strong className="text-white">{rollCount}</strong> / {maxRolls}</span>
            <div className="flex gap-0.5 ml-1">
              {[1, 2, 3].map(lim => (
                <button
                  key={lim}
                  onClick={() => setMaxRolls(lim)}
                  className={`w-5 h-5 rounded-md text-[10px] font-black cursor-pointer transition-all ${
                    maxRolls === lim
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-xs'
                      : 'bg-amber-950/80 text-amber-300/70 border border-amber-800/40 hover:bg-amber-900/60'
                  }`}
                  title={`Max ${lim} worpen per beurt`}
                >
                  {lim}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tip for holding 1 die */}
        <div className="text-[11px] font-semibold text-amber-300/70 mt-2 flex items-center justify-between">
          <span>💡 Tik op 1 dobbelsteen om hem te laten liggen voor je volgende worp.</span>
          {(lockedDice[0] || lockedDice[1]) && (
            <button
              onClick={() => setLockedDice([false, false])}
              className="text-amber-300 font-bold underline cursor-pointer hover:text-white"
            >
              Loslaten
            </button>
          )}
        </div>
      </div>

      {/* Interactive 3D Dice Arena - Casino felt with dark mahogany wood trim */}
      <div className="w-full rounded-3xl p-5 sm:p-7 flex flex-col items-center justify-center min-h-[310px] relative overflow-hidden bg-gradient-to-b from-[#0f4f2c] via-[#0b3d22] to-[#062916] border-8 sm:border-[12px] border-[#361a10] shadow-[inset_0_4px_16px_rgba(0,0,0,0.7),0_12px_28px_rgba(0,0,0,0.5)] select-none mb-3">
        {/* Inner gold line and smooth felt sheen */}
        <div className="absolute inset-1.5 sm:inset-2.5 rounded-2xl border border-amber-400/30 pointer-events-none" />
        {/* =================================================================
            GESLOTEN MEXEN: BEKER STATE
           ================================================================= */}
        {isCovered && !isPeeking ? (
          <div className="w-full flex flex-col items-center justify-center py-6 relative z-20 animate-in zoom-in duration-200">
            <div
              onClick={handleRoll}
              className="relative group cursor-pointer active:scale-95 transition-transform"
              title="Klik om onder de beker te schudden"
            >
              <div
                className={`w-40 h-44 sm:w-48 sm:h-52 rounded-t-3xl rounded-b-2xl bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 border-4 border-amber-600 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden ${
                  isRolling ? 'animate-bounce' : ''
                }`}
              >
                <div className="absolute inset-x-2 top-2 h-1 bg-amber-700/60 rounded-full" />
                <div className="absolute inset-x-2 bottom-3 h-1.5 bg-amber-700/60 rounded-full" />

                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white shadow-md flex items-center justify-center text-2xl mb-1">
                  🍺
                </div>
                <span className="text-white font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow-xs">
                  Onder de Beker
                </span>
                <span className="text-[10px] text-amber-200/80 font-bold mt-0.5">
                  {isRolling ? 'Schudden...' : 'Gesloten gerold 🤫'}
                </span>
              </div>
              <div className="w-44 sm:w-52 h-5 bg-slate-900/40 rounded-full filter blur-[4px] mt-2 mx-auto" />
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                onMouseDown={() => setIsPeeking(true)}
                onMouseUp={() => setIsPeeking(false)}
                onTouchStart={() => setIsPeeking(true)}
                onTouchEnd={() => setIsPeeking(false)}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Houd vast om te Spieken 👀</span>
              </button>

              <button
                onClick={() => {
                  setIsCovered(false);
                  setIsPeeking(false);
                  sounds.playReveal();
                }}
                className="px-4 py-2.5 rounded-2xl wii-btn-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
              >
                <span>Beker Optillen 🔓</span>
              </button>
            </div>
          </div>
        ) : (
          /* =================================================================
              OPEN EN PEEKING MEXEN WEERGAVE
             ================================================================= */
          <div className="w-full flex flex-col items-center">
            {isCovered && isPeeking && (
              <div className="mb-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black flex items-center gap-1 animate-pulse border border-amber-300">
                <Eye className="w-3.5 h-3.5" />
                <span>Je spiekt stiekem! Laat los om weer te sluiten.</span>
              </div>
            )}

            {/* 2 Dices */}
            <div className="flex items-center justify-center gap-8 my-auto relative z-10 py-3">
              {[0, 1].map(idx => {
                const val = currentValues[idx];
                const isLocked = lockedDice[idx];

                return (
                  <div
                    key={idx}
                    onClick={e => handleToggleLock(idx as 0 | 1, e)}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-all ${
                      isLocked
                        ? 'bg-amber-100/90 ring-4 ring-amber-400 shadow-md scale-105'
                        : 'hover:bg-slate-100/80 active:scale-95'
                    }`}
                    title={isLocked ? 'Klik om los te laten' : 'Klik om te laten liggen'}
                  >
                    <div className="mb-1.5">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Blijft liggen</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 hover:text-slate-500 flex items-center gap-0.5">
                          <Unlock className="w-2.5 h-2.5" />
                          <span>Vastzetten</span>
                        </span>
                      )}
                    </div>

                    <div className="dice-cube-scene">
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
                      className={`w-16 h-4 bg-slate-800/25 rounded-full filter blur-[3px] mt-4 transition-all pointer-events-none ${
                        isRolling && !isLocked ? 'animate-dice-shadow' : 'opacity-40'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Mex Score Banner */}
            <div className="mt-4 flex items-center gap-2 px-5 py-2 rounded-full bg-white/95 border-2 border-amber-300 shadow-md">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Mexen Score:
              </span>
              <span
                className={`text-2xl font-black ${
                  mexInfo.isMex ? 'text-amber-600 animate-pulse' : 'text-slate-800'
                }`}
              >
                {mexInfo.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: Roll & Next Turn - Casino Gold & Mahogany */}
      <div className="w-full flex gap-2 mb-4">
        <button
          onClick={handleRoll}
          disabled={isRolling || rollCount > maxRolls}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-40 border border-amber-300"
        >
          <Dices className="w-5 h-5 fill-current" />
          <span>
            {isCovered ? 'Schud onder de Beker 🍺' : `Gooi Worp ${rollCount} / ${maxRolls}`}
          </span>
        </button>

        <button
          onClick={handleNextPlayer}
          className="px-4 py-4 rounded-2xl bg-[#2a170d] hover:bg-[#3d2214] text-amber-100 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 border border-amber-500/50"
        >
          <span>Volgende Beurt</span>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* SPELERS & LEVENS (OPTIONEEL) - Casino Brown & Gold */}
      <div className="w-full rounded-3xl p-3.5 sm:p-4 bg-[#180e08]/90 border-2 border-amber-500/50 shadow-xl text-amber-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            <h4 className="font-black text-white text-xs sm:text-sm">
              Spelers & Levens (6 per persoon)
            </h4>
          </div>
          {players.length > 0 && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-900/80 border border-amber-600/40 px-2 py-0.5 rounded-full">
              Beurt: {players[activePlayerIdx]?.name || 'Niemand'}
            </span>
          )}
        </div>

        <form onSubmit={handleAddPlayer} className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <input
            type="text"
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            placeholder="Voeg speler toe..."
            className="flex-1 min-w-[130px] px-3 py-1.5 text-xs font-bold bg-[#2a170d] text-amber-100 placeholder-amber-400/50 rounded-xl border border-amber-600/40 outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black cursor-pointer transition-colors shadow-2xs"
          >
            + Speler
          </button>
          <PlayerPickerDropdown
            compact
            existingNames={players.map(p => p.name)}
            buttonLabel="Speler"
            buttonClassName="px-2.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-100 border border-amber-500/50 text-xs font-black cursor-pointer shadow-2xs"
            onSelectPlayer={(name) => {
              handleAddPlayer(undefined, name);
            }}
          />
        </form>

        <div className="space-y-1.5">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                idx === activePlayerIdx
                  ? 'bg-amber-900/50 border-amber-400 text-white shadow-xs'
                  : 'bg-[#2a170d]/80 border-amber-800/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black">{p.name}</span>
                {idx === activePlayerIdx && (
                  <span className="text-[9px] font-black uppercase text-amber-200 bg-amber-800/80 border border-amber-500/40 px-1.5 py-0.2 rounded-md">
                    Aan beurt
                  </span>
                )}
              </div>

              {/* Lives dots */}
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, lIdx) => (
                    <span
                      key={lIdx}
                      className={`text-xs ${lIdx < p.lives ? 'opacity-100' : 'opacity-20 grayscale'}`}
                    >
                      🍺
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleLoseLife(idx)}
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-500/40 cursor-pointer ml-1"
                  title="Verlies een leven"
                >
                  -1 Leven
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 max-w-sm w-full border-4 border-amber-300 shadow-2xl max-h-[85vh] overflow-y-auto text-xs text-slate-600">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="font-black text-slate-800 text-sm">Spelregels Mexen 🍺</h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              <p><strong>Doel:</strong> Gooi niet de laagste score van de ronde!</p>
              <p><strong>Score Volgorde:</strong></p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong className="text-amber-600">21 (MEX):</strong> Allerhoogste score! Verliezer drinkt dubbel.</li>
                <li><strong>Honderdtallen:</strong> 600, 500, 400, 300, 200, 100.</li>
                <li><strong>Gewone worpen:</strong> Hoogste cijfer telt als tiental (65, 64, 63, ... 32, 31).</li>
                <li><strong className="text-rose-600">31:</strong> De allerlaagste score!</li>
              </ul>
              <p><strong>Worpen:</strong> De starter bepaalt het aantal worpen (max 3). Je mag 1 steen laten liggen en de andere opnieuw gooien.</p>
              <p><strong>Gesloten Mexen:</strong> Je kunt onder de beker gooien om te bluffen over je score!</p>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full mt-4 py-2 rounded-full wii-btn-blue font-black text-xs cursor-pointer shadow-md"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
