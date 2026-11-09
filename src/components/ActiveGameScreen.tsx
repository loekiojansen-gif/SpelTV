import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Beer,
  Gamepad2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  Check,
  Home,
  Flag,
  Trophy,
  ArrowRight,
  ListChecks,
  AlertCircle,
  Users,
  Pencil,
  Trash2,
  Palette,
  X,
  Sparkles,
  Dices,
} from 'lucide-react';
import { PubItem, DrinkItem, ChallengeItem, Team, Round } from '../types';
import { ScoreboardModal } from './ScoreboardModal';
import { sounds } from '../utils/audio';

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

interface ActiveGameScreenProps {
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
  teams: Team[];
  rounds: Round[];
  currentRoundNumber: number;
  initialHoleNumber?: number;
  showCourseChecklist?: boolean;
  onToggleCourseChecklist?: (show: boolean) => void;
  onExitToHome: () => void;
  onBackToTeams?: () => void;
  onFinishGame: () => void;
  onCompleteRound: (completedRound: Round) => void;
  onUpdateRound: (updatedRound: Round) => void;
  onAddPub: (newPub: PubItem) => void;
  onAddDrink: (newDrink: DrinkItem) => void;
  onAddChallenge: (newChallenge: ChallengeItem) => void;
  onUpdateTeams: (teams: Team[]) => void;
}

