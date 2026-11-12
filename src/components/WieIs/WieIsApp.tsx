import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Search,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import {
  DEFAULT_WIE_IS_PROMPTS,
  FUN_PUNISHMENTS,
  getAllWieIsPrompts,
  getRandomWieIsPrompt,
  loadCustomWieIsPrompts,
  addCustomWieIsPrompt,
  removeCustomWieIsPrompt,
  WieIsPrompt,
} from './wieIsData';

type TimerMode = 'short' | 'medium' | 'long';
type GamePhase = 'setup' | 'active' | 'exploded';

interface WieIsAppProps {
  isCurrentApp?: boolean;
}

export function WieIsApp({ isCurrentApp = true }: WieIsAppProps) {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [timerMode, setTimerMode] = useState<TimerMode>('medium');

  // Prompts tracking: exact same statement text in both boxes
  const [previousStatement, setPreviousStatement] = useState<string>('begint deze ronde! 🌟');
  const [currentPrompt, setCurrentPrompt] = useState<WieIsPrompt>(DEFAULT_WIE_IS_PROMPTS[0]);
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());

  // Secret Bomb Countdown Timer
  const [secretTimeTotal, setSecretTimeTotal] = useState<number>(45);
  const [secretTimeRemaining, setSecretTimeRemaining] = useState<number>(45);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [passCount, setPassCount] = useState<number>(0);

  // Stellingen viewer modal
  const [showPromptsModal, setShowPromptsModal] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customPrompts, setCustomPrompts] = useState<WieIsPrompt[]>(() => loadCustomWieIsPrompts());

  // Punishment & reset
  const [activePunishment, setActivePunishment] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const beepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Universal reset listener from WiiNavBar
  useEffect(() => {
    const handleReset = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail?.app || customEvent.detail.app === 'WIE_IS' || customEvent.detail.app === 'wie-is') {
        setShowResetConfirm(true);
      }
    };
    window.addEventListener('party_game_reset', handleReset);
    return () => window.removeEventListener('party_game_reset', handleReset);
  }, []);

  // Determine random duration with exact bounds matching the Bomb game
  const getRandomDuration = (mode: TimerMode) => {
    let min = 30;
    let max = 65;
    if (mode === 'short') {
      min = 20;
      max = 45;
    } else if (mode === 'long') {
      min = 45;
      max = 90;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Main secret countdown timer
  useEffect(() => {
    if (phase === 'active' && isCurrentApp && secretTimeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setSecretTimeRemaining(prev => {
          const next = prev - 1;
          if (next <= 0) {
            handleExplosion();
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, isCurrentApp, secretTimeRemaining]);

  // Accelerating ticking sound (slow at first, frantic near zero)
  useEffect(() => {
    if (phase === 'active' && isCurrentApp && secretTimeRemaining > 0) {
      const ratio = Math.max(0.08, secretTimeRemaining / secretTimeTotal);
      const intervalMs = Math.max(160, Math.floor(ratio * 900));
      const pitch = secretTimeRemaining <= 5 ? 1250 : secretTimeRemaining <= 12 ? 1050 : 880;

      beepTimerRef.current = setTimeout(() => {
        sounds.playBombBeep(pitch);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(secretTimeRemaining <= 5 ? 40 : 20);
          } catch {}
        }
      }, intervalMs);
    }

    return () => {
      if (beepTimerRef.current) clearTimeout(beepTimerRef.current);
    };
  }, [phase, isCurrentApp, secretTimeRemaining, secretTimeTotal]);

  // Start a new game
  const handleStartGame = () => {
    const duration = getRandomDuration(timerMode);
    setSecretTimeTotal(duration);
    setSecretTimeRemaining(duration);
    setPassCount(0);
    setPreviousStatement('begint deze ronde! 🌟');

    const pool = getAllWieIsPrompts();
    const { prompt, newUsed } = getRandomWieIsPrompt(pool, new Set());
    setCurrentPrompt(prompt);
    setUsedIds(newUsed);

    setPhase('active');
    sounds.playWiiSelect();
  };

  // Pass to next person: What was in the "WIE" box moves 1:1 into the "JIJ" box!
  const handlePass = () => {
    sounds.playWhoosh();
    setPreviousStatement(currentPrompt.text);
    setPassCount(prev => prev + 1);

    const pool = getAllWieIsPrompts();
    const { prompt, newUsed } = getRandomWieIsPrompt(pool, usedIds);
    setCurrentPrompt(prompt);
    setUsedIds(newUsed);
  };

  // Explosion!
  const handleExplosion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (beepTimerRef.current) clearTimeout(beepTimerRef.current);

    sounds.playExplosion();

    const punishment = FUN_PUNISHMENTS[Math.floor(Math.random() * FUN_PUNISHMENTS.length)];
    setActivePunishment(punishment);

    setPhase('exploded');

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 300, 150, 450]);
      } catch {}
    }
  };

  // Next round
  const handleNextRound = () => {
    const duration = getRandomDuration(timerMode);
    setSecretTimeTotal(duration);
    setSecretTimeRemaining(duration);
    setRoundNumber(prev => prev + 1);
    setPassCount(0);
    setPreviousStatement('begint deze ronde! 🌟');

    const pool = getAllWieIsPrompts();
    const { prompt, newUsed } = getRandomWieIsPrompt(pool, usedIds);
    setCurrentPrompt(prompt);
    setUsedIds(newUsed);

    setPhase('active');
    sounds.playWiiSelect();
  };

  // Reset to setup
  const handleResetMatch = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (beepTimerRef.current) clearTimeout(beepTimerRef.current);

    setRoundNumber(1);
    setPassCount(0);
    setPhase('setup');
    setShowResetConfirm(false);
    sounds.playTick(500);
  };

  // Add custom prompt
  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const updated = addCustomWieIsPrompt(customInput);
    setCustomPrompts(updated);
    setCustomInput('');
    sounds.playTick(800);
  };

  const handleRemovePrompt = (id: string) => {
    const updated = removeCustomWieIsPrompt(id);
    setCustomPrompts(updated);
    sounds.playTick(600);
  };

  const allPrompts = getAllWieIsPrompts();
  const filteredPrompts = allPrompts.filter(p =>
    p.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-4 select-none">
      {/* =========================================================================
          PHASE 1: SETUP
          - Clean, direct setup without big explanation tab
          - Time settings with exact duration labels: Kort (20-45s), Normaal (30-65s), Lang (45-90s)
          - Button to view all stellingen (Stellingenboek)
          - Big Start Button
          ========================================================================= */}
      {phase === 'setup' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Timer Settings Card: Exact time indication like the Bomb */}
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-lg text-slate-950">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2 text-center">
              ⏱️ Geheime Bom Duur:
            </span>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'short', label: 'Kort', time: '(20-45s)', emoji: '⚡' },
                { id: 'medium', label: 'Normaal', time: '(30-65s)', emoji: '⏱️' },
                { id: 'long', label: 'Lang', time: '(45-90s)', emoji: '⏳' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playTick(600);
                    setTimerMode(item.id as TimerMode);
                  }}
                  className={`py-3.5 px-2 rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                    timerMode === item.id
                      ? 'bg-blue-600 text-white border-3 border-blue-700 shadow-md font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 font-bold'
                  }`}
                >
                  <span className="text-base sm:text-lg mb-0.5">{item.emoji}</span>
                  <span className="text-xs sm:text-sm font-black">{item.label}</span>
                  <span className={`text-[11px] font-bold ${timerMode === item.id ? 'text-blue-100' : 'text-slate-500'}`}>
                    {item.time}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Big Start Button */}
          <button
            onClick={handleStartGame}
            className="w-full py-4.5 rounded-3xl bg-red-600 hover:bg-red-500 text-white font-black text-lg tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-red-700"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>START HET SPEL ▶</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          PHASE 2: ACTIVE GAME
          - Top Card: Solid Primary Red "JIJ"
          - Bottom Card: Solid Primary Blue "WIE"
          - Stellingen are 100% identical when passed!
          - Single big DOORGEVEN ➔ button
          ========================================================================= */}
      {phase === 'active' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Top Card: Solid Primary Red "JIJ" */}
          <div className="bg-red-600 border-4 border-red-700 rounded-3xl p-5 sm:p-6 text-center shadow-xl text-white">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-200 block mb-1">
              🫵 JIJ
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              {previousStatement}
            </h2>
          </div>

          {/* Minimalist Center Bar: Round & Pass Counter */}
          <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 text-xs font-black shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Ronde {roundNumber}</span>
            </span>

            <div className="flex items-center gap-1 text-blue-600">
              <span className="text-sm font-black">?</span>
              <span className="text-[11px] font-bold text-slate-500">
                {passCount === 0 ? 'Start' : `${passCount}x doorgegeven`}
              </span>
            </div>
          </div>

          {/* Bottom Card: Solid Primary Blue "WIE" */}
          <div className="bg-blue-600 border-4 border-blue-700 rounded-3xl p-5 sm:p-6 text-center shadow-xl text-white">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-blue-200 block mb-1">
              👇 WIE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              {currentPrompt.text}?
            </h2>
          </div>

          {/* Big Thumb-Friendly Passing Button */}
          <button
            onClick={handlePass}
            className="w-full py-5 rounded-3xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xl sm:text-2xl tracking-wide shadow-2xl flex items-center justify-center gap-2 border-3 border-red-700 cursor-pointer transition-transform"
          >
            <span>DOORGEVEN ➔</span>
          </button>
          <p className="text-center text-xs font-bold text-slate-500 pt-0.5">
            Geef de telefoon aan degene die het beste past en tik op Doorgeven!
          </p>
        </div>
      )}

      {/* =========================================================================
          PHASE 3: EXPLODED / GAME OVER
          - Explosion display
          - Punishment
          - Next Round button
          ========================================================================= */}
      {phase === 'exploded' && (
        <div className="space-y-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white border-4 border-red-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden text-slate-950">
            {/* Boom Icon */}
            <div className="w-20 h-20 rounded-3xl bg-red-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl border-3 border-red-700 animate-bounce">
              <span className="text-4xl">💥</span>
            </div>

            <span className="px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider inline-block mb-3 shadow-sm">
              BOEM! DE TIJDBOM IS ONTPLOFT!
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mb-2">
              Verloren!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-sm mx-auto mb-4">
              De bom ontplofte bij degene die de telefoon nu vasthoudt!
            </p>

            {/* Context: Stelling bij ontploffing */}
            <div className="p-4 rounded-2xl bg-blue-600 border-3 border-blue-700 max-w-md mx-auto mb-4 text-white">
              <span className="block text-[10px] uppercase font-black tracking-wider text-blue-200 mb-0.5">
                Laatste vraag was:
              </span>
              <strong className="text-base sm:text-lg font-black">
                "Wie {currentPrompt.text}?"
              </strong>
            </div>

            {/* Punishment Card */}
            {activePunishment && (
              <div className="p-4 rounded-2xl bg-red-600 text-white border-3 border-red-700 max-w-md mx-auto mb-6 shadow-md">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-200 block mb-0.5">
                  🍺 STRAF VOOR DE VERLIEZER:
                </span>
                <p className="text-base sm:text-lg font-black">
                  {activePunishment}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
              <button
                onClick={handleNextRound}
                className="w-full sm:flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-blue-700"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>VOLGENDE RONDE ▶</span>
              </button>

              <button
                onClick={handleResetMatch}
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all border-2 border-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nieuw Potje</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: STELLINGENBOEK (Bekijk alle stellingen + Eigen toevoegen)
          ========================================================================= */}
      {showPromptsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-4 border-slate-300 rounded-3xl p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col text-slate-950">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 border border-blue-700 flex items-center justify-center text-white font-black">
                  ?
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">
                    Stellingenboek ({allPrompts.length})
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500">
                    Alle vragen die in het spel voorkomen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPromptsModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add Custom Prompt Form */}
            <form onSubmit={handleAddPrompt} className="my-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                Eigen Stelling Toevoegen:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="Bijv. is stiekem verliefd op de buurvrouw..."
                  className="flex-1 px-3 py-2 text-xs font-black bg-slate-50 text-slate-950 placeholder-slate-400 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 shadow-xs border border-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Stelling</span>
                </button>
              </div>
            </form>

            {/* Search Filter */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Zoek in stellingen..."
                className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-950 placeholder-slate-400 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            {/* Stellingen List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1 max-h-64">
              {filteredPrompts.map((p, idx) => {
                const isCustom = p.id.startsWith('custom-');

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      <span className="w-6 h-5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="font-black text-blue-600 mr-1">Wie</span>
                        <span className="font-bold text-slate-800">{p.text}?</span>
                      </div>
                    </div>

                    {isCustom && (
                      <button
                        onClick={() => handleRemovePrompt(p.id)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer shrink-0"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 mt-3 border-t-2 border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPromptsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer hover:bg-slate-800"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RESET CONFIRMATION
          ========================================================================= */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-4 border-red-500 rounded-3xl p-5 text-center max-w-sm w-full shadow-2xl text-slate-950">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-950 mb-1">
              Spel Resetten?
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Weet je zeker dat je het huidige potje Wie Is wilt stoppen?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleResetMatch}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black cursor-pointer shadow-md"
              >
                Resetten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

