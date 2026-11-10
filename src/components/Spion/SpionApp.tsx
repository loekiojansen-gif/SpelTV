import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  MessageCircleQuestion,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Vote,
} from 'lucide-react';
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
import { SPION_PACKS, getSpionPack } from './spionData';

type Phase = 'setup' | 'deal' | 'play' | 'accuse' | 'reveal' | 'scores';
type Outcome = 'spy_escaped' | 'spy_guessed' | 'group_won';

interface SpionRound {
  packId: string;
  word: string;
  spies: string[];
  firstAsker: string;
  players: string[];
}

interface SpionAppProps {
  isCurrentApp?: boolean;
}

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;
const DURATIONS = [3, 5, 8];
const RANDOM_PACK_ID = 'willekeurig';

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function SpionApp({ isCurrentApp = true }: SpionAppProps) {
  const [players, setPlayers] = useSharedPlayers();
  const [packId, setPackId] = usePersistentState<string>('party_channels_spion_pack', 'locaties');
  const [minutes, setMinutes] = usePersistentState<number>('party_channels_spion_minutes', 5);
  const [spyCountPref, setSpyCountPref] = usePersistentState<number>('party_channels_spion_spies', 1);
  const getAvatar = useAvatarLookup(players.join('|'));

  const [phase, setPhase] = useState<Phase>('setup');
  const [round, setRound] = useState<SpionRound | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [scores, setScores] = useState<Record<string, number>>({});

  // Rollen uitdelen
  const [dealIndex, setDealIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [hasSeenRole, setHasSeenRole] = useState(false);

  // Vragenronde
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [paused, setPaused] = useState(false);
  const [showWords, setShowWords] = useState(true);

  // Ontknoping
  const [accused, setAccused] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const usedWordsRef = useRef<Set<string>>(new Set());

  const canHaveTwoSpies = players.length >= 6;
  const spyCount = canHaveTwoSpies ? spyCountPref : 1;
  const canStart = players.length >= MIN_PLAYERS;

  useWakeLock(phase !== 'setup' && isCurrentApp);
  useGameReset('SPION', () => setShowResetConfirm(true));

  const startRound = () => {
    const pack =
      packId === RANDOM_PACK_ID
        ? SPION_PACKS[Math.floor(Math.random() * SPION_PACKS.length)]
        : getSpionPack(packId);

    let candidates = pack.words.filter(word => !usedWordsRef.current.has(`${pack.id}:${word}`));
    if (candidates.length === 0) {
      pack.words.forEach(word => usedWordsRef.current.delete(`${pack.id}:${word}`));
      candidates = pack.words;
    }
    const word = candidates[Math.floor(Math.random() * candidates.length)];
    usedWordsRef.current.add(`${pack.id}:${word}`);

    const shuffledPlayers = shuffle(players);
    setRound({
      packId: pack.id,
      word,
      spies: shuffledPlayers.slice(0, spyCount),
      firstAsker: players[Math.floor(Math.random() * players.length)],
      players: [...players],
    });
    setDealIndex(0);
    setIsHolding(false);
    setHasSeenRole(false);
    setTimeLeft(minutes * 60);
    setPaused(false);
    setAccused(null);
    setRevealed(false);
    setOutcome(null);
    setPhase('deal');
    sounds.playWiiSelect();
  };

  // Aftellende klok tijdens de vragenronde
  useEffect(() => {
    if (phase !== 'play' || paused || !isCurrentApp) return;
    if (timeLeft <= 0) {
      sounds.playBuzzer();
      vibrate([250, 120, 250]);
      setPhase('accuse');
      return;
    }
    const timer = window.setTimeout(() => {
      setTimeLeft(prev => prev - 1);
      if (timeLeft <= 11) sounds.playTimerTick();
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [phase, paused, timeLeft, isCurrentApp]);

  // Spanning opbouwen voordat de rol van de verdachte wordt onthuld
  useEffect(() => {
    if (phase !== 'reveal' || revealed || !round || !accused) return;
    const timer = window.setTimeout(() => {
      setRevealed(true);
      if (round.spies.includes(accused)) {
        sounds.playCorrectDing();
        vibrate(120);
      } else {
        sounds.playBuzzer();
        vibrate([200, 80, 200]);
      }
    }, 1900);
    return () => window.clearTimeout(timer);
  }, [phase, revealed, round, accused]);

  const handleHoldStart = () => {
    if (isHolding) return;
    setIsHolding(true);
    setHasSeenRole(true);
    sounds.playTick(900);
    vibrate(25);
  };

  const handleHoldEnd = () => {
    if (!isHolding) return;
    setIsHolding(false);
  };

  const handleNextDeal = () => {
    if (!round) return;
    sounds.playWhoosh();
    setIsHolding(false);
    setHasSeenRole(false);
    if (dealIndex + 1 >= round.players.length) {
      setPhase('play');
    } else {
      setDealIndex(prev => prev + 1);
    }
  };

  const handleAccuse = (name: string) => {
    sounds.playReveal();
    setAccused(name);
    setRevealed(false);
    setPhase('reveal');
  };

  const finishRound = (result: Outcome) => {
    if (!round) return;
    setOutcome(result);
    setScores(prev => {
      const next = { ...prev };
      round.players.forEach(name => {
        const isSpy = round.spies.includes(name);
        let points = 0;
        if (result === 'group_won' && !isSpy) points = 1;
        if (result === 'spy_escaped' && isSpy) points = 3;
        if (result === 'spy_guessed' && isSpy) points = 2;
        next[name] = (next[name] ?? 0) + points;
      });
      return next;
    });
    setPhase('scores');
    if (result === 'group_won') {
      sounds.playFanfare();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 } });
    } else {
      sounds.playCheerFanfare();
    }
  };

  const handleNextRound = () => {
    setRoundNumber(prev => prev + 1);
    startRound();
  };

  const handleStopGame = () => {
    setPhase('setup');
    setRound(null);
    setScores({});
    setRoundNumber(1);
    setShowResetConfirm(false);
    sounds.playTick(500);
  };

  const activePack = round ? getSpionPack(round.packId) : null;
  const dealPlayer = round ? round.players[dealIndex] : null;
  const dealPlayerIsSpy = Boolean(round && dealPlayer && round.spies.includes(dealPlayer));
  const accusedIsSpy = Boolean(round && accused && round.spies.includes(accused));
  const ranking = (round?.players ?? players)
    .map(name => ({ name, score: scores[name] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const totalSeconds = minutes * 60;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-4 select-none">
      {/* =========================================================================
          FASE 1: INSTELLEN
          ========================================================================= */}
      {phase === 'setup' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2.5 bg-white border-4 border-slate-200 rounded-3xl p-3.5 sm:p-4 shadow-md text-slate-950">
            <div className="w-11 h-11 rounded-2xl bg-indigo-700 border-2 border-indigo-900 flex items-center justify-center text-2xl shadow-sm shrink-0">
              🕵️
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">SPION</h1>
              <p className="text-[11px] font-bold text-slate-500 truncate">
                Iedereen kent het woord, behalve de spion
              </p>
            </div>
          </div>

          <PlayerRoster
            players={players}
            onChange={setPlayers}
            min={MIN_PLAYERS}
            max={MAX_PLAYERS}
            hint={`${MIN_PLAYERS} tot ${MAX_PLAYERS} spelers`}
            accentButtonClass="bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800"
          />

          {/* Categorie */}
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2.5">
              🗂️ Categorie van het geheime woord
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[...SPION_PACKS, { id: RANDOM_PACK_ID, name: 'Verras me', emoji: '🎲', words: [] }].map(pack => {
                const isSelected = pack.id === packId;
                return (
                  <button
                    key={pack.id}
                    onClick={() => {
                      sounds.playTick(650);
                      setPackId(pack.id);
                    }}
                    aria-pressed={isSelected}
                    className={`px-2.5 py-2.5 rounded-2xl text-left flex items-center gap-2 transition-all cursor-pointer active:scale-95 border-2 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-800 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    } ${pack.id === RANDOM_PACK_ID ? 'col-span-2 justify-center' : ''}`}
                  >
                    <span className="text-xl shrink-0">{pack.emoji}</span>
                    <span className="text-xs sm:text-sm font-black leading-tight truncate">{pack.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tijd en aantal spionnen */}
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950 space-y-3.5">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
                ⏱️ Tijd om vragen te stellen
              </span>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map(value => (
                  <button
                    key={value}
                    onClick={() => {
                      sounds.playTick(600);
                      setMinutes(value);
                    }}
                    aria-pressed={minutes === value}
                    className={`py-2.5 rounded-2xl text-center transition-all cursor-pointer active:scale-95 ${
                      minutes === value
                        ? 'bg-indigo-600 text-white border-3 border-indigo-800 shadow-md font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 font-bold'
                    }`}
                  >
                    <span className="text-base font-black">{value}</span>
                    <span className="text-xs font-bold ml-1">min</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
                🕵️ Aantal spionnen
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map(value => {
                  const disabled = value === 2 && !canHaveTwoSpies;
                  const isSelected = spyCount === value;
                  return (
                    <button
                      key={value}
                      disabled={disabled}
                      onClick={() => {
                        sounds.playTick(600);
                        setSpyCountPref(value);
                      }}
                      aria-pressed={isSelected}
                      className={`py-2.5 rounded-2xl text-center transition-all cursor-pointer active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-3 border-indigo-800 shadow-md font-black'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 font-bold'
                      }`}
                    >
                      <span className="text-sm font-black">
                        {value} {value === 1 ? 'spion' : 'spionnen'}
                      </span>
                      {disabled && (
                        <span className="block text-[10px] font-bold">vanaf 6 spelers</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={startRound}
            disabled={!canStart}
            className="w-full py-4.5 rounded-3xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-lg tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>{canStart ? 'ROLLEN UITDELEN' : `NOG ${MIN_PLAYERS - players.length} SPELER(S) NODIG`}</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          FASE 2: ROLLEN UITDELEN (telefoon doorgeven)
          ========================================================================= */}
      {phase === 'deal' && round && dealPlayer && (
        <div key={dealIndex} className="space-y-4 animate-in fade-in slide-in-from-bottom-6">
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-5 sm:p-6 text-center shadow-2xl text-slate-950">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
              Speler {dealIndex + 1} van {round.players.length}
            </span>
            <div className="flex justify-center my-2.5">
              <PlayerBadge name={dealPlayer} avatar={getAvatar(dealPlayer)} size={76} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Geef de telefoon aan
              <br />
              <span className="text-indigo-700">{dealPlayer}</span>
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1.5">Zorg dat niemand meekijkt! 👀</p>

            {/* Rolkaart: alleen zichtbaar zolang de knop ingedrukt is */}
            <div
              className={`mt-4 rounded-3xl border-4 min-h-40 flex flex-col items-center justify-center px-4 py-5 transition-colors duration-150 ${
                isHolding
                  ? dealPlayerIsSpy
                    ? 'bg-slate-950 border-yellow-400 text-white'
                    : 'bg-indigo-600 border-indigo-800 text-white'
                  : 'bg-slate-100 border-slate-200 border-dashed text-slate-400'
              }`}
              data-testid="spion-role-card"
            >
              {!isHolding ? (
                <>
                  <Lock className="w-8 h-8 mb-1.5" />
                  <span className="text-xs font-black uppercase tracking-wider">Verborgen</span>
                </>
              ) : dealPlayerIsSpy ? (
                <div className="animate-pop-in">
                  <span className="text-4xl block">🕵️</span>
                  <span className="text-2xl sm:text-3xl font-black text-yellow-300 block leading-tight">
                    JIJ BENT DE SPION
                  </span>
                  <span className="text-xs font-bold text-slate-300 block mt-1.5">
                    Doe alsof je het woord kent. Categorie: {activePack?.emoji} {activePack?.name}
                  </span>
                </div>
              ) : (
                <div className="animate-pop-in">
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-200 block">
                    Het geheime woord is
                  </span>
                  <span className="text-3xl sm:text-4xl font-black block leading-tight my-1">{round.word}</span>
                  <span className="text-xs font-bold text-indigo-200 block">
                    {activePack?.emoji} {activePack?.name}
                  </span>
                </div>
              )}
            </div>

            <button
              onPointerDown={e => {
                e.currentTarget.setPointerCapture?.(e.pointerId);
                handleHoldStart();
              }}
              onPointerUp={handleHoldEnd}
              onPointerCancel={handleHoldEnd}
              onLostPointerCapture={handleHoldEnd}
              onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') handleHoldStart();
              }}
              onKeyUp={handleHoldEnd}
              onContextMenu={e => e.preventDefault()}
              className={`mt-3 w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-all border-3 touch-none ${
                isHolding
                  ? 'bg-indigo-900 border-indigo-950 text-white scale-[0.98]'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-800 text-white shadow-lg'
              }`}
              style={{ WebkitTouchCallout: 'none' }}
            >
              {isHolding ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              <span>{isHolding ? 'Laat los om te verbergen' : 'Houd ingedrukt om je rol te zien'}</span>
            </button>
          </div>

          <button
            onClick={handleNextDeal}
            disabled={!hasSeenRole || isHolding}
            className="w-full py-4 rounded-3xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <span>
              {dealIndex + 1 >= round.players.length
                ? 'Iedereen weet het: START ▶'
                : `Gezien! Door naar ${round.players[dealIndex + 1]} ▶`}
            </span>
          </button>
        </div>
      )}

      {/* =========================================================================
          FASE 3: VRAGENRONDE
          ========================================================================= */}
      {phase === 'play' && round && activePack && (
        <div className="space-y-3.5 animate-in fade-in">
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 sm:p-5 text-center shadow-xl text-slate-950">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
              <span>Ronde {roundNumber}</span>
              <span>
                {activePack.emoji} {activePack.name}
              </span>
            </div>
            <div
              className={`text-6xl sm:text-7xl font-black tabular-nums leading-none my-2 ${
                timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-900'
              }`}
              data-testid="spion-timer"
            >
              {formatTime(timeLeft)}
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
                  timeLeft <= 10 ? 'bg-red-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${(timeLeft / totalSeconds) * 100}%` }}
              />
            </div>
            <button
              onClick={() => {
                sounds.playTick(600);
                setPaused(prev => !prev);
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-xs font-black text-slate-700 cursor-pointer active:scale-95"
            >
              {paused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{paused ? 'Verder' : 'Pauze'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 bg-indigo-600 border-4 border-indigo-800 rounded-3xl p-3.5 shadow-lg text-white">
            <PlayerBadge name={round.firstAsker} avatar={getAvatar(round.firstAsker)} size={40} />
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 flex items-center gap-1">
                <MessageCircleQuestion className="w-3.5 h-3.5" />
                Eerste vraag
              </span>
              <p className="text-sm font-black leading-snug">
                {round.firstAsker} stelt iemand een vraag over het woord. Wie antwoordt, vraagt daarna verder.
              </p>
            </div>
          </div>

          {/* Mogelijke woorden: zo kan de spion meebluffen en het woord raden */}
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-3.5 shadow-lg text-slate-950">
            <button
              onClick={() => {
                sounds.playTick(600);
                setShowWords(prev => !prev);
              }}
              aria-expanded={showWords}
              className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-600 cursor-pointer"
            >
              <span>📋 Mogelijke woorden ({activePack.words.length})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showWords ? 'rotate-180' : ''}`} />
            </button>
            {showWords && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {activePack.words.map(word => (
                  <span
                    key={word}
                    className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700"
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              sounds.playWiiSelect();
              setPhase('accuse');
            }}
            className="w-full py-4.5 rounded-3xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-lg shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-yellow-600"
          >
            <Vote className="w-6 h-6" />
            <span>WE WETEN HET: STEMMEN!</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          FASE 4: VERDACHTE AANWIJZEN
          ========================================================================= */}
      {phase === 'accuse' && round && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white border-4 border-yellow-400 rounded-3xl p-5 text-center shadow-2xl text-slate-950">
            <span className="text-4xl block">🫵</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Wie is de spion?</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Tel tot drie, wijs allemaal tegelijk iemand aan en tik op wie de meeste stemmen krijgt.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {round.players.map(name => (
              <button
                key={name}
                onClick={() => handleAccuse(name)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-yellow-50 border-4 border-slate-200 hover:border-yellow-400 shadow-md text-left cursor-pointer active:scale-95 transition-all text-slate-950"
              >
                <PlayerBadge name={name} avatar={getAvatar(name)} size={40} />
                <span className="min-w-0 truncate text-sm font-black">{name}</span>
              </button>
            ))}
          </div>

          {timeLeft > 0 && (
            <button
              onClick={() => {
                sounds.playWiiBack();
                setPhase('play');
              }}
              className="w-full py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border-2 border-white/30 cursor-pointer active:scale-95 transition-all"
            >
              Toch nog even verder vragen ({formatTime(timeLeft)})
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          FASE 5: ONTKNOPING
          ========================================================================= */}
      {phase === 'reveal' && round && accused && (
        <div className="space-y-4 animate-in fade-in">
          <div
            className={`rounded-3xl border-4 p-6 text-center shadow-2xl transition-colors duration-300 ${
              !revealed
                ? 'bg-white border-slate-200 text-slate-950'
                : accusedIsSpy
                  ? 'bg-emerald-600 border-emerald-800 text-white'
                  : 'bg-red-600 border-red-800 text-white'
            }`}
          >
            <div className={`flex justify-center mb-2.5 ${!revealed ? 'animate-pulse' : ''}`}>
              <PlayerBadge name={accused} avatar={getAvatar(accused)} size={88} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{accused} is...</h2>

            {!revealed ? (
              <div className="flex items-center justify-center gap-1.5 mt-4 h-12" aria-label="Spanning">
                <span className="w-3 h-3 rounded-full bg-indigo-600 animate-typing-dot" />
                <span className="w-3 h-3 rounded-full bg-indigo-600 animate-typing-dot" style={{ animationDelay: '0.18s' }} />
                <span className="w-3 h-3 rounded-full bg-indigo-600 animate-typing-dot" style={{ animationDelay: '0.36s' }} />
              </div>
            ) : (
              <div className="animate-pop-in mt-2" data-testid="spion-verdict">
                <span className="text-4xl sm:text-5xl font-black block leading-tight">
                  {accusedIsSpy ? 'DE SPION! 🕵️' : 'ONSCHULDIG! 😱'}
                </span>
                <p className="text-sm font-bold mt-2 opacity-95">
                  {accusedIsSpy
                    ? `Laatste kans, ${accused}: wat was het geheime woord?`
                    : 'Jullie hebben de verkeerde te pakken. De spion ontsnapt!'}
                </p>
              </div>
            )}
          </div>

          {revealed && accusedIsSpy && (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-center text-xs font-bold text-indigo-100">
                De rest van de groep weet het woord. Heeft de spion het goed geraden?
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => finishRound('group_won')}
                  className="py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm shadow-xl cursor-pointer active:scale-95 transition-all border-3 border-emerald-700"
                >
                  ❌ Fout geraden
                  <span className="block text-[10px] font-bold opacity-90">De groep wint</span>
                </button>
                <button
                  onClick={() => finishRound('spy_guessed')}
                  className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black text-sm shadow-xl cursor-pointer active:scale-95 transition-all border-3 border-yellow-400"
                >
                  ✅ Goed geraden
                  <span className="block text-[10px] font-bold opacity-90">De spion wint alsnog</span>
                </button>
              </div>
            </div>
          )}

          {revealed && !accusedIsSpy && (
            <button
              onClick={() => finishRound('spy_escaped')}
              className="w-full py-4 rounded-3xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-base shadow-xl cursor-pointer active:scale-95 transition-all border-3 border-yellow-600 animate-in fade-in slide-in-from-bottom-2"
            >
              Onthul de echte spion ▶
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          FASE 6: UITSLAG EN STAND
          ========================================================================= */}
      {phase === 'scores' && round && outcome && (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
          <div
            className={`rounded-3xl border-4 p-5 text-center shadow-2xl ${
              outcome === 'group_won'
                ? 'bg-emerald-600 border-emerald-800 text-white'
                : 'bg-slate-950 border-yellow-400 text-white'
            }`}
          >
            <span className="text-[11px] font-black uppercase tracking-widest opacity-85">
              {outcome === 'group_won'
                ? 'De groep wint!'
                : outcome === 'spy_guessed'
                  ? 'De spion raadt het woord en wint!'
                  : 'De spion is ontsnapt!'}
            </span>
            <div className="flex items-center justify-center gap-3 my-3 flex-wrap">
              {round.spies.map(name => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <PlayerBadge name={name} avatar={getAvatar(name)} size={64} />
                  <span className="text-sm font-black">{name}</span>
                </div>
              ))}
            </div>
            <p className="text-lg font-black leading-tight">
              {round.spies.length > 1 ? 'waren de spionnen 🕵️' : 'was de spion 🕵️'}
            </p>
            <p className="text-xs font-bold mt-2 opacity-90">
              Het geheime woord was <strong className="text-yellow-300 text-sm">{round.word}</strong>
            </p>
          </div>

          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Stand na ronde {roundNumber}
            </span>
            <div className="space-y-1.5">
              {ranking.map((entry, idx) => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border-2 ${
                    idx === 0 && entry.score > 0 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="w-5 text-center text-xs font-black text-slate-500">{idx + 1}</span>
                  <PlayerBadge name={entry.name} avatar={getAvatar(entry.name)} size={28} />
                  <span className="flex-1 min-w-0 truncate text-sm font-black text-slate-800">
                    {entry.name}
                    {round.spies.includes(entry.name) && <span className="ml-1">🕵️</span>}
                  </span>
                  <span className="text-base font-black text-slate-900 tabular-nums">{entry.score}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 text-center">
              Spion ontsnapt: 3 punten · Spion raadt het woord: 2 punten · Spion gepakt: 1 punt voor de rest
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleNextRound}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-yellow-600"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Volgende ronde</span>
            </button>
            <button
              onClick={handleStopGame}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all border-2 border-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Stoppen</span>
            </button>
          </div>
        </div>
      )}

      <ResetConfirmModal
        open={showResetConfirm}
        gameName="Spion"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleStopGame}
      />
    </div>
  );
}
