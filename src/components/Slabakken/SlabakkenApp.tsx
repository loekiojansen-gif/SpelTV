import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import {
  DEFAULT_CATEGORY_PRESETS,
  SlabakkenCategory,
  Player,
  Team,
  SlabakkenSlip,
} from './slabakkenData';
import {
  Play,
  Check,
  RotateCcw,
  Users,
  Timer,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight,
  Flame,
  AlertCircle,
  UserPlus,
  CheckCircle2,
  Eye,
  Shuffle,
  Pencil,
} from 'lucide-react';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';
import { MiiFace } from '../MiiMaker/MiiFace';
import { loadMiiAvatars } from '../../utils/storage';
import { MiiAvatar } from '../../types';

type GamePhase =
  | 'setup'
  | 'pass-player'      // "Geef de telefoon aan [Speler]"
  | 'input-words'     // Player fills their secret slips
  | 'bowl-filled'     // Celebration: bowl is filled with slips
  | 'round-intro'     // Explains rules for round 1, 2, or 3
  | 'ready-turn'      // Shows who is up next (Player + Team)
  | 'active-turn'     // Fast 30s timer with paper slip
  | 'turn-summary'    // Time is up summary
  | 'round-summary'   // Bowl empty, round scores
  | 'game-over';      // Final podium & winners

const VEGETABLE_TEAM_PRESETS = [
  { name: 'Team Tomaat', emoji: '🍅', color: '#dc2626' },      // Red tomato
  { name: 'Team Komkommer', emoji: '🥒', color: '#16a34a' },   // Green cucumber
  { name: 'Team Wortel', emoji: '🥕', color: '#ea580c' },      // Orange carrot
  { name: 'Team Aubergine', emoji: '🍆', color: '#7e22ce' },   // Purple eggplant
  { name: 'Team Paprika', emoji: '🫑', color: '#eab308' },     // Yellow bell pepper
  { name: 'Team Radijs', emoji: '🥗', color: '#db2777' },      // Pink/magenta radish
  { name: 'Team Avocado', emoji: '🥑', color: '#65a30d' },     // Lime avocado
  { name: 'Team Ui', emoji: '🧅', color: '#9333ea' },          // Red onion purple
];

const INITIAL_TEAMS: Team[] = [
  { id: 'team-1', name: '🍅 Team Tomaat', color: '#dc2626', roundScores: [0, 0, 0] },
  { id: 'team-2', name: '🥒 Team Komkommer', color: '#16a34a', roundScores: [0, 0, 0] },
];

const INITIAL_PLAYERS: Player[] = [
  { id: 'p-1', name: 'Lars', teamId: 'team-1' },
  { id: 'p-2', name: 'Sophie', teamId: 'team-1' },
  { id: 'p-3', name: 'Tom', teamId: 'team-2' },
  { id: 'p-4', name: 'Emma', teamId: 'team-2' },
];

const ROUND_DETAILS: Record<
  number,
  {
    title: string;
    subtitle: string;
    badge: string;
    icon: string;
    verb: string;
    rules: string[];
    allowed: string;
    forbidden: string;
  }
> = {
  1: {
    title: 'Ronde 1: Omschrijven',
    subtitle: 'Leg het begrip uit met zoveel woorden als je wilt',
    badge: 'Omschrijven',
    icon: '🗣️',
    verb: 'legt uit aan',
    rules: [
      'Je mag alles zeggen om het begrip te omschrijven.',
      'Je mag NIET het woord zelf of een deel ervan noemen.',
      'Geen vertalingen in andere talen of "rijmt op...".',
      'Elk goed geraden briefje levert 1 punt op.',
    ],
    allowed: 'Praten, synoniemen, situaties en omschrijvingen.',
    forbidden: 'Het woord zelf noemen, delen ervan, vertalingen of rijmwoorden.',
  },
  2: {
    title: 'Ronde 2: Uitbeelden',
    subtitle: 'Niet praten! Alleen bewegingen, mimiek en gebaren',
    badge: 'Hints & Mime',
    icon: '🎭',
    verb: 'beeldt uit voor',
    rules: [
      'Alle briefjes van Ronde 1 zitten weer in de kom!',
      'Je mag GEEN enkel geluid of woord maken.',
      'Alleen uitbeelden met je lichaam, handen en mimiek.',
      'Wijs niet direct naar fysieke voorwerpen in de kamer.',
    ],
    allowed: 'Gebaren, mimiek, lichaamstaal en acteren.',
    forbidden: 'Praten, fluisteren, geluidseffecten of neuriën.',
  },
  3: {
    title: 'Ronde 3: Eén Woord',
    subtitle: 'Je mag slechts ÉÉN enkel woord roepen als hint',
    badge: 'Eén Woord',
    icon: '☝️',
    verb: 'geeft 1 hint aan',
    rules: [
      'Alle briefjes zitten weer opnieuw in de kom!',
      'Je mag precies ÉÉN woord roepen.',
      'Geen handgebaren, geen mimiek, geen lichaamstaal.',
      'Je team mag maar één keer raden per poging!',
    ],
    allowed: 'Exact 1 gesproken woord als associatie.',
    forbidden: 'Meerdere woorden, gebaren, aanwijzen of geluiden.',
  },
};

const STORAGE_KEY = 'party_channels_slabakken_active_game_v2';

