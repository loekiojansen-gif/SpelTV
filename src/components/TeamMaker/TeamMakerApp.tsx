import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  UserPlus,
  Dices,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  Shuffle,
  FileText,
  Palette,
  ArrowRight,
  X,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';
import { MiiFace } from '../MiiMaker/MiiFace';
import { loadMiiAvatars } from '../../utils/storage';
import { MiiAvatar } from '../../types';

interface FormedTeam {
  id: string;
  name: string;
  color: string;
  playerNames: string[];
}

const DUTCH_RANDOM_NAMES = [
  'Daan', 'Thomas', 'Lars', 'Sophie', 'Bram', 'Emma',
  'Sem', 'Lucas', 'Julia', 'Finn', 'Tess', 'Milan',
  'Lieke', 'Thijs', 'Sanne', 'Luuk', 'Eva', 'Stijn',
  'Willem', 'Lotte', 'Floris', 'Noa', 'Thijmen', 'Fleur',
  'Boudewijn', 'Roos', 'Niek', 'Anouk', 'Koen', 'Maud',
];

const TEAM_COLORS = [
  '#ef4444', // Red
  '#0284c7', // Sky Blue
  '#16a34a', // Emerald Green
  '#f59e0b', // Amber
  '#9333ea', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#ea580c', // Orange
  '#14b8a6', // Teal
  '#4f46e5', // Indigo
];

const STORAGE_KEY_PLAYERS = 'party_channels_team_maker_players';
const STORAGE_KEY_TEAMS = 'party_channels_team_maker_formed_teams';
const STORAGE_KEY_SETTINGS = 'party_channels_team_maker_settings';

