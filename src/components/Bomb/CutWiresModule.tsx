import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/audio';
import { Scissors } from 'lucide-react';

interface Props {
  onComplete: () => void;
  orientation?: 'horizontal' | 'vertical';
}

interface CutWire {
  id: string;
  name: string;
  color: string;
  isCut: boolean;
}

const WIRE_POOL = [
  { id: 'red', name: 'Rood', color: '#ef4444' },
  { id: 'blue', name: 'Blauw', color: '#3b82f6' },
  { id: 'yellow', name: 'Geel', color: '#eab308' },
  { id: 'green', name: 'Groen', color: '#10b981' },
  { id: 'white', name: 'Wit', color: '#f8fafc' },
];

export function CutWiresModule({ onComplete, orientation = 'vertical' }: Props) {
  const [wires, setWires] = useState<CutWire[]>([]);
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [errorFlash, setErrorFlash] = useState<boolean>(false);

  // Initialize random wires & random sequence
  useEffect(() => {
    const wireCount = 3 + Math.floor(Math.random() * 2); // 3 or 4
    const shuffledPool = [...WIRE_POOL].sort(() => Math.random() - 0.5).slice(0, wireCount);
    const initialWires = shuffledPool.map(w => ({ ...w, isCut: false }));
    const randomOrder = [...shuffledPool].sort(() => Math.random() - 0.5).map(w => w.id);

    setWires(initialWires);
    setTargetSequence(randomOrder);
    setCurrentStepIndex(0);
  }, []);

  const handleCutWire = (wireId: string) => {
    const wire = wires.find(w => w.id === wireId);
    if (!wire || wire.isCut) return;

    sounds.playWireSnip();

    const expectedId = targetSequence[currentStepIndex];
    if (wireId === expectedId) {
      // Correct wire cut!
      const nextIndex = currentStepIndex + 1;
      setWires(prev => prev.map(w => (w.id === wireId ? { ...w, isCut: true } : w)));
      setCurrentStepIndex(nextIndex);

      if (nextIndex >= targetSequence.length) {
        // All wires successfully cut in sequence!
        sounds.playCorrectDing();
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    } else {
      // Wrong wire cut -> sparks and penalty/reset!
      sounds.playErrorBuzzer();
      setErrorFlash(true);
      setTimeout(() => {
        setErrorFlash(false);
        // Reset wires to try again
        setWires(prev => prev.map(w => ({ ...w, isCut: false })));
        setCurrentStepIndex(0);
      }, 500);
    }
  };

  return (
    <div className="w-full h-full select-none flex flex-col items-center justify-between">
      {/* Target Sequence Display */}
      <div className="mb-2 text-center w-full max-w-sm shrink-0">
        <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1">
          <Scissors className="w-3.5 h-3.5 text-rose-400" />
          <span>Knip in deze volgorde door:</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {targetSequence.map((id, idx) => {
            const wire = WIRE_POOL.find(w => w.id === id);
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={id}
                className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                  isDone
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500 opacity-60 line-through'
                    : isCurrent
                    ? 'bg-slate-900 text-white border-amber-400 ring-2 ring-amber-400 scale-105 animate-pulse'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/50"
                  style={{ backgroundColor: wire?.color }}
                />
                <span>{wire?.name}</span>
                {isDone && <span>✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Wire Cut Box */}
      <div
        className={`w-full max-w-sm flex-1 min-h-[350px] sm:min-h-[400px] bg-slate-950 rounded-3xl border-3 ${
          errorFlash ? 'border-rose-500 bg-rose-950/20 animate-shake' : 'border-slate-700'
        } p-4 relative overflow-hidden flex items-center justify-around transition-colors`}
      >
        {wires.map(wire => {
          return (
            <div
              key={wire.id}
              onClick={() => handleCutWire(wire.id)}
              className="relative h-full flex flex-col items-center justify-between cursor-pointer group px-2"
            >
              {/* Top Contact Screw */}
              <div className="w-7 h-5 rounded-md bg-slate-700 border-2 border-slate-500 flex items-center justify-center shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600" />
              </div>

              {/* Wire line (Split in half if cut) */}
              <div className="w-full flex-1 flex flex-col items-center justify-center relative">
                {wire.isCut ? (
                  // Cut in two
                  <div className="w-full h-full flex flex-col justify-between items-center py-2">
                    <div
                      className="w-3 rounded-b-md shadow-lg rotate-6"
                      style={{ height: '38%', backgroundColor: wire.color }}
                    />
                    <div className="text-xs text-rose-400 font-bold opacity-80">💥</div>
                    <div
                      className="w-3 rounded-t-md shadow-lg -rotate-6"
                      style={{ height: '38%', backgroundColor: wire.color }}
                    />
                  </div>
                ) : (
                  // Intact taut wire with scissors hover indicator
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div
                      className="w-3.5 h-full rounded-full shadow-lg group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: wire.color,
                        boxShadow: `0 0 10px ${wire.color}60`,
                      }}
                    />
                    {/* Floating scissors icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-slate-900/90 text-white p-1.5 rounded-full border border-white/60 shadow-md">
                        <Scissors className="w-4 h-4 text-rose-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Contact Screw */}
              <div className="w-7 h-5 rounded-md bg-slate-700 border-2 border-slate-500 flex items-center justify-center shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
