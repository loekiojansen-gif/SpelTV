import React from 'react';
import { CardGame } from './types';
import { sounds } from '../../utils/audio';

interface BookshelfViewProps {
  games: CardGame[];
  onSelectGame: (game: CardGame) => void;
}

// Colors for leather-bound book spines
const SPINE_STYLES: Record<
  CardGame['coverColor'],
  {
    bg: string;
    border: string;
    gold: string;
    shadow: string;
  }
> = {
  burgundy: {
    bg: 'bg-gradient-to-r from-[#3b0b10] via-[#74151e] to-[#450e14]',
    border: 'border-[#991b1b]/50',
    gold: 'text-[#fef08a]',
    shadow: 'shadow-[inset_2px_0_4px_rgba(255,255,255,0.2),inset_-3px_0_6px_rgba(0,0,0,0.6)]',
  },
  emerald: {
    bg: 'bg-gradient-to-r from-[#032b1f] via-[#065f46] to-[#043325]',
    border: 'border-[#059669]/50',
    gold: 'text-[#fef08a]',
    shadow: 'shadow-[inset_2px_0_4px_rgba(255,255,255,0.2),inset_-3px_0_6px_rgba(0,0,0,0.6)]',
  },
  sapphire: {
    bg: 'bg-gradient-to-r from-[#0d214a] via-[#1e40af] to-[#12285a]',
    border: 'border-[#2563eb]/50',
    gold: 'text-[#fde047]',
    shadow: 'shadow-[inset_2px_0_4px_rgba(255,255,255,0.2),inset_-3px_0_6px_rgba(0,0,0,0.6)]',
  },
  amber: {
    bg: 'bg-gradient-to-r from-[#451e06] via-[#92400e] to-[#542507]',
    border: 'border-[#d97706]/50',
    gold: 'text-[#fef3c7]',
    shadow: 'shadow-[inset_2px_0_4px_rgba(255,255,255,0.2),inset_-3px_0_6px_rgba(0,0,0,0.6)]',
  },
  amethyst: {
    bg: 'bg-gradient-to-r from-[#290d4e] via-[#5b21b6] to-[#361366]',
    border: 'border-[#7c3aed]/50',
    gold: 'text-[#fef08a]',
    shadow: 'shadow-[inset_2px_0_4px_rgba(255,255,255,0.2),inset_-3px_0_6px_rgba(0,0,0,0.6)]',
  },
  espresso: {
    bg: 'bg-gradient-to-r from-[#170e0a] via-[#3d2419] to-[#21140e]',
    border: 'border-[#78350f]/50',
    gold: 'text-[#fde68a]',
    shadow: 'shadow-[inset_2px_0_4px_rgba(255,255,255,0.2),inset_-3px_0_6px_rgba(0,0,0,0.6)]',
  },
  crimson: {
    bg: 'bg-gradient-to-r from-[#430818] via-[#881337] to-[#4e091b]',
    border: 'border-[#be123c]/50',
    gold: 'text-[#fef08a]',
    shadow: 'shadow-[inset_2px_0_4px_rgba(255,255,255,0.2),inset_-3px_0_6px_rgba(0,0,0,0.6)]',
  },
};

