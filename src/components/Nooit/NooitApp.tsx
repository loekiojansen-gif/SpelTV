import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, PenLine, Play, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { shuffle, useGameReset, usePersistentState, vibrate } from '../Shared/hooks';
import { ResetConfirmModal } from '../Shared/ResetConfirmModal';
import {
  CUSTOM_LEVEL,
  DEFAULT_STATEMENTS,
  NOOIT_LEVELS,
  NooitLevelId,
  NooitStatement,
  cleanCustomStatement,
  countStatements,
  getLevel,
} from './nooitData';

type Phase = 'setup' | 'cards' | 'done';

/** Na zoveel kaarten komt er een proost-kaart tussendoor */
const TOAST_EVERY = 12;
const TOAST_CARDS = [
  'Iedereen proost en neemt een slok! 🥂',
  'Wie het laatst gedronken heeft, kiest iemand die een slok neemt 👉',
  'De jongste van de groep deelt twee slokken uit 🍻',
  'Proost op de persoon links van je! 🥂',
  'Iedereen met een leeg glas vult bij. Daarna: proost! 🍺',
];

type DeckCard =
  | { kind: 'statement'; statement: NooitStatement }
  | { kind: 'toast'; id: string; text: string };

function buildDeck(statements: NooitStatement[]): DeckCard[] {
  const cards: DeckCard[] = [];
  const toasts = shuffle(TOAST_CARDS);
  shuffle(statements).forEach((statement, idx) => {
    if (idx > 0 && idx % TOAST_EVERY === 0) {
      const toastIndex = idx / TOAST_EVERY - 1;
      cards.push({ kind: 'toast', id: `toast-${idx}`, text: toasts[toastIndex % toasts.length] });
    }
    cards.push({ kind: 'statement', statement });
  });
  return cards;
}

