import React, { useState, useEffect, useMemo } from 'react';
import { CardGame, GameCategory } from './types';
import { DEFAULT_GAMES } from './defaultGames';
import { BookshelfView } from './BookshelfView';
import { GameDetailModal } from './GameDetailModal';
import { AddGameModal } from './AddGameModal';
import { Search, Plus, Dices, BookOpen, Sparkles, Flame, Users, Share2, HelpCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'kaartspellen_catalog_custom_v1';

export const CardCatalogApp: React.FC = () => {
  const [customGames, setCustomGames] = useState<CardGame[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [selectedGame, setSelectedGame] = useState<CardGame | null>(null);
  const [editingGame, setEditingGame] = useState<CardGame | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [showQuickHelp, setShowQuickHelp] = useState(false);

  // Combine default library with custom games (custom games override defaults with matching id)
  const allGames = useMemo(() => {
    const customIds = new Set(customGames.map(g => g.id));
    const defaultList = DEFAULT_GAMES.filter(g => !customIds.has(g.id));
    return [...customGames, ...defaultList];
  }, [customGames]);

  // Save/update game to localStorage
  const handleSaveGame = (game: CardGame) => {
    setCustomGames(prev => {
      const exists = prev.some(g => g.id === game.id);
      const updated = exists ? prev.map(g => g.id === game.id ? game : g) : [game, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setSelectedGame(game);
  };

  // Delete custom game
  const handleDeleteCustomGame = (id: string) => {
    const updated = customGames.filter(g => g.id !== id);
    setCustomGames(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    sounds.playTick(400);
  };

  // Filtered games
  const filteredGames = useMemo(() => {
    return allGames.filter(game => {
      // Category filter
      if (activeCategory === 'kaarten' && game.category !== 'kaarten') return false;
      if (activeCategory === 'dobbelstenen' && game.category !== 'dobbelstenen') return false;
      if (activeCategory === 'muziek' && game.category !== 'muziek') return false;
      if (activeCategory === 'party' && game.category !== 'party') return false;
      if (activeCategory === 'custom' && !game.isCustom) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(query);
        const matchesSubtitle = game.subtitle.toLowerCase().includes(query);
        const matchesDesc = game.description.toLowerCase().includes(query);
        const matchesReq = game.required.some(r => r.toLowerCase().includes(query));
        const matchesCards = game.cardMeanings?.some(
          m => m.key.toLowerCase().includes(query) || m.action.toLowerCase().includes(query)
        );
        return matchesTitle || matchesSubtitle || matchesDesc || matchesReq || matchesCards;
      }

      return true;
    });
  }, [allGames, activeCategory, searchQuery]);

  // Pick a random game from filtered or all
  const handlePickRandomGame = () => {
    const pool = filteredGames.length > 0 ? filteredGames : allGames;
    if (pool.length === 0) return;

    sounds.playDiceRoll();
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setSelectedGame(chosen);
      sounds.playFanfare();
    }, 400);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] pb-16 px-1 sm:px-4 max-w-6xl mx-auto flex flex-col">
      {/* The Grand Wooden Bookcase Cabinet */}
      <div className="w-full rounded-2xl sm:rounded-3xl bg-[#1c0e08] border-x-[10px] sm:border-x-[14px] border-[#2e170d] shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_0_35px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col relative">
        {/* Top Shelf Compartment: Controls & Action Planks */}
        <div className="w-full bg-gradient-to-b from-[#180b06] via-[#221008] to-[#1a0c06] p-3 sm:p-4 relative">
          {/* Quick action buttons row */}
          <div className="text-center pb-3 relative">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              <button
                onClick={handlePickRandomGame}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all border border-amber-300/40"
                title="Kies een willekeurig spel voor vanavond!"
              >
                <Dices className="w-4 h-4" />
                <span>Willekeurig Spel Kiezen!</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTick(600);
                  setEditingGame(null);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#2e160c] hover:bg-[#3d1e10] border border-amber-600/50 text-amber-200 hover:text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Nieuw Spel Toevoegen</span>
              </button>

              <button
                onClick={() => setShowQuickHelp(!showQuickHelp)}
                className="p-2 rounded-xl bg-[#2b140a] border border-amber-700/40 text-amber-300 hover:text-white text-xs shadow-2xs cursor-pointer"
                title="Informatie"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info Callout when toggled */}
          {showQuickHelp && (
            <div className="mb-3 p-3.5 rounded-2xl bg-[#31180e] border border-amber-600/50 text-amber-100 text-xs sm:text-sm space-y-1.5 shadow-inner">
              <p className="font-bold flex items-center gap-2 text-amber-300">
                <span>ℹ️</span> Hoe werkt de Bibliotheek?
              </p>
              <p>
                • Klik op een willekeurig boek op de houten plank om de regels, kaartbetekenissen en benodigdheden te bekijken.
              </p>
              <p>
                • Gebruik de knop <strong>Aanpassen</strong> in het spelvenster om regels of kaartbetekenissen aan te passen.
              </p>
              <p>
                • Gebruik de knop <strong>Delen</strong> in het spelvenster om de regels direct in je vriendengroep te delen.
              </p>
              <p>
                • Via <strong>Nieuw Spel Toevoegen</strong> kun je zelfgemaakte spellen van jullie vriendengroep opslaan in deze applet.
              </p>
            </div>
          )}

          {/* Search Bar & Filter Controls on the Wooden Shelf */}
          <div className="bg-[#140804]/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-inner border border-amber-900/50 space-y-2.5">
            <div className="flex items-center gap-3">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-amber-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Zoek op titel, kaartwaarde, dobbelstenen of regel..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#231109] border border-amber-800/60 focus:outline-none focus:border-amber-400 text-xs sm:text-sm font-medium text-amber-100 placeholder-amber-500/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-200 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Shelf Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              <button
                onClick={() => {
                  sounds.playTick(500);
                  setActiveCategory('all');
                }}
                className={`px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md border border-amber-300'
                    : 'bg-[#291309] text-amber-200/80 hover:bg-[#3d1d0f] hover:text-amber-100 border border-amber-900/40'
                }`}
              >
                Alles ({allGames.length})
              </button>

              <button
                onClick={() => {
                  sounds.playTick(500);
                  setActiveCategory('kaarten');
                }}
                className={`px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-colors flex items-center gap-1 ${
                  activeCategory === 'kaarten'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md border border-amber-300'
                    : 'bg-[#291309] text-amber-200/80 hover:bg-[#3d1d0f] hover:text-amber-100 border border-amber-900/40'
                }`}
              >
                <span>🃏</span>
                <span>Kaarten</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTick(500);
                  setActiveCategory('dobbelstenen');
                }}
                className={`px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-colors flex items-center gap-1 ${
                  activeCategory === 'dobbelstenen'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md border border-amber-300'
                    : 'bg-[#291309] text-amber-200/80 hover:bg-[#3d1d0f] hover:text-amber-100 border border-amber-900/40'
                }`}
              >
                <span>🎲</span>
                <span>Dobbelstenen</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTick(500);
                  setActiveCategory('muziek');
                }}
                className={`px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-colors flex items-center gap-1 ${
                  activeCategory === 'muziek'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md border border-amber-300'
                    : 'bg-[#291309] text-amber-200/80 hover:bg-[#3d1d0f] hover:text-amber-100 border border-amber-900/40'
                }`}
              >
                <span>🎵</span>
                <span>Muziek</span>
              </button>

              {customGames.length > 0 && (
                <button
                  onClick={() => {
                    sounds.playTick(500);
                    setActiveCategory('custom');
                  }}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-colors flex items-center gap-1 ${
                    activeCategory === 'custom'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md border border-amber-300'
                      : 'bg-[#3b1a0d] text-amber-300 hover:bg-[#4d2311] border border-amber-700/40'
                  }`}
                >
                  <span>⭐</span>
                  <span>Eigen Spellen ({customGames.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Wooden Shelf Plank dividing the top controls plank from the books */}
        <div className="relative w-full z-10">
          <div className="h-3.5 sm:h-4 w-full bg-gradient-to-r from-[#854d0e] via-[#a16207] to-[#854d0e] border-t border-[#ca8a04]/50 shadow-[0_4px_10px_rgba(0,0,0,0.6)]" />
          <div className="h-3.5 sm:h-4 w-full bg-gradient-to-r from-[#452718] via-[#5c3420] to-[#452718] border-b-2 border-black/80 flex items-center justify-center">
            <span className="text-[9px] font-black tracking-widest uppercase text-amber-300/80">
              Collectie Planken
            </span>
          </div>
          <div className="h-4 w-full bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        </div>

        {/* Main View Display: Pure Bookshelf View inside the cabinet */}
        <div className="w-full px-1.5 sm:px-3 pt-2 pb-6 bg-[#160b06]/60">
          <BookshelfView games={filteredGames} onSelectGame={setSelectedGame} />
        </div>

        {/* Bottom Base Skirting of Bookcase */}
        <div className="h-6 w-full bg-gradient-to-r from-[#291309] via-[#432111] to-[#291309] border-t-3 border-[#160803]" />
      </div>

      {/* Game Details Modal */}
      <GameDetailModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onDeleteCustom={handleDeleteCustomGame}
        onEdit={(game) => {
          setEditingGame(game);
          setIsAddModalOpen(true);
        }}
      />

      {/* Add / Edit Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        initialGame={editingGame}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGame(null);
        }}
        onSave={handleSaveGame}
      />
    </div>
  );
};
