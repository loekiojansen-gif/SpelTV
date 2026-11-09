import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import {
  RotateCcw,
  Play,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';
import { DefusalTaskType } from './types';
import { WireConnectModule } from './WireConnectModule';
import { KeypadMathModule } from './KeypadMathModule';
import { CutWiresModule } from './CutWiresModule';
import { ExtinguishFireModule } from './ExtinguishFireModule';
import { BreakGlassModule } from './BreakGlassModule';
import { SlidersModule } from './SlidersModule';
import { RotaryDialsModule } from './RotaryDialsModule';

type BombPhase = 'setup' | 'active' | 'pass' | 'exploded';

interface ActiveTaskConfig {
  type: DefusalTaskType;
  title: string;
  wireOrientation?: 'horizontal' | 'vertical';
  postItPosition?: 'left' | 'right' | 'top';
  sliderCount?: number;
  knobCount?: number;
}

const ALL_TASKS: DefusalTaskType[] = [
  'wire-connect',
  'keypad-math',
  'cut-wires',
  'extinguish-fire',
  'break-glass',
  'sliders',
  'rotary-dials',
];

const TASK_DEFINITIONS: { type: DefusalTaskType; label: string; icon: string }[] = [
  { type: 'wire-connect', label: 'Draden slepen', icon: '🔌' },
  { type: 'keypad-math', label: 'PIN rekensom', icon: '🔢' },
  { type: 'cut-wires', label: 'Draden knippen', icon: '✂️' },
  { type: 'extinguish-fire', label: 'Vlammen blussen', icon: '💦' },
  { type: 'break-glass', label: 'Noodglas & knop', icon: '🔨' },
  { type: 'sliders', label: 'Schuifjes', icon: '🎚️' },
  { type: 'rotary-dials', label: 'Draaiknoppen', icon: '📻' },
];

export function BombApp() {
  const [phase, setPhase] = useState<BombPhase>('setup');
  const [timeSetting, setTimeSetting] = useState<'short' | 'medium' | 'long'>('medium');
  const [enabledTasks, setEnabledTasks] = useState<DefusalTaskType[]>(ALL_TASKS);

  // Active game secret countdown timer
  const [secretTimeTotal, setSecretTimeTotal] = useState<number>(45);
  const [secretTimeLeft, setSecretTimeLeft] = useState<number>(45);
  const [turnCount, setTurnCount] = useState<number>(1);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Current active minigame configuration
  const [currentTask, setCurrentTask] = useState<ActiveTaskConfig>({
    type: 'wire-connect',
    title: 'Draden Slepen',
    wireOrientation: 'horizontal',
  });

  // Ticking audio loop interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTask = (taskType: DefusalTaskType) => {
    sounds.playTick(600);
    setEnabledTasks(prev => {
      if (prev.includes(taskType)) {
        if (prev.length <= 1) return prev; // Keep at least one active
        return prev.filter(t => t !== taskType);
      }
      return [...prev, taskType];
    });
  };

  // Generate a random defusal task from the user's enabled tasks
  const getRandomTask = (): ActiveTaskConfig => {
    const activePool = enabledTasks.length > 0 ? enabledTasks : ALL_TASKS;
    const randomType = activePool[Math.floor(Math.random() * activePool.length)];

    switch (randomType) {
      case 'wire-connect':
        return {
          type: 'wire-connect',
          title: 'Draden Slepen',
          wireOrientation: Math.random() > 0.5 ? 'horizontal' : 'vertical',
        };
      case 'keypad-math': {
        const positions: ('left' | 'right' | 'top')[] = ['left', 'right', 'top'];
        return {
          type: 'keypad-math',
          title: 'PIN Rekensom',
          postItPosition: positions[Math.floor(Math.random() * positions.length)],
        };
      }
      case 'cut-wires':
        return {
          type: 'cut-wires',
          title: 'Draden Doorknippen',
          wireOrientation: 'vertical',
        };
      case 'extinguish-fire':
        return {
          type: 'extinguish-fire',
          title: 'Vlammen Blussen',
        };
      case 'break-glass':
        return {
          type: 'break-glass',
          title: 'Glas Inbreken',
        };
      case 'sliders':
        return {
          type: 'sliders',
          title: 'Schuifjes Kalibreren',
          sliderCount: Math.random() > 0.5 ? 4 : 3,
        };
      case 'rotary-dials':
        return {
          type: 'rotary-dials',
          title: 'Frequentie Afstellen',
          knobCount: Math.random() > 0.5 ? 3 : 2,
        };
    }
  };

  // Start the entire bomb game
  const handleStartBomb = () => {
    let minSec = 30;
    let maxSec = 65;

    if (timeSetting === 'short') {
      minSec = 20;
      maxSec = 45;
    } else if (timeSetting === 'long') {
      minSec = 45;
      maxSec = 90;
    }

    const randomSeconds = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
    setSecretTimeTotal(randomSeconds);
    setSecretTimeLeft(randomSeconds);
    setTurnCount(1);
    setScreenShake(false);

    setCurrentTask(getRandomTask());
    setPhase('active');
    sounds.playBombBeep(1200);
  };

  // Main countdown timer effect
  useEffect(() => {
    if (phase === 'active' || phase === 'pass') {
      timerRef.current = setInterval(() => {
        setSecretTimeLeft(prev => {
          if (prev <= 1) {
            // EXPLOSION!
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleExplosion();
            return 0;
          }

          // Accelerating heartbeat beeps as time runs out
          const ratio = prev / secretTimeTotal;
          if (ratio < 0.25) {
            sounds.playBombBeep(1150);
          } else if (ratio < 0.5 && prev % 2 === 0) {
            sounds.playBombBeep(900);
          } else if (prev % 3 === 0) {
            sounds.playTimerTick();
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, secretTimeTotal]);

  // Handle Explosion
  const handleExplosion = () => {
    sounds.playExplosion();
    setScreenShake(true);
    setPhase('exploded');
    setTimeout(() => setScreenShake(false), 900);
  };

  // When a player finishes their minigame: stay inside the dark console in 'pass' phase!
  const handleTaskComplete = () => {
    sounds.playCorrectDing();
    setPhase('pass');
  };

  // Next player receives phone and immediately continues inside dark console
  const handleNextPlayerReady = () => {
    setCurrentTask(getRandomTask());
    setTurnCount(prev => prev + 1);
    setPhase('active');
    sounds.playTick(800);
  };

  return (
    <div
      className={`w-full flex flex-col items-center max-w-md mx-auto px-2 sm:px-4 pb-14 select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* =========================================================================
          1. SETUP PHASE: Instellingen voor de bom
         ========================================================================= */}
      {phase === 'setup' && (
        <div className="w-full space-y-3.5 animate-in fade-in">
          {/* Dark Defusal Chassis Container */}
          <div className="w-full bg-slate-950 border-4 border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
            {/* Top Hazard Caution Ribbon */}
            <div className="w-full h-3 rounded-full bg-[repeating-linear-gradient(45deg,#eab308,#eab308_12px,#000_12px,#000_24px)] border border-yellow-500/80 shadow-md" />

            {/* Header info */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400">
                  SYSTEM READY • DEFUSAL SQUAD
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                REV. 4.2-B
              </span>
            </div>

            {/* Mystery Timer Duration setting */}
            <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-wider block">
                  Geheime Bom Timer Duur:
                </span>
                <span className="text-[10px] font-mono text-rose-400 font-bold">
                  ⚠️ ONBEKEND VOOR SPELERS
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'short', label: 'Snel (20-45s)', icon: '⚡' },
                  { id: 'medium', label: 'Normaal (30-65s)', icon: '⏱️' },
                  { id: 'long', label: 'Lang (45-90s)', icon: '💣' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playTick(600);
                      setTimeSetting(item.id as 'short' | 'medium' | 'long');
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      timeSetting === item.id
                        ? 'bg-gradient-to-b from-rose-600 to-red-700 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] border-2 border-rose-400 scale-102'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-[11px] leading-tight text-center font-mono">{item.label}</span>
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 block pt-1 text-center">
                Geef de bom telkens door na het voltooien van een opdracht!
              </span>
            </div>

            {/* Minigames Selection */}
            <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-wider block">
                  Kies Actieve Minigames ({enabledTasks.length}/{TASK_DEFINITIONS.length}):
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Tik om aan/uit te zetten
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-300 font-mono">
                {TASK_DEFINITIONS.map(task => {
                  const isEnabled = enabledTasks.includes(task.type);
                  return (
                    <button
                      key={task.type}
                      type="button"
                      onClick={() => toggleTask(task.type)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isEnabled
                          ? 'bg-slate-800/95 border-amber-400/80 text-white shadow-xs'
                          : 'bg-slate-950/70 border-slate-800 text-slate-500 opacity-60'
                      } ${task.type === 'rotary-dials' ? 'col-span-2' : ''}`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{task.icon}</span>
                        <span className="truncate">{task.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                        isEnabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isEnabled ? 'AAN' : 'UIT'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Start Button */}
            <button
              onClick={handleStartBomb}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white font-mono font-black text-base shadow-[0_0_20px_rgba(239,68,68,0.6)] cursor-pointer transition-all flex items-center justify-center gap-2 border-2 border-red-400 mt-1"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>START DE TIKKENDE BOM! 💣</span>
            </button>

            {/* Bottom Hazard Caution Ribbon */}
            <div className="w-full h-3 rounded-full bg-[repeating-linear-gradient(45deg,#eab308,#eab308_12px,#000_12px,#000_24px)] border border-yellow-500/80 shadow-md" />
          </div>
        </div>
      )}

      {/* =========================================================================
          2 & 3. ACTIVE & PASS PHASES (Both remain strictly within the dark console!)
         ========================================================================= */}
      {(phase === 'active' || phase === 'pass') && (
        <div className="w-full animate-in fade-in">
          {/* Elongated Screen-Filling Bomb Shell Chassis */}
          <div className="w-full h-[520px] sm:h-[580px] bg-slate-900 border-4 border-slate-700 rounded-3xl p-3.5 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Top Hazard Stripe */}
            <div className="w-full h-2.5 rounded-full mb-2 shrink-0 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#0f172a_10px,#0f172a_20px)] border border-amber-600/40" />

            {/* Top Display: Mystery LED Timer (Removed player tag) */}
            <div className="w-full flex items-center justify-between mb-2 px-1 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="tracking-wide uppercase">{currentTask.title}</span>
              </div>

              {/* Digital LED Mystery Timer */}
              <div className="flex items-center gap-2 bg-black px-4 py-1.5 rounded-2xl border-2 border-slate-700 shadow-inner">
                <span className="font-mono text-xl sm:text-2xl font-black text-rose-500 tracking-widest drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
                  00:??
                </span>
              </div>

              {/* Reset button */}
              <button
                onClick={() => setPhase('setup')}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded-xl text-xs font-black border border-slate-600 cursor-pointer transition-colors"
                title="Herstarten"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* MAIN MINIGAME DISPLAY OR IN-CONSOLE PASS CARD */}
            <div className="w-full flex-1 relative flex items-center justify-center overflow-hidden">
              {/* If phase is active, render the puzzle */}
              {phase === 'active' && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {currentTask.type === 'wire-connect' && (
                    <WireConnectModule
                      onComplete={handleTaskComplete}
                      orientation={currentTask.wireOrientation}
                    />
                  )}

                  {currentTask.type === 'keypad-math' && (
                    <KeypadMathModule
                      onComplete={handleTaskComplete}
                      postItPosition={currentTask.postItPosition}
                    />
                  )}

                  {currentTask.type === 'cut-wires' && (
                    <CutWiresModule
                      onComplete={handleTaskComplete}
                      orientation={currentTask.wireOrientation}
                    />
                  )}

                  {currentTask.type === 'extinguish-fire' && (
                    <ExtinguishFireModule onComplete={handleTaskComplete} />
                  )}

                  {currentTask.type === 'break-glass' && (
                    <BreakGlassModule onComplete={handleTaskComplete} />
                  )}

                  {currentTask.type === 'sliders' && (
                    <SlidersModule
                      onComplete={handleTaskComplete}
                      sliderCount={currentTask.sliderCount}
                    />
                  )}

                  {currentTask.type === 'rotary-dials' && (
                    <RotaryDialsModule
                      onComplete={handleTaskComplete}
                      knobCount={currentTask.knobCount}
                    />
                  )}
                </div>
              )}

              {/* If phase is pass: stay right inside the dark console with vibrant emergency styling! */}
              {phase === 'pass' && (
                <div className="w-full h-full rounded-2xl bg-slate-950/95 border-3 border-emerald-500/80 p-5 flex flex-col items-center justify-between text-center animate-in zoom-in duration-150 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                  {/* Glowing Check Icon */}
                  <div className="w-18 h-18 rounded-full bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center text-3xl font-black shadow-[0_0_16px_#10b981] animate-bounce">
                    ✓
                  </div>

                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2 animate-pulse">
                      ✅ OPDRACHT VOLTOOID!
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
                      GEEF DE TELEFOON SNEL DOOR! 🔄
                    </h2>

                    <p className="text-xs sm:text-sm font-bold text-slate-400 max-w-xs mx-auto">
                      De geheime bom-timer tikt door! Geef het toestel direct door aan de volgende speler!
                    </p>
                  </div>

                  {/* Ready button for next player */}
                  <button
                    onClick={handleNextPlayerReady}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black text-base shadow-[0_0_16px_rgba(16,185,129,0.5)] cursor-pointer transition-all flex items-center justify-center gap-2 border-2 border-emerald-300"
                  >
                    <span>IK HEB HEM! (START MIJN OPDRACHT)</span>
                    <ChevronRight className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Warning Bar */}
            <div className="w-full text-center text-[10px] font-mono font-bold text-slate-500 mt-2 shrink-0">
              ⚠️ TIKKENDE BOM • LAAT DE TELEFOON NIET VALLEN
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. EXPLODED PHASE ("BOEEEM! DE BOM IS ONTPLOFT!")
         ========================================================================= */}
      {phase === 'exploded' && (
        <div className="w-full space-y-4 animate-in zoom-in duration-150">
          <div className="w-full wii-card rounded-3xl p-6 sm:p-8 text-center border-4 border-rose-600 bg-gradient-to-b from-rose-950 via-slate-950 to-black text-white shadow-2xl relative overflow-hidden">
            {/* Fire particles and smoke */}
            <div className="text-6xl mb-2 animate-bounce">💥</div>

            <h2 className="text-3xl sm:text-4xl font-black text-rose-500 tracking-tight leading-none mb-1 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
              BOEEEM!
            </h2>
            <div className="text-lg font-black text-amber-400 mb-3 tracking-wide">
              DE BOM IS BIJ JOU ONTPLOFT!
            </div>

            {/* Loser Consequence Banner */}
            <div className="p-4 rounded-2xl bg-rose-900/60 border border-rose-500/60 max-w-sm mx-auto mb-5 text-center">
              <span className="text-2xl block mb-1">🍺 💥 🥃</span>
              <span className="text-sm font-black text-white block">
                Degene die de telefoon nu vasthoudt heeft verloren!
              </span>
              <span className="text-xs text-rose-200 font-bold block mt-1">
                Neem 3 slokken of een shotje naar keuze!
              </span>
            </div>

            {/* Total turns survived */}
            <div className="text-xs font-mono font-bold text-slate-400 mb-5">
              Jullie hebben {turnCount} {turnCount === 1 ? 'opdracht' : 'opdrachten'} overleefd!
            </div>

            {/* Play Again button */}
            <button
              onClick={() => setPhase('setup')}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:scale-102 active:scale-98 text-white font-black text-base shadow-xl cursor-pointer transition-all flex items-center justify-center gap-2 border-2 border-white/80"
            >
              <RotateCcw className="w-5 h-5" />
              <span>NIEUWE BOM STARTEN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