export function ActiveGameScreen({
  pubs,
  drinks,
  challenges,
  teams,
  rounds,
  currentRoundNumber,
  initialHoleNumber,
  showCourseChecklist: externalShowCourseChecklist,
  onToggleCourseChecklist,
  onExitToHome,
  onBackToTeams,
  onFinishGame,
  onCompleteRound,
  onUpdateRound,
  onAddPub,
  onAddDrink,
  onAddChallenge,
  onUpdateTeams,
}: ActiveGameScreenProps) {
  // Navigation / viewing hole state (allows going back to inspect & edit previous holes!)
  const [viewingHoleNumber, setViewingHoleNumber] = useState<number>(() => {
    if (initialHoleNumber && initialHoleNumber >= 1 && initialHoleNumber <= currentRoundNumber) {
      return initialHoleNumber;
    }
    return currentRoundNumber;
  });

  // Preserve in-progress draft for the active hole when viewing a previous hole
  const [activeDraft, setActiveDraft] = useState<{
    pubId: string;
    drinkId: string;
    challengeId: string;
    scores: Record<string, number>;
  } | null>(null);

  // Determine which items have already been completed across previous rounds
  const usedPubIds = useMemo(() => new Set(rounds.map((r) => r.pubId)), [rounds]);
  const usedDrinkIds = useMemo(() => new Set(rounds.map((r) => r.drinkId)), [rounds]);
  const usedChallengeIds = useMemo(() => new Set(rounds.map((r) => r.challengeId)), [rounds]);

  // Current selections for this round (default to first unused, or first in list)
  const defaultPub = pubs.find((p) => !usedPubIds.has(p.id)) || pubs[0];
  const defaultDrink = drinks.find((d) => !usedDrinkIds.has(d.id)) || drinks[0];
  const defaultChallenge = challenges.find((c) => !usedChallengeIds.has(c.id)) || challenges[0];

  const [selectedPubId, setSelectedPubId] = useState<string>(() => {
    if (initialHoleNumber && initialHoleNumber < currentRoundNumber) {
      const prevR = rounds.find((r) => r.roundNumber === initialHoleNumber);
      if (prevR) return prevR.pubId;
    }
    return defaultPub?.id || '';
  });

  const [selectedDrinkId, setSelectedDrinkId] = useState<string>(() => {
    if (initialHoleNumber && initialHoleNumber < currentRoundNumber) {
      const prevR = rounds.find((r) => r.roundNumber === initialHoleNumber);
      if (prevR) return prevR.drinkId;
    }
    return defaultDrink?.id || '';
  });

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(() => {
    if (initialHoleNumber && initialHoleNumber < currentRoundNumber) {
      const prevR = rounds.find((r) => r.roundNumber === initialHoleNumber);
      if (prevR) return prevR.challengeId;
    }
    return defaultChallenge?.id || '';
  });

  // Modals
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [internalShowCourseChecklist, setInternalShowCourseChecklist] = useState(false);
  const showCourseChecklist = externalShowCourseChecklist !== undefined ? externalShowCourseChecklist : internalShowCourseChecklist;
  const setShowCourseChecklist = (show: boolean) => {
    if (onToggleCourseChecklist) {
      onToggleCourseChecklist(show);
    }
    setInternalShowCourseChecklist(show);
  };
  const [activePicker, setActivePicker] = useState<'pub' | 'drink' | 'challenge' | null>(null);

  // Slot Machine Randomizer state
  const [isSlotSpinning, setIsSlotSpinning] = useState(false);
  const [slotReelsSpinning, setSlotReelsSpinning] = useState({
    pub: false,
    drink: false,
    challenge: false,
  });
  // 3D Cylinder items: prev (tilted top), current (center payline), next (tilted bottom)
  const [drumPub, setDrumPub] = useState<{ prev: string; current: string; next: string }>({
    prev: '',
    current: '',
    next: '',
  });
  const [drumDrink, setDrumDrink] = useState<{ prev: string; current: string; next: string }>({
    prev: '',
    current: '',
    next: '',
  });
  const [drumChallenge, setDrumChallenge] = useState<{ prev: string; current: string; next: string }>({
    prev: '',
    current: '',
    next: '',
  });
  const [slotShowJackpot, setSlotShowJackpot] = useState(false);

  // Subtle sparkle / confetti particles
  const [slotParticles, setSlotParticles] = useState<
    Array<{ id: number; char: string; tx: number; ty: number; color: string; size: number }>
  >([]);

  // Front-view Lever interaction state
  const [leverProgress, setLeverProgress] = useState(0); // 0 (top) to 1 (bottom pull)
  const isDraggingLeverRef = useRef(false);
  const leverStartYRef = useRef(0);
  const leverMaxTravel = 48; // px down the vertical slot track

  // Synchronize when currentRoundNumber advances
  useEffect(() => {
    setViewingHoleNumber(currentRoundNumber);
    setActiveDraft(null);
  }, [currentRoundNumber]);

  // Handle external jump request
  useEffect(() => {
    if (initialHoleNumber && initialHoleNumber >= 1 && initialHoleNumber <= currentRoundNumber) {
      if (initialHoleNumber !== viewingHoleNumber) {
        handleNavigateHole(initialHoleNumber);
      }
    }
  }, [initialHoleNumber]);

  // Scroll to top automatically when advancing or switching holes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [viewingHoleNumber]);

  // Teams management during game modal
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newPlayerNameInput, setNewPlayerNameInput] = useState('');

  // Inline Add Item modal state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemExtra, setNewItemExtra] = useState('');

  const openPicker = (type: 'pub' | 'drink' | 'challenge') => {
    setActivePicker(type);
    setIsAddingNew(false);
    setNewItemName('');
    setNewItemExtra('');
    sounds.playTick(700);
  };

  const handleAddNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (activePicker === 'pub') {
      const newPub: PubItem = {
        id: `pub-${Date.now()}`,
        name: newItemName.trim(),
        location: newItemExtra.trim() || undefined,
      };
      onAddPub(newPub);
      setSelectedPubId(newPub.id);
      if (viewingHoleNumber < currentRoundNumber) {
        autoSavePreviousHole({ pubId: newPub.id });
      }
    } else if (activePicker === 'drink') {
      const newDrink: DrinkItem = {
        id: `drink-${Date.now()}`,
        name: newItemName.trim(),
        category: newItemExtra.trim() || 'Drankje',
      };
      onAddDrink(newDrink);
      setSelectedDrinkId(newDrink.id);
      if (viewingHoleNumber < currentRoundNumber) {
        autoSavePreviousHole({ drinkId: newDrink.id });
      }
    } else if (activePicker === 'challenge') {
      const newChallenge: ChallengeItem = {
        id: `ch-${Date.now()}`,
        title: newItemName.trim(),
        description: newItemExtra.trim() || 'Minigame voor deze ronde.',
      };
      onAddChallenge(newChallenge);
      setSelectedChallengeId(newChallenge.id);
      if (viewingHoleNumber < currentRoundNumber) {
        autoSavePreviousHole({ challengeId: newChallenge.id });
      }
    }

    setIsAddingNew(false);
    setActivePicker(null);
    setNewItemName('');
    setNewItemExtra('');
    sounds.playReveal();
  };

  // Scores for current hole: teamId -> slokken/punten (minpunten toegestaan!)
  const [teamScores, setTeamScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    teams.forEach((t) => {
      initial[t.id] = 1;
    });
    return initial;
  });

  // Dynamic totals that react immediately whether editing previous hole or playing active hole
  const projectedTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    teams.forEach((t) => (totals[t.id] = 0));

    if (viewingHoleNumber < currentRoundNumber) {
      rounds.forEach((r) => {
        if (r.roundNumber !== viewingHoleNumber) {
          Object.entries(r.scores).forEach(([tId, scoreVal]) => {
            totals[tId] = (totals[tId] || 0) + scoreVal;
          });
        }
      });
      Object.entries(teamScores).forEach(([tId, scoreVal]) => {
        totals[tId] = (totals[tId] || 0) + scoreVal;
      });
    } else {
      rounds.forEach((r) => {
        Object.entries(r.scores).forEach(([tId, scoreVal]) => {
          totals[tId] = (totals[tId] || 0) + scoreVal;
        });
      });
      Object.entries(teamScores).forEach(([tId, scoreVal]) => {
        totals[tId] = (totals[tId] || 0) + scoreVal;
      });
    }

    return totals;
  }, [teams, rounds, viewingHoleNumber, currentRoundNumber, teamScores]);

  const currentPub = pubs.find((p) => p.id === selectedPubId) || pubs[0];
  const currentDrink = drinks.find((d) => d.id === selectedDrinkId) || drinks[0];
  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  const isEditingPreviousHole = viewingHoleNumber < currentRoundNumber;

  // Navigate between holes (inspect & adjust previous holes, return to active hole)
  const handleNavigateHole = (targetHoleNumber: number) => {
    if (targetHoleNumber < 1 || targetHoleNumber > currentRoundNumber) return;
    sounds.playTick(650);

    // When leaving the active hole, remember draft
    if (viewingHoleNumber === currentRoundNumber && targetHoleNumber < currentRoundNumber) {
      setActiveDraft({
        pubId: selectedPubId,
        drinkId: selectedDrinkId,
        challengeId: selectedChallengeId,
        scores: { ...teamScores },
      });
    }

    setViewingHoleNumber(targetHoleNumber);

    if (targetHoleNumber < currentRoundNumber) {
      const targetRound = rounds.find((r) => r.roundNumber === targetHoleNumber);
      if (targetRound) {
        setSelectedPubId(targetRound.pubId);
        setSelectedDrinkId(targetRound.drinkId);
        setSelectedChallengeId(targetRound.challengeId);
        const scores: Record<string, number> = {};
        teams.forEach((t) => {
          scores[t.id] = targetRound.scores[t.id] ?? 1;
        });
        setTeamScores(scores);
      }
    } else {
      // Returning to active hole
      if (activeDraft) {
        setSelectedPubId(activeDraft.pubId);
        setSelectedDrinkId(activeDraft.drinkId);
        setSelectedChallengeId(activeDraft.challengeId);
        setTeamScores(activeDraft.scores);
      } else {
        const fallbackPub = pubs.find((p) => !usedPubIds.has(p.id)) || pubs[0];
        const fallbackDrink = drinks.find((d) => !usedDrinkIds.has(d.id)) || drinks[0];
        const fallbackChallenge = challenges.find((c) => !usedChallengeIds.has(c.id)) || challenges[0];
        if (fallbackPub) setSelectedPubId(fallbackPub.id);
        if (fallbackDrink) setSelectedDrinkId(fallbackDrink.id);
        if (fallbackChallenge) setSelectedChallengeId(fallbackChallenge.id);
        const resetScores: Record<string, number> = {};
        teams.forEach((t) => {
          resetScores[t.id] = 1;
        });
        setTeamScores(resetScores);
      }
    }
  };

  // Auto-save changes immediately when adjusting a previous hole
  const autoSavePreviousHole = (changes: {
    pubId?: string;
    drinkId?: string;
    challengeId?: string;
    scores?: Record<string, number>;
  }) => {
    if (viewingHoleNumber >= currentRoundNumber) return;
    const existingRound = rounds.find((r) => r.roundNumber === viewingHoleNumber);
    if (!existingRound) return;

    const roundScores: Record<string, number> = {};
    teams.forEach((team) => {
      roundScores[team.id] = (changes.scores ? changes.scores[team.id] : teamScores[team.id]) ?? 1;
    });

    const updatedRound: Round = {
      roundNumber: viewingHoleNumber,
      pubId: changes.pubId ?? selectedPubId,
      drinkId: changes.drinkId ?? selectedDrinkId,
      challengeId: changes.challengeId ?? selectedChallengeId,
      scores: roundScores,
      timestamp: existingRound.timestamp || Date.now(),
    };

    onUpdateRound(updatedRound);
  };

  // Keep 3D drum cylinder items aligned with selected items when not spinning
  useEffect(() => {
    if (isSlotSpinning) return;
    if (pubs.length > 0) {
      const idx = pubs.findIndex((p) => p.id === selectedPubId);
      const safeIdx = idx >= 0 ? idx : 0;
      const prevIdx = (safeIdx - 1 + pubs.length) % pubs.length;
      const nextIdx = (safeIdx + 1) % pubs.length;
      setDrumPub({
        prev: pubs[prevIdx]?.name || '',
        current: pubs[safeIdx]?.name || '',
        next: pubs[nextIdx]?.name || '',
      });
    }
  }, [pubs, selectedPubId, isSlotSpinning]);

  useEffect(() => {
    if (isSlotSpinning) return;
    if (drinks.length > 0) {
      const idx = drinks.findIndex((d) => d.id === selectedDrinkId);
      const safeIdx = idx >= 0 ? idx : 0;
      const prevIdx = (safeIdx - 1 + drinks.length) % drinks.length;
      const nextIdx = (safeIdx + 1) % drinks.length;
      setDrumDrink({
        prev: drinks[prevIdx]?.name || '',
        current: drinks[safeIdx]?.name || '',
        next: drinks[nextIdx]?.name || '',
      });
    }
  }, [drinks, selectedDrinkId, isSlotSpinning]);

  useEffect(() => {
    if (isSlotSpinning) return;
    if (challenges.length > 0) {
      const idx = challenges.findIndex((c) => c.id === selectedChallengeId);
      const safeIdx = idx >= 0 ? idx : 0;
      const prevIdx = (safeIdx - 1 + challenges.length) % challenges.length;
      const nextIdx = (safeIdx + 1) % challenges.length;
      setDrumChallenge({
        prev: challenges[prevIdx]?.title || '',
        current: challenges[safeIdx]?.title || '',
        next: challenges[nextIdx]?.title || '',
      });
    }
  }, [challenges, selectedChallengeId, isSlotSpinning]);

  // Slot Machine random selection logic (slower, authentic 3D cylinder drum rotation)
  const handleSpinSlotMachine = useCallback(() => {
    if (isSlotSpinning) return;

    // Front-view mechanical lever downward slide & spring release animation
    setLeverProgress(1);
    sounds.playWhoosh();
    setTimeout(() => {
      setLeverProgress(0);
    }, 300);

    setIsSlotSpinning(true);
    setSlotShowJackpot(false);
    setSlotParticles([]);
    setSlotReelsSpinning({ pub: true, drink: true, challenge: true });

    // Ensure slot machine ONLY spins & selects items NOT yet used in earlier holes
    const earlierUsedPubIds = new Set(
      rounds.filter((r) => r.roundNumber !== viewingHoleNumber).map((r) => r.pubId)
    );
    const earlierUsedDrinkIds = new Set(
      rounds.filter((r) => r.roundNumber !== viewingHoleNumber).map((r) => r.drinkId)
    );
    const earlierUsedChallengeIds = new Set(
      rounds.filter((r) => r.roundNumber !== viewingHoleNumber).map((r) => r.challengeId)
    );

    const unusedPubs = pubs.filter((p) => !earlierUsedPubIds.has(p.id));
    const poolPubs = unusedPubs.length > 0 ? unusedPubs : pubs;
    const targetPub = poolPubs[Math.floor(Math.random() * poolPubs.length)] || pubs[0];

    const unusedDrinks = drinks.filter((d) => !earlierUsedDrinkIds.has(d.id));
    const poolDrinks = unusedDrinks.length > 0 ? unusedDrinks : drinks;
    const targetDrink = poolDrinks[Math.floor(Math.random() * poolDrinks.length)] || drinks[0];

    const unusedChallenges = challenges.filter((c) => !earlierUsedChallengeIds.has(c.id));
    const poolChallenges = unusedChallenges.length > 0 ? unusedChallenges : challenges;
    const targetChallenge = poolChallenges[Math.floor(Math.random() * poolChallenges.length)] || challenges[0];

    // Slower, visible drum roll loop - only cycling through unused candidates
    let pubRollIdx = Math.floor(Math.random() * Math.max(1, poolPubs.length));
    let drinkRollIdx = Math.floor(Math.random() * Math.max(1, poolDrinks.length));
    let chRollIdx = Math.floor(Math.random() * Math.max(1, poolChallenges.length));

    let pubRolling = true;
    let drinkRolling = true;
    let chRolling = true;
    let tickCount = 0;

    const interval = setInterval(() => {
      tickCount++;
      sounds.playTick(500 + (tickCount % 5) * 50);

      if (pubRolling && poolPubs.length > 0) {
        pubRollIdx = (pubRollIdx + 1) % poolPubs.length;
        const prev = poolPubs[(pubRollIdx - 1 + poolPubs.length) % poolPubs.length]?.name || '';
        const current = poolPubs[pubRollIdx]?.name || '';
        const next = poolPubs[(pubRollIdx + 1) % poolPubs.length]?.name || '';
        setDrumPub({ prev, current, next });
      }

      if (drinkRolling && poolDrinks.length > 0) {
        drinkRollIdx = (drinkRollIdx + 1) % poolDrinks.length;
        const prev = poolDrinks[(drinkRollIdx - 1 + poolDrinks.length) % poolDrinks.length]?.name || '';
        const current = poolDrinks[drinkRollIdx]?.name || '';
        const next = poolDrinks[(drinkRollIdx + 1) % poolDrinks.length]?.name || '';
        setDrumDrink({ prev, current, next });
      }

      if (chRolling && poolChallenges.length > 0) {
        chRollIdx = (chRollIdx + 1) % poolChallenges.length;
        const prev = poolChallenges[(chRollIdx - 1 + poolChallenges.length) % poolChallenges.length]?.title || '';
        const current = poolChallenges[chRollIdx]?.title || '';
        const next = poolChallenges[(chRollIdx + 1) % poolChallenges.length]?.title || '';
        setDrumChallenge({ prev, current, next });
      }
    }, 135);

    // Stop Reel 1: Café (~1500ms)
    setTimeout(() => {
      pubRolling = false;
      setSlotReelsSpinning((prev) => ({ ...prev, pub: false }));
      if (targetPub) {
        setSelectedPubId(targetPub.id);
        const idx = pubs.findIndex((p) => p.id === targetPub.id);
        const sIdx = idx >= 0 ? idx : 0;
        setDrumPub({
          prev: pubs[(sIdx - 1 + pubs.length) % pubs.length]?.name || '',
          current: targetPub.name,
          next: pubs[(sIdx + 1) % pubs.length]?.name || '',
        });
        sounds.playTick(440);
      }
    }, 1500);

    // Stop Reel 2: Drankje (~2400ms)
    setTimeout(() => {
      drinkRolling = false;
      setSlotReelsSpinning((prev) => ({ ...prev, drink: false }));
      if (targetDrink) {
        setSelectedDrinkId(targetDrink.id);
        const idx = drinks.findIndex((d) => d.id === targetDrink.id);
        const sIdx = idx >= 0 ? idx : 0;
        setDrumDrink({
          prev: drinks[(sIdx - 1 + drinks.length) % drinks.length]?.name || '',
          current: targetDrink.name,
          next: drinks[(sIdx + 1) % drinks.length]?.name || '',
        });
        sounds.playTick(500);
      }
    }, 2400);

    // Stop Reel 3: Minigame (~3300ms)
    setTimeout(() => {
      chRolling = false;
      clearInterval(interval);
      setSlotReelsSpinning({ pub: false, drink: false, challenge: false });
      setIsSlotSpinning(false);
      setSlotShowJackpot(true);

      if (targetChallenge) {
        setSelectedChallengeId(targetChallenge.id);
        const idx = challenges.findIndex((c) => c.id === targetChallenge.id);
        const sIdx = idx >= 0 ? idx : 0;
        setDrumChallenge({
          prev: challenges[(sIdx - 1 + challenges.length) % challenges.length]?.title || '',
          current: targetChallenge.title,
          next: challenges[(sIdx + 1) % challenges.length]?.title || '',
        });
      }

      sounds.playReveal();

      // Subtle celebratory sparkles & confetti stars pop
      const particles: Array<{ id: number; char: string; tx: number; ty: number; color: string; size: number }> = [];
      const symbols = ['✨', '⭐', '🌟', '💫', '✦', '🎊'];
      const palette = ['#eab308', '#84cc16', '#38bdf8', '#a855f7', '#f43f5e'];
      for (let i = 0; i < 15; i++) {
        particles.push({
          id: Date.now() + i,
          char: symbols[i % symbols.length],
          tx: (Math.random() - 0.5) * 160,
          ty: -20 - Math.random() * 55,
          color: palette[i % palette.length],
          size: 11 + Math.random() * 9,
        });
      }
      setSlotParticles(particles);

      // If inspecting a previous hole, auto-save immediately
      if (viewingHoleNumber < currentRoundNumber && targetPub && targetDrink && targetChallenge) {
        autoSavePreviousHole({
          pubId: targetPub.id,
          drinkId: targetDrink.id,
          challengeId: targetChallenge.id,
        });
      }

      setTimeout(() => {
        setSlotShowJackpot(false);
        setSlotParticles([]);
      }, 2600);
    }, 3300);
  }, [
    isSlotSpinning,
    pubs,
    drinks,
    challenges,
    usedPubIds,
    usedDrinkIds,
    usedChallengeIds,
    selectedPubId,
    selectedDrinkId,
    selectedChallengeId,
    viewingHoleNumber,
    currentRoundNumber,
    autoSavePreviousHole,
  ]);

  // Front-view Lever drag/slide downwards handlers (Prevents background movement on mobile)
  const handleLeverPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSlotSpinning) return;
    isDraggingLeverRef.current = true;
    leverStartYRef.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handleLeverPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingLeverRef.current || isSlotSpinning) return;
    e.preventDefault();
    e.stopPropagation();
    const deltaY = Math.max(0, e.clientY - leverStartYRef.current);
    const progress = Math.min(1, deltaY / leverMaxTravel);
    setLeverProgress(progress);

    // If dragged almost completely down, trigger spin!
    if (progress >= 0.88) {
      isDraggingLeverRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      handleSpinSlotMachine();
    }
  };

  const handleLeverPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingLeverRef.current) return;
    isDraggingLeverRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    e.preventDefault();
    e.stopPropagation();

    if (leverProgress >= 0.4 && !isSlotSpinning) {
      handleSpinSlotMachine();
    } else {
      setLeverProgress(0);
    }
  };

  const handleLeverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSlotSpinning) return;
    handleSpinSlotMachine();
  };

  // Adjust score for team (minpunten toegestaan door opdrachten!) - auto-saves instantly on previous holes
  const updateScore = (teamId: string, delta: number) => {
    setTeamScores((prev) => {
      const cur = prev[teamId] ?? 1;
      const next = cur + delta;
      sounds.playTick(delta > 0 ? 600 : 800);
      const newScores = {
        ...prev,
        [teamId]: next,
      };
      if (viewingHoleNumber < currentRoundNumber) {
        autoSavePreviousHole({ scores: newScores });
      }
      return newScores;
    });
  };

  // Complete current round and advance
  const handleFinishHole = () => {
    if (!selectedPubId || !selectedDrinkId || !selectedChallengeId) {
      return;
    }

    const roundScores: Record<string, number> = {};
    teams.forEach((team) => {
      roundScores[team.id] = teamScores[team.id] ?? 1;
    });

    const newRound: Round = {
      roundNumber: currentRoundNumber,
      pubId: selectedPubId,
      drinkId: selectedDrinkId,
      challengeId: selectedChallengeId,
      scores: roundScores,
      timestamp: Date.now(),
    };

    sounds.playReveal();
    onCompleteRound(newRound);
    setViewingHoleNumber(currentRoundNumber + 1);
    setActiveDraft(null);

    // Prepare next round's defaults matching the exact sequence order
    const updatedUsedPubs = new Set([...usedPubIds, selectedPubId]);
    const updatedUsedDrinks = new Set([...usedDrinkIds, selectedDrinkId]);
    const updatedUsedChallenges = new Set([...usedChallengeIds, selectedChallengeId]);

    const nextUnusedPub =
      pubs.find((p) => !updatedUsedPubs.has(p.id)) || pubs[currentRoundNumber % pubs.length];
    const nextUnusedDrink =
      drinks.find((d) => !updatedUsedDrinks.has(d.id)) || drinks[currentRoundNumber % drinks.length];
    const nextUnusedChallenge =
      challenges.find((c) => !updatedUsedChallenges.has(c.id)) ||
      challenges[currentRoundNumber % challenges.length];

    if (nextUnusedPub) setSelectedPubId(nextUnusedPub.id);
    if (nextUnusedDrink) setSelectedDrinkId(nextUnusedDrink.id);
    if (nextUnusedChallenge) setSelectedChallengeId(nextUnusedChallenge.id);

    // Reset round scores to 1
    const resetScores: Record<string, number> = {};
    teams.forEach((t) => {
      resetScores[t.id] = 1;
    });
    setTeamScores(resetScores);
  };

  // Team management inside game
  const handleAddPlayerToTeam = (teamId: string, name: string) => {
    if (!name.trim()) return;
    const trimmed = name.trim();
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        if (t.playerNames.includes(trimmed)) return t;
        return { ...t, playerNames: [...t.playerNames, trimmed] };
      }
      return t;
    });
    onUpdateTeams(updated);
    setNewPlayerNameInput('');
    sounds.playTick(750);
  };

  const handleRemovePlayerFromTeam = (teamId: string, name: string) => {
    const updated = teams
      .map((t) => {
        if (t.id === teamId) {
          return { ...t, playerNames: t.playerNames.filter((n) => n !== name) };
        }
        return t;
      })
      .filter((t) => t.playerNames.length > 0);
    onUpdateTeams(updated);
    sounds.playTick(500);
  };

  const handleAddNewTeamInGame = () => {
    const colorIndex = teams.length % TEAM_COLORS.length;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      playerNames: ['Nieuwe Speler'],
      color: TEAM_COLORS[colorIndex],
    };
    const updated = [...teams, newTeam];
    onUpdateTeams(updated);
    setTeamScores((prev) => ({ ...prev, [newTeam.id]: 1 }));
    setEditingTeamId(newTeam.id);
    sounds.playReveal();
  };

  const handleDeleteTeamInGame = (teamId: string) => {
    const updated = teams.filter((t) => t.id !== teamId);
    onUpdateTeams(updated);
    sounds.playTick(450);
  };

  const handleChangeTeamColor = (teamId: string, color: string) => {
    const updated = teams.map((t) => (t.id === teamId ? { ...t, color } : t));
    onUpdateTeams(updated);
    sounds.playTick(700);
  };

  const getTeamTypeLabel = (count: number) => {
    if (count === 1) return 'Solo';
    if (count === 2) return 'Duo';
    if (count === 3) return 'Trio';
    return `${count}-tal`;
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-48 sm:pb-52 pt-2.5 space-y-3.5">
      {/* 1. Hole Status & Navigation Header (Bovenaan: Vorige knop, Hole vakje op één regel, Volgende knop - dunnere balk) */}
      <div className="wii-card px-2 py-1 sm:py-1.5 rounded-2xl border-2 border-white/95 shadow-sm flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md">
        {/* Vorige Hole knop (bij hole 1 terug naar teams maken) */}
        <button
          type="button"
          disabled={viewingHoleNumber <= 1 && !onBackToTeams}
          onClick={() => {
            if (viewingHoleNumber > 1) {
              handleNavigateHole(viewingHoleNumber - 1);
            } else if (onBackToTeams) {
              onBackToTeams();
            }
          }}
          className="wii-btn-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all shadow-2xs shrink-0"
          title={viewingHoleNumber > 1 ? "Naar vorige hole" : "Terug naar teams maken"}
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline">{viewingHoleNumber > 1 ? 'Vorige' : 'Terug'}</span>
        </button>

        {/* Midden: Het Hole vakje op één regel, perfect verticaal gecentreerd */}
        <div className="flex items-center justify-center">
          <div
            className={`px-3 py-1.5 rounded-xl inline-flex items-center justify-center gap-1.5 font-black shadow-xs border-2 border-white transition-transform shrink-0 leading-none ${
              isEditingPreviousHole
                ? 'wii-btn-yellow text-slate-950'
                : 'wii-btn-green text-[#14300a]'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold opacity-85 leading-none flex items-center">
              HOLE
            </span>
            <span className="text-sm sm:text-base font-black leading-none flex items-center">
              {viewingHoleNumber}
            </span>
          </div>
        </div>

        {/* Volgende Hole knop */}
        <button
          type="button"
          disabled={viewingHoleNumber >= currentRoundNumber}
          onClick={() => handleNavigateHole(viewingHoleNumber + 1)}
          className="wii-btn-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all shadow-2xs shrink-0"
          title="Naar volgende hole"
        >
          <span className="hidden xs:inline">Volgende</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* SLOT MACHINE SELECTION (RANDOMIZER MET 3D CILINDER WIELEN & FRONT-VIEW HENDEL) */}
      {/* ========================================================= */}
      <div className="relative rounded-3xl p-3 sm:p-3.5 wii-card border-2 border-amber-300/90 shadow-lg bg-gradient-to-b from-white via-amber-50/30 to-amber-100/50 overflow-visible select-none">
        {/* Subtle Floating Sparkles & Confetti Stars Celebration */}
        {slotParticles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-visible z-40">
            {slotParticles.map((p) => (
              <div
                key={p.id}
                className="absolute left-1/2 top-1/2 animate-slot-sparkle font-black select-none pointer-events-none drop-shadow-xs"
                style={{
                  color: p.color,
                  fontSize: `${p.size}px`,
                  ['--tx' as string]: `${p.tx}px`,
                  ['--ty' as string]: `${p.ty}px`,
                }}
              >
                {p.char}
              </div>
            ))}
          </div>
        )}

        {/* Slot Machine Header (Klikbaar om te draaien - Zonder puntjes/sterretjes voor de tekst en zonder aparte klik-tekst knop) */}
        <button
          type="button"
          disabled={isSlotSpinning}
          onClick={handleSpinSlotMachine}
          className="w-full flex items-center justify-between gap-2 pb-2.5 border-b border-amber-200/80 mb-2.5 group cursor-pointer text-left focus:outline-none transition-transform active:scale-[0.995]"
          title="Klik hier om de slot machine te draaien!"
        >
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 group-hover:text-amber-700 transition-colors">
            Slot Machine
          </span>

          <span className="text-[10px] font-bold text-amber-700/80 hidden xs:inline shrink-0 opacity-80 group-hover:opacity-100">
            {isSlotSpinning ? 'Rolt...' : 'of slide hendel ↓'}
          </span>
        </button>

        {/* Slot Machine Main Body: 3 Cylindrical Drum Reels + Front-View Mechanical Lever */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* 3 Drum Reels Grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1 min-w-0">
            {/* Reel 1: Café Drum */}
            <button
              type="button"
              disabled={isSlotSpinning}
              onClick={() => openPicker('pub')}
              className={`text-left p-1.5 sm:p-2 rounded-2xl wii-card border-2 transition-all flex flex-col justify-start shadow-xs relative overflow-hidden min-h-[126px] sm:min-h-[134px] group ${
                slotReelsSpinning.pub
                  ? 'border-emerald-500 bg-emerald-100/90 scale-[1.01] ring-2 ring-emerald-400/50'
                  : 'border-emerald-300/80 hover:border-emerald-400 bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/60 active:scale-[0.99]'
              }`}
            >
              {/* Category Header (Over de hele breedte) */}
              <div className="w-full mb-1.5 relative z-10">
                <div className="w-full flex items-center justify-center gap-1 py-1 px-1 rounded-lg bg-gradient-to-b from-[#bef264] to-[#65a30d] text-[#14300a] text-[10px] sm:text-[11px] font-black uppercase tracking-tight shadow-2xs">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 text-[#14300a]" />
                  <span>Café</span>
                </div>
              </div>

              {/* 3D Cylindrical Drum Reel Wheel Window */}
              <div className="relative z-10 flex-1 w-full rounded-xl border border-slate-300/80 bg-gradient-to-b from-slate-200 via-white to-slate-200 overflow-hidden shadow-inner flex flex-col justify-between py-1 px-1 reel-drum-wrapper select-none">
                {/* Cylindrical lighting overlays: top curved shadow, middle highlight, bottom curved shadow */}
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-900/40 via-slate-900/10 to-transparent pointer-events-none z-20" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-20" />
                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent pointer-events-none z-20" />

                {/* Top item (curved backward into upper shadow) */}
                <div className="reel-cylinder-item-top text-[10px] sm:text-xs text-slate-500 font-bold truncate text-center select-none h-4 leading-none">
                  {drumPub.prev || '...'}
                </div>

                {/* Center payline item (straight, bold, payline frame) */}
                <div className="relative z-10 flex items-center justify-center">
                  <div
                    className={`w-full py-1 px-1 rounded-md bg-white/95 border-y-2 border-emerald-400 shadow-xs flex items-center justify-center min-h-[36px] transition-all ${
                      slotReelsSpinning.pub ? 'blur-[0.3px] text-emerald-800' : ''
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight line-clamp-2 text-center break-words">
                      {drumPub.current || 'Kies Café'}
                    </span>
                  </div>
                </div>

                {/* Bottom item (curved forward into lower shadow) */}
                <div className="reel-cylinder-item-bottom text-[10px] sm:text-xs text-slate-500 font-bold truncate text-center select-none h-4 leading-none">
                  {drumPub.next || '...'}
                </div>
              </div>
            </button>

            {/* Reel 2: Drankje Drum */}
            <button
              type="button"
              disabled={isSlotSpinning}
              onClick={() => openPicker('drink')}
              className={`text-left p-1.5 sm:p-2 rounded-2xl wii-card border-2 transition-all flex flex-col justify-start shadow-xs relative overflow-hidden min-h-[126px] sm:min-h-[134px] group ${
                slotReelsSpinning.drink
                  ? 'border-amber-500 bg-amber-100/90 scale-[1.01] ring-2 ring-amber-400/50'
                  : 'border-amber-300/80 hover:border-amber-400 bg-gradient-to-b from-white via-amber-50/40 to-amber-100/60 active:scale-[0.99]'
              }`}
            >
              {/* Category Header (Over de hele breedte) */}
              <div className="w-full mb-1.5 relative z-10">
                <div className="w-full flex items-center justify-center gap-1 py-1 px-1 rounded-lg bg-gradient-to-b from-[#fef08a] to-[#d97706] text-[#451a03] text-[10px] sm:text-[11px] font-black uppercase tracking-tight shadow-2xs">
                  <Beer className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 text-[#451a03]" />
                  <span>Drankje</span>
                </div>
              </div>

              {/* 3D Cylindrical Drum Reel Wheel Window */}
              <div className="relative z-10 flex-1 w-full rounded-xl border border-slate-300/80 bg-gradient-to-b from-slate-200 via-white to-slate-200 overflow-hidden shadow-inner flex flex-col justify-between py-1 px-1 reel-drum-wrapper select-none">
                {/* Cylindrical lighting overlays: top curved shadow, middle highlight, bottom curved shadow */}
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-900/40 via-slate-900/10 to-transparent pointer-events-none z-20" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-20" />
                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent pointer-events-none z-20" />

                {/* Top item (curved backward into upper shadow) */}
                <div className="reel-cylinder-item-top text-[10px] sm:text-xs text-slate-500 font-bold truncate text-center select-none h-4 leading-none">
                  {drumDrink.prev || '...'}
                </div>

                {/* Center payline item (straight, bold, payline frame) */}
                <div className="relative z-10 flex items-center justify-center">
                  <div
                    className={`w-full py-1 px-1 rounded-md bg-white/95 border-y-2 border-amber-400 shadow-xs flex items-center justify-center min-h-[36px] transition-all ${
                      slotReelsSpinning.drink ? 'blur-[0.3px] text-amber-800' : ''
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight line-clamp-2 text-center break-words">
                      {drumDrink.current || 'Kies Drank'}
                    </span>
                  </div>
                </div>

                {/* Bottom item (curved forward into lower shadow) */}
                <div className="reel-cylinder-item-bottom text-[10px] sm:text-xs text-slate-500 font-bold truncate text-center select-none h-4 leading-none">
                  {drumDrink.next || '...'}
                </div>
              </div>
            </button>

            {/* Reel 3: Minigame Drum */}
            <button
              type="button"
              disabled={isSlotSpinning}
              onClick={() => openPicker('challenge')}
              className={`text-left p-1.5 sm:p-2 rounded-2xl wii-card border-2 transition-all flex flex-col justify-start shadow-xs relative overflow-hidden min-h-[126px] sm:min-h-[134px] group ${
                slotReelsSpinning.challenge
                  ? 'border-purple-500 bg-purple-100/90 scale-[1.01] ring-2 ring-purple-400/50'
                  : 'border-purple-300/80 hover:border-purple-400 bg-gradient-to-b from-white via-purple-50/40 to-purple-100/60 active:scale-[0.99]'
              }`}
            >
              {/* Category Header (Over de hele breedte met zwarte tekst) */}
              <div className="w-full mb-1.5 relative z-10">
                <div className="w-full flex items-center justify-center gap-1 py-1 px-1 rounded-lg bg-gradient-to-b from-[#d8b4fe] to-[#a855f7] text-black text-[10px] sm:text-[11px] font-black uppercase tracking-tight shadow-2xs border border-purple-300">
                  <Gamepad2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 text-black" />
                  <span className="text-black">Minigame</span>
                </div>
              </div>

              {/* 3D Cylindrical Drum Reel Wheel Window */}
              <div className="relative z-10 flex-1 w-full rounded-xl border border-slate-300/80 bg-gradient-to-b from-slate-200 via-white to-slate-200 overflow-hidden shadow-inner flex flex-col justify-between py-1 px-1 reel-drum-wrapper select-none">
                {/* Cylindrical lighting overlays: top curved shadow, middle highlight, bottom curved shadow */}
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-900/40 via-slate-900/10 to-transparent pointer-events-none z-20" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-20" />
                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent pointer-events-none z-20" />

                {/* Top item (curved backward into upper shadow) */}
                <div className="reel-cylinder-item-top text-[10px] sm:text-xs text-slate-500 font-bold truncate text-center select-none h-4 leading-none">
                  {drumChallenge.prev || '...'}
                </div>

                {/* Center payline item (straight, bold, payline frame) */}
                <div className="relative z-10 flex items-center justify-center">
                  <div
                    className={`w-full py-1 px-1 rounded-md bg-white/95 border-y-2 border-purple-400 shadow-xs flex items-center justify-center min-h-[36px] transition-all ${
                      slotReelsSpinning.challenge ? 'blur-[0.3px] text-black' : ''
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black text-black leading-tight line-clamp-2 text-center break-words">
                      {drumChallenge.current || 'Kies Opdracht'}
                    </span>
                  </div>
                </div>

                {/* Bottom item (curved forward into lower shadow) */}
                <div className="reel-cylinder-item-bottom text-[10px] sm:text-xs text-slate-500 font-bold truncate text-center select-none h-4 leading-none">
                  {drumChallenge.next || '...'}
                </div>
              </div>
            </button>
          </div>

          {/* THE FRONT-VIEW MECHANICAL SLOT MACHINE LEVER (VOORAANZICHT HENDEL - SLIDE NAAR BENEDEN) */}
          <div
            className="relative flex flex-col items-center justify-between shrink-0 w-10 sm:w-12 h-[126px] sm:h-[134px] rounded-2xl bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border-2 border-slate-400/90 shadow-md p-1.5 select-none touch-none overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            onPointerDown={handleLeverPointerDown}
            onPointerMove={handleLeverPointerMove}
            onPointerUp={handleLeverPointerUp}
            onPointerCancel={handleLeverPointerUp}
            onClick={handleLeverClick}
            role="button"
            tabIndex={0}
            aria-label="Trek hendel naar beneden om te draaien"
            title="Slide de hendel naar beneden om te draaien"
          >
            {/* Vertical Metal Slot Track (Gleuf van voren gezien) */}
            <div className="absolute inset-y-2.5 w-2.5 sm:w-3 rounded-full bg-gradient-to-b from-slate-950 via-slate-800 to-slate-950 border border-slate-700/80 shadow-inner flex justify-center overflow-hidden pointer-events-none">
              {/* Sliding Chrome Guide Shaft inside the slot track */}
              <div
                className="w-1.5 bg-gradient-to-r from-slate-400 via-white to-slate-400 rounded-full transition-transform duration-75"
                style={{
                  transform: `translateY(${leverProgress * leverMaxTravel}px)`,
                  height: '36px',
                }}
              />
            </div>

            {/* Front-View 3D Spherical Red Knob (Bal) - Geen enkel icoontje, geen stuiterend label */}
            <div
              className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-200/90 shadow-lg flex items-center justify-center transition-transform"
              style={{
                transform: `translateY(${leverProgress * leverMaxTravel}px)`,
                transition: isDraggingLeverRef.current
                  ? 'none'
                  : 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Specular curved white shine reflection dot */}
              <div className="absolute top-1.5 left-2 w-2.5 h-1.5 rounded-full bg-white/85 rotate-[-25deg] pointer-events-none" />
            </div>

            {/* Slide down arrow indicator on casing plate */}
            <div className="relative z-0 text-[9px] font-black text-slate-500 uppercase tracking-tighter pointer-events-none flex flex-col items-center leading-none pb-0.5 opacity-60">
              <span>↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Minigame Banner */}
      {currentChallenge && (
        <div className="rounded-3xl bg-violet-50/90 border-2 border-violet-200 p-3.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-200 text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
              <Gamepad2 className="w-4 h-4 text-slate-900" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-slate-900 block">
                Ronde Minigame: {currentChallenge.title}
              </span>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                {currentChallenge.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEAM SCORING CARDS WITH "TEAMS AANPASSEN" BUTTON */}
      {/* ========================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
            Hole {viewingHoleNumber} Slokken
          </span>
          <button
            type="button"
            onClick={() => setShowTeamsModal(true)}
            className="wii-btn-white flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black active:scale-95 transition-transform shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>Teams Aanpassen</span>
          </button>
        </div>

        {teams.map((team, idx) => {
          const roundScore = teamScores[team.id] ?? 1;
          const totalProjected = projectedTotals[team.id] || 0;

          return (
            <div
              key={team.id}
              className="p-2 sm:p-2.5 rounded-2xl wii-card border-2 shadow-xs transition-all space-y-1.5"
              style={{ borderColor: team.color }}
            >
              {/* Team Info & Standings - Geen actuele aantal slokken meer rechtsboven voor compactere hoogte */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-slate-950 shadow-2xs shrink-0"
                    style={{ backgroundColor: team.color }}
                  >
                    {idx + 1}
                  </div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight truncate">
                    {team.playerNames.join(' & ')}
                  </h3>
                </div>

                {/* Totaal slokken compact */}
                <div className="text-[11px] font-bold text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-lg shrink-0">
                  Totaal: <span className="font-black text-slate-800">{totalProjected}</span>
                </div>
              </div>

              {/* Clean Stepper in Wii Style */}
              <div className="wii-box rounded-xl p-1.5 sm:p-2 border border-sky-100">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] sm:text-[11px]">
                    Slokken deze ronde:
                  </span>
                  <span className="text-[11px] text-sky-700 font-black">Hole {viewingHoleNumber}</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => updateScore(team.id, -1)}
                    aria-label="Verlaag slokken"
                    className="w-12 h-10 sm:w-14 sm:h-11 rounded-xl wii-btn-red flex items-center justify-center active:scale-90 transition-all font-black text-lg shrink-0 shadow-2xs"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  </button>

                  <div className="flex-1 text-center bg-white py-1 sm:py-1.5 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums font-mono leading-tight">
                      {roundScore}
                    </span>
                    <span className="text-[10px] sm:text-[11px] block font-bold leading-tight">
                      {roundScore < 0 ? (
                        <span className="text-emerald-600 font-black">
                          ✨ {Math.abs(roundScore)}{' '}
                          {Math.abs(roundScore) === 1 ? 'min slok (Bonus!)' : 'min slokken (Bonus!)'}
                        </span>
                      ) : roundScore === 0 ? (
                        <span className="text-sky-700">0 slokken (Par)</span>
                      ) : roundScore === 1 ? (
                        <span className="text-slate-600">1 slok</span>
                      ) : (
                        <span className="text-slate-600">{roundScore} slokken</span>
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => updateScore(team.id, 1)}
                    aria-label="Verhoog slokken"
                    className="w-12 h-10 sm:w-14 sm:h-11 rounded-xl wii-btn-green flex items-center justify-center active:scale-90 transition-all font-black text-lg shrink-0 shadow-2xs"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spacer to guarantee cards are completely above floating bottom bar */}
      <div className="h-16 sm:h-20" aria-hidden="true" />

      {/* Floating Bottom Action Bar */}
      <div
        style={{
          paddingBottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
        }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#22c55e]/95 via-[#22c55e]/80 to-transparent z-30 backdrop-blur-xs"
      >
        <div className="max-w-xl mx-auto space-y-2">
          {/* Main Action: Complete Hole or Return to Active Hole */}
          {isEditingPreviousHole ? (
            <button
              onClick={() => handleNavigateHole(currentRoundNumber)}
              className="wii-btn-green w-full h-14 rounded-3xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
            >
              <span>Terug naar Actieve Hole {currentRoundNumber}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={handleFinishHole}
              className="wii-btn-green w-full h-14 rounded-3xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
            >
              <span>Hole {currentRoundNumber} Opslaan & Volgende Hole</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Persistent Navigation Options */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => {
                sounds.playTick();
                onExitToHome();
              }}
              className="wii-btn-white py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1.5 font-black active:scale-95 transition-transform shadow-xs"
            >
              <Home className="w-3.5 h-3.5 text-sky-600" />
              <span>Naar Menu</span>
            </button>

            <button
              onClick={() => {
                sounds.playTick();
                setShowScoreboard(true);
              }}
              className="wii-btn-white py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1.5 font-black active:scale-95 transition-transform shadow-xs"
            >
              <Flag className="w-3.5 h-3.5 text-sky-600" />
              <span>Scorebord</span>
            </button>

            <button
              onClick={() => {
                sounds.playTick();
                setShowFinishConfirm(true);
              }}
              className="wii-btn-red py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1.5 font-black active:scale-95 transition-transform shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Afronden</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SELECTION MODALS (PUB, DRINK, MINIGAME) */}
      {/* ========================================================= */}
      {activePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sky-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg wii-modal-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                {activePicker === 'pub' && <MapPin className="w-4 h-4 text-emerald-600" />}
                {activePicker === 'drink' && <Beer className="w-4 h-4 text-amber-500" />}
                {activePicker === 'challenge' && <Gamepad2 className="w-4 h-4 text-violet-600" />}
                <span>
                  Selecteer{' '}
                  {activePicker === 'pub'
                    ? 'Café'
                    : activePicker === 'drink'
                    ? 'Drankje'
                    : 'Minigame'}
                </span>
              </h3>
              <button
                onClick={() => setActivePicker(null)}
                className="wii-btn-white text-xs font-black py-1 px-3 rounded-xl shadow-xs"
              >
                Sluiten
              </button>
            </div>

            <p className="text-xs text-slate-500 py-2 font-medium">
              Reeds gespeelde items zijn oranje gemarkeerd.
            </p>

            {/* Quick Add Button & Inline Form */}
            <div className="mb-2">
              {!isAddingNew ? (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 hover:bg-sky-100 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-sky-600 stroke-[3]" />
                  <span>
                    Nieuw {activePicker === 'pub' ? 'Café' : activePicker === 'drink' ? 'Drankje' : 'Minigame'} Toevoegen
                  </span>
                </button>
              ) : (
                <form
                  onSubmit={handleAddNewItemSubmit}
                  className="p-3.5 rounded-2xl bg-sky-50 border-2 border-sky-200 space-y-2.5 animate-in zoom-in-95 duration-150"
                >
                  <div className="text-xs font-black text-sky-900">
                    Nieuw {activePicker === 'pub' ? 'Café' : activePicker === 'drink' ? 'Drankje' : 'Minigame'}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={
                      activePicker === 'pub'
                        ? 'Naam Café...'
                        : activePicker === 'drink'
                        ? 'Naam Drankje...'
                        : 'Titel Minigame...'
                    }
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500 font-bold"
                  />
                  <input
                    type="text"
                    placeholder={
                      activePicker === 'pub'
                        ? 'Locatie / Straat...'
                        : activePicker === 'drink'
                        ? 'Categorie (bijv. Bier, Shot, Mix)...'
                        : 'Uitleg van de minigame...'
                    }
                    value={newItemExtra}
                    onChange={(e) => setNewItemExtra(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500 font-bold"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="wii-btn-green flex-1 py-2 rounded-xl font-black text-xs active:scale-95"
                    >
                      Toevoegen & Kiezen
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="wii-btn-white px-3 py-2 rounded-xl text-xs font-black active:scale-95"
                    >
                      Annuleren
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* List of items to select */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {activePicker === 'pub' &&
                pubs.map((pub, idx) => {
                  const isDone = usedPubIds.has(pub.id);
                  const isSelected = pub.id === selectedPubId;
                  return (
                    <button
                      key={pub.id}
                      onClick={() => {
                        setSelectedPubId(pub.id);
                        setActivePicker(null);
                        sounds.playTick(750);
                        if (viewingHoleNumber < currentRoundNumber) {
                          autoSavePreviousHole({ pubId: pub.id });
                        }
                      }}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                          : isDone
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'wii-box border-slate-200 text-slate-800 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-full wii-bubble-green flex items-center justify-center text-xs font-black text-[#14300a] shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`font-black text-sm block truncate ${
                              isSelected ? 'text-emerald-950' : 'text-slate-900'
                            }`}
                          >
                            {pub.name}
                          </span>
                          {pub.location && (
                            <div className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                              {pub.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isDone && (
                          <span className="text-[11px] font-black text-amber-800 flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                            Geweest
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

              {activePicker === 'drink' &&
                drinks.map((drink, idx) => {
                  const isDone = usedDrinkIds.has(drink.id);
                  const isSelected = drink.id === selectedDrinkId;
                  return (
                    <button
                      key={drink.id}
                      onClick={() => {
                        setSelectedDrinkId(drink.id);
                        setActivePicker(null);
                        sounds.playTick(750);
                        if (viewingHoleNumber < currentRoundNumber) {
                          autoSavePreviousHole({ drinkId: drink.id });
                        }
                      }}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 shadow-sm'
                          : isDone
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'wii-box border-slate-200 text-slate-800 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-full wii-bubble-amber flex items-center justify-center text-xs font-black text-[#451a03] shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`font-black text-sm block truncate ${
                              isSelected ? 'text-amber-950' : 'text-slate-900'
                            }`}
                          >
                            {drink.name}
                          </span>
                          <div className="text-xs text-slate-500 mt-0.5 font-normal truncate">
                            {drink.category || 'Drankje'}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isDone && (
                          <span className="text-[11px] font-black text-amber-800 flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                            Gedronken
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

              {activePicker === 'challenge' &&
                challenges.map((challenge, idx) => {
                  const isDone = usedChallengeIds.has(challenge.id);
                  const isSelected = challenge.id === selectedChallengeId;
                  return (
                    <button
                      key={challenge.id}
                      onClick={() => {
                        setSelectedChallengeId(challenge.id);
                        setActivePicker(null);
                        sounds.playTick(750);
                        if (viewingHoleNumber < currentRoundNumber) {
                          autoSavePreviousHole({ challengeId: challenge.id });
                        }
                      }}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-violet-50 border-violet-400 shadow-sm'
                          : isDone
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'wii-box border-slate-200 text-slate-800 hover:border-violet-300'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-full wii-bubble-purple flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-sm text-slate-900">
                            {challenge.title}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 font-normal">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 mt-0.5">
                        {isDone && (
                          <span className="text-[11px] font-black text-amber-800 flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                            Gespeeld
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEAMS BEHEREN / AANPASSEN TIJDENS DE PUB GOLF MODAL */}
      {/* ========================================================= */}
      {showTeamsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sky-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg wii-modal-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Teams Aanpassen</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Wijzig spelers, voeg teams toe of pas kleuren aan tijdens de tocht
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddNewTeamInGame}
                  className="wii-btn-green px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Nieuw Team</span>
                </button>
                <button
                  onClick={() => setShowTeamsModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {teams.map((team, idx) => {
                const isEditing = editingTeamId === team.id;
                return (
                  <div
                    key={team.id}
                    className="p-3.5 rounded-2xl bg-white border-2 space-y-2 shadow-xs"
                    style={{ borderColor: team.color }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-slate-950 shadow-2xs"
                          style={{ backgroundColor: team.color }}
                        >
                          {idx + 1}
                        </div>
                        <span className="font-black text-sm text-slate-900">
                          Team {idx + 1} ({getTeamTypeLabel(team.playerNames.length)})
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingTeamId(isEditing ? null : team.id)}
                          className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                          title="Bewerk team"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {teams.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTeamInGame(team.id)}
                            className="p-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                            title="Verwijder team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chips with delete button */}
                    <div className="flex flex-wrap gap-1.5">
                      {team.playerNames.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 border text-xs text-slate-800 font-bold"
                          style={{ borderColor: `${team.color}60` }}
                        >
                          <span>{name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePlayerFromTeam(team.id, name)}
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 ml-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Inline edit add player & color picker */}
                    {isEditing && (
                      <div className="pt-2 border-t border-slate-100 space-y-2 bg-sky-50/70 p-2.5 rounded-xl">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Nieuwe speler toevoegen..."
                            value={newPlayerNameInput}
                            onChange={(e) => setNewPlayerNameInput(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddPlayerToTeam(team.id, newPlayerNameInput)}
                            className="wii-btn-green px-2.5 py-1.5 rounded-xl font-black text-xs active:scale-95"
                          >
                            + Toevoegen
                          </button>
                        </div>

                        {/* Color Selector */}
                        <div className="flex items-center gap-1 pt-1">
                          <span className="text-[10px] text-slate-600 font-bold mr-1">
                            Kleur:
                          </span>
                          {TEAM_COLORS.slice(0, 7).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleChangeTeamColor(team.id, c)}
                              className={`w-5 h-5 rounded-full border-2 ${
                                team.color === c ? 'scale-110 border-white ring-2 ring-sky-400' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowTeamsModal(false)}
              className="wii-btn-green w-full py-3 rounded-2xl font-black text-sm active:scale-95"
            >
              Klaar met Aanpassen
            </button>
          </div>
        </div>
      )}

      {/* OVERALL COURSE CHECKLIST MODAL */}
      {showCourseChecklist && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sky-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg wii-modal-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-sky-600" />
                  Voortgangskaart
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Overzicht van alle cafés, drankjes en minigames.
                </p>
              </div>
              <button
                onClick={() => setShowCourseChecklist(false)}
                className="wii-btn-white text-xs font-black py-1 px-3 rounded-xl shadow-xs"
              >
                Sluiten
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-1">
              {/* CAFES */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-sky-800 mb-2 flex items-center justify-between">
                  <span>
                    Cafés ({usedPubIds.size}/{pubs.length} bezocht)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {pubs.map((p) => {
                    const isDone = usedPubIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                          isDone
                            ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {isDone ? (
                          <span className="text-[11px] text-emerald-700 font-black flex items-center gap-1 no-underline">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Bezocht
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold no-underline">
                            Nog open
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DRANKJES */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-amber-800 mb-2 flex items-center justify-between">
                  <span>
                    Drankjes ({usedDrinkIds.size}/{drinks.length} gedronken)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {drinks.map((d) => {
                    const isDone = usedDrinkIds.has(d.id);
                    return (
                      <div
                        key={d.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                          isDone
                            ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="truncate">
                          {d.name} <span className="font-normal text-slate-500">({d.category || 'Drank'})</span>
                        </span>
                        {isDone ? (
                          <span className="text-[11px] text-emerald-700 font-black flex items-center gap-1 no-underline">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Gedronken
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold no-underline">
                            Nog open
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MINIGAMES */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-violet-800 mb-2 flex items-center justify-between">
                  <span>
                    Minigames ({usedChallengeIds.size}/{challenges.length} gespeeld)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {challenges.map((c) => {
                    const isDone = usedChallengeIds.has(c.id);
                    return (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                          isDone
                            ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="truncate">{c.title}</span>
                        {isDone ? (
                          <span className="text-[11px] text-emerald-700 font-black flex items-center gap-1 no-underline">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Gespeeld
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold no-underline">
                            Nog open
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE SCOREBOARD MODAL */}
      {showScoreboard && (
        <ScoreboardModal
          teams={teams}
          rounds={rounds}
          currentRoundNumber={currentRoundNumber}
          onSelectHole={handleNavigateHole}
          onClose={() => setShowScoreboard(false)}
          onFinishGame={() => {
            setShowScoreboard(false);
            setShowFinishConfirm(true);
          }}
        />
      )}

      {/* FINISH PUB GOLF CONFIRMATION */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm wii-modal-card rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-3xl wii-btn-yellow flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-8 h-8 text-amber-950" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Pub Golf Afronden?</h3>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Jullie hebben {rounds.length} holes gespeeld! Afronden toont de definitieve eindstand,
              het winnaarspodium en een samenvatting van alle bezochte cafés en drankjes.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  sounds.playFanfare();
                  onFinishGame();
                }}
                className="wii-btn-green w-full py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-md"
              >
                Ja, Bekijk de Winnaars & Eindstand!
              </button>

              <button
                onClick={() => setShowFinishConfirm(false)}
                className="wii-btn-white w-full py-3 rounded-2xl font-black text-xs active:scale-95 transition-transform shadow-xs"
              >
                Verder Spelen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