export const BookshelfView: React.FC<BookshelfViewProps> = ({ games, onSelectGame }) => {
  // Distribute games cleanly across shelves (2 shelves for up to 14 games, max 6-7 books per shelf)
  const numShelves = games.length > 7 ? 2 : (games.length > 4 ? 2 : 1);
  const itemsPerShelf = Math.ceil(games.length / numShelves);
  const shelves: CardGame[][] = [];

  for (let i = 0; i < games.length; i += itemsPerShelf) {
    shelves.push(games.slice(i, i + itemsPerShelf));
  }

  // If no games found
  if (games.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-amber-950/20 rounded-3xl border-2 border-amber-900/30">
        <span className="text-5xl block mb-3">📚</span>
        <h3 className="font-extrabold text-amber-200 text-lg">Geen spellen gevonden</h3>
        <p className="text-xs text-amber-300/70 mt-1 max-w-sm mx-auto">
          Probeer een andere zoekterm of voeg zelf een nieuw spel toe aan de bibliotheek!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto space-y-10 sm:space-y-12 py-4 select-none">
      {shelves.map((shelfGames, shelfIdx) => (
        <div key={shelfIdx} className="relative group">
          {/* Back wall of bookshelf inside cabinet */}
          <div className="absolute inset-x-0 -top-8 bottom-0 bg-gradient-to-b from-[#2e1c12] via-[#24150d] to-[#1c100a] rounded-2xl -z-10 shadow-inner border border-[#452718]/60 overflow-hidden pointer-events-none">
            {/* Subtle vertical wood panelling lines */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.5) 40px, rgba(0,0,0,0.5) 42px)',
              }}
            />
          </div>

          {/* Books row on this shelf: full width, flex-1 books, no overflow scrolling or vertical swiping */}
          <div className="w-full min-h-[220px] sm:min-h-[260px] px-2 sm:px-6 pt-4 pb-0 flex items-end justify-between gap-1.5 sm:gap-3 overflow-hidden select-none">
            {shelfGames.map((game, gameIdx) => {
              const spineStyle = SPINE_STYLES[game.coverColor] || SPINE_STYLES.burgundy;
              // Vary book height slightly for realism (between 190px and 245px)
              const heights = [
                'h-[200px] sm:h-[235px]',
                'h-[215px] sm:h-[250px]',
                'h-[190px] sm:h-[225px]',
                'h-[225px] sm:h-[255px]',
                'h-[205px] sm:h-[240px]',
                'h-[220px] sm:h-[248px]',
              ];
              const heightClass = heights[(gameIdx + shelfIdx) % heights.length];

              return (
                <div
                  key={game.id}
                  draggable={false}
                  onClick={() => {
                    sounds.playTick(600);
                    onSelectGame(game);
                  }}
                  className={`group/book relative cursor-pointer select-none transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-[1.02] flex-1 min-w-0 ${heightClass}`}
                  title={`${game.title} - ${game.subtitle}`}
                >
                  {/* Book Spine 3D block filling full allocated width */}
                  <div
                    className={`w-full h-full rounded-t-md rounded-b-xs border-t-2 border-x ${spineStyle.border} ${spineStyle.bg} ${spineStyle.shadow} flex flex-col justify-between items-center py-2.5 sm:py-3.5 relative overflow-hidden`}
                  >
                    {/* Top Ribbing / Band on spine */}
                    <div className="w-full flex flex-col gap-0.5 px-1 opacity-70">
                      <div className="w-full h-[1.5px] bg-[#fef08a]/40" />
                      <div className="w-full h-[1.5px] bg-[#fef08a]/40" />
                    </div>

                    {/* Book Icon Emoji at Top */}
                    <div className="text-base sm:text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] my-1 shrink-0">
                      {game.iconEmoji}
                    </div>

                    {/* Gold Embossed Vertical Title */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden my-1 w-full px-0.5">
                      <span
                        className={`text-[10px] sm:text-[13px] font-black tracking-widest uppercase font-serif ${spineStyle.gold} filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate max-h-[140px] text-center`}
                        style={{
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          transform: 'rotate(180deg)',
                        }}
                      >
                        {game.title}
                      </span>
                    </div>

                    {/* Custom Badge Dot or Beer Rating */}
                    {game.isCustom ? (
                      <span className="text-[8px] sm:text-[9px] font-bold bg-amber-400 text-slate-950 px-1 py-0.2 rounded-full uppercase tracking-tighter shadow-xs shrink-0">
                        Eigen
                      </span>
                    ) : (
                      /* Beer rating pip */
                      <div className="flex items-center justify-center opacity-85 shrink-0">
                        <span className="text-[9px] sm:text-[10px] leading-none font-bold text-amber-200">
                          🍺{game.intensity}
                        </span>
                      </div>
                    )}

                    {/* Bottom Ribbing / Band on spine */}
                    <div className="w-full flex flex-col gap-0.5 px-1 opacity-70">
                      <div className="w-full h-[1.5px] bg-[#fef08a]/40" />
                      <div className="w-full h-[1.5px] bg-[#fef08a]/40" />
                    </div>

                    {/* Spine highlight sheen on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 group-hover/book:opacity-100 transition-opacity pointer-events-none" />
                  </div>

                  {/* Book shadow on the wooden shelf */}
                  <div className="absolute -bottom-1 inset-x-1 h-2 bg-black/70 rounded-full blur-xs -z-5 pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Wooden Shelf Plank */}
          <div className="relative w-full z-10">
            {/* Top surface of the thick wooden shelf */}
            <div className="h-4 sm:h-5 w-full bg-gradient-to-r from-[#854d0e] via-[#a16207] to-[#854d0e] border-t border-[#ca8a04]/50 shadow-[0_4px_10px_rgba(0,0,0,0.6)] rounded-xs" />
            {/* Front edge face of the wooden shelf */}
            <div className="h-4 sm:h-5 w-full bg-gradient-to-r from-[#452718] via-[#5c3420] to-[#452718] border-b-2 border-black/80 flex items-center justify-center" />
            {/* Deep shadow cast below the shelf */}
            <div className="h-6 w-full bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          </div>
        </div>
      ))}
    </div>
  );
};
