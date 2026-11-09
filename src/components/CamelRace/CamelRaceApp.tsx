import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { loadRememberedPlayers, saveRememberedPlayers, loadMiiAvatars } from '../../utils/storage';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Users,
  ChevronRight,
  Award,
} from 'lucide-react';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';
import { MiiFace } from '../MiiMaker/MiiFace';
import { MiiAvatar } from '../../types';

export interface Camel {
  id: number;
  name: string;
  color: string;
  textColor: string;
  bgGradient: string;
  borderColor: string;
  coatColor: string;
  number: number;
}

export const CAMELS: Camel[] = [
  {
    id: 1,
    name: 'Geel',
    color: '#eab308',
    textColor: '#854d0e',
    bgGradient: 'from-amber-400 to-yellow-500',
    borderColor: '#ca8a04',
    coatColor: '#d97706',
    number: 1,
  },
  {
    id: 2,
    name: 'Rood',
    color: '#ef4444',
    textColor: '#991b1b',
    bgGradient: 'from-rose-500 to-red-600',
    borderColor: '#dc2626',
    coatColor: '#b45309',
    number: 2,
  },
  {
    id: 3,
    name: 'Groen',
    color: '#10b981',
    textColor: '#065f46',
    bgGradient: 'from-emerald-400 to-teal-600',
    borderColor: '#059669',
    coatColor: '#c2410c',
    number: 3,
  },
  {
    id: 4,
    name: 'Blauw',
    color: '#3b82f6',
    textColor: '#1e40af',
    bgGradient: 'from-blue-400 to-indigo-600',
    borderColor: '#2563eb',
    coatColor: '#92400e',
    number: 4,
  },
  {
    id: 5,
    name: 'Paars',
    color: '#a855f7',
    textColor: '#6b21a8',
    bgGradient: 'from-purple-500 to-fuchsia-600',
    borderColor: '#9333ea',
    coatColor: '#78350f',
    number: 5,
  },
  {
    id: 6,
    name: 'Oranje',
    color: '#f97316',
    textColor: '#9a3412',
    bgGradient: 'from-orange-500 to-amber-600',
    borderColor: '#ea580c',
    coatColor: '#c2410c',
    number: 6,
  },
];

export interface Bet {
  id: string;
  playerName: string;
  camelId: number;
  amount: number;
  type: 'slokken' | 'shotjes';
  // Backward compatibility
  slokken?: number;
  isShot?: boolean;
}

// Track width in pixels for side-scrolling camera
const TRACK_WIDTH_PX = 2300;

