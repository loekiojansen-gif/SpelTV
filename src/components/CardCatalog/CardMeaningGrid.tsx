import React from 'react';
import { CardMeaning } from './types';

interface CardMeaningGridProps {
  meanings: CardMeaning[];
}

export const CardMeaningGrid: React.FC<CardMeaningGridProps> = ({ meanings }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {meanings.map((m, idx) => {
        // Determine whether this is a playing card or dice value
        const isDice = m.key.includes('21') || m.key.includes('31') || m.key.includes('100') || m.key.includes('Dubbel');
        const isRedCard = m.key.includes('Harten') || m.key.includes('Ruiten') || m.key === 'Vrouw (Q)' || m.key === 'Heer (K)';

        return (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/40 transition-colors shadow-xs"
          >
            {/* Visual Icon Badge */}
            <div
              className={`shrink-0 w-12 h-14 rounded-lg flex flex-col items-center justify-center font-black shadow-sm border ${
                isDice
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 border-amber-300'
                  : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              <span className={`text-sm leading-none font-bold ${isRedCard ? 'text-red-600' : 'text-slate-900'}`}>
                {m.key.split(' ')[0]}
              </span>
              <span className="text-[10px] mt-1 text-slate-400 font-semibold uppercase tracking-wider">
                {isDice ? 'Worp' : 'Kaart'}
              </span>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm text-slate-900">{m.action}</span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded-sm">
                  {m.key}
                </span>
              </div>
              {m.description && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {m.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
