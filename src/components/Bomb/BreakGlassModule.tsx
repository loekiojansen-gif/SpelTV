import React, { useState } from 'react';
import { sounds } from '../../utils/audio';
import { AlertOctagon, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export function BreakGlassModule({ onComplete }: Props) {
  const [hits, setHits] = useState<number>(0);
  const [isBroken, setIsBroken] = useState<boolean>(false);
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);

  const REQUIRED_HITS = 5;

  const handleTapGlass = () => {
    if (isBroken) return;

    const nextHits = hits + 1;
    setHits(nextHits);

    if (nextHits >= REQUIRED_HITS) {
      // Glass shatters!
      setIsBroken(true);
      sounds.playGlassHit(true);
    } else {
      // Glass crack sound
      sounds.playGlassHit(false);
    }
  };

  const handlePressEmergencyButton = () => {
    if (!isBroken || isButtonPressed) return;
    setIsButtonPressed(true);
    sounds.playCorrectDing();
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div className="w-full h-full select-none flex flex-col items-center justify-between">
      <div className="mb-2 text-center shrink-0">
        <span className="text-xs font-black text-rose-400 uppercase tracking-widest bg-slate-900/90 px-3 py-1 rounded-full border border-rose-500/40 animate-pulse">
          🚨 {isBroken ? 'DRUK DE NOODKNOP IN!' : `SLA HET GLAS IN! (Nog ${REQUIRED_HITS - hits} klappen)`}
        </span>
      </div>

      <div className="w-full max-w-sm flex-1 min-h-[350px] sm:min-h-[400px] bg-slate-950 rounded-3xl border-3 border-rose-700/80 p-4 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center">
        {/* Warning hazard stripes border */}
        <div className="absolute inset-0 border-8 border-dashed border-amber-500/20 pointer-events-none rounded-3xl" />

        {/* Emergency Case Body */}
        <div className="relative w-60 h-60 rounded-2xl bg-gradient-to-b from-rose-700 via-rose-800 to-red-950 border-4 border-rose-900 shadow-2xl flex flex-col items-center justify-between p-3.5 overflow-hidden">
          {/* Header plate */}
          <div className="w-full bg-slate-950/80 rounded-md py-0.5 text-center border border-white/20">
            <span className="text-[9px] font-black tracking-widest text-white uppercase flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>NOOD-ONTWAPENING</span>
            </span>
          </div>

          {/* Big Red Button Inside */}
          <div className="relative flex-1 flex items-center justify-center">
            <button
              onClick={handlePressEmergencyButton}
              disabled={!isBroken}
              className={`w-28 h-28 rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center transition-all ${
                isBroken
                  ? 'bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:scale-105 active:scale-90 cursor-pointer animate-pulse ring-4 ring-rose-400/80'
                  : 'bg-red-800 opacity-80 cursor-not-allowed'
              }`}
            >
              <AlertOctagon className="w-10 h-10 text-white stroke-[2.5]" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider mt-0.5">
                {isButtonPressed ? 'ONTWAPEND!' : 'ONTWAPEN'}
              </span>
            </button>
          </div>

          {/* Bottom text */}
          <div className="text-[8px] font-bold text-rose-200/80 uppercase tracking-wider text-center">
            {isBroken ? 'Glas gebroken! Druk nu!' : 'Breek glas bij noodgeval'}
          </div>

          {/* Glass Cover Overlay (Until broken) */}
          {!isBroken && (
            <div
              onClick={handleTapGlass}
              className="absolute inset-0 bg-cyan-100/30 backdrop-blur-[1px] border-4 border-cyan-200/50 cursor-pointer flex items-center justify-center transition-all active:scale-98"
            >
              {/* Glass reflection shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Spiderweb cracks SVG based on hits count */}
              {hits > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  {/* Stage 1 Crack */}
                  {hits >= 1 && (
                    <path
                      d="M 50 50 L 30 25 M 50 50 L 68 32 M 50 50 L 52 75 M 50 50 L 28 65"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Stage 2 Cracks */}
                  {hits >= 2 && (
                    <path
                      d="M 30 25 L 15 15 M 68 32 L 85 20 M 52 75 L 60 90 M 28 65 L 12 78 M 50 50 L 80 55"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Stage 3 Cracks */}
                  {hits >= 3 && (
                    <circle cx="50" cy="50" r="18" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />
                  )}
                  {/* Stage 4 Severe Shattering */}
                  {hits >= 4 && (
                    <>
                      <circle cx="50" cy="50" r="32" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 3" />
                      <path d="M 20 50 L 80 50 M 50 20 L 50 80" stroke="#ffffff" strokeWidth="2" />
                    </>
                  )}
                </svg>
              )}

              {/* Tap instruction */}
              <div className="bg-slate-950/80 text-white font-black text-xs px-3 py-1.5 rounded-full border border-white/40 shadow-lg pointer-events-none animate-bounce">
                🔨 TIK OM TE BREKEN!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
