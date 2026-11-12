import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRightLeft, ArrowUp, Beer, Layers, Play, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/audio';
import {
  shuffle,
  useGameReset,
  usePersistentState,
  useSharedPlayers,
  vibrate,
} from '../Shared/hooks';
import { PlayerBadge, PlayerRoster, useAvatarLookup } from '../Shared/PlayerRoster';
import { ResetConfirmModal } from '../Shared/ResetConfirmModal';

type Phase = 'setup' | 'table';
type Verdict = 'correct' | 'wrong' | 'equal';
type Suit = '♠' | '♥' | '♦' | '♣';

interface Card {
  id: string;
  /** 2 t/m 14, waarbij de aas (14) de hoogste kaart is */
  value: number;
  suit: Suit;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const PASS_OPTIONS = [2, 3, 5];

/** Nederlandse kaartletters: Boer, Vrouw, Heer en Aas */
function rankLabel(value: number): string {
  if (value <= 10) return String(value);
  return { 11: 'B', 12: 'V', 13: 'H', 14: 'A' }[value] ?? '?';
}

function rankName(value: number): string {
  if (value <= 10) return String(value);
  return { 11: 'Boer', 12: 'Vrouw', 13: 'Heer', 14: 'Aas' }[value] ?? '';
}

function createDeck(): Card[] {
  const cards: Card[] = [];
  SUITS.forEach(suit => {
    for (let value = 2; value <= 14; value++) {
      cards.push({ id: `${suit}${value}`, value, suit });
    }
  });
  return shuffle(cards);
}

function CardFace({ card }: { card: Card }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const color = isRed ? 'text-red-600' : 'text-slate-900';
  return (
    <div className={`w-full h-full rounded-2xl bg-white border-2 border-slate-300 shadow-xl relative overflow-hidden ${color}`}>
      <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
        <span className="text-xl sm:text-2xl font-black">{rankLabel(card.value)}</span>
        <span className="text-base sm:text-lg">{card.suit}</span>
      </div>
      <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180">
        <span className="text-xl sm:text-2xl font-black">{rankLabel(card.value)}</span>
        <span className="text-base sm:text-lg">{card.suit}</span>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl sm:text-7xl leading-none">{card.suit}</span>
        {card.value > 10 && (
          <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">
            {rankName(card.value)}
          </span>
        )}
      </div>
    </div>
  );
}

export function HogerLagerApp() {
  const [players, setPlayers] = useSharedPlayers();
  const [passAfter, setPassAfter] = usePersistentState<number>('party_channels_hoger_lager_pass_after', 3);
  const [bestStreak, setBestStreak] = usePersistentState<number>('party_channels_hoger_lager_best_streak', 0);
  const getAvatar = useAvatarLookup(players.join('|'));

  const [phase, setPhase] = useState<Phase>('setup');
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [busy, setBusy] = useState(false);
  const [pot, setPot] = useState(1);
  const [streak, setStreak] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [cardsLeft, setCardsLeft] = useState(51);
  const [notice, setNotice] = useState<string | null>(null);
  const [penalty, setPenalty] = useState(0);
  const [sipsByPlayer, setSipsByPlayer] = useState<Record<string, number>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const deckRef = useRef<Card[]>([]);
  const timersRef = useRef<number[]>([]);

  const currentPlayer = players.length > 0 ? players[turnIndex % players.length] : null;
  const upcomingPlayer = players.length > 1 ? players[(turnIndex + 1) % players.length] : null;
  const canPass = streak >= passAfter && !busy && !verdict;

  useGameReset('HOGER_LAGER', () => setShowResetConfirm(true));

  const clearTimers = () => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];
  };
  const later = (ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => clearTimers, []);

  const showNotice = (text: string) => {
    setNotice(text);
    later(2200, () => setNotice(null));
  };

  const drawCard = (): Card => {
    if (deckRef.current.length === 0) {
      deckRef.current = createDeck().filter(card => card.id !== currentCard?.id);
      showNotice('🔀 Nieuw dek geschud');
    }
    const card = deckRef.current.pop() as Card;
    setCardsLeft(deckRef.current.length);
    return card;
  };

  const handleStart = () => {
    clearTimers();
    deckRef.current = createDeck();
    const first = deckRef.current.pop() as Card;
    setCardsLeft(deckRef.current.length);
    setCurrentCard(first);
    setNextCard(null);
    setFlipped(false);
    setVerdict(null);
    setBusy(false);
    setPot(1);
    setStreak(0);
    setTurnIndex(0);
    setPenalty(0);
    setSipsByPlayer({});
    setNotice(null);
    setPhase('table');
    sounds.playWiiSelect();
  };

  const handleGuess = (direction: 'higher' | 'lower') => {
    if (busy || verdict || !currentCard) return;
    setBusy(true);
    const drawn = drawCard();
    setNextCard(drawn);
    sounds.playWhoosh();

    // Eén frame wachten zodat de kaart zichtbaar omdraait
    later(40, () => setFlipped(true));

    later(640, () => {
      const result: Verdict =
        drawn.value === currentCard.value
          ? 'equal'
          : (drawn.value > currentCard.value) === (direction === 'higher')
            ? 'correct'
            : 'wrong';
      setVerdict(result);

      if (result === 'correct') {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setPot(prev => prev + 1);
        if (nextStreak > bestStreak) setBestStreak(nextStreak);
        sounds.playCorrectDing();
        vibrate(40);

        // Goed gegokt: de nieuwe kaart schuift door en je mag meteen verder
        later(1000, () => {
          setCurrentCard(drawn);
          setNextCard(null);
          setFlipped(false);
          setVerdict(null);
          setBusy(false);
        });
      } else {
        const sips = result === 'equal' ? pot * 2 : pot;
        setPenalty(sips);
        if (currentPlayer) {
          setSipsByPlayer(prev => ({ ...prev, [currentPlayer]: (prev[currentPlayer] ?? 0) + sips }));
        }
        sounds.playBuzzer();
        vibrate([150, 80, 150]);
        setBusy(false);
      }
    });
  };

  const handleAfterLoss = () => {
    if (!nextCard) return;
    sounds.playTick(700);
    setCurrentCard(nextCard);
    setNextCard(null);
    setFlipped(false);
    setVerdict(null);
    setPot(1);
    setStreak(0);
    setPenalty(0);
    setTurnIndex(prev => prev + 1);
  };

  const handlePass = () => {
    if (!canPass) return;
    sounds.playWhoosh();
    setStreak(0);
    setTurnIndex(prev => prev + 1);
    showNotice(
      upcomingPlayer
        ? `➡️ Doorgegeven aan ${upcomingPlayer}. De pot blijft staan!`
        : '➡️ Doorgegeven! De pot blijft staan.'
    );
  };

  const handleBackToSetup = () => {
    clearTimers();
    setPhase('setup');
    setShowResetConfirm(false);
    sounds.playTick(500);
  };

  const sipRanking = Object.entries(sipsByPlayer).sort((a, b) => b[1] - a[1]);
  const hasLost = verdict === 'wrong' || verdict === 'equal';

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-4 select-none">
      {/* =========================================================================
          FASE 1: INSTELLEN
          ========================================================================= */}
      {phase === 'setup' && (
        <div className="space-y-4 animate-in fade-in">
          <PlayerRoster
            players={players}
            onChange={setPlayers}
            max={12}
            hint="Optioneel"
            accentButtonClass="bg-rose-700 hover:bg-rose-600 text-white border-rose-900"
          />

          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
              ➡️ Doorgeven mag na
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PASS_OPTIONS.map(value => (
                <button
                  key={value}
                  onClick={() => {
                    sounds.playTick(600);
                    setPassAfter(value);
                  }}
                  aria-pressed={passAfter === value}
                  className={`py-2.5 rounded-2xl text-center transition-all cursor-pointer active:scale-95 ${
                    passAfter === value
                      ? 'bg-rose-700 text-white border-3 border-rose-900 shadow-md font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 font-bold'
                  }`}
                >
                  <span className="text-base font-black">{value}</span>
                  <span className="text-xs font-bold ml-1">goed</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-2.5 leading-relaxed">
              Elke goede gok gooit een slok in de pot. Gok je fout, dan drink jij de pot leeg. Precies dezelfde
              kaart? Dan telt de pot dubbel!
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4.5 rounded-3xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-lg tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-amber-600"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>KAARTEN SCHUDDEN</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          FASE 2: DE SPEELTAFEL
          ========================================================================= */}
      {phase === 'table' && currentCard && (
        <div className="space-y-3.5 animate-in fade-in">
          {/* Wie is er aan de beurt + de pot */}
          <div className="flex items-stretch gap-2.5">
            <div className="flex-1 min-w-0 flex items-center gap-2.5 bg-white border-4 border-slate-200 rounded-3xl px-3 py-2.5 shadow-md text-slate-950">
              {currentPlayer ? (
                <PlayerBadge name={currentPlayer} avatar={getAvatar(currentPlayer)} size={40} />
              ) : (
                <span className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl shrink-0">🃏</span>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                  Aan de beurt
                </span>
                <span className="text-base font-black truncate block leading-tight" data-testid="hl-current-player">
                  {currentPlayer ?? 'Speler'}
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-amber-400 border-4 border-amber-600 rounded-3xl px-3.5 py-2.5 shadow-md text-slate-950">
              <Beer className="w-6 h-6" />
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-wider block leading-none">Pot</span>
                <span key={pot} className="text-2xl font-black leading-none block animate-pop-in tabular-nums" data-testid="hl-pot">
                  {pot}
                </span>
              </div>
            </div>
          </div>

          {/* De twee kaarten */}
          <div className="relative bg-black/20 border-2 border-white/15 rounded-3xl px-3 py-5 shadow-inner">
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              <div className="w-30 h-42 sm:w-36 sm:h-52" data-testid="hl-current-card" data-value={currentCard.value}>
                <div key={currentCard.id} className="w-full h-full animate-in fade-in zoom-in-95">
                  <CardFace card={currentCard} />
                </div>
              </div>

              <div className="w-30 h-42 sm:w-36 sm:h-52 playing-card-scene">
                <div
                  key={nextCard?.id ?? 'deck'}
                  className={`playing-card-flip ${flipped && nextCard ? '' : 'is-face-down'}`}
                >
                  <div className="playing-card-face">
                    {nextCard && <CardFace card={nextCard} />}
                  </div>
                  <div className="playing-card-face playing-card-back rounded-2xl border-4 border-white shadow-xl flex items-center justify-center">
                    <span className="text-5xl font-black text-white/90 drop-shadow">?</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Uitslag van de gok */}
            <div className="h-9 mt-3 flex items-center justify-center">
              {verdict === 'correct' && (
                <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-black shadow-lg animate-pop-in" data-testid="hl-verdict">
                  ✅ Goed! +1 slok in de pot
                </span>
              )}
              {verdict === 'wrong' && (
                <span className="px-4 py-1.5 rounded-full bg-red-600 text-white text-sm font-black shadow-lg animate-pop-in" data-testid="hl-verdict">
                  ❌ Fout gegokt!
                </span>
              )}
              {verdict === 'equal' && (
                <span className="px-4 py-1.5 rounded-full bg-purple-600 text-white text-sm font-black shadow-lg animate-pop-in" data-testid="hl-verdict">
                  😱 Precies gelijk: dubbel!
                </span>
              )}
              {!verdict && notice && (
                <span className="px-3.5 py-1.5 rounded-full bg-slate-950/70 text-white text-xs font-bold animate-in fade-in">
                  {notice}
                </span>
              )}
              {!verdict && !notice && (
                <span className="text-xs font-bold text-rose-100/80 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Nog {cardsLeft} kaarten · reeks van {streak}
                </span>
              )}
            </div>
          </div>

          {/* Knoppen */}
          {!hasLost ? (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleGuess('higher')}
                  disabled={busy || Boolean(verdict)}
                  className="py-5 rounded-3xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-emerald-700 disabled:opacity-60 disabled:active:scale-100"
                >
                  <ArrowUp className="w-7 h-7 stroke-[3]" />
                  <span>HOGER</span>
                </button>
                <button
                  onClick={() => handleGuess('lower')}
                  disabled={busy || Boolean(verdict)}
                  className="py-5 rounded-3xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-sky-700 disabled:opacity-60 disabled:active:scale-100"
                >
                  <ArrowDown className="w-7 h-7 stroke-[3]" />
                  <span>LAGER</span>
                </button>
              </div>

              <button
                onClick={handlePass}
                disabled={!canPass}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-amber-600 disabled:bg-white/10 disabled:text-white/60 disabled:border-white/20 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>
                  {streak >= passAfter
                    ? `Doorgeven${upcomingPlayer ? ` aan ${upcomingPlayer}` : ''} (pot blijft staan)`
                    : `Doorgeven mag na nog ${passAfter - streak} goede ${passAfter - streak === 1 ? 'gok' : 'gokken'}`}
                </span>
              </button>
            </>
          ) : (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-white border-4 border-red-500 rounded-3xl p-4 text-center shadow-2xl text-slate-950">
                <span className="text-[11px] font-black uppercase tracking-wider text-red-600">
                  {verdict === 'equal' ? 'Dubbele pot!' : 'De pot gaat leeg'}
                </span>
                <p className="text-2xl font-black leading-tight mt-0.5" data-testid="hl-penalty">
                  {currentPlayer ?? 'Jij'} drinkt {penalty} {penalty === 1 ? 'slok' : 'slokken'} 🍺
                </p>
              </div>
              <button
                onClick={handleAfterLoss}
                className="w-full py-4.5 rounded-3xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-lg shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-amber-600"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{upcomingPlayer ? `Volgende: ${upcomingPlayer}` : 'Volgende speler'}</span>
              </button>
            </div>
          )}

          {/* Wie heeft het meest gedronken */}
          {sipRanking.length > 0 && (
            <div className="bg-white/95 border-4 border-slate-200 rounded-3xl p-3.5 shadow-lg text-slate-950">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
                🍺 Slokkenstand
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sipRanking.map(([name, sips]) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-slate-100 border-2 border-slate-200 text-xs font-black text-slate-800"
                  >
                    <PlayerBadge name={name} avatar={getAvatar(name)} size={22} />
                    <span className="max-w-24 truncate">{name}</span>
                    <span className="text-rose-700 tabular-nums">{sips}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleBackToSetup}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/90 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-white/25"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Spelers of regels aanpassen</span>
          </button>
        </div>
      )}

      <ResetConfirmModal
        open={showResetConfirm}
        gameName="Hoger of Lager"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleBackToSetup}
      />
    </div>
  );
}

