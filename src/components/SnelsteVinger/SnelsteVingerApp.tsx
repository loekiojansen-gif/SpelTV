import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, X, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { useGameReset, usePersistentState, useWakeLock, vibrate } from '../Shared/hooks';
import { ResetConfirmModal } from '../Shared/ResetConfirmModal';

type Phase = 'setup' | 'arena' | 'finished';
type RoundState = 'intro' | 'waiting' | 'fake' | 'go' | 'point' | 'false_start' | 'too_slow';

interface SnelsteVingerAppProps {
  isCurrentApp?: boolean;
}

interface Duelist {
  name: string;
  color: string;
  dark: string;
  key: string;
}

const DUELISTS: Duelist[] = [
  { name: 'Rood', color: '#ef4444', dark: '#991b1b', key: 'Q' },
  { name: 'Blauw', color: '#3b82f6', dark: '#1e3a8a', key: 'P' },
  { name: 'Geel', color: '#eab308', dark: '#854d0e', key: 'Z' },
  { name: 'Paars', color: '#a855f7', dark: '#581c87', key: 'M' },
];

const FAKE_COLORS = ['#f97316', '#ec4899', '#06b6d4'];
const TARGETS = [3, 5, 7];
const GO_COLOR = '#22c55e';

export function SnelsteVingerApp({ isCurrentApp = true }: SnelsteVingerAppProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [playerCount, setPlayerCount] = usePersistentState<number>('party_channels_snelste_vinger_players', 2);
  const [target, setTarget] = usePersistentState<number>('party_channels_snelste_vinger_target', 5);
  const [fakesEnabled, setFakesEnabled] = usePersistentState<boolean>('party_channels_snelste_vinger_fakes', true);
  const [bestMs, setBestMs] = usePersistentState<number>('party_channels_snelste_vinger_best_ms', 0);

  const [scores, setScores] = useState<number[]>([0, 0]);
  const [roundState, setRoundState] = useState<RoundState>('intro');
  const [fakeColor, setFakeColor] = useState(FAKE_COLORS[0]);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [offender, setOffender] = useState<number | null>(null);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [matchFastest, setMatchFastest] = useState<{ player: number; ms: number } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasFinePointer] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches
  );

  const roundStateRef = useRef<RoundState>('intro');
  const scoresRef = useRef<number[]>([0, 0]);
  const timersRef = useRef<number[]>([]);
  const goTimeRef = useRef(0);
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;

  const duelists = DUELISTS.slice(0, playerCount);

  useWakeLock(phase === 'arena' && isCurrentApp);
  useGameReset('SNELSTE_VINGER', () => setShowResetConfirm(true));

  const clearTimers = () => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];
  };

  const later = (ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const updateRoundState = (next: RoundState) => {
    roundStateRef.current = next;
    setRoundState(next);
  };

  const startRound = useCallback(() => {
    clearTimers();
    setRoundWinner(null);
    setOffender(null);
    setReactionMs(null);
    updateRoundState('intro');

    later(1200, () => {
      updateRoundState('waiting');
      const goDelay = 1500 + Math.random() * 3300;

      // Nepseinen: een andere kleur flitst op om spelers uit de tent te lokken
      if (fakesEnabled && goDelay > 2100 && Math.random() < 0.65) {
        const fakeCount = goDelay > 3600 && Math.random() < 0.35 ? 2 : 1;
        for (let i = 0; i < fakeCount; i++) {
          const windowStart = 500 + (i * (goDelay - 1300)) / fakeCount;
          const windowEnd = 500 + ((i + 1) * (goDelay - 1300)) / fakeCount - 500;
          const fakeAt = windowStart + Math.random() * Math.max(0, windowEnd - windowStart);
          later(fakeAt, () => {
            if (roundStateRef.current !== 'waiting') return;
            setFakeColor(FAKE_COLORS[Math.floor(Math.random() * FAKE_COLORS.length)]);
            updateRoundState('fake');
            sounds.playTick(420);
            later(430, () => {
              if (roundStateRef.current === 'fake') updateRoundState('waiting');
            });
          });
        }
      }

      later(goDelay, () => {
        if (roundStateRef.current !== 'waiting' && roundStateRef.current !== 'fake') return;
        goTimeRef.current = performance.now();
        updateRoundState('go');
        sounds.playCountdownPip(true);
        vibrate(40);

        // Niemand getikt? Dan doen we de ronde over
        later(3500, () => {
          if (roundStateRef.current !== 'go') return;
          updateRoundState('too_slow');
          sounds.playTick(300);
          later(1500, () => startRoundRef.current());
        });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fakesEnabled]);

  const startRoundRef = useRef(startRound);
  startRoundRef.current = startRound;

  const applyScores = (next: number[]) => {
    scoresRef.current = next;
    setScores(next);
    if (next.some(score => score >= target)) {
      later(1500, () => {
        setPhase('finished');
        sounds.playFanfare();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.4 } });
      });
    } else {
      later(1700, () => startRoundRef.current());
    }
  };

  const handleTap = (playerIndex: number) => {
    if (phaseRef.current !== 'arena') return;
    const state = roundStateRef.current;

    if (state === 'go') {
      const ms = Math.max(1, Math.round(performance.now() - goTimeRef.current));
      clearTimers();
      updateRoundState('point');
      setRoundWinner(playerIndex);
      setReactionMs(ms);
      setMatchFastest(prev => (!prev || ms < prev.ms ? { player: playerIndex, ms } : prev));
      if (bestMs === 0 || ms < bestMs) setBestMs(ms);
      sounds.playCorrectDing();
      vibrate(70);
      applyScores(scoresRef.current.map((score, idx) => (idx === playerIndex ? score + 1 : score)));
      return;
    }

    if (state === 'waiting' || state === 'fake') {
      // Te vroeg getikt: alle anderen krijgen een punt cadeau
      clearTimers();
      updateRoundState('false_start');
      setOffender(playerIndex);
      sounds.playBuzzer();
      vibrate([120, 60, 120]);
      applyScores(scoresRef.current.map((score, idx) => (idx === playerIndex ? score : score + 1)));
    }
  };

  const handleTapRef = useRef(handleTap);
  handleTapRef.current = handleTap;

  // Toetsenbord voor op een laptop of tv: Q, P, Z en M
  useEffect(() => {
    if (phase !== 'arena' || !isCurrentApp) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const index = DUELISTS.findIndex(d => d.key.toLowerCase() === e.key.toLowerCase());
      if (index >= 0 && index < playerCount) handleTapRef.current(index);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, isCurrentApp, playerCount]);

  // Ronde stilleggen als je het kanaal verlaat, en opnieuw beginnen als je terugkomt
  useEffect(() => {
    if (phase !== 'arena') return;
    if (!isCurrentApp) {
      clearTimers();
      return;
    }
    startRoundRef.current();
    return clearTimers;
  }, [phase, isCurrentApp]);

  const handleStartMatch = () => {
    const fresh = Array.from({ length: playerCount }, () => 0);
    scoresRef.current = fresh;
    setScores(fresh);
    setMatchFastest(null);
    sounds.playWiiSelect();
    setPhase('arena');
  };

  const handleQuit = () => {
    clearTimers();
    setPhase('setup');
    setShowResetConfirm(false);
    sounds.playTick(500);
  };

  const maxScore = Math.max(...scores);
  const winners = duelists.filter((_, idx) => scores[idx] === maxScore);

  const lampColor =
    roundState === 'go'
      ? GO_COLOR
      : roundState === 'fake'
        ? fakeColor
        : roundState === 'point' && roundWinner !== null
          ? DUELISTS[roundWinner].color
          : roundState === 'waiting'
            ? '#dc2626'
            : '#1e293b';

  const lampSymbol =
    roundState === 'go'
      ? '⚡'
      : roundState === 'point'
        ? '🏆'
        : roundState === 'false_start'
          ? '🙈'
          : roundState === 'too_slow'
            ? '🐌'
            : roundState === 'fake'
              ? '❓'
              : roundState === 'waiting'
                ? '✋'
                : '👆';

  const zoneStatus = (index: number): { title: string; sub?: string } => {
    switch (roundState) {
      case 'intro':
        return { title: 'Klaar?', sub: 'Vinger boven je vlak' };
      case 'waiting':
      case 'fake':
        return { title: 'Wacht...', sub: 'Tik pas bij GROEN' };
      case 'go':
        return { title: 'TIK!' };
      case 'point':
        return index === roundWinner
          ? { title: '+1 🏆', sub: reactionMs !== null ? `${reactionMs} ms` : undefined }
          : { title: 'Te laat', sub: 'Neem een slok 🍺' };
      case 'false_start':
        return index === offender
          ? { title: 'TE VROEG!', sub: 'De rest krijgt een punt' }
          : { title: '+1 cadeau', sub: `${offender !== null ? DUELISTS[offender].name : ''} was te vroeg` };
      case 'too_slow':
        return { title: 'Te traag!', sub: 'We doen het over' };
      default:
        return { title: '' };
    }
  };

  const zoneLayoutClass = (index: number): string => {
    if (playerCount === 3 && index === 2) return 'col-span-2';
    return '';
  };

  // Spelers aan de bovenkant zitten tegenover je: hun tekst staat op z'n kop
  const isTopZone = (index: number) => (playerCount === 2 ? index === 0 : index < 2);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-4 select-none">
      {/* =========================================================================
          FASE 1: INSTELLEN
          ========================================================================= */}
      {phase === 'setup' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Aantal spelers met een mini-plattegrond van het scherm */}
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2.5">
              👥 Aantal spelers
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map(count => {
                const isSelected = playerCount === count;
                return (
                  <button
                    key={count}
                    onClick={() => {
                      sounds.playTick(650);
                      setPlayerCount(count);
                    }}
                    aria-pressed={isSelected}
                    className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-3 border-yellow-400 shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-14 rounded-md overflow-hidden grid gap-px bg-white/60 ${count === 2 ? 'grid-rows-2' : 'grid-cols-2 grid-rows-2'}`}>
                      {DUELISTS.slice(0, count).map((d, idx) => (
                        <span
                          key={d.name}
                          className={count === 3 && idx === 2 ? 'col-span-2' : ''}
                          style={{ backgroundColor: d.color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-black">{count} spelers</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950 space-y-3.5">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
                🏁 Spelen tot
              </span>
              <div className="grid grid-cols-3 gap-2">
                {TARGETS.map(value => (
                  <button
                    key={value}
                    onClick={() => {
                      sounds.playTick(600);
                      setTarget(value);
                    }}
                    aria-pressed={target === value}
                    className={`py-2.5 rounded-2xl text-center transition-all cursor-pointer active:scale-95 ${
                      target === value
                        ? 'bg-slate-900 text-white border-3 border-yellow-400 shadow-md font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 font-bold'
                    }`}
                  >
                    <span className="text-base font-black">{value}</span>
                    <span className="text-xs font-bold ml-1">punten</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playTick(fakesEnabled ? 500 : 900);
                setFakesEnabled(!fakesEnabled);
              }}
              role="switch"
              aria-checked={fakesEnabled}
              className="w-full p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
            >
              <span className="min-w-0">
                <span className="text-sm font-black text-slate-800 block">🎭 Nepseinen</span>
                <span className="text-[11px] font-bold text-slate-500 block">
                  Soms flitst er een andere kleur op. Alleen GROEN telt!
                </span>
              </span>
              <span
                className={`w-11 h-6.5 rounded-full p-0.5 shrink-0 transition-colors ${
                  fakesEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    fakesEnabled ? 'translate-x-4.5' : ''
                  }`}
                />
              </span>
            </button>
          </div>

          <button
            onClick={handleStartMatch}
            className="w-full py-4.5 rounded-3xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-lg tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-yellow-600"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START HET DUEL</span>
          </button>
          <p className="text-center text-xs font-bold text-slate-300">
            Leg de telefoon plat op tafel tussen de spelers in.
          </p>
        </div>
      )}

      {/* =========================================================================
          FASE 2: DE ARENA (schermvullend, ieder een eigen vlak)
          ========================================================================= */}
      {(phase === 'arena' || phase === 'finished') && (
        <div
          className={`fixed inset-0 z-40 bg-slate-950 grid gap-1 p-1 touch-none ${
            playerCount === 2 ? 'grid-rows-2' : 'grid-cols-2 grid-rows-2'
          }`}
          onContextMenu={e => e.preventDefault()}
        >
          {duelists.map((duelist, index) => {
            const status = zoneStatus(index);
            const isWinnerZone = roundState === 'point' && roundWinner === index;
            const isOffenderZone = roundState === 'false_start' && offender === index;
            const isGo = roundState === 'go';
            return (
              <button
                key={duelist.name}
                data-testid={`duel-zone-${index}`}
                onPointerDown={e => {
                  e.preventDefault();
                  handleTap(index);
                }}
                className={`relative overflow-hidden rounded-2xl flex items-center justify-center cursor-pointer outline-none active:scale-[0.985] ${zoneLayoutClass(index)} ${
                  isOffenderZone ? 'animate-shake-x' : ''
                }`}
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${duelist.color} 0%, ${duelist.dark} 130%)`,
                  filter: isOffenderZone
                    ? 'grayscale(0.85) brightness(0.6)'
                    : isGo || isWinnerZone
                      ? 'brightness(1.2) saturate(1.15)'
                      : 'none',
                  boxShadow: isWinnerZone
                    ? 'inset 0 0 0 6px #ffffff'
                    : isGo
                      ? `inset 0 0 0 8px ${GO_COLOR}`
                      : undefined,
                }}
              >
                <div
                  className={`flex flex-col items-center text-center text-white px-3 pointer-events-none ${
                    isTopZone(index) ? 'rotate-180' : ''
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
                    {duelist.name}
                    {hasFinePointer && <span className="ml-1.5 opacity-70">· toets {duelist.key}</span>}
                  </span>
                  <span
                    key={`${roundState}-${status.title}`}
                    className={`font-black leading-none drop-shadow-[0_3px_0_rgba(0,0,0,0.25)] ${
                      isGo ? 'text-6xl sm:text-7xl' : 'text-3xl sm:text-5xl'
                    } my-1.5`}
                  >
                    {status.title}
                  </span>
                  {status.sub && <span className="text-xs sm:text-sm font-bold opacity-90">{status.sub}</span>}

                  {/* Scorebolletjes */}
                  <div className="flex items-center gap-1.5 mt-3">
                    {Array.from({ length: target }, (_, pip) => (
                      <span
                        key={pip}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white transition-colors ${
                          pip < scores[index] ? 'bg-white' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Het sein in het midden */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-white flex items-center justify-center pointer-events-none shadow-[0_0_0_6px_rgba(2,6,23,0.9),0_12px_30px_rgba(0,0,0,0.6)]"
            style={{
              width: 'clamp(84px, 26vmin, 190px)',
              height: 'clamp(84px, 26vmin, 190px)',
              backgroundColor: lampColor,
              boxShadow:
                roundState === 'go'
                  ? `0 0 0 6px rgba(2,6,23,0.9), 0 0 60px 18px ${GO_COLOR}`
                  : undefined,
            }}
            data-testid="duel-lamp"
            data-state={roundState}
          >
            {/* Geen animatie bij het sein zelf: bij een reactiespel telt elke milliseconde */}
            <span
              key={roundState}
              className={`leading-none ${roundState === 'go' || roundState === 'fake' ? '' : 'animate-pop-in'}`}
              style={{ fontSize: 'clamp(38px, 12vmin, 84px)' }}
            >
              {lampSymbol}
            </span>
          </div>

          {/* Stoppen */}
          {phase === 'arena' && (
            <button
              onClick={handleQuit}
              aria-label="Duel stoppen"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/85 border-2 border-white/40 text-white flex items-center justify-center cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Einduitslag */}
          {phase === 'finished' && (
            <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white border-4 border-yellow-400 rounded-3xl p-6 text-center shadow-2xl max-w-sm w-full text-slate-950 animate-in zoom-in-75">
                <span className="text-5xl block">🏆</span>
                <h2 className="text-3xl font-black tracking-tight leading-tight mt-1" data-testid="duel-winner">
                  {winners.map((winner, idx) => (
                    <span key={winner.name}>
                      {idx > 0 && <span className="text-slate-400"> & </span>}
                      <span style={{ color: winner.color }}>{winner.name.toUpperCase()}</span>
                    </span>
                  ))}{' '}
                  {winners.length > 1 ? 'WINNEN!' : 'WINT!'}
                </h2>

                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                  {duelists.map((duelist, idx) => (
                    <span
                      key={duelist.name}
                      className="px-3 py-1 rounded-full text-white text-sm font-black"
                      style={{ backgroundColor: duelist.color }}
                    >
                      {duelist.name} {scores[idx]}
                    </span>
                  ))}
                </div>

                {matchFastest && (
                  <p className="text-xs font-bold text-slate-600 mt-3">
                    ⚡ Snelste reactie: <strong>{DUELISTS[matchFastest.player].name}</strong> in{' '}
                    <strong>{matchFastest.ms} ms</strong>
                    {bestMs > 0 && matchFastest.ms <= bestMs && ' · nieuw record!'}
                  </p>
                )}
                <p className="text-xs font-bold text-slate-500 mt-1">De verliezers nemen een slok 🍺</p>

                <div className="flex gap-2 mt-5">
                  <button
                    onClick={handleQuit}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border-2 border-slate-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Instellingen</span>
                  </button>
                  <button
                    onClick={handleStartMatch}
                    className="flex-[1.5] py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border-3 border-yellow-600 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Revanche!</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ResetConfirmModal
        open={showResetConfirm}
        gameName="Snelste Vinger"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleQuit}
      />
    </div>
  );
}

