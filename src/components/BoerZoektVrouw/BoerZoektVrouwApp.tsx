import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Users, Clock, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { loadMiiAvatars, loadRememberedPlayers } from '../../utils/storage';
import { MiiFace } from '../MiiMaker/MiiFace';
import { MiiAvatar } from '../../types';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';

type GamePhase =
  | 'setup'
  | 'scratch_boer'
  | 'boer_countdown'
  | 'sneaky_drink'
  | 'time_up'
  | 'guessing'
  | 'result';

const STORAGE_PLAYERS_KEY = 'boer_zoekt_vrouw_saved_players';

const DEFAULT_PLAYERS = ['Daan', 'Sophie', 'Lars', 'Emma', 'Thomas'];

export const BoerZoektVrouwApp: React.FC = () => {
  const [players, setPlayers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLAYERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_PLAYERS;
  });

  const [newPlayerName, setNewPlayerName] = useState('');
  const [drinkDuration, setDrinkDuration] = useState<number>(8);
  const [phase, setPhase] = useState<GamePhase>('setup');

  const [boer, setBoer] = useState<string>('');
  const [vrouw, setVrouw] = useState<string>('');
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);

  // Timers & Scratchcard state
  const [countdown3, setCountdown3] = useState<number>(3);
  const [drinkTimer, setDrinkTimer] = useState<number>(drinkDuration);
  const [scratchedDone, setScratchedDone] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScratchingRef = useRef<boolean>(false);
  const strokeCountRef = useRef<number>(0);

  // Mii Avatars for quick player picking
  const [miiAvatars, setMiiAvatars] = useState<MiiAvatar[]>(() => loadMiiAvatars());

  // Save players to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(players));
    } catch {
      // ignore
    }
  }, [players]);

  const handleAddPlayer = (nameToAdd?: string) => {
    const raw = nameToAdd !== undefined ? nameToAdd : newPlayerName;
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (players.includes(trimmed)) return;
    setPlayers([...players, trimmed]);
    setNewPlayerName('');
    sounds.playTick(600);
  };

  const handleRemovePlayer = (name: string) => {
    if (players.length <= 3) return;
    setPlayers(players.filter(p => p !== name));
    sounds.playTick(400);
  };

  // Start new round with true unbiased Fisher-Yates random selection
  const handleStartRound = () => {
    if (players.length < 3) return;

    // True Fisher-Yates random shuffle
    const pool = [...players];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }

    const chosenBoer = pool[0];
    const chosenVrouw = pool[1];

    setBoer(chosenBoer);
    setVrouw(chosenVrouw);
    setSelectedGuess(null);
    setScratchedDone(false);
    strokeCountRef.current = 0;

    setPhase('scratch_boer');
    sounds.playTractorChug();
  };

  // Initialize and paint high grass scratch layer on canvas
  useEffect(() => {
    if (phase !== 'scratch_boer') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Rich lush green field background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#16a34a');
    grad.addColorStop(0.5, '#15803d');
    grad.addColorStop(1, '#14532d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative grass blade patterns
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    for (let x = 10; x < width; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x - 5, height - 30, x + (Math.sin(x) * 12), height - 55);
      ctx.stroke();
    }
    for (let x = 20; x < width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x + 6, height - 25, x - (Math.cos(x) * 10), height - 45);
      ctx.stroke();
    }

    // Centered label prompting the user to scratch
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚜 VEEG OVER HET GRAS OM TE MAAIEN', width / 2, height / 2 - 10);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Maai het veld weg en onthul de Boer!', width / 2, height / 2 + 14);
  }, [phase]);

  // Handle scratch gestures
  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    strokeCountRef.current += 1;
    if (strokeCountRef.current % 5 === 0) {
      sounds.playTick(450 + (strokeCountRef.current % 10) * 15);
    }

    // Check completion threshold every 18 strokes
    if (strokeCountRef.current % 18 === 0 && !scratchedDone) {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        let transparentPixels = 0;
        const totalSampled = data.length / 16;
        for (let i = 3; i < data.length; i += 16) {
          if (data[i] < 128) transparentPixels++;
        }
        if (transparentPixels / totalSampled > 0.42) {
          setScratchedDone(true);
          sounds.playFanfare();
        }
      } catch {
        // fallback
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isScratchingRef.current = true;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isScratchingRef.current = false;
  };

  // Skip / Instant reveal grass
  const handleRevealAllGrass = () => {
    setScratchedDone(true);
    sounds.playFanfare();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Boer clicks to start 3-second eyes closed countdown
  const handleBoerReady = () => {
    sounds.playTick(700);
    setCountdown3(3);
    setPhase('boer_countdown');
  };

  // 3-second eyes closed countdown effect
  useEffect(() => {
    if (phase !== 'boer_countdown') return;

    if (countdown3 > 0) {
      const timer = setTimeout(() => {
        sounds.playTick(500 + (4 - countdown3) * 150);
        setCountdown3(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setDrinkTimer(drinkDuration);
      setPhase('sneaky_drink');
      sounds.playWhoosh();
    }
  }, [phase, countdown3, drinkDuration]);

  // Sneaky drink timer effect
  useEffect(() => {
    if (phase !== 'sneaky_drink') return;

    if (drinkTimer > 0) {
      const timer = setTimeout(() => {
        if (drinkTimer <= 3) {
          sounds.playTick(900);
        }
        setDrinkTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      sounds.playRoosterCrow();
      setPhase('time_up');
    }
  }, [phase, drinkTimer]);

  // Submit guess
  const handleSelectGuess = (guessedPlayer: string) => {
    setSelectedGuess(guessedPlayer);
    sounds.playWiiSelect();
    setPhase('result');

    if (guessedPlayer === vrouw) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#eab308', '#38bdf8'],
        });
      } catch {
        // ignore
      }
      setTimeout(() => sounds.playFanfare(), 250);
    } else {
      setTimeout(() => sounds.playErrorBuzzer(), 250);
    }
  };

  const getMiiForPlayer = (name: string): MiiAvatar | undefined => {
    return miiAvatars.find(m => m.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] pb-12 px-3 sm:px-6 max-w-lg mx-auto flex flex-col justify-center items-center select-none">
      {/* Reset button when round is active */}
      {phase !== 'setup' && (
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={() => {
              setPhase('setup');
              sounds.playTick(500);
            }}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 border border-red-700"
            title="Ronde stoppen en resetten"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ronde Stoppen</span>
          </button>
        </div>
      )}

      {/* PHASE 1: SETUP */}
      {phase === 'setup' && (
        <div className="w-full bg-gradient-to-b from-[#fefce8] via-[#fffbeb] to-[#fef3c7] rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-600/80 my-auto animate-fadeIn space-y-5 text-amber-950">
          {/* Subtitle / Gingham Header Card */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 border border-red-700 text-white font-black text-xs shadow-sm">
              <span>🌾</span>
              <span>Zet 2 halfvolle glazen op tafel</span>
              <span>🍺</span>
            </div>
          </div>

          {/* Drink Timer Duration Selector */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-amber-100/70 border border-amber-300/80">
            <div className="flex items-center justify-between text-xs font-black text-amber-900">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Drinktijd Vrouw
              </span>
              <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-black text-[11px] shadow-2xs">
                {drinkDuration}s
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[5, 6, 8, 10, 12].map(sec => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    sounds.playTick(600);
                    setDrinkDuration(sec);
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    drinkDuration === sec
                      ? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-400'
                      : 'bg-white/90 text-amber-900 border border-amber-200 hover:bg-amber-200/60'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Players Input Section */}
          <div className="space-y-2.5 p-3 rounded-2xl bg-amber-100/70 border border-amber-300/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                Boerderij Spelers ({players.length})
              </span>
            </div>

            {/* Add player form + Dropdown */}
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Nieuwe speler toevoegen..."
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPlayer();
                  }
                }}
                className="flex-1 min-w-[140px] px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-950 placeholder-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
              />
              <button
                type="button"
                onClick={() => handleAddPlayer()}
                className="px-3 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-black text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                + Toevoegen
              </button>
              <PlayerPickerDropdown
                compact
                existingNames={players}
                buttonLabel="Kies Speler"
                buttonClassName="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs border border-amber-600 shadow-2xs cursor-pointer"
                onSelectPlayer={(name) => {
                  handleAddPlayer(name);
                }}
              />
            </div>

            {/* Current Players list */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
              {players.map(p => {
                const mii = getMiiForPlayer(p);
                return (
                  <div
                    key={p}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-300 text-xs font-black text-blue-950 shadow-2xs"
                  >
                    {mii && <MiiFace avatar={mii} size={18} showBorder={false} />}
                    <span>{p}</span>
                    {players.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(p)}
                        className="w-4 h-4 rounded-full hover:bg-rose-200 text-rose-700 flex items-center justify-center cursor-pointer ml-0.5 text-[11px]"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start Game Button */}
          <button
            type="button"
            onClick={handleStartRound}
            disabled={players.length < 3}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-600 text-white font-black text-base shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 border-2 border-emerald-400/60"
          >
            <span className="text-xl">🚜</span>
            <span>Start Ronde</span>
          </button>
        </div>
      )}

      {/* PHASE 2: KRASLOT / VEGEND GRAS MAAIEN */}
      {phase === 'scratch_boer' && (
        <div className="w-full bg-emerald-950 rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-amber-400 text-center my-auto overflow-hidden relative space-y-4">
          <div className="space-y-0.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              Kraslot / Maai het Gras 🌾
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {scratchedDone ? 'Gras is gemaaid! 🚜' : 'Veeg over het gras om te maaien'}
            </h2>
          </div>

          {/* Scratch Card Frame */}
          <div className="relative w-full h-56 rounded-2xl overflow-hidden border-3 border-amber-500/80 shadow-2xl bg-gradient-to-b from-[#a16207] to-[#713f12]">
            {/* Underneath: The Revealed Boer Announcement */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none">
              <div className="text-4xl mb-1">👨‍🌾</div>
              <div className="text-xs font-black uppercase tracking-widest text-amber-200">
                Jij bent de Boer:
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] py-1">
                {boer}
              </div>
              <div className="text-[11px] text-amber-100/90 font-medium mt-1">
                Onthoud dit goed en start hieronder het aftellen!
              </div>
            </div>

            {/* Above: HTML5 Scratchable Grass Canvas */}
            <canvas
              ref={canvasRef}
              width={420}
              height={240}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute inset-0 w-full h-full cursor-crosshair touch-none transition-opacity duration-300 ${
                scratchedDone ? 'pointer-events-none opacity-20' : 'opacity-100'
              }`}
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleBoerReady}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <span>🙈 Start Ogen Dicht (3s)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {!scratchedDone && (
              <button
                type="button"
                onClick={handleRevealAllGrass}
                className="text-xs font-semibold text-emerald-300 hover:text-white cursor-pointer py-1"
              >
                Direct alles maaien
              </button>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3: 3-SECOND COUNTDOWN TO CLOSE EYES */}
      {phase === 'boer_countdown' && (
        <div className="w-full bg-gradient-to-b from-[#7f1d1d] via-[#991b1b] to-[#450a0a] rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-amber-400 text-center my-auto animate-fadeIn space-y-6 text-amber-100">
          <div className="text-5xl animate-bounce">🙈</div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-300">
            Boer {boer}: ogen dicht!
          </h2>

          {/* Large Animated Countdown Number */}
          <div className="py-2">
            <span className="text-8xl sm:text-9xl font-black text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.8)] animate-pulse font-mono">
              {countdown3}
            </span>
          </div>
        </div>
      )}

      {/* PHASE 4: SNEAKY DRINK TIMER (COZY WARM BARN LANTERN THEME) */}
      {phase === 'sneaky_drink' && (
        <div className="w-full bg-gradient-to-b from-[#451a03] via-[#78350f] to-[#291305] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-center my-auto animate-fadeIn space-y-6 text-amber-50 relative overflow-hidden">
          {/* Subtle warm glow background accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1 relative z-10 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400/80 text-amber-200 font-black text-xs uppercase tracking-widest mb-1 shadow-xs">
              🌾 GEHEIME DRINKRONDE 🕯️
            </span>

            <div className="text-sm font-black uppercase tracking-widest text-amber-200/90 pt-1">
              DE VROUW IS:
            </div>

            {/* Warm glowing bold name of the woman */}
            <div className="text-5xl sm:text-7xl font-black text-amber-300 drop-shadow-[0_4px_24px_rgba(251,191,36,0.9)] py-2 tracking-wide">
              {vrouw}
            </div>
            <p className="text-xs font-semibold text-amber-200/80">
              Neem snel en stiekem een flinke slok uit het glas!
            </p>
          </div>

          {/* Large Countdown Clock with Warm Barn Lantern Glow */}
          <div className="flex flex-col items-center justify-center py-1 relative z-10">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-4 ${
                  drinkTimer <= 3 ? 'border-amber-300 animate-ping' : 'border-amber-400'
                } opacity-50`}
              />
              <div className="w-28 h-28 rounded-full bg-[#291305] border-4 border-amber-400 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                <span className="text-5xl font-black text-amber-300 font-mono">
                  {drinkTimer}
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  sec
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5: TIME UP - EYES OPEN */}
      {phase === 'time_up' && (
        <div className="w-full bg-gradient-to-b from-[#fefce8] to-[#fef3c7] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-500 text-center my-auto animate-fadeIn space-y-6 text-amber-950">
          <div className="text-6xl animate-bounce">🐓</div>

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black text-amber-950">
              Tijd is om!
            </h2>
            <h3 className="text-xl font-black text-amber-700">
              Boer {boer}, ogen open! 👁️
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTick(600);
              setPhase('guessing');
            }}
            className="w-full py-4 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-base shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>🔎 Wie is de Vrouw?</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* PHASE 6: GUESSING */}
      {phase === 'guessing' && (
        <div className="w-full bg-gradient-to-b from-[#fefce8] to-[#fef3c7] rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-600 my-auto animate-fadeIn space-y-4 text-amber-950">
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700">
              Het Gokmoment 🕵️
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
              Boer {boer}, wie heeft er gedronken?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {players
              .filter(p => p !== boer)
              .map(player => {
                const mii = getMiiForPlayer(player);
                return (
                  <button
                    key={player}
                    type="button"
                    onClick={() => handleSelectGuess(player)}
                    className="p-3.5 rounded-2xl border-2 border-amber-300 hover:border-amber-600 bg-white hover:bg-amber-100 text-amber-950 font-black text-base transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {mii && <MiiFace avatar={mii} size={28} showBorder={false} />}
                    <span>{player}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* PHASE 7: RESULT */}
      {phase === 'result' && (
        <div className="w-full bg-gradient-to-b from-[#fefce8] to-[#fef3c7] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-500 text-center my-auto animate-fadeIn space-y-5 text-amber-950">
          {selectedGuess === vrouw ? (
            <div className="space-y-4">
              <div className="text-6xl animate-bounce">🎯</div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-200 border border-emerald-300 px-3 py-1 rounded-full">
                  Goed Geraden!
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-amber-950 pt-1">
                  {vrouw} was inderdaad de Vrouw!
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-sm">
                🍻 <strong>{vrouw}</strong> heeft verloren en moet het <strong>tweede glas</strong> helemaal leegdrinken!
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl animate-bounce">❌</div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-200 border border-rose-300 px-3 py-1 rounded-full">
                  Helaas Fout!
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-950 pt-1">
                  Niet {selectedGuess}, maar <u>{vrouw}</u> was de Vrouw!
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-sm">
                🍻 Boer <strong>{boer}</strong> had het mis en moet zelf het <strong>tweede glas</strong> helemaal leegdrinken!
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleStartRound}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-base shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volgende Ronde</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTick(400);
                setPhase('setup');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs cursor-pointer transition-colors"
            >
              Spelers aanpassen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
