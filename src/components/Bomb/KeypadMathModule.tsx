import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/audio';
import { Delete, Check } from 'lucide-react';

interface Props {
  onComplete: () => void;
  postItPosition?: 'left' | 'right' | 'top';
}

interface MathProblem {
  text: string;
  answer: string;
}

const GENERATE_PROBLEM = (): MathProblem => {
  const type = Math.floor(Math.random() * 3);
  if (type === 0) {
    // Addition
    const a = Math.floor(Math.random() * 35) + 12;
    const b = Math.floor(Math.random() * 35) + 12;
    return { text: `${a} + ${b}`, answer: String(a + b) };
  } else if (type === 1) {
    // Subtraction
    const a = Math.floor(Math.random() * 45) + 45;
    const b = Math.floor(Math.random() * 30) + 12;
    return { text: `${a} - ${b}`, answer: String(a - b) };
  } else {
    // Multiplication
    const singleDigits = [
      [6, 7], [7, 8], [6, 8], [9, 6], [7, 7], [8, 8], [9, 7], [9, 8], [6, 6]
    ];
    const pair = singleDigits[Math.floor(Math.random() * singleDigits.length)];
    return { text: `${pair[0]} × ${pair[1]}`, answer: String(pair[0] * pair[1]) };
  }
};

export function KeypadMathModule({ onComplete, postItPosition = 'right' }: Props) {
  const [problem] = useState<MathProblem>(() => GENERATE_PROBLEM());
  const [inputCode, setInputCode] = useState<string>('');
  const [errorFlash, setErrorFlash] = useState<boolean>(false);
  const [successFlash, setSuccessFlash] = useState<boolean>(false);

  const handleKeyPress = (digit: string) => {
    if (successFlash) return;
    if (inputCode.length >= 4) return;
    sounds.playKeypadBeep(900 + Number(digit || 5) * 50);
    setInputCode(prev => prev + digit);
  };

  const handleClear = () => {
    sounds.playTick(400);
    setInputCode('');
  };

  const handleConfirm = () => {
    if (inputCode === problem.answer) {
      setSuccessFlash(true);
      sounds.playCorrectDing();
      setTimeout(() => {
        onComplete();
      }, 400);
    } else {
      setErrorFlash(true);
      sounds.playErrorBuzzer();
      setTimeout(() => {
        setErrorFlash(false);
        setInputCode('');
      }, 500);
    }
  };

  return (
    <div className="w-full h-full select-none flex flex-col items-center justify-between">
      <div className="mb-2 text-center shrink-0">
        <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-slate-900/90 px-3 py-1 rounded-full border border-amber-500/40">
          🔢 Los de som op en toets de code in!
        </span>
      </div>

      <div
        className={`w-full max-w-sm flex-1 min-h-[350px] sm:min-h-[400px] bg-slate-950 rounded-3xl border-3 border-slate-700 p-4 relative overflow-hidden flex ${
          postItPosition === 'top'
            ? 'flex-col items-center justify-around gap-3'
            : postItPosition === 'left'
            ? 'flex-row-reverse items-center justify-around gap-3'
            : 'flex-row items-center justify-around gap-3'
        }`}
      >
        {/* Keypad & LCD Display Side */}
        <div className="flex-1 flex flex-col items-center">
          {/* LCD Screen */}
          <div
            className={`w-full max-w-[170px] h-10 rounded-xl mb-2 flex items-center justify-center font-mono text-xl font-black tracking-widest border-2 transition-colors ${
              successFlash
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500 animate-pulse'
                : errorFlash
                ? 'bg-rose-950 text-rose-400 border-rose-500 animate-shake'
                : 'bg-slate-900 text-amber-400 border-slate-700'
            }`}
          >
            {inputCode ? inputCode : <span className="opacity-30">----</span>}
          </div>

          {/* Numeric Keys Grid */}
          <div className="grid grid-cols-3 gap-1.5 w-full max-w-[170px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
              <button
                key={d}
                onClick={() => handleKeyPress(d)}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-black text-base border border-slate-600 shadow-sm flex items-center justify-center cursor-pointer transition-transform"
              >
                {d}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 active:scale-95 border border-slate-700 flex items-center justify-center cursor-pointer"
              title="Wissen"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-black text-base border border-slate-600 shadow-sm flex items-center justify-center cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handleConfirm}
              className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white border border-emerald-400 flex items-center justify-center cursor-pointer font-black shadow-sm"
              title="Bevestigen"
            >
              <Check className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Realistic Yellow Post-It Note */}
        <div
          className={`w-32 h-36 bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-300 text-slate-900 p-2.5 rounded-xs shadow-[3px_4px_12px_rgba(0,0,0,0.4)] relative flex flex-col justify-between border-t-4 border-yellow-400/80 ${
            postItPosition === 'top'
              ? 'rotate-1'
              : postItPosition === 'left'
              ? '-rotate-3'
              : 'rotate-2'
          }`}
        >
          {/* Tape stripe on top */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 border border-black/10 -rotate-2" />

          {/* Post-it Content */}
          <div>
            <div className="text-[10px] font-black uppercase text-amber-900/70 border-b border-amber-900/20 pb-0.5">
              PIN CODE:
            </div>
            <div className="text-xl font-black font-mono tracking-tight text-slate-900 mt-2 text-center">
              {problem.text} = ?
            </div>
          </div>

          <div className="text-[9px] text-amber-950 font-bold text-center opacity-70">
            ⚠️ Rekenen & intoetsen!
          </div>
        </div>
      </div>
    </div>
  );
}