export function TeamMakerApp() {
  // Players state
  const [players, setPlayers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['Daan', 'Thomas', 'Lars', 'Sophie', 'Bram', 'Emma'];
  });

  const [inputName, setInputName] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');

  // Team division settings
  const [divisionMode, setDivisionMode] = useState<'size' | 'count'>('size');
  const [teamSize, setTeamSize] = useState<number>(2); // Duo's = 2
  const [teamCount, setTeamCount] = useState<number>(2);

  // Maker Method Tab: 'instant' (in één keer) or 'wheel' (via radje)
  const [activeTab, setActiveTab] = useState<'instant' | 'wheel'>('instant');

  // Formed teams
  const [formedTeams, setFormedTeams] = useState<FormedTeam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAMS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [miiAvatars] = useState<MiiAvatar[]>(() => loadMiiAvatars());
  const getMiiForPlayer = (name: string): MiiAvatar | undefined => {
    return miiAvatars.find(m => m.name.toLowerCase() === name.trim().toLowerCase());
  };

  useEffect(() => {
    const onReset = () => {
      setFormedTeams([]);
      sounds.playTick(500);
    };
    window.addEventListener('party_game_reset', onReset);
    return () => window.removeEventListener('party_game_reset', onReset);
  }, []);

  // Wheel state
  const [remainingPool, setRemainingPool] = useState<string[]>([]);
  const [currentPairing, setCurrentPairing] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastLandedPlayer, setLastLandedPlayer] = useState<string | null>(null);
  const [pendingRemovalName, setPendingRemovalName] = useState<string | null>(null);

  // Quick feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);

  // Save players to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    } catch {
      // ignore
    }
  }, [players]);

  // Save formed teams to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(formedTeams));
    } catch {
      // ignore
    }
  }, [formedTeams]);

  // Initialize remaining pool when starting or updating players
  useEffect(() => {
    if (formedTeams.length === 0 && currentPairing.length === 0 && !isSpinning && !lastLandedPlayer) {
      setRemainingPool(players);
    }
  }, [players, formedTeams.length, currentPairing.length, isSpinning, lastLandedPlayer]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --------------------------------------------------------------------------
  // Player Management
  // --------------------------------------------------------------------------
  const handleAddPlayer = (e?: React.FormEvent, customName?: string) => {
    if (e) e.preventDefault();
    const raw = customName !== undefined ? customName : inputName;
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (players.includes(trimmed)) {
      setToastMessage(`"${trimmed}" staat al in de lijst!`);
      sounds.playTick(400);
      return;
    }
    const updated = [...players, trimmed];
    setPlayers(updated);
    setRemainingPool(prev => [...prev, trimmed]);
    if (customName === undefined) setInputName('');
    sounds.playTick(750);
  };

  const handleRemovePlayer = (name: string) => {
    setPlayers(prev => prev.filter(p => p !== name));
    setRemainingPool(prev => prev.filter(p => p !== name));
    setCurrentPairing(prev => prev.filter(p => p !== name));
    setFormedTeams(prev =>
      prev
        .map(t => ({
          ...t,
          playerNames: t.playerNames.filter(p => p !== name),
        }))
        .filter(t => t.playerNames.length > 0)
    );
    sounds.playTick(500);
  };

  const handleAddRandomName = () => {
    const available = DUTCH_RANDOM_NAMES.filter(n => !players.includes(n));
    if (available.length === 0) return;
    const randomPick = available[Math.floor(Math.random() * available.length)];
    const updated = [...players, randomPick];
    setPlayers(updated);
    setRemainingPool(prev => [...prev, randomPick]);
    sounds.playTick(800);
  };

  const handleBatchImport = () => {
    const rawNames = batchText
      .split(/[\n,;]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (rawNames.length === 0) return;

    const merged = Array.from(new Set([...players, ...rawNames]));
    setPlayers(merged);
    setRemainingPool(merged);
    setBatchText('');
    setShowBatchModal(false);
    setToastMessage(`${rawNames.length} namen toegevoegd!`);
    sounds.playFanfare();
  };

  const handleClearAllPlayers = () => {
    setPlayers([]);
    setRemainingPool([]);
    setCurrentPairing([]);
    setFormedTeams([]);
    setLastLandedPlayer(null);
    sounds.playTick(450);
  };

  // --------------------------------------------------------------------------
  // Calculation of Target Teams & Sizes
  // --------------------------------------------------------------------------
  const effectiveTargetTeamSize =
    divisionMode === 'size'
      ? teamSize
      : Math.max(1, Math.ceil(players.length / Math.max(1, teamCount)));

  const computedNumTeams =
    divisionMode === 'size'
      ? Math.max(1, Math.ceil(players.length / Math.max(1, teamSize)))
      : teamCount;

  // --------------------------------------------------------------------------
  // METHOD 1: IN ÉÉN KEER (Instant Random Shuffle)
  // --------------------------------------------------------------------------
  const handleInstantShuffle = () => {
    if (players.length < 2) {
      setToastMessage('Voeg minimaal 2 spelers toe!');
      sounds.playTick(400);
      return;
    }

    // Shuffle players randomly
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    let numTeamsToMake = 2;
    if (divisionMode === 'size') {
      numTeamsToMake = Math.max(1, Math.ceil(shuffled.length / teamSize));
    } else {
      numTeamsToMake = Math.min(shuffled.length, Math.max(1, teamCount));
    }

    const newTeams: FormedTeam[] = [];
    for (let i = 0; i < numTeamsToMake; i++) {
      newTeams.push({
        id: `team-${Date.now()}-${i}`,
        name: `Team ${i + 1}`,
        color: TEAM_COLORS[i % TEAM_COLORS.length],
        playerNames: [],
      });
    }

    // Distribute players round-robin or chunk
    shuffled.forEach((player, idx) => {
      const targetTeamIdx = idx % numTeamsToMake;
      newTeams[targetTeamIdx].playerNames.push(player);
    });

    setFormedTeams(newTeams);
    setRemainingPool([]);
    setCurrentPairing([]);
    setLastLandedPlayer(null);

    sounds.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setToastMessage('Teams zijn succesvol gemaakt! 🎉');
  };

  // --------------------------------------------------------------------------
  // METHOD 2: VIA HET RADJE (Wheel of Fortune)
  // --------------------------------------------------------------------------
  const drawWheel = useCallback(
    (rotationAngle: number, pool: string[], highlightPlayer: string | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 16;

      ctx.clearRect(0, 0, width, height);

      if (pool.length === 0) {
        // Empty wheel / All assigned
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Alle spelers zijn ingedeeld! 🎉', centerX, centerY);
        return;
      }

      const sliceAngle = (2 * Math.PI) / pool.length;

      // Draw slices
      pool.forEach((name, i) => {
        const startAngle = rotationAngle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        const isHighlighted = highlightPlayer === name;
        const isAlt = i % 2 === 0;

        if (isHighlighted) {
          ctx.fillStyle = '#fef08a'; // bright gold
        } else {
          ctx.fillStyle = isAlt ? '#6366f1' : '#8b5cf6'; // Indigo / Violet
        }
        ctx.fill();

        ctx.lineWidth = isHighlighted ? 4 : 2;
        ctx.strokeStyle = isHighlighted ? '#ca8a04' : '#ffffff';
        ctx.stroke();

        // Slice text label
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = isHighlighted ? '#713f12' : '#ffffff';
        const fontSize = pool.length > 24 ? 9 : pool.length > 14 ? 11 : 13;
        ctx.font = isHighlighted ? `bold ${fontSize + 1}px sans-serif` : `900 ${fontSize}px sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 3;
        const maxLen = pool.length > 20 ? 8 : 12;
        const displayName = name.length > maxLen ? name.substring(0, maxLen - 1) + '…' : name;
        ctx.fillText(displayName, radius - 16, 4);
        ctx.restore();
      });

      // Outer glossy white ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#818cf8';
      ctx.stroke();

      // Center Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#6366f1';
      ctx.stroke();

      ctx.fillStyle = '#4f46e5';
      ctx.font = '900 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DRAAI', centerX, centerY);

      // Indicator arrow pointing inwards from 3 o'clock
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(width - 4, centerY - 12);
      ctx.lineTo(width - 28, centerY);
      ctx.lineTo(width - 4, centerY + 12);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.restore();
    },
    []
  );

  // Redraw canvas whenever pool or landed player changes
  useEffect(() => {
    drawWheel(rotationAngleRef.current, remainingPool, lastLandedPlayer);
  }, [remainingPool, lastLandedPlayer, drawWheel]);

  // Spin 1 player via the wheel
  const handleSpinWheel = () => {
    if (isSpinning) return;

    let activePool = remainingPool;
    if (pendingRemovalName) {
      activePool = remainingPool.filter(p => p !== pendingRemovalName);
      setRemainingPool(activePool);
      setPendingRemovalName(null);
    }

    if (activePool.length === 0) {
      setToastMessage('Alle spelers zijn al verdeeld!');
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
    const duration = 2200;
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
        setPendingRemovalName(chosenPlayer);
        drawWheel(finalAngle, activePool, chosenPlayer);
        sounds.playReveal();

        const nextPairing = [...currentPairing, chosenPlayer];
        const nextPoolAfterChosen = activePool.filter(p => p !== chosenPlayer);

        // Check if current team is complete
        if (nextPairing.length === effectiveTargetTeamSize || nextPoolAfterChosen.length === 0) {
          const colorIndex = formedTeams.length % TEAM_COLORS.length;
          const newTeam: FormedTeam = {
            id: `team-${Date.now()}-${formedTeams.length}`,
            name: `Team ${formedTeams.length + 1}`,
            color: TEAM_COLORS[colorIndex],
            playerNames: nextPairing,
          };

          const updatedTeams = [...formedTeams, newTeam];
          setFormedTeams(updatedTeams);
          setCurrentPairing([]);

          if (nextPoolAfterChosen.length === 0) {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
            });
            setToastMessage('Alle teams zijn compleet! 👑');
          } else {
            setToastMessage(`${newTeam.name} is compleet!`);
          }
        } else {
          setCurrentPairing(nextPairing);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Spin remaining players automatically
  const handleAutoSpinRemaining = () => {
    if (isSpinning) return;

    let pool = [...remainingPool];
    if (pendingRemovalName) {
      pool = pool.filter(p => p !== pendingRemovalName);
      setPendingRemovalName(null);
    }

    if (pool.length === 0 && currentPairing.length === 0) return;

    // Combine current pairing and remaining pool, shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const allRemaining = [...currentPairing, ...shuffled];

    const newTeams: FormedTeam[] = [...formedTeams];
    let currentIndex = 0;

    while (currentIndex < allRemaining.length) {
      const slice = allRemaining.slice(currentIndex, currentIndex + effectiveTargetTeamSize);
      currentIndex += effectiveTargetTeamSize;
      const colorIndex = newTeams.length % TEAM_COLORS.length;
      newTeams.push({
        id: `team-${Date.now()}-${newTeams.length}`,
        name: `Team ${newTeams.length + 1}`,
        color: TEAM_COLORS[colorIndex],
        playerNames: slice,
      });
    }

    setFormedTeams(newTeams);
    setRemainingPool([]);
    setCurrentPairing([]);
    setLastLandedPlayer(null);
    sounds.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setToastMessage('Alle resterende teams zijn direct gevormd!');
  };

  // Reset the wheel and start over
  const handleResetWheel = () => {
    setRemainingPool(players);
    setFormedTeams([]);
    setCurrentPairing([]);
    setLastLandedPlayer(null);
    setPendingRemovalName(null);
    sounds.playTick(500);
    setToastMessage('Rad gereset!');
  };

  // --------------------------------------------------------------------------
  // Team Management & Export
  // --------------------------------------------------------------------------
  const handleCopyTeamsToClipboard = () => {
    if (formedTeams.length === 0) return;
    const textLines = ['🏆 Teamindeling:'];
    formedTeams.forEach(t => {
      textLines.push(`• ${t.name}: ${t.playerNames.join(', ')}`);
    });
    const shareText = textLines.join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setToastMessage('Gekopieerd naar klembord voor WhatsApp! 📋');
      sounds.playCorrectDing();
    }
  };

  const handleUpdateTeamName = (teamId: string, newName: string) => {
    setFormedTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, name: newName } : t))
    );
  };

  const handleMovePlayer = (playerName: string, sourceTeamId: string, targetTeamId: string) => {
    if (sourceTeamId === targetTeamId) return;
    setFormedTeams(prev =>
      prev.map(t => {
        if (t.id === sourceTeamId) {
          return { ...t, playerNames: t.playerNames.filter(p => p !== playerName) };
        }
        if (t.id === targetTeamId) {
          return { ...t, playerNames: [...t.playerNames, playerName] };
        }
        return t;
      })
    );
    sounds.playTick(700);
  };

  const handleRemoveTeam = (teamId: string) => {
    const teamToRemove = formedTeams.find(t => t.id === teamId);
    if (!teamToRemove) return;
    // Put players back into unassigned if needed
    setFormedTeams(prev => prev.filter(t => t.id !== teamId));
    sounds.playTick(500);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto px-3 sm:px-4 pb-14 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-black shadow-xl animate-in fade-in slide-in-from-top-2 border border-slate-700">
          {toastMessage}
        </div>
      )}



      {/* Spelers Invoeren & Lijst */}
      <div className="w-full wii-card rounded-3xl p-3.5 sm:p-4 border-2 border-white mb-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-black text-slate-800 text-sm sm:text-base">
              Spelers ({players.length})
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowBatchModal(true)}
              className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 cursor-pointer transition-colors"
            >
              Plak lijst
            </button>
            <button
              onClick={handleAddRandomName}
              className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
            >
              + Willekeurig
            </button>
          </div>
        </div>

        {/* Input Field */}
        <form onSubmit={handleAddPlayer} className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <input
            type="text"
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            placeholder="Typ een naam en druk op Enter..."
            className="flex-1 min-w-[140px] px-3 py-1.5 text-xs sm:text-sm font-bold bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl wii-btn-blue text-xs font-black shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Toevoegen</span>
          </button>
          <PlayerPickerDropdown
            compact
            existingNames={players}
            buttonLabel="Kies Speler"
            buttonClassName="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            onSelectPlayer={(name) => {
              handleAddPlayer(undefined, name);
            }}
          />
        </form>

        {/* Players Chips */}
        {players.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
            {players.map((name, i) => {
              const mii = getMiiForPlayer(name);
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
                >
                  {mii && (
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                      <MiiFace avatar={mii} size={16} />
                    </div>
                  )}
                  <span>{name}</span>
                  <button
                    onClick={() => handleRemovePlayer(name)}
                    className="text-slate-300 hover:text-rose-500 font-black cursor-pointer p-0.5"
                    title="Verwijder"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Nog geen spelers toegevoegd. Typ een naam of klik op '+ Willekeurig'.
          </div>
        )}

        {players.length > 0 && (
          <div className="flex justify-end mt-1.5">
            <button
              onClick={handleClearAllPlayers}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              Wis alle spelers
            </button>
          </div>
        )}
      </div>

      {/* Instellingen voor Teams: Teamgrootte of Aantal Teams */}
      <div className="w-full wii-card rounded-3xl p-3.5 sm:p-4 border-2 border-white mb-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Teamindeling Instellen:
          </span>
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
            <button
              onClick={() => setDivisionMode('size')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                divisionMode === 'size'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Op Teamgrootte
            </button>
            <button
              onClick={() => setDivisionMode('count')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                divisionMode === 'count'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Op Aantal Teams
            </button>
          </div>
        </div>

        {/* Division Selector Buttons */}
        {divisionMode === 'size' ? (
          <div>
            <div className="flex gap-1.5 mb-2">
              {[
                { size: 2, label: "Duo's (2)" },
                { size: 3, label: "Trio's (3)" },
                { size: 4, label: "4-tallen" },
                { size: 5, label: "5-tallen" },
              ].map(item => (
                <button
                  key={item.size}
                  onClick={() => setTeamSize(item.size)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    teamSize === item.size
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-1.5 mb-2">
              {[2, 3, 4, 5, 6].map(count => (
                <button
                  key={count}
                  onClick={() => setTeamCount(count)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    teamCount === count
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {count} Teams
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Calculation summary */}
        <div className="p-2 rounded-xl bg-indigo-50/80 border border-indigo-200 text-center text-xs font-bold text-indigo-900">
          🎯 {players.length} spelers verdeeld over{' '}
          <span className="font-black text-indigo-700">{computedNumTeams} teams</span> van ca.{' '}
          <span className="font-black text-indigo-700">{effectiveTargetTeamSize} spelers</span>.
        </div>
      </div>

      {/* Methode Selector Tabs: In één keer VS Via Radje */}
      <div className="w-full flex gap-2 mb-3.5">
        <button
          onClick={() => setActiveTab('instant')}
          className={`flex-1 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
            activeTab === 'instant'
              ? 'bg-white border-indigo-500 text-indigo-700 shadow-md scale-[1.02]'
              : 'bg-slate-100 border-white text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>In één keer (Direct)</span>
        </button>

        <button
          onClick={() => setActiveTab('wheel')}
          className={`flex-1 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
            activeTab === 'wheel'
              ? 'bg-white border-indigo-500 text-indigo-700 shadow-md scale-[1.02]'
              : 'bg-slate-100 border-white text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>Via het Radje (Spannend)</span>
        </button>
      </div>

      {/* TAB 1: IN ÉÉN KEER */}
      {activeTab === 'instant' && (
        <div className="w-full space-y-3.5 animate-in fade-in">
          <button
            onClick={handleInstantShuffle}
            disabled={players.length < 2}
            className="w-full py-4 rounded-2xl wii-btn-green font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-40"
          >
            <Shuffle className="w-5 h-5" />
            <span>Maak Teams in 1 Keer! ⚡</span>
          </button>
        </div>
      )}

      {/* TAB 2: VIA HET RADJE */}
      {activeTab === 'wheel' && (
        <div className="w-full space-y-3.5 animate-in fade-in">
          <div className="w-full wii-card rounded-3xl p-4 sm:p-5 text-center border-2 border-white shadow-md relative overflow-hidden">
            {/* Active pairing status badge */}
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800">
                {currentPairing.length > 0
                  ? `Bezig met Team ${formedTeams.length + 1} (${currentPairing.length}/${effectiveTargetTeamSize})`
                  : formedTeams.length > 0 && remainingPool.length === 0
                  ? 'Alle teams compleet!'
                  : `Volgende: Team ${formedTeams.length + 1}`}
              </span>
            </div>

            {/* Current pairing members pill */}
            {currentPairing.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap">
                {currentPairing.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs animate-in zoom-in"
                  >
                    {p}
                  </span>
                ))}
                {Array.from({ length: effectiveTargetTeamSize - currentPairing.length }).map(
                  (_, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs border border-dashed border-slate-300"
                    >
                      ?
                    </span>
                  )
                )}
              </div>
            )}

            {/* Canvas Wheel */}
            <div className="flex justify-center my-2">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="max-w-[280px] sm:max-w-[300px] aspect-square rounded-full shadow-lg"
              />
            </div>

            {/* Landed Announcement */}
            {lastLandedPlayer && (
              <div className="text-sm font-black text-indigo-700 animate-in zoom-in my-1">
                🎉 Geland op: <span className="underline">{lastLandedPlayer}</span>!
              </div>
            )}

            <div className="text-xs font-bold text-slate-500 mb-3">
              Nog <span className="font-black text-slate-800">{remainingPool.length} spelers</span> op het rad.
            </div>

            {/* Spin Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning || (remainingPool.length === 0 && !pendingRemovalName)}
                className="w-full py-3.5 rounded-2xl wii-btn-blue font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-40"
              >
                <Dices className="w-5 h-5" />
                <span>{isSpinning ? 'Rad draait...' : 'Draai aan het Rad! 🎡'}</span>
              </button>

              {remainingPool.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoSpinRemaining}
                    disabled={isSpinning}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Draai rest direct af ⚡
                  </button>
                  <button
                    onClick={handleResetWheel}
                    disabled={isSpinning}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reset Rad
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GEVORMDE TEAMS WEERGAVE */}
      {formedTeams.length > 0 && (
        <div className="w-full mt-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
              <span>🏆</span>
              <span>Gevormde Teams ({formedTeams.length})</span>
            </h3>
            <button
              onClick={handleCopyTeamsToClipboard}
              className="wii-btn-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopieer Teams</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {formedTeams.map((team, tIdx) => (
              <div
                key={team.id}
                className="wii-card rounded-2xl p-3 border-2 border-white shadow-md relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                    <input
                      type="text"
                      value={team.name}
                      onChange={e => handleUpdateTeamName(team.id, e.target.value)}
                      className="font-black text-xs sm:text-sm text-slate-800 bg-transparent outline-none flex-1"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveTeam(team.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    title="Verwijder dit team"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Team members */}
                <div className="space-y-1">
                  {team.playerNames.map((name, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        {(() => {
                          const mii = getMiiForPlayer(name);
                          return mii ? (
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-white border border-slate-300 shrink-0">
                              <MiiFace avatar={mii} size={20} />
                            </div>
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-white text-slate-500 flex items-center justify-center text-[10px] font-black border border-slate-200">
                              {pIdx + 1}
                            </span>
                          );
                        })()}
                        <span>{name}</span>
                      </div>

                      {/* Move to another team dropdown */}
                      {formedTeams.length > 1 && (
                        <select
                          value=""
                          onChange={e => {
                            if (e.target.value) {
                              handleMovePlayer(name, team.id, e.target.value);
                            }
                          }}
                          className="text-[10px] bg-white border border-slate-200 rounded-md text-slate-400 font-bold px-1 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="">Verplaats...</option>
                          {formedTeams
                            .filter(other => other.id !== team.id)
                            .map(other => (
                              <option key={other.id} value={other.id}>
                                Naar {other.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reshuffle button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => {
                if (activeTab === 'instant') {
                  handleInstantShuffle();
                } else {
                  handleResetWheel();
                }
              }}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer bg-white/70 px-3 py-1.5 rounded-full border border-slate-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Opnieuw Verdelen</span>
            </button>
          </div>
        </div>
      )}

      {/* Batch Paste Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 max-w-sm w-full border-4 border-indigo-300 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-800 text-sm">
                  Plak Namenlijst
                </h3>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-500 mb-2">
              Plak meerdere namen (gescheiden door komma's of op nieuwe regels):
            </p>

            <textarea
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder="Daan, Thomas, Lars, Sophie..."
              rows={5}
              className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-colors mb-3"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="flex-1 py-2 rounded-xl wii-btn-white text-xs font-bold cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleBatchImport}
                className="flex-1 py-2 rounded-xl wii-btn-blue text-xs font-black cursor-pointer shadow-md"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