export function CamelRaceApp() {
  // Phase: 'betting' | 'countdown' | 'racing' | 'finished'
  const [phase, setPhase] = useState<'betting' | 'countdown' | 'racing' | 'finished'>('betting');

  // Bets list - empty default
  const [bets, setBets] = useState<Bet[]>(() => {
    try {
      const saved = localStorage.getItem('party_camel_race_bets');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Betting input form
  const [playerNameInput, setPlayerNameInput] = useState<string>('');
  const [selectedCamelId, setSelectedCamelId] = useState<number>(1);
  const [betCount, setBetCount] = useState<number>(2);
  const [betType, setBetType] = useState<'slokken' | 'shotjes'>('slokken');
  const [rememberedPlayers, setRememberedPlayers] = useState<string[]>(() => loadRememberedPlayers());
  const [miiAvatars] = useState<MiiAvatar[]>(() => loadMiiAvatars());

  const getMiiForPlayer = (name: string): MiiAvatar | undefined => {
    return miiAvatars.find(m => m.name.toLowerCase() === name.trim().toLowerCase());
  };

  useEffect(() => {
    const onReset = () => {
      handleBackToBets();
      setBets([]);
      sounds.playTick(500);
    };
    window.addEventListener('party_game_reset', onReset);
    return () => window.removeEventListener('party_game_reset', onReset);
  }, []);

  // Positions (0 to 100%) for 6 camels
  const [positions, setPositions] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  });

  // Camera scroll offset (horizontal pan in px)
  const [cameraX, setCameraX] = useState<number>(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Track finish order [1st camelId, 2nd camelId, ...]
  const [finishOrder, setFinishOrder] = useState<number[]>([]);

  // Countdown timer number (3, 2, 1)
  const [countdownNum, setCountdownNum] = useState<number>(3);

  // Refs for race loop & physics
  const raceLoopRef = useRef<number | null>(null);
  const gallopSoundCounter = useRef<number>(0);

  // Auto-save bets
  useEffect(() => {
    try {
      localStorage.setItem('party_camel_race_bets', JSON.stringify(bets));
    } catch {
      // ignore
    }
  }, [bets]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (raceLoopRef.current) cancelAnimationFrame(raceLoopRef.current);
    };
  }, []);

  // Add bet handler
  const handleAddBet = () => {
    const trimmed = playerNameInput.trim();
    if (!trimmed) return;

    const newBet: Bet = {
      id: 'bet-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      playerName: trimmed,
      camelId: selectedCamelId,
      amount: Math.max(1, betCount),
      type: betType,
      slokken: betType === 'slokken' ? betCount : 1,
      isShot: betType === 'shotjes',
    };

    setBets(prev => [...prev, newBet]);
    saveRememberedPlayers([trimmed]);
    setRememberedPlayers(loadRememberedPlayers());
    setPlayerNameInput('');
    sounds.playTick(550);
  };

  const handleRemoveBet = (id: string) => {
    setBets(prev => prev.filter(b => b.id !== id));
    sounds.playTick(350);
  };

  // Start the race countdown
  const handleStartCountdown = () => {
    setPhase('countdown');
    setCountdownNum(3);
    setPositions({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    setFinishOrder([]);
    setCameraX(0);
    sounds.playRaceBugle();

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
        sounds.playTick(400 + (4 - count) * 100);
      } else {
        clearInterval(interval);
        startRaceLoop();
      }
    }, 900);
  };

  // Main stable, fast, purely random race loop without artificial sprint pops
  const startRaceLoop = () => {
    setPhase('racing');
    sounds.playTick(750);

    const currentPos: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    // Physics parameters for smooth galloping
    const camelPhysics: Record<
      number,
      {
        baseSpeed: number;
        waveFreq1: number;
        wavePhase1: number;
        waveAmp1: number;
        waveFreq2: number;
        wavePhase2: number;
        waveAmp2: number;
      }
    > = {};

    CAMELS.forEach(camel => {
      camelPhysics[camel.id] = {
        baseSpeed: 0.088 + (Math.random() - 0.5) * 0.006,
        waveFreq1: 0.05 + Math.random() * 0.06,
        wavePhase1: Math.random() * Math.PI * 2,
        waveAmp1: 0.008 + Math.random() * 0.006,
        waveFreq2: 0.12 + Math.random() * 0.08,
        wavePhase2: Math.random() * Math.PI * 2,
        waveAmp2: 0.004 + Math.random() * 0.005,
      };
    });

    const currentSpeed: Record<number, number> = {
      1: 0.088,
      2: 0.088,
      3: 0.088,
      4: 0.088,
      5: 0.088,
      6: 0.088,
    };

    const finished: number[] = [];
    let smoothCamX = 0;

    const MIN_SPEED = 0.072;
    const MAX_SPEED = 0.118;

    let lastTime = performance.now();
    let lastRenderTime = 0;

    const tick = () => {
      const now = performance.now();
      const rawDt = (now - lastTime) / 16.67;
      lastTime = now;
      const dt = Math.max(0.5, Math.min(1.8, rawDt));

      gallopSoundCounter.current += 1;
      if (gallopSoundCounter.current % 16 === 0) {
        sounds.playGallopHop(Math.random() * 0.4);
      }

      const activePositions = CAMELS.map(c => currentPos[c.id]);
      const maxDist = Math.max(...activePositions);
      const minDist = Math.min(...activePositions);
      const spread = maxDist - minDist;

      // Update each camel smoothly
      CAMELS.forEach(camel => {
        if (currentPos[camel.id] >= 100) return;

        const myPos = currentPos[camel.id];
        const phys = camelPhysics[camel.id];

        const wave =
          Math.sin(myPos * phys.waveFreq1 + phys.wavePhase1) * phys.waveAmp1 +
          Math.cos(myPos * phys.waveFreq2 + phys.wavePhase2) * phys.waveAmp2;

        let targetSpeed = phys.baseSpeed + wave;

        if (maxDist - myPos > 8) {
          targetSpeed += 0.005;
        }
        if (myPos === maxDist && spread > 14) {
          targetSpeed -= 0.004;
        }

        targetSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, targetSpeed));
        currentSpeed[camel.id] += (targetSpeed - currentSpeed[camel.id]) * 0.06 * dt;

        const actualStep = currentSpeed[camel.id] * dt;
        currentPos[camel.id] = Math.min(100, currentPos[camel.id] + actualStep);

        if (currentPos[camel.id] >= 100 && !finished.includes(camel.id)) {
          finished.push(camel.id);
        }
      });

      // Smooth camera pan
      const sortedByPos = [...CAMELS].sort((a, b) => currentPos[b.id] - currentPos[a.id]);
      const leaderPos = currentPos[sortedByPos[0].id];

      if (viewportRef.current) {
        const vpWidth = viewportRef.current.clientWidth || 360;
        const maxScroll = Math.max(0, TRACK_WIDTH_PX - vpWidth);
        const trackProgressPx = (leaderPos / 100) * (TRACK_WIDTH_PX - 120);
        let targetCamX = trackProgressPx - vpWidth * 0.42;
        targetCamX = Math.max(0, Math.min(maxScroll, targetCamX));
        smoothCamX += (targetCamX - smoothCamX) * 0.12 * dt;
      }

      // Throttle React state re-renders to ~40fps
      if (now - lastRenderTime >= 24 || finished.length > 0) {
        lastRenderTime = now;
        setPositions({ ...currentPos });
        setCameraX(smoothCamX);
      }

      // End of race check
      if (finished.length === CAMELS.length || (finished.length >= 1 && Object.values(currentPos).every(p => p >= 100))) {
        setFinishOrder(finished);
        setPhase('finished');
        setPositions({ ...currentPos });
        sounds.playCheerFanfare();
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 },
        });
        return;
      }

      raceLoopRef.current = requestAnimationFrame(tick);
    };

    raceLoopRef.current = requestAnimationFrame(tick);
  };

  const handleRerace = () => {
    if (raceLoopRef.current) cancelAnimationFrame(raceLoopRef.current);
    handleStartCountdown();
  };

  const handleBackToBets = () => {
    if (raceLoopRef.current) cancelAnimationFrame(raceLoopRef.current);
    setPhase('betting');
    setPositions({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    setFinishOrder([]);
    setCameraX(0);
  };

  const winningCamel = finishOrder.length > 0 ? CAMELS.find(c => c.id === finishOrder[0]) : null;
  const winningBets = winningCamel ? bets.filter(b => b.camelId === winningCamel.id) : [];
  const losingBets = winningCamel ? bets.filter(b => b.camelId !== winningCamel.id) : [];

  const leaderCamelId = [...CAMELS].sort((a, b) => positions[b.id] - positions[a.id])[0].id;
  const leaderPos = positions[leaderCamelId] || 0;

  const formatBetDesc = (bet: Bet, isWinner: boolean) => {
    const amt = bet.amount ?? bet.slokken ?? 1;
    const isShot = bet.type === 'shotjes' || bet.isShot;

    if (isWinner) {
      if (isShot) {
        return amt === 1 ? 'Deel 1 shotje uit!' : `Deel ${amt} shotjes uit!`;
      }
      return `Deel ${amt * 2} slokken uit!`;
    } else {
      if (isShot) {
        return amt === 1 ? 'Neem 1 shot!' : `Drink ${amt} shotjes!`;
      }
      return `Drink ${amt} ${amt === 1 ? 'slok' : 'slokken'}!`;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-14 select-none">
      {/* Top Action Bar when in race */}
      {phase !== 'betting' && (
        <div className="w-full flex items-center justify-end mb-2 px-1">
          <button
            onClick={handleBackToBets}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200 cursor-pointer flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Inzetten aanpassen</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          FASE 1: BEGINSCHERM / INZETTEN
          1) Namen & inzet stepper (+ - slokken/shotjes)
          2) Kamelen in 2 rijen van 3 (veel kleiner)
          3) Geplaatste inzetten lijst
         ========================================================================= */}
      {phase === 'betting' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 1. Plaats een inzet (Namen & Inzet eerst!) */}
          <div className="w-full wii-card rounded-3xl p-4 sm:p-5 border-2 border-white shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>✍️</span>
              <span>Plaats een Inzet</span>
            </h2>

            {/* Spelernaam input & quick chips */}
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Naam van de speler:
              </label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  type="text"
                  value={playerNameInput}
                  onChange={e => setPlayerNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddBet()}
                  placeholder="bijv. Tom, Lisa, Bas..."
                  className="flex-1 min-w-[130px] px-3.5 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-amber-500 focus:bg-white text-slate-800 font-bold text-sm outline-none transition-colors"
                />
                <PlayerPickerDropdown
                  compact
                  existingNames={bets.map(b => b.playerName)}
                  buttonLabel="Kies Speler"
                  buttonClassName="px-3 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 font-black text-xs cursor-pointer transition-all shadow-xs shrink-0 flex items-center gap-1"
                  onSelectPlayer={(name) => {
                    setPlayerNameInput(name);
                  }}
                />
              </div>

              {rememberedPlayers.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-bold text-slate-400">Bekenden:</span>
                  {rememberedPlayers.slice(0, 8).map(name => {
                    const mii = getMiiForPlayer(name);
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          setPlayerNameInput(name);
                          sounds.playTick(450);
                        }}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {mii && (
                          <div className="w-4 h-4 rounded-full overflow-hidden bg-white shrink-0 border border-slate-300">
                            <MiiFace avatar={mii} size={16} />
                          </div>
                        )}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inzet Stepper (- / +) en Slokken / Shotjes Toggle */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Inzet:</span>
                {/* Stepper */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setBetCount(prev => Math.max(1, prev - 1));
                      sounds.playTick(420);
                    }}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-black text-base flex items-center justify-center cursor-pointer border border-slate-200 active:scale-95 shadow-xs transition-all"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-slate-800 text-sm">
                    {betCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBetCount(prev => prev + 1);
                      sounds.playTick(520);
                    }}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-black text-base flex items-center justify-center cursor-pointer border border-slate-200 active:scale-95 shadow-xs transition-all"
                  >
                    +
                  </button>
                </div>

                {/* Type: Slokken of Shotjes */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setBetType('slokken');
                      sounds.playTick(460);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      betType === 'slokken'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🍺 Slokken
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBetType('shotjes');
                      sounds.playTick(580);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      betType === 'shotjes'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🥃 Shotjes
                  </button>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Gekozen: <span className="font-black text-slate-800">#{selectedCamelId} {CAMELS.find(c => c.id === selectedCamelId)?.name}</span>
              </div>
            </div>

            {/* 2. Kamelen kiezer: 2 rijen van 3 (veel kleiner) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 mb-2 block">
                Kies een kameel (2 rijen van 3):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CAMELS.map(camel => {
                  const isSelected = selectedCamelId === camel.id;
                  const betsOnCamel = bets.filter(b => b.camelId === camel.id);

                  return (
                    <button
                      key={camel.id}
                      type="button"
                      onClick={() => {
                        setSelectedCamelId(camel.id);
                        sounds.playTick(500);
                      }}
                      className={`relative rounded-xl p-2 text-left transition-all cursor-pointer border-2 flex items-center justify-between ${
                        isSelected
                          ? 'border-slate-800 bg-amber-50 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-6 h-6 rounded-lg font-black text-white text-[11px] flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: camel.color }}
                        >
                          #{camel.number}
                        </span>
                        <div className="truncate">
                          <span className="font-black text-slate-800 text-xs block leading-tight">
                            {camel.name}
                          </span>
                        </div>
                      </div>

                      {betsOnCamel.length > 0 && (
                        <span
                          className="text-[10px] font-black px-1.5 py-0.5 rounded-md ml-1 shrink-0"
                          style={{
                            backgroundColor: `${camel.color}25`,
                            color: camel.textColor,
                          }}
                        >
                          {betsOnCamel.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zet In knop onder de kies kameel */}
            <div className="pt-3 border-t border-slate-100 flex justify-center">
              <button
                type="button"
                onClick={handleAddBet}
                disabled={!playerNameInput.trim()}
                className="w-full sm:w-72 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-sm sm:text-base cursor-pointer transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border border-amber-600"
              >
                <Plus className="w-4 h-4" />
                <span>Zet In op #{selectedCamelId} {CAMELS.find(c => c.id === selectedCamelId)?.name}</span>
              </button>
            </div>
          </div>

          {/* 3. Geplaatste inzetten overzicht */}
          <div className="w-full wii-card rounded-3xl p-4 sm:p-5 border-2 border-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Geplaatste Inzetten ({bets.length})</span>
              </h2>

              {bets.length > 0 && (
                <button
                  onClick={() => {
                    setBets([]);
                    sounds.playTick(300);
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  Alles wissen
                </button>
              )}
            </div>

            {bets.length === 0 ? (
              <div className="p-5 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                Nog geen inzetten geplaatst. Voeg spelers toe om de race te starten!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {bets.map(bet => {
                  const camel = CAMELS.find(c => c.id === bet.camelId) || CAMELS[0];
                  const amt = bet.amount ?? bet.slokken ?? 1;
                  const isShot = bet.type === 'shotjes' || bet.isShot;
                  const mii = getMiiForPlayer(bet.playerName);

                  return (
                    <div
                      key={bet.id}
                      className="p-2 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {mii ? (
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                            <MiiFace avatar={mii} size={24} />
                          </div>
                        ) : (
                          <span
                            className="w-5 h-5 rounded-md text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: camel.color }}
                          >
                            #{camel.number}
                          </span>
                        )}
                        <div className="truncate">
                          <div className="font-black text-slate-800 text-xs truncate leading-tight">
                            {bet.playerName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            {camel.name} ({isShot ? (amt === 1 ? '🥃 1 shot' : `🥃 ${amt} shots`) : `🍺 ${amt} slokken`})
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveBet(bet.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer transition-colors shrink-0"
                        title="Verwijder inzet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Start Race Button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleStartCountdown}
              className="w-full sm:w-80 py-3.5 px-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-black text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-white/80"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>START DE RACE! 🏁</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE 2: ACTIEVE RACE SCHERM
          - Alleen het aantal meters bovenin (geen microfoon, geen 1x snelheid)
          - Geen tribune / laatste 100m teksten
          - Geen namen boven de kamelen
          - 6 kamelen
          - Geen huidige volgorde tab onderaan
         ========================================================================= */}
      {(phase === 'countdown' || phase === 'racing' || phase === 'finished') && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Header boven racescherm: aantal meters + Reset race knop */}
          <div className="w-full wii-card rounded-2xl py-2 px-3 sm:px-4 border-2 border-white shadow-sm flex items-center justify-between bg-slate-900 text-white">
            <span className="text-xs font-black tracking-wider text-slate-400">0m</span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-400">
              {Math.round(leaderPos * 10)}m / 1000m
            </span>
            <button
              onClick={handleBackToBets}
              className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
              title="Race stoppen en terugkeren naar inzetten"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* MAIN SCROLLING DESERT TRACK */}
          <div
            ref={viewportRef}
            className="w-full rounded-3xl border-4 border-amber-700 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#f5d061] via-[#e6b83f] to-[#c98e18]"
          >
            <div
              className="relative select-none will-change-transform"
              style={{
                width: `${TRACK_WIDTH_PX}px`,
                transform: `translate3d(-${cameraX}px, 0, 0)`,
              }}
            >
              {/* Background Sand Pattern */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#78350f_1px,transparent_1px)] [background-size:14px_14px]" />
                <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-amber-200/50 to-transparent" />
              </div>

              {/* Distance Markers Line at top of track (clean, no emojis) */}
              <div className="w-full flex items-center text-[11px] font-black text-amber-950/70 pt-2 pb-1.5 px-6 border-b border-amber-800/25 relative z-10">
                <span className="w-[200px] text-emerald-800">START (0m)</span>
                <span className="w-[300px]">100m</span>
                <span className="w-[350px]">250m</span>
                <span className="w-[400px]">500m</span>
                <span className="w-[400px]">750m</span>
                <span className="w-[300px] text-rose-800">900m</span>
                <span className="text-amber-950 font-black text-xs bg-yellow-400/80 px-2 py-0.5 rounded-md border border-amber-700">
                  FINISH (1000m)
                </span>
              </div>

              {/* Subtle Milestone Marker Lines across track at 250m, 500m, 750m */}
              <div className="absolute left-[592px] top-7 bottom-0 w-px bg-amber-900/30 border-l border-dashed border-amber-950/40 pointer-events-none z-5" />
              <div className="absolute left-[1105px] top-7 bottom-0 w-px bg-amber-900/30 border-l border-dashed border-amber-950/40 pointer-events-none z-5" />
              <div className="absolute left-[1618px] top-7 bottom-0 w-px bg-amber-900/30 border-l border-dashed border-amber-950/40 pointer-events-none z-5" />

              {/* 6 Camel Racing Lanes */}
              <div className="flex flex-col gap-1.5 p-2.5 sm:p-3 relative z-10">
                {CAMELS.map(camel => {
                  const pos = positions[camel.id] || 0;

                  const startPx = 80;
                  const finishPx = TRACK_WIDTH_PX - 170;
                  const currentX = startPx + (pos / 100) * (finishPx - startPx);

                  return (
                    <div
                      key={camel.id}
                      className="w-full h-13 sm:h-15 rounded-2xl bg-amber-200/50 border-2 border-amber-800/30 relative flex items-center px-2 overflow-visible shadow-inner"
                    >
                      {/* Lane Number on the left */}
                      <div
                        className="w-6 sm:w-7 h-6 sm:h-7 rounded-xl font-black text-white text-[11px] flex items-center justify-center shadow-md shrink-0 z-10 border border-white/50"
                        style={{ backgroundColor: camel.color }}
                      >
                        {camel.number}
                      </div>

                      {/* Checkered Start Line Box */}
                      <div className="absolute left-[75px] top-0 bottom-0 w-3 opacity-30 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)] pointer-events-none" />

                      {/* Checkered Grand Finish Line Arch */}
                      <div className="absolute right-[160px] top-0 bottom-0 w-4 bg-[repeating-linear-gradient(45deg,#000,#000_5px,#fff_5px,#fff_10px)] border-l-2 border-r-2 border-amber-950 z-0 pointer-events-none shadow-md">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded shadow-xs whitespace-nowrap">
                          FINISH
                        </div>
                      </div>

                      {/* Camel Runner Container */}
                      <div
                        className="absolute top-1/2 left-0 flex items-center will-change-transform"
                        style={{
                          transform: `translate3d(${currentX}px, -50%, 0)`,
                          zIndex: 20 + camel.id,
                        }}
                      >
                        {/* Vector Camel Graphics (no dust cloud circle behind) */}
                        <div className="relative w-12 sm:w-14 h-10 sm:h-12 flex items-center justify-center">
                          <svg viewBox="0 0 100 80" className="w-full h-full">
                            {/* Front leg */}
                            <path
                              d={Math.round(pos * 2) % 2 === 0 ? "M 65 55 L 75 75 L 80 75" : "M 65 55 L 58 75 L 62 75"}
                              stroke={camel.coatColor}
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            {/* Back leg */}
                            <path
                              d={Math.round(pos * 2) % 2 === 0 ? "M 32 55 L 22 75 L 18 75" : "M 32 55 L 38 75 L 42 75"}
                              stroke={camel.coatColor}
                              strokeWidth="4"
                              strokeLinecap="round"
                            />

                            {/* Torso */}
                            <ellipse cx="48" cy="46" rx="22" ry="14" fill={camel.coatColor} />

                            {/* Hump */}
                            <path d="M 40 40 Q 48 18 56 40 Z" fill={camel.coatColor} />

                            {/* Saddle Cloth with Camel Color */}
                            <path
                              d="M 38 38 Q 48 30 58 38 L 56 50 Q 48 52 40 50 Z"
                              fill={camel.color}
                              stroke="#ffffff"
                              strokeWidth="1.2"
                            />
                            {/* Saddle Number */}
                            <text x="48" y="47" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                              {camel.number}
                            </text>

                            {/* Neck & Head */}
                            <path
                              d="M 58 46 Q 74 36 72 20 Q 78 16 84 22 Q 80 28 68 46 Z"
                              fill={camel.coatColor}
                            />
                            <circle cx="76" cy="22" r="1.5" fill="#0f172a" />
                            <ellipse cx="71" cy="18" rx="1.5" ry="3" fill={camel.coatColor} transform="rotate(-20 71 18)" />

                            {/* Tail */}
                            <path d="M 26 44 Q 20 54 22 62" stroke={camel.coatColor} strokeWidth="2.5" strokeLinecap="round" />

                            {/* Rider with Camel Color */}
                            <ellipse cx="49" cy="30" rx="4" ry="7" fill={camel.color} />
                            <circle cx="51" cy="22" r="4.5" fill="#ffffff" stroke={camel.color} strokeWidth="1" />
                            <circle cx="53" cy="22" r="1.5" fill="#0f172a" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COUNTDOWN OVERLAY */}
            {phase === 'countdown' && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-40">
                <div className="text-center animate-bounce">
                  <span className="text-7xl sm:text-8xl font-black text-amber-400 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-mono">
                    {countdownNum}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              FASE 3: FINISHED / PODIUM
              Minimale tekst: gewoon winnaar en wie wat mag uitdelen of drinken
             ========================================================================= */}
          {phase === 'finished' && winningCamel && (
            <div className="space-y-3 animate-in zoom-in duration-200">
              <div className="w-full wii-card rounded-3xl p-5 text-center border-4 border-amber-400 bg-gradient-to-b from-amber-50 via-white to-amber-50 shadow-xl">
                {/* Winnaar Header */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-2xl animate-bounce">🏆</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-lg text-white font-black text-sm flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: winningCamel.color }}
                    >
                      #{winningCamel.number}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                      {winningCamel.name} Wint!
                    </h2>
                  </div>
                  <span className="text-2xl animate-bounce">🐫</span>
                </div>

                {/* Uitslag: Uitdelen of Drinken */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left my-4">
                  {/* Winnaars delen uit */}
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 mb-2">
                      <span>🎉</span>
                      <span>Mogen Uitdelen:</span>
                    </div>
                    {winningBets.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">
                        Niemand had ingezet op {winningCamel.name}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {winningBets.map(b => (
                          <div key={b.id} className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                            <span>{b.playerName}</span>
                            <span className="bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full text-[11px] font-black">
                              {formatBetDesc(b, true)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verliezers moeten drinken */}
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 mb-2">
                      <span>🍻</span>
                      <span>Moeten Drinken:</span>
                    </div>
                    {losingBets.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">
                        Iedereen had het goed!
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {losingBets.map(b => (
                          <div key={b.id} className="text-xs font-bold text-rose-950 flex items-center justify-between">
                            <span>{b.playerName}</span>
                            <span className="bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full text-[11px] font-black">
                              {formatBetDesc(b, false)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Knoppen */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={handleRerace}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Nog een race</span>
                  </button>

                  <button
                    onClick={handleBackToBets}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm cursor-pointer transition-all border border-slate-300 flex items-center gap-1.5"
                  >
                    <span>Inzetten aanpassen</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

