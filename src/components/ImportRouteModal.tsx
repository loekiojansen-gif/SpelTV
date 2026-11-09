import { useState } from 'react';
import { X, Download, Bookmark, Play, Check, AlertCircle, MapPin, Beer, Gamepad2 } from 'lucide-react';
import { CourseTemplate } from '../types';
import { decodeRouteFromShareCode } from '../utils/routeSharing';
import { sounds } from '../utils/audio';

interface ImportRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAndPlay: (template: CourseTemplate) => void;
  onSaveToMyRoutes: (template: CourseTemplate) => void;
}

export function ImportRouteModal({
  isOpen,
  onClose,
  onImportAndPlay,
  onSaveToMyRoutes,
}: ImportRouteModalProps) {
  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CourseTemplate | null>(null);

  if (!isOpen) return null;

  const handleInspectCode = (text: string) => {
    setInputText(text);
    setErrorMsg(null);
    if (!text.trim()) {
      setPreviewTemplate(null);
      return;
    }

    const decoded = decodeRouteFromShareCode(text.trim());
    if (decoded) {
      setPreviewTemplate(decoded);
      sounds.playReveal();
    } else {
      setPreviewTemplate(null);
    }
  };

  const handleManualParse = () => {
    if (!inputText.trim()) {
      setErrorMsg('Voer eerst een deellink of routecode in.');
      return;
    }
    const decoded = decodeRouteFromShareCode(inputText.trim());
    if (decoded) {
      setPreviewTemplate(decoded);
      setErrorMsg(null);
      sounds.playReveal();
    } else {
      setErrorMsg('Geen geldige Pub Golf routecode of deellink herkend. Controleer de link en probeer opnieuw.');
      sounds.playTick(400);
    }
  };

  const handlePlayNow = () => {
    if (!previewTemplate) return;
    sounds.playReveal();
    onImportAndPlay(previewTemplate);
    onClose();
  };

  const handleSaveOnly = () => {
    if (!previewTemplate) return;
    sounds.playReveal();
    onSaveToMyRoutes(previewTemplate);
    onClose();
  };

  const handleSaveAndPlay = () => {
    if (!previewTemplate) return;
    sounds.playReveal();
    onSaveToMyRoutes(previewTemplate);
    onImportAndPlay(previewTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sky-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md wii-modal-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl wii-btn-blue flex items-center justify-center shadow-md">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Route Importeren
              </h3>
              <p className="text-[11px] text-slate-500">
                Plak een ontvangen link of code van een vriend
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

        {/* Input field */}
        <div className="my-3.5 space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Plak deellink of routecode:
          </label>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => handleInspectCode(e.target.value)}
            placeholder="Plak hier de link (bijv. https://.../?route=...) of code"
            className="w-full p-3 rounded-2xl bg-white border-2 border-sky-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500 transition-colors shadow-xs"
          />

          {!previewTemplate && (
            <button
              type="button"
              onClick={handleManualParse}
              className="wii-btn-white w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
            >
              <span>Controleer Routecode</span>
            </button>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Preview of decoded route */}
        {previewTemplate && (
          <div className="my-2 p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 block">
                  Herkende Route
                </span>
                <h4 className="text-base font-black text-slate-900">{previewTemplate.name}</h4>
                {previewTemplate.city && (
                  <span className="text-xs text-slate-500 font-semibold">
                    {previewTemplate.city}
                  </span>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 text-[10px] font-black border border-lime-300">
                Geldig
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-sky-200">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                <span>
                  <strong>{previewTemplate.pubs.length} cafés:</strong>{' '}
                  <span className="text-slate-500 truncate max-w-[240px] inline-block align-bottom">
                    {previewTemplate.pubs.map((p) => p.name).join(' → ')}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Beer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  <strong>{previewTemplate.drinks.length} drankjes</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Gamepad2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>
                  <strong>{previewTemplate.challenges.length} minigames</strong>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSaveAndPlay}
                className="wii-btn-green w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
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
                  <span>Alleen Opslaan</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
