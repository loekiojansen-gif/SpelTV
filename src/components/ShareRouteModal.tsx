import { useState } from 'react';
import { X, Share2, Copy, Check, MapPin, Beer, Gamepad2 } from 'lucide-react';
import { CourseTemplate, PubItem, DrinkItem, ChallengeItem } from '../types';
import { generateShareableUrl } from '../utils/routeSharing';
import { copyToClipboard } from '../utils/clipboard';
import { sounds } from '../utils/audio';

interface ShareRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: {
    name: string;
    city?: string;
    pubs: PubItem[];
    drinks: DrinkItem[];
    challenges: ChallengeItem[];
  };
}

export function ShareRouteModal({ isOpen, onClose, route }: ShareRouteModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedViaNavigator, setSharedViaNavigator] = useState(false);

  const shareUrl = generateShareableUrl(route);

  if (!isOpen) return null;

  // Handle native Web Share API
  const handleNativeShare = async () => {
    sounds.playTick(800);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pub Golf: ${route.name}`,
          text: `Hier is onze Pub Golf route voor ${route.name}! (${route.pubs.length} cafés, ${route.drinks.length} drankjes, ${route.challenges.length} minigames)`,
          url: shareUrl,
        });
        setSharedViaNavigator(true);
        sounds.playReveal();
        setTimeout(() => setSharedViaNavigator(false), 3000);
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        if ((err as Error).name !== 'AbortError') {
          console.log('Native share error, falling back to copy:', err);
        }
      }
    }

    // Fallback: Copy link
    await handleCopyLink();
  };

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    sounds.playTick(750);
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopiedLink(true);
      sounds.playReveal();
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sky-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md wii-modal-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl wii-btn-green flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5 text-[#14300a]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Route Delen
              </h3>
              <p className="text-[11px] text-slate-500">
                Deel deze route met vrienden die de app hebben
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Preview Card */}
        <div className="my-3.5 p-4 rounded-2xl bg-sky-50 border-2 border-sky-100 space-y-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 block">
              Te Delen Route
            </span>
            <h4 className="text-lg font-black text-slate-900">{route.name}</h4>
            {route.city && (
              <span className="text-xs text-slate-500 font-semibold">{route.city}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 pt-1.5 border-t border-sky-200/80">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-lime-600" />
              <strong>{route.pubs.length}</strong> cafés
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Beer className="w-3.5 h-3.5 text-amber-500" />
              <strong>{route.drinks.length}</strong> drankjes
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />
              <strong>{route.challenges.length}</strong> minigames
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Main Action: Native Share (WhatsApp, Messages, AirDrop, etc.) */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="wii-btn-green w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Deel via WhatsApp of Berichten</span>
          </button>

          {/* Secondary Action: Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
              copiedLink
                ? 'wii-btn-green shadow-md'
                : 'wii-btn-blue shadow-sm'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Deellink Gekopieerd naar Klembord!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Kopieer Deellink</span>
              </>
            )}
          </button>
        </div>

        {/* Info tip */}
        <div className="mt-3.5 p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-800 leading-relaxed font-medium">
          💡 <strong>Hoe werkt het?</strong> Stuur de deellink naar iemand anders. Diegene kan hiermee jouw route importeren.
        </div>
      </div>
    </div>
  );
}
