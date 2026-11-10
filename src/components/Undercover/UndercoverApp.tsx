import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Eye,
  EyeOff,
  Vote,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Skull,
  CheckCircle2,
  ChevronRight,
  Radio,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { loadMiiAvatars, loadRememberedPlayers } from '../../utils/storage';
import { MiiAvatar } from '../../types';
import { MiiFace } from '../MiiMaker/MiiFace';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';
import {
  pickNextWordPair,
  getPlayedWordPairIds,
  resetPlayedWordPairs,
  UNDERCOVER_WORD_PAIRS,
  SelectedWordsResult,
} from './undercoverWords';

export type UndercoverRole = 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';

export interface UndercoverPlayer {
  id: string;
  name: string;
  avatarId?: string;
  role: UndercoverRole;
  word: string | null;
  isEliminated: boolean;
  hasViewedCard: boolean;
}

export type GamePhase =
  | 'SETUP'
  | 'CARD_PICK'
  | 'ROUND_DISCUSSION'
  | 'VOTING'
  | 'ELIMINATION_REVEAL'
  | 'GAME_OVER';

const STORAGE_KEY_PLAYERS = 'undercover_saved_player_names';

export function UndercoverApp() {
  const [miiAvatars] = useState<MiiAvatar[]>(() => loadMiiAvatars());
  const [rememberedNames] = useState<string[]>(() => loadRememberedPlayers());

  // Setup state: player names
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      }
    } catch {}
    // Default players
    return ['Alex', 'Sam', 'Robin', 'Lisa'];
  });

  const [newPlayerInput, setNewPlayerInput] = useState('');
  const [undercoverCount, setUndercoverCount] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('SETUP');

  // Word pair & game round state
  const [wordPairResult, setWordPairResult] = useState<SelectedWordsResult | null>(null);
  const [players, setPlayers] = useState<UndercoverPlayer[]>([]);
  const [activeViewingPlayerIndex, setActiveViewingPlayerIndex] = useState<number>(0);
  const [isRevealingWord, setIsRevealingWord] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState<number>(0);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [lastEliminatedPlayer, setLastEliminatedPlayer] = useState<UndercoverPlayer | null>(null);
  const [winningFaction, setWinningFaction] = useState<'CIVILIANS' | 'UNDERCOVERS' | 'MR_WHITE' | null>(null);
  const [winReason, setWinReason] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stats on available pairs
  const [playedCount, setPlayedCount] = useState<number>(() => getPlayedWordPairIds().length);

  // Save players to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(playerNames));
    } catch {}
  }, [playerNames]);

  // Adjust undercovers if player count shrinks
  useEffect(() => {
    const maxUndercover = Math.max(0, playerNames.length - 2);
    if (undercoverCount > maxUndercover) {
      setUndercoverCount(maxUndercover);
    }
  }, [playerNames.length, undercoverCount]);

  // Handle Game Reset listener from top nav
  useEffect(() => {
    const handleReset = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.app === 'UNDERCOVER') {
        handleBackToSetup();
      }
    };
    window.addEventListener('party_game_reset', handleReset);
    return () => window.removeEventListener('party_game_reset', handleReset);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddPlayer = () => {
    const trimmed = newPlayerInput.trim();
    if (!trimmed) return;
    if (playerNames.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Deze speler staat al in de lijst!');
      return;
    }
    sounds.playTick(750);
    setPlayerNames(prev => [...prev, trimmed]);
    setNewPlayerInput('');
  };

  const handleRemovePlayer = (name: string) => {
    sounds.playTick(500);
    setPlayerNames(prev => prev.filter(p => p !== name));
  };

  const handleQuickAddName = (name: string) => {
    if (playerNames.includes(name)) {
      handleRemovePlayer(name);
    } else {
      sounds.playTick(800);
      setPlayerNames(prev => [...prev, name]);
    }
  };

  const handleResetWordPairsHistory = () => {
    sounds.playTick(500);
    resetPlayedWordPairs();
    setPlayedCount(0);
    showToast('Woordgeschiedenis gereset! Alle 110 duos weer beschikbaar. ✨');
  };

  // Start the mission
  const handleStartGame = () => {
    if (playerNames.length < 3) {
      showToast('Je hebt minimaal 3 spelers nodig!');
      return;
    }

    sounds.playWiiSelect();

    // 1. Pick non-repeating word pair
    const wordData = pickNextWordPair();
    setWordPairResult(wordData);
    setPlayedCount(getPlayedWordPairIds().length);

    if (wordData.isRecycled) {
      showToast('Alle woordenduos zijn een keer gespeeld! Nieuwe cyclus gestart.');
    }

    // 2. Assign roles
    // Always 1 Mr. White (No word)
    // undercoverCount Undercover Aliens (undercoverWord)
    // remainder Civilians (civilianWord)
    const total = playerNames.length;
    const mrWhiteCount = 1;
    const civilianCount = total - undercoverCount - mrWhiteCount;

    const rolesPool: UndercoverRole[] = [
      ...Array(civilianCount).fill('CIVILIAN'),
      ...Array(undercoverCount).fill('UNDERCOVER'),
      ...Array(mrWhiteCount).fill('MR_WHITE'),
    ];

    // Shuffle roles pool
    for (let i = rolesPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesPool[i], rolesPool[j]] = [rolesPool[j], rolesPool[i]];
    }

    // Build player objects
    const initialPlayers: UndercoverPlayer[] = playerNames.map((name, idx) => {
      const role = rolesPool[idx];
      let word: string | null = null;
      if (role === 'CIVILIAN') word = wordData.civilianWord;
      else if (role === 'UNDERCOVER') word = wordData.undercoverWord;
      else if (role === 'MR_WHITE') word = null;

      const matchedMii = miiAvatars.find(
        m => m.name.toLowerCase() === name.toLowerCase()
      );

      return {
        id: `p-${idx}-${name}`,
        name,
        avatarId: matchedMii?.id,
        role,
        word,
        isEliminated: false,
        hasViewedCard: false,
      };
    });

    setPlayers(initialPlayers);
    setActiveViewingPlayerIndex(0);
    setIsRevealingWord(false);
    setCurrentRound(1);
    setActiveSpeakerIndex(0);
    setSelectedSuspectId(null);
    setLastEliminatedPlayer(null);
    setWinningFaction(null);
    setWinReason('');
    setPhase('CARD_PICK');
  };

  // Card viewing logic
  const currentViewingPlayer = players[activeViewingPlayerIndex];

  const handleNextPlayerCard = () => {
    sounds.playTick(600);
    // Mark current player as viewed
    const updated = [...players];
    updated[activeViewingPlayerIndex].hasViewedCard = true;
    setPlayers(updated);
    setIsRevealingWord(false);

    if (activeViewingPlayerIndex + 1 < players.length) {
      setActiveViewingPlayerIndex(prev => prev + 1);
    } else {
      // Everyone has viewed their card! Start Round 1
      sounds.playReveal();
      setPhase('ROUND_DISCUSSION');
      setActiveSpeakerIndex(0);
    }
  };

  // Speaking turn navigation
  const alivePlayers = players.filter(p => !p.isEliminated);
  const currentSpeaker = alivePlayers[activeSpeakerIndex % Math.max(1, alivePlayers.length)];

  const handleNextSpeaker = () => {
    sounds.playTick(700);
    setActiveSpeakerIndex(prev => (prev + 1) % alivePlayers.length);
  };

  const handleGoToVoting = () => {
    sounds.playWiiSelect();
    setSelectedSuspectId(null);
    setPhase('VOTING');
  };

  // Eliminate player & evaluate game win conditions
  const handleConfirmElimination = (suspectId: string) => {
    const eliminated = players.find(p => p.id === suspectId);
    if (!eliminated) return;

    sounds.playAlienElimination();

    const updatedPlayers = players.map(p =>
      p.id === suspectId ? { ...p, isEliminated: true } : p
    );
    setPlayers(updatedPlayers);
    setLastEliminatedPlayer(eliminated);
    setPhase('ELIMINATION_REVEAL');

    // Evaluate Win Condition:
    // 1. Speler zonder woord (Alien) eruit gestemd -> Burgers winnen direct!
    // 2. Alle infiltranten (Undercovers + Alien) geëlimineerd -> Burgers winnen!
    // 3. Slechts 2 spelers over: als Alien nog leeft -> Alien wint!
    // 4. Undercovers >= Burgers (mits Undercovers meedoen) -> Undercovers winnen!
    // 5. Geen Burgers meer over -> Infiltranten winnen!

    const remaining = updatedPlayers.filter(p => !p.isEliminated);
    const remainingCivilians = remaining.filter(p => p.role === 'CIVILIAN');
    const remainingUndercovers = remaining.filter(p => p.role === 'UNDERCOVER');
    const mrWhiteAlive = remaining.some(p => p.role === 'MR_WHITE');

    if (eliminated.role === 'MR_WHITE') {
      // Alien Zonder Woord eliminated!
      setWinningFaction('CIVILIANS');
      setWinReason(
        'De Alien (Zonder woord) is ontmaskerd en weggestemd! De Burgers (Normaal) hebben gewonnen!'
      );
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } else if (remainingUndercovers.length === 0 && !mrWhiteAlive) {
      // All infiltrators eliminated
      setWinningFaction('CIVILIANS');
      setWinReason(
        'Alle infiltranten zijn uitgeschakeld! De Burgers (Normaal) hebben gewonnen!'
      );
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } else if (remaining.length <= 2) {
      if (mrWhiteAlive) {
        setWinningFaction('MR_WHITE');
        setWinReason(
          'De Alien (Zonder woord) heeft overleefd tot de laatste 2 spelers en wint het spel!'
        );
        sounds.playFanfare();
      } else if (remainingUndercovers.length >= remainingCivilians.length) {
        setWinningFaction('UNDERCOVERS');
        setWinReason(
          'De Undercover (Astronaut) heeft de overhand en wint het spel!'
        );
        sounds.playFanfare();
      } else {
        setWinningFaction('CIVILIANS');
        setWinReason('De Burgers (Normaal) hebben gewonnen!');
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }
    } else if (remainingUndercovers.length > 0 && remainingUndercovers.length >= remainingCivilians.length) {
      setWinningFaction('UNDERCOVERS');
      setWinReason(
        'De Undercovers (Astronauten) zijn in de meerderheid en winnen het spel!'
      );
      sounds.playFanfare();
    } else if (remainingCivilians.length === 0) {
      if (mrWhiteAlive) {
        setWinningFaction('MR_WHITE');
        setWinReason('Alle burgers zijn weggestemd! De Alien (Zonder woord) wint!');
      } else {
        setWinningFaction('UNDERCOVERS');
        setWinReason('Alle burgers zijn weggestemd! De Undercover (Astronaut) wint!');
      }
      sounds.playFanfare();
    }
  };

  const handleContinueAfterElimination = () => {
    if (winningFaction) {
      setPhase('GAME_OVER');
      sounds.playCheerFanfare();
      return;
    }

    // Continue to next round
    sounds.playWiiSelect();
    setCurrentRound(prev => prev + 1);
    setActiveSpeakerIndex(0);
    setPhase('ROUND_DISCUSSION');
  };

  const handleBackToSetup = () => {
    sounds.playWiiBack();
    setPhase('SETUP');
    setWinningFaction(null);
  };

  const getAvatarForPlayer = (name: string): MiiAvatar | undefined => {
    return miiAvatars.find(m => m.name.toLowerCase() === name.toLowerCase());
  };

  // Calculated counts for setup
  const totalCount = playerNames.length;
  const mrWhiteFixedCount = 1;
  const civilianCalculatedCount = Math.max(1, totalCount - undercoverCount - mrWhiteFixedCount);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-5 text-slate-100 select-none pb-20">
      {/* 
        =======================================================================
        PHASE 1: SETUP
        =======================================================================
      */}
      {phase === 'SETUP' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Role Counts Configuration Card */}
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Rol Verdeling ({totalCount} spelers)</span>
              <span className="text-purple-400">Altijd 1 alien zonder woord</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {/* Burgers (Normaal) */}
              <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 text-center flex flex-col justify-between">
                <div>
                  <span className="text-2xl block">👨‍💼</span>
                  <span className="text-[10px] uppercase font-black text-emerald-400 block mt-0.5 leading-tight">
                    Burger<br /><span className="text-[9px] opacity-80">(Normaal)</span>
                  </span>
                </div>
                <span className="text-xl font-black text-white mt-1">
                  {civilianCalculatedCount}
                </span>
              </div>

              {/* Undercovers (Astronaut) - Adjustable down to 0 */}
              <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-cyan-500/40 text-center flex flex-col justify-between">
                <div>
                  <span className="text-2xl block">👨‍🚀</span>
                  <span className="text-[10px] uppercase font-black text-cyan-400 block mt-0.5 leading-tight">
                    Undercover<br /><span className="text-[9px] opacity-80">(Astronaut)</span>
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <button
                    onClick={() => {
                      sounds.playTick(500);
                      setUndercoverCount(prev => Math.max(0, prev - 1));
                    }}
                    disabled={undercoverCount <= 0}
                    className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white font-black text-xs flex items-center justify-center cursor-pointer transition-opacity"
                    title="Minder undercovers"
                  >
                    -
                  </button>
                  <span className="text-lg font-black text-white min-w-4 text-center">
                    {undercoverCount}
                  </span>
                  <button
                    onClick={() => {
                      sounds.playTick(700);
                      setUndercoverCount(prev =>
                        Math.min(Math.max(0, totalCount - 2), prev + 1)
                      );
                    }}
                    disabled={undercoverCount >= totalCount - 2}
                    className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white font-black text-xs flex items-center justify-center cursor-pointer transition-opacity"
                    title="Meer undercovers"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Alien (Zonder Woord) */}
              <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-purple-500/40 text-center flex flex-col justify-between">
                <div>
                  <span className="text-2xl block">👽</span>
                  <span className="text-[10px] uppercase font-black text-purple-400 block mt-0.5 leading-tight">
                    Alien<br /><span className="text-[9px] opacity-80">(Zonder woord)</span>
                  </span>
                </div>
                <span className="text-xl font-black text-white mt-1">
                  1
                </span>
              </div>
            </div>
          </div>

          {/* Players Selection & Addition */}
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Spelers ({playerNames.length})</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Min. 3 spelers
              </span>
            </div>

            {/* Input field + Add button + Poppetjes Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newPlayerInput}
                onChange={e => setNewPlayerInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Typ een spelernaam..."
                maxLength={16}
                className="flex-1 min-w-[130px] px-3.5 py-2.5 rounded-2xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 font-bold text-xs focus:border-cyan-400 outline-none"
              />
              <button
                onClick={handleAddPlayer}
                className="px-3.5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center gap-1 active:scale-95 transition-transform shadow-md cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Speler</span>
              </button>
              <PlayerPickerDropdown
                compact
                existingNames={playerNames}
                buttonLabel="Poppetjes"
                buttonClassName="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-black cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
                onSelectPlayer={(name) => {
                  if (playerNames.some(p => p.toLowerCase() === name.toLowerCase())) {
                    showToast('Deze speler staat al in de lijst!');
                    return;
                  }
                  sounds.playTick(750);
                  setPlayerNames(prev => [...prev, name]);
                }}
              />
            </div>

            {/* Quick Add from Mii Maker / Remembered */}
            {(miiAvatars.length > 0 || rememberedNames.length > 0) && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Snelle selectie uit gemaakte spelers:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {Array.from(
                    new Set([
                      ...miiAvatars.map(m => m.name),
                      ...rememberedNames,
                    ])
                  ).map(name => {
                    const isSelected = playerNames.includes(name);
                    const avatar = getAvatarForPlayer(name);
                    return (
                      <button
                        key={name}
                        onClick={() => handleQuickAddName(name)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-xs'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {avatar ? (
                          <MiiFace avatar={avatar} size={18} showBorder={false} />
                        ) : (
                          <span>👤</span>
                        )}
                        <span>{name}</span>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Players Tag Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 pt-1">
              {playerNames.map((name, idx) => {
                const avatar = getAvatarForPlayer(name);
                return (
                  <div
                    key={`${name}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {avatar ? (
                        <MiiFace avatar={avatar} size={24} showBorder={false} />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 flex items-center justify-center text-xs">
                          {name[0].toUpperCase()}
                        </div>
                      )}
                      <span className="truncate text-white text-xs">{name}</span>
                    </div>
                    <button
                      onClick={() => handleRemovePlayer(name)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Word Pairs Rotation Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>
                <strong>{UNDERCOVER_WORD_PAIRS.length - playedCount}</strong> van de {UNDERCOVER_WORD_PAIRS.length} unieke woordenduos beschikbaar
              </span>
            </div>
            {playedCount > 0 && (
              <button
                onClick={handleResetWordPairsHistory}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Geschiedenis resetten"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Big Start Button */}
          <button
            onClick={handleStartGame}
            disabled={playerNames.length < 3}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 text-slate-950 font-black text-base shadow-xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Start Alien Missie (Rollen Verdelen)</span>
          </button>
        </div>
      )}

      {/* 
        =======================================================================
        PHASE 2: CARD PICK (PASS & PLAY SECRET WORD REVEAL)
        =======================================================================
      */}
      {phase === 'CARD_PICK' && currentViewingPlayer && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header indicator */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Kaart {activeViewingPlayerIndex + 1} van {players.length}
            </span>
            <span className="text-xs text-slate-400">
              Niemand mag meekijken! 🤫
            </span>
          </div>

          {/* Mystery Pass Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/40 shadow-2xl text-center space-y-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500" />

            {/* Player Name Banner */}
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Geef de telefoon aan:
              </span>
              <div className="flex items-center gap-2.5">
                {getAvatarForPlayer(currentViewingPlayer.name) ? (
                  <MiiFace
                    avatar={getAvatarForPlayer(currentViewingPlayer.name)!}
                    size={48}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 font-black text-xl flex items-center justify-center border border-cyan-400">
                    {currentViewingPlayer.name[0].toUpperCase()}
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentViewingPlayer.name}
                </h2>
              </div>
            </div>

            {/* Secret Reveal Area */}
            {!isRevealingWord ? (
              <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
                <button
                  onClick={() => {
                    sounds.playAlienScan();
                    setIsRevealingWord(true);
                  }}
                  className="w-48 h-48 rounded-3xl bg-slate-950/80 border-2 border-dashed border-cyan-400/60 hover:border-cyan-400 hover:bg-slate-950 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-inner active:scale-95 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🛸
                  </div>
                  <div className="text-center px-4">
                    <span className="text-xs font-black uppercase text-cyan-400 block tracking-wide">
                      Tik om te scannen
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Bekijk jouw geheime identiteit
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="py-6 sm:py-8 flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-150">
                {currentViewingPlayer.role === 'MR_WHITE' ? (
                  /* ALIEN (ZONDER WOORD) */
                  <div className="w-full max-w-md p-5 rounded-3xl bg-purple-950/40 border-2 border-purple-500/60 shadow-xl text-center space-y-2">
                    <span className="text-4xl block animate-bounce">👽</span>
                    <span className="text-xs font-black uppercase tracking-widest text-purple-400 block">
                      Jij bent de
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-purple-200 tracking-tight">
                      Alien (Zonder woord)!
                    </h3>
                    <div className="p-3 rounded-2xl bg-purple-900/30 border border-purple-500/30 text-xs text-purple-200 font-semibold leading-relaxed">
                      Je hebt <strong>GEEN</strong> woord gekregen! Luister straks heel goed naar de woorden van de anderen, bluf mee en probeer te raden wat hun woord is zonder ontdekt te worden!
                    </div>
                  </div>
                ) : currentViewingPlayer.role === 'UNDERCOVER' ? (
                  /* UNDERCOVER (ASTRONAUT) */
                  <div className="w-full max-w-md p-5 rounded-3xl bg-cyan-950/40 border-2 border-cyan-500/60 shadow-xl text-center space-y-2">
                    <span className="text-4xl block">👨‍🚀</span>
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-400 block">
                      Jij bent de Undercover (Astronaut)!
                    </span>
                    <div className="py-3 px-4 rounded-2xl bg-cyan-950/80 border border-cyan-400 text-3xl sm:text-4xl font-black text-white tracking-wide shadow-inner">
                      {currentViewingPlayer.word}
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">
                      Jouw geheime woord wijkt net iets af van dat van de burgers. Probeer te achterhalen wie de Alien is en wie de Burgers zijn!
                    </p>
                  </div>
                ) : (
                  /* BURGER (NORMAAL) */
                  <div className="w-full max-w-md p-5 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/60 shadow-xl text-center space-y-2">
                    <span className="text-4xl block">👨‍💼</span>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block">
                      Jij bent een Burger (Normaal)
                    </span>
                    <div className="py-3 px-4 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-3xl sm:text-4xl font-black text-white tracking-wide shadow-inner">
                      {currentViewingPlayer.word}
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">
                      Onthoud dit woord goed! Verraad het niet direct, maar geef straks hints die er subtiel aan linken en stem de infiltranten eruit.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Confirmation & Next Player Button */}
            {isRevealingWord && (
              <button
                onClick={handleNextPlayerCard}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>
                  Ik heb het gezien! (Verberg kaart voor volgende)
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        PHASE 3: ROUND DISCUSSION
        =======================================================================
      */}
      {phase === 'ROUND_DISCUSSION' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Round Header */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
                Missiefase · Ronde {currentRound}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Deel je Hints!
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block">
                Nog in het spel
              </span>
              <span className="text-sm font-black text-emerald-400">
                {alivePlayers.length} spelers
              </span>
            </div>
          </div>

          {/* Turn-by-turn guidance */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Nu aan het woord:
            </span>

            {currentSpeaker && (
              <div className="flex flex-col items-center justify-center gap-2 py-1">
                {getAvatarForPlayer(currentSpeaker.name) ? (
                  <MiiFace
                    avatar={getAvatarForPlayer(currentSpeaker.name)!}
                    size={64}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-2xl flex items-center justify-center border-2 border-cyan-400 shadow-md">
                    {currentSpeaker.name[0].toUpperCase()}
                  </div>
                )}
                <h3 className="text-2xl font-black text-white">
                  {currentSpeaker.name}
                </h3>
              </div>
            )}

            <p className="text-xs sm:text-sm text-cyan-200/90 max-w-md mx-auto leading-relaxed bg-cyan-950/40 p-3 rounded-2xl border border-cyan-500/20 font-semibold">
              🗣️ Zeg om de beurt <strong>één woord</strong> dat linkt aan jouw geheime woord. Geef niet te veel weg zodat de Alien (Zonder woord) het niet raadt!
            </p>

            <button
              onClick={handleNextSpeaker}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Volgende speler aan de beurt</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alive Players Speaking Order List */}
          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
              Spreekvolgorde aan tafel:
            </span>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
              {alivePlayers.map((p, idx) => {
                const isCurrent = currentSpeaker?.id === p.id;
                const avatar = getAvatarForPlayer(p.name);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-md scale-102 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-black text-cyan-400 w-4 text-center">
                      {idx + 1}.
                    </span>
                    {avatar ? (
                      <MiiFace avatar={avatar} size={22} showBorder={false} />
                    ) : (
                      <span className="text-xs">👤</span>
                    )}
                    <span className="text-xs font-bold truncate">{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Button to Voting Phase */}
          <button
            onClick={handleGoToVoting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm tracking-wide shadow-xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Vote className="w-4 h-4 text-white" />
            <span>Iedereen heeft een woord gezegd → Naar Stemronde!</span>
          </button>
        </div>
      )}

      {/* 
        =======================================================================
        PHASE 4: VOTING PHASE
        =======================================================================
      */}
      {phase === 'VOTING' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-xl text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
              Stemronde · Ronde {currentRound}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Wie verdenken jullie?
            </h2>
            <p className="text-xs text-slate-300">
              Bespreek wie er verdacht klinkt en selecteer de speler die eruit gestemd moet worden.
            </p>
          </div>

          {/* Suspect Selection Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {alivePlayers.map(p => {
              const isSelected = selectedSuspectId === p.id;
              const avatar = getAvatarForPlayer(p.name);

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    sounds.playTick(650);
                    setSelectedSuspectId(isSelected ? null : p.id);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-purple-950/70 border-purple-400 shadow-xl scale-103 ring-2 ring-purple-400/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {avatar ? (
                    <MiiFace avatar={avatar} size={48} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-black text-lg flex items-center justify-center border border-slate-700">
                      {p.name[0].toUpperCase()}
                    </div>
                  )}

                  <span className="text-sm font-black text-white truncate max-w-full">
                    {p.name}
                  </span>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Geselecteerd' : 'Tik om te stemmen'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action button */}
          {selectedSuspectId && (
            <div className="pt-2 animate-in slide-in-from-bottom-2 duration-150">
              <button
                onClick={() => handleConfirmElimination(selectedSuspectId)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Skull className="w-4 h-4" />
                <span>
                  Elimineer {players.find(p => p.id === selectedSuspectId)?.name} &amp; Onthul Rol! 🚀
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 
        =======================================================================
        PHASE 5: ELIMINATION REVEAL
        =======================================================================
      */}
      {phase === 'ELIMINATION_REVEAL' && lastEliminatedPlayer && (
        <div className="space-y-5 animate-in zoom-in-95 duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/40 shadow-2xl text-center space-y-4 backdrop-blur-md">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
              Het moederschip heeft gesproken!
            </span>

            <div className="py-2">
              <div className="flex flex-col items-center justify-center gap-2">
                {getAvatarForPlayer(lastEliminatedPlayer.name) ? (
                  <MiiFace
                    avatar={getAvatarForPlayer(lastEliminatedPlayer.name)!}
                    size={64}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-black text-2xl flex items-center justify-center border-2 border-slate-700">
                    {lastEliminatedPlayer.name[0].toUpperCase()}
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {lastEliminatedPlayer.name}
                </h2>
                <span className="text-xs text-slate-400 font-bold">was...</span>
              </div>
            </div>

            {/* Revealed Role Banner */}
            <div
              className={`p-4 rounded-2xl border-2 text-center shadow-lg ${
                lastEliminatedPlayer.role === 'MR_WHITE'
                  ? 'bg-purple-950/60 border-purple-400 text-purple-200'
                  : lastEliminatedPlayer.role === 'UNDERCOVER'
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                  : 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
              }`}
            >
              <span className="text-3xl block mb-1">
                {lastEliminatedPlayer.role === 'MR_WHITE'
                  ? '👽'
                  : lastEliminatedPlayer.role === 'UNDERCOVER'
                  ? '👨‍🚀'
                  : '👨‍💼'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                {lastEliminatedPlayer.role === 'MR_WHITE'
                  ? 'De Alien (Zonder woord)!'
                  : lastEliminatedPlayer.role === 'UNDERCOVER'
                  ? 'De Undercover (Astronaut)!'
                  : 'Een Burger (Normaal)!'}
              </h3>
              {lastEliminatedPlayer.word && (
                <span className="text-xs font-bold block mt-1 opacity-80">
                  (Woord was: {lastEliminatedPlayer.word})
                </span>
              )}
            </div>

            {/* Outcome notice if game ending */}
            {winningFaction ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-200 text-xs font-bold leading-relaxed">
                🎉 {winReason}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">
                Het spel gaat door! Er zijn nog {alivePlayers.length} spelers over.
              </p>
            )}

            {/* Continue button */}
            <button
              onClick={handleContinueAfterElimination}
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{winningFaction ? 'Bekijk Einduitslag 🏆' : 'Volgende Ronde Starten 🚀'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        PHASE 6: GAME OVER (DEBRIEFING & ALL WORDS REVEALED)
        =======================================================================
      */}
      {phase === 'GAME_OVER' && wordPairResult && (
        <div className="space-y-4 animate-in zoom-in-95 duration-200">
          {/* Victory Banner */}
          <div className="p-6 rounded-3xl bg-slate-900/95 border-2 border-cyan-400/50 shadow-2xl text-center space-y-2 backdrop-blur-md">
            <span className="text-4xl block">🏆</span>
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 block">
              Missie Voltooid
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {winningFaction === 'CIVILIANS'
                ? 'De Burgers (Normaal) Winnen!'
                : winningFaction === 'UNDERCOVERS'
                ? 'De Undercovers (Astronauten) Winnen!'
                : 'De Alien (Zonder woord) Wint!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold max-w-md mx-auto">
              {winReason}
            </p>
          </div>

          {/* Words Reveal Card */}
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              De Geheime Woorden ({wordPairResult.pair.category})
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                <span className="text-[10px] font-black uppercase text-emerald-400 block">
                  Burger (Normaal) Woord
                </span>
                <span className="text-lg font-black text-white block mt-0.5">
                  {wordPairResult.civilianWord}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                <span className="text-[10px] font-black uppercase text-cyan-400 block">
                  Undercover (Astronaut) Woord
                </span>
                <span className="text-lg font-black text-white block mt-0.5">
                  {undercoverCount > 0 ? wordPairResult.undercoverWord : 'Geen undercovers in dit spel'}
                </span>
              </div>
            </div>
          </div>

          {/* Full Player List Debriefing */}
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Spelers &amp; Rollen Debriefing
            </h3>

            <div className="space-y-1.5">
              {players.map(p => {
                const avatar = getAvatarForPlayer(p.name);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold ${
                      p.isEliminated
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-500 line-through'
                        : 'bg-slate-950/70 border-slate-800 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {avatar ? (
                        <MiiFace avatar={avatar} size={24} showBorder={false} />
                      ) : (
                        <span className="text-xs">👤</span>
                      )}
                      <span className="truncate">{p.name}</span>
                      {p.isEliminated && (
                        <span className="text-[10px] text-rose-400 no-underline font-black">
                          (Eruit)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.role === 'MR_WHITE'
                            ? 'bg-purple-900/70 text-purple-300 border border-purple-500/40'
                            : p.role === 'UNDERCOVER'
                            ? 'bg-cyan-900/70 text-cyan-300 border border-cyan-500/40'
                            : 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {p.role === 'MR_WHITE'
                          ? 'Alien (Zonder woord)'
                          : p.role === 'UNDERCOVER'
                          ? 'Undercover (Astronaut)'
                          : 'Burger (Normaal)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Nieuwe Ronde (Nieuw Woordenduo) 🚀</span>
            </button>

            <button
              onClick={handleBackToSetup}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Spelers of Aantallen Aanpassen</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md border border-cyan-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
