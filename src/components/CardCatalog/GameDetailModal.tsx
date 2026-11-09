import React, { useState, useEffect } from 'react';
import { CardGame } from './types';
import { CardMeaningGrid } from './CardMeaningGrid';
import {
  X,
  Copy,
  Check,
  Share2,
  Users,
  Flame,
  Clock,
  Music,
  Sparkles,
  BookOpen,
  Trash2,
  QrCode,
  Package,
  ExternalLink,
  Volume2,
  Play,
  RotateCcw,
  Edit3,
} from 'lucide-react';
import QRCode from 'qrcode';
import { sounds } from '../../utils/audio';

interface GameDetailModalProps {
  game: CardGame | null;
  onClose: () => void;
  onDeleteCustom?: (id: string) => void;
  onEdit?: (game: CardGame) => void;
}

type TabType = 'rules' | 'required' | 'cards' | 'music' | 'share';

export const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, onClose, onDeleteCustom, onEdit }) => {
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Interactive Music Simulator Timer
  const [musicSimRunning, setMusicSimRunning] = useState(false);
  const [musicSimSeconds, setMusicSimSeconds] = useState(15);

  useEffect(() => {
    setActiveTab('rules');
    setCopied(false);
    setMusicSimRunning(false);
    setMusicSimSeconds(15);
  }, [game?.id]);

  useEffect(() => {
    if (game) {
      // Generate share text for QR code
      const shareText = `🍺 ${game.title} - Spelregels:\n${game.description}\n\nNodig:\n${game.required.map(r => `• ${r}`).join('\n')}`;
      QRCode.toDataURL(shareText, { margin: 1.5, width: 240 })
        .then(url => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [game]);

  // Refrein countdown effect for music games
  useEffect(() => {
    if (!musicSimRunning) return;
    if (musicSimSeconds > 0) {
      const timer = setTimeout(() => {
        sounds.playTick(musicSimSeconds <= 3 ? 900 : 500);
        setMusicSimSeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setMusicSimRunning(false);
      sounds.playRoosterCrow();
    }
  }, [musicSimRunning, musicSimSeconds]);

  if (!game) return null;

  const handleStartMusicSim = () => {
    setMusicSimSeconds(game.id === 'pisk_mich_hardt' ? 10 : 15);
    setMusicSimRunning(true);
    if (game.id === 'opus') {
      sounds.playOpusChant();
    } else if (game.id === 'pisk_mich_hardt') {
      sounds.playBassBeat();
    } else {
      sounds.playFanfare();
    }
  };

  const handleCopyText = async () => {
    let fullText = `🍺 ${game.title.toUpperCase()} 🍺\n${game.subtitle}\n\n`;
    fullText += `👥 Spelers: ${game.players}\n`;
    fullText += `⚡ Intensiteit: ${'🍺'.repeat(game.intensity)}\n\n`;
    fullText += `📦 BENODIGDHEDEN:\n${game.required.map(r => `• ${r}`).join('\n')}\n\n`;

    if (game.musicNeeded && game.musicNeeded.length > 0) {
      fullText += `🎵 MUZIEK NODIG:\n${game.musicNeeded.map(m => `• ${m}`).join('\n')}\n\n`;
    }

    fullText += `📜 OMSCHRIJVING & SPELREGELS:\n${game.description}\n\n`;

    if (game.rulesSteps && game.rulesSteps.length > 0) {
      fullText += `STAPPENPLAN:\n`;
      game.rulesSteps.forEach((step, i) => {
        fullText += `${i + 1}. ${step.title}\n${step.content}\n\n`;
      });
    }

    if (game.cardMeanings && game.cardMeanings.length > 0) {
      fullText += `🃏 BETEKENISSEN:\n`;
      game.cardMeanings.forEach(m => {
        fullText += `• ${m.key}: ${m.action}${m.description ? ` (${m.description})` : ''}\n`;
      });
      fullText += `\n`;
    }

    if (game.tips && game.tips.length > 0) {
      fullText += `💡 TIPS & HUISREGELS:\n${game.tips.map(t => `• ${t}`).join('\n')}\n`;
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
      }
      setCopied(true);
      sounds.playReveal();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${game.title} - Drankspel Regels`,
          text: `Bekijk de regels voor ${game.title}!\n\n${game.description}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 pb-4 px-3 sm:px-5 bg-slate-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#faf7f2] rounded-3xl shadow-2xl border-4 border-[#decbb4] overflow-hidden flex flex-col max-h-[calc(100vh-5.25rem)]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,0,0,0.1)',
        }}
      >
        {/* Decorative Book Header Spine */}
        <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 text-white px-5 py-4 flex items-center justify-between border-b-2 border-amber-900/60 relative shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-md select-none">{game.iconEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-amber-100">
                  {game.title}
                </h2>
                {game.isCustom && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-300 border border-amber-400/50 px-2 py-0.5 rounded-full">
                    Eigen Spel
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/85 line-clamp-1">{game.subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTick(500);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Spec Pills Bar */}
        <div className="bg-[#f0e8dc] px-4 sm:px-6 py-2.5 border-b border-[#decbb4] flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700 shrink-0">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-2xs border border-slate-200">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{game.players}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-2xs border border-slate-200">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="flex items-center gap-0.5">
              Intensiteit:{' '}
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < game.intensity ? 'opacity-100' : 'opacity-20 grayscale'}`}
                >
                  🍺
                </span>
              ))}
            </span>
          </div>

          {game.durationMinutes && (
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-2xs border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{game.durationMinutes}</span>
            </div>
          )}
        </div>

        {/* PROMINENT NAVIGATION TABS BAR - Voldoende ruimte & direct zichtbaar */}
        <div className="bg-[#e9dfcf] px-3 sm:px-6 py-2.5 border-b-2 border-[#d5c3aa] flex items-center gap-2 overflow-x-auto scrollbar-thin shrink-0">
          {/* TAB 1: SPELREGELS */}
          <button
            type="button"
            onClick={() => {
              sounds.playTick(600);
              setActiveTab('rules');
            }}
            className={`shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap select-none shadow-xs ${
              activeTab === 'rules'
                ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md scale-[1.02]'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-slate-950 border border-[#decbb4]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-900" />
            <span>📜 Spelregels</span>
          </button>

          {/* TAB 2: BENODIGDHEDEN */}
          <button
            type="button"
            onClick={() => {
              sounds.playTick(600);
              setActiveTab('required');
            }}
            className={`shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap select-none shadow-xs ${
              activeTab === 'required'
                ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md scale-[1.02]'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-slate-950 border border-[#decbb4]'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-700" />
            <span>🎒 Benodigdheden</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === 'required' ? 'bg-amber-800 text-amber-100' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {game.required.length}
            </span>
          </button>

          {/* TAB 3: KAARTEN & WORPEN (IF APPLICABLE) */}
          {game.cardMeanings && game.cardMeanings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playTick(600);
                setActiveTab('cards');
              }}
              className={`shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap select-none shadow-xs ${
                activeTab === 'cards'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md scale-[1.02]'
                  : 'bg-white/90 text-slate-700 hover:bg-white hover:text-slate-950 border border-[#decbb4]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>🃏 Kaarten & Worpen</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'cards' ? 'bg-amber-800 text-amber-100' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {game.cardMeanings.length}
              </span>
            </button>
          )}

          {/* TAB 4: MUZIEK (IF APPLICABLE) */}
          {game.musicNeeded && game.musicNeeded.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playTick(600);
                setActiveTab('music');
              }}
              className={`shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap select-none shadow-xs ${
                activeTab === 'music'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md scale-[1.02]'
                  : 'bg-white/90 text-slate-700 hover:bg-white hover:text-slate-950 border border-[#decbb4]'
              }`}
            >
              <Music className="w-4 h-4 text-violet-600 animate-bounce" />
              <span>🎵 Muziek & Audio</span>
            </button>
          )}

          {/* TAB 5: DELEN & QR */}
          <button
            type="button"
            onClick={() => {
              sounds.playTick(600);
              setActiveTab('share');
            }}
            className={`shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap select-none shadow-xs ${
              activeTab === 'share'
                ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md scale-[1.02]'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-slate-950 border border-[#decbb4]'
            }`}
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>📤 Delen & QR</span>
          </button>
        </div>

        {/* Scrollable Book Content Page */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-white space-y-6">
          {/* TAB 1: RULES & EXPLANATION */}
          {activeTab === 'rules' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Core Description Quote Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-amber-950 text-sm leading-relaxed font-medium shadow-2xs">
                <p className="text-sm sm:text-base font-semibold leading-relaxed">{game.description}</p>
              </div>

              {/* Quick Jump Bar to Benodigdheden */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Klaarzetten voor dit spel: {game.required.join(', ')}</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playTick(500);
                    setActiveTab('required');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Bekijk Alles 🎒
                </button>
              </div>

              {/* Music requirement banner if applicable */}
              {game.musicNeeded && game.musicNeeded.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-950 to-slate-900 text-white shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-violet-200 text-sm">
                      <Music className="w-4 h-4 animate-bounce text-violet-400" />
                      <span>Muziektrack Vereist voor dit spel:</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('music')}
                      className="text-xs text-amber-300 hover:underline font-bold cursor-pointer"
                    >
                      Muziekpaneel openen →
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {game.musicNeeded.map((track, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs font-bold text-white bg-white/10 px-3.5 py-2 rounded-xl"
                      >
                        <span className="flex items-center gap-2">
                          <span>🎵</span>
                          <span>{track}</span>
                        </span>
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(track)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <span>Spotify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Sections */}
              {game.rulesSteps && game.rulesSteps.length > 0 && (
                <div className="space-y-3.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Spelverloop & Regels
                  </h3>
                  <div className="space-y-3">
                    {game.rulesSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {idx + 1}
                          </span>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{step.title}</h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-8.5 font-medium">
                          {step.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Card Meanings Preview if exists */}
              {game.cardMeanings && game.cardMeanings.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Belangrijkste Kaartbetekenissen
                    </h3>
                    <button
                      onClick={() => setActiveTab('cards')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      Bekijk alle ({game.cardMeanings.length}) →
                    </button>
                  </div>
                  <CardMeaningGrid meanings={game.cardMeanings.slice(0, 4)} />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUIREMENTS & PRO TIPS (BENODIGDHEDEN TAB) */}
          {activeTab === 'required' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-start gap-3">
                <span className="text-3xl">🎒</span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-emerald-950">
                    Wat heb je nodig voor {game.title}?
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Controleer deze checklist voordat jullie beginnen zodat de ronde soepel verloopt!
                  </p>
                </div>
              </div>

              {/* Supplies Checklist */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Checklist Benodigdheden
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {game.required.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs"
                    >
                      <span className="w-6 h-6 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 font-black text-sm">
                        ✓
                      </span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Music Requirement in Requirements Tab */}
              {game.musicNeeded && game.musicNeeded.length > 0 && (
                <div className="p-4 rounded-2xl bg-violet-50 border-2 border-violet-200 space-y-2.5">
                  <div className="flex items-center gap-2 font-black text-violet-950 text-sm">
                    <Music className="w-4 h-4 text-violet-600" />
                    <span>Muziektrack Paraat Hebben:</span>
                  </div>
                  <div className="space-y-2">
                    {game.musicNeeded.map((track, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-violet-100 text-xs font-bold text-slate-900"
                      >
                        <span className="flex items-center gap-2">
                          <span>🎵</span>
                          <span>{track}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://open.spotify.com/search/${encodeURIComponent(track)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1 transition-colors"
                          >
                            <span>Spotify</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1 transition-colors"
                          >
                            <span>YouTube</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips & House Rules */}
              {game.tips && game.tips.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                    Tips & Huisregels van het Huis
                  </h4>
                  <div className="space-y-2.5">
                    {game.tips.map((tip, i) => (
                      <div
                        key={i}
                        className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-3 shadow-2xs font-medium"
                      >
                        <span className="text-lg leading-none shrink-0">💡</span>
                        <p className="leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CARDS & DICE MEANINGS */}
          {activeTab === 'cards' && game.cardMeanings && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-xs sm:text-sm text-slate-600 font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                Spiekbrief voor aan tafel: bekijk razendsnel wat elke kaart of worp betekent tijdens het spel.
              </div>
              <CardMeaningGrid meanings={game.cardMeanings} />
            </div>
          )}

          {/* TAB 4: MUSIC & AUDIO COMPANION (VOOR OPUS EN PISK MICH HARDT) */}
          {activeTab === 'music' && game.musicNeeded && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 text-white shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
                    🎵
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-white">
                      Muzikale Spelmodus: {game.title}
                    </h3>
                    <p className="text-xs text-violet-200">
                      Zet dit nummer aan via jullie speaker of speel de audio cues rechtstreeks af!
                    </p>
                  </div>
                </div>

                {/* Direct song links */}
                <div className="space-y-2 pt-2">
                  {game.musicNeeded.map((track, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-extrabold text-sm text-white">{track}</div>
                        <div className="text-[11px] text-violet-300">
                          {game.id === 'opus' ? 'Dobbelen & adten op "Na na na na na"' : 'Klop op tafel & drink op de schreeuw'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(track)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-black font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <span>Spotify</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <span>YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Refrein / Beat Simulator Box */}
              <div className="p-5 rounded-3xl bg-slate-900 border-2 border-amber-400 text-white text-center space-y-4 shadow-xl">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Interactieve Refrein Oefenknop
                  </span>
                  <h4 className="text-lg font-black text-white">
                    {game.id === 'opus' ? '🚨 "Na na na na na!" Refrein Trigger' : '🥁 "Pisk Mich Hardt!" Drop Simulator'}
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    {game.id === 'opus'
                      ? 'Klik hier als het refrein inzet: de 15-seconden adt-timer start en iedereen moet in sneltreinvaart dobbelen!'
                      : 'Klik hier zodra de beat valt: start de drink-countdown en sla synchroon op tafel!'}
                  </p>
                </div>

                {/* Big Action Button */}
                <div className="py-2">
                  <button
                    type="button"
                    onClick={handleStartMusicSim}
                    className={`px-6 py-4 rounded-2xl font-black text-sm sm:text-base shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 mx-auto active:scale-95 ${
                      musicSimRunning
                        ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-400'
                        : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-2 border-amber-300'
                    }`}
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>
                      {musicSimRunning
                        ? `🚨 REFRIEN BEZIG: ${musicSimSeconds}s OVER!`
                        : game.id === 'opus'
                        ? '🎺 Speel Refrein Signaal & Start Adt-Timer!'
                        : '🥁 Sla Bass Beat & Start Drink-Drop!'}
                    </span>
                  </button>
                </div>

                {musicSimRunning && (
                  <div className="text-center space-y-2 animate-fadeIn">
                    <span className="text-6xl font-black text-amber-300 font-mono block">
                      {musicSimSeconds}
                    </span>
                    <span className="text-xs text-red-300 font-bold uppercase tracking-widest block animate-bounce">
                      {game.id === 'opus' ? 'DOBBELEN & ZUIPEN BIJ EEN 1!' : 'NIET STOPPEN MET DRINKEN!'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SHARE & QR */}
          {activeTab === 'share' && (
            <div className="space-y-6 text-center py-2 animate-fadeIn">
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-black text-lg sm:text-xl text-slate-900">
                  Deel {game.title} met je vrienden
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Kopieer de volledige spelregels direct naar je klembord voor WhatsApp of laat medespelers deze QR-code scannen aan tafel!
                </p>
              </div>

              {/* QR Code Container */}
              {qrDataUrl && (
                <div className="inline-block p-4 bg-white rounded-3xl shadow-lg border-2 border-slate-200">
                  <img
                    src={qrDataUrl}
                    alt={`QR Code voor ${game.title}`}
                    className="w-48 h-48 mx-auto rounded-xl"
                  />
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 mt-2">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan voor regels op je mobiel</span>
                  </div>
                </div>
              )}

              {/* Share Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCopyText}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      Gekopieerd naar Klembord!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Kopieer Spelregels (WhatsApp)
                    </>
                  )}
                </button>

                <button
                  onClick={handleNativeShare}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Deel direct via Berichten
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-[#f0e8dc] px-5 py-3 border-t-2 border-[#decbb4] flex items-center justify-between shrink-0">
          {game.isCustom && onDeleteCustom ? (
            <button
              onClick={() => {
                if (window.confirm(`Weet je zeker dat je "${game.title}" wilt verwijderen?`)) {
                  onDeleteCustom(game.id);
                  onClose();
                }
              }}
              className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Spel Verwijderen
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 font-medium">
            
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {onEdit && (
              <button
                onClick={() => {
                  sounds.playTick(600);
                  onEdit(game);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                title="Pas dit spel of de regels aan"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Aanpassen
              </button>
            )}

            <button
              onClick={handleCopyText}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Gekopieerd' : 'Kopieer'}
            </button>

            <button
              onClick={() => {
                sounds.playTick(500);
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
