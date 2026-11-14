import React, { useEffect, useRef, useState } from 'react';
import { Dices, Flame, Minus, Pickaxe, Play, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { shuffle, useGameReset, useSharedPlayers, vibrate } from '../Shared/hooks';
import { PlayerBadge, PlayerRoster, useAvatarLookup } from '../Shared/PlayerRoster';
import { ResetConfirmModal } from '../Shared/ResetConfirmModal';

type Phase = 'setup' | 'play' | 'finished';
type TurnStep = 'roll-x' | 'roll-y' | 'dynamite-hit' | 'guess' | 'mining' | 'result';
type ResourceType = 'gold' | 'coal';

interface MineTile {
  col: number; // 1..6 (X-as, links naar rechts)
  row: number; // 1..6 (Y-as, onder naar boven)
  resource: ResourceType;
  hasDynamite: boolean;
  mined: boolean;
  hits: number;
  maxHits: number;
}

interface PlayerStats {
  correct: number;
  wrong: number;
  dynamites: number;
}

const COLS = [1, 2, 3, 4, 5, 6] as const;
const ROWS_DESC = [6, 5, 4, 3, 2, 1] as const; // Y-as van boven (6) naar beneden (1)
const HITS_TO_MINE = 4;

function tileIndex(col: number, row: number): number {
  return (row - 1) * 6 + (col - 1);
}

function getTile(board: MineTile[], col: number, row: number): MineTile {
  return board[tileIndex(col, row)];
}

function createBoard(dynamiteCoords: Array<{ col: number; row: number }> = []): MineTile[] {
  const resources = shuffle<ResourceType>([
    ...Array<ResourceType>(18).fill('gold'),
    ...Array<ResourceType>(18).fill('coal'),
  ]);
  const dynamiteSet = new Set(dynamiteCoords.map(c => `${c.col},${c.row}`));

  const tiles: MineTile[] = [];
  for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= 6; col++) {
      const idx = tileIndex(col, row);
      tiles.push({
        col,
        row,
        resource: resources[idx],
        hasDynamite: dynamiteSet.has(`${col},${row}`),
        mined: false,
        hits: 0,
        maxHits: HITS_TO_MINE,
      });
    }
  }
  return tiles;
}

function createRandomDynamiteCoords(count: number): Array<{ col: number; row: number }> {
  const all: Array<{ col: number; row: number }> = [];
  for (let col = 1; col <= 6; col++) {
    for (let row = 1; row <= 6; row++) {
      all.push({ col, row });
    }
  }
  return shuffle(all).slice(0, count);
}

/**
 * Zoekt het doelvakje op (col, row).
 * Als (col, row) al gehakt is, schuift het vakje omhoog naar degene erboven (row + 1)
 * op de Y-as, en zoekt verder als de kolom vol zit.
 */
function resolveTargetCoord(
  board: MineTile[],
  startCol: number,
  startRow: number
): { col: number; row: number; shifted: boolean } | null {
  const direct = getTile(board, startCol, startRow);
  if (!direct.mined) {
    return { col: startCol, row: startRow, shifted: false };
  }

  // Eerst omhoog in dezelfde kolom (van startRow + 1 t/m 6, daarna vanaf 1 omhoog)
  for (let offset = 1; offset < 6; offset++) {
    const r = ((startRow - 1 + offset) % 6) + 1;
    if (!getTile(board, startCol, r).mined) {
      return { col: startCol, row: r, shifted: true };
    }
  }

  // Hele kolom al gehakt: pak het eerstvolgende ongehakte vakje in een volgende kolom
  for (let colOffset = 1; colOffset < 6; colOffset++) {
    const c = ((startCol - 1 + colOffset) % 6) + 1;
    for (let r = 1; r <= 6; r++) {
      if (!getTile(board, c, r).mined) {
        return { col: c, row: r, shifted: true };
      }
    }
  }

  return null;
}

/** Compacte goudmijn-dobbelsteen met stippen (1..6) */
function MineDie({
  value,
  rolling,
  label,
  accent,
  disabled,
  onClick,
}: {
  value: number;
  rolling: boolean;
  label: string;
  accent: 'gold' | 'sky' | 'idle';
  disabled?: boolean;
  onClick?: () => void;
}) {
  const pipMap: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const activePips = pipMap[value] ?? [4];

  const ringClass =
    accent === 'gold'
      ? 'border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-[0_6px_18px_rgba(245,158,11,0.35)]'
      : accent === 'sky'
        ? 'border-sky-400 bg-gradient-to-br from-sky-50 via-white to-sky-100 shadow-[0_6px_18px_rgba(56,189,248,0.3)]'
        : 'border-amber-700/70 bg-gradient-to-br from-stone-100 to-stone-200 shadow-md';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center gap-1.5 cursor-pointer disabled:cursor-default transition-transform active:scale-95 ${
        rolling ? 'animate-bounce' : ''
      }`}
    >
      <div
        className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-3 p-2.5 grid grid-cols-3 grid-rows-3 gap-1 place-items-center transition-all ${ringClass} ${
          rolling ? 'rotate-12 scale-105' : ''
        }`}
      >
        {Array.from({ length: 9 }, (_, idx) => (
          <span
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              activePips.includes(idx)
                ? value === 1
                  ? 'bg-red-600 scale-115 shadow-xs'
                  : 'bg-stone-900 shadow-xs'
                : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] font-black uppercase tracking-wider text-amber-200/90">
        {label}
      </span>
    </button>
  );
}

