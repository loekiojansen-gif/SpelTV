import { useState, useEffect, useRef, lazy, Suspense, type ReactNode } from 'react';
import { GameState, PubItem, DrinkItem, ChallengeItem, Player, Team, Round, HistoricalGame, CourseTemplate, SubAppId } from './types';
import { loadGameState, saveGameState, clearGameProgress, saveGameToHistory, saveRememberedPlayers, loadTemplates, saveTemplates } from './utils/storage';
import { checkForSharedRouteInUrl, clearRouteParamFromUrl } from './utils/routeSharing';
import { checkForSharedWheelInUrl } from './utils/wheelSharing';
import { Header } from './components/Header';
import { IncomingSharedRouteModal } from './components/IncomingSharedRouteModal';
import { WiiNavBar } from './components/Navigation/WiiNavBar';
import { WiiChannelGrid } from './components/WiiHub/WiiChannelGrid';
import { BootSplash } from './components/WiiHub/BootSplash';
import { sounds } from './utils/audio';
import { bgmEngine } from './utils/bgmEngine';
import wiiGolfBg from './assets/wii_golf_bg.jpg';

// Elk kanaal wordt pas gedownload op het moment dat je het voor het eerst opent.
// Zo start het menu snel en draaien er geen spellen onzichtbaar op de achtergrond.
const HomeScreen = lazy(() => import('./components/HomeScreen').then(m => ({ default: m.HomeScreen })));
const TeamSetupScreen = lazy(() => import('./components/TeamSetupScreen').then(m => ({ default: m.TeamSetupScreen })));
const ActiveGameScreen = lazy(() => import('./components/ActiveGameScreen').then(m => ({ default: m.ActiveGameScreen })));
const PostGameScreen = lazy(() => import('./components/PostGameScreen').then(m => ({ default: m.PostGameScreen })));
const ChwaziApp = lazy(() => import('./components/Chwazi/ChwaziApp').then(m => ({ default: m.ChwaziApp })));
const RollingDiceApp = lazy(() => import('./components/Dice/RollingDiceApp').then(m => ({ default: m.RollingDiceApp })));
const ScoreKeeperApp = lazy(() => import('./components/ScoreKeeper/ScoreKeeperApp').then(m => ({ default: m.ScoreKeeperApp })));
const SpinningWheelApp = lazy(() => import('./components/Wheel/SpinningWheelApp').then(m => ({ default: m.SpinningWheelApp })));
const SlabakkenApp = lazy(() => import('./components/Slabakken/SlabakkenApp').then(m => ({ default: m.SlabakkenApp })));
const TeamMakerApp = lazy(() => import('./components/TeamMaker/TeamMakerApp').then(m => ({ default: m.TeamMakerApp })));
const TournamentApp = lazy(() => import('./components/Tournament/TournamentApp').then(m => ({ default: m.TournamentApp })));
const CrocodileApp = lazy(() => import('./components/Crocodile/CrocodileApp').then(m => ({ default: m.CrocodileApp })));
const BombApp = lazy(() => import('./components/Bomb/BombApp').then(m => ({ default: m.BombApp })));
const CamelRaceApp = lazy(() => import('./components/CamelRace/CamelRaceApp').then(m => ({ default: m.CamelRaceApp })));
const CardCatalogApp = lazy(() => import('./components/CardCatalog/CardCatalogApp').then(m => ({ default: m.CardCatalogApp })));
const BoerZoektVrouwApp = lazy(() => import('./components/BoerZoektVrouw/BoerZoektVrouwApp').then(m => ({ default: m.BoerZoektVrouwApp })));
const MiiMakerApp = lazy(() => import('./components/MiiMaker/MiiMakerApp').then(m => ({ default: m.MiiMakerApp })));
const ThirtySecondsApp = lazy(() => import('./components/ThirtySeconds/ThirtySecondsApp').then(m => ({ default: m.ThirtySecondsApp })));
const WieIsApp = lazy(() => import('./components/WieIs/WieIsApp').then(m => ({ default: m.WieIsApp })));
const OpJeKopApp = lazy(() => import('./components/OpJeKop/OpJeKopApp').then(m => ({ default: m.OpJeKopApp })));
const SnelsteVingerApp = lazy(() => import('./components/SnelsteVinger/SnelsteVingerApp').then(m => ({ default: m.SnelsteVingerApp })));
const HogerLagerApp = lazy(() => import('./components/HogerLager/HogerLagerApp').then(m => ({ default: m.HogerLagerApp })));
const NooitApp = lazy(() => import('./components/Nooit/NooitApp').then(m => ({ default: m.NooitApp })));
const UndercoverApp = lazy(() => import('./components/Undercover/UndercoverApp').then(m => ({ default: m.UndercoverApp })));

