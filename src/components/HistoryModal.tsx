import { useState, useEffect } from 'react';
import { X, Trophy, Calendar, ChevronDown, ChevronUp, Share2, Trash2, Check, Beer, Gamepad2, MapPin, History, FileText, LayoutList } from 'lucide-react';
import { HistoricalGame } from '../types';
import { loadGameHistory, deleteGameFromHistory, clearAllHistory } from '../utils/storage';
import { sounds } from '../utils/audio';
import { copyToClipboard } from '../utils/clipboard';
import { generateCompactScorecard, generateDetailedScorecard } from '../utils/scorecard';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoricalGame[]>([]);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<{ id: string; type: 'compact' | 'detailed' } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHistory(loadGameHistory());
      setConfirmDeleteId(null);
      setConfirmClearAll(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = deleteGameFromHistory(id);
    setHistory(updated);
    setConfirmDeleteId(null);
    sounds.playTick(400);
  };

  const handleClearAll = () => {
    clearAllHistory();
    setHistory([]);
    setConfirmClearAll(false);
    sounds.playTick(400);
  };

  const handleCopyCompact = async (game: HistoricalGame, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateCompactScorecard(game);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedState({ id: game.id, type: 'compact' });
      sounds.playReveal();
      setTimeout(() => setCopiedState(null), 2500);
    }
  };

  const handleCopyDetailed = async (game: HistoricalGame, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateDetailedScorecard(game);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedState({ id: game.id, type: 'detailed' });
      sounds.playReveal();
      setTimeout(() => setCopiedState(null), 2500);
    }
  };

  const pubMap = (game: HistoricalGame) => new Map(game.pubs.map(p => [p.id, p]));
  const drinkMap = (game: HistoricalGame) => new Map(game.drinks.map(d => [d.id, d]));
  const challengeMap = (game: HistoricalGame) => new Map(game.challenges.map(c => [c.id, c]));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sky-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg wii-modal-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl wii-btn-blue flex items-center justify-center shadow-md">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Toernooi Geschiedenis
              </h3>
              <p className="text-[11px] text-slate-500">
                Eerdere gespeelde pubgolfs terugkijken
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              confirmClearAll ? (
                <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold active:scale-95"
                  >
                    Alles Wissen
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="px-1.5 py-1 text-slate-600 hover:text-slate-900 text-[10px] font-bold"
                  >
                    Nee
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  title="Geschiedenis wissen"
                  className="text-xs text-rose-600 hover:text-rose-700 py-1.5 px-2.5 rounded-xl bg-rose-50 border border-rose-200 font-bold active:scale-95"
                >
                  Alles Wissen
                </button>
              )
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-3 space-y-3 flex-1 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2 bg-sky-50 rounded-2xl border border-sky-100">
              <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 flex items-center justify-center mx-auto text-sky-600 shadow-xs">
                <Trophy className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-black text-slate-900">Nog geen toernooien gespeeld</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Zodra je een Pub Golf afrondt via "Pub Golf Afronden", wordt het volledige verslag hier automatisch bewaard.
              </p>
            </div>
          ) : (
            history.map((game) => {
              const isExpanded = expandedGameId === game.id;
              const dateStr = new Date(game.finishedAt).toLocaleDateString('nl-NL', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const pMap = pubMap(game);
              const dMap = drinkMap(game);
              const cMap = challengeMap(game);

              return (
                <div
                  key={game.id}
                  className="rounded-2xl bg-white border-2 border-sky-100 overflow-hidden transition-all shadow-xs"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => {
                      setExpandedGameId(isExpanded ? null : game.id);
                      sounds.playTick(700);
                    }}
                    className="p-3.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-sky-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl wii-btn-yellow text-base flex items-center justify-center shrink-0 shadow-xs">
                        🏆
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 truncate">
                            {game.winningTeamName}
                          </span>
                          <span className="text-xs text-lime-700 font-mono font-bold bg-lime-100 px-1.5 py-0.5 rounded-md">
                            {game.winningScore} pt
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-sky-500" />
                            {dateStr}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-slate-600">
                            {game.holesCount} {game.holesCount === 1 ? 'hole' : 'holes'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {confirmDeleteId === game.id ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={(e) => handleDelete(game.id, e)}
                            className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold active:scale-95"
                          >
                            Verwijder
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-1.5 py-1 text-slate-600 hover:text-slate-900 text-[10px] font-bold"
                          >
                            Nee
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(game.id);
                            sounds.playTick(500);
                          }}
                          title="Verwijder dit toernooi"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center active:scale-95 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="text-slate-400 ml-0.5">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Game Details */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-sky-100 space-y-3 bg-sky-50/50">
                      {/* Standings */}
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-sky-800 mb-1.5 flex items-center justify-between">
                          <span>Eindstand</span>
                          <span className="text-[10px] text-slate-500 font-normal">Minste score wint</span>
                        </div>
                        <div className="space-y-1">
                          {game.teams
                            .map((t) => {
                              let total = 0;
                              game.rounds.forEach((r) => {
                                total += r.scores[t.id] ?? 0;
                              });
                              const avg = game.rounds.length > 0 ? (total / game.rounds.length).toFixed(1) : '0.0';
                              return { team: t, total, avg };
                            })
                            .sort((a, b) => a.total - b.total)
                            .map((item, idx) => (
                              <div
                                key={item.team.id}
                                className="p-2 rounded-xl bg-white border border-sky-200 flex items-center justify-between text-xs shadow-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 font-black text-sky-600 text-center">
                                    {idx + 1}.
                                  </span>
                                  <span className="font-black text-slate-900">
                                    {item.team.playerNames.join(' & ')}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-black text-slate-900 text-sm">
                                    {item.total} slokken
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-medium">
                                    gem. {item.avg}/hole
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Chronological Holes with Scores per Team */}
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-sky-800 mb-1.5">
                          Gespeelde Holes & Slokken per Team ({game.rounds.length})
                        </div>
                        <div className="space-y-2">
                          {game.rounds.map((round) => {
                            const pub = pMap.get(round.pubId);
                            const drink = dMap.get(round.drinkId);
                            const challenge = cMap.get(round.challengeId);

                            return (
                              <div
                                key={round.roundNumber}
                                className="p-2.5 rounded-xl bg-white border border-sky-200 text-xs space-y-1.5 shadow-xs"
                              >
                                <div className="flex items-center justify-between font-black text-slate-900">
                                  <span>Hole {round.roundNumber}: {pub?.name || 'Café'}</span>
                                  <span className="text-[11px] text-amber-600 font-bold">{drink?.name || 'Drankje'}</span>
                                </div>

                                {challenge && (
                                  <div className="text-[11px] text-purple-700 flex items-center gap-1.5 font-medium">
                                    <Gamepad2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                    <span>Minigame: "{challenge.title}"</span>
                                  </div>
                                )}

                                {/* Scores per team op deze hole */}
                                <div className="pt-1.5 border-t border-sky-100">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Slokken op Hole {round.roundNumber}:
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {game.teams.map((t) => {
                                      const scoreVal = round.scores[t.id];
                                      if (scoreVal === undefined) return null;
                                      return (
                                        <div
                                          key={t.id}
                                          className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-[11px]"
                                        >
                                          <span className="text-slate-700 truncate font-bold">
                                            {t.playerNames.join(' & ')}
                                          </span>
                                          <span className="font-mono font-black text-slate-900 ml-2 shrink-0">
                                            {scoreVal} {scoreVal === 1 ? 'slok' : 'slokken'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Prominent scorecard copy buttons inside expanded view */}
                      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Kleine Scorekaart */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyCompact(game, e)}
                          className={`wii-btn-white py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm ${
                            copiedState?.id === game.id && copiedState?.type === 'compact'
                              ? 'wii-btn-green'
                              : ''
                          }`}
                        >
                          {copiedState?.id === game.id && copiedState?.type === 'compact' ? (
                            <>
                              <Check className="w-4 h-4 text-[#14300a] stroke-[3]" />
                              <span>Overzicht Gekopieerd! ✓</span>
                            </>
                          ) : (
                            <>
                              <LayoutList className="w-4 h-4 text-sky-600" />
                              <span>Kopieer Overzicht (Klein)</span>
                            </>
                          )}
                        </button>

                        {/* Uitgebreide Scorekaart */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyDetailed(game, e)}
                          className={`wii-btn-blue py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm ${
                            copiedState?.id === game.id && copiedState?.type === 'detailed'
                              ? 'wii-btn-green'
                              : ''
                          }`}
                        >
                          {copiedState?.id === game.id && copiedState?.type === 'detailed' ? (
                            <>
                              <Check className="w-4 h-4 text-[#14300a] stroke-[3]" />
                              <span>Alle Data Gekopieerd! ✓</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              <span>Kopieer Uitgebreid (Alle Data)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