/** Scheurtjes in de rots tijdens het hakken */
function RockCracks({ stage }: { stage: number }) {
  if (stage <= 0) return null;
  return (
    <svg
      viewBox="0 0 40 40"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    >
      {stage >= 1 && (
        <path
          d="M 20 8 L 17 17 L 23 22"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      )}
      {stage >= 2 && (
        <path
          d="M 17 17 L 10 21 M 23 22 L 29 19 L 33 25"
          fill="none"
          stroke="#fde68a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      )}
      {stage >= 3 && (
        <path
          d="M 23 22 L 19 32 M 13 11 L 17 17 M 29 19 L 27 11"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/** Goudklompje / Kool icoon voor uitgehakte vakjes */
function ResourceIcon({ type, compact = false }: { type: ResourceType; compact?: boolean }) {
  if (type === 'gold') {
    return (
      <svg
        viewBox="0 0 36 36"
        className={compact ? 'w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_2px_4px_rgba(245,158,11,0.65)]' : 'w-12 h-12 drop-shadow-md'}
      >
        <polygon
          points="8,24 6,15 13,9 24,10 30,17 27,26 16,28"
          fill="url(#goldNuggetGrad)"
          stroke="#fef08a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon points="13,11 22,12 18,18 11,16" fill="#fef9c3" opacity="0.65" />
        <circle cx="25" cy="12" r="1.8" fill="#ffffff" />
        <defs>
          <linearGradient id="goldNuggetGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 36 36"
      className={compact ? 'w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'w-12 h-12 drop-shadow-md'}
    >
      <polygon
        points="9,25 6,17 12,10 23,9 30,16 28,25 18,28"
        fill="url(#coalChunkGrad)"
        stroke="#64748b"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <polygon points="12,12 20,12 16,18 10,17" fill="#94a3b8" opacity="0.32" />
      <polygon points="22,16 27,17 25,23 19,22" fill="#0f172a" opacity="0.7" />
      <defs>
        <linearGradient id="coalChunkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="55%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Dynamiet-staafje (shotje) voor op de mijnkaart */
function DynamiteBadge({ pulsing = false }: { pulsing?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center pointer-events-none select-none ${
        pulsing ? 'animate-bounce' : ''
      }`}
      title="Dynamiet (Shotje)"
    >
      <svg viewBox="0 0 28 28" className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
        {/* Lont */}
        <path d="M 16 7 Q 19 3 22 4" fill="none" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="22.5" cy="4" r="2.2" fill="#f97316" />
        <circle cx="22.5" cy="4" r="1.1" fill="#fef08a" />
        {/* Dynamiet staven */}
        <g transform="rotate(-22 14 16)">
          <rect x="7" y="9" width="4.5" height="15" rx="1.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.9" />
          <rect x="11.5" y="8" width="5" height="16" rx="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.9" />
          <rect x="16.5" y="9" width="4.5" height="15" rx="1.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.9" />
          <rect x="6.5" y="13.5" width="15" height="3.2" rx="0.6" fill="#1e293b" />
          <rect x="6.5" y="19" width="15" height="2.4" rx="0.6" fill="#1e293b" />
        </g>
      </svg>
    </span>
  );
}

/** Ruwe rotswand-textuur per vakje zodat het grid op een echte stenen rotswand lijkt */
function RockTileSurface({
  col,
  row,
  highlighted = false,
  relocate = false,
}: {
  col: number;
  row: number;
  highlighted?: boolean;
  relocate?: boolean;
}) {
  const variant = (col * 5 + row * 11) % 4;
  const baseLight = relocate
    ? '#7c2d12'
    : highlighted
      ? '#78552b'
      : variant === 0
        ? '#57534e'
        : variant === 1
          ? '#4f4a45'
          : variant === 2
            ? '#5c5752'
            : '#494540';
  const baseMid = relocate
    ? '#431407'
    : highlighted
      ? '#4d3519'
      : variant === 0
        ? '#3f3b37'
        : variant === 1
          ? '#383430'
          : variant === 2
            ? '#44403c'
            : '#35312e';
  const baseDark = relocate ? '#290d05' : highlighted ? '#2d1e0d' : '#211e1c';
  const crackColor = highlighted ? '#b48a52' : '#181513';
  const highlightEdge = highlighted ? '#d6b07a' : '#78716c';

  return (
    <svg
      viewBox="0 0 40 40"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {/* Rotsblok ondergrond */}
      <rect x="0" y="0" width="40" height="40" fill={baseMid} />
      {/* Gelaagde steenfacetten per variant */}
      {variant === 0 && (
        <>
          <polygon points="0,0 26,0 19,14 0,18" fill={baseLight} opacity="0.72" />
          <polygon points="26,0 40,0 40,22 22,18 19,14" fill={baseMid} />
          <polygon points="0,18 19,14 27,26 15,40 0,40" fill={baseDark} opacity="0.55" />
          <polygon points="22,18 40,22 40,40 15,40 27,26" fill={baseDark} opacity="0.82" />
          <polyline
            points="0,18 19,14 26,0 M19,14 27,26 40,22 M27,26 15,40"
            fill="none"
            stroke={crackColor}
            strokeWidth="1.2"
            opacity="0.75"
          />
        </>
      )}
      {variant === 1 && (
        <>
          <polygon points="0,0 18,0 24,13 8,21 0,15" fill={baseLight} opacity="0.68" />
          <polygon points="18,0 40,0 40,16 24,13" fill={baseLight} opacity="0.4" />
          <polygon points="8,21 24,13 40,16 40,40 21,40 13,29" fill={baseDark} opacity="0.65" />
          <polygon points="0,15 8,21 13,29 21,40 0,40" fill={baseDark} opacity="0.85" />
          <polyline
            points="18,0 24,13 40,16 M24,13 8,21 0,15 M8,21 13,29 21,40"
            fill="none"
            stroke={crackColor}
            strokeWidth="1.2"
            opacity="0.75"
          />
        </>
      )}
      {variant === 2 && (
        <>
          <polygon points="0,0 32,0 25,11 12,13 0,24" fill={baseLight} opacity="0.7" />
          <polygon points="32,0 40,0 40,28 29,24 25,11" fill={baseDark} opacity="0.52" />
          <polygon points="12,13 25,11 29,24 18,31 0,24" fill={baseMid} />
          <polygon points="0,24 18,31 29,24 40,28 40,40 0,40" fill={baseDark} opacity="0.84" />
          <polyline
            points="0,24 12,13 25,11 32,0 M25,11 29,24 40,28 M29,24 18,31 0,24"
            fill="none"
            stroke={crackColor}
            strokeWidth="1.2"
            opacity="0.75"
          />
        </>
      )}
      {variant === 3 && (
        <>
          <polygon points="0,0 20,0 14,17 0,13" fill={baseLight} opacity="0.75" />
          <polygon points="20,0 40,0 40,19 28,24 14,17" fill={baseLight} opacity="0.38" />
          <polygon points="0,13 14,17 28,24 22,40 0,40" fill={baseDark} opacity="0.62" />
          <polygon points="28,24 40,19 40,40 22,40" fill={baseDark} opacity="0.86" />
          <polyline
            points="20,0 14,17 0,13 M14,17 28,24 40,19 M28,24 22,40"
            fill="none"
            stroke={crackColor}
            strokeWidth="1.2"
            opacity="0.75"
          />
        </>
      )}
      {/* Subtiele lichtrand & steenspikkels */}
      <polyline points="1,28 1,1 28,1" fill="none" stroke={highlightEdge} strokeWidth="1.2" opacity="0.45" />
      <circle cx={9 + variant * 5} cy={8 + variant * 2} r="0.9" fill={highlightEdge} opacity="0.5" />
      <circle cx={29 - variant * 3} cy={29 - variant * 2} r="1" fill={crackColor} opacity="0.6" />
    </svg>
  );
}

export function GoudmijnenApp() {
  const [players, setPlayers] = useSharedPlayers();
  const getAvatar = useAvatarLookup(players.join('|'));

  const [phase, setPhase] = useState<Phase>('setup');
  const [dynamiteTargetCount, setDynamiteTargetCount] = useState<number>(4);
  const [setupDynamites, setSetupDynamites] = useState<Array<{ col: number; row: number }>>(() =>
    createRandomDynamiteCoords(4)
  );

  const [board, setBoard] = useState<MineTile[]>(() => createBoard());
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnStep, setTurnStep] = useState<TurnStep>('roll-x');

  const [rolledCol, setRolledCol] = useState<number | null>(null);
  const [rolledRow, setRolledRow] = useState<number | null>(null);
  const [targetCoord, setTargetCoord] = useState<{ col: number; row: number } | null>(null);
  const [shiftedFrom, setShiftedFrom] = useState<{ col: number; row: number } | null>(null);

  const [dieFace, setDieFace] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const [guess, setGuess] = useState<ResourceType | null>(null);
  const [lastOutcome, setLastOutcome] = useState<'correct' | 'wrong' | null>(null);
  const [hackShake, setHackShake] = useState(false);
  const [sparksKey, setSparksKey] = useState(0);

  const [stats, setStats] = useState<Record<string, PlayerStats>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const timersRef = useRef<number[]>([]);

  useGameReset('GOUDMIJNEN', () => setShowResetConfirm(true));

  const clearTimers = () => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const currentPlayer = players.length > 0 ? players[turnIndex % players.length] : null;
  const minedCount = board.filter(t => t.mined).length;
  const goldFoundCount = board.filter(t => t.mined && t.resource === 'gold').length;
  const coalFoundCount = board.filter(t => t.mined && t.resource === 'coal').length;
  const dynamiteCount = board.filter(t => !t.mined && t.hasDynamite).length;

  const targetTile = targetCoord ? getTile(board, targetCoord.col, targetCoord.row) : null;

  const toggleSetupDynamite = (col: number, row: number) => {
    sounds.playTick(720);
    vibrate(15);
    setSetupDynamites(prev => {
      const exists = prev.some(c => c.col === col && c.row === row);
      const next = exists
        ? prev.filter(c => !(c.col === col && c.row === row))
        : [...prev, { col, row }];
      setDynamiteTargetCount(next.length);
      return next;
    });
  };

  const adjustDynamitesCount = (nextCountRaw: number) => {
    const nextCount = Math.max(0, Math.min(36, nextCountRaw));
    sounds.playTick(760);
    vibrate(15);
    setDynamiteTargetCount(nextCount);
    setSetupDynamites(prev => {
      if (nextCount === prev.length) return prev;
      if (nextCount < prev.length) {
        return prev.slice(0, nextCount);
      }
      const existing = new Set(prev.map(c => `${c.col},${c.row}`));
      const available: Array<{ col: number; row: number }> = [];
      for (let c = 1; c <= 6; c++) {
        for (let r = 1; r <= 6; r++) {
          if (!existing.has(`${c},${r}`)) {
            available.push({ col: c, row: r });
          }
        }
      }
      const toAdd = shuffle(available).slice(0, nextCount - prev.length);
      return [...prev, ...toAdd];
    });
  };

  const handleStartGame = () => {
    clearTimers();
    setBoard(createBoard(setupDynamites));
    setTurnIndex(0);
    setTurnStep('roll-x');
    setRolledCol(null);
    setRolledRow(null);
    setTargetCoord(null);
    setShiftedFrom(null);
    setDieFace(1);
    setIsRolling(false);
    setGuess(null);
    setLastOutcome(null);
    setStats({});
    setPhase('play');
    sounds.playWiiSelect();
  };

  const handleRollCol = () => {
    if (isRolling || turnStep !== 'roll-x') return;
    setIsRolling(true);
    setShiftedFrom(null);
    sounds.playDiceRoll();
    vibrate(30);

    const finalCol = Math.floor(Math.random() * 6) + 1;
    let ticks = 0;
    const interval = window.setInterval(() => {
      ticks++;
      setDieFace(Math.floor(Math.random() * 6) + 1);
      if (ticks >= 7) {
        window.clearInterval(interval);
        setDieFace(finalCol);
        setRolledCol(finalCol);
        setIsRolling(false);
        sounds.playTick(880);
        setTurnStep('roll-y');
      }
    }, 65);
    timersRef.current.push(interval);
  };

  const handleRollRow = () => {
    if (isRolling || turnStep !== 'roll-y' || rolledCol === null) return;
    setIsRolling(true);
    sounds.playDiceRoll();
    vibrate(30);

    const finalRow = Math.floor(Math.random() * 6) + 1;
    let ticks = 0;
    const interval = window.setInterval(() => {
      ticks++;
      setDieFace(Math.floor(Math.random() * 6) + 1);
      if (ticks >= 7) {
        window.clearInterval(interval);
        setDieFace(finalRow);
        setRolledRow(finalRow);
        setIsRolling(false);

        const resolved = resolveTargetCoord(board, rolledCol, finalRow);
        if (!resolved) {
          setPhase('finished');
          return;
        }

        setTargetCoord({ col: resolved.col, row: resolved.row });
        setShiftedFrom(resolved.shifted ? { col: rolledCol, row: finalRow } : null);

        const landed = getTile(board, resolved.col, resolved.row);
        if (landed.hasDynamite) {
          sounds.playExplosion();
          vibrate([160, 70, 160]);
          if (currentPlayer) {
            setStats(prev => {
              const cur = prev[currentPlayer] ?? { correct: 0, wrong: 0, dynamites: 0 };
              return {
                ...prev,
                [currentPlayer]: { ...cur, dynamites: cur.dynamites + 1 },
              };
            });
          }
          setTurnStep('dynamite-hit');
        } else {
          sounds.playTick(960);
          setTurnStep('guess');
        }
      }
    }, 65);
    timersRef.current.push(interval);
  };

  const otherAvailableDynamiteTargets = targetCoord
    ? board.filter(
        t =>
          !t.mined &&
          !t.hasDynamite &&
          !(t.col === targetCoord.col && t.row === targetCoord.row)
      )
    : [];

  const handleRelocateDynamite = (destCol: number, destRow: number) => {
    if (turnStep !== 'dynamite-hit' || !targetCoord) return;
    const dest = getTile(board, destCol, destRow);
    if (
      dest.mined ||
      dest.hasDynamite ||
      (destCol === targetCoord.col && destRow === targetCoord.row)
    ) {
      return;
    }

    sounds.playTick(760);
    vibrate(35);

    setBoard(prev =>
      prev.map(t => {
        if (t.col === targetCoord.col && t.row === targetCoord.row) {
          return { ...t, hasDynamite: false };
        }
        if (t.col === destCol && t.row === destRow) {
          return { ...t, hasDynamite: true };
        }
        return t;
      })
    );
    setTurnStep('guess');
  };

  const handleSkipRelocate = () => {
    if (turnStep !== 'dynamite-hit' || !targetCoord) return;
    setBoard(prev =>
      prev.map(t =>
        t.col === targetCoord.col && t.row === targetCoord.row
          ? { ...t, hasDynamite: false }
          : t
      )
    );
    setTurnStep('guess');
  };

  const handleSelectGuess = (choice: ResourceType) => {
    if (turnStep !== 'guess') return;
    sounds.playTick(choice === 'gold' ? 920 : 620);
    vibrate(25);
    setGuess(choice);
    setTurnStep('mining');
  };

  const handleHackTile = () => {
    if (turnStep !== 'mining' || !targetCoord || !targetTile || !guess) return;

    const nextHits = targetTile.hits + 1;
    const isBreak = nextHits >= targetTile.maxHits;

    sounds.playPickaxeHit(isBreak);
    vibrate(isBreak ? [60, 35, 80] : 28);
    setHackShake(true);
    setSparksKey(prev => prev + 1);
    timersRef.current.push(window.setTimeout(() => setHackShake(false), 260));

    setBoard(prev =>
      prev.map(t => {
        if (t.col === targetCoord.col && t.row === targetCoord.row) {
          return {
            ...t,
            hits: nextHits,
            mined: isBreak,
          };
        }
        return t;
      })
    );

    if (isBreak) {
      const isCorrect = guess === targetTile.resource;
      setLastOutcome(isCorrect ? 'correct' : 'wrong');

      if (currentPlayer) {
        setStats(prev => {
          const cur = prev[currentPlayer] ?? { correct: 0, wrong: 0, dynamites: 0 };
          return {
            ...prev,
            [currentPlayer]: {
              ...cur,
              correct: cur.correct + (isCorrect ? 1 : 0),
              wrong: cur.wrong + (isCorrect ? 0 : 1),
            },
          };
        });
      }

      timersRef.current.push(
        window.setTimeout(() => {
          if (isCorrect) {
            sounds.playCorrectDing();
          } else {
            sounds.playBuzzer();
            vibrate([120, 60, 120]);
          }
          setTurnStep('result');
        }, 160)
      );
    }
  };

  const handleNextAfterResult = () => {
    if (minedCount >= 36) {
      sounds.playFanfare();
      setPhase('finished');
      return;
    }

    if (lastOutcome === 'correct') {
      setTurnIndex(prev => prev + 1);
    }
    // Bij fout raden blijft dezelfde speler aan de beurt en moet opnieuw dobbelen!
    setRolledCol(null);
    setRolledRow(null);
    setTargetCoord(null);
    setShiftedFrom(null);
    setGuess(null);
    setLastOutcome(null);
    setTurnStep('roll-x');
    sounds.playTick(700);
  };

  const handleResetConfirm = () => {
    clearTimers();
    setShowResetConfirm(false);
    setPhase('setup');
    sounds.playTick(500);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-3 pb-10 select-none text-amber-50">
      {/* =====================================================================
          FASE 1: INSTELLEN & DYNAMIEET (SHOTJES) PLAATSEN
          ===================================================================== */}
      {phase === 'setup' && (
        <div className="space-y-3.5 animate-in fade-in">
          <PlayerRoster
            players={players}
            onChange={setPlayers}
            max={12}
            hint="Optioneel"
            accentButtonClass="bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-700"
          />

          {/* Interactieve 6x6 Mijnkaart voor Shotjes / Dynamiet */}
          <div className="rounded-3xl border-4 border-stone-600/80 bg-gradient-to-b from-[#2c2825] via-[#1d1a18] to-[#12100e] p-3.5 sm:p-4 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Shotjes (Dynamiet) plaatsen
                </h3>
                <p className="text-[11px] font-semibold text-stone-300/80">
                  Kies het aantal of tik op vakjes op de rotswand.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Aanpasbaar aantal dynamietjes */}
                <div className="inline-flex items-center rounded-xl bg-stone-900/90 border border-stone-600/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => adjustDynamitesCount(dynamiteTargetCount - 1)}
                    disabled={dynamiteTargetCount <= 0}
                    aria-label="Minder dynamietjes"
                    className="w-7 h-7 rounded-lg hover:bg-stone-700 text-stone-200 flex items-center justify-center cursor-pointer active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-black text-orange-300 tabular-nums min-w-[3.2rem] text-center">
                    {setupDynamites.length}× 🧨
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustDynamitesCount(dynamiteTargetCount + 1)}
                    disabled={dynamiteTargetCount >= 36}
                    aria-label="Meer dynamietjes"
                    className="w-7 h-7 rounded-lg hover:bg-stone-700 text-stone-200 flex items-center justify-center cursor-pointer active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playDiceRoll();
                    const count = dynamiteTargetCount > 0 ? dynamiteTargetCount : 4;
                    if (dynamiteTargetCount === 0) setDynamiteTargetCount(4);
                    setSetupDynamites(createRandomDynamiteCoords(count));
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-[11px] font-black flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Dices className="w-3.5 h-3.5" />
                  Random {dynamiteTargetCount > 0 ? dynamiteTargetCount : 4}×
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick(400);
                    setSetupDynamites([]);
                    setDynamiteTargetCount(0);
                  }}
                  disabled={setupDynamites.length === 0}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 text-[11px] font-black flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Wis
                </button>
              </div>
            </div>

            {/* 6x6 Setup Grid met XY Assenstelsel */}
            <div className="max-w-[320px] mx-auto">
              <div className="flex items-stretch gap-1.5">
                {/* Y-as (6 -> 1) */}
                <div className="flex flex-col justify-between py-1 text-[10px] font-black text-amber-400/80 w-4 text-center shrink-0">
                  {ROWS_DESC.map(r => (
                    <span key={r} className="flex-1 flex items-center justify-center">
                      {r}
                    </span>
                  ))}
                </div>
                {/* Rotswand Vakjes */}
                <div className="grid grid-cols-6 gap-1 flex-1 p-1.5 rounded-xl bg-[#0e0c0a] border-2 border-stone-700/80 shadow-inner">
                  {ROWS_DESC.map(row =>
                    COLS.map(col => {
                      const hasDyn = setupDynamites.some(c => c.col === col && c.row === row);
                      return (
                        <button
                          key={`${col}-${row}`}
                          type="button"
                          onClick={() => toggleSetupDynamite(col, row)}
                          aria-label={`Vakje (${col}, ${row})`}
                          className={`aspect-square rounded-md border-2 relative overflow-hidden flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                            hasDyn
                              ? 'border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                              : 'border-t-stone-500/70 border-l-stone-500/60 border-r-stone-950 border-b-stone-950 hover:border-amber-400/70'
                          }`}
                        >
                          <RockTileSurface col={col} row={row} relocate={hasDyn} />
                          {hasDyn && (
                            <div className="relative z-10">
                              <DynamiteBadge />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              {/* X-as (1 -> 6) */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-4 text-[9px] font-black text-amber-400/60 text-center">Y/X</span>
                <div className="grid grid-cols-6 gap-1 flex-1 px-1.5 text-[10px] font-black text-amber-400/80 text-center">
                  {COLS.map(c => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-amber-400 text-slate-950 font-black text-base shadow-[0_6px_20px_rgba(245,158,11,0.45)] border-2 border-amber-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Mijn Betreden!</span>
          </button>
        </div>
      )}

      {/* =====================================================================
          FASE 2: ACTIEVE GOUDMIJN
          ===================================================================== */}
      {phase === 'play' && (
        <div className="space-y-3 animate-in fade-in">
          {/* Beurt & Mijn-voortgang balk */}
          <div className="rounded-2xl border-2 border-amber-700/70 bg-[#1d120a]/90 px-3 py-2 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              {currentPlayer ? (
                <>
                  <PlayerBadge name={currentPlayer} avatar={getAvatar(currentPlayer)} size={32} />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 block leading-none">
                      Aan de beurt
                    </span>
                    <span className="text-sm font-black text-white truncate block">
                      {currentPlayer}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl">⛏️</span>
                  <span className="text-sm font-black text-amber-100">Mijnwerker</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] font-black shrink-0">
              <span className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200">
                🪙 {goldFoundCount}
              </span>
              <span className="px-2 py-1 rounded-lg bg-stone-700/70 border border-stone-500/50 text-stone-200">
                🪨 {coalFoundCount}
              </span>
              <span className="px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-400/40 text-orange-200">
                🧨 {dynamiteCount}
              </span>
            </div>
          </div>

          {/* 6x6 XY Mijnveld als rotswand */}
          <div className="rounded-3xl border-4 border-stone-600/80 bg-gradient-to-b from-[#2b2724] via-[#1b1816] to-[#100e0c] p-3 sm:p-4 shadow-2xl relative overflow-hidden">
            {/* Subtiele lantaarngloed op de rotswand */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-24 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

            <div className="max-w-[350px] sm:max-w-[385px] mx-auto relative z-10">
              <div className="flex items-stretch gap-1.5">
                {/* Y-as labels (Rij 6 boven -> 1 onder) */}
                <div className="flex flex-col justify-between py-1 w-6 shrink-0">
                  {ROWS_DESC.map(r => {
                    const isRowActive =
                      (turnStep !== 'roll-x' && rolledRow === r) ||
                      targetCoord?.row === r;
                    return (
                      <div
                        key={r}
                        className={`flex-1 flex items-center justify-center rounded-md text-xs font-black transition-all ${
                          isRowActive
                            ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.7)] scale-105'
                            : 'text-amber-400/75'
                        }`}
                      >
                        {r}
                      </div>
                    );
                  })}
                </div>

                {/* 6x6 Rotswand Grid */}
                <div className="grid grid-cols-6 gap-1 flex-1 p-1.5 rounded-xl bg-[#0d0b09] border-2 border-stone-700/85 shadow-inner">
                  {ROWS_DESC.map(row =>
                    COLS.map(col => {
                      const tile = getTile(board, col, row);
                      const isColMatch = rolledCol === col && turnStep !== 'roll-x';
                      const isRowMatch = rolledRow === row && turnStep !== 'roll-x' && turnStep !== 'roll-y';
                      const isTarget =
                        targetCoord?.col === col && targetCoord?.row === row;
                      const isRelocateOption =
                        turnStep === 'dynamite-hit' &&
                        !tile.mined &&
                        !tile.hasDynamite &&
                        !isTarget;
                      const isCanMineTap = turnStep === 'mining' && isTarget;

                      let cellStyle =
                        'border-t-stone-500/70 border-l-stone-500/55 border-r-stone-950 border-b-stone-950 shadow-inner';

                      if (tile.mined) {
                        cellStyle =
                          tile.resource === 'gold'
                            ? 'bg-gradient-to-br from-[#23190b] via-[#151008] to-[#0a0805] border-amber-500/70 shadow-[inset_0_3px_8px_rgba(0,0,0,0.85)]'
                            : 'bg-gradient-to-br from-[#16181c] via-[#0e0f12] to-[#060708] border-stone-700/80 shadow-[inset_0_3px_8px_rgba(0,0,0,0.9)]';
                      } else if (isTarget) {
                        cellStyle =
                          'border-yellow-300 ring-2 ring-yellow-300/90 shadow-[0_0_16px_rgba(251,191,36,0.75)] scale-[1.04] z-10';
                      } else if (isRelocateOption) {
                        cellStyle =
                          'border-orange-400/90 border-dashed hover:border-orange-300 animate-pulse cursor-pointer';
                      } else if (isColMatch || isRowMatch) {
                        cellStyle =
                          'border-amber-400/85 shadow-[0_0_8px_rgba(245,158,11,0.35)]';
                      }

                      return (
                        <button
                          key={`${col}-${row}`}
                          type="button"
                          onClick={() => {
                            if (isRelocateOption) {
                              handleRelocateDynamite(col, row);
                            } else if (isCanMineTap) {
                              handleHackTile();
                            }
                          }}
                          disabled={!isRelocateOption && !isCanMineTap}
                          aria-label={`Vakje X${col} Y${row}`}
                          className={`aspect-square rounded-md border-2 relative flex items-center justify-center overflow-hidden transition-all duration-150 ${cellStyle} ${
                            isCanMineTap && hackShake ? 'animate-shake-x' : ''
                          } ${isCanMineTap ? 'cursor-pointer active:scale-90' : ''}`}
                        >
                          {/* Uitgehakt: diepe rotsholte met Goud of Kool */}
                          {tile.mined ? (
                            <div className="animate-pop-in flex items-center justify-center">
                              <ResourceIcon type={tile.resource} compact />
                            </div>
                          ) : (
                            <>
                              {/* Rotswand steenblok */}
                              <RockTileSurface
                                col={col}
                                row={row}
                                highlighted={isTarget || isColMatch || isRowMatch}
                                relocate={isRelocateOption}
                              />

                              {/* Scheuren tijdens het hakken */}
                              <RockCracks stage={tile.hits} />

                              {/* Dynamiet of pikhouweel (geen cijfers meer in vakjes) */}
                              {tile.hasDynamite ? (
                                <div className="relative z-10">
                                  <DynamiteBadge pulsing={isTarget && turnStep === 'dynamite-hit'} />
                                </div>
                              ) : (
                                isTarget &&
                                turnStep === 'mining' && (
                                  <span className="text-base sm:text-lg drop-shadow animate-bounce z-20">
                                    ⛏️
                                  </span>
                                )
                              )}
                            </>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* X-as labels (Kolom 1 -> 6) */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-6 text-[9px] font-black text-amber-400/70 text-center">
                  Y\X
                </span>
                <div className="grid grid-cols-6 gap-1 flex-1 px-1.5">
                  {COLS.map(c => {
                    const isColActive =
                      (turnStep !== 'roll-x' && rolledCol === c) ||
                      targetCoord?.col === c;
                    return (
                      <div
                        key={c}
                        className={`h-5 flex items-center justify-center rounded-md text-xs font-black transition-all ${
                          isColActive
                            ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.7)] scale-105'
                            : 'text-amber-400/75'
                        }`}
                      >
                        {c}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Doorschuif melding als (X, Y) al gehakt was */}
          {shiftedFrom && targetCoord && (
            <div className="rounded-2xl bg-sky-500/20 border-2 border-sky-400/70 px-3 py-2 text-xs font-bold text-sky-100 text-center animate-in fade-in">
              ⬆️ Vakje <strong>({shiftedFrom.col}, {shiftedFrom.row})</strong> was al gehakt! Doorgeschoven naar boven:{' '}
              <strong className="text-amber-300">({targetCoord.col}, {targetCoord.row})</strong>
            </div>
          )}

          {/* =================================================================
              ACTIEPANEEL PER BEURTSTAP
              ================================================================= */}
          <div className="rounded-3xl border-4 border-amber-700/75 bg-gradient-to-b from-[#2b1a0e] to-[#170e07] p-4 shadow-2xl">
            {/* STAP 1: DOBBEL VOOR KOLOM (X) */}
            {turnStep === 'roll-x' && (
              <div className="flex flex-col items-center text-center gap-3 animate-in fade-in">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block">
                    Stap 1 van 3 • X-as →
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Dobbel voor de Kolom (X)
                  </h2>
                </div>

                <MineDie
                  value={dieFace}
                  rolling={isRolling}
                  label={isRolling ? 'Rollen...' : 'Tik om te gooien'}
                  accent="gold"
                  disabled={isRolling}
                  onClick={handleRollCol}
                />

                <button
                  type="button"
                  onClick={handleRollCol}
                  disabled={isRolling}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg border-2 border-amber-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  <Dices className="w-5 h-5" />
                  <span>{isRolling ? 'Dobbelen...' : 'Gooi voor Kolom (X)'}</span>
                </button>
              </div>
            )}

            {/* STAP 2: DOBBEL VOOR RIJ (Y) */}
            {turnStep === 'roll-y' && (
              <div className="flex flex-col items-center text-center gap-3 animate-in fade-in">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-sky-300 block">
                    Stap 2 van 3 • Kolom X = {rolledCol}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Dobbel nu voor de Rij (Y ↑)
                  </h2>
                </div>

                <MineDie
                  value={dieFace}
                  rolling={isRolling}
                  label={isRolling ? 'Rollen...' : `Kolom ${rolledCol} staat vast`}
                  accent="sky"
                  disabled={isRolling}
                  onClick={handleRollRow}
                />

                <button
                  type="button"
                  onClick={handleRollRow}
                  disabled={isRolling}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 text-slate-950 font-black text-sm shadow-lg border-2 border-sky-100 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  <Dices className="w-5 h-5" />
                  <span>{isRolling ? 'Dobbelen...' : 'Gooi voor Rij (Y)'}</span>
                </button>
              </div>
            )}

            {/* STAP 2B: DYNAMIEET GERAKT! DRINKEN & VERPLAATSEN */}
            {turnStep === 'dynamite-hit' && targetCoord && (
              <div className="flex flex-col items-center text-center gap-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-2xl bg-red-600/30 border-2 border-orange-400 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.55)]">
                  <DynamiteBadge pulsing />
                </div>
                <div>
                  <h2 className="text-xl font-black text-orange-300">
                    BOEM! Dynamiet op ({targetCoord.col}, {targetCoord.row})!
                  </h2>
                  <p className="text-sm font-black text-white mt-1">
                    🍺 Drink je shotje / neem een flinke slok!
                  </p>
                </div>

                {otherAvailableDynamiteTargets.length > 0 ? (
                  <div className="w-full rounded-2xl bg-orange-950/60 border-2 border-orange-400/60 px-3 py-2.5 text-xs font-bold text-orange-100">
                    👆 Tik nu op een <strong>oranje oplichtend vakje</strong> op de kaart hierboven om het dynamiet ergens anders neer te leggen.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSkipRelocate}
                    className="w-full py-3 rounded-2xl bg-orange-500 text-slate-950 font-black text-sm cursor-pointer active:scale-95"
                  >
                    Laatste vakje — ga verder →
                  </button>
                )}
              </div>
            )}

            {/* STAP 3A: RAAD GOUD OF KOOL */}
            {turnStep === 'guess' && targetCoord && (
              <div className="space-y-3 text-center animate-in fade-in">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block">
                    Doelvakje ({targetCoord.col}, {targetCoord.row})
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Zit er Goud of Kool onder deze rots?
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectGuess('gold')}
                    className="py-4 px-3 rounded-2xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-black border-2 border-amber-200 shadow-lg flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <ResourceIcon type="gold" />
                    <span className="text-base tracking-tight">GOUD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectGuess('coal')}
                    className="py-4 px-3 rounded-2xl bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900 text-white font-black border-2 border-slate-400 shadow-lg flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <ResourceIcon type="coal" />
                    <span className="text-base tracking-tight">KOOL</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAP 3B: HAKKEN TOT DE ROTS OPENBREEKT */}
            {turnStep === 'mining' && targetCoord && targetTile && guess && (
              <div className="flex flex-col items-center text-center gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-black">
                  <span className="px-2.5 py-1 rounded-full bg-stone-800 border border-stone-600 text-amber-200">
                    Vakje ({targetCoord.col}, {targetCoord.row})
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full border ${
                      guess === 'gold'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-700/70 border-slate-400 text-slate-100'
                    }`}
                  >
                    Gok: {guess === 'gold' ? '🪙 Goud' : '🪨 Kool'}
                  </span>
                </div>

                {/* Voortgangsbalk van het hakken */}
                <div className="w-full max-w-xs space-y-1">
                  <div className="h-3 rounded-full bg-stone-900 border border-stone-700 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-150"
                      style={{ width: `${(targetTile.hits / targetTile.maxHits) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-amber-200/80 block">
                    Hakken: nog {targetTile.maxHits - targetTile.hits}× slaan!
                  </span>
                </div>

                {/* Grote Hak-knop */}
                <button
                  type="button"
                  onClick={handleHackTile}
                  className={`relative w-full py-4 rounded-2xl bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-base shadow-[0_6px_0_#78350f,0_10px_20px_rgba(0,0,0,0.45)] border-2 border-amber-300 flex items-center justify-center gap-2.5 cursor-pointer active:translate-y-1 active:shadow-[0_2px_0_#78350f] transition-all ${
                    hackShake ? 'animate-shake-x' : ''
                  }`}
                >
                  <Pickaxe key={sparksKey} className="w-6 h-6 animate-bounce" />
                  <span>HAK DE ROTS OPEN!</span>
                  {sparksKey > 0 && (
                    <Sparkles className="w-5 h-5 text-yellow-100 animate-ping" />
                  )}
                </button>
              </div>
            )}

            {/* STAP 4: UITSLAG */}
            {turnStep === 'result' && targetTile && lastOutcome && (
              <div className="flex flex-col items-center text-center gap-3 animate-in zoom-in-95">
                <div
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shadow-lg ${
                    targetTile.resource === 'gold'
                      ? 'bg-amber-500/20 border-amber-400'
                      : 'bg-slate-800 border-slate-500'
                  }`}
                >
                  <ResourceIcon type={targetTile.resource} />
                </div>

                {lastOutcome === 'correct' ? (
                  <div>
                    <h2 className="text-xl font-black text-emerald-300">
                      GOED GERADEN! Het is {targetTile.resource === 'gold' ? 'GOUD' : 'KOOL'}!
                    </h2>
                    <p className="text-xs font-bold text-amber-100/80 mt-0.5">
                      De beurt gaat door naar de volgende speler.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-black text-rose-400">
                      FOUT! Het was {targetTile.resource === 'gold' ? 'GOUD' : 'KOOL'}!
                    </h2>
                    <p className="text-xs font-bold text-amber-100/80 mt-0.5">
                      Helaas — jij moet nog een keer dobbelen!
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextAfterResult}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg border-2 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all ${
                    lastOutcome === 'correct'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 border-emerald-200'
                      : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white border-rose-200'
                  }`}
                >
                  {minedCount >= 36 ? (
                    <span>Bekijk Eindstand 🏆</span>
                  ) : lastOutcome === 'correct' ? (
                    <span>Volgende speler →</span>
                  ) : (
                    <>
                      <Dices className="w-4 h-4" />
                      <span>Nog een keer dobbelen</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          FASE 3: MIJN VOLLEDIG LEEGGEHAKT
          ===================================================================== */}
      {phase === 'finished' && (
        <div className="rounded-3xl border-4 border-amber-400 bg-gradient-to-b from-[#2b1a0e] to-[#140c06] p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
          <div className="text-5xl">🏆⛏️</div>
          <div>
            <h2 className="text-2xl font-black text-amber-300">Mijn Helemaal Leeg!</h2>
            <p className="text-xs font-bold text-amber-100/75 mt-1">
              Alle 36 vakjes zijn opengehakt: {goldFoundCount}× Goud &amp; {coalFoundCount}× Kool.
            </p>
          </div>

          {Object.keys(stats).length > 0 && (
            <div className="space-y-1.5 text-left">
              {Object.entries(stats).map(([name, s]) => (
                <div
                  key={name}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/30 border border-amber-800/60 text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <PlayerBadge name={name} avatar={getAvatar(name)} size={24} />
                    <span className="text-white">{name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <span className="text-emerald-300">✓ {s.correct}</span>
                    <span className="text-rose-300">✗ {s.wrong}</span>
                    <span className="text-orange-300">🧨 {s.dynamites}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setPhase('setup')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg border-2 border-amber-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Nieuwe Goudmijn Starten</span>
          </button>
        </div>
      )}

      <ResetConfirmModal
        open={showResetConfirm}
        gameName="Goudmijnen"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
}
