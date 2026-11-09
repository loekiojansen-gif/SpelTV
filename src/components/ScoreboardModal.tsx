import { useState } from 'react';
import { X, Trophy, Medal, Flame, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Team, Round } from '../types';

interface ScoreboardModalProps {
  teams: Team[];
  rounds: Round[];
  currentRoundNumber: number;
  onClose: () => void;
  onFinishGame?: () => void;
  onSelectHole?: (holeNumber: number) => void;
}

export function ScoreboardModal({
  teams,
  rounds,
  currentRoundNumber,
  onClose,
  onFinishGame,
  onSelectHole,
}: ScoreboardModalProps) {
  // Track expanded state for each team
  const [expandedTeamIds, setExpandedTeamIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (teamId: string) => {
    setExpandedTeamIds((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // Calculate total scores for each team across all completed rounds
  const teamStandings = teams.map((team) => {
    let totalScore = 0;
    let holesPlayed = 0;
    const holeScores: { hole: number; score: number }[] = [];

    rounds.forEach((round) => {
      const scoreVal = round.scores[team.id];
      if (scoreVal !== undefined) {
        totalScore += scoreVal;
        holesPlayed++;
        holeScores.push({ hole: round.roundNumber, score: scoreVal });
      }
    });

    return {
      team,
      totalScore,
      holesPlayed,
      holeScores,
    };
  });

  // Sort ascending by totalScore (minste slokken/strafpunten staat bovenaan)
  teamStandings.sort((a, b) => a.totalScore - b.totalScore);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sky-950/70 backdrop-blur-sm animate-in fade-in duration-150 p-0 sm:p-4">
      <div className="w-full max-w-lg wii-modal-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl wii-btn-yellow flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-amber-900 fill-amber-900" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Live Scorebord
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Sluit scorebord"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Leaderboard Rows */}
        <div className="overflow-y-auto py-3 space-y-2.5 flex-1 pr-1">
          {rounds.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-bold bg-sky-50 rounded-2xl border border-sky-100">
              Nog geen afgeronde holes. De stand verschijnt zodra Hole 1 is opgeslagen!
            </div>
          ) : (
            teamStandings.map((item, rank) => {
              const isLeader = rank === 0;
              const isExpanded = !!expandedTeamIds[item.team.id];
              const hasExtraInfo = item.holeScores.length > 0;

              return (
                <div
                  key={item.team.id}
                  className={`p-3.5 rounded-2xl border-2 transition-all ${
                    isLeader
                      ? 'bg-gradient-to-r from-amber-50 to-white border-amber-400 shadow-md'
                      : 'bg-white border-sky-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank badge */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                          rank === 0
                            ? 'wii-btn-yellow text-amber-900'
                            : rank === 1
                            ? 'bg-slate-200 text-slate-800'
                            : rank === 2
                            ? 'bg-amber-600 text-white'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {rank === 0 ? <Medal className="w-4 h-4" /> : rank + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-slate-900 truncate">
                            {item.team.playerNames.join(' & ')}
                          </span>
                          {isLeader && (
                            <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                              <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
                              Leider
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Score display & Optional Expand toggle button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                          {item.totalScore}
                        </div>
                      </div>

                      {hasExtraInfo && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.team.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title={isExpanded ? 'Verberg details' : 'Bekijk details per hole'}
                          aria-label={isExpanded ? 'Verberg details' : 'Bekijk details per hole'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Collapsible extra info: holes played & hole by hole breakdown */}
                  {hasExtraInfo && isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-sky-100 space-y-2 animate-in fade-in duration-150">
                      <div className="text-[11px] text-slate-500 font-medium">
                        {item.holesPlayed} {item.holesPlayed === 1 ? 'hole gespeeld' : 'holes gespeeld'}
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-slate-500 font-bold mr-1">
                          Slokken per hole:
                        </span>
                        {item.holeScores.map((h) => {
                          if (onSelectHole) {
                            return (
                              <button
                                key={h.hole}
                                type="button"
                                onClick={() => {
                                  onSelectHole(h.hole);
                                  onClose();
                                }}
                                className="px-2 py-0.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[11px] font-mono text-slate-700 border border-sky-200 transition-all flex items-center gap-1 active:scale-95 group cursor-pointer shadow-xs"
                                title={`Klik om Hole ${h.hole} aan te passen`}
                              >
                                <span>
                                  H{h.hole}: <strong className="text-sky-900">{h.score}</strong> {h.score === 1 ? 'slok' : 'sl'}
                                </span>
                                <Pencil className="w-2.5 h-2.5 text-sky-500 group-hover:text-sky-700 transition-colors" />
                              </button>
                            );
                          }
                          return (
                            <span
                              key={h.hole}
                              className="px-2 py-0.5 rounded-lg bg-sky-50 text-[11px] font-mono text-slate-700 border border-sky-200 shadow-xs"
                            >
                              H{h.hole}: <strong className="text-sky-900">{h.score}</strong> {h.score === 1 ? 'slok' : 'sl'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-sky-200 flex items-center gap-2">
          {onFinishGame && (
            <button
              onClick={() => {
                onClose();
                onFinishGame();
              }}
              className="wii-btn-red flex-1 py-3 rounded-2xl font-black text-xs shadow-sm"
            >
              Kroegentocht Afronden
            </button>
          )}
          <button
            onClick={onClose}
            className="wii-btn-green flex-1 py-3 rounded-2xl font-black text-xs shadow-md"
          >
            Terug naar Spel
          </button>
        </div>
      </div>
    </div>
  );
}