export function SlabakkenApp() {
  // Setup State
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [selectedCategories, setSelectedCategories] = useState<SlabakkenCategory[]>(
    DEFAULT_CATEGORY_PRESETS.slice(0, 3)
  );
  const [turnDuration, setTurnDuration] = useState<number>(30); // 30, 45, or 60s
  const [customCatName, setCustomCatName] = useState<string>('');
  const [newPlayerNames, setNewPlayerNames] = useState<Record<string, string>>({});
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState<string>('');

  // Active Game State
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);

  // Pass-and-play slip entry state
  const [fillPlayerIndex, setFillPlayerIndex] = useState<number>(0);
  const [currentInputWords, setCurrentInputWords] = useState<Record<string, string>>({});
  const [masterSlips, setMasterSlips] = useState<SlabakkenSlip[]>([]);

  // Turn management state
  const [bowlSlips, setBowlSlips] = useState<SlabakkenSlip[]>([]);
  const [currentSlip, setCurrentSlip] = useState<SlabakkenSlip | null>(null);
  const [turnGuessedSlips, setTurnGuessedSlips] = useState<SlabakkenSlip[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Turn rotation tracking
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(0);
  const [teamPlayerTurnIndices, setTeamPlayerTurnIndices] = useState<Record<string, number>>({});

  // Modals
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  const [miiAvatars] = useState<MiiAvatar[]>(() => loadMiiAvatars());
  const getMiiForPlayer = (name: string): MiiAvatar | undefined => {
    return miiAvatars.find(m => m.name.toLowerCase() === name.trim().toLowerCase());
  };

  useEffect(() => {
    const onReset = () => {
      setShowResetConfirmModal(true);
      sounds.playTick(500);
    };
    window.addEventListener('party_game_reset', onReset);
    return () => window.removeEventListener('party_game_reset', onReset);
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phase && parsed.phase !== 'setup') {
          setTeams(parsed.teams || INITIAL_TEAMS);
          setPlayers(parsed.players || INITIAL_PLAYERS);
          setSelectedCategories(parsed.selectedCategories || DEFAULT_CATEGORY_PRESETS.slice(0, 3));
          setTurnDuration(parsed.turnDuration || 30);
          setPhase(parsed.phase);
          setCurrentRound(parsed.currentRound || 1);
          setFillPlayerIndex(parsed.fillPlayerIndex || 0);
          setMasterSlips(parsed.masterSlips || []);
          setBowlSlips(parsed.bowlSlips || []);
          setCurrentSlip(parsed.currentSlip || null);
          setTurnGuessedSlips(parsed.turnGuessedSlips || []);
          setTimeLeft(parsed.timeLeft || parsed.turnDuration || 30);
          setActiveTeamIndex(parsed.activeTeamIndex || 0);
          setTeamPlayerTurnIndices(parsed.teamPlayerTurnIndices || {});
        }
      }
    } catch (e) {
      console.error('Failed to restore Slabakken game state:', e);
    }
  }, []);

  // Save state to localStorage whenever game is in progress
  useEffect(() => {
    try {
      if (phase === 'setup') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const stateToSave = {
          teams,
          players,
          selectedCategories,
          turnDuration,
          phase: phase === 'active-turn' ? 'ready-turn' : phase,
          currentRound,
          fillPlayerIndex,
          masterSlips,
          bowlSlips: currentSlip ? [currentSlip, ...bowlSlips] : bowlSlips,
          currentSlip: null,
          turnGuessedSlips: [],
          timeLeft: turnDuration,
          activeTeamIndex,
          teamPlayerTurnIndices,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      }
    } catch (e) {
      console.error('Failed to save Slabakken game state:', e);
    }
  }, [
    phase,
    teams,
    players,
    selectedCategories,
    turnDuration,
    currentRound,
    fillPlayerIndex,
    masterSlips,
    bowlSlips,
    currentSlip,
    activeTeamIndex,
    teamPlayerTurnIndices,
  ]);

  // Turn timer countdown effect
  useEffect(() => {
    if (phase === 'active-turn') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleTimeExpired();
            return 0;
          }
          if (prev <= 6) {
            sounds.playTimerTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Handle timer reaching 0
  const handleTimeExpired = () => {
    sounds.playBuzzer();
    if (currentSlip) {
      setBowlSlips(prev => [...prev, currentSlip]);
      setCurrentSlip(null);
    }
    setPhase('turn-summary');
  };

  // --------------------------------------------------------------------------
  // Helper calculations for players and teams
  // --------------------------------------------------------------------------
  const getPlayersForTeam = (teamId: string) => {
    return players.filter(p => p.teamId === teamId);
  };

  const activeTeam = teams[activeTeamIndex] || teams[0];
  const activeTeamPlayers = getPlayersForTeam(activeTeam?.id);

  // Current active player for the turn
  const currentTeamPlayerTurnIndex =
    activeTeam && teamPlayerTurnIndices[activeTeam.id] !== undefined
      ? teamPlayerTurnIndices[activeTeam.id] % Math.max(1, activeTeamPlayers.length)
      : 0;
  const activePlayer = activeTeamPlayers[currentTeamPlayerTurnIndex] || activeTeamPlayers[0] || {
    id: 'unknown',
    name: 'Speler',
    teamId: activeTeam?.id,
  };

  // Next team and next player calculation for preview
  const nextTeamIndex = (activeTeamIndex + 1) % teams.length;
  const nextTeam = teams[nextTeamIndex] || teams[0];
  const nextTeamPlayers = getPlayersForTeam(nextTeam?.id);
  const nextTeamPlayerTurnIndex =
    nextTeam && teamPlayerTurnIndices[nextTeam.id] !== undefined
      ? (activeTeamIndex === nextTeamIndex
          ? teamPlayerTurnIndices[nextTeam.id] + 1
          : teamPlayerTurnIndices[nextTeam.id]) % Math.max(1, nextTeamPlayers.length)
      : 0;
  const nextPlayer = nextTeamPlayers[nextTeamPlayerTurnIndex] || nextTeamPlayers[0] || {
    id: 'unknown',
    name: 'Speler',
    teamId: nextTeam?.id,
  };

  const roundInfo = ROUND_DETAILS[currentRound];

  // --------------------------------------------------------------------------
  // Setup Actions
  // --------------------------------------------------------------------------
  const handleAddTeam = () => {
    if (teams.length >= 6) return;
    const newIdx = teams.length;
    const preset = VEGETABLE_TEAM_PRESETS[newIdx] || {
      name: `Team Salade ${newIdx + 1}`,
      emoji: '🥗',
      color: '#16a34a',
    };
    const newTeamId = `team-${Date.now()}`;
    const newTeam: Team = {
      id: newTeamId,
      name: `${preset.emoji} ${preset.name}`,
      color: preset.color,
      roundScores: [0, 0, 0],
    };
    // Default 1 player for the new team
    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name: `Speler ${players.length + 1}`,
      teamId: newTeamId,
    };

    setTeams(prev => [...prev, newTeam]);
    setPlayers(prev => [...prev, newPlayer]);
    sounds.playTick(750);
  };

  const handleRemoveTeam = (teamId: string) => {
    if (teams.length <= 2) return;
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setPlayers(prev => prev.filter(p => p.teamId !== teamId));
    sounds.playTick(500);
  };

  const handleAddPlayer = (teamId: string, customName?: string) => {
    const nameToAdd = customName !== undefined ? customName.trim() : (newPlayerNames[teamId] || '').trim();
    const finalName = nameToAdd || `Speler ${players.length + 1}`;
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: finalName,
      teamId,
    };
    setPlayers(prev => [...prev, newPlayer]);
    if (customName === undefined) {
      setNewPlayerNames(prev => ({ ...prev, [teamId]: '' }));
    }
    sounds.playTick(800);
  };

  const handleRemovePlayer = (playerId: string, teamId: string) => {
    const teamPlayerCount = players.filter(p => p.teamId === teamId).length;
    if (teamPlayerCount <= 1) return; // Keep at least 1 player per team
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    if (editingPlayerId === playerId) {
      setEditingPlayerId(null);
    }
    sounds.playTick(500);
  };

  const handleStartEditPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditingPlayerName(player.name);
    sounds.playTick(600);
  };

  const handleSavePlayerEdit = (playerId: string) => {
    const trimmed = editingPlayerName.trim();
    if (trimmed) {
      setPlayers(prev =>
        prev.map(p => (p.id === playerId ? { ...p, name: trimmed } : p))
      );
    }
    setEditingPlayerId(null);
    sounds.playTick(700);
  };

  const handleToggleCategory = (cat: SlabakkenCategory) => {
    const exists = selectedCategories.some(c => c.id === cat.id);
    if (exists) {
      if (selectedCategories.length <= 2) return; // Minimum 2 categories
      setSelectedCategories(prev => prev.filter(c => c.id !== cat.id));
    } else {
      if (selectedCategories.length >= 5) return; // Maximum 5 categories
      setSelectedCategories(prev => [...prev, cat]);
    }
    sounds.playTick(600);
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCatName.trim();
    if (!trimmed) return;
    const newCat: SlabakkenCategory = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      emoji: '💡',
      placeholder: `Bijv. een idee voor ${trimmed}...`,
      isCustom: true,
    };
    setSelectedCategories(prev => [...prev, newCat]);
    setCustomCatName('');
    sounds.playTick(800);
  };

  // --------------------------------------------------------------------------
  // Pass-and-Play Slip Collection Flow
  // --------------------------------------------------------------------------
  const handleStartPassAndPlay = () => {
    // Validate that every team has at least 1 player
    for (const t of teams) {
      if (getPlayersForTeam(t.id).length === 0) {
        return;
      }
    }
    if (players.length < 2) return;
    if (selectedCategories.length < 2) return;

    // Reset master slips and start with player index 0
    setMasterSlips([]);
    setFillPlayerIndex(0);
    setCurrentInputWords({});
    setPhase('pass-player');
    sounds.playFanfare();
  };

  const currentFillPlayer = players[fillPlayerIndex] || players[0];
  const currentFillTeam = teams.find(t => t.id === currentFillPlayer?.teamId) || teams[0];

  const handleSubmitPlayerWords = () => {
    // Check that all selected categories have a non-empty word
    const missing = selectedCategories.some(
      cat => !currentInputWords[cat.id] || !currentInputWords[cat.id].trim()
    );
    if (missing) return;

    // Build slips for this player
    const newSlips: SlabakkenSlip[] = selectedCategories.map(cat => ({
      id: `slip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      word: currentInputWords[cat.id].trim(),
      categoryId: cat.id,
      categoryName: cat.name,
      categoryEmoji: cat.emoji,
      authorId: currentFillPlayer.id,
      authorName: currentFillPlayer.name,
    }));

    const updatedMaster = [...masterSlips, ...newSlips];
    setMasterSlips(updatedMaster);
    setCurrentInputWords({});
    sounds.playCorrectDing();

    // Check if there are more players
    if (fillPlayerIndex + 1 < players.length) {
      setFillPlayerIndex(prev => prev + 1);
      setPhase('pass-player');
    } else {
      // All players have filled their slips!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setPhase('bowl-filled');
    }
  };

  // Start the actual game after the bowl is filled
  const handleStartRoundOne = () => {
    // Shuffle all collected slips into the bowl
    const shuffled = [...masterSlips].sort(() => Math.random() - 0.5);

    // Reset scores
    setTeams(prev =>
      prev.map(t => ({
        ...t,
        roundScores: [0, 0, 0],
      }))
    );

    // Initialize team turn indices
    const initialIndices: Record<string, number> = {};
    teams.forEach(t => {
      initialIndices[t.id] = 0;
    });
    setTeamPlayerTurnIndices(initialIndices);

    setBowlSlips(shuffled);
    setCurrentRound(1);
    setActiveTeamIndex(0);
    setCurrentSlip(null);
    setTurnGuessedSlips([]);
    setPhase('round-intro');
    sounds.playFanfare();
  };

  // --------------------------------------------------------------------------
  // Turn Gameplay Actions
  // --------------------------------------------------------------------------
  const handleBeginTurn = () => {
    if (bowlSlips.length === 0) {
      handleRoundCompleted();
      return;
    }

    const nextSlip = bowlSlips[0];
    const remaining = bowlSlips.slice(1);

    setCurrentSlip(nextSlip);
    setBowlSlips(remaining);
    setTurnGuessedSlips([]);
    setTimeLeft(turnDuration);
    setPhase('active-turn');
    sounds.playWhoosh();
  };

  const handleCorrectGuess = () => {
    if (!currentSlip) return;

    sounds.playCorrectDing();

    const guessed = currentSlip;
    const updatedGuessed = [...turnGuessedSlips, guessed];
    setTurnGuessedSlips(updatedGuessed);

    // Add point to active team
    setTeams(prev =>
      prev.map((team, idx) => {
        if (idx === activeTeamIndex) {
          const newScores = [...team.roundScores] as [number, number, number];
          newScores[currentRound - 1] += 1;
          return { ...team, roundScores: newScores };
        }
        return team;
      })
    );

    // If bowl is empty, round is completed!
    if (bowlSlips.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentSlip(null);
      handleRoundCompleted();
      return;
    }

    // Draw next slip
    const nextSlip = bowlSlips[0];
    const remaining = bowlSlips.slice(1);
    setCurrentSlip(nextSlip);
    setBowlSlips(remaining);
  };

  const handleSkipWord = () => {
    if (!currentSlip) return;
    sounds.playTick(450);

    if (bowlSlips.length === 0) return;

    const skipped = currentSlip;
    const nextSlip = bowlSlips[0];
    const remaining = [...bowlSlips.slice(1), skipped];

    setCurrentSlip(nextSlip);
    setBowlSlips(remaining);
  };

  const handleNextTurn = () => {
    if (bowlSlips.length === 0) {
      handleRoundCompleted();
      return;
    }

    // Advance this active team's internal player index
    setTeamPlayerTurnIndices(prev => ({
      ...prev,
      [activeTeam.id]: ((prev[activeTeam.id] || 0) + 1) % Math.max(1, activeTeamPlayers.length),
    }));

    // Advance to next team
    setActiveTeamIndex(prev => (prev + 1) % teams.length);
    setTurnGuessedSlips([]);
    setCurrentSlip(null);
    setPhase('ready-turn');
    sounds.playWiiSelect();
  };

  const handleRoundCompleted = () => {
    sounds.playReveal();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setPhase('round-summary');
  };

  const handleProceedToNextRound = () => {
    if (currentRound >= 3) {
      // Game Over! All 3 rounds completed
      setPhase('game-over');
      sounds.playFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      return;
    }

    // Next round: Refill the bowl with ALL master slips from round 1!
    const nextRoundNumber = (currentRound + 1) as 2 | 3;
    setCurrentRound(nextRoundNumber);

    const reshuffled = [...masterSlips].sort(() => Math.random() - 0.5);
    setBowlSlips(reshuffled);
    setCurrentSlip(null);
    setTurnGuessedSlips([]);

    // Advance turn to alternate starting team
    setActiveTeamIndex(prev => (prev + 1) % teams.length);
    setPhase('round-intro');
    sounds.playWiiSelect();
  };

  const handleConfirmReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem(STORAGE_KEY);
    setPhase('setup');
    setCurrentRound(1);
    setBowlSlips([]);
    setCurrentSlip(null);
    setTurnGuessedSlips([]);
    setMasterSlips([]);
    setShowResetConfirmModal(false);
    sounds.playTick(600);
  };

  // Scoreboard calculation
  const teamsWithTotalScore = teams.map(team => ({
    ...team,
    totalScore: team.roundScores[0] + team.roundScores[1] + team.roundScores[2],
    playerList: getPlayersForTeam(team.id),
  }));
  const sortedLeaderboard = [...teamsWithTotalScore].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto px-3 sm:px-4 pb-14 select-none">
      {/* =========================================================================
          1. SETUP PHASE: Teams, Personen toevoegen & Categorieën kiezen
         ========================================================================= */}
      {phase === 'setup' && (
        <div className="w-full space-y-3.5">
          {/* Teams & Players Configuration */}
          <div className="w-full bg-emerald-950/85 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border-2 border-emerald-500/40 shadow-xl text-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="font-black text-white text-sm sm:text-base">
                  Teams & Spelers ({players.length} spelers totaal)
                </h3>
              </div>
              {teams.length < 6 && (
                <button
                  onClick={handleAddTeam}
                  className="bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 border border-emerald-400/50 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Team Toevoegen</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {teams.map((team, tIdx) => {
                const teamPlayers = getPlayersForTeam(team.id);
                return (
                  <div
                    key={team.id}
                    className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-600/40"
                  >
                    {/* Team Header */}
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-emerald-600/40">
                      <div
                        className="w-4 h-4 rounded-full border border-white shadow-xs shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <input
                        type="text"
                        value={team.name}
                        onChange={e => {
                          const val = e.target.value;
                          setTeams(prev =>
                            prev.map(t => (t.id === team.id ? { ...t, name: val } : t))
                          );
                        }}
                        className="flex-1 font-black text-xs sm:text-sm text-slate-950 bg-white/95 px-2.5 py-1 rounded-xl border border-emerald-300 shadow-xs outline-none"
                        placeholder={`Team ${tIdx + 1}`}
                      />
                      <span className="text-[10px] font-bold text-emerald-300">
                        {teamPlayers.length} {teamPlayers.length === 1 ? 'speler' : 'spelers'}
                      </span>
                      {teams.length > 2 && (
                        <button
                          onClick={() => handleRemoveTeam(team.id)}
                          className="text-emerald-300 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          title="Verwijder dit team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Players in this team */}
                    <div className="space-y-1.5 mb-2.5">
                      {teamPlayers.map((p, pIdx) => {
                        const isEditing = editingPlayerId === p.id;
                        const mii = getMiiForPlayer(p.name);
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/95 border border-emerald-300 shadow-xs gap-1.5"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {mii ? (
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-emerald-400 shrink-0">
                                  <MiiFace avatar={mii} size={20} />
                                </div>
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center text-[10px] font-black shrink-0">
                                  {pIdx + 1}
                                </span>
                              )}

                              {isEditing ? (
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={editingPlayerName}
                                    onChange={e => setEditingPlayerName(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleSavePlayerEdit(p.id);
                                      if (e.key === 'Escape') setEditingPlayerId(null);
                                    }}
                                    className="px-2 py-0.5 text-xs font-bold bg-white text-slate-950 rounded-lg border border-emerald-500 outline-none w-full min-w-0"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSavePlayerEdit(p.id)}
                                    className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shrink-0"
                                    title="Opslaan"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <span className="font-black text-slate-900 text-xs truncate">
                                    {p.name}
                                  </span>
                                  <button
                                    onClick={() => handleStartEditPlayer(p)}
                                    className="opacity-50 hover:opacity-100 p-0.5 text-slate-400 hover:text-emerald-700 transition-opacity cursor-pointer shrink-0"
                                    title="Naam aanpassen"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {!isEditing && teamPlayers.length > 1 && (
                              <button
                                onClick={() => handleRemovePlayer(p.id, team.id)}
                                className="text-rose-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer shrink-0"
                                title="Verwijder speler"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Player Input + Dropdown from Spelers */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <input
                        type="text"
                        value={newPlayerNames[team.id] || ''}
                        onChange={e =>
                          setNewPlayerNames(prev => ({ ...prev, [team.id]: e.target.value }))
                        }
                        onKeyDown={e => e.key === 'Enter' && handleAddPlayer(team.id)}
                        placeholder="Nieuwe speler toevoegen..."
                        className="flex-1 min-w-[130px] px-2.5 py-1 text-xs font-bold bg-white/95 rounded-xl border border-emerald-300 text-slate-950 placeholder-slate-400 outline-none shadow-xs"
                      />
                      <button
                        onClick={() => handleAddPlayer(team.id)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-xs"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ Speler</span>
                      </button>
                      <PlayerPickerDropdown
                        compact
                        existingNames={players.map(pl => pl.name)}
                        buttonLabel="Speler"
                        buttonClassName="px-2 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/50 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                        onSelectPlayer={(name) => {
                          handleAddPlayer(team.id, name);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categories Selection */}
          <div className="w-full bg-emerald-950/85 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border-2 border-emerald-500/40 shadow-xl text-emerald-100">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400" />
                <h3 className="font-black text-white text-sm sm:text-base">
                  Kies de Categorieën ({selectedCategories.length})
                </h3>
              </div>
              <span className="text-[11px] font-black text-emerald-200 bg-emerald-800/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                {selectedCategories.length} briefjes p.p.
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-300/80 mb-3">
              Iedere speler vult zo meteen in het geheim 1 woord in voor elk van de gekozen categorieën.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
              {DEFAULT_CATEGORY_PRESETS.map(cat => {
                const isSelected = selectedCategories.some(c => c.id === cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700/80 border-emerald-300 text-white shadow-md'
                        : 'bg-emerald-900/40 border-emerald-700/40 text-emerald-200/70 hover:bg-emerald-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-xs font-black">
                        {cat.name}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 border-white text-white'
                          : 'border-emerald-600/60'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Category Input */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-emerald-700/40">
              <input
                type="text"
                value={customCatName}
                onChange={e => setCustomCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory()}
                placeholder="Voeg eigen categorie toe (bijv. Vakantieblunders)..."
                className="flex-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/80 border border-emerald-600/40 text-emerald-100 placeholder-emerald-400/50 outline-none"
              />
              <button
                onClick={handleAddCustomCategory}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
              >
                + Toevoegen
              </button>
            </div>
          </div>

          {/* Turn Duration Settings */}
          <div className="w-full bg-emerald-950/85 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border-2 border-emerald-500/40 shadow-xl text-emerald-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span className="font-black text-white text-xs sm:text-sm">
                  Timer per beurt:
                </span>
              </div>
              <div className="flex gap-1.5">
                {[30, 45, 60].map(sec => (
                  <button
                    key={sec}
                    onClick={() => setTurnDuration(sec)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      turnDuration === sec
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/90'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total briefjes summary banner */}
          <div className="p-3 rounded-2xl bg-emerald-900/80 border border-emerald-500/50 text-center text-xs font-bold text-emerald-100">
            📊 <span className="font-black">{players.length} spelers</span> ×{' '}
            <span className="font-black">{selectedCategories.length} categorieën</span> ={' '}
            <span className="font-black text-emerald-300">
              {players.length * selectedCategories.length} briefjes
            </span>{' '}
            in de slabak!
          </div>

          {/* Start Pass & Play button */}
          <button
            onClick={handleStartPassAndPlay}
            disabled={players.length < 2 || selectedCategories.length < 2}
            className="w-full py-4 rounded-2xl wii-btn-green font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Geef Telefoon Door & Vul Briefjes In!</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          2. PASS PHONE SCREEN ("Geef de telefoon aan [Speler]")
         ========================================================================= */}
      {phase === 'pass-player' && (
        <div className="w-full space-y-4 animate-in fade-in">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between px-2 text-xs font-black text-slate-400">
            <span>Briefjes Verzamelen</span>
            <span>
              Speler {fillPlayerIndex + 1} van {players.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((fillPlayerIndex) / players.length) * 100}%` }}
            />
          </div>

          {/* Big Pass Phone Card */}
          <div className="w-full wii-card rounded-3xl p-6 sm:p-8 text-center border-2 border-white shadow-xl relative overflow-hidden">
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg border-2 border-white mb-3"
              style={{ backgroundColor: currentFillTeam.color }}
            >
              🤫
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">
              Geef de telefoon aan:
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">
              {currentFillPlayer.name}
            </h2>
            <div
              className="inline-block px-3 py-0.5 rounded-full text-white text-xs font-extrabold mb-5"
              style={{ backgroundColor: currentFillTeam.color }}
            >
              {currentFillTeam.name}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 max-w-sm mx-auto mb-6">
              ⚠️ <strong>Geheim!</strong> Zorg dat niemand anders meekijkt op het scherm terwijl je jouw {selectedCategories.length} woorden verzint.
            </div>

            <button
              onClick={() => {
                setPhase('input-words');
                sounds.playTick(700);
              }}
              className="w-full py-4 rounded-2xl wii-btn-green font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <Eye className="w-5 h-5" />
              <span>Ik ben {currentFillPlayer.name}, laat me invullen!</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. INPUT WORDS SCREEN (Geheime briefjes invullen per categorie)
         ========================================================================= */}
      {phase === 'input-words' && (
        <div className="w-full space-y-3.5 animate-in fade-in">
          {/* Header */}
          <div className="w-full wii-card rounded-3xl p-4 text-center border-2 border-white shadow-md">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white"
                style={{ backgroundColor: currentFillTeam.color }}
              />
              <h2 className="text-lg font-black text-slate-800">
                {currentFillPlayer.name} ({currentFillTeam.name})
              </h2>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Verzin in het geheim <span className="font-black text-emerald-600">{selectedCategories.length} woorden</span> voor in de slabak:
            </p>
          </div>

          {/* Category Input Fields */}
          <div className="space-y-2.5">
            {selectedCategories.map((cat, idx) => (
              <div
                key={cat.id}
                className="w-full wii-card rounded-2xl p-3 border-2 border-white shadow-xs"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{cat.emoji}</span>
                  <div className="text-xs font-black text-slate-800">
                    Briefje #{idx + 1}: {cat.name}
                  </div>
                </div>
                <input
                  type="text"
                  value={currentInputWords[cat.id] || ''}
                  onChange={e =>
                    setCurrentInputWords(prev => ({ ...prev, [cat.id]: e.target.value }))
                  }
                  placeholder={cat.placeholder || 'Typ hier je geheime begrip...'}
                  className="w-full px-3 py-2 text-sm font-bold bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Submit Player Words Button */}
          <button
            onClick={handleSubmitPlayerWords}
            disabled={selectedCategories.some(
              cat => !currentInputWords[cat.id] || !currentInputWords[cat.id].trim()
            )}
            className="w-full py-4 rounded-2xl wii-btn-green font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-40"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Vouw Briefjes & Gooi in de Slabak! 🥗</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          4. BOWL FILLED CELEBRATION SCREEN
         ========================================================================= */}
      {phase === 'bowl-filled' && (
        <div className="w-full space-y-4 animate-in fade-in">
          <div className="w-full wii-card rounded-3xl p-6 sm:p-8 text-center border-2 border-white shadow-xl relative overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-green-400 to-lime-300 mx-auto flex items-center justify-center text-5xl shadow-xl border-4 border-white mb-4 animate-bounce">
              🥗
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>De Slabak is Gevuld!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Klaar voor de Strijd!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-sm mx-auto mb-6">
              Alle {players.length} spelers hebben hun briefjes ingeleverd. Er zitten in totaal{' '}
              <span className="font-black text-emerald-600">{masterSlips.length} geheime briefjes</span> in de kom!
            </p>

            <button
              onClick={handleStartRoundOne}
              className="w-full py-4 rounded-2xl wii-btn-green font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Ronde 1: Omschrijven 🗣️</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. ROUND INTRO SCREEN (Uitleg per ronde)
         ========================================================================= */}
      {phase === 'round-intro' && (
        <div className="w-full space-y-4 animate-in fade-in">
          <div className="w-full wii-card rounded-3xl p-5 sm:p-6 text-center border-2 border-white shadow-xl relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{roundInfo.badge}</span>
            </div>

            <div className="text-5xl mb-2">{roundInfo.icon}</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              {roundInfo.title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1 max-w-sm mx-auto">
              {roundInfo.subtitle}
            </p>

            {/* Rules box */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
                De Regels voor deze ronde:
              </span>
              {roundInfo.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-black">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            {/* Allowed vs Forbidden */}
            <div className="grid grid-cols-2 gap-2 text-left mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900">
                <span className="font-black block text-emerald-700 uppercase tracking-wider text-[10px] mb-0.5">
                  ✓ Wel toegestaan:
                </span>
                {roundInfo.allowed}
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-900">
                <span className="font-black block text-rose-700 uppercase tracking-wider text-[10px] mb-0.5">
                  ✕ NIET toegestaan:
                </span>
                {roundInfo.forbidden}
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500 mb-4">
              Er zitten <span className="font-black text-emerald-600">{masterSlips.length} briefjes</span> in de kom.
            </div>

            <button
              onClick={() => {
                setPhase('ready-turn');
                sounds.playWiiSelect();
              }}
              className="w-full py-3.5 rounded-2xl wii-btn-blue font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <span>Begrepen! Start Ronde {currentRound}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. READY TURN SCREEN (Toont WIE er aan de beurt is!)
         ========================================================================= */}
      {phase === 'ready-turn' && (
        <div className="w-full space-y-3 animate-in fade-in">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black text-slate-500">
              Ronde {currentRound} • {roundInfo.title}
            </span>
            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {bowlSlips.length} in de slabak
            </span>
          </div>

          {/* Turn Ready Card */}
          <div className="w-full wii-card rounded-3xl p-6 text-center border-2 border-white shadow-xl relative overflow-hidden">
            {/* Active Team Color Accent */}
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg border-2 border-white mb-3"
              style={{ backgroundColor: activeTeam.color }}
            >
              {roundInfo.icon}
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-0.5">
              Nu aan de beurt:
            </span>

            {/* Prominent Player Name */}
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">
              {activePlayer.name}
            </h2>

            {/* Team Badge */}
            <div
              className="inline-block px-3 py-0.5 rounded-full text-slate-950 text-xs font-black mb-3 shadow-xs border border-white/60"
              style={{ backgroundColor: activeTeam.color }}
            >
              {activeTeam.name}
            </div>

            {/* Clear Role Description */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 max-w-xs mx-auto mb-4">
              {roundInfo.icon} <span className="text-slate-900 font-black">{activePlayer.name}</span> {roundInfo.verb} <span style={{ color: activeTeam.color }} className="font-black">{activeTeam.name}</span>
            </div>

            {/* Next Up Preview */}
            <div className="text-[11px] font-semibold text-slate-400 mb-6">
              Hierna aan de beurt: <span className="font-bold text-slate-600">{nextPlayer.name} ({nextTeam.name})</span>
            </div>

            {/* Start Button */}
            <button
              onClick={handleBeginTurn}
              className="w-full py-4 rounded-2xl wii-btn-green font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Mijn Beurt ({turnDuration}s)</span>
            </button>
          </div>

          {/* Current Score Standings */}
          <div className="w-full wii-card rounded-2xl p-3 border border-white">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Tussenstand Ronde {currentRound}:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {teams.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {t.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {t.roundScores[0] + t.roundScores[1] + t.roundScores[2]} pt
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. ACTIVE TURN SCREEN (Timer, Briefje met Categorie & Actieknoppen)
         ========================================================================= */}
      {phase === 'active-turn' && (
        <div className="w-full space-y-3 animate-in fade-in">
          {/* Top Live Bar: Player & Team prominently shown */}
          <div className="w-full flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                style={{ backgroundColor: activeTeam.color }}
              />
              <span className="text-xs font-black text-slate-800">
                {activePlayer.name}{' '}
                <span className="text-slate-400 font-bold">({activeTeam.name})</span>
              </span>
            </div>

            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-white">
              {roundInfo.title}
            </span>

            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {bowlSlips.length + 1} in slabak
            </span>
          </div>

          {/* Circular Countdown Timer */}
          <div className="w-full flex flex-col items-center justify-center my-1">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke={timeLeft <= 5 ? '#ef4444' : '#10b981'}
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * timeLeft) / turnDuration}
                  strokeLinecap="round"
                  className="transition-all duration-1000 linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-2xl font-black font-mono tracking-tight ${
                    timeLeft <= 5 ? 'text-rose-600 animate-pulse scale-110' : 'text-slate-800'
                  }`}
                >
                  {timeLeft}
                </span>
                <span className="text-[9px] font-bold text-slate-400 -mt-1 uppercase">
                  sec
                </span>
              </div>
            </div>
          </div>

          {/* Active Word Slip */}
          <div className="w-full min-h-[160px] sm:min-h-[190px] rounded-3xl bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#edf2f7] border-4 border-white shadow-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Top Slip Color Bar */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400" />
            <div className="absolute top-3 right-3 text-xs font-bold text-slate-300">
              #{turnGuessedSlips.length + 1}
            </div>

            {/* Category Pill on the slip */}
            {currentSlip && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-700 mb-2">
                <span>{currentSlip.categoryEmoji}</span>
                <span>{currentSlip.categoryName}</span>
              </div>
            )}

            {/* The Secret Word */}
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight my-2 drop-shadow-xs break-words max-w-full">
              {currentSlip?.word}
            </h2>

            <span className="text-[11px] font-semibold text-slate-400 mt-1">
              {roundInfo.subtitle}
            </span>
          </div>

          {/* Action Buttons: Pass vs Correct */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleSkipWord}
              className="py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 font-black text-sm sm:text-base shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Pas / Overslaan</span>
            </button>

            <button
              onClick={handleCorrectGuess}
              className="py-4 rounded-2xl wii-btn-green font-black text-sm sm:text-base shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>Goed! (+1)</span>
            </button>
          </div>

          {/* Live Turn Score Bar */}
          <div className="text-center pt-1 text-xs font-bold text-slate-500">
            Deze beurt geraden: <span className="font-black text-emerald-600">{turnGuessedSlips.length} briefjes</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. TURN SUMMARY SCREEN
         ========================================================================= */}
      {phase === 'turn-summary' && (
        <div className="w-full space-y-3 animate-in fade-in">
          <div className="w-full wii-card rounded-3xl p-5 text-center border-2 border-white shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-3xl mb-2">
              ⏰
            </div>

            <h2 className="text-2xl font-black text-slate-800">
              Tijd is om!
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Beurt voor <span className="font-black text-slate-800">{activePlayer.name}</span> ({activeTeam.name}) is afgelopen.
            </p>

            {/* Score in this turn */}
            <div className="my-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-3xl font-black text-emerald-700 block">
                +{turnGuessedSlips.length}
              </span>
              <span className="text-xs font-bold text-emerald-900">
                {turnGuessedSlips.length === 1 ? 'briefje goed geraden' : 'briefjes goed geraden'}
              </span>
            </div>

            {/* List of guessed slips in this turn */}
            {turnGuessedSlips.length > 0 && (
              <div className="text-left mb-4">
                <span className="text-[11px] font-black uppercase text-slate-400 block mb-1">
                  Geraden deze beurt:
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  {turnGuessedSlips.map((slip, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1"
                    >
                      <span>{slip.categoryEmoji}</span>
                      <span>{slip.word}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs font-bold text-slate-500 mb-4">
              Nog <span className="font-black text-slate-800">{bowlSlips.length} briefjes</span> in de slabak.
            </div>

            {/* Next Team Turn Button */}
            <button
              onClick={handleNextTurn}
              className="w-full py-3.5 rounded-2xl wii-btn-blue font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <span>Volgende Beurt ({nextPlayer.name} • {nextTeam.name})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. ROUND SUMMARY SCREEN (Kom is leeg!)
         ========================================================================= */}
      {phase === 'round-summary' && (
        <div className="w-full space-y-4 animate-in fade-in">
          <div className="w-full wii-card rounded-3xl p-5 text-center border-2 border-white shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl mb-2">
              🥗
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 block mb-0.5">
              De Slabak is Leeg!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              Ronde {currentRound} Voltooid!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Alle briefjes zijn geraden. Voor de volgende ronde gaan alle briefjes weer terug in de kom!
            </p>

            {/* Points scored in this round */}
            <div className="space-y-2 mb-5">
              {teams.map(team => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white"
                      style={{ backgroundColor: team.color }}
                    />
                    <div>
                      <span className="font-extrabold text-slate-800 text-sm block">
                        {team.name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {getPlayersForTeam(team.id).map(p => p.name).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base text-slate-900 block">
                      +{team.roundScores[currentRound - 1]} pt
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Totaal: {team.roundScores[0] + team.roundScores[1] + team.roundScores[2]} pt
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleProceedToNextRound}
              className="w-full py-3.5 rounded-2xl wii-btn-green font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <span>
                {currentRound >= 3
                  ? 'Bekijk de Einduitslag! 🏆'
                  : `Door naar Ronde ${currentRound + 1} (${ROUND_DETAILS[currentRound + 1]?.title.split(':')[1]})`}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. GAME OVER SCREEN (Einduitslag & Podium)
         ========================================================================= */}
      {phase === 'game-over' && (
        <div className="w-full space-y-4 animate-in fade-in">
          <div className="w-full wii-card rounded-3xl p-6 text-center border-4 border-amber-300 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white mx-auto flex items-center justify-center text-4xl shadow-lg mb-3">
              👑
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-amber-700 block mb-0.5">
              Gefeliciteerd!
            </span>
            <h2 className="text-3xl font-black text-slate-800">
              {sortedLeaderboard[0]?.name} Wint!
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1 mb-5">
              Kampioen van het Slabakken Spel met {sortedLeaderboard[0]?.totalScore} punten!
            </p>

            {/* Leaderboard Table with Round Breakdown & Players */}
            <div className="space-y-2 mb-6">
              {sortedLeaderboard.map((team, rank) => (
                <div
                  key={team.id}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between ${
                    rank === 0
                      ? 'bg-amber-50/90 border-amber-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {rank === 0 && '🥇'}
                      {rank === 1 && '🥈'}
                      {rank === 2 && '🥉'}
                      {rank > 2 && `#${rank + 1}`}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="font-extrabold text-slate-800 text-sm">
                          {team.name}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                        {team.playerList.map(p => p.name).join(', ')}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                        R1: {team.roundScores[0]} • R2: {team.roundScores[1]} • R3: {team.roundScores[2]}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 block">
                      {team.totalScore}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      punten
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Restart Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Play again with same master slips
                  const reshuffled = [...masterSlips].sort(() => Math.random() - 0.5);
                  setTeams(prev => prev.map(t => ({ ...t, roundScores: [0, 0, 0] })));
                  setBowlSlips(reshuffled);
                  setCurrentRound(1);
                  setActiveTeamIndex(0);
                  setPhase('round-intro');
                  sounds.playFanfare();
                }}
                className="w-full py-3 rounded-2xl wii-btn-green font-black text-sm shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revanche met dezelfde briefjes</span>
              </button>

              <button
                onClick={handleConfirmReset}
                className="w-full py-2.5 rounded-2xl wii-btn-white font-bold text-xs cursor-pointer"
              >
                Nieuw Spel met nieuwe briefjes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: Rules & Reset Confirmation
         ========================================================================= */}
      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 max-w-sm w-full border-4 border-emerald-300 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥗</span>
                <h3 className="font-black text-slate-800 text-base">
                  Spelregels Slabakken
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="font-extrabold text-emerald-950 mb-0.5">
                  Het Doel van het Spel
                </p>
                <p className="text-[11px] leading-relaxed">
                  Raad samen met je team zoveel mogelijk briefjes uit de slabak binnen 30 seconden per beurt. Het spel bestaat uit 3 rondes met exact dezelfde briefjes!
                </p>
              </div>

              <div>
                <p className="font-black text-slate-800 mb-0.5">
                  Ronde 1: Omschrijven 🗣️
                </p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Leg het begrip uit aan je team. Je mag alles zeggen, behalve het woord zelf of vertalingen. Goed geraden? Pak snel een nieuw briefje!
                </p>
              </div>

              <div>
                <p className="font-black text-slate-800 mb-0.5">
                  Ronde 2: Uitbeelden 🎭
                </p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Alle briefjes gaan weer terug in de kom! Je mag niet praten of geluid maken; alleen uitbeelden met gebaren en bewegingen (zoals Hints).
                </p>
              </div>

              <div>
                <p className="font-black text-slate-800 mb-0.5">
                  Ronde 3: Eén Woord ☝️
                </p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Alle briefjes gaan opnieuw terug in de kom. Je mag nu nog maar ÉÉN enkel woord roepen als hint om je team te helpen!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-full wii-btn-blue font-black text-xs shadow-md cursor-pointer mt-1"
            >
              Ik snap het!
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 text-center border-4 border-rose-300 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">
              Spel Resetten?
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-4">
              Weet je zeker dat je het huidige Slabakken spel wilt beëindigen en terug wilt naar het instellingenmenu?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2 rounded-full wii-btn-white font-extrabold text-xs shadow-xs cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2 rounded-full wii-btn-red font-extrabold text-xs shadow-md cursor-pointer"
              >
                Reset naar Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-game Floating Reset button if in game */}
      {phase !== 'setup' && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-full bg-white/70 border border-slate-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Spel Opnieuw Beginnen</span>
          </button>
        </div>
      )}
    </div>
  );
}

