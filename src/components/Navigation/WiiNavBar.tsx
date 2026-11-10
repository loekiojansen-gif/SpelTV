import { useState, useEffect } from 'react';
import { Home, Flag, RotateCcw, HelpCircle, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { SubAppId } from '../../types';
import { GAME_RULES } from './gameRules';

interface WiiNavBarProps {
  currentApp: SubAppId;
  onNavigate: (app: SubAppId) => void;
  pubGolfActive?: boolean;
  pubGolfHole?: number;
  appNameTitle?: string;
  onReset?: () => void;
}

const APP_HEADER_CONFIG: Record<SubAppId, { emoji: string; title: string }> = {
  HUB: { emoji: '', title: 'Party Channels' },
  PUB_GOLF: { emoji: '🏌️‍♂️', title: 'Pub Golf Pro' },
  CHWAZI: { emoji: '👆', title: 'Vingeren' },
  DICE: { emoji: '🎲', title: 'Dobbelstenen' },
  RNG: { emoji: '🔢', title: 'Willekeurig Getal' },
  SCORE_KEEPER: { emoji: '📋', title: 'Scorebord' },
  WHEEL: { emoji: '🎡', title: 'Rad van Fortuin' },
  SLABAKKEN: { emoji: '🥗', title: 'Slabakken' },
  TEAM_MAKER: { emoji: '👥', title: 'Team Maker' },
  TOURNAMENT: { emoji: '🏆', title: 'Toernooi Manager' },
  CROCODILE: { emoji: '🐊', title: 'Bijtende Krokodil' },
  BOMB: { emoji: '💣', title: 'Tikkende Bom' },
  CAMEL_RACE: { emoji: '🐫', title: 'Kamelenrace' },
  CARD_CATALOG: { emoji: '📚', title: 'Bibliotheek' },
  BOER_ZOEKT_VROUW: { emoji: '👨‍🌾', title: 'Boer zoekt Vrouw' },
  MII_MAKER: { emoji: '👤', title: 'Spelers' },
  THIRTY_SECONDS: { emoji: '⏱️', title: '30 Seconds' },
  WIE_IS: { emoji: '❓', title: 'Wie is?' },
  UNDERCOVER: { emoji: '👽', title: 'Undercover' },
  OP_JE_KOP: { emoji: '🤯', title: 'Op je Kop' },
  SNELSTE_VINGER: { emoji: '⚡', title: 'Snelste Vinger' },
  HOGER_LAGER: { emoji: '🃏', title: 'Hoger of Lager' },
  NOOIT: { emoji: '😇', title: 'Ik heb nog nooit' },
};

export function WiiNavBar({
  currentApp,
  onNavigate,
  pubGolfActive = false,
  pubGolfHole = 1,
  appNameTitle,
}: WiiNavBarProps) {
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(() => sounds.getMuted());

  useEffect(() => {
    setMuted(sounds.getMuted());
  }, []);

  const handleHomeClick = () => {
    sounds.playWiiBack();
    onNavigate('HUB');
  };

  const handlePubGolfJump = () => {
    sounds.playWiiSelect();
    onNavigate('PUB_GOLF');
  };

  // If we are on the HUB, do not render any top header banner
  if (currentApp === 'HUB') {
    return null;
  }

  const config = APP_HEADER_CONFIG[currentApp] || { emoji: '🎮', title: appNameTitle || 'Spel' };
  const ruleInfo = GAME_RULES[currentApp] || {
    title: config.title,
    emoji: config.emoji,
    summary: 'Veel plezier met dit spel!',
    rules: ['Volg de aanwijzingen op het scherm om te spelen.'],
  };

  return (
    <>
      <header
        style={{
          paddingTop: 'max(1.35rem, calc(1.35rem + env(safe-area-inset-top, 0px)))',
        }}
        className="sticky top-0 z-30 w-full bg-transparent px-3 sm:px-4 pb-2 transition-all select-none"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Wii Home Button */}
          <div className="flex items-center shrink-0">
            <button
              onClick={handleHomeClick}
              className="w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-white/25 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              title="Party Menu"
            >
              <Home className="w-4.5 h-4.5 text-sky-200" />
            </button>
          </div>

          {/* Center: Title with Emoji - Clickable to open Rules & Explanation modal! */}
          <button
            onClick={() => {
              sounds.playWiiSelect();
              setShowRulesModal(true);
            }}
            className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-white/25 hover:border-white/40 shadow-lg text-white transition-all cursor-pointer active:scale-95 group"
            title="Klik voor uitleg en spelregels"
          >
            <span className="text-lg sm:text-xl shrink-0 select-none drop-shadow-sm group-hover:scale-110 transition-transform">
              {config.emoji}
            </span>
            <h1 className="font-black text-white text-sm sm:text-base tracking-tight truncate select-none drop-shadow-sm">
              {config.title}
            </h1>
            <HelpCircle className="w-3.5 h-3.5 text-sky-300 opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>

          {/* Right: Reset Button (Volume button removed per request) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {pubGolfActive && currentApp !== 'PUB_GOLF' && (
              <button
                onClick={handlePubGolfJump}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all active:scale-95 border border-emerald-300 animate-pulse cursor-pointer"
                title="Ga terug naar de actieve Pub Golf ronde"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Hole {pubGolfHole}</span>
              </button>
            )}

            {/* Volume / Mute Toggle */}
            <button
              onClick={() => {
                const next = !muted;
                sounds.setMuted(next);
                setMuted(next);
                if (!next) sounds.playTick(1000);
              }}
              aria-label={muted ? 'Geluid aanzetten' : 'Geluid dempen'}
              title={muted ? 'Geluid aanzetten' : 'Geluid dempen'}
              className="w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-white/25 text-sky-300 hover:text-sky-200 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-sky-400 animate-pulse" />
              )}
            </button>

            {/* Reset Knop voor alle spellen */}
            <button
              onClick={() => {
                sounds.playTick(500);
                window.dispatchEvent(
                  new CustomEvent('party_game_reset', { detail: { app: currentApp } })
                );
              }}
              aria-label="Spel resetten"
              title="Spel resetten"
              className="w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-white/25 text-rose-300 hover:text-rose-200 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-rose-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Rules & Game Explanation Pop-up Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border-4 border-slate-300 p-5 sm:p-6 w-full max-w-md shadow-2xl text-slate-950 flex flex-col relative max-h-[85vh] overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={() => {
                sounds.playTick(500);
                setShowRulesModal(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
              title="Sluiten"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Game Emoji & Title */}
            <div className="flex items-center gap-3 mb-3 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 border-2 border-blue-700 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                {ruleInfo.emoji}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                  Spelregels &amp; Uitleg
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  {ruleInfo.title}
                </h2>
              </div>
            </div>

            {/* Short Pitch / Summary */}
            <p className="text-xs sm:text-sm font-bold text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {ruleInfo.summary}
            </p>

            {/* Rules Checklist */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
              {ruleInfo.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-semibold leading-relaxed">{rule}</span>
                </div>
              ))}

              {ruleInfo.tip && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-yellow-50 border border-yellow-300 text-xs text-yellow-950 font-bold mt-2">
                  <Sparkles className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                  <span>Tip: {ruleInfo.tip}</span>
                </div>
              )}
            </div>

            {/* Close / Begrepen Button */}
            <button
              onClick={() => {
                sounds.playTick(600);
                setShowRulesModal(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wide shadow-md active:scale-95 transition-all cursor-pointer border-2 border-blue-700"
            >
              Begrepen!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
