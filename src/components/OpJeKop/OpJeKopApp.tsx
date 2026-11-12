import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, Play, RotateCcw, Smartphone, Trophy, X } from 'lucide-react';
import { sounds } from '../../utils/audio';
import {
  shuffle,
  useGameReset,
  usePersistentState,
  useSharedPlayers,
  useWakeLock,
  vibrate,
} from '../Shared/hooks';
import { PlayerBadge, PlayerRoster, useAvatarLookup } from '../Shared/PlayerRoster';
import { ResetConfirmModal } from '../Shared/ResetConfirmModal';
import { OP_JE_KOP_DECKS, getDeckSize, getDeckWords } from './opJeKopData';

type Phase = 'setup' | 'ready' | 'countdown' | 'playing' | 'results';
type Pose = 'down' | 'up' | 'neutral';

interface WordResult {
  word: string;
  correct: boolean;
}

interface OpJeKopAppProps {
  isCurrentApp?: boolean;
}

const DURATIONS = [45, 60, 90];
/** Vanaf deze kanteling (m/s² op de z-as) telt het als "naar beneden" of "omhoog" */
const TILT_TRIGGER = 6.6;
/** Onder deze waarde staat de telefoon weer rechtop tegen het voorhoofd */
const TILT_NEUTRAL = 3.6;

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** iOS vraagt expliciet toestemming voor de bewegingssensor; dat moet vanuit een tik gebeuren. */
async function requestMotionPermission(): Promise<void> {
  try {
    const motionEvent = (window as unknown as {
      DeviceMotionEvent?: { requestPermission?: () => Promise<string> };
    }).DeviceMotionEvent;
    if (motionEvent && typeof motionEvent.requestPermission === 'function') {
      await motionEvent.requestPermission();
    }
  } catch {
    // Geweigerd of niet ondersteund: tikken op het scherm werkt altijd
  }
}

