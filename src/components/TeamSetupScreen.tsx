import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  X,
  Shuffle,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Sparkles,
  Dices,
  RotateCcw,
  Pencil,
  Plus,
  Trash2,
  Palette,
  Check,
} from 'lucide-react';
import { Player, Team } from '../types';
import { sounds } from '../utils/audio';
import { loadRememberedPlayers, saveRememberedPlayers } from '../utils/storage';
import { PlayerPickerDropdown } from './MiiMaker/PlayerPickerDropdown';

interface TeamSetupScreenProps {
  initialPlayers: Player[];
  initialTeams?: Team[];
  onBackToHome: () => void;
  onConfirmTeams: (teams: Team[], players: Player[]) => void;
}

const DUTCH_RANDOM_NAMES = [
  'Daan', 'Thomas', 'Lars', 'Sophie', 'Bram', 'Emma',
  'Sem', 'Lucas', 'Julia', 'Finn', 'Tess', 'Milan',
  'Lieke', 'Thijs', 'Sanne', 'Luuk', 'Eva', 'Stijn',
  'Willem', 'Lotte', 'Floris', 'Noa', 'Thijmen', 'Fleur',
];

const TEAM_COLORS = [
  '#a3e635', // lime
  '#38bdf8', // sky
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#a855f7', // purple
  '#10b981', // emerald
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#8b5cf6', // violet
];

