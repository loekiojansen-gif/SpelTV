import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import {
  getAllWords,
  drawRandomWords,
  addCustomWord,
  deleteCustomWord,
  loadCustomWords,
} from './thirtySecondsData';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';
import { MiiAvatar } from '../../types';
import { MiiFace } from '../MiiMaker/MiiFace';
import {
  Play,
  RotateCcw,
  Check,
  Pause,
  Timer,
  Trophy,
  Plus,
  Trash2,
  Sparkles,
  Dices,
  ChevronRight,
  BookOpen,
  X,
  Search,
  Pencil,
} from 'lucide-react';

interface PlayerItem {
  id: string;
  name: string;
  avatar?: MiiAvatar;
}

interface TeamState {
  name: string;
  color: string;
  players: PlayerItem[];
  score: number;
}

type GamePhase = 'setup' | 'turn-prep' | 'turn-active' | 'turn-review' | 'game-over';

interface ThirtySecondsAppProps {
  isCurrentApp?: boolean;
}

const STORAGE_ACTIVE_GAME_KEY = 'party_channels_30s_saved_match_v3';

export function ThirtySecondsApp({ isCurrentApp = true }: ThirtySecondsAppProps) {
  // Try restoring saved state if available
  const [restoredInitial] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_GAME_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  // Phase management
  const [phase, setPhase] = useState<GamePhase>(
    () => restoredInitial?.phase || 'setup'
  );

  // Teams: Pure Primary Yellow & Pure Primary Blue
  const [teams, setTeams] = useState<[TeamState, TeamState]>(() => {
    if (restoredInitial?.teams && Array.isArray(restoredInitial.teams) && restoredInitial.teams.length === 2) {
      return restoredInitial.teams;
    }
    return [
      {
        name: 'Team Geel',
        color: '#facc15', // Pure primary yellow
        players: [
          { id: 'p-1', name: 'Speler 1' },
          { id: 'p-2', name: 'Speler 2' },
        ],
        score: 0,
      },
      {
        name: 'Team Blauw',
        color: '#2563eb', // Pure primary blue
        players: [
          { id: 'p-3', name: 'Speler 3' },
          { id: 'p-4', name: 'Speler 4' },
        ],
        score: 0,
      },
    ];
  });

  // Turn management
  const [activeTeamIndex, setActiveTeamIndex] = useState<0 | 1>(
    () => restoredInitial?.activeTeamIndex ?? 0
  );
  const [teamPlayerTurnIndices, setTeamPlayerTurnIndices] = useState<[number, number]>(
    () => restoredInitial?.teamPlayerTurnIndices || [0, 0]
  );
  const [roundNumber, setRoundNumber] = useState<number>(
    () => restoredInitial?.roundNumber || 1
  );
  const [targetScore, setTargetScore] = useState<number>(
    () => restoredInitial?.targetScore || 30
  );
  const [turnDuration, setTurnDuration] = useState<number>(
    () => restoredInitial?.turnDuration || 30
  );
  const [useDice, setUseDice] = useState<boolean>(
    () => restoredInitial?.useDice ?? true
  );
  const [diceRoll, setDiceRoll] = useState<number | null>(
    () => restoredInitial?.diceRoll ?? null
  );
  const [isRollingDice, setIsRollingDice] = useState<boolean>(false);

  // Active turn words and used pool tracking
  const [turnWords, setTurnWords] = useState<[string, string, string, string, string]>(
    () => restoredInitial?.turnWords || ['', '', '', '', '']
  );
  const [usedWordsSet, setUsedWordsSet] = useState<Set<string>>(
    () => new Set(restoredInitial?.usedWordsList || [])
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(
    () => restoredInitial?.secondsLeft || 30
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [guessedWords, setGuessedWords] = useState<boolean[]>(
    () => restoredInitial?.guessedWords || [false, false, false, false, false]
  );

  // Player editing state
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState<string>('');
  const [newPlayerInputs, setNewPlayerInputs] = useState<[string, string]>(['', '']);

  // Word pool viewer & management modal
  const [showWordModal, setShowWordModal] = useState<boolean>(false);
  const [wordSearchQuery, setWordSearchQuery] = useState<string>('');
  const [newSingleWordInput, setNewSingleWordInput] = useState<string>('');
  const [customWordsList, setCustomWordsList] = useState<string[]>([]);
  const [allWordsCache, setAllWordsCache] = useState<string[]>([]);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load word pool info on mount
  useEffect(() => {
    refreshWordsPool();
  }, []);

  const refreshWordsPool = () => {
    const custom = loadCustomWords();
    setCustomWordsList(custom);
    setAllWordsCache(getAllWords());
  };

  // Universal reset listener from WiiNavBar
  useEffect(() => {
    const handleReset = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail?.app || customEvent.detail.app === 'thirty-seconds') {
        setShowResetConfirm(true);
      }
    };
    window.addEventListener('party_game_reset', handleReset);
    return () => window.removeEventListener('party_game_reset', handleReset);
  }, []);

  // Save match state to localStorage for persistence
  useEffect(() => {
    try {
      const stateToSave = {
        phase,
        teams,
        activeTeamIndex,
        teamPlayerTurnIndices,
        roundNumber,
        targetScore,
        turnDuration,
        useDice,
        diceRoll,
        turnWords,
        usedWordsList: Array.from(usedWordsSet),
        secondsLeft,
        guessedWords,
      };
      localStorage.setItem(STORAGE_ACTIVE_GAME_KEY, JSON.stringify(stateToSave));
    } catch {}
  }, [
    phase,
    teams,
    activeTeamIndex,
    teamPlayerTurnIndices,
    roundNumber,
    targetScore,
    turnDuration,
    useDice,
    diceRoll,
    turnWords,
    usedWordsSet,
    secondsLeft,
    guessedWords,
  ]);

  // Timer tick effect (only ticks if app is currently visible/active)
  useEffect(() => {
    if (phase === 'turn-active' && !isPaused && isCurrentApp && secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft(prev => {
          const next = prev - 1;
          if (next <= 5 && next > 0) {
            sounds.playCountdownPip();
          } else if (next === 0) {
            sounds.playBuzzer();
            setPhase('turn-review');
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, isPaused, isCurrentApp, secondsLeft]);

  // --------------------------------------------------------------------------
  // Player Management
  // --------------------------------------------------------------------------
  const handleStartEditPlayer = (p: PlayerItem) => {
    setEditingPlayerId(p.id);
    setEditingPlayerName(p.name);
    sounds.playTick(600);
  };

  const handleSavePlayerEdit = (teamIdx: 0 | 1, playerId: string) => {
    const trimmed = editingPlayerName.trim();
    if (trimmed) {
      setTeams(prev => {
        const next = [...prev] as [TeamState, TeamState];
        next[teamIdx].players = next[teamIdx].players.map(p =>
          p.id === playerId ? { ...p, name: trimmed } : p
        );
        return next;
      });
    }
    setEditingPlayerId(null);
    sounds.playTick(700);
  };

  const handleAddPlayer = (teamIdx: 0 | 1, customName?: string, avatar?: MiiAvatar) => {
    const inputVal = customName !== undefined ? customName : newPlayerInputs[teamIdx];
    const nameToAdd = inputVal.trim() || `Speler ${teams[teamIdx].players.length + 1}`;

    const newP: PlayerItem = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: nameToAdd,
      avatar,
    };

    setTeams(prev => {
      const next = [...prev] as [TeamState, TeamState];
      next[teamIdx].players = [...next[teamIdx].players, newP];
      return next;
    });

    if (customName === undefined) {
      setNewPlayerInputs(prev => {
        const next = [...prev] as [string, string];
        next[teamIdx] = '';
        return next;
      });
    }
    sounds.playTick(800);
  };

  const handleRemovePlayer = (teamIdx: 0 | 1, playerId: string) => {
    if (teams[teamIdx].players.length <= 1) return;
    setTeams(prev => {
      const next = [...prev] as [TeamState, TeamState];
      next[teamIdx].players = next[teamIdx].players.filter(p => p.id !== playerId);
      return next;
    });
    if (editingPlayerId === playerId) {
      setEditingPlayerId(null);
    }
    sounds.playTick(500);
  };

  // --------------------------------------------------------------------------
  // Word Management Modal Handlers
  // --------------------------------------------------------------------------
  const handleAddSingleWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSingleWordInput.trim();
    if (!trimmed) return;

    addCustomWord(trimmed);
    setNewSingleWordInput('');
    refreshWordsPool();
    sounds.playFanfare();
  };

  const handleDeleteSingleWord = (word: string) => {
    deleteCustomWord(word);
    refreshWordsPool();
    sounds.playTick(400);
  };

  // --------------------------------------------------------------------------
  // Dice Rolling
  // --------------------------------------------------------------------------
  const handleRollDice = () => {
    if (isRollingDice) return;
    setIsRollingDice(true);
    sounds.playDiceRoll();

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 3)); // 0, 1, or 2
      rolls++;
      if (rolls > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 3);
        setDiceRoll(finalRoll);
        setIsRollingDice(false);
        sounds.playTick(900);
      }
    }, 80);
  };

  // --------------------------------------------------------------------------
  // Game Flow Actions
  // --------------------------------------------------------------------------
  const handleStartGame = () => {
    if (teams[0].players.length === 0 || teams[1].players.length === 0) {
      return;
    }
    setPhase('turn-prep');
    setActiveTeamIndex(0);
    setTeamPlayerTurnIndices([0, 0]);
    setRoundNumber(1);
    setDiceRoll(null);
    prepareNewTurn();
    sounds.playFanfare();
  };

  const prepareNewTurn = () => {
    // Draw 5 completely random, unassociated words from pool
    const { words, newlyUsed } = drawRandomWords(5, usedWordsSet);
    setTurnWords(words);
    setUsedWordsSet(newlyUsed);
    setGuessedWords([false, false, false, false, false]);
    setSecondsLeft(turnDuration);
    setIsPaused(false);
    if (useDice) {
      setDiceRoll(null);
    }
  };

  const handleStartActiveTurn = () => {
    setSecondsLeft(turnDuration);
    setIsPaused(false);
    setGuessedWords([false, false, false, false, false]);
    setPhase('turn-active');
    sounds.playTick(1000);
  };

  const handleToggleWordGuessed = (idx: number) => {
    setGuessedWords(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      if (next[idx]) {
        sounds.playTick(1200);
      } else {
        sounds.playTick(600);
      }
      return next;
    });
  };

  const handleFinishTurnEarly = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    sounds.playBuzzer();
    setPhase('turn-review');
  };

  const handleConfirmTurnScore = () => {
    const rawScore = guessedWords.filter(Boolean).length;
    const handicap = useDice && diceRoll !== null ? diceRoll : 0;
    const finalEarned = Math.max(0, rawScore - handicap);

    const activeTeam = teams[activeTeamIndex];
    const newTeamScore = activeTeam.score + finalEarned;

    setTeams(prev => {
      const next = [...prev] as [TeamState, TeamState];
      next[activeTeamIndex].score = newTeamScore;
      return next;
    });

    sounds.playFanfare();

    if (newTeamScore >= targetScore) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
      setPhase('game-over');
      return;
    }

    setTeamPlayerTurnIndices(prev => {
      const next = [...prev] as [number, number];
      next[activeTeamIndex] = next[activeTeamIndex] + 1;
      return next;
    });

    const nextTeamIdx: 0 | 1 = activeTeamIndex === 0 ? 1 : 0;
    setActiveTeamIndex(nextTeamIdx);
    if (nextTeamIdx === 0) {
      setRoundNumber(prev => prev + 1);
    }

    prepareNewTurn();
    setPhase('turn-prep');
  };

  const handleResetMatch = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTeams(prev => [
      { ...prev[0], score: 0 },
      { ...prev[1], score: 0 },
    ]);
    setActiveTeamIndex(0);
    setTeamPlayerTurnIndices([0, 0]);
    setRoundNumber(1);
    setUsedWordsSet(new Set());
    setPhase('setup');
    setShowResetConfirm(false);
    try {
      localStorage.removeItem(STORAGE_ACTIVE_GAME_KEY);
    } catch {}
    sounds.playTick(500);
  };

  // Current active player info
  const currentTeam = teams[activeTeamIndex];
  const currentTeamPlayers = currentTeam.players;
  const currentTurnPlayerIndex =
    teamPlayerTurnIndices[activeTeamIndex] % Math.max(1, currentTeamPlayers.length);
  const currentTurnPlayer = currentTeamPlayers[currentTurnPlayerIndex] || {
    id: 'unknown',
    name: 'Speler',
  };

  // Filtered words in dictionary viewer
  const filteredWords = allWordsCache.filter(w =>
    w.toLowerCase().includes(wordSearchQuery.toLowerCase())
  );
  const customSet = new Set(customWordsList.map(w => w.toLowerCase()));

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 text-slate-100">
      {/* =========================================================================
          PHASE: SETUP
          ========================================================================= */}
      {phase === 'setup' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Quick Settings Bar: Target Score, Timer, Dobbelsteen & Woordenboek */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 border-2 border-slate-700 rounded-2xl p-2.5 sm:p-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                Doelscore
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[20, 30, 40].map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      setTargetScore(val);
                      sounds.playTick(600);
                    }}
                    className={`flex-1 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      targetScore === val
                        ? 'bg-yellow-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                Timer Duur
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[30, 40, 50].map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      setTurnDuration(val);
                      sounds.playTick(600);
                    }}
                    className={`flex-1 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      turnDuration === val
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {val}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                Dobbelsteen Regel
              </label>
              <button
                onClick={() => {
                  setUseDice(!useDice);
                  sounds.playTick(600);
                }}
                className={`w-full py-1 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border transition-all cursor-pointer h-[32px] ${
                  useDice
                    ? 'bg-yellow-400 text-slate-950 border-yellow-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Dices className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{useDice ? 'Dobbel: Aan' : 'Dobbel: Uit'}</span>
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                Woordenlijst
              </label>
              <button
                onClick={() => {
                  refreshWordsPool();
                  setShowWordModal(true);
                  sounds.playTick(600);
                }}
                className="w-full py-1 px-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-2 border-yellow-500 flex items-center justify-center gap-1 text-xs font-black transition-all shadow-sm cursor-pointer active:scale-95 h-[32px]"
                title="Bekijk alle woorden en voeg eigen woorden toe"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 text-slate-950" />
                <span>Woordenboek</span>
                <span className="px-1.5 py-0.2 rounded-md bg-slate-950 text-yellow-300 text-[10px] font-black">
                  {allWordsCache.length}
                </span>
              </button>
            </div>
          </div>

          {/* Teams: ENTIRE Team Geel block is primary YELLOW, ENTIRE Team Blauw block is primary BLUE! */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* 1. TEAM GEEL: Full Primary Yellow Block */}
            <div className="bg-yellow-400 text-slate-950 rounded-3xl border-4 border-yellow-500 p-4 sm:p-5 shadow-xl flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-yellow-500/60">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🟡</span>
                    <h2 className="text-lg font-black tracking-tight text-slate-950">
                      Team Geel
                    </h2>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-yellow-500 text-slate-950 border border-yellow-600">
                    {teams[0].players.length} {teams[0].players.length === 1 ? 'speler' : 'spelers'}
                  </span>
                </div>

                {/* Player List with Pencil Edit */}
                <div className="space-y-1.5 mb-3">
                  {teams[0].players.map((p, pIdx) => {
                    const isEditing = editingPlayerId === p.id;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border-2 border-yellow-500 gap-1.5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {p.avatar ? (
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-yellow-100 shrink-0 border border-yellow-400">
                              <MiiFace avatar={p.avatar} size={24} />
                            </div>
                          ) : (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 bg-yellow-400 text-slate-950 border border-yellow-500">
                              {pIdx + 1}
                            </span>
                          )}

                          {isEditing ? (
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <input
                                type="text"
                                value={editingPlayerName}
                                onChange={e => setEditingPlayerName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSavePlayerEdit(0, p.id);
                                  if (e.key === 'Escape') setEditingPlayerId(null);
                                }}
                                className="px-2 py-0.5 text-xs font-black bg-yellow-50 text-slate-950 rounded-lg border-2 border-slate-900 outline-none w-full min-w-0"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePlayerEdit(0, p.id)}
                                className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shrink-0"
                                title="Opslaan"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="font-black text-slate-950 text-xs sm:text-sm truncate">
                                {p.name}
                              </span>
                              <button
                                onClick={() => handleStartEditPlayer(p)}
                                className="opacity-60 hover:opacity-100 p-0.5 text-slate-700 hover:text-black cursor-pointer shrink-0"
                                title="Naam aanpassen"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditing && teams[0].players.length > 1 && (
                          <button
                            onClick={() => handleRemovePlayer(0, p.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer shrink-0"
                            title="Verwijder speler"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Player Input with Spelers Dropdown */}
              <div className="pt-2 border-t-2 border-yellow-500/60">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newPlayerInputs[0]}
                    onChange={e => {
                      const val = e.target.value;
                      setNewPlayerInputs(prev => [val, prev[1]]);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddPlayer(0);
                    }}
                    placeholder="Nieuwe speler..."
                    className="flex-1 min-w-[120px] px-3 py-1.5 text-xs font-black bg-white text-slate-950 placeholder-slate-400 rounded-xl border-2 border-yellow-500 outline-none shadow-xs"
                  />

                  <button
                    onClick={() => handleAddPlayer(0)}
                    className="px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0 bg-slate-950 text-yellow-300 hover:bg-slate-900 active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Speler</span>
                  </button>

                  <PlayerPickerDropdown
                    onSelectPlayer={(name, avatar) => handleAddPlayer(0, name, avatar)}
                  />
                </div>
              </div>
            </div>

            {/* 2. TEAM BLAUW: Full Primary Blue Block */}
            <div className="bg-blue-600 text-white rounded-3xl border-4 border-blue-700 p-4 sm:p-5 shadow-xl flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-blue-500/60">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔵</span>
                    <h2 className="text-lg font-black tracking-tight text-white">
                      Team Blauw
                    </h2>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-700 text-white border border-blue-500">
                    {teams[1].players.length} {teams[1].players.length === 1 ? 'speler' : 'spelers'}
                  </span>
                </div>

                {/* Player List with Pencil Edit */}
                <div className="space-y-1.5 mb-3">
                  {teams[1].players.map((p, pIdx) => {
                    const isEditing = editingPlayerId === p.id;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border-2 border-blue-400 gap-1.5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {p.avatar ? (
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 shrink-0 border border-blue-300">
                              <MiiFace avatar={p.avatar} size={24} />
                            </div>
                          ) : (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 bg-blue-600 text-white border border-blue-700">
                              {pIdx + 1}
                            </span>
                          )}

                          {isEditing ? (
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <input
                                type="text"
                                value={editingPlayerName}
                                onChange={e => setEditingPlayerName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSavePlayerEdit(1, p.id);
                                  if (e.key === 'Escape') setEditingPlayerId(null);
                                }}
                                className="px-2 py-0.5 text-xs font-black bg-blue-50 text-slate-950 rounded-lg border-2 border-blue-600 outline-none w-full min-w-0"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePlayerEdit(1, p.id)}
                                className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shrink-0"
                                title="Opslaan"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="font-black text-slate-950 text-xs sm:text-sm truncate">
                                {p.name}
                              </span>
                              <button
                                onClick={() => handleStartEditPlayer(p)}
                                className="opacity-60 hover:opacity-100 p-0.5 text-slate-700 hover:text-black cursor-pointer shrink-0"
                                title="Naam aanpassen"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditing && teams[1].players.length > 1 && (
                          <button
                            onClick={() => handleRemovePlayer(1, p.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer shrink-0"
                            title="Verwijder speler"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Player Input with Spelers Dropdown */}
              <div className="pt-2 border-t-2 border-blue-500/60">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newPlayerInputs[1]}
                    onChange={e => {
                      const val = e.target.value;
                      setNewPlayerInputs(prev => [prev[0], val]);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddPlayer(1);
                    }}
                    placeholder="Nieuwe speler..."
                    className="flex-1 min-w-[120px] px-3 py-1.5 text-xs font-black bg-white text-slate-950 placeholder-slate-400 rounded-xl border-2 border-blue-300 outline-none shadow-xs"
                  />

                  <button
                    onClick={() => handleAddPlayer(1)}
                    className="px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0 bg-yellow-400 text-slate-950 hover:bg-yellow-300 active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Speler</span>
                  </button>

                  <PlayerPickerDropdown
                    onSelectPlayer={(name, avatar) => handleAddPlayer(1, name, avatar)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Word Pool Info + Start Game Button */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>
                Pool: <strong className="text-yellow-400">{allWordsCache.length} woorden</strong> (elke beurt 5 willekeurige woorden).
              </span>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform border-2 border-yellow-500"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>SPEL STARTEN ▶</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE: TURN PREP ("Wie is aan de beurt?")
          - Round pill tab at top REMOVED
          ========================================================================= */}
      {phase === 'turn-prep' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Scoreboard Bar: Primary Yellow vs Primary Blue */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-3 rounded-2xl border-4 flex items-center justify-between transition-all ${
                activeTeamIndex === 0
                  ? 'bg-yellow-400 border-yellow-500 text-slate-950 shadow-lg scale-[1.02]'
                  : 'bg-yellow-400/20 border-yellow-400/40 text-yellow-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🟡</span>
                <span className="font-black text-sm">Team Geel</span>
              </div>
              <span className="text-2xl font-black">{teams[0].score}</span>
            </div>

            <div
              className={`p-3 rounded-2xl border-4 flex items-center justify-between transition-all ${
                activeTeamIndex === 1
                  ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-[1.02]'
                  : 'bg-blue-600/20 border-blue-400/40 text-blue-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🔵</span>
                <span className="font-black text-sm">Team Blauw</span>
              </div>
              <span className="text-2xl font-black">{teams[1].score}</span>
            </div>
          </div>

          {/* Turn Card: Solid Yellow for Team Geel, Solid Blue for Team Blauw (NO top rounded tab) */}
          <div
            className={`rounded-3xl border-4 p-5 sm:p-7 text-center shadow-2xl relative ${
              activeTeamIndex === 0
                ? 'bg-yellow-400 border-yellow-500 text-slate-950'
                : 'bg-blue-600 border-blue-700 text-white'
            }`}
          >
            <div className="mb-4">
              <span
                className={`text-xs font-black uppercase tracking-widest block mb-1 ${
                  activeTeamIndex === 0 ? 'text-slate-800' : 'text-blue-200'
                }`}
              >
                Ronde {roundNumber} • Doel: {targetScore} punten
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                {currentTeam.name}
              </h2>
            </div>

            {/* Explainer Avatar & Name */}
            <div
              className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border-2 mb-5 ${
                activeTeamIndex === 0
                  ? 'bg-white border-yellow-600 text-slate-950 shadow-md'
                  : 'bg-blue-800 border-blue-400 text-white shadow-md'
              }`}
            >
              {currentTurnPlayer.avatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-300">
                  <MiiFace avatar={currentTurnPlayer.avatar} size={40} />
                </div>
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-base ${
                    activeTeamIndex === 0
                      ? 'bg-yellow-400 text-slate-950 border border-yellow-500'
                      : 'bg-white text-blue-900 border border-white'
                  }`}
                >
                  {currentTurnPlayer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider block ${
                    activeTeamIndex === 0 ? 'text-slate-600' : 'text-blue-200'
                  }`}
                >
                  Uitlegger
                </span>
                <span className="text-base sm:text-lg font-black">
                  {currentTurnPlayer.name}
                </span>
              </div>
            </div>

            {/* Optional Dice Roll Section */}
            {useDice && (
              <div
                className={`mb-5 p-3 rounded-2xl border-2 max-w-sm mx-auto ${
                  activeTeamIndex === 0
                    ? 'bg-white/80 border-yellow-600 text-slate-950'
                    : 'bg-blue-800/80 border-blue-400 text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-left">
                    <span className="text-xs font-black block">
                      Dobbelsteen
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        activeTeamIndex === 0 ? 'text-slate-700' : 'text-blue-200'
                      }`}
                    >
                      {diceRoll === null
                        ? 'Gooi om je handicap te bepalen (0, 1 of 2)'
                        : `Gegooid: -${diceRoll} ${diceRoll === 1 ? 'strafpunt' : 'strafpunten'}`}
                    </span>
                  </div>

                  <button
                    onClick={handleRollDice}
                    disabled={isRollingDice}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm ${
                      isRollingDice
                        ? 'bg-slate-400 text-slate-900'
                        : activeTeamIndex === 0
                        ? 'bg-slate-950 text-yellow-300 hover:bg-slate-900'
                        : 'bg-yellow-400 text-slate-950 hover:bg-yellow-300'
                    }`}
                  >
                    <Dices className={`w-3.5 h-3.5 ${isRollingDice ? 'animate-spin' : ''}`} />
                    <span>{diceRoll === null ? 'Gooien' : `Dobbel: ${diceRoll}`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Instruction */}
            <p
              className={`text-xs font-bold max-w-md mx-auto mb-6 ${
                activeTeamIndex === 0 ? 'text-slate-900' : 'text-blue-100'
              }`}
            >
              Houd het scherm verborgen voor je teamgenoten. Zodra je op start drukt, gaan de <strong>{turnDuration} seconden</strong> in!
            </p>

            {/* Big Start Turn Button */}
            <button
              onClick={handleStartActiveTurn}
              className={`w-full max-w-sm py-4 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-xl transition-all active:scale-95 border-2 ${
                activeTeamIndex === 0
                  ? 'bg-slate-950 hover:bg-slate-900 text-yellow-300 border-slate-950'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-yellow-500'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START DE 30 SECONDEN!</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE: TURN ACTIVE (Timer running, 5 words displayed)
          - Cards match team color: Yellow for Team Geel, Blue for Team Blauw!
          ========================================================================= */}
      {phase === 'turn-active' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Live Score of Both Teams */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-2 sm:p-2.5 rounded-2xl border-3 flex items-center justify-between transition-all ${
                activeTeamIndex === 0
                  ? 'bg-yellow-400 border-yellow-500 text-slate-950 shadow-md font-black'
                  : 'bg-yellow-400/20 border-yellow-400/40 text-yellow-200 font-bold opacity-75'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base">🟡</span>
                <span className="text-xs sm:text-sm font-black">Team Geel</span>
              </div>
              <span className="text-base sm:text-xl font-black">{teams[0].score}</span>
            </div>

            <div
              className={`p-2 sm:p-2.5 rounded-2xl border-3 flex items-center justify-between transition-all ${
                activeTeamIndex === 1
                  ? 'bg-blue-600 border-blue-700 text-white shadow-md font-black'
                  : 'bg-blue-600/20 border-blue-400/40 text-blue-200 font-bold opacity-75'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base">🔵</span>
                <span className="text-xs sm:text-sm font-black">Team Blauw</span>
              </div>
              <span className="text-base sm:text-xl font-black">{teams[1].score}</span>
            </div>
          </div>
          {/* Active Turn Header with Timer & Pause */}
          <div
            className={`flex items-center justify-between border-4 rounded-2xl p-3 shadow-lg ${
              activeTeamIndex === 0
                ? 'bg-yellow-400 border-yellow-500 text-slate-950'
                : 'bg-blue-600 border-blue-700 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeTeamIndex === 0 ? '🟡' : '🔵'}</span>
              <div>
                <span className="text-sm font-black block">
                  {currentTeam.name}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    activeTeamIndex === 0 ? 'text-slate-800' : 'text-blue-200'
                  }`}
                >
                  Uitlegger: {currentTurnPlayer.name}
                </span>
              </div>
            </div>

            {/* Timer Display */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPaused(!isPaused);
                  sounds.playTick(600);
                }}
                className={`p-2 rounded-xl cursor-pointer active:scale-95 shadow-sm ${
                  activeTeamIndex === 0
                    ? 'bg-slate-950 text-white hover:bg-slate-900'
                    : 'bg-white text-blue-900 hover:bg-blue-50'
                }`}
                title={isPaused ? 'Hervatten' : 'Pauzeren'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              <div
                className={`px-4 py-1.5 rounded-xl border-2 flex items-center gap-1.5 font-black text-xl shadow-sm ${
                  secondsLeft <= 5
                    ? 'bg-red-600 border-red-700 text-white animate-pulse'
                    : activeTeamIndex === 0
                    ? 'bg-slate-950 border-slate-900 text-yellow-300'
                    : 'bg-blue-950 border-blue-900 text-white'
                }`}
              >
                <Timer className="w-5 h-5" />
                <span>{secondsLeft}s</span>
              </div>
            </div>
          </div>

          {/* 5 Word Cards: Yellow theme for Geel, Blue theme for Blauw! */}
          <div
            className={`rounded-3xl border-4 p-4 sm:p-5 shadow-2xl ${
              activeTeamIndex === 0
                ? 'bg-yellow-400 border-yellow-500 text-slate-950'
                : 'bg-blue-600 border-blue-700 text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  activeTeamIndex === 0 ? 'text-slate-800' : 'text-blue-200'
                }`}
              >
                Tik op een woord zodra geraden:
              </span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                  activeTeamIndex === 0
                    ? 'bg-slate-950 text-yellow-300'
                    : 'bg-white text-blue-900'
                }`}
              >
                {guessedWords.filter(Boolean).length} / 5 geraden
              </span>
            </div>

            {/* The 5 words list: Styled in Yellow/Blue */}
            <div className="space-y-2">
              {turnWords.map((word, idx) => {
                const isGuessed = guessedWords[idx];

                // Card styling based on team color
                let cardStyle = '';
                if (isGuessed) {
                  cardStyle = 'bg-emerald-600 border-emerald-700 text-white shadow-md';
                } else if (activeTeamIndex === 0) {
                  // Team Geel: Yellow card
                  cardStyle =
                    'bg-white text-slate-950 border-2 border-yellow-600 hover:bg-yellow-50 shadow-sm';
                } else {
                  // Team Blauw: Blue card
                  cardStyle =
                    'bg-blue-700 text-white border-2 border-blue-400 hover:bg-blue-800 shadow-sm';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleWordGuessed(idx)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.98] ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isGuessed
                            ? 'bg-white text-emerald-800'
                            : activeTeamIndex === 0
                            ? 'bg-yellow-400 text-slate-950 border border-yellow-500'
                            : 'bg-white text-blue-900 border border-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-base sm:text-lg font-black tracking-tight truncate">
                        {word}
                      </span>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all shrink-0 ${
                        isGuessed
                          ? 'bg-white border-white text-emerald-700'
                          : activeTeamIndex === 0
                          ? 'border-yellow-600 text-transparent'
                          : 'border-blue-400 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Finish Button */}
            <div
              className={`mt-4 pt-3 border-t-2 flex items-center justify-between ${
                activeTeamIndex === 0 ? 'border-yellow-500/60' : 'border-blue-500/60'
              }`}
            >
              <p
                className={`text-[11px] font-bold ${
                  activeTeamIndex === 0 ? 'text-slate-800' : 'text-blue-200'
                }`}
              >
                Niet vertalen, niet rijmen, niet aanwijzen!
              </p>
              <button
                onClick={handleFinishTurnEarly}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-colors active:scale-95 shadow-sm ${
                  activeTeamIndex === 0
                    ? 'bg-slate-950 text-white hover:bg-slate-900'
                    : 'bg-white text-blue-900 hover:bg-blue-50'
                }`}
              >
                Klaar / Stop Beurt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE: TURN REVIEW (Verify score after buzzer)
          ========================================================================= */}
      {phase === 'turn-review' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Live Score of Both Teams */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-2 sm:p-2.5 rounded-2xl border-3 flex items-center justify-between transition-all ${
                activeTeamIndex === 0
                  ? 'bg-yellow-400 border-yellow-500 text-slate-950 shadow-md font-black'
                  : 'bg-yellow-400/20 border-yellow-400/40 text-yellow-200 font-bold opacity-75'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base">🟡</span>
                <span className="text-xs sm:text-sm font-black">Team Geel</span>
              </div>
              <span className="text-base sm:text-xl font-black">{teams[0].score}</span>
            </div>

            <div
              className={`p-2 sm:p-2.5 rounded-2xl border-3 flex items-center justify-between transition-all ${
                activeTeamIndex === 1
                  ? 'bg-blue-600 border-blue-700 text-white shadow-md font-black'
                  : 'bg-blue-600/20 border-blue-400/40 text-blue-200 font-bold opacity-75'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base">🔵</span>
                <span className="text-xs sm:text-sm font-black">Team Blauw</span>
              </div>
              <span className="text-base sm:text-xl font-black">{teams[1].score}</span>
            </div>
          </div>
          <div
            className={`rounded-3xl border-4 p-5 sm:p-6 shadow-2xl ${
              activeTeamIndex === 0
                ? 'bg-yellow-400 border-yellow-500 text-slate-950'
                : 'bg-blue-600 border-blue-700 text-white'
            }`}
          >
            <div className="text-center mb-5">
              <span className="px-3.5 py-1 rounded-full bg-red-600 text-white border-2 border-red-700 text-xs font-black uppercase tracking-wider inline-block mb-2 shadow-sm">
                Tijd is om!
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                Controleer de geraden woorden
              </h2>
              <p
                className={`text-xs font-bold mt-1 ${
                  activeTeamIndex === 0 ? 'text-slate-800' : 'text-blue-100'
                }`}
              >
                Tik op een woord om te corrigeren of het goed of fout was.
              </p>
            </div>

            {/* Words checklist */}
            <div className="space-y-2 mb-6">
              {turnWords.map((word, idx) => {
                const isGuessed = guessedWords[idx];

                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleWordGuessed(idx)}
                    className={`w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                      isGuessed
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                        : activeTeamIndex === 0
                        ? 'bg-yellow-300 border-yellow-500 text-slate-950'
                        : 'bg-blue-700 border-blue-500 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          isGuessed
                            ? 'bg-white text-emerald-800'
                            : activeTeamIndex === 0
                            ? 'bg-yellow-500 text-slate-950'
                            : 'bg-blue-900 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-base font-black">{word}</span>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-black ${
                        isGuessed
                          ? 'bg-white text-emerald-800'
                          : activeTeamIndex === 0
                          ? 'bg-yellow-500 text-slate-950'
                          : 'bg-blue-900 text-white'
                      }`}
                    >
                      {isGuessed ? 'Goed (+1)' : 'Niet geraden'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Score calculation summary */}
            <div
              className={`p-4 rounded-2xl border-2 mb-6 ${
                activeTeamIndex === 0
                  ? 'bg-white border-yellow-600 text-slate-950'
                  : 'bg-blue-800 border-blue-400 text-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span>Geraden woorden:</span>
                <span className="font-black text-sm">
                  +{guessedWords.filter(Boolean).length}
                </span>
              </div>
              {useDice && diceRoll !== null && (
                <div className="flex items-center justify-between text-xs font-black mb-1 text-red-600">
                  <span>Dobbelsteen handicap:</span>
                  <span>-{diceRoll}</span>
                </div>
              )}
              <div
                className={`pt-2 border-t-2 flex items-center justify-between text-sm ${
                  activeTeamIndex === 0 ? 'border-slate-200' : 'border-blue-700'
                }`}
              >
                <span className="font-black">Eindscore deze beurt:</span>
                <span className="font-black text-emerald-600 text-base">
                  +{Math.max(
                    0,
                    guessedWords.filter(Boolean).length -
                      (useDice && diceRoll !== null ? diceRoll : 0)
                  )}{' '}
                  punten
                </span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirmTurnScore}
              className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all active:scale-95 border-2 ${
                activeTeamIndex === 0
                  ? 'bg-slate-950 hover:bg-slate-900 text-yellow-300 border-slate-950'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-yellow-500'
              }`}
            >
              <span>SCORES BIJWERKEN &amp; VOLGENDE BEURT</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE: GAME OVER (Winner screen)
          ========================================================================= */}
      {phase === 'game-over' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border-4 border-yellow-400 p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-yellow-400 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-yellow-500">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <span className="px-3.5 py-1 rounded-full bg-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider inline-block mb-2">
              Kampioen!
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              {teams[activeTeamIndex].name} Heeft Gewonnen!
            </h2>

            <p className="text-xs sm:text-sm font-bold text-slate-300 mb-6">
              Zij bereikten als eerste de doelscore van {targetScore} punten!
            </p>

            {/* Final Scores comparison */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
              <div className="p-3 rounded-2xl bg-yellow-400 text-slate-950 border-2 border-yellow-500">
                <span className="text-xs font-black block mb-1">Team Geel</span>
                <span className="text-3xl font-black">{teams[0].score}</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-600 text-white border-2 border-blue-700">
                <span className="text-xs font-black block mb-1">Team Blauw</span>
                <span className="text-3xl font-black">{teams[1].score}</span>
              </div>
            </div>

            <button
              onClick={handleResetMatch}
              className="px-7 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 mx-auto cursor-pointer active:scale-95 transition-all border-2 border-yellow-500"
            >
              <RotateCcw className="w-4 h-4" />
              <span>OPNIEUW SPELEN</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: WORD POOL & CUSTOM WORD MANAGER ("Alle woorden bekijken")
          ========================================================================= */}
      {showWordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-base font-black text-white">
                    30 Seconds Woordenboek
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    {allWordsCache.length} woorden in het spel ({customWordsList.length} eigen woorden)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWordModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add single word input form */}
            <form onSubmit={handleAddSingleWord} className="my-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                Eigen Woord Toevoegen (los woord, geen hele kaart)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSingleWordInput}
                  onChange={e => setNewSingleWordInput(e.target.value)}
                  placeholder="Bijv. Tosti Ham-Kaas, Oma Corrie..."
                  className="flex-1 px-3 py-2 text-xs font-black bg-white text-slate-950 placeholder-slate-400 rounded-xl border border-slate-300 outline-none shadow-xs"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Woord</span>
                </button>
              </div>
            </form>

            {/* Search filter */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={wordSearchQuery}
                onChange={e => setWordSearchQuery(e.target.value)}
                placeholder="Zoek in alle woorden..."
                className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-slate-950 text-white placeholder-slate-500 rounded-xl border border-slate-800 outline-none focus:border-yellow-400"
              />
            </div>

            {/* Scrollable list of words */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1 min-h-[220px]">
              {filteredWords.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-semibold">
                  Geen woorden gevonden voor "{wordSearchQuery}"
                </div>
              ) : (
                filteredWords.map((word, i) => {
                  const isCustom = customSet.has(word.toLowerCase());

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        isCustom
                          ? 'bg-yellow-400/20 border border-yellow-400/50 text-yellow-200'
                          : 'bg-slate-950/70 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-extrabold truncate">{word}</span>
                        {isCustom && (
                          <span className="px-1.5 py-0.2 rounded-md bg-yellow-400 text-slate-950 text-[9px] font-black shrink-0">
                            Eigen
                          </span>
                        )}
                      </div>

                      {isCustom && (
                        <button
                          onClick={() => handleDeleteSingleWord(word)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0 ml-1"
                          title="Verwijder dit eigen woord"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t-2 border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{filteredWords.length} woorden zichtbaar</span>
              <button
                onClick={() => setShowWordModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RESET CONFIRMATION
          ========================================================================= */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border-2 border-red-500 rounded-3xl p-5 text-center max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-500/40">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">
              Spel Resetten?
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Weet je zeker dat je het huidige potje wilt stoppen en de scores wilt resetten?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleResetMatch}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black cursor-pointer shadow-md"
              >
                Resetten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
