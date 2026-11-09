import { useState } from 'react';
import { X, Sparkles, Check, Bookmark, Play, MapPin, Beer, Gamepad2 } from 'lucide-react';
import { CourseTemplate } from '../types';
import { sounds } from '../utils/audio';

interface IncomingSharedRouteModalProps {
  route: CourseTemplate | null;
  onClose: () => void;
  onApplyAndPlay: (template: CourseTemplate) => void;
  onSaveToMyRoutes: (template: CourseTemplate) => void;
}

export function IncomingSharedRouteModal({
  route,
  onClose,
  onApplyAndPlay,
  onSaveToMyRoutes,
}: IncomingSharedRouteModalProps) {
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!route) return null;

  const handlePlayNow = () => {
    sounds.playReveal();
    onApplyAndPlay(route);
    onClose();
  };

  const handleSaveOnly = () => {
    sounds.playReveal();
    onSaveToMyRoutes(route);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleSaveAndPlay = () => {
    sounds.playReveal();
    onSaveToMyRoutes(route);
    onApplyAndPlay(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md wii-modal-card rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl wii-btn-green text-2xl mx-auto shadow-md">
            ⛳
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-sky-600 block">
            Gedeelde Route Ontvangen!
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{route.name}</h3>
          {route.city && (
            <span className="text-xs font-bold text-slate-500 block">{route.city}</span>
          )}
        </div>

        {/* Route Details Card */}
        <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-100 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold border-b border-sky-200 pb-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-lime-600" />
              <span>{route.pubs.length} Cafés</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Beer className="w-4 h-4 text-amber-500" />
              <span>{route.drinks.length} Drankjes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-purple-500" />
              <span>{route.challenges.length} Minigames</span>
            </span>
          </div>

          {/* Pub Sequence Preview */}
          <div>
            <div className="text-[10px] uppercase font-bold text-sky-700 mb-1">
              Café Volgorde:
            </div>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
              {route.pubs.map((pub, idx) => (
                <span
                  key={pub.id}
                  className="px-2 py-0.5 rounded-lg bg-white border border-sky-200 text-slate-700 text-[11px] font-bold shadow-xs"
                >
                  {idx + 1}. {pub.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        {savedSuccess ? (
          <div className="p-3 rounded-2xl wii-card border-2 border-lime-500 text-center text-xs font-black text-lime-800 flex items-center justify-center gap-2">
            <Check className="w-4 h-4 stroke-[3] text-lime-600" />
            <span>Succesvol opgeslagen in Mijn Routes!</span>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleSaveAndPlay}
              className="wii-btn-green w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Opslaan én Direct Spelen</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handlePlayNow}
                className="wii-btn-blue py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Alleen Spelen</span>
              </button>

              <button
                type="button"
                onClick={handleSaveOnly}
                className="wii-btn-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Opslaan in Routes</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
