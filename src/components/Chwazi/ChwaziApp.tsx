import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface TouchPoint {
  id: string | number;
  x: number;
  y: number;
  color: string;
}

const PALETTE = [
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#10b981', // Emerald
  '#3b82f6', // Blue
];

const WINNER_COOLDOWN_MS = 1200; // Small delay before a new game can be started

export function ChwaziApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [winner, setWinner] = useState<TouchPoint | null>(null);
  const [pulseSpeed, setPulseSpeed] = useState<number>(1); // 1 = normal, 2 = fast, 3 = frantic

  const countdownTimerRef = useRef<number | null>(null);
  const humIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const touchPointsRef = useRef<TouchPoint[]>([]);
  const winnerRef = useRef<TouchPoint | null>(null);
  const colorMapRef = useRef<Map<number | string, string>>(new Map());
  const colorIndexRef = useRef<number>(0);

  // New game gating refs
  const winnerChosenAtRef = useRef<number>(0);
  const canStartNewGameRef = useRef<boolean>(false);

  // Keep refs in sync
  useEffect(() => {
    touchPointsRef.current = touchPoints;
    winnerRef.current = winner;
  }, [touchPoints, winner]);

  // Trigger winner selection
  const selectWinner = useCallback((currentPoints: TouchPoint[]) => {
    if (currentPoints.length < 2) return;
    const randomIndex = Math.floor(Math.random() * currentPoints.length);
    const chosen = currentPoints[randomIndex];

    setWinner(chosen);
    winnerRef.current = chosen;
    setPulseSpeed(1);
    winnerChosenAtRef.current = Date.now();
    canStartNewGameRef.current = false;

    // Stop hum sound and timer
    if (humIntervalRef.current) {
      clearInterval(humIntervalRef.current);
      humIntervalRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    // Play triumphant sound & confetti
    sounds.playChwaziWin();

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const originX = chosen.x / rect.width;
      const originY = chosen.y / rect.height;

      confetti({
        particleCount: 100,
        spread: 90,
        origin: { x: originX, y: originY },
        colors: [chosen.color, '#ffffff', '#fef08a'],
        disableForReducedMotion: true,
      });
    }
  }, []);

  // Accelerating pulse countdown while fingers are held down
  useEffect(() => {
    if (winner) return;

    if (touchPoints.length >= 2) {
      startTimeRef.current = Date.now();
      setPulseSpeed(1);

      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (humIntervalRef.current) clearInterval(humIntervalRef.current);

      let step = 0;
      humIntervalRef.current = window.setInterval(() => {
        step++;
        sounds.playChwaziHum(step * 0.22);
      }, 200);

      countdownTimerRef.current = window.setInterval(() => {
        if (!startTimeRef.current) return;
        const elapsed = Date.now() - startTimeRef.current;

        if (elapsed >= 2700) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          selectWinner(touchPointsRef.current);
        } else if (elapsed >= 1800) {
          setPulseSpeed(3); // Frantic fast pulse
        } else if (elapsed >= 900) {
          setPulseSpeed(2); // Medium pulse
        }
      }, 100);
    } else {
      // Fingers lifted below 2 before completion
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (humIntervalRef.current) {
        clearInterval(humIntervalRef.current);
        humIntervalRef.current = null;
      }
      startTimeRef.current = null;
      setPulseSpeed(1);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (humIntervalRef.current) clearInterval(humIntervalRef.current);
    };
  }, [touchPoints.length, winner, selectWinner]);

  // Robust Native Touch Event Handling with e.preventDefault()
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const syncTouches = (touchList: TouchList) => {
      const rect = el.getBoundingClientRect();
      const now = Date.now();

      // IF A WINNER IS CURRENTLY ACTIVE:
      if (winnerRef.current) {
        const timeSinceWin = now - winnerChosenAtRef.current;

        // If cooldown has not elapsed yet, ignore all touch changes
        if (timeSinceWin < WINNER_COOLDOWN_MS) {
          return;
        }

        // When all fingers have been lifted off the screen, mark as ready for a new game
        if (touchList.length === 0) {
          canStartNewGameRef.current = true;
          return;
        }

        // Only dismiss winner and start fresh once NEW fingers are placed down!
        if (canStartNewGameRef.current && touchList.length > 0) {
          setWinner(null);
          winnerRef.current = null;
          colorMapRef.current.clear();
          colorIndexRef.current = 0;
          canStartNewGameRef.current = false;
          // Continue below to register the newly placed fingers
        } else {
          // Still waiting for all fingers to be lifted before accepting new game
          return;
        }
      }

      // ACTIVE TOUCH TRACKING:
      const activeIds = new Set<number>();
      const nextPoints: TouchPoint[] = [];

      for (let i = 0; i < touchList.length; i++) {
        const t = touchList[i];
        activeIds.add(t.identifier);

        if (!colorMapRef.current.has(t.identifier)) {
          const assignedColor = PALETTE[colorIndexRef.current % PALETTE.length];
          colorIndexRef.current++;
          colorMapRef.current.set(t.identifier, assignedColor);
          sounds.playTick(600 + colorMapRef.current.size * 60);
        }

        nextPoints.push({
          id: t.identifier,
          x: t.clientX - rect.left,
          y: t.clientY - rect.top,
          color: colorMapRef.current.get(t.identifier)!,
        });
      }

      // Remove colors for lifted touches
      for (const existingId of Array.from(colorMapRef.current.keys())) {
        if (typeof existingId === 'number' && !activeIds.has(existingId)) {
          colorMapRef.current.delete(existingId);
        }
      }

      setTouchPoints(nextPoints);
      touchPointsRef.current = nextPoints;

      if (nextPoints.length === 0) {
        setPulseSpeed(1);
      }
    };

    const handleNativeTouch = (e: TouchEvent) => {
      e.preventDefault();
      syncTouches(e.touches);
    };

    el.addEventListener('touchstart', handleNativeTouch, { passive: false });
    el.addEventListener('touchmove', handleNativeTouch, { passive: false });
    el.addEventListener('touchend', handleNativeTouch, { passive: false });
    el.addEventListener('touchcancel', handleNativeTouch, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleNativeTouch);
      el.removeEventListener('touchmove', handleNativeTouch);
      el.removeEventListener('touchend', handleNativeTouch);
      el.removeEventListener('touchcancel', handleNativeTouch);
    };
  }, []);

  // Desktop click fallback for testing on mouse-only devices
  const handleDesktopClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const now = Date.now();

    // If winner is active, check delay
    if (winner) {
      if (now - winnerChosenAtRef.current < WINNER_COOLDOWN_MS) {
        return; // ignore within delay
      }
      // Reset winner and allow new clicks
      setWinner(null);
      winnerRef.current = null;
      setTouchPoints([]);
      colorMapRef.current.clear();
      sounds.playTick(500);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const mouseId = 'mouse_' + Date.now();
    const color = PALETTE[colorIndexRef.current % PALETTE.length];
    colorIndexRef.current++;

    const newPoint: TouchPoint = { id: mouseId, x, y, color };
    setTouchPoints(prev => [...prev, newPoint]);
    sounds.playTick(700 + touchPoints.length * 80);
  };

  const handleManualReset = () => {
    setTouchPoints([]);
    setWinner(null);
    winnerRef.current = null;
    setPulseSpeed(1);
    colorMapRef.current.clear();
    canStartNewGameRef.current = false;
    sounds.playTick(500);
  };

  useEffect(() => {
    const onReset = () => handleManualReset();
    window.addEventListener('party_game_reset', onReset);
    return () => window.removeEventListener('party_game_reset', onReset);
  }, []);

  // Determine pulse animation speed
  const pulseClass =
    pulseSpeed === 3
      ? 'animate-pulse duration-150 scale-110'
      : pulseSpeed === 2
      ? 'animate-pulse duration-300 scale-105'
      : 'animate-pulse duration-700';

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto px-3 sm:px-4 pb-4 select-none">
      {/* Main Touch Arena Canvas Box: Turns and stays on the winner's color until new fingers are placed! */}
      <div
        ref={containerRef}
        onClick={handleDesktopClick}
        style={{
          touchAction: 'none',
          backgroundColor: winner ? winner.color : '#0f172a',
          transition: 'background-color 0.4s ease',
        }}
        className="relative w-full h-[68dvh] min-h-[420px] rounded-3xl border-4 border-slate-700/80 shadow-2xl overflow-hidden cursor-crosshair flex items-center justify-center select-none"
      >
        {/* Subtle grid pattern when dark (idle/playing) */}
        {!winner && (
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* Center Instructions when idle */}
        {touchPoints.length === 0 && !winner && (
          <div className="text-center pointer-events-none p-6 animate-pulse">
            <div className="w-18 h-18 rounded-full bg-slate-800/80 border-2 border-sky-400/50 mx-auto flex items-center justify-center text-4xl mb-3 shadow-lg">
              👇
            </div>
            <p className="font-extrabold text-white text-base sm:text-lg tracking-wide">
              Plaats vingers op het scherm
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1 max-w-xs mx-auto">
              Iedereen legt een vinger neer en houdt vast
            </p>
          </div>
        )}

        {/* Render Winner Point (Persists even when fingers are lifted!) */}
        {winner && (
          <div
            style={{
              left: winner.x,
              top: winner.y,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute pointer-events-none z-20"
          >
            {/* Glowing Winner Aura Ring */}
            <div
              style={{
                borderColor: '#ffffff',
                boxShadow: '0 0 50px #ffffff, 0 0 100px #ffffff',
              }}
              className="w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center scale-125 animate-pulse"
            >
              {/* Middle Ring */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.45)',
                  borderColor: '#ffffff',
                }}
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
              >
                {/* Center Core dot */}
                <div
                  style={{ backgroundColor: '#ffffff' }}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-2xl flex items-center justify-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* Render Active Touch Circles (Following fingers in real time before winner) */}
        {!winner &&
          touchPoints.map(point => (
            <div
              key={point.id}
              style={{
                left: point.x,
                top: point.y,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-none transition-transform duration-75"
            >
              {/* Outer Pulsing Ring */}
              <div
                style={{
                  borderColor: point.color,
                  boxShadow: `0 0 25px ${point.color}`,
                }}
                className={`w-28 h-28 rounded-full border-4 border-dashed flex items-center justify-center transition-all ${pulseClass}`}
              >
                {/* Middle Ring */}
                <div
                  style={{
                    backgroundColor: `${point.color}33`,
                    borderColor: point.color,
                  }}
                  className="w-18 h-18 rounded-full border-2 flex items-center justify-center"
                >
                  {/* Center Core dot */}
                  <div
                    style={{ backgroundColor: point.color }}
                    className="w-9 h-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm font-black text-slate-900"
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
