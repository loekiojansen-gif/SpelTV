import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/audio';
import { Sliders, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete: () => void;
  sliderCount?: number;
}

interface SliderItem {
  id: number;
  label: string;
  targetValue: number; // 10 to 90
  currentValue: number;
}

export function SlidersModule({ onComplete, sliderCount = 3 }: Props) {
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [lockedSliders, setLockedSliders] = useState<number[]>([]);

  useEffect(() => {
    // Generate 3 or 4 sliders with random targets like 20, 40, 60, 80
    const count = sliderCount;
    const generated: SliderItem[] = [];
    for (let i = 0; i < count; i++) {
      const target = [20, 35, 50, 65, 80][Math.floor(Math.random() * 5)];
      generated.push({
        id: i,
        label: `CH-${i + 1}`,
        targetValue: target,
        currentValue: 0,
      });
    }
    setSliders(generated);
    setLockedSliders([]);
  }, [sliderCount]);

  const handleSliderChange = (id: number, val: number) => {
    setSliders(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        return { ...s, currentValue: val };
      })
    );

    // Check if within tolerance (+-9)
    const targetItem = sliders.find(s => s.id === id);
    if (!targetItem) return;

    const isMatch = Math.abs(val - targetItem.targetValue) <= 9;
    const wasLocked = lockedSliders.includes(id);

    if (isMatch && !wasLocked) {
      sounds.playSliderSnap();
      const updatedLocked = [...lockedSliders, id];
      setLockedSliders(updatedLocked);

      if (updatedLocked.length === sliders.length) {
        sounds.playCorrectDing();
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    } else if (!isMatch && wasLocked) {
      setLockedSliders(prev => prev.filter(x => x !== id));
    }
  };

  return (
    <div className="w-full h-full select-none flex flex-col items-center justify-between">
      <div className="mb-2 text-center shrink-0">
        <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-slate-900/90 px-3 py-1 rounded-full border border-amber-500/40">
          🎚️ Schuif elk kanaal naar de groene markering! ({lockedSliders.length}/{sliders.length})
        </span>
      </div>

      <div className="w-full max-w-sm flex-1 min-h-[350px] sm:min-h-[400px] bg-slate-950 rounded-3xl border-3 border-slate-700 p-3 sm:p-4 relative overflow-hidden flex items-center justify-around">
        {sliders.map(slider => {
          const isLocked = lockedSliders.includes(slider.id);

          return (
            <div key={slider.id} className="h-full flex flex-col items-center justify-between py-2">
              {/* LED Indicator on top */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    isLocked
                      ? 'bg-emerald-400 border-white shadow-[0_0_10px_#10b981]'
                      : 'bg-slate-800 border-slate-600'
                  }`}
                />
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {slider.label}
                </span>
              </div>

              {/* Vertical Slider Track Container with Extra Wide Hitbox */}
              <div className="relative h-48 sm:h-56 w-14 sm:w-16 flex items-center justify-center touch-none">
                {/* Background Track Groove */}
                <div className="w-3.5 h-full rounded-full bg-slate-900 border border-slate-700 relative overflow-hidden">
                  {/* Target green zone highlight */}
                  <div
                    className="absolute w-full bg-emerald-500/60 rounded-full"
                    style={{
                      bottom: `${slider.targetValue - 9}%`,
                      height: '18%',
                    }}
                  />
                </div>

                {/* Target line indicator tick */}
                <div
                  className="absolute left-1 right-1 flex items-center justify-between pointer-events-none"
                  style={{ bottom: `${slider.targetValue}%` }}
                >
                  <div className="w-2.5 h-0.5 bg-emerald-400" />
                  <div className="w-2.5 h-0.5 bg-emerald-400" />
                </div>

                {/* HTML range slider input rotated vertically with LARGE hitbox */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slider.currentValue}
                  onChange={e => handleSliderChange(slider.id, Number(e.target.value))}
                  className="absolute w-48 sm:w-56 h-16 sm:h-20 opacity-0 cursor-pointer touch-none z-20"
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center center',
                  }}
                />

                {/* Visible Slider Thumb (Larger & easier to see) */}
                <div
                  className={`absolute w-10 sm:w-11 h-6 sm:h-7 rounded-lg border-2 shadow-xl flex items-center justify-center pointer-events-none transition-transform z-10 ${
                    isLocked
                      ? 'bg-emerald-500 border-white ring-2 ring-emerald-400'
                      : 'bg-gradient-to-b from-slate-100 to-slate-300 border-slate-400 shadow-md'
                  }`}
                  style={{
                    bottom: `calc(${slider.currentValue}% - 12px)`,
                  }}
                >
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3.5 bg-slate-600/70 rounded-full" />
                    <div className="w-0.5 h-3.5 bg-slate-600/70 rounded-full" />
                    <div className="w-0.5 h-3.5 bg-slate-600/70 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Target & current values */}
              <div className="text-[9px] font-mono font-bold text-slate-400">
                {slider.targetValue}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
