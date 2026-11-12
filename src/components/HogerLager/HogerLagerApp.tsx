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
    <div className={`w-full h-full rounded-2xl bg-gradient-to-b from-white via-amber-50/20 to-white border-2 border-amber-300 shadow-2xl relative overflow-hidden ${color}`}>
      <div className="absolute inset-1 rounded-xl border border-amber-400/25 pointer-events-none" />
      <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
        <span className="text-xl sm:text-2xl font-black">{rankLabel(card.value)}</span>
        <span className="text-base sm:text-lg">{card.suit}</span>
      </div>
      <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180">
        <span className="text-xl sm:text-2xl font-black">{rankLabel(card.value)}</span>
        <span className="text-base sm:text-lg">{card.suit}</span>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl sm:text-7xl leading-none filter drop-shadow-xs">{card.suit}</span>
        {card.value > 10 && (
          <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-75">
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
        ? `➡️ Doorgeven aan ${upcomingPlayer}. De pot blijft staan!`
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
          FASE 1: INSTELLEN (Groen & Goud Casino Stijl)
          ========================================================================= */}
      {phase === 'setup' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between gap-3 bg-[#180e08]/90 border-2 border-amber-500/60 rounded-3xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md text-amber-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border border-amber-200 text-slate-950 flex items-center justify-center text-2xl shadow-md shrink-0">
                🃏
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-100 leading-tight">
                  HOGER OF LAGER
                </h1>
                <p className="text-[11px] font-bold text-amber-300/80 truncate">Gok de volgende kaart, de pot loopt op</p>
              </div>
            </div>
            {bestStreak > 0 && (
              <div className="shrink-0 px-3 py-1.5 rounded-2xl bg-[#2a170d] border border-amber-500/60 text-center shadow-inner">
                <span className="block text-[9px] font-black uppercase tracking-wider text-amber-400">Reeks</span>
                <span className="block text-base font-black text-amber-200 leading-none">{bestStreak}</span>
              </div>
            )}
          </div>

          <PlayerRoster
            players={players}
            onChange={setPlayers}
            max={12}
            hint="Optioneel"
            accentButtonClass="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 border border-amber-200"
          />

          <div className="bg-[#180e08]/90 border-2 border-amber-500/60 rounded-3xl p-4 shadow-xl text-amber-100">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-2">
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
                      ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 border-2 border-amber-200 shadow-md font-black'
                      : 'bg-[#2a170d] hover:bg-[#382012] text-amber-200/80 border border-amber-900/60 font-bold'
                  }`}
                >
                  <span className="text-base font-black">{value}</span>
                  <span className="text-xs font-bold ml-1">goed</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] font-bold text-amber-200/70 mt-2.5 leading-relaxed">
              Elke goede gok gooit een slok in de pot. Gok je fout, dan drink jij de pot leeg. Precies dezelfde
              kaart? Dan telt de pot dubbel!
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4.5 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-2 border-amber-200"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>KAARTEN SCHUDDEN</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          FASE 2: DE SPEELTAFEL (Casino Groen & Goud Thema)
          ========================================================================= */}
      {phase === 'table' && currentCard && (
        <div className="space-y-3.5 animate-in fade-in">
          {/* Wie is er aan de beurt + de pot */}
          <div className="flex items-stretch gap-2.5">
            <div className="flex-1 min-w-0 flex items-center gap-2.5 bg-[#180e08]/90 border-2 border-amber-500/60 rounded-3xl px-3.5 py-2.5 shadow-xl text-amber-100">
              {currentPlayer ? (
                <PlayerBadge name={currentPlayer} avatar={getAvatar(currentPlayer)} size={40} />
              ) : (
                <span className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  🃏
                </span>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Aan de beurt
                </span>
                <span className="text-base font-black truncate block leading-tight text-white" data-testid="hl-current-player">
                  {currentPlayer ?? 'Speler'}
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-2 border-amber-200 rounded-3xl px-4 py-2.5 shadow-xl text-slate-950">
              <Beer className="w-6 h-6 stroke-[2.5]" />
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-wider block leading-none">Pot</span>
                <span key={pot} className="text-2xl font-black leading-none block animate-pop-in tabular-nums" data-testid="hl-pot">
                  {pot}
                </span>
              </div>
            </div>
          </div>

          {/* De Casino Groene Speeltafel Mat */}
          <div className="relative bg-gradient-to-b from-[#0f4f2c] via-[#0b3d22] to-[#062916] border-4 sm:border-8 border-[#361a10] rounded-3xl px-4 py-6 shadow-[inset_0_4px_16px_rgba(0,0,0,0.7),0_12px_28px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Inner gold rim and casino felt cloth glow */}
            <div className="absolute inset-1.5 sm:inset-2 rounded-2xl border border-amber-400/30 pointer-events-none" />
            <div className="absolute w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none left-1/2 -translate-x-1/2" />

            <div className="flex items-center justify-center gap-4 sm:gap-8 relative z-10">
              <div className="w-30 h-42 sm:w-36 sm:h-52 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" data-testid="hl-current-card" data-value={currentCard.value}>
                <div key={currentCard.id} className="w-full h-full animate-in fade-in zoom-in-95">
                  <CardFace card={currentCard} />
                </div>
              </div>

              <div className="w-30 h-42 sm:w-36 sm:h-52 playing-card-scene filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                <div
                  key={nextCard?.id ?? 'deck'}
                  className={`playing-card-flip ${flipped && nextCard ? '' : 'is-face-down'}`}
                >
                  <div className="playing-card-face">
                    {nextCard && <CardFace card={nextCard} />}
                  </div>
                  <div className="playing-card-face playing-card-back rounded-2xl bg-gradient-to-br from-[#180e08] via-[#2a170d] to-[#180e08] border-3 border-amber-400 shadow-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-1 rounded-xl border border-amber-500/30 pointer-events-none" />
                    <span className="text-5xl font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">♠</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Uitslag van de gok */}
            <div className="h-9 mt-4 flex items-center justify-center relative z-10">
              {verdict === 'correct' && (
                <span className="px-4 py-1.5 rounded-full bg-emerald-600 border border-emerald-300 text-white text-sm font-black shadow-lg animate-pop-in" data-testid="hl-verdict">
                  ✅ Goed! +1 slok in de pot
                </span>
              )}
              {verdict === 'wrong' && (
                <span className="px-4 py-1.5 rounded-full bg-red-600 border border-red-300 text-white text-sm font-black shadow-lg animate-pop-in" data-testid="hl-verdict">
                  ❌ Fout gegokt!
                </span>
              )}
              {verdict === 'equal' && (
                <span className="px-4 py-1.5 rounded-full bg-purple-600 border border-purple-300 text-white text-sm font-black shadow-lg animate-pop-in" data-testid="hl-verdict">
                  😱 Precies gelijk: dubbel!
                </span>
              )}
              {!verdict && notice && (
                <span className="px-4 py-1.5 rounded-full bg-[#180e08]/95 border border-amber-400 text-amber-200 text-xs font-bold animate-in fade-in shadow-md">
                  {notice}
                </span>
              )}
              {!verdict && !notice && (
                <span className="text-xs font-bold text-amber-200/80 flex items-center gap-1.5 bg-[#180e08]/75 px-3 py-1 rounded-full border border-amber-900/50">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Nog {cardsLeft} kaarten · reeks van {streak}
                </span>
              )}
            </div>
          </div>

          {/* Knoppen */}
          {!hasLost ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGuess('higher')}
                  disabled={busy || Boolean(verdict)}
                  className="py-5 rounded-3xl bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-xl shadow-xl flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all border-2 border-emerald-300 disabled:opacity-60 disabled:active:scale-100"
                >
                  <ArrowUp className="w-7 h-7 stroke-[3] text-emerald-200" />
                  <span className="tracking-wide">HOGER</span>
                </button>
                <button
                  onClick={() => handleGuess('lower')}
                  disabled={busy || Boolean(verdict)}
                  className="py-5 rounded-3xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-black text-xl shadow-xl flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all border-2 border-amber-300 disabled:opacity-60 disabled:active:scale-100"
                >
                  <ArrowDown className="w-7 h-7 stroke-[3] text-amber-200" />
                  <span className="tracking-wide">LAGER</span>
                </button>
              </div>

              <button
                onClick={handlePass}
                disabled={!canPass}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border border-amber-200 disabled:bg-[#180e08]/80 disabled:text-amber-200/40 disabled:border-amber-900/40 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
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
              <div className="bg-[#180e08]/95 border-3 border-amber-500 rounded-3xl p-4 text-center shadow-2xl text-amber-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
                  {verdict === 'equal' ? 'Dubbele pot!' : 'De pot gaat leeg'}
                </span>
                <p className="text-2xl font-black leading-tight mt-0.5 text-white" data-testid="hl-penalty">
                  {currentPlayer ?? 'Jij'} drinkt {penalty} {penalty === 1 ? 'slok' : 'slokken'} 🍺
                </p>
              </div>
              <button
                onClick={handleAfterLoss}
                className="w-full py-4.5 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-2 border-amber-200"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{upcomingPlayer ? `Volgende: ${upcomingPlayer}` : 'Volgende speler'}</span>
              </button>
            </div>
          )}

          {/* Wie heeft het meest gedronken */}
          {sipRanking.length > 0 && (
            <div className="bg-[#180e08]/90 border-2 border-amber-500/60 rounded-3xl p-3.5 shadow-xl text-amber-100">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-2">
                🍺 Slokkenstand
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sipRanking.map(([name, sips]) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-[#2a170d] border border-amber-500/40 text-xs font-black text-amber-100"
                  >
                    <PlayerBadge name={name} avatar={getAvatar(name)} size={22} />
                    <span className="max-w-24 truncate">{name}</span>
                    <span className="text-amber-400 tabular-nums font-black">{sips}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleBackToSetup}
            className="w-full py-2.5 rounded-2xl bg-[#180e08]/70 hover:bg-[#180e08] text-amber-200/80 hover:text-amber-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-amber-500/30"
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
