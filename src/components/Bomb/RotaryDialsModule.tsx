import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/audio';

interface Props {
  onComplete: () => void;
  knobCount?: number;
}

interface KnobItem {
  id: number;
  label: string;
  targetPosition: number; // 1 to 8
  currentPosition: number; // 1 to 8
}

export function RotaryDialsModule({ onComplete, knobCount = 3 }: Props) {
  const [knobs, setKnobs] = useState<KnobItem[]>([]);

  useEffect(() => {
    const count = knobCount;
    const generated: KnobItem[] = [];

    for (let i = 0; i < count; i++) {
      const target = Math.floor(Math.random() * 8) + 1;
      let start = Math.floor(Math.random() * 8) + 1;
      if (start === target) {
        start = (start % 8) + 1;
      }
      generated.push({
        id: i,
        label: `FREQ-${i + 1}`,
        targetPosition: target,
        currentPosition: start,
      });
    }

    setKnobs(generated);
  }, [knobCount]);

  const handleTurnKnob = (id: number) => {
    sounds.playSliderSnap();

    setKnobs(prev => {
      const next = prev.map(k => {
        if (k.id !== id) return k;
        const nextPos = (k.currentPosition % 8) + 1;
        return { ...k, currentPosition: nextPos };
      });

      // Check if all match targets
      if (next.every(k => k.currentPosition === k.targetPosition)) {
        sounds.playCorrectDing();
        setTimeout(() => {
          onComplete();
        }, 400);
      }

      return next;
    });
  };

  return (
    <div className="w-full h-full select-none flex flex-col items-center justify-between">
      <div className="mb-2 text-center shrink-0">
        <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-slate-900/90 px-3 py-1 rounded-full border border-amber-500/40">
          📻 Draai de knoppen naar de juiste frequentie!
        </span>
      </div>

      <div className="w-full max-w-sm flex-1 min-h-[350px] sm:min-h-[400px] bg-slate-950 rounded-3xl border-3 border-slate-700 p-4 relative overflow-hidden flex items-center justify-around">
        {knobs.map(knob => {
          const isAligned = knob.currentPosition === knob.targetPosition;
          // Calculate angle for 8 positions (each 45 deg)
          const angle = (knob.currentPosition - 1) * 45;

          return (
            <div key={knob.id} className="flex flex-col items-center gap-2">
              {/* Target frequency indicator box */}
              <div
                className={`px-2 py-0.5 rounded-lg border font-mono text-xs font-black transition-all ${
                  isAligned
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_8px_#10b981]'
                    : 'bg-slate-900 text-amber-300 border-slate-700'
                }`}
              >
                DOEL: #{knob.targetPosition}
              </div>

              {/* Rotary Knob Body */}
              <button
                onClick={() => handleTurnKnob(knob.id)}
                className={`w-20 h-20 rounded-full border-4 shadow-2xl relative flex items-center justify-center cursor-pointer transition-all active:scale-95 group ${
                  isAligned
                    ? 'border-emerald-400 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 ring-2 ring-emerald-400/60'
                    : 'border-slate-500 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:border-slate-300'
                }`}
              >
                {/* 8 tick marks around perimeter */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
                  const tickAngle = (num - 1) * 45;
                  const isThisTarget = num === knob.targetPosition;
                  return (
                    <div
                      key={num}
                      className="absolute inset-0 flex flex-col items-center pointer-events-none"
                      style={{ transform: `rotate(${tickAngle}deg)` }}
                    >
                      <div
                        className={`w-1 h-2 rounded-full mt-0.5 ${
                          isThisTarget ? 'bg-amber-400' : 'bg-slate-500'
                        }`}
                      />
                    </div>
                  );
                })}

                {/* Rotating Inner Dial with Pointer Notch */}
                <div
                  className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-600 shadow-inner flex flex-col items-center pt-1 transition-transform duration-150 ease-out"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  {/* Indicator Line / Notch */}
                  <div
                    className={`w-1.5 h-4 rounded-full ${
                      isAligned ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400'
                    }`}
                  />
                </div>
              </button>

              {/* Current Value Display */}
              <div className="font-mono text-xs font-bold text-slate-400">
                Stand: <span className={isAligned ? 'text-emerald-400 font-black' : 'text-white'}>#{knob.currentPosition}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
