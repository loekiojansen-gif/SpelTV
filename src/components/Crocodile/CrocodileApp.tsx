import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../../utils/audio';
import { RotateCcw } from 'lucide-react';

export function CrocodileApp() {
  // Exactly 7 upper teeth (indices 0 to 6) and 7 lower teeth (indices 7 to 13)
  const [pressedTeeth, setPressedTeeth] = useState<boolean[]>(() => Array(14).fill(false));
  const [soreToothIndex, setSoreToothIndex] = useState<number>(() => Math.floor(Math.random() * 14));
  const [isBitten, setIsBitten] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Swipe / Drag up gesture state to pull the jaw open
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartYRef = useRef<number | null>(null);

  // Reset crocodile by pulling the jaw back open with a new random sore tooth
  const handleResetGame = () => {
    setPressedTeeth(Array(14).fill(false));
    setSoreToothIndex(Math.floor(Math.random() * 14));
    setIsBitten(false);
    setScreenShake(false);
    setDragOffsetY(0);
    setIsDragging(false);
    touchStartYRef.current = null;
    sounds.playJawOpen();
  };

  // Listen to navbar reset event
  useEffect(() => {
    const onReset = () => handleResetGame();
    window.addEventListener('party_game_reset', onReset);
    return () => window.removeEventListener('party_game_reset', onReset);
  }, []);

  // Pressing a tooth (no translation/movement, stays in position)
  const handlePressTooth = (index: number) => {
    if (isBitten || pressedTeeth[index]) return;

    if (index === soreToothIndex) {
      // Sore tooth pressed -> BITE!
      setIsBitten(true);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 450);
      sounds.playChomp();
    } else {
      // Safe tooth
      sounds.playToothClick();
      setPressedTeeth(prev => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    }
  };

  // Swipe / Drag to open logic
  const handleStartDrag = (clientY: number) => {
    if (!isBitten) return;
    touchStartYRef.current = clientY;
    setIsDragging(true);
  };

  const handleMoveDrag = (clientY: number) => {
    if (!isBitten || touchStartYRef.current === null) return;
    const deltaY = touchStartYRef.current - clientY;
    if (deltaY > 0) {
      setDragOffsetY(Math.min(deltaY, 160));
    } else {
      setDragOffsetY(0);
    }
  };

  const handleEndDrag = () => {
    if (!isBitten || touchStartYRef.current === null) return;
    if (dragOffsetY > 45) {
      // Successfully pulled open
      handleResetGame();
    } else {
      // Snapped back shut
      setDragOffsetY(0);
    }
    setIsDragging(false);
    touchStartYRef.current = null;
  };

  // Closed offset: clamped shut at 50px (so mouth closes less far, leaving both rows of teeth visible when he bites!)
  const upperJawTranslateY = isBitten
    ? Math.max(0, 50 - dragOffsetY)
    : 0;

  return (
    <div
      className={`w-full flex flex-col items-center max-w-md mx-auto px-4 pb-14 select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Quick Action Reset Bar */}
      <div className="w-full flex items-center justify-end mb-2 px-1">
        <button
          onClick={handleResetGame}
          className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200 cursor-pointer flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Open bek</span>
        </button>
      </div>

      {/* Main Crocodile Perspective View (Matching the physical toy photo) */}
      <div className="w-full relative flex flex-col items-center justify-center p-2 sm:p-4">
        {/* The entire toy container */}
        <div
          className="relative w-[310px] sm:w-[340px] flex flex-col items-center touch-none"
          onTouchStart={e => handleStartDrag(e.touches[0].clientY)}
          onTouchMove={e => handleMoveDrag(e.touches[0].clientY)}
          onTouchEnd={handleEndDrag}
          onPointerDown={e => handleStartDrag(e.clientY)}
          onPointerMove={e => {
            if (isDragging) handleMoveDrag(e.clientY);
          }}
          onPointerUp={handleEndDrag}
          onPointerCancel={handleEndDrag}
        >
          {/* ===================================================================
              1. UPPER HEAD & UPPER JAW (Snaps down when bitten, can swipe up to reopen!)
             =================================================================== */}
          <div
            className={`w-full flex flex-col items-center z-30 transition-transform ${
              isDragging ? 'duration-0' : 'duration-200 ease-out'
            } ${isBitten ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={{
              transform: `translateY(${upperJawTranslateY}px)`,
            }}
          >
            {/* Upper Head Dome & Big Frog/Crocodile Eyes */}
            <div className="relative w-[260px] sm:w-[280px] h-[96px] flex items-center justify-center">
              {/* Big Bulbous Green Eyes with 3D Gloss perched on top */}
              <div className="absolute -top-3.5 inset-x-0 flex items-center justify-center gap-10 z-30">
                {/* Left Eye */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#4ade80] to-[#16a34a] border-3 border-[#15803d] shadow-[0_4px_8px_rgba(0,0,0,0.25)] flex items-center justify-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center relative shadow-inner">
                    {/* Black curved crescent pupil looking down */}
                    <div
                      className={`transition-all ${
                        isBitten
                          ? 'w-6 h-6 rounded-full bg-slate-900 border-2 border-rose-500 scale-90'
                          : 'w-8 h-8 rounded-full bg-slate-900 -mt-1 ml-1'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 bg-white rounded-full mt-1 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Right Eye */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#4ade80] to-[#16a34a] border-3 border-[#15803d] shadow-[0_4px_8px_rgba(0,0,0,0.25)] flex items-center justify-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center relative shadow-inner">
                    <div
                      className={`transition-all ${
                        isBitten
                          ? 'w-6 h-6 rounded-full bg-slate-900 border-2 border-rose-500 scale-90'
                          : 'w-8 h-8 rounded-full bg-slate-900 -mt-1 -ml-1'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 bg-white rounded-full mt-1 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Green Head Shell (Flat bottom to seamlessly fit upper teeth without round corner gaps) */}
              <div className="w-full h-full rounded-t-[90px] rounded-b-none bg-gradient-to-b from-[#22c55e] via-[#16a34a] to-[#15803d] border-4 border-b-0 border-[#166534] shadow-[0_4px_10px_rgba(0,0,0,0.2)] flex items-end justify-center pb-2 relative z-20">
                {/* Nostril indentations */}
                <div className="flex gap-5 mb-1 opacity-70">
                  <span className="w-2.5 h-3 bg-[#052e16] rounded-full shadow-inner" />
                  <span className="w-2.5 h-3 bg-[#052e16] rounded-full shadow-inner" />
                </div>
              </div>
            </div>

            {/* Upper Jaw Rim: Red gums holding 7 Upper White Teeth without green cheek border */}
            <div className="w-[260px] sm:w-[280px] bg-[#dc2626] border-y-2 border-[#991b1b] py-1 px-1.5 shadow-inner flex flex-col items-center justify-center relative z-20">
              {/* 7 Upper Teeth Row: Perfectly symmetrical with lower row */}
              <div className="grid grid-cols-7 gap-1.5 w-full">
                {[0, 1, 2, 3, 4, 5, 6].map(idx => {
                  const isPressed = pressedTeeth[idx];

                  return (
                    <button
                      key={idx}
                      onClick={e => {
                        e.stopPropagation();
                        handlePressTooth(idx);
                      }}
                      disabled={isBitten || isPressed}
                      className={`w-full h-8 sm:h-9 flex flex-col items-center justify-start cursor-pointer transition-transform ${
                        isBitten ? 'cursor-default' : ''
                      } ${!isPressed && !isBitten ? 'hover:scale-105 active:scale-95' : ''}`}
                      title={isPressed ? 'Al ingedrukt' : `Boventand #${idx + 1}`}
                    >
                      {/* Upper Tooth Body: Rounded bottom, flat top */}
                      <div
                        className={`w-full h-full rounded-b-lg rounded-t-xs border border-slate-300 flex items-center justify-center transition-colors ${
                          isPressed
                            ? 'bg-[#64748b] border-[#475569] shadow-inner opacity-70'
                            : 'bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-md'
                        }`}
                      >
                        {!isPressed && (
                          <div className="w-1.5 h-3 bg-white/90 rounded-full -mt-1 pointer-events-none" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===================================================================
              2. MOUTH INTERIOR & LOWER JAW (Open mouth cavity compresses when bitten!)
             =================================================================== */}
          <div className="w-full flex flex-col items-center z-10">
            {/* Deep Red Mouth Cavity / Tongue interior: moves down to half when jaw closes */}
            <div
              className={`w-[260px] sm:w-[280px] rounded-t-none rounded-b-xl bg-gradient-to-b from-[#991b1b] via-[#dc2626] to-[#ef4444] border-x-4 border-b-4 border-t-0 border-[#15803d] shadow-2xl relative overflow-hidden flex flex-col items-center justify-between p-2 ${
                isDragging ? 'transition-none' : 'transition-all duration-200 ease-out'
              }`}
              style={{
                height: `${Math.max(88, 175 - upperJawTranslateY * 1.1)}px`,
              }}
            >
              {/* Back of the throat cavity */}
              <div
                className={`w-36 h-10 rounded-b-full bg-[#7f1d1d] shadow-inner mt-1 opacity-95 ${
                  isDragging ? 'transition-none' : 'transition-all duration-200 ease-out'
                }`}
                style={{
                  transform: `scaleY(${Math.max(0.15, 1 - (upperJawTranslateY / 50) * 0.5)})`,
                  transformOrigin: 'top center',
                  opacity: Math.max(0.3, 1 - (upperJawTranslateY / 50) * 0.5),
                }}
              />

              {/* Red curved tongue in center */}
              <div
                className={`w-40 sm:w-44 h-14 rounded-full bg-gradient-to-b from-[#ef4444] to-[#b91c1c] shadow-lg border-t-2 border-[#fca5a5]/40 mb-1 ${
                  isDragging ? 'transition-none' : 'transition-all duration-200 ease-out'
                }`}
                style={{
                  transform: `scaleY(${Math.max(0.4, 1 - (upperJawTranslateY / 50) * 0.4)})`,
                  transformOrigin: 'bottom center',
                }}
              />

              {/* Lower Jaw Rim: Red gums holding 7 Lower White Teeth without green cheek border */}
              <div className="w-full py-1 px-1.5 bg-[#dc2626] border-t-2 border-[#991b1b] flex flex-col items-center justify-center z-20">
                {/* 7 Lower Teeth Row: Exactly identical size, position, spacing */}
                <div className="grid grid-cols-7 gap-1.5 w-full">
                  {[7, 8, 9, 10, 11, 12, 13].map(idx => {
                    const isPressed = pressedTeeth[idx];

                    return (
                      <button
                        key={idx}
                        onClick={e => {
                          e.stopPropagation();
                          handlePressTooth(idx);
                        }}
                        disabled={isBitten || isPressed}
                        className={`w-full h-8 sm:h-9 flex flex-col items-center justify-end cursor-pointer transition-transform ${
                          isBitten ? 'cursor-default' : ''
                        } ${!isPressed && !isBitten ? 'hover:scale-105 active:scale-95' : ''}`}
                        title={isPressed ? 'Al ingedrukt' : `Ondertand #${idx - 6}`}
                      >
                        {/* Lower Tooth Body: Rounded top, flat bottom */}
                        <div
                          className={`w-full h-full rounded-t-lg rounded-b-xs border border-slate-300 flex items-center justify-center transition-colors ${
                            isPressed
                              ? 'bg-[#64748b] border-[#475569] shadow-inner opacity-70'
                              : 'bg-gradient-to-t from-slate-200 via-white to-white shadow-md'
                          }`}
                        >
                          {!isPressed && (
                            <div className="w-1.5 h-3 bg-white/95 rounded-full mb-1 pointer-events-none" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

            {/* Green Lower Snout Base (Seamless outer plastic green base) */}
            <div className="w-[270px] sm:w-[290px] h-[36px] -mt-2 bg-gradient-to-b from-[#16a34a] to-[#14532d] rounded-b-[40px] border-4 border-[#15803d] shadow-2xl relative z-0" />
          </div>
        </div>

    </div>
  );
}
