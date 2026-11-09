import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Plus,
  Trash2,
  Shuffle,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Flame,
  Award,
  Play,
  FileText,
  Sliders,
  Sparkles,
  Swords,
  X,
  ExternalLink,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';
import { MiiFace } from '../MiiMaker/MiiFace';
import { loadMiiAvatars } from '../../utils/storage';
import { MiiAvatar } from '../../types';

export interface Participant {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  roundIndex: number;
  matchIndex: number;
  p1: Participant | null;
  p2: Participant | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  isBye?: boolean;
}

export interface TournamentRound {
  title: string;
  matches: Match[];
}

const STORAGE_KEY_TOURNAMENT = 'party_channels_tournament_data_v1';

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: 'p-1', name: 'Daan' },
  { id: 'p-2', name: 'Thomas' },
  { id: 'p-3', name: 'Lars' },
  { id: 'p-4', name: 'Sophie' },
  { id: 'p-5', name: 'Bram' },
  { id: 'p-6', name: 'Emma' },
  { id: 'p-7', name: 'Lucas' },
  { id: 'p-8', name: 'Julia' },
];

const RANDOM_DUTCH_NAMES = [
  'Daan', 'Thomas', 'Lars', 'Sophie', 'Bram', 'Emma',
  'Sem', 'Lucas', 'Julia', 'Finn', 'Tess', 'Milan',
  'Lieke', 'Thijs', 'Sanne', 'Luuk', 'Eva', 'Stijn',
];