export function TeamSetupScreen({
  initialPlayers,
  initialTeams,
  onBackToHome,
  onConfirmTeams,
}: TeamSetupScreenProps) {
  const [players, setPlayers] = useState<Player[]>(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      return initialPlayers;
    }
    const remembered = loadRememberedPlayers();
    if (remembered.length > 0) {
      return remembered.map((name, i) => ({
        id: `p-rem-${i}-${Date.now()}`,
        name,
      }));
    }
    return [
      { id: 'p1', name: 'Daan' },
      { id: 'p2', name: 'Thomas' },
      { id: 'p3', name: 'Lars' },
      { id: 'p4', name: 'Sophie' },
      { id: 'p5', name: 'Bram' },
      { id: 'p6', name: 'Emma' },
    ];
  });
  const [inputName, setInputName] = useState('');

  // Setup mode: 'wheel' (Rad van fortuin) or 'manual' (Zelf teams maken)
  const [setupMode, setSetupMode] = useState<'wheel' | 'manual'>('wheel');

  // Team size configuration: 1 = Solo, 2 = Duo, 3 = Trio, 4, 5... any number!
  const [teamSize, setTeamSize] = useState<number>(2);

  // Wheel state
  const [remainingPool, setRemainingPool] = useState<Player[]>(() => {
    if (initialTeams && initialTeams.length > 0) {
      const assigned = new Set(initialTeams.flatMap((t) => t.playerNames));
      return (initialPlayers || []).filter((p) => !assigned.has(p.name));
    }
    return initialPlayers || [];
  });
  const [currentPairing, setCurrentPairing] = useState<Player[]>([]);
  const [formedTeams, setFormedTeams] = useState<Team[]>(() => initialTeams || []);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastLandedPlayer, setLastLandedPlayer] = useState<Player | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('');

  // Editing team state (for modifying formed teams)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [addPlayerToTeamInput, setAddPlayerToTeamInput] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);

  // Scroll to top when switching setupMode
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [setupMode]);

  // Initialize pool on mount or when players change before spin started
  useEffect(() => {
    if (formedTeams.length === 0 && currentPairing.length === 0 && !isSpinning && !lastLandedPlayer) {
      setRemainingPool(players);
    }
  }, [players, formedTeams.length, currentPairing.length, isSpinning, lastLandedPlayer]);

  // Compute unassigned players (not in formedTeams and not in currentPairing)
  const assignedPlayerNames = new Set(formedTeams.flatMap((t) => t.playerNames));
  const unassignedPlayers = players.filter(
    (p) => !assignedPlayerNames.has(p.name) && !currentPairing.some((cp) => cp.name === p.name)
  );

  // Remembered players not currently in active pool
  const currentNamesSet = new Set(players.map((p) => p.name.toLowerCase()));
  const rememberedNames = loadRememberedPlayers();
  const availableRemembered = rememberedNames.filter(
    (name) => !currentNamesSet.has(name.toLowerCase())
  );

  // Add player to main list
  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) return;
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
    };
    const updated = [...players, newPlayer];
    setPlayers(updated);
    setRemainingPool((prev) => [...prev, newPlayer]);
    saveRememberedPlayers([trimmed]);
    setInputName('');
    sounds.playTick(700);
  };

  // Add remembered player with one click
  const handleAddRememberedPlayer = (name: string) => {
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
    };
    const updated = [...players, newPlayer];
    setPlayers(updated);
    setRemainingPool((prev) => [...prev, newPlayer]);
    sounds.playTick(750);
  };

  // Remove player from main list
  const handleRemovePlayer = (id: string) => {
    const playerToRemove = players.find((p) => p.id === id);
    const updated = players.filter((p) => p.id !== id);
    setPlayers(updated);
    setRemainingPool((prev) => prev.filter((p) => p.id !== id));
    setCurrentPairing((prev) => prev.filter((p) => p.id !== id));

    // Also remove from any formed teams
    if (playerToRemove) {
      setFormedTeams((prev) =>
        prev
          .map((t) => ({
            ...t,
            playerNames: t.playerNames.filter((name) => name !== playerToRemove.name),
          }))
          .filter((t) => t.playerNames.length > 0)
      );
    }
    sounds.playTick(450);
  };

  // Add random name
  const handleAddRandomGolfer = () => {
    const existing = new Set(players.map((p) => p.name.toLowerCase()));
    const available = DUTCH_RANDOM_NAMES.filter((n) => !existing.has(n.toLowerCase()));
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      const newPlayer: Player = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: pick,
      };
      setPlayers((prev) => [...prev, newPlayer]);
      setRemainingPool((prev) => [...prev, newPlayer]);
      sounds.playTick(800);
    }
  };

  // Reset wheel state
  const handleResetWheel = () => {
    setRemainingPool(players);
    setFormedTeams([]);
    setCurrentPairing([]);
    setLastLandedPlayer(null);
    setPendingRemovalId(null);
    setStatusText('Rad gereset. Kies teamgrootte en draai het rad!');
    sounds.playTick(500);
  };

  // ==========================================
  // MANUAL TEAM CREATION & EDITING HANDLERS
  // ==========================================
  const handleCreateNewTeamManual = () => {
    const colorIndex = formedTeams.length % TEAM_COLORS.length;
    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      playerNames: [],
      color: TEAM_COLORS[colorIndex],
    };
    setFormedTeams((prev) => [...prev, newTeam]);
    setEditingTeamId(newTeam.id);
    sounds.playReveal();
  };

  const handleAddPlayerToTeam = (teamId: string, playerName: string) => {
    if (!playerName.trim()) return;
    const trimmed = playerName.trim();

    // Ensure player is also in main players list
    if (!players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      const newP: Player = { id: `p-${Date.now()}`, name: trimmed };
      setPlayers((prev) => [...prev, newP]);
    }

    setFormedTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          if (t.playerNames.includes(trimmed)) return t;
          return { ...t, playerNames: [...t.playerNames, trimmed] };
        }
        return t;
      })
    );
    sounds.playTick(750);
  };

  const handleRemovePlayerFromTeam = (teamId: string, playerName: string) => {
    setFormedTeams((prev) =>
      prev
        .map((t) => {
          if (t.id === teamId) {
            return {
              ...t,
              playerNames: t.playerNames.filter((n) => n !== playerName),
            };
          }
          return t;
        })
        .filter((t) => t.playerNames.length > 0)
    );
    sounds.playTick(500);
  };

  const handleDeleteTeam = (teamId: string) => {
    setFormedTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (editingTeamId === teamId) setEditingTeamId(null);
    sounds.playTick(450);
  };

  const handleChangeTeamColor = (teamId: string, color: string) => {
    setFormedTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, color } : t))
    );
    sounds.playTick(700);
  };

  // ==========================================
  // WHEEL CANVAS DRAWING
  // ==========================================
  const drawWheel = useCallback(
    (rotationAngle: number, pool: Player[], highlightPlayerId: string | null = null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = width / 2 - 12;

      ctx.clearRect(0, 0, width, height);

      if (pool.length === 0) {
        // Empty wheel
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Alle teams compleet! ⛳', centerX, centerY);
        return;
      }

      const sliceAngle = (2 * Math.PI) / pool.length;

      // Draw slices with bright Wii sports colors
      pool.forEach((player, i) => {
        const startAngle = rotationAngle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        const isHighlighted = highlightPlayerId === player.id;
        const isAlt = i % 2 === 0;

        if (isHighlighted) {
          ctx.fillStyle = '#fef08a'; // bright gold
        } else {
          ctx.fillStyle = isAlt ? '#38bdf8' : '#84cc16'; // Wii sky blue vs fairway green
        }
        ctx.fill();

        ctx.lineWidth = isHighlighted ? 4 : 2.5;
        ctx.strokeStyle = isHighlighted ? '#ca8a04' : '#ffffff';
        ctx.stroke();

        // Text label (dynamically scales font for unlimited players)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = isHighlighted ? '#713f12' : '#ffffff';
        const fontSize = pool.length > 30 ? 8 : pool.length > 20 ? 9 : pool.length > 12 ? 11 : 12;
        ctx.font = isHighlighted ? `bold ${fontSize + 1}px sans-serif` : `900 ${fontSize}px sans-serif`;
        // Add subtle shadow for text legibility
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 3;
        const maxLen = pool.length > 25 ? 8 : 12;
        const name =
          player.name.length > maxLen ? player.name.substring(0, maxLen - 1) + '…' : player.name;
        ctx.fillText(name, radius - 16, 4);
        ctx.restore();
      });

      // Outer glossy ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Center golf ball hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 26, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      ctx.fillStyle = '#0284c7';
      ctx.font = '900 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DRAAI', centerX, centerY);

      // Indicator needle at 3 o'clock pointing inwards
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(width - 2, centerY - 14);
      ctx.lineTo(width - 30, centerY);
      ctx.lineTo(width - 2, centerY + 14);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.restore();
    },
    []
  );

  // Redraw when pool or lastLandedPlayer changes
  useEffect(() => {
    drawWheel(rotationAngleRef.current, remainingPool, lastLandedPlayer?.id || null);
  }, [remainingPool, lastLandedPlayer, drawWheel]);

  // ==========================================
  // SPIN THE WHEEL FOR 1 PERSON
  // ==========================================
  const handleSpinOnePlayer = () => {
    if (isSpinning) return;

    let activePool = remainingPool;
    if (pendingRemovalId) {
      activePool = remainingPool.filter((p) => p.id !== pendingRemovalId);
      setRemainingPool(activePool);
      setPendingRemovalId(null);
    }

    if (activePool.length === 0) return;

    if (players.length < teamSize) {
      setStatusText(`Voeg minimaal ${teamSize} spelers toe voor deze teamgrootte!`);
      sounds.playTick(350);
      return;
    }

    setIsSpinning(true);
    setLastLandedPlayer(null);
    sounds.playWhoosh();

    const targetIndex = Math.floor(Math.random() * activePool.length);
    const chosenPlayer = activePool[targetIndex];

    const sliceAngle = (2 * Math.PI) / activePool.length;
    const targetSliceOffset = targetIndex * sliceAngle + sliceAngle / 2;

    const desiredMod = (2 * Math.PI - (targetSliceOffset % (2 * Math.PI))) % (2 * Math.PI);
    const currentAngle = rotationAngleRef.current;
    const currentMod = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    let forwardDelta = (desiredMod - currentMod + 2 * Math.PI) % (2 * Math.PI);
    if (forwardDelta < 0.25) {
      forwardDelta += 2 * Math.PI;
    }

    const finalAngle = currentAngle + 4 * 2 * Math.PI + forwardDelta;
    const duration = 2400;
    const startTime = performance.now();
    const startAngle = currentAngle;
    let lastTickAngle = startAngle;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentAngleNow = startAngle + (finalAngle - startAngle) * ease;
      rotationAngleRef.current = currentAngleNow;

      if (Math.abs(currentAngleNow - lastTickAngle) >= sliceAngle * 0.75) {
        lastTickAngle = currentAngleNow;
        const pitch = 550 + Math.floor((1 - progress) * 550);
        sounds.playTick(pitch);
      }

      drawWheel(currentAngleNow, activePool, null);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setLastLandedPlayer(chosenPlayer);
        setPendingRemovalId(chosenPlayer.id);
        drawWheel(finalAngle, activePool, chosenPlayer.id);
        sounds.playReveal();

        const nextPairing = [...currentPairing, chosenPlayer];
        const nextPoolAfterChosen = activePool.filter((p) => p.id !== chosenPlayer.id);

        if (nextPairing.length === teamSize || nextPoolAfterChosen.length === 0) {
          const colorIndex = formedTeams.length % TEAM_COLORS.length;
          const newTeam: Team = {
            id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            playerNames: nextPairing.map((p) => p.name),
            color: TEAM_COLORS[colorIndex],
          };

          const updatedTeams = [...formedTeams, newTeam];
          setFormedTeams(updatedTeams);
          setCurrentPairing([]);

          if (nextPoolAfterChosen.length === 0) {
            setStatusText('Alle teams zijn compleet gevormd!');
          } else {
            setStatusText('');
          }
        } else {
          setCurrentPairing(nextPairing);
          setStatusText('');
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // ==========================================
  // AUTO-SPIN REMAINING PLAYERS
  // ==========================================
  const handleAutoSpinAll = () => {
    if (isSpinning) return;

    let unassigned = [...unassignedPlayers];
    if (unassigned.length === 0) return;

    sounds.playReveal();

    // Shuffle unassigned
    for (let i = unassigned.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unassigned[i], unassigned[j]] = [unassigned[j], unassigned[i]];
    }

    const newTeams: Team[] = [];
    let currentNames = currentPairing.map((p) => p.name);

    unassigned.forEach((player) => {
      currentNames.push(player.name);
      if (currentNames.length === teamSize) {
        const colorIndex = (formedTeams.length + newTeams.length) % TEAM_COLORS.length;
        newTeams.push({
          id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          playerNames: [...currentNames],
          color: TEAM_COLORS[colorIndex],
        });
        currentNames = [];
      }
    });

    // Remainder
    if (currentNames.length > 0) {
      if (formedTeams.length > 0 || newTeams.length > 0) {
        const targetTeam = newTeams.length > 0 ? newTeams[newTeams.length - 1] : formedTeams[formedTeams.length - 1];
        targetTeam.playerNames.push(...currentNames);
      } else {
        const colorIndex = 0;
        newTeams.push({
          id: `team-${Date.now()}`,
          playerNames: currentNames,
          color: TEAM_COLORS[colorIndex],
        });
      }
    }

    setFormedTeams((prev) => [...prev, ...newTeams]);
    setRemainingPool([]);
    setCurrentPairing([]);
    setPendingRemovalId(null);
    setLastLandedPlayer(null);
    setStatusText('');
  };

  // Confirm and proceed to game
  const handleConfirmAndStart = () => {
    if (formedTeams.length === 0) {
      setStatusText('Maak eerst minimaal 1 team aan om de kroegentocht te starten!');
      sounds.playTick(300);
      return;
    }
    saveRememberedPlayers(players.map((p) => p.name));
    sounds.playReveal();
    onConfirmTeams(formedTeams, players);
  };

  // Team size label helper
  const getTeamTypeLabel = (size: number) => {
    if (size === 1) return 'Solo (1)';
    if (size === 2) return "Duo's (2)";
    if (size === 3) return "Trio's (3)";
    return `${size}-tallen (${size})`;
  };

  const totalAssigned = formedTeams.reduce((sum, t) => sum + t.playerNames.length, 0);
  const allTeamsDone = players.length > 0 && totalAssigned === players.length && formedTeams.length > 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-28 pt-3 space-y-4">
      {/* Top Header (Zelfde vormgeving als bij de holes) */}
      <div className="wii-card px-2 py-1 sm:py-1.5 rounded-2xl border-2 border-white/95 shadow-sm flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md">
        <button
          type="button"
          onClick={onBackToHome}
          className="wii-btn-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 active:scale-95 transition-all shadow-2xs shrink-0"
          title="Terug naar menu"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline">Terug</span>
        </button>

        <div className="flex items-center justify-center">
          <div className="wii-btn-green text-[#14300a] px-3 py-1.5 rounded-xl inline-flex items-center justify-center gap-1.5 font-black shadow-xs border-2 border-white transition-transform shrink-0 leading-none">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider leading-none flex items-center">
              TEAMS MAKEN
            </span>
          </div>
        </div>

        {/* Volgende knop (disabled - je kan er niet op drukken) */}
        <button
          type="button"
          disabled
          className="wii-btn-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 opacity-30 pointer-events-none shadow-2xs shrink-0 select-none cursor-not-allowed"
          title="Volgende"
        >
          <span className="hidden xs:inline">Volgende</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Mode Switcher: Wheel vs Manual */}
      <div className="wii-card p-1 rounded-full border-2 border-white shadow-md flex items-center w-full">
        <button
          onClick={() => {
            setSetupMode('wheel');
            sounds.playTick(700);
          }}
          className={`flex-1 py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            setupMode === 'wheel'
              ? 'wii-btn-green text-[#14300a] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Rad van Fortuin</span>
        </button>

        <button
          onClick={() => {
            setSetupMode('manual');
            sounds.playTick(700);
          }}
          className={`flex-1 py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            setupMode === 'manual'
              ? 'wii-btn-green text-[#14300a] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Zelf Teams Maken</span>
        </button>
      </div>

      {/* Team Size Selector (1 to Infinity) */}
      <div className="wii-card rounded-3xl p-4 space-y-3 border-2 border-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-600" />
            Personen per team:
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={teamSize <= 1}
              onClick={() => {
                setTeamSize(Math.max(1, teamSize - 1));
                sounds.playTick(600);
              }}
              className="w-8 h-8 rounded-full wii-btn-red disabled:opacity-30 font-black text-base flex items-center justify-center active:scale-90"
            >
              -
            </button>
            <span className="text-base font-black text-slate-900 font-mono min-w-[24px] text-center">
              {teamSize}
            </span>
            <button
              type="button"
              onClick={() => {
                setTeamSize(teamSize + 1);
                sounds.playTick(600);
              }}
              className="w-8 h-8 rounded-full wii-btn-green font-black text-base flex items-center justify-center active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setTeamSize(size);
                sounds.playTick(700);
              }}
              className={`py-2 rounded-2xl font-black text-xs transition-all shadow-xs ${
                teamSize === size
                  ? 'wii-btn-green text-[#14300a]'
                  : 'wii-btn-white'
              }`}
            >
              {getTeamTypeLabel(size)}
            </button>
          ))}
        </div>
      </div>

      {/* Player Add Form */}
      <form onSubmit={handleAddPlayer} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Typ naam van speler..."
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="w-full h-12 pl-4 pr-10 rounded-2xl bg-white border-2 border-white shadow-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 text-sm font-bold"
          />
          {inputName && (
            <button
              type="button"
              onClick={() => setInputName('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!inputName.trim()}
          className="wii-btn-green h-12 px-4 rounded-2xl disabled:opacity-40 font-black text-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform shadow-md"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Toevoegen</span>
        </button>
      </form>

      {/* Players Pool Chips */}
      <div className="wii-card rounded-3xl p-4 space-y-2.5 border-2 border-white shadow-md">
        <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
          <span className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
           {players.length-unassignedPlayers.length} / {players.length} spelers ingedeeld
          </span>
          <PlayerPickerDropdown
            onSelectPlayer={(name) => handleAddRememberedPlayer(name)}
            existingNames={players.map(p => p.name)}
            compact
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {players.map((p) => {
            const isAssigned = assignedPlayerNames.has(p.name);
            const isCurrent = currentPairing.some((cp) => cp.name === p.name);
            const isLastLanded = lastLandedPlayer?.id === p.id;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl border-2 text-xs transition-all shadow-2xs ${
                  isLastLanded
                    ? 'wii-btn-yellow font-black'
                    : isCurrent
                    ? 'bg-sky-100 text-sky-900 border-sky-300 font-black'
                    : isAssigned
                    ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                    : 'bg-white border-slate-200 text-slate-800 font-bold'
                }`}
              >
                <span>{p.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePlayer(p.id)}
                  aria-label={`Verwijder ${p.name}`}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: WHEEL OF FORTUNE */}
      {/* ============================================================== */}
      {setupMode === 'wheel' && (
        <div className="flex flex-col items-center justify-center py-2 space-y-3.5">
          <div
            onClick={() => {
              if (!isSpinning && !allTeamsDone) {
                handleSpinOnePlayer();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Draai het rad voor de volgende speler"
            className={`relative w-64 h-64 sm:w-72 sm:h-72 select-none ${
              !allTeamsDone && !isSpinning ? 'cursor-pointer active:scale-95 transition-transform group' : ''
            }`}
          >
            <div
              className={`absolute inset-0 rounded-full bg-sky-300/40 blur-2xl transition-opacity duration-300 pointer-events-none transform-gpu ${
                isSpinning ? 'opacity-100 scale-105' : 'opacity-40 group-hover:opacity-75'
              }`}
            />
            <canvas
              ref={canvasRef}
              width={288}
              height={288}
              className={`relative z-10 w-full h-full rounded-full transition-transform drop-shadow-xl transform-gpu ${
                isSpinning ? 'scale-102' : ''
              }`}
            />
          </div>

          {statusText && (
            <p className="text-xs text-slate-800 text-center font-bold px-4 bg-white/70 py-1.5 rounded-xl border border-white shadow-2xs">
              {statusText}
            </p>
          )}

          {/* Wheel Actions */}
          <div className="w-full space-y-2">
            {!allTeamsDone ? (
              <div className="space-y-2">
                <button
                  onClick={handleSpinOnePlayer}
                  disabled={isSpinning || players.length === 0}
                  className="wii-btn-green w-full h-14 rounded-3xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
                >
                  <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>
                    {isSpinning
                      ? 'Het rad draait...'
                      : currentPairing.length === 0
                      ? `Draai Rad voor Speler 1 van Team ${formedTeams.length + 1}`
                      : 'Draai Rad voor Volgende Teamgenoot!'}
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: MANUAL TEAM CREATION */}
      {/* ============================================================== */}
      {setupMode === 'manual' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Zelf Teams Samenstellen
            </span>
          </div>

          {/* Quick-add unassigned players to an active team */}
          {unassignedPlayers.length > 0 && formedTeams.length > 0 && (
            <div className="p-3.5 rounded-2xl wii-box border-2 border-sky-100 space-y-2 shadow-sm">
              <span className="text-xs font-black text-sky-800 block">
                Tik op een niet-ingedeelde speler om direct toe te voegen aan het laatste team:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {unassignedPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      const target = formedTeams[formedTeams.length - 1];
                      handleAddPlayerToTeam(target.id, player.name);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-800 text-xs font-bold flex items-center gap-1 active:scale-95 shadow-2xs"
                  >
                    <span>+ {player.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* FORMED TEAMS LIST (WITH EDITING & CUSTOMIZATION) */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Gevormde Teams ({formedTeams.length})
          </h3>

          <div className="flex items-center gap-1.5">
            {setupMode === 'wheel' && unassignedPlayers.length > 0 && (
              <button
                type="button"
                onClick={handleAutoSpinAll}
                disabled={isSpinning}
                className="wii-btn-white p-1.5 rounded-xl text-xs font-black flex items-center justify-center shadow-2xs active:scale-95 transition-transform"
                title="Draai rest in 1x af"
                aria-label="Draai rest in 1x af"
              >
                <Dices className="w-3.5 h-3.5 text-amber-600" />
              </button>
            )}

            <button
              onClick={handleCreateNewTeamManual}
              className="wii-btn-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>Extra Team</span>
            </button>
          </div>
        </div>

        {formedTeams.length === 0 ? (
          <div className="p-6 rounded-2xl wii-card border-2 border-dashed border-sky-200 text-center text-xs font-bold text-slate-500 shadow-xs">
            Nog geen teams aangemaakt. Draai het rad of klik op "+ Extra Team".
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {formedTeams.map((team, idx) => {
              const isEditing = editingTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className="rounded-2xl wii-card border-2 p-3.5 shadow-md transition-all space-y-2.5"
                  style={{ borderColor: team.color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-slate-950 shrink-0 shadow-2xs"
                        style={{ backgroundColor: team.color }}
                      >
                        {idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 truncate">
                          {team.playerNames.length > 0
                            ? team.playerNames.join(' & ')
                            : 'Nog geen spelers in team'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTeamId(isEditing ? null : team.id);
                          sounds.playTick(700);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-95 shadow-2xs"
                        title="Team aanpassen"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center active:scale-95 shadow-2xs"
                        title="Team verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Player Chips inside Team Card with instant delete '✕' */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {team.playerNames.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 border text-xs text-slate-800 font-bold shadow-2xs"
                        style={{ borderColor: `${team.color}70` }}
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePlayerFromTeam(team.id, name)}
                          title={`Verwijder ${name} uit dit team`}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Expanded Edit Panel for this Team */}
                  {isEditing && (
                    <div className="mt-2 pt-3 border-t border-slate-100 space-y-3 bg-sky-50/70 p-3.5 rounded-2xl animate-in fade-in duration-150">
                      <div className="text-[11px] font-black text-sky-900 uppercase tracking-wider">
                        Team {idx + 1} Aanpassen
                      </div>

                      {/* Add player to this team */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-600 uppercase font-bold">
                          Voeg speler toe aan dit team:
                        </span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Typ spelernaam..."
                            value={addPlayerToTeamInput}
                            onChange={(e) => setAddPlayerToTeamInput(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleAddPlayerToTeam(team.id, addPlayerToTeamInput);
                              setAddPlayerToTeamInput('');
                            }}
                            className="wii-btn-green px-3 py-2 rounded-xl font-black text-xs active:scale-95"
                          >
                            Toevoegen
                          </button>
                        </div>

                        {/* Unassigned quick select */}
                        {unassignedPlayers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {unassignedPlayers.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleAddPlayerToTeam(team.id, p.name)}
                                className="px-2 py-0.5 rounded-lg bg-white text-sky-800 border border-sky-200 text-[10px] font-bold hover:border-sky-400 shadow-2xs"
                              >
                                + {p.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Color Picker */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-600 uppercase font-bold flex items-center gap-1">
                          <Palette className="w-3 h-3" /> Kleur kiezen:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {TEAM_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleChangeTeamColor(team.id, c)}
                              className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 shadow-2xs ${
                                team.color === c ? 'scale-115 border-white ring-2 ring-sky-400' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setEditingTeamId(null)}
                          className="wii-btn-white px-3 py-1.5 rounded-xl text-xs font-black"
                        >
                          Klaar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start Button */}
      {formedTeams.length > 0 && (
        <div className="pt-2">
          <button
            onClick={handleConfirmAndStart}
            className="wii-btn-green w-full h-15 rounded-3xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
          >
            <span>Start Hole 1</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
}