/** Kort laadscherm terwijl een kanaal wordt opgehaald (verschijnt pas na een kwart seconde). */
function ChannelLoading() {
  return (
    <div className="channel-loading flex flex-col items-center justify-center gap-3 py-24 text-center select-none">
      <div className="w-12 h-12 rounded-full border-4 border-white/40 border-t-white animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest opacity-80">Kanaal laden…</span>
    </div>
  );
}

interface ChannelSlotProps {
  /** Is dit kanaal nu in beeld? */
  active: boolean;
  /** Is dit kanaal al eens geopend? Zo ja, dan blijft het bewaard op de achtergrond. */
  visited: boolean;
  children: ReactNode;
}

/**
 * Laadt een kanaal bij het eerste bezoek en houdt het daarna gemount,
 * zodat een lopend potje bewaard blijft als je even terug gaat naar het menu.
 */
function ChannelSlot({ active, visited, children }: ChannelSlotProps) {
  if (!visited) return null;
  return (
    <div className={active ? 'block' : 'hidden'}>
      <Suspense fallback={active ? <ChannelLoading /> : null}>{children}</Suspense>
    </div>
  );
}

export default function App() {
  const [activeSubApp, setActiveSubApp] = useState<SubAppId>('HUB');
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [jumpToHole, setJumpToHole] = useState<number | null>(null);
  const [incomingSharedRoute, setIncomingSharedRoute] = useState<CourseTemplate | null>(null);
  const [showCourseChecklist, setShowCourseChecklist] = useState(false);
  const [launchFlashId, setLaunchFlashId] = useState(0);

  // Onthoud welke kanalen al geopend zijn, zodat ze daarna gemount blijven
  const visitedAppsRef = useRef<Set<SubAppId>>(new Set());
  visitedAppsRef.current.add(activeSubApp);
  const isVisited = (...apps: SubAppId[]) => apps.some(app => visitedAppsRef.current.has(app));

  // Een kanaal starten vanuit het menu geeft een korte witte flits als overgang
  const handleLaunchFromHub = (app: SubAppId) => {
    setLaunchFlashId(prev => prev + 1);
    setActiveSubApp(app);
  };

  // Auto-save to localStorage on every state mutation
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Check on mount for incoming shared route via URL parameter ?route=... or wheel via ?wheel=...
  useEffect(() => {
    const shared = checkForSharedRouteInUrl();
    if (shared) {
      setIncomingSharedRoute(shared);
      sounds.playReveal();
    }

    const sharedWheel = checkForSharedWheelInUrl();
    if (sharedWheel) {
      setActiveSubApp('WHEEL');
      sounds.playReveal();
    }
  }, []);

  // Play background music matching active screen (Homescreen HUB or game channel)
  useEffect(() => {
    bgmEngine.play(activeSubApp);
  }, [activeSubApp]);

  // Unlock audio on first user touch/click/key to satisfy mobile browser autoplay policy
  useEffect(() => {
    const unlockAudio = () => {
      bgmEngine.play(activeSubApp);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [activeSubApp]);

  // Sync iOS Safari / browser theme-color with active screen to prevent Safari status-bar gradient/white haze under Dynamic Island
  useEffect(() => {
    const themeColors: Record<SubAppId, string> = {
      HUB: '#f6f8fa',
      PUB_GOLF: '#15803d',
      CHWAZI: '#090d16',
      DICE: '#062814',
      RNG: '#062814',
      SCORE_KEEPER: '#f6f8fa',
      WHEEL: '#150d24',
      SLABAKKEN: '#052e16',
      TEAM_MAKER: '#f6f8fa',
      TOURNAMENT: '#f6f8fa',
      CROCODILE: '#0284c7',
      BOMB: '#090d16',
      CAMEL_RACE: '#d97706',
      CARD_CATALOG: '#1c0f08',
      BOER_ZOEKT_VROUW: '#166534',
      MII_MAKER: '#e0f2fe',
      THIRTY_SECONDS: '#fefce8',
      WIE_IS: '#fff5f5',
      UNDERCOVER: '#080b14',
      OP_JE_KOP: '#581c87',
      SNELSTE_VINGER: '#0f172a',
      HOGER_LAGER: '#4c0519',
      NOOIT: '#115e59',
    };

    const targetColor = themeColors[activeSubApp] || '#f6f8fa';
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', targetColor);

    // Sync root html and body background directly to prevent iOS Safari status-bar gradient/white haze fallback
    document.documentElement.style.backgroundColor = targetColor;
    document.body.style.backgroundColor = targetColor;
  }, [activeSubApp]);

  // Scroll to top automatically when navigating between screens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [gameState.view]);

  // Update Pubs
  const handleUpdatePubs = (pubs: PubItem[]) => {
    setGameState(prev => ({ ...prev, pubs }));
  };

  // Update Drinks
  const handleUpdateDrinks = (drinks: DrinkItem[]) => {
    setGameState(prev => ({ ...prev, drinks }));
  };

  // Update Challenges
  const handleUpdateChallenges = (challenges: ChallengeItem[]) => {
    setGameState(prev => ({ ...prev, challenges }));
  };

  // Update Teams (e.g. during active pub golf or setup)
  const handleUpdateTeams = (teams: Team[]) => {
    setGameState(prev => ({ ...prev, teams }));
  };

  // Add single items dynamically
  const handleAddPub = (newPub: PubItem) => {
    setGameState(prev => ({ ...prev, pubs: [...prev.pubs, newPub] }));
  };

  const handleAddDrink = (newDrink: DrinkItem) => {
    setGameState(prev => ({ ...prev, drinks: [...prev.drinks, newDrink] }));
  };

  const handleAddChallenge = (newChallenge: ChallengeItem) => {
    setGameState(prev => ({ ...prev, challenges: [...prev.challenges, newChallenge] }));
  };

  // Start team setup flow
  const handleStartNewGame = () => {
    setGameState(prev => ({
      ...prev,
      view: 'team-setup',
      // keep existing players if any, but reset teams and rounds
      teams: [],
      rounds: [],
      currentRoundNumber: 1,
      isGameActive: false,
      isGameFinished: false,
      isPermanentlyFinished: false,
      startedAt: Date.now(),
    }));
    setJumpToHole(null);
  };

  // Resume active game
  const handleResumeGame = () => {
    setGameState(prev => ({
      ...prev,
      view: 'active-game',
    }));
    setJumpToHole(null);
  };

  // Back to home (preserving state)
  const handleBackToHome = () => {
    setGameState(prev => ({
      ...prev,
      view: 'home',
    }));
    setJumpToHole(null);
  };

  // Confirm teams and start hole 1
  const handleConfirmTeams = (teams: Team[], players: Player[]) => {
    saveRememberedPlayers(players.map(p => p.name));
    setGameState(prev => ({
      ...prev,
      teams,
      players,
      isGameActive: true,
      isGameFinished: false,
      currentRoundNumber: 1,
      rounds: [],
      view: 'active-game',
      startedAt: Date.now(),
    }));
    setJumpToHole(null);
  };

  // Complete a hole / round
  const handleCompleteRound = (completedRound: Round) => {
    setGameState(prev => {
      const nextRounds = [...prev.rounds, completedRound];
      const nextRoundNum = prev.currentRoundNumber + 1;
      return {
        ...prev,
        rounds: nextRounds,
        currentRoundNumber: nextRoundNum,
      };
    });
    setJumpToHole(null);
  };

  // Update an existing completed round
  const handleUpdateRound = (updatedRound: Round) => {
    setGameState(prev => ({
      ...prev,
      rounds: prev.rounds.map(r => r.roundNumber === updatedRound.roundNumber ? updatedRound : r),
    }));
  };

  // Continue playing after tournament was finished
  const handleContinueGame = (holeNumber?: number) => {
    setGameState(prev => {
      const nextRound = holeNumber ?? Math.max(prev.currentRoundNumber, prev.rounds.length + 1);
      return {
        ...prev,
        view: 'active-game',
        isGameActive: true,
        isGameFinished: false,
        currentRoundNumber: nextRound,
      };
    });
    setJumpToHole(holeNumber ?? null);
  };

  // Directly edit a completed hole from post-game or history
  const handleEditHoleFromPostGame = (holeNumber: number) => {
    setGameState(prev => ({
      ...prev,
      view: 'active-game',
      isGameActive: true,
      isGameFinished: false,
    }));
    setJumpToHole(holeNumber);
  };

  // Finish pub golf tournament -> save to history & transition to post-game
  const handleFinishGame = () => {
    const finishedAt = Date.now();

    if (gameState.rounds.length > 0 && gameState.teams.length > 0) {
      const standings = gameState.teams
        .map(t => {
          let sum = 0;
          gameState.rounds.forEach(r => {
            sum += r.scores[t.id] ?? 0;
          });
          return { team: t, sum };
        })
        .sort((a, b) => a.sum - b.sum);

      const winner = standings[0];
      const gameToSave: HistoricalGame = {
        id: `game-${finishedAt}`,
        finishedAt,
        startedAt: gameState.startedAt || finishedAt - 3600000,
        holesCount: gameState.rounds.length,
        teams: gameState.teams,
        rounds: gameState.rounds,
        pubs: gameState.pubs,
        drinks: gameState.drinks,
        challenges: gameState.challenges,
        winningTeamName: winner ? winner.team.playerNames.join(' & ') : 'Team',
        winningScore: winner ? winner.sum : 0,
      };
      saveGameToHistory(gameToSave);
    }

    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      isGameFinished: true,
      finishedAt,
      view: 'post-game',
    }));
    setJumpToHole(null);
  };

  // Permanently finish pub golf tournament -> locks the game so user cannot go back
  const handleFinalizeGame = () => {
    sounds.playFanfare();
    const finishedAt = Date.now();

    if (gameState.rounds.length > 0 && gameState.teams.length > 0) {
      const standings = gameState.teams
        .map(t => {
          let sum = 0;
          gameState.rounds.forEach(r => {
            sum += r.scores[t.id] ?? 0;
          });
          return { team: t, sum };
        })
        .sort((a, b) => a.sum - b.sum);

      const winner = standings[0];
      const gameToSave: HistoricalGame = {
        id: `game-${gameState.finishedAt || finishedAt}`,
        finishedAt: gameState.finishedAt || finishedAt,
        startedAt: gameState.startedAt || finishedAt - 3600000,
        holesCount: gameState.rounds.length,
        teams: gameState.teams,
        rounds: gameState.rounds,
        pubs: gameState.pubs,
        drinks: gameState.drinks,
        challenges: gameState.challenges,
        winningTeamName: winner ? winner.team.playerNames.join(' & ') : 'Team',
        winningScore: winner ? winner.sum : 0,
      };
      saveGameToHistory(gameToSave);
    }

    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      isGameFinished: true,
      isPermanentlyFinished: true,
      finishedAt: prev.finishedAt || finishedAt,
    }));
    setJumpToHole(null);
  };

  // Reset entire tournament
  const handleResetGame = () => {
    setGameState(prev => clearGameProgress(prev));
    setJumpToHole(null);
  };

  const handleApplySharedRoute = (template: CourseTemplate) => {
    setGameState(prev => ({
      ...prev,
      pubs: template.pubs,
      drinks: template.drinks,
      challenges: template.challenges,
      view: 'home',
    }));
    clearRouteParamFromUrl();
  };

  const handleSaveSharedRoute = (template: CourseTemplate) => {
    const existing = loadTemplates();
    const updated = [{ ...template, isCustom: true }, ...existing.filter(t => t.id !== template.id)];
    saveTemplates(updated);
    clearRouteParamFromUrl();
  };

  const handleCloseSharedRouteModal = () => {
    setIncomingSharedRoute(null);
    clearRouteParamFromUrl();
  };

  const appTitles: Record<SubAppId, string> = {
    HUB: 'Party Channels',
    PUB_GOLF: 'Pub Golf Pro',
    CHWAZI: 'Vingeren',
    DICE: 'Dobbelstenen',
    SCORE_KEEPER: 'Scorebord',
    RNG: 'Willekeurig Getal',
    WHEEL: 'Rad van Fortuin',
    SLABAKKEN: 'Slabakken',
    TEAM_MAKER: 'Team Maker',
    TOURNAMENT: 'Toernooi Manager',
    CROCODILE: 'Bijtende Krokodil',
    BOMB: 'Tikkende Bom',
    CAMEL_RACE: 'Kamelenrace',
    CARD_CATALOG: 'Bibliotheek',
    BOER_ZOEKT_VROUW: 'Boer zoekt Vrouw',
    MII_MAKER: 'Spelers',
    THIRTY_SECONDS: '30 Seconds',
    WIE_IS: 'Wie is?',
    UNDERCOVER: 'Undercover',
    OP_JE_KOP: 'Op je Kop',
    SNELSTE_VINGER: 'Snelste Vinger',
    HOGER_LAGER: 'Hoger of Lager',
    NOOIT: 'Ik heb nog nooit',
  };

  const getSubAppBackground = (app: SubAppId) => {
    switch (app) {
      case 'HUB':
        return 'party-menu-bg text-slate-800';
      case 'PUB_GOLF':
        return 'bg-emerald-700 text-slate-800';
      case 'CHWAZI':
        return 'bg-[#090d16] text-white';
      case 'DICE':
      case 'RNG':
        return 'bg-[#0a2e18] text-amber-50';
      case 'CROCODILE':
        return 'bg-[#075985] text-sky-100';
      case 'CAMEL_RACE':
        return 'bg-[#fcf8ee] text-slate-800';
      case 'BOER_ZOEKT_VROUW':
        return 'bg-[#fcfbf3] text-slate-800';
      case 'MII_MAKER':
        return 'bg-[#e0f2fe] text-slate-800';
      case 'THIRTY_SECONDS':
        return 'bg-[#fefce8] text-slate-800';
      case 'WIE_IS':
        return 'bg-[#fff5f5] text-slate-800';
      case 'UNDERCOVER':
        return 'bg-[#080b14] text-slate-100';
      case 'BOMB':
        return 'bg-[#0b0f19] text-slate-100';
      case 'CARD_CATALOG':
        return 'bg-[#180a04] text-amber-100';
      case 'WHEEL':
        return 'bg-[#150d24] text-purple-100';
      case 'OP_JE_KOP':
        return 'bg-[#581c87] text-fuchsia-50';
      case 'SNELSTE_VINGER':
        return 'bg-[#0f172a] text-slate-50';
      case 'HOGER_LAGER':
        return 'bg-[#4c0519] text-rose-50';
      case 'NOOIT':
        return 'bg-[#115e59] text-teal-50';
      default:
        return 'party-menu-bg text-slate-800';
    }
  };

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-clip flex flex-col antialiased selection:bg-[#bef264] selection:text-[#14300a] relative transition-colors duration-200 ${getSubAppBackground(
        activeSubApp
      )}`}
    >
      {/* 1. Fixed Background Layer for Pub Golf */}
      {activeSubApp === 'PUB_GOLF' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#15803d',
            width: '100vw',
            height: '100dvh',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-cover bg-center sm:bg-top bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(94, 188, 243, 0.25) 0%, rgba(94, 188, 243, 0.15) 240px, rgba(34, 197, 94, 0.35) 500px, rgba(21, 128, 61, 0.7) 1000px), url(${wiiGolfBg})`,
            }}
          />
        </div>
      )}

      {/* 2. Casino Felt Pattern for Dice & RNG (clean felt, no dots) */}
      {(activeSubApp === 'DICE' || activeSubApp === 'RNG') && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#062814',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 25%, #166534 0%, #0d4524 40%, #062613 85%, #02140a 100%)`,
            }}
          />
        </div>
      )}

      {/* 3. Circus Canopy Red & White Stripes for Rad van Fortuin */}
      {activeSubApp === 'WHEEL' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#7f1d1d',
          }}
          aria-hidden="true"
        >
          {/* Vertical Red & Cream Circus Canopy Stripes */}
          <div
            className="absolute inset-0 opacity-75"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, #991b1b 0px, #991b1b 44px, #fff5f5 44px, #fff5f5 88px)`,
            }}
          />
          {/* Theatrical Vignette & Stage Light */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 35%, rgba(254, 240, 138, 0.28) 0%, rgba(24, 4, 8, 0.65) 65%, rgba(8, 1, 3, 0.95) 100%)`,
            }}
          />
        </div>
      )}

      {/* 4. Deep Blue Aquatic Water Background for Bijtende Krokodil */}
      {activeSubApp === 'CROCODILE' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#0284c7',
          }}
          aria-hidden="true"
        >
          {/* Deep blue aquatic water */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 25%, #38bdf8 0%, #0284c7 35%, #0369a1 65%, #075985 85%, #0c4a6e 100%)`,
            }}
          />
          {/* Water ripples and caustics */}
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: `radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.65) 0%, transparent 40%),
                               radial-gradient(ellipse at 75% 65%, rgba(255,255,255,0.45) 0%, transparent 45%),
                               repeating-radial-gradient(circle at 50% 45%, transparent 0, transparent 45px, rgba(186,230,253,0.3) 48px, transparent 52px)`,
            }}
          />
        </div>
      )}

      {/* 5. Fresh Salad Garden Theme for Slabakken */}
      {activeSubApp === 'SLABAKKEN' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#052e16',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 18%, #15803d 0%, #166534 38%, #052e16 85%)`,
            }}
          />
          {/* Soft salad leaf and vegetable accents in background */}
          <div className="absolute top-12 left-8 text-6xl opacity-10 rotate-12 select-none">🥬</div>
          <div className="absolute top-36 right-12 text-7xl opacity-10 -rotate-45 select-none">🥗</div>
          <div className="absolute bottom-24 left-16 text-6xl opacity-10 rotate-45 select-none">🌿</div>
          <div className="absolute bottom-32 right-20 text-6xl opacity-10 -rotate-12 select-none">🥑</div>
        </div>
      )}

      {/* 6. Grim Military Defusal Hazard Tape Background for Tikkende Bom */}
      {activeSubApp === 'BOMB' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#090d16',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 60%, #020617 100%)`,
            }}
          />
          {/* Top & Bottom Caution Hazard Stripes (Yellow / Black Warning Tape) */}
          <div
            className="absolute top-0 inset-x-0 h-4 shadow-lg border-b border-black z-10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #eab308 0, #eab308 16px, #000 16px, #000 32px)`,
            }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-4 shadow-lg border-t border-black z-10"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, #eab308 0, #eab308 16px, #000 16px, #000 32px)`,
            }}
          />
        </div>
      )}

      {/* 7. Golden Desert Sand Dunes for Kamelenrace */}
      {activeSubApp === 'CAMEL_RACE' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#d97706',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, #fef3c7 0%, #fde68a 25%, #f59e0b 60%, #b45309 100%)`,
            }}
          />
          {/* Warm Desert Dunes silhouettes */}
          <div className="absolute -bottom-24 -left-12 w-[125%] h-72 rounded-[100%] bg-gradient-to-t from-[#92400e] to-[#d97706] opacity-40 blur-xs" />
          <div className="absolute -bottom-36 -right-12 w-[120%] h-80 rounded-[100%] bg-gradient-to-t from-[#78350f] to-[#b45309] opacity-50 blur-xs" />
        </div>
      )}

      {/* 8. Rustic Farm Meadow Grass & Golden Hay for Boer zoekt Vrouw */}
      {activeSubApp === 'BOER_ZOEKT_VROUW' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#166534',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 15%, #fef08a 0%, #84cc16 35%, #15803d 72%, #14532d 100%)`,
            }}
          />
          {/* Golden hay and grass texture overlay */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(#fde047 1px, transparent 1px), radial-gradient(#ca8a04 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          />
        </div>
      )}

      {/* 9. Authentic Oak Bookshelf Library Background for Kaartspellen */}
      {activeSubApp === 'CARD_CATALOG' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#1c0f08',
          }}
          aria-hidden="true"
        >
          {/* Dark mahogany wood paneling */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 20%, #3e1f11 0%, #29140a 50%, #150904 100%)`,
            }}
          />
          {/* Vertical wood grain lines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent 48px, rgba(0,0,0,0.6) 48px, rgba(0,0,0,0.6) 50px)`,
            }}
          />
        </div>
      )}

      {/* 10. Touch Pad Grid for Chwazi (Vingeren) */}
      {activeSubApp === 'CHWAZI' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />
      )}

      {/* 11. Subtle Yellow & Blue 30 Seconds Party Gradient Background */}
      {activeSubApp === 'THIRTY_SECONDS' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#fefce8',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 20% 20%, rgba(250, 204, 21, 0.25) 0%, transparent 45%),
                           radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 45%),
                           linear-gradient(180deg, #fefce8 0%, #f8fafc 50%, #eff6ff 100%)`,
            }}
          />
        </div>
      )}

      {/* 12. Primary Red & Blue Party Aura for Wie is? */}
      {activeSubApp === 'WIE_IS' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#fff5f5',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 20% 15%, rgba(239, 68, 68, 0.22) 0%, transparent 50%),
                           radial-gradient(circle at 80% 85%, rgba(37, 99, 235, 0.18) 0%, transparent 55%),
                           linear-gradient(180deg, #fff5f5 0%, #fef2f2 50%, #eff6ff 100%)`,
            }}
          />
        </div>
      )}

      {/* 13. Feestelijke paarse gloed voor Op je Kop */}
      {activeSubApp === 'OP_JE_KOP' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ backgroundColor: '#581c87' }} aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 15% 12%, rgba(240, 171, 252, 0.55) 0%, transparent 42%),
                           radial-gradient(circle at 88% 82%, rgba(129, 140, 248, 0.5) 0%, transparent 48%),
                           linear-gradient(180deg, #a21caf 0%, #6b21a8 55%, #3b0764 100%)`,
            }}
          />
        </div>
      )}


      {/* 15. Donkere arena met gele energie voor Snelste Vinger */}
      {activeSubApp === 'SNELSTE_VINGER' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ backgroundColor: '#0f172a' }} aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 0%, rgba(250, 204, 21, 0.28) 0%, transparent 50%),
                           radial-gradient(circle at 0% 100%, rgba(239, 68, 68, 0.22) 0%, transparent 45%),
                           radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.22) 0%, transparent 45%),
                           linear-gradient(180deg, #1e293b 0%, #0f172a 60%, #020617 100%)`,
            }}
          />
        </div>
      )}

      {/* 16. Bordeauxrode speeltafel voor Hoger of Lager */}
      {activeSubApp === 'HOGER_LAGER' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ backgroundColor: '#4c0519' }} aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 28%, #be123c 0%, #9f1239 30%, #6b0f2b 62%, #3b0414 100%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
              backgroundSize: '18px 18px',
            }}
          />
        </div>
      )}

      {/* 17. Frisse zeegroene gloed voor Ik heb nog nooit */}
      {activeSubApp === 'NOOIT' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ backgroundColor: '#115e59' }} aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 12%, #5eead4 0%, #14b8a6 28%, #0f766e 62%, #134e4a 100%)`,
            }}
          />
          <div className="absolute top-16 left-6 text-6xl opacity-10 -rotate-12 select-none">🍻</div>
          <div className="absolute top-44 right-8 text-7xl opacity-10 rotate-12 select-none">😇</div>
          <div className="absolute bottom-28 left-12 text-6xl opacity-10 rotate-12 select-none">🤫</div>
          <div className="absolute bottom-40 right-14 text-6xl opacity-10 -rotate-12 select-none">🥂</div>
        </div>
      )}

      {/* 18. Deep Cosmic Void Background for Undercover */}
      {activeSubApp === 'UNDERCOVER' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundColor: '#080b14',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 18%, rgba(6, 182, 212, 0.22) 0%, transparent 55%),
                           radial-gradient(circle at 85% 75%, rgba(168, 85, 247, 0.16) 0%, transparent 50%),
                           radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
                           linear-gradient(180deg, #080b14 0%, #0c1222 50%, #060912 100%)`,
            }}
          />
        </div>
      )}

      {/* Header Navigation */}
      {activeSubApp === 'PUB_GOLF' ? (
        <Header onBackToWiiMenu={() => setActiveSubApp('HUB')} />
      ) : (
        <WiiNavBar
          currentApp={activeSubApp}
          onNavigate={setActiveSubApp}
          pubGolfActive={gameState.isGameActive}
          pubGolfHole={gameState.currentRoundNumber}
          appNameTitle={appTitles[activeSubApp]}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {/* Hub / Main Channel Selection Screen */}
        {activeSubApp === 'HUB' && (
          <WiiChannelGrid
            onSelectApp={handleLaunchFromHub}
            pubGolfActive={gameState.isGameActive}
            pubGolfHole={gameState.currentRoundNumber}
            pubGolfTeamsCount={gameState.teams.length}
          />
        )}

        {/* Chwazi Finger Chooser */}
        <ChannelSlot active={activeSubApp === 'CHWAZI'} visited={isVisited('CHWAZI')}>
          <ChwaziApp />
        </ChannelSlot>

        {/* Rolling Dice & Getal Generator */}
        <ChannelSlot
          active={activeSubApp === 'DICE' || activeSubApp === 'RNG'}
          visited={isVisited('DICE', 'RNG')}
        >
          <RollingDiceApp />
        </ChannelSlot>

        {/* General Party Score Keeper */}
        <ChannelSlot active={activeSubApp === 'SCORE_KEEPER'} visited={isVisited('SCORE_KEEPER')}>
          <ScoreKeeperApp />
        </ChannelSlot>

        {/* Custom Spinning Wheel */}
        <ChannelSlot active={activeSubApp === 'WHEEL'} visited={isVisited('WHEEL')}>
          <SpinningWheelApp />
        </ChannelSlot>

        {/* Het Slabakken Spel (Pannenspel / Times Up) */}
        <ChannelSlot active={activeSubApp === 'SLABAKKEN'} visited={isVisited('SLABAKKEN')}>
          <SlabakkenApp />
        </ChannelSlot>

        {/* Team Maker (Random teams direct of via radje) */}
        <ChannelSlot active={activeSubApp === 'TEAM_MAKER'} visited={isVisited('TEAM_MAKER')}>
          <TeamMakerApp />
        </ChannelSlot>

        {/* Toernooi Manager (Knockout schema & wedstrijden) */}
        <ChannelSlot active={activeSubApp === 'TOURNAMENT'} visited={isVisited('TOURNAMENT')}>
          <TournamentApp />
        </ChannelSlot>

        {/* Bijtende Krokodil (Crocodile Dentist party roulette) */}
        <ChannelSlot active={activeSubApp === 'CROCODILE'} visited={isVisited('CROCODILE')}>
          <CrocodileApp />
        </ChannelSlot>

        {/* Tikkende Bom (Bomb Defusal Hot Potato) */}
        <ChannelSlot active={activeSubApp === 'BOMB'} visited={isVisited('BOMB')}>
          <BombApp />
        </ChannelSlot>

        {/* Woestijn Kamelenrace (Camel Derby Race & Betting) */}
        <ChannelSlot active={activeSubApp === 'CAMEL_RACE'} visited={isVisited('CAMEL_RACE')}>
          <CamelRaceApp />
        </ChannelSlot>

        {/* De Kaartspel Catalogus (Bookshelf & Rules Archive) */}
        <ChannelSlot active={activeSubApp === 'CARD_CATALOG'} visited={isVisited('CARD_CATALOG')}>
          <CardCatalogApp />
        </ChannelSlot>

        {/* Boer zoekt Vrouw Drankspel */}
        <ChannelSlot active={activeSubApp === 'BOER_ZOEKT_VROUW'} visited={isVisited('BOER_ZOEKT_VROUW')}>
          <BoerZoektVrouwApp />
        </ChannelSlot>

        {/* Mii Maker Channel */}
        <ChannelSlot active={activeSubApp === 'MII_MAKER'} visited={isVisited('MII_MAKER')}>
          <MiiMakerApp />
        </ChannelSlot>

        {/* 30 Seconds Channel */}
        <ChannelSlot active={activeSubApp === 'THIRTY_SECONDS'} visited={isVisited('THIRTY_SECONDS')}>
          <ThirtySecondsApp isCurrentApp={activeSubApp === 'THIRTY_SECONDS'} />
        </ChannelSlot>

        {/* Wie is? Most Likely To Ticking Bomb Channel */}
        <ChannelSlot active={activeSubApp === 'WIE_IS'} visited={isVisited('WIE_IS')}>
          <WieIsApp isCurrentApp={activeSubApp === 'WIE_IS'} />
        </ChannelSlot>

        {/* Op je Kop (woord op je voorhoofd, kantelen voor goed of pas) */}
        <ChannelSlot active={activeSubApp === 'OP_JE_KOP'} visited={isVisited('OP_JE_KOP')}>
          <OpJeKopApp isCurrentApp={activeSubApp === 'OP_JE_KOP'} />
        </ChannelSlot>


        {/* Snelste Vinger (reactieduel voor 2 tot 4 spelers op één scherm) */}
        <ChannelSlot active={activeSubApp === 'SNELSTE_VINGER'} visited={isVisited('SNELSTE_VINGER')}>
          <SnelsteVingerApp isCurrentApp={activeSubApp === 'SNELSTE_VINGER'} />
        </ChannelSlot>

        {/* Hoger of Lager (kaartspel met een pot die steeds verder oploopt) */}
        <ChannelSlot active={activeSubApp === 'HOGER_LAGER'} visited={isVisited('HOGER_LAGER')}>
          <HogerLagerApp />
        </ChannelSlot>

        {/* Ik heb nog nooit (stellingen van gezellig tot pittig) */}
        <ChannelSlot active={activeSubApp === 'NOOIT'} visited={isVisited('NOOIT')}>
          <NooitApp />
        </ChannelSlot>

        {/* Undercover Secret Alien Word Game Channel */}
        <ChannelSlot active={activeSubApp === 'UNDERCOVER'} visited={isVisited('UNDERCOVER')}>
          <UndercoverApp />
        </ChannelSlot>

        {/* Pub Golf Pro (Active SubApp) */}
        {activeSubApp === 'PUB_GOLF' && (
          <Suspense fallback={<ChannelLoading />}>
            {gameState.view === 'home' && (
              <HomeScreen
                pubs={gameState.pubs}
                drinks={gameState.drinks}
                challenges={gameState.challenges}
                isGameActive={gameState.isGameActive}
                isGameFinished={gameState.isGameFinished}
                isPermanentlyFinished={gameState.isPermanentlyFinished}
                rounds={gameState.rounds}
                currentRoundNumber={gameState.currentRoundNumber}
                onUpdatePubs={handleUpdatePubs}
                onUpdateDrinks={handleUpdateDrinks}
                onUpdateChallenges={handleUpdateChallenges}
                onStartNewGame={handleStartNewGame}
                onResumeGame={handleResumeGame}
                onContinueGame={() => handleContinueGame()}
                onViewResults={() => setGameState(prev => ({ ...prev, view: 'post-game' }))}
              />
            )}

            {gameState.view === 'team-setup' && (
              <TeamSetupScreen
                initialPlayers={gameState.players}
                initialTeams={gameState.teams}
                onBackToHome={handleBackToHome}
                onConfirmTeams={handleConfirmTeams}
              />
            )}

            {gameState.view === 'active-game' && (
              <ActiveGameScreen
                pubs={gameState.pubs}
                drinks={gameState.drinks}
                challenges={gameState.challenges}
                teams={gameState.teams}
                rounds={gameState.rounds}
                currentRoundNumber={gameState.currentRoundNumber}
                initialHoleNumber={jumpToHole ?? undefined}
                showCourseChecklist={showCourseChecklist}
                onToggleCourseChecklist={setShowCourseChecklist}
                onExitToHome={handleBackToHome}
                onBackToTeams={() => {
                  setGameState(prev => ({ ...prev, view: 'team-setup' }));
                  sounds.playTick(600);
                }}
                onFinishGame={handleFinishGame}
                onCompleteRound={handleCompleteRound}
                onAddPub={handleAddPub}
                onAddDrink={handleAddDrink}
                onAddChallenge={handleAddChallenge}
                onUpdateTeams={handleUpdateTeams}
                onUpdateRound={handleUpdateRound}
              />
            )}

            {gameState.view === 'post-game' && (
              <PostGameScreen
                pubs={gameState.pubs}
                drinks={gameState.drinks}
                challenges={gameState.challenges}
                teams={gameState.teams}
                rounds={gameState.rounds}
                isPermanentlyFinished={gameState.isPermanentlyFinished}
                onContinueGame={() => handleContinueGame()}
                onFinalizeGame={handleFinalizeGame}
                onBackToHome={handleBackToHome}
                onEditHole={handleEditHoleFromPostGame}
              />
            )}
          </Suspense>
        )}
      </main>

      {/* Korte witte flits als overgang bij het starten van een kanaal */}
      {launchFlashId > 0 && <div key={launchFlashId} className="channel-launch-flash" aria-hidden="true" />}

      {/* Opstartanimatie (één keer per sessie) */}
      <BootSplash />

      {/* Incoming Shared Route Detected Modal */}
      {incomingSharedRoute && (
        <IncomingSharedRouteModal
          route={incomingSharedRoute}
          onClose={handleCloseSharedRouteModal}
          onApplyAndPlay={(template) => {
            setActiveSubApp('PUB_GOLF');
            handleApplySharedRoute(template);
          }}
          onSaveToMyRoutes={handleSaveSharedRoute}
        />
      )}

    </div>
  );
}

