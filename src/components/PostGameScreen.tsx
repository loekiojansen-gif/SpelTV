import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Medal,
  Crown,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Beer,
  Gamepad2,
  Sparkles,
  Calendar,
  LayoutList,
  FileText,
  Play,
  Pencil,
  Lock,
} from 'lucide-react';
import { PubItem, DrinkItem, ChallengeItem, Team, Round } from '../types';
import { sounds } from '../utils/audio';
import { copyToClipboard } from '../utils/clipboard';
import { generateCompactScorecard, generateDetailedScorecard } from '../utils/scorecard';

interface PostGameScreenProps {
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
  teams: Team[];
  rounds: Round[];
  isPermanentlyFinished?: boolean;
  onContinueGame: () => void;
  onFinalizeGame: () => void;
  onBackToHome: () => void;
  onEditHole?: (holeNumber: number) => void;
}

export function PostGameScreen({
  pubs,
  drinks,
  challenges,
  teams,
  rounds,
  isPermanentlyFinished = false,
  onContinueGame,
  onFinalizeGame,
  onBackToHome,
  onEditHole,
}: PostGameScreenProps) {
  const [copiedType, setCopiedType] = useState<'compact' | 'detailed' | null>(null);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [showConfirmDefinitief, setShowConfirmDefinitief] = useState(false);

  const triggerWinnerConfetti = () => {
    try {
      // Centrale explosie van feestelijke confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
      });

      // Vreugdevuren vanaf links en rechts
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.65 },
          colors: ['#ffd700', '#facc15', '#ffffff', '#ca8a04', '#38bdf8'],
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.65 },
          colors: ['#ffd700', '#facc15', '#ffffff', '#ca8a04', '#a855f7'],
        });
      }, 250);

      // Gouden & kleurrijke neerdwarrelende confetti
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.4 },
          gravity: 0.8,
          colors: ['#22c55e', '#38bdf8', '#e11d48', '#eab308', '#a855f7', '#fbbf24'],
        });
      }, 550);
    } catch {
      // fallback if canvas not available
    }
  };

  useEffect(() => {
    sounds.playFanfare();
    triggerWinnerConfetti();
  }, []);

  const pubMap = new Map(pubs.map(p => [p.id, p]));
  const drinkMap = new Map(drinks.map(d => [d.id, d]));
  const challengeMap = new Map(challenges.map(c => [c.id, c]));

  // Calculate final team standings
  const teamStandings = teams.map((team) => {
    let totalScore = 0;
    const holeScores: { hole: number; score: number; pubName: string }[] = [];

    rounds.forEach((round) => {
      const scoreVal = round.scores[team.id];
      if (scoreVal !== undefined) {
        totalScore += scoreVal;
        const pub = pubMap.get(round.pubId);
        holeScores.push({
          hole: round.roundNumber,
          score: scoreVal,
          pubName: pub?.name || `Hole ${round.roundNumber}`,
        });
      }
    });

    const holesCount = Math.max(1, rounds.length);
    const avgScore = Number((totalScore / holesCount).toFixed(1));

    return {
      team,
      totalScore,
      holeScores,
      avgScore,
    };
  });

  // Sort ascending (minste slokken/strafpunten wint)
  teamStandings.sort((a, b) => a.totalScore - b.totalScore);

  const champion = teamStandings[0];
  const runnerUp = teamStandings[1];
  const thirdPlace = teamStandings[2];

  // Copy compact scorecard to clipboard
  const handleCopyCompact = async () => {
    const text = generateCompactScorecard({
      teams,
      rounds,
      pubs,
      drinks,
      challenges,
    });
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedType('compact');
      sounds.playReveal();
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // Copy detailed scorecard to clipboard
  const handleCopyDetailed = async () => {
    const text = generateDetailedScorecard({
      teams,
      rounds,
      pubs,
      drinks,
      challenges,
    });
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedType('detailed');
      sounds.playReveal();
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-72 sm:pb-80 pt-2 space-y-6">
      {/* 3D Stepped Podium Display (Wii Sports Style 1st, 2nd, 3rd) */}
      {teamStandings.length > 0 && (
        <div className="wii-card rounded-3xl border-2 border-white p-4 sm:p-6 shadow-xl relative overflow-hidden bg-gradient-to-b from-white via-sky-50/50 to-sky-100/70">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />

          {/* Stepped 3D Podium */}
          <div className="flex items-end justify-center gap-2 sm:gap-3 pt-3">
            {/* 2nd Place Platform (Left) */}
            {runnerUp && (
              <div className="flex-1 flex flex-col items-center min-w-0">
                <div className="text-center mb-2 w-full px-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-2 border-white shadow-md flex items-center justify-center mx-auto mb-1">
                    <Medal className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="font-black text-xs sm:text-sm text-slate-900 break-words leading-tight px-0.5 text-center min-h-[2.25rem] flex items-center justify-center">
                    {runnerUp.team.playerNames.join(' & ')}
                  </div>
                </div>
                {/* Stepped Podium Block 2 */}
                <div className="w-full h-24 rounded-t-2xl bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 border-t-2 border-x-2 border-white flex flex-col items-center justify-center shadow-md relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-2 bg-white/40" />
                  <span className="text-3xl font-black text-white drop-shadow-sm">2</span>
                  <span className="text-[9px] font-black tracking-widest text-slate-700 uppercase">ZILVER</span>
                </div>
              </div>
            )}

            {/* 1st Place Platform (Center - Tallest) */}
            {champion && (
              <div className="flex-1 flex flex-col items-center min-w-0 z-10">
                <div
                  className="text-center mb-2 w-full px-1 cursor-pointer select-none active:scale-95 transition-transform"
                  onClick={() => {
                    triggerWinnerConfetti();
                    sounds.playFanfare();
                  }}
                  title="Klik voor nog meer confetti!"
                >
                  <div className="w-15 h-15 sm:w-16 sm:h-16 rounded-3xl wii-btn-yellow shadow-xl flex items-center justify-center mx-auto mb-1 border-2 border-amber-200 animate-bounce duration-1000">
                    <Crown className="w-8 h-8 text-amber-950" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
                    ★ WINNAAR ★
                  </span>
                  <div className="font-black text-sm sm:text-base text-slate-900 break-words leading-tight px-0.5 text-center min-h-[2.5rem] flex items-center justify-center">
                    {champion.team.playerNames.join(' & ')}
                  </div>
                </div>
                {/* Stepped Podium Block 1 */}
                <div
                  onClick={() => {
                    triggerWinnerConfetti();
                    sounds.playFanfare();
                  }}
                  className="w-full h-34 rounded-t-2xl bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#ca8a04] border-t-2 border-x-2 border-white flex flex-col items-center justify-center shadow-xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  title="Klik voor nog meer confetti!"
                >
                  <div className="absolute inset-x-0 top-0 h-2.5 bg-white/50" />
                  <span className="text-4xl font-black text-amber-950 drop-shadow-sm">1</span>
                  <span className="text-[10px] font-black tracking-widest text-amber-950 uppercase">KAMPIOEN</span>
                </div>
              </div>
            )}

            {/* 3rd Place Platform (Right - Echte Bronzen Medaille) */}
            {thirdPlace && (
              <div className="flex-1 flex flex-col items-center min-w-0">
                <div className="text-center mb-2 w-full px-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#d97736] via-[#b45309] to-[#78350f] border-2 border-[#ffedd5] shadow-md flex items-center justify-center mx-auto mb-1">
                    <Medal className="w-6 h-6 text-[#ffedd5] drop-shadow-xs" />
                  </div>
                  <div className="font-black text-xs sm:text-sm text-slate-900 break-words leading-tight px-0.5 text-center min-h-[2.25rem] flex items-center justify-center">
                    {thirdPlace.team.playerNames.join(' & ')}
                  </div>
                </div>
                {/* Stepped Podium Block 3 (Diep Brons) */}
                <div className="w-full h-18 rounded-t-2xl bg-gradient-to-b from-[#c26227] via-[#923f10] to-[#5e2307] border-t-2 border-x-2 border-[#ffedd5] flex flex-col items-center justify-center shadow-md relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-white/30" />
                  <span className="text-2xl font-black text-[#ffedd5] drop-shadow-sm">3</span>
                  <span className="text-[9px] font-black tracking-widest text-[#ffedd5] uppercase drop-shadow-xs">BRONS</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FINAL RANKED SCOREBOARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Ranglijst
          </h3>
          <span className="text-xs text-slate-600 font-bold">
            Minste score wint
          </span>
        </div>

        <div className="space-y-2">
          {teamStandings.map((item, rank) => {
            return (
              <div
                key={item.team.id}
                className="p-3.5 rounded-2xl wii-card border-2 border-white shadow-md transition-transform"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                        rank === 0
                          ? 'wii-btn-yellow'
                          : rank === 1
                          ? 'bg-slate-200 text-slate-700 border border-slate-300'
                          : rank === 2
                          ? 'bg-gradient-to-b from-[#c26227] to-[#78350f] text-[#ffedd5] border border-[#fed7aa]'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {rank + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="font-black text-sm text-slate-900 break-words leading-tight">
                        {item.team.playerNames.join(' & ')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-slate-900 tabular-nums">
                      {item.totalScore}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-black">
                      gem. {item.avgScore}/hole
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHRONOLOGICAL SUMMARY OF ALL ROUNDS PLAYED */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            Overzicht per Hole
          </h3>
          <span className="text-xs text-slate-600 font-medium">
            {rounds.length} {rounds.length === 1 ? 'hole' : 'holes'} gespeeld
          </span>
        </div>

        {rounds.length === 0 ? (
          <div className="text-center py-6 wii-card rounded-2xl border-2 border-dashed border-sky-200 text-xs text-slate-500 font-bold">
            Geen rondes geregistreerd tijdens deze tocht.
          </div>
        ) : (
          <div className="space-y-2.5">
            {rounds.map((round) => {
              const pub = pubMap.get(round.pubId);
              const drink = drinkMap.get(round.drinkId);
              const challenge = challengeMap.get(round.challengeId);
              const isExpanded = expandedRound === round.roundNumber;

              return (
                <div
                  key={round.roundNumber}
                  className="rounded-3xl wii-card border-2 border-white overflow-hidden transition-all shadow-md"
                >
                  <button
                    onClick={() => {
                      setExpandedRound(isExpanded ? null : round.roundNumber);
                      sounds.playTick();
                    }}
                    className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-sky-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl wii-btn-green text-[#14300a] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {round.roundNumber}
                      </div>

                      <div className="min-w-0">
                        <span className="font-black text-sm text-slate-900 truncate block">
                          {pub?.name || 'Café'}
                        </span>

                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1 font-medium">
                          <span className="flex items-center gap-1 text-amber-700">
                            <Beer className="w-3 h-3 text-amber-500" />
                            {drink?.name || 'Drankje'}
                          </span>
                          <span className="flex items-center gap-1 text-violet-700">
                            <Gamepad2 className="w-3.5 h-3.5 text-violet-600" />
                            {challenge?.title || 'Opdracht'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Round Details */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-sky-100 space-y-2 bg-sky-50/60">
                      <div className="text-[11px] font-black uppercase tracking-wider text-sky-900 mb-1">
                        Scores per Team op Hole {round.roundNumber}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {teams.map((team) => {
                          const scoreVal = round.scores[team.id];
                          if (scoreVal === undefined) return null;

                          return (
                            <div
                              key={team.id}
                              className="p-2.5 rounded-xl wii-box border border-sky-100 flex items-center justify-between shadow-2xs"
                            >
                              <span className="font-black text-xs text-slate-800">
                                {team.playerNames.join(' & ')}
                              </span>

                              <div className="text-right">
                                <span className="text-base font-black text-slate-900 tabular-nums">
                                  {scoreVal}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-medium">
                                  {scoreVal === 1 ? 'slok / pt' : 'slokken / pt'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {challenge?.description && (
                        <div className="p-2.5 rounded-xl wii-box text-[11px] text-violet-900 border border-violet-100 mt-2 flex items-start gap-1.5 shadow-2xs font-medium">
                          <strong className="text-violet-800 shrink-0 flex items-center gap-1 font-black">
                            <Gamepad2 className="w-3.5 h-3.5 text-violet-600" />
                            Minigame:
                          </strong>
                          <span>{challenge.description}</span>
                        </div>
                      )}

                      {/* Button to edit this hole (only if not permanently finished) */}
                      {!isPermanentlyFinished && onEditHole && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playTick();
                              onEditHole(round.roundNumber);
                            }}
                            className="wii-btn-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 text-sky-600" />
                            <span>Hole {round.roundNumber} Aanpassen</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Clear spacer to guarantee last hole is always fully above floating buttons */}
        <div className="h-16" aria-hidden="true" />
      </div>

      {/* Floating Bottom Action Buttons */}
      <div
        style={{
          paddingBottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
        }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#22c55e]/95 via-[#22c55e]/80 to-transparent z-30 backdrop-blur-xs"
      >
        <div className="max-w-xl mx-auto space-y-2">
          {/* Share Scorecard Buttons: Compact & Detailed */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyCompact}
              className={`h-12 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all ${
                copiedType === 'compact'
                  ? 'wii-btn-green'
                  : 'wii-btn-white'
              }`}
            >
              {copiedType === 'compact' ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Gekopieerd!</span>
                </>
              ) : (
                <>
                  <LayoutList className="w-4 h-4 text-sky-600" />
                  <span>Kopieer Overzicht</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyDetailed}
              className={`h-12 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all ${
                copiedType === 'detailed'
                  ? 'wii-btn-green'
                  : 'wii-btn-green'
              }`}
            >
              {copiedType === 'detailed' ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Gekopieerd!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Kopieer Uitgebreid</span>
                </>
              )}
            </button>
          </div>

          {/* Action Choice: Verder Spelen OF Definitief Eindigen */}
          {isPermanentlyFinished ? (
            <div className="space-y-1.5 pt-0.5">
              <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100 text-center flex items-center justify-center gap-1.5 text-xs text-sky-900 font-bold">
                <Lock className="w-3.5 h-3.5 text-sky-600" />
                <span>Definitief Geëindigd — Opgeslagen in geschiedenis</span>
              </div>
              <button
                onClick={() => {
                  sounds.playTick();
                  onBackToHome();
                }}
                className="wii-btn-green w-full py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-md"
              >
                Terug naar Startmenu
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-0.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    sounds.playTick();
                    onContinueGame();
                  }}
                  className="wii-btn-green py-3 rounded-2xl font-black active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Verder Spelen (Hole {rounds.length + 1})</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playTick();
                    setShowConfirmDefinitief(true);
                  }}
                  className="wii-btn-red py-3 rounded-2xl font-black active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Definitief Eindigen</span>
                </button>
              </div>

              <button
                onClick={() => {
                  sounds.playTick();
                  onBackToHome();
                }}
                className="wii-btn-white w-full py-2.5 rounded-2xl font-black text-xs active:scale-95 transition-transform text-center shadow-xs"
              >
                Terug naar Startmenu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Definitief Eindigen */}
      {showConfirmDefinitief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm wii-modal-card rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-3xl wii-btn-red flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Definitief Eindigen?</h3>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Weet je zeker dat je deze kroegentocht definitief wilt afsluiten? Hierna kun je <strong>niet meer terug</strong> om holes aan te passen of verder te spelen. De eindstand wordt definitief gearchiveerd.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowConfirmDefinitief(false);
                  onFinalizeGame();
                }}
                className="wii-btn-red w-full py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-md flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Ja, Definitief Beëindigen</span>
              </button>

              <button
                onClick={() => setShowConfirmDefinitief(false)}
                className="wii-btn-white w-full py-3 rounded-2xl font-black text-xs active:scale-95"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
