import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { ScoreKeeperPlayer, MiiAvatar } from '../../types';
import { Plus, Minus, UserPlus, RotateCcw, Trash2, Edit2, Check, Trophy, X, Medal, AlertCircle } from 'lucide-react';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';
import { MiiFace } from '../MiiMaker/MiiFace';
import { loadMiiAvatars } from '../../utils/storage';

const PLAYER_COLORS = [
  '#0284c7', // Sky blue
  '#16a34a', // Emerald
  '#ea580c', // Orange
  '#9333ea', // Purple
  '#dc2626', // Red
  '#ca8a04', // Yellow
  '#0891b2', // Cyan
  '#db2777', // Pink
];

const SCOREBOARD_STORAGE_KEY = 'party_channels_scoreboard_data';

interface ScoreboardPersistedData {
  players: ScoreKeeperPlayer[];
  targetScore: number | null;
  targetScoreInput: string;
  isLowestWins: boolean;
}

export function ScoreKeeperApp() {
  // Load persisted players or default
  const [players, setPlayers] = useState<ScoreKeeperPlayer[]>(() => {
    try {
      const saved = localStorage.getItem(SCOREBOARD_STORAGE_KEY);
      if (saved) {
        const parsed: ScoreboardPersistedData = JSON.parse(saved);
        if (Array.isArray(parsed.players) && parsed.players.length > 0) {
          return parsed.players;
        }
      }
    } catch (e) {
      console.error('Failed to load saved scoreboard:', e);
    }
    return [
      { id: '1', name: 'Speler 1', score: 0, color: PLAYER_COLORS[0], history: [] },
      { id: '2', name: 'Speler 2', score: 0, color: PLAYER_COLORS[1], history: [] },
    ];
  });

  const [targetScore, setTargetScore] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(SCOREBOARD_STORAGE_KEY);
      if (saved) {
        const parsed: ScoreboardPersistedData = JSON.parse(saved);
        return parsed.targetScore ?? null;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [targetScoreInput, setTargetScoreInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SCOREBOARD_STORAGE_KEY);
      if (saved) {
        const parsed: ScoreboardPersistedData = JSON.parse(saved);
        return parsed.targetScoreInput || '50';
      }
    } catch (e) {
      console.error(e);
    }
    return '50';
  });

  const [isLowestWins, setIsLowestWins] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCOREBOARD_STORAGE_KEY);
      if (saved) {
        const parsed: ScoreboardPersistedData = JSON.parse(saved);
        return !!parsed.isLowestWins;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [showAddPlayer, setShowAddPlayer] = useState<boolean>(false);
  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  const [miiAvatars] = useState<MiiAvatar[]>(() => loadMiiAvatars());
  const getMiiForPlayer = (name: string): MiiAvatar | undefined => {
    return miiAvatars.find(m => m.name.toLowerCase() === name.trim().toLowerCase());
  };

  useEffect(() => {
    const onReset = () => {
      setShowResetConfirmModal(true);
      sounds.playTick(500);
    };
    window.addEventListener('party_game_reset', onReset);
    return () => window.removeEventListener('party_game_reset', onReset);
  }, []);
  const [winnerModalPlayer, setWinnerModalPlayer] = useState<ScoreKeeperPlayer | null>(null);

  // Player Name Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  // Persist state to localStorage on every change
  useEffect(() => {
    try {
      const data: ScoreboardPersistedData = {
        players,
        targetScore,
        targetScoreInput,
        isLowestWins,
      };
      localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist scoreboard:', e);
    }
  }, [players, targetScore, targetScoreInput, isLowestWins]);

  // Start editing player name
  const handleStartEdit = (player: ScoreKeeperPlayer) => {
    setEditingId(player.id);
    setEditingNameValue(player.name);
  };

  // Save edited player name
  const handleSaveEdit = (id: string) => {
    const trimmed = editingNameValue.trim();
    if (trimmed) {
      setPlayers(prev =>
        prev.map(p => (p.id === id ? { ...p, name: trimmed } : p))
      );
    }
    setEditingId(null);
    sounds.playTick(750);
  };

  // Update a player's score (-1 or +1)
  const handleScoreChange = (playerId: string, delta: number) => {
    sounds.playScoreClick(delta > 0);

    setPlayers(prev => {
      const nextPlayers = prev.map(p => {
        if (p.id === playerId) {
          const newScore = p.score + delta;
          return {
            ...p,
            score: newScore,
            history: [...p.history, delta],
          };
        }
        return p;
      });

      // Check if target score is reached
      if (targetScore !== null) {
        const player = nextPlayers.find(p => p.id === playerId);
        if (player) {
          const reached = isLowestWins
            ? player.score <= targetScore
            : player.score >= targetScore;
          if (reached) {
            setWinnerModalPlayer(player);
            sounds.playFanfare();
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }
      }

      return nextPlayers;
    });
  };

  // Add new player
  const handleAddPlayer = (customName?: string) => {
    const raw = customName !== undefined ? customName : newPlayerName;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const newPlayer: ScoreKeeperPlayer = {
      id: Date.now().toString(),
      name: trimmed,
      score: 0,
      color: PLAYER_COLORS[players.length % PLAYER_COLORS.length],
      history: [],
    };
    setPlayers(prev => [...prev, newPlayer]);
    if (customName === undefined) {
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
    sounds.playTick(800);
  };

  // Remove player
  const handleRemovePlayer = (id: string) => {
    if (players.length <= 1) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
    sounds.playTick(500);
  };

  // Reset all scores confirmed
  const confirmResetScores = () => {
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, history: [] })));
    setWinnerModalPlayer(null);
    setShowResetConfirmModal(false);
    sounds.playTick(600);
  };

  // Sorted players specifically for the Ranking Modal
  const rankedPlayers = [...players].sort((a, b) =>
    isLowestWins ? a.score - b.score : b.score - a.score
  );

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto px-3 sm:px-4 pb-12 select-none">
      {/* Title & Control Header */}
      <div className="w-full wii-card rounded-3xl p-3.5 sm:p-4 mb-3">
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xl sm:text-2xl">🏆</span>
            <h2 className="font-black text-slate-800 text-base sm:text-xl tracking-tight">
              Scorebord
            </h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
            {/* Ranking / Leaderboard button */}
            <button
              onClick={() => {
                setShowRankingModal(true);
                sounds.playTick(800);
              }}
              className="wii-btn-yellow px-2 sm:px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
              title="Bekijk huidige ranglijst"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Ranglijst</span>
            </button>

            {/* Add Player button */}
            <button
              onClick={() => setShowAddPlayer(prev => !prev)}
              className="wii-btn-blue px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Speler</span>
            </button>

            {/* Choose from Spelers Pleintje */}
            <PlayerPickerDropdown
              compact
              existingNames={players.map(p => p.name)}
              buttonLabel="Kies Speler"
              buttonClassName="px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
              onSelectPlayer={(name) => {
                handleAddPlayer(name);
              }}
            />

            {/* Reset scores button - opening in-app confirmation modal (100% reliable) */}
            <button
              onClick={() => {
                sounds.playTick(500);
                setShowResetConfirmModal(true);
              }}
              className="wii-btn-white w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold flex items-center justify-center shadow-xs active:scale-95 text-slate-600 cursor-pointer shrink-0"
              title="Reset alle scores"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Add Player Input Collapse */}
        {showAddPlayer && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 animate-in fade-in">
            <input
              type="text"
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
              placeholder="Naam van nieuwe speler..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 outline-none"
              autoFocus
            />
            <button
              onClick={() => handleAddPlayer()}
              className="px-3 py-1.5 rounded-xl wii-btn-green text-xs font-bold shrink-0 cursor-pointer"
            >
              Toevoegen
            </button>
          </div>
        )}

        {/* Target Score Settings */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Doelscore:</span>
            {targetScore !== null ? (
              <span className="font-black text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg">
                {targetScore} pt ({isLowestWins ? 'Laagste wint' : 'Hoogste wint'})
              </span>
            ) : (
              <span className="font-semibold text-slate-400">Geen doel ingesteld</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {targetScore === null ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={targetScoreInput}
                  onChange={e => setTargetScoreInput(e.target.value)}
                  className="w-14 px-1.5 py-0.5 rounded-lg text-xs font-bold text-center border border-slate-200"
                  placeholder="50"
                />
                <button
                  onClick={() => {
                    const parsed = parseInt(targetScoreInput, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      setTargetScore(parsed);
                      sounds.playTick(700);
                    }
                  }}
                  className="px-2 py-0.5 rounded-lg wii-btn-blue text-[11px] font-bold cursor-pointer"
                >
                  Instellen
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTargetScore(null);
                  sounds.playTick(500);
                }}
                className="text-slate-400 hover:text-rose-500 text-[11px] font-bold cursor-pointer"
              >
                Uitschakelen
              </button>
            )}

            <button
              onClick={() => {
                setIsLowestWins(prev => !prev);
                sounds.playTick(600);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
            >
              {isLowestWins ? 'Minste = winst' : 'Meeste = winst'}
            </button>
          </div>
        </div>
      </div>

      {/* Players List: Thin and Compact Rows */}
      <div className="w-full space-y-1.5">
        {players.map(player => {
          const isLeader = rankedPlayers[0]?.id === player.id && player.score !== 0;
          const isEditingThisPlayer = editingId === player.id;

          return (
            <div
              key={player.id}
              className="w-full wii-card rounded-2xl px-3 py-1.5 sm:py-2 flex items-center justify-between border-2 border-white shadow-xs transition-all"
            >
              {/* Left Column: Player Color Indicator & Name (Inline Editable) */}
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                {(() => {
                  const mii = getMiiForPlayer(player.name);
                  return mii ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                      <MiiFace avatar={mii} size={24} />
                    </div>
                  ) : (
                    <div
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white shadow-2xs shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                  );
                })()}

                {isEditingThisPlayer ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <input
                      type="text"
                      value={editingNameValue}
                      onChange={e => setEditingNameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(player.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="px-2 py-0.5 text-xs sm:text-sm font-bold bg-white rounded-lg border border-sky-300 outline-none w-full max-w-[130px] sm:max-w-[180px]"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(player.id)}
                      className="p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer shrink-0"
                      title="Opslaan"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 min-w-0 group">
                    <span className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">
                      {player.name}
                    </span>
                    {isLeader && (
                      <span className="text-xs shrink-0" title="Huidige leider">
                        👑
                      </span>
                    )}
                    <button
                      onClick={() => handleStartEdit(player)}
                      className="opacity-40 hover:opacity-100 p-0.5 text-slate-400 hover:text-sky-600 transition-opacity cursor-pointer shrink-0"
                      title="Naam aanpassen"
                    >
                      <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: -1 button, Score in Middle, +1 button, Delete */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Score Controls: Minus Left, Number in Center, Plus Right */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 sm:p-1 shadow-2xs">
                  {/* -1 Button (Left) */}
                  <button
                    onClick={() => handleScoreChange(player.id, -1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center font-black active:scale-90 transition-transform cursor-pointer"
                    title="-1 punt"
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </button>

                  {/* Score Number in Middle */}
                  <div className="w-12 sm:w-14 text-center">
                    <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                      {player.score}
                    </span>
                  </div>

                  {/* +1 Button (Right) */}
                  <button
                    onClick={() => handleScoreChange(player.id, 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black active:scale-90 transition-transform cursor-pointer"
                    title="+1 punt"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Remove Player button */}
                {players.length > 1 && (
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Verwijder speler"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Confirmation Modal (100% reliable, never blocked) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 sm:p-6 text-center border-4 border-rose-300 shadow-2xl max-w-sm w-full">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-1">
              Scores Resetten?
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-5">
              Weet je zeker dat je alle scores weer op 0 wilt zetten? Spelers en namen blijven behouden.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2.5 rounded-full wii-btn-white font-extrabold text-xs shadow-xs cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={confirmResetScores}
                className="flex-1 py-2.5 rounded-full wii-btn-red font-extrabold text-xs shadow-md cursor-pointer"
              >
                Reset naar 0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ranking / Leaderboard Modal */}
      {showRankingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 sm:p-6 max-w-sm w-full border-4 border-amber-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h3 className="font-black text-slate-800 text-base sm:text-lg">
                  Huidige Ranglijst
                </h3>
              </div>
              <button
                onClick={() => setShowRankingModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2 max-h-80 overflow-y-auto">
              {rankedPlayers.map((p, rank) => {
                const isFirst = rank === 0;
                const pointDiff = rank > 0 ? Math.abs(p.score - rankedPlayers[0].score) : 0;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      isFirst
                        ? 'bg-amber-50 border-amber-200 shadow-xs'
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">
                        {rank === 0 && '🥇'}
                        {rank === 1 && '🥈'}
                        {rank === 2 && '🥉'}
                        {rank > 2 && (
                          <span className="text-slate-400 font-bold">#{rank + 1}</span>
                        )}
                      </div>

                      <div
                        className="w-3 h-3 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: p.color }}
                      />

                      <span className="font-extrabold text-slate-800 text-sm">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rank > 0 && pointDiff > 0 && (
                        <span className="text-[11px] font-bold text-slate-400">
                          ({pointDiff} pt achter)
                        </span>
                      )}
                      <span className="font-black text-lg text-slate-900">
                        {p.score} <span className="text-[10px] text-slate-400 font-bold">pt</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowRankingModal(false)}
              className="w-full mt-2 py-2.5 rounded-full wii-btn-blue font-black text-xs shadow-md cursor-pointer"
            >
              Terug naar Tellen
            </button>
          </div>
        </div>
      )}

      {/* Winner Podium Celebration Modal */}
      {winnerModalPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-6 text-center border-4 border-amber-300 shadow-2xl max-w-sm w-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-white mx-auto flex items-center justify-center text-4xl shadow-lg mb-3">
              👑
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-700 block">
              Doelscore Behaald!
            </span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 mb-2">
              {winnerModalPlayer.name} Wint!
            </h3>
            <p className="text-xs font-semibold text-slate-600 mb-5">
              Score van {winnerModalPlayer.score} punten bereikt! Gefeliciteerd met de overwinning.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWinnerModalPlayer(null)}
                className="flex-1 py-2.5 rounded-full wii-btn-white font-extrabold text-xs shadow-xs cursor-pointer"
              >
                Sluiten
              </button>
              <button
                onClick={() => {
                  setWinnerModalPlayer(null);
                  setShowResetConfirmModal(true);
                }}
                className="flex-1 py-2.5 rounded-full wii-btn-green font-extrabold text-xs shadow-md cursor-pointer"
              >
                Nieuw Spel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
