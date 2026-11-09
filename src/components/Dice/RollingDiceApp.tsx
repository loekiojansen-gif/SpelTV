import React, { useState } from 'react';
import { sounds } from '../../utils/audio';
import { Dices, Beer, Target } from 'lucide-react';
import { StandardDice } from './StandardDice';
import { MexenGame } from './MexenGame';
import { YahtzeeGame } from './YahtzeeGame';

export type DiceAppMode = 'STANDARD' | 'MEXEN' | 'YAHTZEE';

export function RollingDiceApp() {
  const [activeTab, setActiveTab] = useState<DiceAppMode>('STANDARD');

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto px-3 sm:px-4 pb-12 select-none">
      {/* 3 Main Modes Navigation Bar - Casino Mahogany & Gold Style */}
      <div className="w-full mb-3.5 flex items-center justify-center p-1 bg-[#1a0e08]/90 rounded-2xl border-2 border-amber-500/60 shadow-xl backdrop-blur-md">
        <button
          onClick={() => {
            setActiveTab('STANDARD');
            sounds.playTick(600);
          }}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'STANDARD'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 shadow-md scale-[1.02] border border-amber-200'
              : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>Standaard</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('MEXEN');
            sounds.playTick(750);
          }}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'MEXEN'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 shadow-md scale-[1.02] border border-amber-200'
              : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
          }`}
        >
          <span>🍺</span>
          <span>Mexen</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('YAHTZEE');
            sounds.playTick(900);
          }}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'YAHTZEE'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 shadow-md scale-[1.02] border border-amber-200'
              : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
          }`}
        >
          <span>🎯</span>
          <span>Yahtzee</span>
        </button>
      </div>

      {/* Render Selected Mode */}
      {activeTab === 'STANDARD' && <StandardDice />}
      {activeTab === 'MEXEN' && <MexenGame />}
      {activeTab === 'YAHTZEE' && <YahtzeeGame />}
    </div>
  );
}