export function NooitApp() {
  const [selectedLevels, setSelectedLevels] = usePersistentState<NooitLevelId[]>(
    'party_channels_nooit_levels',
    ['gezellig', 'feest']
  );
  const [customTexts, setCustomTexts] = usePersistentState<string[]>('party_channels_nooit_custom', []);

  const [phase, setPhase] = useState<Phase>('setup');
  const [deck, setDeck] = useState<DeckCard[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [customInput, setCustomInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Voorkomt dat loslaten na een veeg ook nog als tik telt
  const draggedRef = useRef(false);

  useGameReset('NOOIT', () => setShowResetConfirm(true));

  const customStatements: NooitStatement[] = useMemo(
    () => customTexts.map((text, idx) => ({ id: `eigen-${idx}-${text}`, level: 'eigen' as const, text })),
    [customTexts]
  );

  const activeStatements = useMemo(() => {
    const fromLevels = DEFAULT_STATEMENTS.filter(statement => selectedLevels.includes(statement.level));
    return selectedLevels.includes('eigen') ? [...fromLevels, ...customStatements] : fromLevels;
  }, [selectedLevels, customStatements]);

  const toggleLevel = (levelId: NooitLevelId) => {
    const isOn = selectedLevels.includes(levelId);
    sounds.playTick(isOn ? 500 : 800);
    setSelectedLevels(isOn ? selectedLevels.filter(id => id !== levelId) : [...selectedLevels, levelId]);
  };

  const handleStart = () => {
    if (activeStatements.length === 0) return;
    setDeck(buildDeck(activeStatements));
    setIndex(0);
    setDirection(1);
    setPhase('cards');
    sounds.playWiiSelect();
  };

  const goNext = () => {
    setDirection(1);
    if (index + 1 >= deck.length) {
      setPhase('done');
      sounds.playFanfare();
      return;
    }
    setIndex(index + 1);
    sounds.playWhoosh();
    vibrate(15);
  };

  const goPrevious = () => {
    if (index === 0) return;
    setDirection(-1);
    setIndex(index - 1);
    sounds.playTick(500);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const text = cleanCustomStatement(customInput);
    if (!text) return;
    if (!customTexts.some(existing => existing.toLowerCase() === text.toLowerCase())) {
      setCustomTexts([text, ...customTexts]);
      if (!selectedLevels.includes('eigen')) setSelectedLevels([...selectedLevels, 'eigen']);
    }
    setCustomInput('');
    sounds.playTick(800);
  };

  const handleRemoveCustom = (text: string) => {
    setCustomTexts(customTexts.filter(existing => existing !== text));
    sounds.playTick(500);
  };

  const handleBackToSetup = () => {
    setPhase('setup');
    setShowResetConfirm(false);
    sounds.playTick(500);
  };

  const card = deck[index];
  const cardLevel = card?.kind === 'statement' ? getLevel(card.statement.level) : null;
  const statementNumber = deck.slice(0, index + 1).filter(c => c.kind === 'statement').length;
  const statementTotal = deck.filter(c => c.kind === 'statement').length;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-4 select-none">
      {/* =========================================================================
          FASE 1: INSTELLEN
          ========================================================================= */}
      {phase === 'setup' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Niveaus */}
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2.5">
              🌶️ Hoe pittig mag het worden? (meerdere mogelijk)
            </span>
            <div className="space-y-2">
              {NOOIT_LEVELS.map(level => {
                const isSelected = selectedLevels.includes(level.id);
                return (
                  <button
                    key={level.id}
                    onClick={() => toggleLevel(level.id)}
                    role="switch"
                    aria-checked={isSelected}
                    className={`w-full p-3 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer active:scale-[0.98] border-2 ${
                      isSelected
                        ? `${level.activeClass} shadow-md`
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span className="text-3xl shrink-0">{level.emoji}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-base font-black leading-tight">{level.name}</span>
                      <span className={`block text-[11px] font-bold ${isSelected ? 'opacity-90' : 'text-slate-500'}`}>
                        {level.description} · {countStatements(level.id)} stellingen
                      </span>
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? 'bg-white text-slate-900 border-white' : 'border-slate-300 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}

              {/* Eigen stellingen */}
              <div
                className={`rounded-2xl border-2 flex items-stretch overflow-hidden transition-all ${
                  selectedLevels.includes('eigen') && customTexts.length > 0
                    ? `${CUSTOM_LEVEL.activeClass} shadow-md`
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <button
                  onClick={() => (customTexts.length > 0 ? toggleLevel('eigen') : setShowCustomModal(true))}
                  role="switch"
                  aria-checked={selectedLevels.includes('eigen') && customTexts.length > 0}
                  className="flex-1 min-w-0 p-3 text-left flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-3xl shrink-0">{CUSTOM_LEVEL.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-base font-black leading-tight">Eigen stellingen</span>
                    <span className="block text-[11px] font-bold opacity-80">
                      {customTexts.length === 0
                        ? 'Bedenk ze zelf voor jullie groep'
                        : `${customTexts.length} zelf bedacht`}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    sounds.playTick(650);
                    setShowCustomModal(true);
                  }}
                  aria-label="Eigen stellingen beheren"
                  className="shrink-0 px-3.5 bg-black/10 hover:bg-black/20 flex items-center justify-center cursor-pointer border-l-2 border-black/10"
                >
                  <PenLine className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={activeStatements.length === 0}
            className="w-full py-4.5 rounded-3xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-lg tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-amber-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>
              {activeStatements.length === 0
                ? 'KIES EERST EEN NIVEAU'
                : `START MET ${activeStatements.length} STELLINGEN`}
            </span>
          </button>
        </div>
      )}

      {/* =========================================================================
          FASE 2: DE KAARTEN
          ========================================================================= */}
      {phase === 'cards' && card && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-black text-white/90 px-1">
            <span className="px-2.5 py-1 rounded-full bg-black/25 tabular-nums" data-testid="nooit-counter">
              {statementNumber} / {statementTotal}
            </span>
            <div className="flex-1 mx-3 h-2 rounded-full bg-black/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-[width] duration-300"
                style={{ width: `${((index + 1) / deck.length) * 100}%` }}
              />
            </div>
            <button
              onClick={handleBackToSetup}
              className="px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/40 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Stop
            </button>
          </div>

          {/* De kaart: tik of veeg voor de volgende */}
          <div className="relative h-[21rem] sm:h-[24rem]">
            <div className="absolute inset-x-5 top-3 bottom-0 rounded-[2rem] bg-white/25 rotate-3" />
            <div className="absolute inset-x-3 top-1.5 bottom-0 rounded-[2rem] bg-white/45 -rotate-2" />
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.button
                key={card.kind === 'statement' ? card.statement.id : card.id}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ x: dir * 90, opacity: 0, rotate: dir * 6, scale: 0.94 }),
                  center: { x: 0, opacity: 1, rotate: 0, scale: 1 },
                  exit: (dir: number) => ({ x: dir * -220, opacity: 0, rotate: dir * -12 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragStart={() => {
                  draggedRef.current = true;
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) goNext();
                  else if (info.offset.x > 70) goPrevious();
                  window.setTimeout(() => {
                    draggedRef.current = false;
                  }, 0);
                }}
                onClick={() => {
                  if (!draggedRef.current) goNext();
                }}
                data-testid="nooit-card"
                className={`absolute inset-0 rounded-[2rem] border-4 shadow-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer outline-none ${
                  card.kind === 'toast'
                    ? 'bg-amber-400 border-amber-600 text-slate-950'
                    : 'bg-white border-white text-slate-950'
                }`}
              >
                {card.kind === 'statement' && cardLevel ? (
                  <>
                    <span
                      className={`absolute top-4 left-4 px-2.5 py-1 rounded-full border text-[11px] font-black ${cardLevel.chipClass}`}
                    >
                      {cardLevel.emoji} {cardLevel.name}
                    </span>
                    <span className="text-sm sm:text-base font-black uppercase tracking-widest text-teal-700">
                      Ik heb nog nooit...
                    </span>
                    <span className="text-2xl sm:text-4xl font-black tracking-tight leading-snug mt-3 text-balance">
                      {card.statement.text}
                    </span>
                  </>
                ) : (
                  card.kind === 'toast' && (
                    <>
                      <span className="text-sm font-black uppercase tracking-widest">Tussendoor</span>
                      <span className="text-2xl sm:text-4xl font-black tracking-tight leading-snug mt-3 text-balance">
                        {card.text}
                      </span>
                    </>
                  )
                )}
                <span className="absolute bottom-4 inset-x-0 text-[11px] font-bold text-slate-400">
                  Tik of veeg voor de volgende
                </span>
              </motion.button>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={goPrevious}
              disabled={index === 0}
              aria-label="Vorige stelling"
              className="w-14 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all border-2 border-white/30 disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goNext}
              className="flex-1 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-lg shadow-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all border-3 border-amber-600"
            >
              <span>{index + 1 >= deck.length ? 'Afronden' : 'Volgende'}</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <p className="text-center text-xs font-bold text-white/85">
            Heb jij het wél een keer gedaan? Dan neem je een slok 🍺
          </p>
        </div>
      )}

      {/* =========================================================================
          FASE 3: STAPEL OP
          ========================================================================= */}
      {phase === 'done' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
          <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 text-center shadow-2xl text-slate-950">
            <span className="text-5xl block">🥂</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">De stapel is op!</h2>
            <p className="text-sm font-bold text-slate-600 mt-1">
              Jullie hebben alle {statementTotal} stellingen gehad. Nu weet iedereen alles van elkaar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleStart}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all border-3 border-amber-600"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Opnieuw schudden</span>
            </button>
            <button
              onClick={handleBackToSetup}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all border-2 border-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ander niveau</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VENSTER: EIGEN STELLINGEN
          ========================================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-4 border-slate-300 rounded-3xl p-4 sm:p-5 w-full max-w-lg shadow-2xl max-h-[85dvh] flex flex-col text-slate-950 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div>
                <h3 className="text-base sm:text-lg font-black">✍️ Eigen stellingen ({customTexts.length})</h3>
                <p className="text-[11px] font-bold text-slate-500">Maak het spel persoonlijk voor jullie groep</p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                aria-label="Sluiten"
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="my-3">
              <label
                htmlFor="nooit-custom-input"
                className="text-[10px] font-black uppercase tracking-wider text-teal-700 block mb-1"
              >
                Ik heb nog nooit...
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="nooit-custom-input"
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="bijv. de afstandsbediening verstopt"
                  maxLength={120}
                  className="flex-1 min-w-0 px-3 py-2.5 text-sm font-bold rounded-xl outline-none"
                />
                <button
                  type="submit"
                  disabled={!cleanCustomStatement(customInput)}
                  className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 border-2 border-teal-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Voeg toe</span>
                </button>
              </div>
            </form>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {customTexts.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 text-center py-6">
                  Nog geen eigen stellingen. Typ hierboven je eerste!
                </p>
              ) : (
                customTexts.map(text => (
                  <div
                    key={text}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="min-w-0">
                      <span className="font-black text-teal-700 mr-1">Ik heb nog nooit</span>
                      <span className="font-bold text-slate-800">{text}</span>
                    </span>
                    <button
                      onClick={() => handleRemoveCustom(text)}
                      aria-label="Verwijderen"
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowCustomModal(false)}
              className="mt-3 w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm cursor-pointer"
            >
              Klaar
            </button>
          </div>
        </div>
      )}

      <ResetConfirmModal
        open={showResetConfirm}
        gameName="Ik heb nog nooit"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleBackToSetup}
      />
    </div>
  );
}

