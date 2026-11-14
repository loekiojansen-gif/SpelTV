import React, { useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import {
  shuffle,
  useGameReset,
  usePersistentState,
  useSharedPlayers,
  vibrate,
} from '../Shared/hooks';
import { PlayerBadge, useAvatarLookup } from '../Shared/PlayerRoster';
import { ResetConfirmModal } from '../Shared/ResetConfirmModal';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';
import { SPECTRUM_PAIRS, SpectrumPair } from './spectrumData';
import { SpectrumGauge, calculateSpectrumScore } from './SpectrumGauge';

type Phase =
  | 'setup'
  | 'hint-cover'
  | 'hint-give'
  | 'team-guess'
  | 'opponent-bonus'
  | 'reveal'
  | 'game-over';

type GameMode = 'teams' | 'coop';

interface TeamConfig {
  id: 'red' | 'blue';
  name: string;
  players: string[];
  score: number;
}

interface RoundResult {
  points: number;
  bonusPoints: number;
  bonusPrediction: 'left' | 'right' | null;
  bonusTeamIndex: 0 | 1 | null;
}

const TARGET_SCORE_OPTIONS = [8, 10, 12, 15] as const;
const ROUND_COUNT_OPTIONS = [6, 8, 10, 12, 0] as const; // 0 = Onbeperkt tot doelscore

export function SpectrumApp() {
  const [sharedPlayers] = useSharedPlayers();
  const getAvatar = useAvatarLookup(sharedPlayers.join('|'));

  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<GameMode>('teams');

  const [teams, setTeams] = useState<[TeamConfig, TeamConfig]>(() => {
    const half = Math.ceil(sharedPlayers.length / 2);
    return [
      {
        id: 'red',
        name: 'Team Rood',
        players: sharedPlayers.slice(0, half),
        score: 0,
      },
      {
        id: 'blue',
        name: 'Team Blauw',
        players: sharedPlayers.slice(half),
        score: 0,
      },
    ];
  });

  const [newInputs, setNewInputs] = useState<[string, string]>(['', '']);
  const [targetScore, setTargetScore] = useState<number>(10);
  const [maxRounds, setMaxRounds] = useState<number>(10);
  const [opponentBonusEnabled, setOpponentBonusEnabled] = useState<boolean>(true);

  // Actieve spelstatus
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [activeTeamIndex, setActiveTeamIndex] = useState<0 | 1>(0);
  const [teamHintIndices, setTeamHintIndices] = useState<[number, number]>([0, 0]);

  const [customPairs, setCustomPairs] = usePersistentState<SpectrumPair[]>(
    'party_channels_spectrum_custom_pairs_v1',
    []
  );
  const allPairs = useMemo(() => [...customPairs, ...SPECTRUM_PAIRS], [customPairs]);

  const deckRef = useRef<SpectrumPair[]>(shuffle([...customPairs, ...SPECTRUM_PAIRS]));
  const [currentPair, setCurrentPair] = useState<SpectrumPair>(
    () => customPairs[0] ?? SPECTRUM_PAIRS[0]
  );
  const [targetPos, setTargetPos] = useState<number>(50);
  const [needlePos, setNeedlePos] = useState<number>(50);
  const [hintText, setHintText] = useState<string>('');
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Stellingen bekijken & toevoegen modal
  const [showPairsModal, setShowPairsModal] = useState<boolean>(false);
  const [pairTab, setPairTab] = useState<'all' | 'custom' | 'builtin'>('all');
  const [pairSearch, setPairSearch] = useState<string>('');
  const [customLeftInput, setCustomLeftInput] = useState<string>('');
  const [customRightInput, setCustomRightInput] = useState<string>('');

  useGameReset('SPECTRUM', () => setShowResetConfirm(true));

  const drawNextPair = (): SpectrumPair => {
    const validIds = new Set(allPairs.map(p => p.id));
    deckRef.current = deckRef.current.filter(p => validIds.has(p.id));
    if (deckRef.current.length === 0) {
      deckRef.current = shuffle(allPairs);
    }
    return deckRef.current.pop() ?? allPairs[0] ?? SPECTRUM_PAIRS[0];
  };

  const randomTargetPosition = () => {
    // Houd marge aan de uitersten (12..88) zodat 2/3/4-ringen volledig zichtbaar blijven
    return Math.round((12 + Math.random() * 76) * 10) / 10;
  };

  const activeTeam = mode === 'coop' ? teams[0] : teams[activeTeamIndex];
  const otherTeamIndex: 0 | 1 = activeTeamIndex === 0 ? 1 : 0;
  const otherTeam = teams[otherTeamIndex];

  const currentHintgiver = useMemo(() => {
    const roster = activeTeam.players;
    if (roster.length === 0) return null;
    const idx = teamHintIndices[mode === 'coop' ? 0 : activeTeamIndex] % roster.length;
    return roster[idx];
  }, [activeTeam.players, activeTeamIndex, mode, teamHintIndices]);

  const addPlayerToTeam = (teamIdx: 0 | 1, rawName: string) => {
    const clean = rawName.trim().slice(0, 18);
    if (!clean) return;
    setTeams(prev => {
      const target = prev[teamIdx];
      if (target.players.some(p => p.toLowerCase() === clean.toLowerCase())) {
        sounds.playTick(300);
        return prev;
      }
      const next: [TeamConfig, TeamConfig] = [...prev] as [TeamConfig, TeamConfig];
      next[teamIdx] = { ...target, players: [...target.players, clean] };
      sounds.playTick(800);
      return next;
    });
  };

  const removePlayerFromTeam = (teamIdx: 0 | 1, name: string) => {
    sounds.playTick(500);
    setTeams(prev => {
      const next: [TeamConfig, TeamConfig] = [...prev] as [TeamConfig, TeamConfig];
      next[teamIdx] = {
        ...next[teamIdx],
        players: next[teamIdx].players.filter(p => p !== name),
      };
      return next;
    });
  };

  const prepareRound = (nextTeamIndex: 0 | 1, nextRoundNum: number) => {
    setActiveTeamIndex(nextTeamIndex);
    setRoundNumber(nextRoundNum);
    setCurrentPair(drawNextPair());
    setTargetPos(randomTargetPosition());
    setNeedlePos(50);
    setHintText('');
    setRoundResult(null);
    setPhase('hint-cover');
  };

  const handleStartGame = () => {
    deckRef.current = shuffle(allPairs);
    setTeams(prev => [
      { ...prev[0], score: 0 },
      { ...prev[1], score: 0 },
    ]);
    setTeamHintIndices([0, 0]);
    sounds.playWiiSelect();
    prepareRound(0, 1);
  };

  const cleanLeft = customLeftInput.trim();
  const cleanRight = customRightInput.trim();
  const isDuplicateCustomPair =
    cleanLeft.length > 0 &&
    cleanRight.length > 0 &&
    allPairs.some(
      p =>
        p.left.toLowerCase() === cleanLeft.toLowerCase() &&
        p.right.toLowerCase() === cleanRight.toLowerCase()
    );

  const handleAddCustomPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanLeft || !cleanRight || isDuplicateCustomPair) {
      sounds.playTick(320);
      return;
    }
    const created: SpectrumPair = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      left: cleanLeft.slice(0, 32),
      right: cleanRight.slice(0, 32),
    };
    setCustomPairs(prev => [created, ...prev]);
    deckRef.current = shuffle([created, ...deckRef.current]);
    setCustomLeftInput('');
    setCustomRightInput('');
    sounds.playTick(880);
  };

  const handleDeleteCustomPair = (id: string) => {
    sounds.playTick(500);
    setCustomPairs(prev => prev.filter(p => p.id !== id));
    deckRef.current = deckRef.current.filter(p => p.id !== id);
  };

  const filteredModalPairs = useMemo(() => {
    const customIdSet = new Set(customPairs.map(p => p.id));
    const base =
      pairTab === 'custom'
        ? customPairs
        : pairTab === 'builtin'
          ? SPECTRUM_PAIRS
          : allPairs;
    const q = pairSearch.trim().toLowerCase();
    const list = q
      ? base.filter(
          p => p.left.toLowerCase().includes(q) || p.right.toLowerCase().includes(q)
        )
      : base;
    return list.map(p => ({ ...p, isCustom: customIdSet.has(p.id) }));
  }, [allPairs, customPairs, pairSearch, pairTab]);

  const handleRerollPair = () => {
    if (phase !== 'hint-give') return;
    sounds.playWhoosh();
    setCurrentPair(drawNextPair());
    setTargetPos(randomTargetPosition());
  };

  const handleHideTargetForTeam = () => {
    sounds.playTick(820);
    vibrate(25);
    setNeedlePos(50);
    setPhase('team-guess');
  };

  const handleLockNeedle = () => {
    sounds.playTick(920);
    vibrate(35);
    if (mode === 'teams' && opponentBonusEnabled) {
      setPhase('opponent-bonus');
    } else {
      resolveReveal(null);
    }
  };

  const resolveReveal = (prediction: 'left' | 'right' | null) => {
    const pts = calculateSpectrumScore(targetPos, needlePos);
    let bonus = 0;

    // Alleen bonuspunt bij 2 teams als de tegenstander voorspelde en de wijzer niet al 4 punten (midden) haalde
    if (mode === 'teams' && prediction && pts < 4) {
      const isActuallyLeft = targetPos < needlePos - 0.5;
      const isActuallyRight = targetPos > needlePos + 0.5;
      if (
        (prediction === 'left' && isActuallyLeft) ||
        (prediction === 'right' && isActuallyRight)
      ) {
        bonus = 1;
      }
    }

    const activeIdx: 0 | 1 = mode === 'coop' ? 0 : activeTeamIndex;
    const bonusIdx: 0 | 1 | null = mode === 'teams' && prediction ? otherTeamIndex : null;

    setTeams(prev => {
      const next: [TeamConfig, TeamConfig] = [...prev] as [TeamConfig, TeamConfig];
      next[activeIdx] = { ...next[activeIdx], score: next[activeIdx].score + pts };
      if (bonusIdx !== null && bonus > 0) {
        next[bonusIdx] = { ...next[bonusIdx], score: next[bonusIdx].score + bonus };
      }
      return next;
    });

    setRoundResult({
      points: pts,
      bonusPoints: bonus,
      bonusPrediction: prediction,
      bonusTeamIndex: bonusIdx,
    });
    setPhase('reveal');

    if (pts === 4) {
      sounds.playFanfare();
      vibrate([50, 40, 80]);
    } else if (pts >= 2) {
      sounds.playCorrectDing();
      vibrate(40);
    } else {
      sounds.playBuzzer();
      vibrate([120, 60, 120]);
    }
  };

  const checkMatchFinished = (): boolean => {
    if (mode === 'coop') {
      if (teams[0].score >= targetScore) return true;
      if (maxRounds > 0 && roundNumber >= maxRounds) return true;
      return false;
    }
    if (teams[0].score >= targetScore || teams[1].score >= targetScore) return true;
    if (maxRounds > 0 && roundNumber >= maxRounds) return true;
    return false;
  };

  const handleNextRound = () => {
    if (checkMatchFinished()) {
      sounds.playCheerFanfare();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setPhase('game-over');
      return;
    }

    const usedTeamIdx: 0 | 1 = mode === 'coop' ? 0 : activeTeamIndex;
    setTeamHintIndices(prev => {
      const next: [number, number] = [...prev] as [number, number];
      next[usedTeamIdx] = next[usedTeamIdx] + 1;
      return next;
    });

    const nextTeamIdx: 0 | 1 = mode === 'coop' ? 0 : activeTeamIndex === 0 ? 1 : 0;
    prepareRound(nextTeamIdx, roundNumber + 1);
    sounds.playTick(750);
  };

  const handleResetConfirm = () => {
    setShowResetConfirm(false);
    setPhase('setup');
    sounds.playTick(500);
  };

  const nudgeNeedle = (delta: number) => {
    sounds.playSliderSnap();
    setNeedlePos(prev => Math.max(0, Math.min(100, Math.round((prev + delta) * 10) / 10)));
  };

  const winnerSummary = useMemo(() => {
    if (mode === 'coop') {
      return {
        title: teams[0].score >= targetScore ? 'Doelscore Behaald!' : 'Einde van de Rondes!',
        subtitle: `Jullie hebben samen ${teams[0].score} punten gescoord in ${roundNumber} rondes.`,
      };
    }
    if (teams[0].score > teams[1].score) {
      return {
        title: `${teams[0].name} Wint!`,
        subtitle: `Eindstand ${teams[0].score} – ${teams[1].score}`,
      };
    }
    if (teams[1].score > teams[0].score) {
      return {
        title: `${teams[1].name} Wint!`,
        subtitle: `Eindstand ${teams[0].score} – ${teams[1].score}`,
      };
    }
    return {
      title: 'Gelijkspel!',
      subtitle: `Beide teams eindigen op ${teams[0].score} punten.`,
    };
  }, [mode, roundNumber, targetScore, teams]);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-3 pb-10 select-none text-slate-100">
      {/* =====================================================================
          FASE 1: STARTSCHERM (TEAMS, DOELPUNTEN, RONDES)
          ===================================================================== */}
      {phase === 'setup' && (
        <div className="space-y-3.5 animate-in fade-in">
          {/* Spelmodus: 2 Teams of Gezamenlijk */}
          <div className="bg-slate-900/90 border-2 border-indigo-400/35 rounded-3xl p-4 shadow-xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-300 block">
              Spelmodus
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/70 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  sounds.playTick(750);
                  setMode('teams');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  mode === 'teams'
                    ? 'bg-gradient-to-r from-rose-500 to-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2 Teams tegen elkaar
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playTick(750);
                  setMode('coop');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  mode === 'coop'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Iedereen Gezamenlijk
              </button>
            </div>
          </div>

          {/* Teams instellen */}
          <div className={`grid gap-3 ${mode === 'teams' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
            {(mode === 'teams' ? ([0, 1] as const) : ([0] as const)).map(teamIdx => {
              const team = teams[teamIdx];
              const isRed = teamIdx === 0;
              return (
                <div
                  key={team.id}
                  className={`rounded-3xl p-4 border-2 shadow-xl bg-slate-900/90 ${
                    mode === 'coop'
                      ? 'border-cyan-400/50'
                      : isRed
                        ? 'border-rose-400/60'
                        : 'border-sky-400/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        mode === 'coop' ? 'bg-cyan-400' : isRed ? 'bg-rose-500' : 'bg-sky-500'
                      }`}
                    />
                    <input
                      type="text"
                      value={team.name}
                      onChange={e =>
                        setTeams(prev => {
                          const next: [TeamConfig, TeamConfig] = [...prev] as [TeamConfig, TeamConfig];
                          next[teamIdx] = { ...next[teamIdx], name: e.target.value };
                          return next;
                        })
                      }
                      maxLength={20}
                      placeholder={mode === 'coop' ? 'Teamnaam' : isRed ? 'Team Rood' : 'Team Blauw'}
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-xl text-sm font-black"
                    />
                  </div>

                  {/* Spelers in dit team */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      addPlayerToTeam(teamIdx, newInputs[teamIdx]);
                      setNewInputs(prev => {
                        const next: [string, string] = [...prev] as [string, string];
                        next[teamIdx] = '';
                        return next;
                      });
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={newInputs[teamIdx]}
                      onChange={e =>
                        setNewInputs(prev => {
                          const next: [string, string] = [...prev] as [string, string];
                          next[teamIdx] = e.target.value;
                          return next;
                        })
                      }
                      placeholder="Speler toevoegen..."
                      maxLength={18}
                      className="flex-1 min-w-0 px-2.5 py-2 rounded-xl text-xs font-bold"
                    />
                    <button
                      type="submit"
                      disabled={!newInputs[teamIdx].trim()}
                      className="px-2.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs cursor-pointer disabled:opacity-40"
                      aria-label="Speler toevoegen"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <PlayerPickerDropdown
                      compact
                      existingNames={team.players}
                      buttonLabel="Kies"
                      buttonClassName="px-2.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300"
                      onSelectPlayer={name => addPlayerToTeam(teamIdx, name)}
                    />
                  </form>

                  {team.players.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {team.players.map(name => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1.5 pl-1 pr-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100"
                        >
                          <PlayerBadge name={name} avatar={getAvatar(name)} size={22} />
                          <span className="max-w-24 truncate">{name}</span>
                          <button
                            type="button"
                            onClick={() => removePlayerFromTeam(teamIdx, name)}
                            className="w-4 h-4 rounded-full hover:bg-rose-500/30 text-slate-400 hover:text-rose-200 flex items-center justify-center cursor-pointer"
                            aria-label={`${name} verwijderen`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] font-semibold text-slate-400 mt-2">
                      Optioneel: voeg spelers toe voor automatische Hintgever-wissel.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Doelscore, Aantal rondes & Bonus optie */}
          <div className="bg-slate-900/90 border-2 border-indigo-400/35 rounded-3xl p-4 shadow-xl space-y-3.5">
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300 block mb-2">
                  Doelscore (winnen bij)
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {TARGET_SCORE_OPTIONS.map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => {
                        sounds.playTick(800);
                        setTargetScore(score);
                      }}
                      className={`py-2 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                        targetScore === score
                          ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-md'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300 block mb-2">
                  Aantal rondes
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {ROUND_COUNT_OPTIONS.map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        sounds.playTick(800);
                        setMaxRounds(cnt);
                      }}
                      className={`py-2 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                        maxRounds === cnt
                          ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-md'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {cnt === 0 ? '∞' : cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {mode === 'teams' && (
              <button
                type="button"
                onClick={() => {
                  sounds.playTick(750);
                  setOpponentBonusEnabled(prev => !prev);
                }}
                role="switch"
                aria-checked={opponentBonusEnabled}
                className="w-full p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-black text-white block">
                    Bonuspunt tegenstander (Links / Rechts)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Andere team verdient +1 als zij juist raden of het doel links of rechts van de wijzer ligt.
                  </span>
                </div>
                <span
                  className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${
                    opponentBonusEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      opponentBonusEnabled ? 'translate-x-5' : ''
                    }`}
                  />
                </span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTick(780);
              setShowPairsModal(true);
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-indigo-400/45 text-indigo-100 font-black text-sm flex items-center justify-between gap-2 shadow-lg cursor-pointer active:scale-98 transition-all"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-300" />
              <span>Stellingen bekijken &amp; toevoegen</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              {customPairs.length > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 border border-amber-300/50 text-amber-200 font-black">
                  {customPairs.length} eigen
                </span>
              )}
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/25 border border-indigo-300/40 text-indigo-200 font-black tabular-nums">
                {allPairs.length}×
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 text-slate-950 font-black text-base shadow-[0_6px_22px_rgba(56,189,248,0.4)] border-2 border-white/80 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Spel Starten</span>
          </button>
        </div>
      )}

      {/* =====================================================================
          ACTIEVE SPELBALK (SCOREBORD + RONDE)
          ===================================================================== */}
      {phase !== 'setup' && phase !== 'game-over' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="rounded-2xl bg-slate-900/90 border-2 border-slate-700/80 px-3 py-2 flex items-center justify-between gap-2 shadow-lg">
            {mode === 'teams' ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-black transition-all ${
                    activeTeamIndex === 0
                      ? 'bg-rose-500/25 border-rose-400 text-white shadow-sm'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="truncate max-w-20">{teams[0].name}</span>
                  <span className="text-amber-300 tabular-nums">{teams[0].score}</span>
                </div>
                <span className="text-slate-500 font-black text-xs">vs</span>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-black transition-all ${
                    activeTeamIndex === 1
                      ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="truncate max-w-20">{teams[1].name}</span>
                  <span className="text-amber-300 tabular-nums">{teams[1].score}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-black">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-white">{teams[0].name}:</span>
                <span className="text-amber-300 tabular-nums">
                  {teams[0].score} / {targetScore} pt
                </span>
              </div>
            )}

            <div className="text-xs font-black text-slate-300 shrink-0 tabular-nums">
              Ronde {roundNumber}
              {maxRounds > 0 ? ` / ${maxRounds}` : ` · Doel ${targetScore}`}
            </div>
          </div>

          {/* =================================================================
              STAP 1: TELEFOON OVERDRAGEN AAN HINTGEVER
              ================================================================= */}
          {phase === 'hint-cover' && (
            <div className="rounded-3xl bg-slate-900/95 border-4 border-indigo-400/60 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-center">
                {currentHintgiver ? (
                  <PlayerBadge
                    name={currentHintgiver}
                    avatar={getAvatar(currentHintgiver)}
                    size={64}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-3xl">
                    🎙️
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-300 block">
                  {activeTeam.name} aan zet
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Hintgever: {currentHintgiver || `Speler van ${activeTeam.name}`}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1.5 max-w-sm mx-auto">
                  Geef de telefoon aan de Hintgever. Zorg dat niemand anders op het scherm kijkt voordat de geheime doelzone verschijnt!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playWiiSelect();
                  vibrate(25);
                  setPhase('hint-give');
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base shadow-lg border-2 border-amber-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Eye className="w-5 h-5" />
                <span>Toon Geheime Doelzone</span>
              </button>
            </div>
          )}

          {/* =================================================================
              STAP 2: HINTGEVER ZIET GEHEIME DOELZONE & GEEFT HINT
              ================================================================= */}
          {phase === 'hint-give' && (
            <div className="rounded-3xl bg-slate-900/95 border-4 border-amber-400/70 p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {currentHintgiver && (
                    <PlayerBadge
                      name={currentHintgiver}
                      avatar={getAvatar(currentHintgiver)}
                      size={28}
                    />
                  )}
                  <span className="text-xs sm:text-sm font-black text-amber-300 truncate">
                    Alleen voor {currentHintgiver || 'Hintgever'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRerollPair}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Andere schaal</span>
                </button>
              </div>

              <SpectrumGauge
                targetPos={targetPos}
                needlePos={50}
                showTarget={true}
                interactive={false}
                showNeedle={false}
                leftLabel={currentPair.left}
                rightLabel={currentPair.right}
              />

              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Voer één korte hint in (of zeg de hint hardop):
                </label>
                <input
                  type="text"
                  value={hintText}
                  onChange={e => setHintText(e.target.value)}
                  placeholder="Bijv. zwembadwater..."
                  maxLength={40}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-black"
                />
              </div>

              <button
                type="button"
                onClick={handleHideTargetForTeam}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-black text-sm sm:text-base shadow-lg border-2 border-cyan-100 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <EyeOff className="w-5 h-5" />
                <span>Verberg doel &amp; geef aan {activeTeam.name}</span>
              </button>
            </div>
          )}

          {/* =================================================================
              STAP 3: TEAM DRAAIT DE WIJZER & VERGRENDELT
              ================================================================= */}
          {phase === 'team-guess' && (
            <div className="rounded-3xl bg-slate-900/95 border-4 border-cyan-400/70 p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300 block">
                  {activeTeam.name} mag raden
                </span>
                {hintText.trim() ? (
                  <div className="inline-block px-4 py-1.5 rounded-2xl bg-amber-400/15 border border-amber-300/60">
                    <span className="text-xs font-bold text-amber-200 mr-1.5">Hint:</span>
                    <span className="text-base sm:text-lg font-black text-white">
                      “{hintText.trim()}”
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-200">
                    Luister naar de hint van{' '}
                    <strong className="text-amber-300">{currentHintgiver || 'de Hintgever'}</strong>{' '}
                    en sleep de wijzer!
                  </p>
                )}
              </div>

              <SpectrumGauge
                targetPos={targetPos}
                needlePos={needlePos}
                showTarget={false}
                interactive={true}
                showNeedle={true}
                leftLabel={currentPair.left}
                rightLabel={currentPair.right}
                onChangeNeedle={setNeedlePos}
              />

              {/* Fijnafstelling + Vergrendel knop */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => nudgeNeedle(-2)}
                  className="px-3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-black cursor-pointer active:scale-95"
                  aria-label="Wijzer naar links bijstellen"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleLockNeedle}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-black text-sm sm:text-base shadow-lg border-2 border-rose-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  <span>Vergrendel wijzer</span>
                </button>
                <button
                  type="button"
                  onClick={() => nudgeNeedle(2)}
                  className="px-3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-black cursor-pointer active:scale-95"
                  aria-label="Wijzer naar rechts bijstellen"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              STAP 4: BONUSVOORSPELLING TEGENSTANDER (LINKS / RECHTS)
              ================================================================= */}
          {phase === 'opponent-bonus' && (
            <div className="rounded-3xl bg-slate-900/95 border-4 border-amber-400/60 p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in">
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-widest text-amber-300 block">
                  Bonuskans voor {otherTeam.name} (+1 punt)
                </span>
                <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Ligt de geheime zone LINKS of RECHTS van de wijzer?
                </h2>
              </div>

              <SpectrumGauge
                targetPos={targetPos}
                needlePos={needlePos}
                showTarget={false}
                interactive={false}
                showNeedle={true}
                leftLabel={currentPair.left}
                rightLabel={currentPair.right}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => resolveReveal('left')}
                  className="py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm shadow-lg border-2 border-sky-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Links ervan</span>
                </button>
                <button
                  type="button"
                  onClick={() => resolveReveal('right')}
                  className="py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-lg border-2 border-rose-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Rechts ervan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => resolveReveal(null)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Overslaan en meteen onthullen →
              </button>
            </div>
          )}

          {/* =================================================================
              STAP 5: ONTHULLING & RESULTAATKAART
              ================================================================= */}
          {phase === 'reveal' && roundResult && (
            <div className="rounded-3xl bg-slate-900/95 border-4 border-emerald-400/60 p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in">
              <div className="text-center space-y-1">
                {hintText.trim() && (
                  <p className="text-xs font-bold text-slate-300">
                    Hint van {currentHintgiver || activeTeam.name}:{' '}
                    <strong className="text-white">“{hintText.trim()}”</strong>
                  </p>
                )}
                <h2
                  className={`text-2xl font-black ${
                    roundResult.points === 4
                      ? 'text-amber-300'
                      : roundResult.points >= 2
                        ? 'text-emerald-300'
                        : 'text-rose-400'
                  }`}
                >
                  {roundResult.points === 4
                    ? '🎯 Midden in de roos! +4 punten'
                    : roundResult.points === 3
                      ? '🔥 Binnenring geraakt! +3 punten'
                      : roundResult.points === 2
                        ? '👍 Buitenring geraakt! +2 punten'
                        : '😅 Naast de doelzone! 0 punten'}
                </h2>
              </div>

              <SpectrumGauge
                targetPos={targetPos}
                needlePos={needlePos}
                showTarget={true}
                interactive={false}
                showNeedle={true}
                leftLabel={currentPair.left}
                rightLabel={currentPair.right}
                revealScore={roundResult.points}
              />

              {/* Bonuspunt melding voor tegenstander */}
              {roundResult.bonusPrediction && roundResult.bonusTeamIndex !== null && (
                <div
                  className={`rounded-2xl px-3 py-2 text-xs font-bold text-center border ${
                    roundResult.bonusPoints > 0
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  }`}
                >
                  {roundResult.points === 4
                    ? `${teams[roundResult.bonusTeamIndex].name} krijgt geen bonuspunt omdat de roos (4 pt) is geraakt.`
                    : roundResult.bonusPoints > 0
                      ? `✅ ${teams[roundResult.bonusTeamIndex].name} voorspelde goed (${roundResult.bonusPrediction === 'left' ? 'Links' : 'Rechts'}) en pakt +1 bonuspunt!`
                      : `❌ ${teams[roundResult.bonusTeamIndex].name} gokte verkeerd (${roundResult.bonusPrediction === 'left' ? 'Links' : 'Rechts'}) — geen bonuspunt.`}
                </div>
              )}

              <button
                type="button"
                onClick={handleNextRound}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-base shadow-lg border-2 border-emerald-100 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Check className="w-5 h-5" />
                <span>
                  {checkMatchFinished() ? 'Bekijk Eindstand 🏆' : 'Volgende Ronde →'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          FASE 6: EINDSCHERM
          ===================================================================== */}
      {phase === 'game-over' && (
        <div className="rounded-3xl bg-slate-900/95 border-4 border-amber-400 p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-300 text-amber-300 flex items-center justify-center mx-auto">
            <Trophy className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300">
              {winnerSummary.title}
            </h2>
            <p className="text-sm font-bold text-slate-300 mt-1">{winnerSummary.subtitle}</p>
          </div>

          {mode === 'teams' && (
            <div className="grid grid-cols-2 gap-3">
              {teams.map((t, idx) => (
                <div
                  key={t.id}
                  className={`rounded-2xl p-3.5 border-2 ${
                    idx === 0
                      ? 'bg-rose-500/15 border-rose-400/60'
                      : 'bg-sky-500/15 border-sky-400/60'
                  }`}
                >
                  <span className="text-xs font-black text-slate-300 block truncate">
                    {t.name}
                  </span>
                  <span className="text-3xl font-black text-white tabular-nums">{t.score}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleStartGame}
              className="py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 font-black text-sm shadow-lg border-2 border-white/80 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Nog een potje</span>
            </button>
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border-2 border-slate-600 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Instellingen</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          VENSTER: STELLINGEN BEKIJKEN & TOEVOEGEN
          ===================================================================== */}
      {showPairsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-400/70 rounded-3xl p-4 sm:p-5 w-full max-w-lg shadow-2xl max-h-[88dvh] flex flex-col text-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-300" />
                  <span>Stellingen ({allPairs.length})</span>
                </h3>
                <p className="text-[11px] font-semibold text-slate-400">
                  Bekijk alle uitersten of voeg je eigen schaal toe
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPairsModal(false)}
                aria-label="Sluiten"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Eigen stelling toevoegen */}
            <form
              onSubmit={handleAddCustomPair}
              className="my-3 p-3 rounded-2xl bg-slate-950/70 border border-indigo-400/35 space-y-2"
            >
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 block">
                Eigen stelling toevoegen
              </span>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
                <input
                  type="text"
                  value={customLeftInput}
                  onChange={e => setCustomLeftInput(e.target.value)}
                  placeholder="Linker uiterste..."
                  maxLength={32}
                  className="w-full min-w-0 px-2.5 py-2 rounded-xl text-xs font-bold"
                />
                <span className="text-xs font-black text-slate-400 px-0.5">↔</span>
                <input
                  type="text"
                  value={customRightInput}
                  onChange={e => setCustomRightInput(e.target.value)}
                  placeholder="Rechter uiterste..."
                  maxLength={32}
                  className="w-full min-w-0 px-2.5 py-2 rounded-xl text-xs font-bold"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-amber-300">
                  {isDuplicateCustomPair ? 'Deze stelling bestaat al.' : ''}
                </span>
                <button
                  type="submit"
                  disabled={!cleanLeft || !cleanRight || isDuplicateCustomPair}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Toevoegen</span>
                </button>
              </div>
            </form>

            {/* Filter & zoekbalk */}
            <div className="space-y-2 mb-2.5">
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setPairTab('all')}
                  className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                    pairTab === 'all'
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Alle ({allPairs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPairTab('custom')}
                  className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                    pairTab === 'custom'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Eigen ({customPairs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPairTab('builtin')}
                  className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                    pairTab === 'builtin'
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standaard ({SPECTRUM_PAIRS.length})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={pairSearch}
                  onChange={e => setPairSearch(e.target.value)}
                  placeholder="Zoek een stelling..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {/* Lijst van stellingen */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {filteredModalPairs.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 text-center py-6">
                  {pairTab === 'custom' && customPairs.length === 0
                    ? 'Nog geen eigen stellingen toegevoegd. Maak er hierboven een aan!'
                    : 'Geen stellingen gevonden.'}
                </p>
              ) : (
                filteredModalPairs.map(pair => (
                  <div
                    key={pair.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs ${
                      pair.isCustom
                        ? 'bg-amber-400/10 border-amber-300/40'
                        : 'bg-slate-800/70 border-slate-700/70'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="font-bold text-sky-200 truncate">{pair.left}</span>
                      <span className="text-slate-500 font-black shrink-0">↔</span>
                      <span className="font-bold text-rose-200 truncate">{pair.right}</span>
                    </div>
                    {pair.isCustom && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 text-[10px] font-black">
                          Eigen
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomPair(pair.id)}
                          aria-label={`Verwijder ${pair.left} - ${pair.right}`}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPairsModal(false)}
              className="mt-3 w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm cursor-pointer active:scale-98"
            >
              Klaar
            </button>
          </div>
        </div>
      )}

      <ResetConfirmModal
        open={showResetConfirm}
        gameName="Spectrum"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
}
