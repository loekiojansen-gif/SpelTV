import { useState, useEffect } from 'react';
import { GameState, PubItem, DrinkItem, ChallengeItem, Player, Team, Round, HistoricalGame, CourseTemplate, SubAppId } from './types';
import { loadGameState, saveGameState, clearGameProgress, saveGameToHistory, saveRememberedPlayers, loadTemplates, saveTemplates } from './utils/storage';
import { checkForSharedRouteInUrl, clearRouteParamFromUrl } from './utils/routeSharing';
import { checkForSharedWheelInUrl } from './utils/wheelSharing';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { TeamSetupScreen } from './components/TeamSetupScreen';
import { ActiveGameScreen } from './components/ActiveGameScreen';
import { PostGameScreen } from './components/PostGameScreen';
import { IncomingSharedRouteModal } from './components/IncomingSharedRouteModal';
import { WiiNavBar } from './components/Navigation/WiiNavBar';
import { WiiChannelGrid } from './components/WiiHub/WiiChannelGrid';
import { ChwaziApp } from './components/Chwazi/ChwaziApp';
import { RollingDiceApp } from './components/Dice/RollingDiceApp';
import { ScoreKeeperApp } from './components/ScoreKeeper/ScoreKeeperApp';
import { RandomNumberApp } from './components/RNG/RandomNumberApp';
import { SpinningWheelApp } from './components/Wheel/SpinningWheelApp';
import { SlabakkenApp } from './components/Slabakken/SlabakkenApp';
import { TeamMakerApp } from './components/TeamMaker/TeamMakerApp';
import { TournamentApp } from './components/Tournament/TournamentApp';
import { CrocodileApp } from './components/Crocodile/CrocodileApp';
import { BombApp } from './components/Bomb/BombApp';
import { CamelRaceApp } from './components/CamelRace/CamelRaceApp';
import { CardCatalogApp } from './components/CardCatalog/CardCatalogApp';
import { BoerZoektVrouwApp } from './components/BoerZoektVrouw/BoerZoektVrouwApp';
import { MiiMakerApp } from './components/MiiMaker/MiiMakerApp';
import { ThirtySecondsApp } from './components/ThirtySeconds/ThirtySecondsApp';
import { WieIsApp } from './components/WieIs/WieIsApp';
import { sounds } from './utils/audio';
import wiiGolfBg from './assets/wii_golf_bg.jpg';

export default function App() {
  const [activeSubApp, setActiveSubApp] = useState<SubAppId>('HUB');
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [jumpToHole, setJumpToHole] = useState<number | null>(null);
  const [incomingSharedRoute, setIncomingSharedRoute] = useState<CourseTemplate | null>(null);
  const [showCourseChecklist, setShowCourseChecklist] = useState(false);


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
        return 'bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#ffffff] text-slate-800';
      case 'THIRTY_SECONDS':
        return 'bg-gradient-to-b from-[#fefce8] via-[#f8fafc] to-[#eff6ff] text-slate-800';
      case 'WIE_IS':
        return 'bg-gradient-to-b from-[#fef2f2] via-[#fff5f5] to-[#eff6ff] text-slate-800';
      case 'BOMB':
        return 'bg-[#0b0f19] text-slate-100';
      case 'CARD_CATALOG':
        return 'bg-[#180a04] text-amber-100';
      case 'WHEEL':
        return 'bg-[#150d24] text-purple-100';
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
            onSelectApp={setActiveSubApp}
            pubGolfActive={gameState.isGameActive}
            pubGolfHole={gameState.currentRoundNumber}
            pubGolfTeamsCount={gameState.teams.length}
          />
        )}

        {/* Chwazi Finger Chooser */}
        <div className={activeSubApp === 'CHWAZI' ? 'block' : 'hidden'}>
          <ChwaziApp />
        </div>

        {/* Rolling Dice & Getal Generator */}
        <div className={(activeSubApp === 'DICE' || activeSubApp === 'RNG') ? 'block' : 'hidden'}>
          <RollingDiceApp />
        </div>

        {/* General Party Score Keeper */}
        <div className={activeSubApp === 'SCORE_KEEPER' ? 'block' : 'hidden'}>
          <ScoreKeeperApp />
        </div>

        {/* Custom Spinning Wheel */}
        <div className={activeSubApp === 'WHEEL' ? 'block' : 'hidden'}>
          <SpinningWheelApp />
        </div>

        {/* Het Slabakken Spel (Pannenspel / Times Up) */}
        <div className={activeSubApp === 'SLABAKKEN' ? 'block' : 'hidden'}>
          <SlabakkenApp />
        </div>

        {/* Team Maker (Random teams direct of via radje) */}
        <div className={activeSubApp === 'TEAM_MAKER' ? 'block' : 'hidden'}>
          <TeamMakerApp />
        </div>

        {/* Toernooi Manager (Knockout schema & wedstrijden) */}
        <div className={activeSubApp === 'TOURNAMENT' ? 'block' : 'hidden'}>
          <TournamentApp />
        </div>

        {/* Bijtende Krokodil (Crocodile Dentist party roulette) */}
        <div className={activeSubApp === 'CROCODILE' ? 'block' : 'hidden'}>
          <CrocodileApp />
        </div>

        {/* Tikkende Bom (Bomb Defusal Hot Potato) */}
        <div className={activeSubApp === 'BOMB' ? 'block' : 'hidden'}>
          <BombApp />
        </div>

        {/* Woestijn Kamelenrace (Camel Derby Race & Betting) */}
        <div className={activeSubApp === 'CAMEL_RACE' ? 'block' : 'hidden'}>
          <CamelRaceApp />
        </div>

        {/* De Kaartspel Catalogus (Bookshelf & Rules Archive) */}
        <div className={activeSubApp === 'CARD_CATALOG' ? 'block' : 'hidden'}>
          <CardCatalogApp />
        </div>

        {/* Boer zoekt Vrouw Drankspel */}
        <div className={activeSubApp === 'BOER_ZOEKT_VROUW' ? 'block' : 'hidden'}>
          <BoerZoektVrouwApp />
        </div>

        {/* Mii Maker Channel */}
        <div className={activeSubApp === 'MII_MAKER' ? 'block' : 'hidden'}>
          <MiiMakerApp />
        </div>

        {/* 30 Seconds Channel */}
        <div className={activeSubApp === 'THIRTY_SECONDS' ? 'block' : 'hidden'}>
          <ThirtySecondsApp isCurrentApp={activeSubApp === 'THIRTY_SECONDS'} />
        </div>

        {/* Wie is? Most Likely To Ticking Bomb Channel */}
        <div className={activeSubApp === 'WIE_IS' ? 'block' : 'hidden'}>
          <WieIsApp isCurrentApp={activeSubApp === 'WIE_IS'} />
        </div>

        {/* Pub Golf Pro (Active SubApp) */}
        {activeSubApp === 'PUB_GOLF' && (
          <>
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
          </>
        )}
      </main>

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

