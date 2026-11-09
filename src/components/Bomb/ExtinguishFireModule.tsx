import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';

interface Props {
  onComplete: () => void;
}

interface Fire {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: 'small' | 'medium' | 'large';
  maxHp: number;
  currentHp: number;
  extinguished: boolean;
}

export function ExtinguishFireModule({ onComplete }: Props) {
  const [fires, setFires] = useState<Fire[]>([]);
  const [aimPos, setAimPos] = useState<{ x: number; y: number } | null>(null);
  const [isSpraying, setIsSpraying] = useState<boolean>(false);
  const [steamPuffs, setSteamPuffs] = useState<{ id: number; x: number; y: number }[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastSoundTime = useRef<number>(0);

  // Initialize fires with mixed sizes
  useEffect(() => {
    const list: Fire[] = [
      {
        id: 1,
        x: 48,
        y: 35,
        size: 'large',
        maxHp: 100,
        currentHp: 100,
        extinguished: false,
      },
      {
        id: 2,
        x: 22,
        y: 60,
        size: 'medium',
        maxHp: 65,
        currentHp: 65,
        extinguished: false,
      },
      {
        id: 3,
        x: 76,
        y: 58,
        size: 'medium',
        maxHp: 65,
        currentHp: 65,
        extinguished: false,
      },
      {
        id: 4,
        x: 30,
        y: 22,
        size: 'small',
        maxHp: 35,
        currentHp: 35,
        extinguished: false,
      },
      {
        id: 5,
        x: 72,
        y: 24,
        size: 'small',
        maxHp: 35,
        currentHp: 35,
        extinguished: false,
      },
    ];

    setFires(list);
  }, []);

  // Continuous spray physics loop
  useEffect(() => {
    if (!isSpraying || !aimPos || !containerRef.current) return;

    const interval = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Check if sound should trigger
      const now = Date.now();
      if (now - lastSoundTime.current > 180) {
        sounds.playFireExtinguish();
        lastSoundTime.current = now;
      }

      setFires(prevFires => {
        let anyExtinguishedThisTick = false;
        const updated = prevFires.map(fire => {
          if (fire.extinguished) return fire;

          // Compute distance from fire to entire water stream segment (from nozzle to aimPos)
          const firePxX = (fire.x / 100) * rect.width;
          const firePxY = (fire.y / 100) * rect.height;
          const nozzleX = rect.width / 2;
          const nozzleY = rect.height;

          // Distance to segment from nozzle to aimPos
          const dx = aimPos.x - nozzleX;
          const dy = aimPos.y - nozzleY;
          const lenSq = dx * dx + dy * dy;
          let distToStream = 9999;

          if (lenSq > 0) {
            let t = ((firePxX - nozzleX) * dx + (firePxY - nozzleY) * dy) / lenSq;
            t = Math.max(0, Math.min(1, t));
            const projX = nozzleX + t * dx;
            const projY = nozzleY + t * dy;
            distToStream = Math.hypot(firePxX - projX, firePxY - projY);
          }

          // Also check direct distance to the aim tip
          const distToTip = Math.hypot(aimPos.x - firePxX, aimPos.y - firePxY);

          // Generous hit radius for phone touches
          const streamHitRadius = fire.size === 'large' ? 65 : fire.size === 'medium' ? 55 : 45;
          const tipHitRadius = fire.size === 'large' ? 75 : fire.size === 'medium' ? 65 : 55;

          const isHit = distToStream <= streamHitRadius || distToTip <= tipHitRadius;

          if (isHit) {
            // Faster extinguishing damage rate (approx 3x faster than before)
            const dmg = 12.0;
            const newHp = Math.max(0, fire.currentHp - dmg);

            // Spawn steam puff
            if (Math.random() < 0.6) {
              const puffId = Date.now() + Math.random();
              setSteamPuffs(p => [
                ...p.slice(-8),
                { id: puffId, x: fire.x + (Math.random() - 0.5) * 12, y: fire.y + (Math.random() - 0.5) * 12 },
              ]);
              setTimeout(() => {
                setSteamPuffs(p => p.filter(item => item.id !== puffId));
              }, 350);
            }

            if (newHp === 0 && !fire.extinguished) {
              anyExtinguishedThisTick = true;
            }

            return {
              ...fire,
              currentHp: newHp,
              extinguished: newHp === 0,
            };
          }

          return fire;
        });

        // Check if all fires extinguished
        if (updated.every(f => f.extinguished)) {
          sounds.playCorrectDing();
          setTimeout(() => {
            onComplete();
          }, 350);
        }

        return updated;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isSpraying, aimPos, onComplete]);

  // Pointer interactions for water hose
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAimPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsSpraying(true);
    sounds.playFireExtinguish();
    lastSoundTime.current = Date.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAimPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerUp = () => {
    setIsSpraying(false);
  };

  const aliveCount = fires.filter(f => !f.extinguished).length;

  return (
    <div className="w-full h-full select-none flex flex-col items-center justify-between">
      <div className="mb-2 text-center shrink-0">
        <span className="text-xs font-black text-rose-400 uppercase tracking-widest bg-slate-900/90 px-3 py-1 rounded-full border border-rose-500/40 animate-pulse">
          💦 Houd ingedrukt & mik de waterstraal op de vuurtjes! ({aliveCount} over)
        </span>
      </div>

      {/* Main Firefighting Arena - Tall screen filling console */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full max-w-sm flex-1 min-h-[350px] sm:min-h-[400px] bg-slate-950 rounded-3xl border-3 border-amber-900/80 p-4 relative overflow-hidden shadow-2xl cursor-crosshair"
        style={{ touchAction: 'none' }}
      >
        {/* Background Circuit Grid Texture */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

        {/* Smoke & Heat Vignette */}
        <div className="absolute inset-0 bg-radial from-orange-950/40 to-black/70 pointer-events-none" />

        {/* Fires Layer */}
        {fires.map(fire => {
          if (fire.extinguished) {
            return (
              <div
                key={fire.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-slate-500 text-sm font-black opacity-30 select-none pointer-events-none"
                style={{ left: `${fire.x}%`, top: `${fire.y}%` }}
              >
                ⬛ Geblust
              </div>
            );
          }

          const hpRatio = fire.currentHp / fire.maxHp;
          const scale =
            (fire.size === 'large' ? 1.5 : fire.size === 'medium' ? 1.15 : 0.85) * (0.6 + hpRatio * 0.4);

          return (
            <div
              key={fire.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-transform duration-100"
              style={{
                left: `${fire.x}%`,
                top: `${fire.y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
            >
              {/* Flame Glow & Fire Emoji */}
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute -inset-3 rounded-full blur-md animate-ping"
                  style={{
                    backgroundColor: fire.size === 'large' ? '#dc2626' : '#ea580c',
                    opacity: 0.6 * hpRatio,
                  }}
                />
                <span className="text-4xl filter drop-shadow-[0_0_12px_#ef4444] animate-bounce">
                  🔥
                </span>
              </div>

              {/* Fire Health Bar */}
              <div className="w-10 h-1.5 rounded-full bg-black/80 border border-slate-700 mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-rose-600 transition-all duration-75"
                  style={{ width: `${hpRatio * 100}%` }}
                />
              </div>

              {fire.size === 'large' && (
                <span className="text-[9px] font-black uppercase text-amber-300 drop-shadow-md">
                  Groot Vuur
                </span>
              )}
            </div>
          );
        })}

        {/* Steam Puffs */}
        {steamPuffs.map(puff => (
          <div
            key={puff.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-slate-300 text-2xl font-bold animate-ping pointer-events-none"
            style={{ left: `${puff.x}%`, top: `${puff.y}%` }}
          >
            💨
          </div>
        ))}

        {/* High-Pressure Water Stream Effect from Bottom Nozzle */}
        {isSpraying && aimPos && containerRef.current && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <defs>
              <linearGradient id="water-stream" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.95" />
              </linearGradient>
              <filter id="water-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Jet beam */}
            {(() => {
              const rect = containerRef.current.getBoundingClientRect();
              const nozzleX = rect.width / 2;
              const nozzleY = rect.height;

              return (
                <>
                  {/* Outer Water Glow */}
                  <line
                    x1={nozzleX}
                    y1={nozzleY}
                    x2={aimPos.x}
                    y2={aimPos.y}
                    stroke="#38bdf8"
                    strokeWidth="14"
                    opacity="0.4"
                    filter="url(#water-glow)"
                    strokeLinecap="round"
                  />
                  {/* Main Core Water Jet */}
                  <line
                    x1={nozzleX}
                    y1={nozzleY}
                    x2={aimPos.x}
                    y2={aimPos.y}
                    stroke="url(#water-stream)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* White Splash Core at Aim Point */}
                  <circle cx={aimPos.x} cy={aimPos.y} r="14" fill="#38bdf8" opacity="0.6" />
                  <circle cx={aimPos.x} cy={aimPos.y} r="8" fill="#ffffff" opacity="0.9" />
                </>
              );
            })()}
          </svg>
        )}

        {/* Aim Crosshair Cursor */}
        {isSpraying && aimPos && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 text-cyan-200 text-xl font-black animate-spin"
            style={{ left: `${aimPos.x}px`, top: `${aimPos.y}px` }}
          >
            💦
          </div>
        )}

        {/* Firehose Nozzle at Bottom Center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-gradient-to-t from-slate-900 to-slate-700 rounded-t-2xl border-t-2 border-x-2 border-cyan-400/80 shadow-2xl flex items-center justify-center z-20 pointer-events-none">
          <div className="w-5 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