export function TournamentApp() {
  // Participants
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOURNAMENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.participants && parsed.participants.length > 0) {
          return parsed.participants;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PARTICIPANTS;
  });

  const [inputName, setInputName] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');

  // Active Tournament State
  const [isTournamentActive, setIsTournamentActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOURNAMENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed.isTournamentActive;
      }
    } catch {
      return false;
    }
    return false;
  });

  const [rounds, setRounds] = useState<TournamentRound[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOURNAMENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rounds && parsed.rounds.length > 0) {
          return parsed.rounds;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [champion, setChampion] = useState<Participant | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOURNAMENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.champion || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

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

  // Check if Team Maker has teams available for one-click import
  const [savedTeamsFromMaker, setSavedTeamsFromMaker] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('party_channels_team_maker_formed_teams');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setSavedTeamsFromMaker(parsed.map((t: { name: string }) => t.name));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        participants,
        isTournamentActive,
        rounds,
        champion,
      };
      localStorage.setItem(STORAGE_KEY_TOURNAMENT, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save tournament state:', e);
    }
  }, [participants, isTournamentActive, rounds, champion]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --------------------------------------------------------------------------
  // Participant Management
  // --------------------------------------------------------------------------
  const handleAddParticipant = (e?: React.FormEvent, customName?: string) => {
    if (e) e.preventDefault();
    const raw = customName !== undefined ? customName : inputName;
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (participants.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setToastMessage(`"${trimmed}" staat al in de deelnemerslijst!`);
      sounds.playTick(400);
      return;
    }
    const newP: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
    };
    setParticipants(prev => [...prev, newP]);
    if (customName === undefined) setInputName('');
    sounds.playTick(750);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    sounds.playTick(500);
  };

  const handleAddRandomParticipant = () => {
    const existing = new Set(participants.map(p => p.name.toLowerCase()));
    const available = RANDOM_DUTCH_NAMES.filter(n => !existing.has(n.toLowerCase()));
    if (available.length === 0) return;
    const chosen = available[Math.floor(Math.random() * available.length)];
    const newP: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: chosen,
    };
    setParticipants(prev => [...prev, newP]);
    sounds.playTick(800);
  };

  const handleBatchImport = () => {
    const rawNames = batchText
      .split(/[\n,;]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (rawNames.length === 0) return;

    const newParticipants: Participant[] = rawNames.map((name, i) => ({
      id: `p-${Date.now()}-${i}`,
      name,
    }));

    setParticipants(prev => {
      const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
      const filtered = newParticipants.filter(p => !existingNames.has(p.name.toLowerCase()));
      return [...prev, ...filtered];
    });

    setBatchText('');
    setShowBatchModal(false);
    setToastMessage(`${rawNames.length} deelnemers toegevoegd!`);
    sounds.playFanfare();
  };

  const handleImportFromTeamMaker = () => {
    if (savedTeamsFromMaker.length === 0) return;
    const imported: Participant[] = savedTeamsFromMaker.map((teamName, i) => ({
      id: `team-import-${Date.now()}-${i}`,
      name: teamName,
    }));
    setParticipants(imported);
    setToastMessage(`${imported.length} teams geïmporteerd uit Team Maker! 👥`);
    sounds.playFanfare();
  };

  const handleShuffleParticipants = () => {
    setParticipants(prev => [...prev].sort(() => Math.random() - 0.5));
    sounds.playTick(650);
    setToastMessage('Deelnemers gewillekeurd! 🔀');
  };

  const handleClearAll = () => {
    setParticipants([]);
    sounds.playTick(450);
  };

  // --------------------------------------------------------------------------
  // Generate Knockout Bracket
  // --------------------------------------------------------------------------
  const getRoundTitle = (roundIdx: number, totalRounds: number) => {
    const distanceToFinal = totalRounds - 1 - roundIdx;
    if (distanceToFinal === 0) return 'Grote Finale 🏆';
    if (distanceToFinal === 1) return 'Halve Finales';
    if (distanceToFinal === 2) return 'Kwartfinales';
    if (distanceToFinal === 3) return 'Achtste Finales';
    return `Ronde ${roundIdx + 1}`;
  };

  const handleGenerateBracket = () => {
    if (participants.length < 2) {
      setToastMessage('Voeg minimaal 2 deelnemers toe om een toernooi te starten!');
      sounds.playTick(400);
      return;
    }

    // Determine bracket size: power of 2 (2, 4, 8, 16, 32...)
    let bracketSize = 2;
    while (bracketSize < participants.length) {
      bracketSize *= 2;
    }

    const totalRoundsCount = Math.log2(bracketSize);

    // Shuffle / Seed participants
    const seededList: (Participant | null)[] = [...participants];
    // Fill the rest with null (BYEs)
    while (seededList.length < bracketSize) {
      seededList.push(null);
    }

    // Distribute matches for Round 0
    const round0MatchesCount = bracketSize / 2;
    const round0Matches: Match[] = [];

    for (let m = 0; m < round0MatchesCount; m++) {
      const p1 = seededList[m * 2] || null;
      const p2 = seededList[m * 2 + 1] || null;

      // Handle automatic BYE if one participant is null
      let winnerId: string | null = null;
      let isBye = false;

      if (p1 && !p2) {
        winnerId = p1.id;
        isBye = true;
      } else if (!p1 && p2) {
        winnerId = p2.id;
        isBye = true;
      }

      round0Matches.push({
        id: `match-0-${m}`,
        roundIndex: 0,
        matchIndex: m,
        p1,
        p2,
        score1: null,
        score2: null,
        winnerId,
        isBye,
      });
    }

    const generatedRounds: TournamentRound[] = [
      {
        title: getRoundTitle(0, totalRoundsCount),
        matches: round0Matches,
      },
    ];

    // Generate subsequent empty rounds up to the final
    for (let r = 1; r < totalRoundsCount; r++) {
      const matchCountInRound = bracketSize / Math.pow(2, r + 1);
      const roundMatches: Match[] = [];

      for (let m = 0; m < matchCountInRound; m++) {
        // Look at previous round feeder matches (2m and 2m+1)
        const feeder1 = generatedRounds[r - 1].matches[m * 2];
        const feeder2 = generatedRounds[r - 1].matches[m * 2 + 1];

        const p1 = feeder1?.winnerId
          ? feeder1.p1?.id === feeder1.winnerId
            ? feeder1.p1
            : feeder1.p2
          : null;
        const p2 = feeder2?.winnerId
          ? feeder2.p1?.id === feeder2.winnerId
            ? feeder2.p1
            : feeder2.p2
          : null;

        roundMatches.push({
          id: `match-${r}-${m}`,
          roundIndex: r,
          matchIndex: m,
          p1,
          p2,
          score1: null,
          score2: null,
          winnerId: null,
        });
      }

      generatedRounds.push({
        title: getRoundTitle(r, totalRoundsCount),
        matches: roundMatches,
      });
    }

    setRounds(generatedRounds);
    setChampion(null);
    setIsTournamentActive(true);

    sounds.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setToastMessage('Toernooischema succesvol gegenereerd! ⚔️');
  };

  // --------------------------------------------------------------------------
  // Match Scoring & Winner Selection
  // --------------------------------------------------------------------------
  const handleSelectWinner = (
    roundIdx: number,
    matchIdx: number,
    winner: Participant
  ) => {
    sounds.playCorrectDing();

    setRounds(prevRounds => {
      const updated = JSON.parse(JSON.stringify(prevRounds)) as TournamentRound[];
      const match = updated[roundIdx].matches[matchIdx];

      // Set winner
      match.winnerId = winner.id;

      // If this was the final match, set champion!
      if (roundIdx === updated.length - 1) {
        setChampion(winner);
        sounds.playFanfare();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      } else {
        // Propagate winner into next round match
        const nextRoundIdx = roundIdx + 1;
        const nextMatchIdx = Math.floor(matchIdx / 2);
        const isFirstSlot = matchIdx % 2 === 0;

        const nextMatch = updated[nextRoundIdx].matches[nextMatchIdx];
        if (isFirstSlot) {
          nextMatch.p1 = winner;
        } else {
          nextMatch.p2 = winner;
        }

        // If the next match previously had a winner that came from this slot and changed, clear it
        if (nextMatch.winnerId && nextMatch.winnerId !== winner.id) {
          nextMatch.winnerId = null;
        }
      }

      return updated;
    });
  };

  const handleUpdateScore = (
    roundIdx: number,
    matchIdx: number,
    pSlot: 1 | 2,
    delta: number
  ) => {
    setRounds(prevRounds => {
      const updated = JSON.parse(JSON.stringify(prevRounds)) as TournamentRound[];
      const match = updated[roundIdx].matches[matchIdx];

      if (pSlot === 1) {
        const cur = match.score1 ?? 0;
        match.score1 = Math.max(0, cur + delta);
      } else {
        const cur = match.score2 ?? 0;
        match.score2 = Math.max(0, cur + delta);
      }

      // Auto-decide winner if scores are distinct
      if (match.score1 !== null && match.score2 !== null) {
        if (match.score1 > match.score2 && match.p1) {
          match.winnerId = match.p1.id;
          propagateWinnerToNext(updated, roundIdx, matchIdx, match.p1);
        } else if (match.score2 > match.score1 && match.p2) {
          match.winnerId = match.p2.id;
          propagateWinnerToNext(updated, roundIdx, matchIdx, match.p2);
        }
      }

      return updated;
    });
    sounds.playTick(600);
  };

  const propagateWinnerToNext = (
    tournamentRounds: TournamentRound[],
    roundIdx: number,
    matchIdx: number,
    winner: Participant
  ) => {
    if (roundIdx === tournamentRounds.length - 1) {
      setChampion(winner);
      sounds.playFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      return;
    }

    const nextRoundIdx = roundIdx + 1;
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const isFirstSlot = matchIdx % 2 === 0;

    const nextMatch = tournamentRounds[nextRoundIdx].matches[nextMatchIdx];
    if (isFirstSlot) {
      nextMatch.p1 = winner;
    } else {
      nextMatch.p2 = winner;
    }
  };

  // Reset Tournament
  const handleConfirmReset = () => {
    setIsTournamentActive(false);
    setRounds([]);
    setChampion(null);
    setShowResetConfirmModal(false);
    sounds.playTick(500);
    setToastMessage('Toernooi gereset naar instellingen.');
  };

  // Copy Tournament Results
  const handleCopyResults = () => {
    if (rounds.length === 0) return;
    const lines = ['🏆 Toernooischema & Uitslagen:'];

    rounds.forEach(r => {
      lines.push(`\n📌 ${r.title}:`);
      r.matches.forEach((m, i) => {
        const name1 = m.p1 ? m.p1.name : 'TBD';
        const name2 = m.p2 ? m.p2.name : 'TBD';
        const s1 = m.score1 !== null ? ` (${m.score1})` : '';
        const s2 = m.score2 !== null ? ` (${m.score2})` : '';
        const winnerBadge = m.winnerId
          ? ` -> Winnaar: ${m.p1?.id === m.winnerId ? m.p1.name : m.p2?.name}`
          : '';
        lines.push(`• Wedstrijd ${i + 1}: ${name1}${s1} vs ${name2}${s2}${winnerBadge}`);
      });
    });

    if (champion) {
      lines.push(`\n👑 Kampioen: ${champion.name}!`);
    }

    const textToCopy = lines.join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setToastMessage('Toernooi-uitslagen gekopieerd naar klembord! 📋');
      sounds.playCorrectDing();
    }
  };

  return (
    <div className="w-full flex flex-col items-center max-w-2xl mx-auto px-3 sm:px-4 pb-14 select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-black shadow-xl animate-in fade-in slide-in-from-top-2 border border-slate-700">
          {toastMessage}
        </div>
      )}



      {/* =========================================================================
          SETUP PHASE: Deelnemers invoeren & Bracket configureren
         ========================================================================= */}
      {!isTournamentActive ? (
        <div className="w-full space-y-3.5 animate-in fade-in">
          {/* Participants Card */}
          <div className="w-full wii-card rounded-3xl p-3.5 sm:p-4 border-2 border-white">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <h3 className="font-black text-slate-800 text-sm sm:text-base">
                  Deelnemers / Teams ({participants.length})
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 cursor-pointer transition-colors"
                >
                  Plak lijst
                </button>
                <button
                  onClick={handleAddRandomParticipant}
                  className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                >
                  + Random
                </button>
              </div>
            </div>

            {/* Quick Import from Team Maker if teams exist */}
            {savedTeamsFromMaker.length >= 2 && (
              <div className="mb-2.5 p-2 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <span>👥</span>
                  <span>{savedTeamsFromMaker.length} teams gevonden in Team Maker!</span>
                </div>
                <button
                  onClick={handleImportFromTeamMaker}
                  className="text-[11px] font-black bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Importeer Teams
                </button>
              </div>
            )}

            {/* Input Field */}
            <form onSubmit={handleAddParticipant} className="flex flex-wrap items-center gap-1.5 mb-2.5">
              <input
                type="text"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                placeholder="Typ speler- of teamnaam en druk op Enter..."
                className="flex-1 min-w-[140px] px-3 py-1.5 text-xs sm:text-sm font-bold bg-white rounded-xl border border-slate-200 outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl wii-btn-green text-xs font-black shrink-0 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Toevoegen</span>
              </button>
              <PlayerPickerDropdown
                compact
                existingNames={participants.map(p => p.name)}
                buttonLabel="Kies Speler"
                buttonClassName="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                onSelectPlayer={(name) => {
                  handleAddParticipant(undefined, name);
                }}
              />
            </form>

            {/* Participants Chips */}
            {participants.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                {participants.map((p, idx) => {
                  const mii = getMiiForPlayer(p.name);
                  return (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
                    >
                      {mii ? (
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-white border border-slate-300 shrink-0">
                          <MiiFace avatar={mii} size={16} />
                        </div>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                      )}
                      <span>{p.name}</span>
                      <button
                        onClick={() => handleRemoveParticipant(p.id)}
                        className="text-slate-300 hover:text-rose-500 font-black cursor-pointer p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nog geen deelnemers. Voeg minimaal 2 spelers of teams toe.
              </div>
            )}

            {participants.length > 1 && (
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                <button
                  onClick={handleShuffleParticipants}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Willekeurige loting</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Wis alle deelnemers
                </button>
              </div>
            )}
          </div>

          {/* Tournament Preview Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-center text-xs font-bold text-amber-900">
            ⚔️ <span className="font-black">{participants.length} deelnemers</span> ingeschreven.
            {participants.length >= 2 && (
              <span>
                {' '}
                Directe knock-out afvalrace over{' '}
                <span className="font-black text-amber-800">
                  {Math.ceil(Math.log2(Math.max(2, participants.length)))} rondes
                </span>{' '}
                tot aan de finale!
              </span>
            )}
          </div>

          {/* Start Tournament Button */}
          <button
            onClick={handleGenerateBracket}
            disabled={participants.length < 2}
            className="w-full py-4 rounded-2xl wii-btn-green font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-40"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Genereer Toernooischema! 🚀</span>
          </button>
        </div>
      ) : (
        /* =========================================================================
            ACTIVE TOURNAMENT PHASE: Grafische Bracket & Wedstrijden
           ========================================================================= */
        <div className="w-full space-y-3.5 animate-in fade-in">
          {/* Champion Banner if decided */}
          {champion && (
            <div className="w-full wii-card rounded-3xl p-5 text-center border-4 border-amber-300 shadow-xl bg-gradient-to-b from-amber-50 via-yellow-50 to-white relative overflow-hidden animate-in zoom-in">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white mx-auto flex items-center justify-center text-3xl shadow-md mb-2">
                👑
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-700 block mb-0.5">
                Toernooi Winnaar!
              </span>
              <h2 className="text-3xl font-black text-slate-800">
                {champion.name}
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Gefeliciteerd! Kampioen van het toernooi! 🏆
              </p>
            </div>
          )}

          {/* Control Bar: Header & Share */}
          <div className="w-full flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-300 rounded-full text-xs font-black text-amber-900 shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Toernooischema</span>
            </div>

            <button
              onClick={handleCopyResults}
              className="wii-btn-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs hover:border-amber-400"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Deel / Kopieer</span>
            </button>
          </div>

          {/* -----------------------------------------------------------------------
              PIRAMIDE BRACKET TREE MET VERBINDINGSLIJNEN
             ----------------------------------------------------------------------- */}
          {(() => {
            const maxMatchesInRound = Math.max(...rounds.map(r => r.matches.length), 1);
            const minBracketHeight = Math.max(460, maxMatchesInRound * 130);

            return (
              <div className="w-full overflow-x-auto pb-4 pt-1 rounded-2xl bg-white/60 backdrop-blur-xs border border-white/60 shadow-inner p-2.5">
                <div
                  className="inline-flex min-w-full px-1 items-stretch py-2"
                  style={{ minHeight: `${minBracketHeight}px` }}
                >
                  {rounds.map((round, rIdx) => {
                    const isLastRound = rIdx === rounds.length - 1;
                    const numForks = Math.floor(round.matches.length / 2);

                    return (
                      <React.Fragment key={rIdx}>
                        {/* Round Column */}
                        <div className="flex flex-col min-w-[215px] sm:min-w-[235px] flex-shrink-0">
                          {/* Round Header */}
                          <div className="text-center pb-1.5 mb-2 border-b-2 border-amber-400">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                              {round.title}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {round.matches.length}{' '}
                              {round.matches.length === 1 ? 'wedstrijd' : 'wedstrijden'}
                            </span>
                          </div>

                          {/* Round Match Cards Distributed Evenly */}
                          <div className="flex-1 flex flex-col justify-around gap-4 py-2">
                            {round.matches.map((match, mIdx) => {
                              const isFinished = match.winnerId !== null;

                              return (
                                <div
                                  key={match.id}
                                  className={`w-full rounded-2xl border-2 transition-all p-2.5 shadow-sm bg-white relative ${
                                    isFinished
                                      ? 'border-amber-400 shadow-md ring-1 ring-amber-300'
                                      : 'border-slate-200 hover:border-amber-400'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 mb-1.5 pb-1 border-b border-slate-100">
                                    <span>Match #{mIdx + 1}</span>
                                    {match.isBye ? (
                                      <span className="text-amber-600 font-bold">Vrijgeloot (BYE)</span>
                                    ) : isFinished ? (
                                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        <span>Gespeeld</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-bold">Tik winnaar</span>
                                    )}
                                  </div>

                                  {/* Participant 1 Slot */}
                                  <div
                                    onClick={() => {
                                      if (match.p1 && !match.isBye) {
                                        handleSelectWinner(rIdx, mIdx, match.p1);
                                      }
                                    }}
                                    className={`flex items-center justify-between p-1.5 rounded-xl transition-colors cursor-pointer mb-1 ${
                                      match.winnerId === match.p1?.id
                                        ? 'bg-amber-100/90 text-amber-950 font-black border border-amber-300 shadow-2xs'
                                        : match.p1
                                        ? 'hover:bg-slate-50 text-slate-800 font-bold'
                                        : 'text-slate-300 font-semibold'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate flex-1">
                                      {match.p1 && (() => {
                                        const mii = getMiiForPlayer(match.p1.name);
                                        return mii ? (
                                          <div className="w-4 h-4 rounded-full overflow-hidden bg-white border border-slate-300 shrink-0">
                                            <MiiFace avatar={mii} size={16} />
                                          </div>
                                        ) : (
                                          <span
                                            className={`w-2 h-2 rounded-full shrink-0 ${
                                              match.winnerId === match.p1?.id ? 'bg-amber-500' : 'bg-slate-300'
                                            }`}
                                          />
                                        );
                                      })()}
                                      <span className="text-xs truncate">
                                        {match.p1 ? match.p1.name : 'Nog onbekend'}
                                      </span>
                                    </div>

                                    {/* Score & Winner indicator */}
                                    <div
                                      className="flex items-center gap-1"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {match.p1 && !match.isBye && (
                                        <div className="flex items-center gap-0.5 bg-slate-100 px-1 py-0.5 rounded-lg border border-slate-200">
                                          <button
                                            onClick={() => handleUpdateScore(rIdx, mIdx, 1, 1)}
                                            className="text-[10px] font-black text-slate-600 hover:text-emerald-600 px-1 cursor-pointer"
                                          >
                                            +
                                          </button>
                                          <span className="text-xs font-black min-w-[14px] text-center">
                                            {match.score1 ?? '-'}
                                          </span>
                                          <button
                                            onClick={() => handleUpdateScore(rIdx, mIdx, 1, -1)}
                                            className="text-[10px] font-black text-slate-400 hover:text-rose-600 px-1 cursor-pointer"
                                          >
                                            -
                                          </button>
                                        </div>
                                      )}
                                      {match.winnerId === match.p1?.id && (
                                        <span className="text-amber-600 font-black text-xs ml-0.5">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* VS divider */}
                                  <div className="text-[9px] font-black uppercase text-slate-300 text-center -my-0.5">
                                    vs
                                  </div>

                                  {/* Participant 2 Slot */}
                                  <div
                                    onClick={() => {
                                      if (match.p2 && !match.isBye) {
                                        handleSelectWinner(rIdx, mIdx, match.p2);
                                      }
                                    }}
                                    className={`flex items-center justify-between p-1.5 rounded-xl transition-colors cursor-pointer ${
                                      match.winnerId === match.p2?.id
                                        ? 'bg-amber-100/90 text-amber-950 font-black border border-amber-300 shadow-2xs'
                                        : match.p2
                                        ? 'hover:bg-slate-50 text-slate-800 font-bold'
                                        : 'text-slate-300 font-semibold'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate flex-1">
                                      {match.p2 && (() => {
                                        const mii = getMiiForPlayer(match.p2.name);
                                        return mii ? (
                                          <div className="w-4 h-4 rounded-full overflow-hidden bg-white border border-slate-300 shrink-0">
                                            <MiiFace avatar={mii} size={16} />
                                          </div>
                                        ) : (
                                          <span
                                            className={`w-2 h-2 rounded-full shrink-0 ${
                                              match.winnerId === match.p2?.id ? 'bg-amber-500' : 'bg-slate-300'
                                            }`}
                                          />
                                        );
                                      })()}
                                      <span className="text-xs truncate">
                                        {match.p2 ? match.p2.name : 'Nog onbekend'}
                                      </span>
                                    </div>

                                    {/* Score & Winner indicator */}
                                    <div
                                      className="flex items-center gap-1"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {match.p2 && !match.isBye && (
                                        <div className="flex items-center gap-0.5 bg-slate-100 px-1 py-0.5 rounded-lg border border-slate-200">
                                          <button
                                            onClick={() => handleUpdateScore(rIdx, mIdx, 2, 1)}
                                            className="text-[10px] font-black text-slate-600 hover:text-emerald-600 px-1 cursor-pointer"
                                          >
                                            +
                                          </button>
                                          <span className="text-xs font-black min-w-[14px] text-center">
                                            {match.score2 ?? '-'}
                                          </span>
                                          <button
                                            onClick={() => handleUpdateScore(rIdx, mIdx, 2, -1)}
                                            className="text-[10px] font-black text-slate-400 hover:text-rose-600 px-1 cursor-pointer"
                                          >
                                            -
                                          </button>
                                        </div>
                                      )}
                                      {match.winnerId === match.p2?.id && (
                                        <span className="text-amber-600 font-black text-xs ml-0.5">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Pyramid Tree Connecting Lines from Round r to Round r+1 */}
                        {!isLastRound && numForks > 0 && (
                          <div className="w-8 sm:w-12 flex-shrink-0 flex flex-col pt-8 pb-2">
                            <div className="flex-1 flex flex-col justify-around">
                              {Array.from({ length: numForks }).map((_, fIdx) => (
                                <div key={fIdx} className="w-full h-full flex items-center justify-center relative">
                                  <svg
                                    className="w-full h-full overflow-visible"
                                    viewBox="0 0 40 100"
                                    preserveAspectRatio="none"
                                  >
                                    {/* Top branch line from top match */}
                                    <path
                                      d="M 0 25 L 20 25 L 20 50 L 40 50"
                                      fill="none"
                                      stroke="#f59e0b"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Bottom branch line from bottom match */}
                                    <path
                                      d="M 0 75 L 20 75 L 20 50"
                                      fill="none"
                                      stroke="#f59e0b"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      vectorEffect="non-scaling-stroke"
                                    />
                                  </svg>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Final Winner connecting branch to crown */}
                  {champion && (
                    <div className="w-10 sm:w-14 flex-shrink-0 flex flex-col pt-8 pb-2 justify-center items-center">
                      <div className="w-full flex items-center">
                        <div className="flex-1 h-0.5 bg-amber-400" />
                        <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-white shadow-md text-amber-950 font-black flex items-center justify-center text-sm shrink-0">
                          🏆
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Reset Tournament Button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setShowResetConfirmModal(true)}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-full bg-white/70 border border-slate-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Nieuw Toernooi Beginnen</span>
            </button>
          </div>
        </div>
      )}

      {/* Batch Paste Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 max-w-sm w-full border-4 border-amber-300 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-800 text-sm">
                  Plak Deelnemerslijst
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
              Plak meerdere deelnemers (gescheiden door komma's of op nieuwe regels):
            </p>

            <textarea
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder="Daan, Thomas, Lars, Sophie, Bram, Emma..."
              rows={5}
              className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition-colors mb-3"
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
                className="flex-1 py-2 rounded-xl wii-btn-green text-xs font-black cursor-pointer shadow-md"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 text-center border-4 border-rose-300 shadow-2xl max-w-sm w-full">
            <h3 className="text-base font-black text-slate-800 mb-1">
              Toernooi Resetten?
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-4">
              Weet je zeker dat je het huidige toernooischema wilt wissen en een nieuw toernooi wilt opzetten?
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
                Reset Toernooi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