export function OpJeKopApp({ isCurrentApp = true }: OpJeKopAppProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [deckId, setDeckId] = usePersistentState<string>('party_channels_op_je_kop_deck', 'mix');
  const [duration, setDuration] = usePersistentState<number>('party_channels_op_je_kop_duration', 60);
  const [players, setPlayers] = useSharedPlayers();
  const getAvatar = useAvatarLookup(players.join('|'));

  const [turnIndex, setTurnIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [bestScore, setBestScore] = usePersistentState<number>('party_channels_op_je_kop_best', 0);

  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentWord, setCurrentWord] = useState('');
  const [results, setResults] = useState<WordResult[]>([]);
  const [flash, setFlash] = useState<'correct' | 'pass' | null>(null);
  const [tiltAvailable, setTiltAvailable] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));

  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  const currentWordRef = useRef(currentWord);
  currentWordRef.current = currentWord;
  const deckRef = useRef<string[]>([]);
  const poseRef = useRef<Pose>('neutral');
  const armedRef = useRef(false);
  const lockRef = useRef(false);
  const pendingRef = useRef<{ at: number; needNeutral: boolean } | null>(null);
  const advanceTimersRef = useRef<number[]>([]);
  const smoothZRef = useRef(0);

  const currentPlayer = players.length > 0 ? players[turnIndex % players.length] : null;
  const nextPlayer = players.length > 1 ? players[(turnIndex + 1) % players.length] : null;
  const stageActive = phase === 'ready' || phase === 'countdown' || phase === 'playing';

  useWakeLock(stageActive && isCurrentApp);
  useGameReset('OP_JE_KOP', () => setShowResetConfirm(true));

  useEffect(() => {
    const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const clearAdvanceTimers = () => {
    advanceTimersRef.current.forEach(id => window.clearTimeout(id));
    advanceTimersRef.current = [];
  };

  useEffect(() => clearAdvanceTimers, []);

  const drawNextWord = useCallback(() => {
    if (deckRef.current.length === 0) {
      deckRef.current = shuffle(getDeckWords(deckId));
    }
    const word = deckRef.current.pop() ?? '';
    setCurrentWord(word);
  }, [deckId]);

  // Ga door naar het volgende woord zodra de flits voorbij is (en de telefoon weer rechtop staat)
  const tryAdvance = useCallback(
    (force = false) => {
      const pending = pendingRef.current;
      if (!pending || phaseRef.current !== 'playing') return;
      const elapsed = Date.now() - pending.at;
      if (!force) {
        if (elapsed < 600) return;
        if (pending.needNeutral && poseRef.current !== 'neutral') return;
      }
      pendingRef.current = null;
      lockRef.current = false;
      clearAdvanceTimers();
      setFlash(null);
      drawNextWord();
    },
    [drawNextWord]
  );

  const registerAnswer = useCallback(
    (correct: boolean, source: 'tilt' | 'tap') => {
      if (phaseRef.current !== 'playing' || lockRef.current) return;
      lockRef.current = true;
      setResults(prev => [...prev, { word: currentWordRef.current, correct }]);
      setFlash(correct ? 'correct' : 'pass');
      if (correct) {
        sounds.playCorrectDing();
        vibrate(60);
      } else {
        sounds.playTick(320);
        vibrate([30, 40, 30]);
      }
      pendingRef.current = { at: Date.now(), needNeutral: source === 'tilt' };
      clearAdvanceTimers();
      advanceTimersRef.current.push(window.setTimeout(() => tryAdvance(), 650));
      // Vangnet: ook als de sensor hapert gaat het spel na 2,5 seconde verder
      advanceTimersRef.current.push(window.setTimeout(() => tryAdvance(true), 2500));
    },
    [tryAdvance]
  );

  // Bewegingssensor: telefoon naar beneden = goed, omhoog = pas
  useEffect(() => {
    if (!stageActive || !isCurrentApp) return;
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;

    // iOS geeft de z-as omgekeerd door ten opzichte van Android
    const sign = isIOSDevice() ? -1 : 1;
    smoothZRef.current = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const rawZ = e.accelerationIncludingGravity?.z;
      if (rawZ === null || rawZ === undefined) return;
      setTiltAvailable(true);

      // Licht filteren zodat een schokje niet meteen als kantelen telt
      smoothZRef.current = smoothZRef.current * 0.65 + rawZ * sign * 0.35;
      const zUp = smoothZRef.current;

      let pose: Pose | null = null;
      if (zUp < -TILT_TRIGGER) pose = 'down';
      else if (zUp > TILT_TRIGGER) pose = 'up';
      else if (Math.abs(zUp) < TILT_NEUTRAL) pose = 'neutral';
      if (!pose) return;

      const changed = pose !== poseRef.current;
      poseRef.current = pose;

      if (pose === 'neutral') {
        // Rechtop tegen het voorhoofd: klaar voor het volgende woord
        armedRef.current = true;
        if (pendingRef.current) tryAdvance();
        return;
      }
      if (changed && armedRef.current && phaseRef.current === 'playing' && !lockRef.current) {
        armedRef.current = false;
        registerAnswer(pose === 'down', 'tilt');
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [stageActive, isCurrentApp, registerAnswer, tryAdvance]);

  // Toetsenbord (handig op een laptop of tv): pijl omlaag = goed, pijl omhoog = pas
  useEffect(() => {
    if (phase !== 'playing' || !isCurrentApp) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        registerAnswer(true, 'tap');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        registerAnswer(false, 'tap');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, isCurrentApp, registerAnswer]);

  // Aftellen: 3, 2, 1, start!
  useEffect(() => {
    if (phase !== 'countdown' || !isCurrentApp) return;
    if (countdown <= 0) {
      sounds.playCountdownPip(true);
      lockRef.current = false;
      pendingRef.current = null;
      // Pas reageren op kantelen nadat de telefoon één keer rechtop heeft gestaan
      armedRef.current = poseRef.current === 'neutral' && tiltAvailable;
      setFlash(null);
      setResults([]);
      setTimeLeft(duration);
      drawNextWord();
      setPhase('playing');
      return;
    }
    sounds.playCountdownPip(false);
    const timer = window.setTimeout(() => setCountdown(prev => prev - 1), 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown, isCurrentApp]);

  const finishRound = useCallback(() => {
    clearAdvanceTimers();
    pendingRef.current = null;
    lockRef.current = true;
    sounds.playBuzzer();
    vibrate([200, 100, 200]);
    setFlash(null);
    setPhase('results');
  }, []);

  // Rondetijd
  useEffect(() => {
    if (phase !== 'playing' || !isCurrentApp) return;
    if (timeLeft <= 0) {
      finishRound();
      return;
    }
    const timer = window.setTimeout(() => {
      setTimeLeft(prev => prev - 1);
      if (timeLeft <= 6) sounds.playTimerTick();
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [phase, timeLeft, isCurrentApp, finishRound]);

  const roundScore = results.filter(r => r.correct).length;

  // Score bijschrijven zodra de ronde is afgelopen
  const scoredRoundRef = useRef(false);
  useEffect(() => {
    if (phase !== 'results') {
      scoredRoundRef.current = false;
      return;
    }
    if (scoredRoundRef.current) return;
    scoredRoundRef.current = true;

    if (currentPlayer) {
      setScores(prev => ({ ...prev, [currentPlayer]: (prev[currentPlayer] ?? 0) + roundScore }));
    }
    setIsNewRecord(roundScore > bestScore);
    if (roundScore > bestScore) {
      setBestScore(roundScore);
    }
    if (roundScore >= 5) {
      sounds.playFanfare();
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.35 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleStart = async () => {
    sounds.playWiiSelect();
    await requestMotionPermission();
    deckRef.current = shuffle(getDeckWords(deckId));
    poseRef.current = 'neutral';
    setPhase('ready');
  };

  const handleBeginCountdown = () => {
    setCountdown(3);
    setPhase('countdown');
  };

  const handleNextTurn = () => {
    sounds.playWiiSelect();
    if (players.length > 0) setTurnIndex(prev => prev + 1);
    setPhase('ready');
  };

  const handleBackToSetup = () => {
    clearAdvanceTimers();
    setPhase('setup');
    setFlash(null);
    sounds.playTick(500);
  };

  const handleFullReset = () => {
    clearAdvanceTimers();
    setPhase('setup');
    setScores({});
    setTurnIndex(0);
    setResults([]);
    setFlash(null);
    setShowResetConfirm(false);
    sounds.playTick(500);
  };

  // Het speelscherm ligt altijd "dwars": op een staande telefoon draaien we het een kwartslag
  const isPortrait = viewport.height > viewport.width;
  const stageWidth = isPortrait ? viewport.height : viewport.width;
  const stageHeight = isPortrait ? viewport.width : viewport.height;
  const wordFontSize = Math.max(
    34,
    Math.min(stageHeight * 0.36, (stageWidth * 1.55) / Math.max(currentWord.length, 7))
  );

  const selectedDeck = OP_JE_KOP_DECKS.find(d => d.id === deckId) ?? OP_JE_KOP_DECKS[0];
  const ranking = players
    .map(name => ({ name, score: scores[name] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const hasScores = Object.keys(scores).length > 0;

  const stageBackground =
    flash === 'correct'
      ? 'linear-gradient(160deg, #22c55e 0%, #15803d 100%)'
      : flash === 'pass'
        ? 'linear-gradient(160deg, #fb923c 0%, #c2410c 100%)'
        : 'linear-gradient(160deg, #c026d3 0%, #7e22ce 55%, #4c1d95 100%)';

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-4 select-none">
      {/* =========================================================================
          FASE 1: INSTELLEN
          ========================================================================= */}
      {phase === 'setup' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Categorie */}
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2.5">
              🗂️ Kies een categorie
            </span>
            <div className="grid grid-cols-2 gap-2">
              {OP_JE_KOP_DECKS.map(deck => {
                const isSelected = deck.id === deckId;
                return (
                  <button
                    key={deck.id}
                    onClick={() => {
                      sounds.playTick(650);
                      setDeckId(deck.id);
                    }}
                    aria-pressed={isSelected}
                    className={`p-2.5 rounded-2xl text-left flex items-center gap-2 transition-all cursor-pointer active:scale-95 border-2 ${
                      isSelected
                        ? `${deck.activeClass} shadow-md`
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{deck.emoji}</span>
                    <span className="min-w-0">
                      <span className="block text-xs sm:text-sm font-black leading-tight truncate">{deck.name}</span>
                      <span className={`block text-[10px] font-bold truncate ${isSelected ? 'opacity-85' : 'text-slate-500'}`}>
                        {getDeckSize(deck.id)} woorden
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tijd */}
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2.5">
              ⏱️ Tijd per beurt
            </span>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map(seconds => (
                <button
                  key={seconds}
                  onClick={() => {
                    sounds.playTick(600);
                    setDuration(seconds);
                  }}
                  aria-pressed={duration === seconds}
                  className={`py-3 rounded-2xl text-center transition-all cursor-pointer active:scale-95 ${
                    duration === seconds
                      ? 'bg-fuchsia-600 text-white border-3 border-fuchsia-700 shadow-md font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 font-bold'
                  }`}
                >
                  <span className="text-base font-black">{seconds}</span>
                  <span className="text-xs font-bold ml-1">sec</span>
                </button>
              ))}
            </div>
          </div>

          <PlayerRoster
            players={players}
            onChange={setPlayers}
            max={12}
            title="Spelers"
            hint="Optioneel"
            accentButtonClass="bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-fuchsia-700"
          />

          <button
            onClick={handleStart}
            className="w-full py-4.5 rounded-3xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-lg tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-fuchsia-800"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>START {selectedDeck.name.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          FASE 2-4: SPEELSCHERM (schermvullend en altijd dwars)
          ========================================================================= */}
      {stageActive && (
        <div className="fixed inset-0 z-40 overflow-hidden bg-[#4c1d95] touch-none">
          <div
            className="absolute top-0 flex flex-col text-white transition-[background] duration-150"
            style={
              isPortrait
                ? {
                    width: stageWidth,
                    height: stageHeight,
                    left: viewport.width,
                    transform: 'rotate(90deg)',
                    transformOrigin: 'top left',
                    background: stageBackground,
                  }
                : { width: stageWidth, height: stageHeight, left: 0, background: stageBackground }
            }
          >
            {/* Klaarzetten */}
            {phase === 'ready' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3 animate-in fade-in">
                {currentPlayer && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/30">
                    <PlayerBadge name={currentPlayer} avatar={getAvatar(currentPlayer)} size={28} />
                    <span className="text-sm font-black">{currentPlayer} is aan de beurt</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Smartphone className="w-10 h-10 rotate-90" />
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                    Houd de telefoon dwars
                    <br />
                    tegen je voorhoofd
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/90 border border-white/40">
                    ⬇️ Kantel omlaag = goed
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-orange-500/90 border border-white/40">
                    ⬆️ Kantel omhoog = pas
                  </span>
                </div>
                <button
                  onClick={handleBeginCountdown}
                  className="mt-1 px-8 py-3.5 rounded-full bg-white text-fuchsia-800 font-black text-lg shadow-2xl active:scale-95 transition-transform cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Ik ben er klaar voor!</span>
                </button>
                <p className="text-[11px] font-bold opacity-75">
                  {selectedDeck.emoji} {selectedDeck.name} · {duration} seconden
                </p>
              </div>
            )}

            {/* Aftellen */}
            {phase === 'countdown' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-sm font-black uppercase tracking-widest opacity-80">
                  Op je voorhoofd!
                </span>
                <span
                  key={countdown}
                  className="font-black leading-none animate-pop-in"
                  style={{ fontSize: stageHeight * 0.5 }}
                >
                  {countdown > 0 ? countdown : 'GO!'}
                </span>
              </div>
            )}

            {/* Spelen */}
            {phase === 'playing' && (
              <>
                <div className="shrink-0 flex items-center justify-between px-5 pt-3">
                  <div
                    className={`min-w-16 px-3 py-1 rounded-2xl text-center font-black text-2xl tabular-nums border-2 ${
                      timeLeft <= 5
                        ? 'bg-red-600 border-white animate-pulse'
                        : 'bg-black/25 border-white/30'
                    }`}
                  >
                    {timeLeft}
                  </div>
                  <div className="flex-1 mx-4 h-2.5 rounded-full bg-black/25 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-[width] duration-1000 ease-linear"
                      style={{ width: `${(timeLeft / duration) * 100}%` }}
                    />
                  </div>
                  <div className="min-w-16 px-3 py-1 rounded-2xl bg-black/25 border-2 border-white/30 text-center font-black text-2xl tabular-nums flex items-center justify-center gap-1.5">
                    <Check className="w-5 h-5 stroke-[3.5]" />
                    {roundScore}
                  </div>
                </div>

                <div className="flex-1 min-h-0 relative flex items-center justify-center px-8">
                  {/* Tikvlakken: links = pas, rechts = goed */}
                  <button
                    onClick={() => registerAnswer(false, 'tap')}
                    aria-label="Pas"
                    className="absolute inset-y-0 left-0 w-1/2 cursor-pointer outline-none"
                  />
                  <button
                    onClick={() => registerAnswer(true, 'tap')}
                    aria-label="Goed"
                    className="absolute inset-y-0 right-0 w-1/2 cursor-pointer outline-none"
                  />

                  {flash ? (
                    <div key={`flash-${results.length}`} className="text-center pointer-events-none animate-pop-in">
                      <span className="block font-black leading-none" style={{ fontSize: stageHeight * 0.3 }}>
                        {flash === 'correct' ? 'GOED!' : 'PAS'}
                      </span>
                      <span className="block text-lg font-bold opacity-85 mt-1">
                        {results[results.length - 1]?.word}
                      </span>
                    </div>
                  ) : (
                    <span
                      key={`word-${results.length}`}
                      className="text-center font-black tracking-tight leading-[1.05] pointer-events-none animate-pop-in text-balance drop-shadow-[0_4px_0_rgba(0,0,0,0.25)]"
                      style={{ fontSize: wordFontSize }}
                    >
                      {currentWord}
                    </span>
                  )}
                </div>

                <div className="shrink-0 flex items-center justify-between px-5 pb-3 text-xs font-black uppercase tracking-wider pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/25">
                    {tiltAvailable ? '⬆️ Omhoog = pas' : '👈 Tik links = pas'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/25">
                    {tiltAvailable ? 'Omlaag = goed ⬇️' : 'Tik rechts = goed 👉'}
                  </span>
                </div>
              </>
            )}

            {/* Stoppen */}
            <button
              onClick={phase === 'playing' ? finishRound : handleBackToSetup}
              aria-label={phase === 'playing' ? 'Ronde stoppen' : 'Terug'}
              className="absolute top-3 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/45 border border-white/30 flex items-center justify-center cursor-pointer z-10"
              style={phase === 'playing' ? { top: 'auto', bottom: 10 } : undefined}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE 5: UITSLAG
          ========================================================================= */}
      {phase === 'results' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
          <div className="bg-white border-4 border-fuchsia-500 rounded-3xl p-5 sm:p-6 text-center shadow-2xl text-slate-950">
            {currentPlayer && (
              <div className="inline-flex items-center gap-2 mb-2">
                <PlayerBadge name={currentPlayer} avatar={getAvatar(currentPlayer)} size={34} />
                <span className="text-sm font-black text-slate-700">{currentPlayer}</span>
              </div>
            )}
            <span className="block text-xs font-black uppercase tracking-wider text-fuchsia-600">
              Tijd is om!
            </span>
            <div className="text-7xl font-black text-slate-900 leading-none my-1.5 tabular-nums">{roundScore}</div>
            <p className="text-sm font-bold text-slate-600">
              {roundScore === 1 ? 'woord geraden' : 'woorden geraden'}
              {isNewRecord && ' · nieuw record! 🏆'}
            </p>

            {results.length > 0 ? (
              <div className="mt-4 max-h-52 overflow-y-auto flex flex-wrap justify-center gap-1.5 text-left">
                {results.map((result, idx) => (
                  <span
                    key={`${result.word}-${idx}`}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border-2 ${
                      result.correct
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-orange-50 border-orange-200 text-orange-700 line-through decoration-2'
                    }`}
                  >
                    {result.correct ? <Check className="w-3 h-3 stroke-[3.5]" /> : <X className="w-3 h-3 stroke-[3.5]" />}
                    {result.word}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs font-bold text-slate-400">Geen woorden gespeeld deze ronde.</p>
            )}
          </div>

          {/* Scorebord */}
          {players.length > 1 && hasScores && (
            <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Tussenstand
              </span>
              <div className="space-y-1.5">
                {ranking.map((entry, idx) => (
                  <div
                    key={entry.name}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border-2 ${
                      idx === 0 && entry.score > 0
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="w-5 text-center text-xs font-black text-slate-500">{idx + 1}</span>
                    <PlayerBadge name={entry.name} avatar={getAvatar(entry.name)} size={28} />
                    <span className="flex-1 min-w-0 truncate text-sm font-black text-slate-800">{entry.name}</span>
                    <span className="text-base font-black text-slate-900 tabular-nums">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleNextTurn}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-fuchsia-800"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{nextPlayer ? `Volgende: ${nextPlayer}` : 'Nog een ronde'}</span>
            </button>
            <button
              onClick={handleBackToSetup}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all border-2 border-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Andere categorie</span>
            </button>
          </div>
        </div>
      )}

      <ResetConfirmModal
        open={showResetConfirm}
        gameName="Op je Kop"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleFullReset}
      />
    </div>
  );
}

