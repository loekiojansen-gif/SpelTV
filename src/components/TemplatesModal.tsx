import { useState, useEffect } from 'react';
import { X, Bookmark, Plus, MapPin, Beer, Gamepad2, Check, Trash2, ArrowRight, Share2, Download } from 'lucide-react';
import { CourseTemplate, PubItem, DrinkItem, ChallengeItem } from '../types';
import { loadTemplates, saveTemplates } from '../utils/storage';
import { sounds } from '../utils/audio';
import { ShareRouteModal } from './ShareRouteModal';
import { ImportRouteModal } from './ImportRouteModal';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPubs: PubItem[];
  currentDrinks: DrinkItem[];
  currentChallenges: ChallengeItem[];
  onApplyTemplate: (template: CourseTemplate) => void;
}

const STANDARD_IDS = new Set(['tpl-eindhoven', 'tpl-amsterdam', 'tpl-utrecht']);

export function TemplatesModal({
  isOpen,
  onClose,
  currentPubs,
  currentDrinks,
  currentChallenges,
  onApplyTemplate,
}: TemplatesModalProps) {
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCity, setTemplateCity] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sharingRoute, setSharingRoute] = useState<{
    name: string;
    city?: string;
    pubs: PubItem[];
    drinks: DrinkItem[];
    challenges: ChallengeItem[];
  } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTemplates(loadTemplates());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSavedRoute = (tpl: CourseTemplate) => {
    return Boolean(tpl.isCustom) || (!STANDARD_IDS.has(tpl.id) && !tpl.id.startsWith('tpl-default-'));
  };

  const savedRoutes = templates.filter(isSavedRoute);
  const standardRoutes = templates.filter((tpl) => !isSavedRoute(tpl));

  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    const newTemplate: CourseTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateName.trim(),
      city: templateCity.trim() || undefined,
      pubs: [...currentPubs],
      drinks: [...currentDrinks],
      challenges: [...currentChallenges],
      createdAt: Date.now(),
      isCustom: true,
    };

    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
    setTemplateName('');
    setTemplateCity('');
    setShowSaveForm(false);
    sounds.playReveal();
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    setConfirmDeleteId(null);
    sounds.playTick(450);
  };

  // Instant apply without window.confirm (works 100% inside iframes)
  const handleApply = (tpl: CourseTemplate) => {
    onApplyTemplate(tpl);
    setAppliedId(tpl.id);
    sounds.playReveal();
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleImportSave = (importedTpl: CourseTemplate) => {
    const customizedTpl: CourseTemplate = { ...importedTpl, isCustom: true };
    const updated = [customizedTpl, ...templates.filter((t) => t.id !== importedTpl.id)];
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleImportPlay = (importedTpl: CourseTemplate) => {
    handleApply(importedTpl);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sky-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
        <div className="w-full max-w-lg wii-modal-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-sky-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl wii-btn-green flex items-center justify-center shadow-md">
                <Bookmark className="w-5 h-5 fill-[#14300a]" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Kies Route
                </h3>
              </div>
            </div>

            {/* Top Action Bar with prominent Importeer button and Close button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(true);
                  sounds.playTick(700);
                }}
                title="Importeer een gedeelde route"
                className="wii-btn-blue px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Importeer</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Save Section */}
          {showSaveForm ? (
            <form
              onSubmit={handleSaveCurrentAsTemplate}
              className="my-3 p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-md space-y-3 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 fill-lime-600" />
                  <span>Huidige route opslaan als eigen route</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {currentPubs.length} cafés · {currentDrinks.length} drankjes
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Slaat je huidige {currentPubs.length} cafés, {currentDrinks.length} drankjes en {currentChallenges.length} minigames op. Opgeslagen routes kun je hierna direct delen met vrienden!
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Route naam (bijv. Stratumseind Squad of Utrecht Vrijmibo)"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-sky-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500 shadow-xs"
                />
                <input
                  type="text"
                  placeholder="Stad (optioneel, bijv. Eindhoven)"
                  value={templateCity}
                  onChange={(e) => setTemplateCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-sky-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="wii-btn-green flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-[#14300a]" />
                  <span>Route Opslaan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveForm(false);
                    sounds.playTick(600);
                  }}
                  className="wii-btn-white px-4 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                >
                  Annuleren
                </button>
              </div>
            </form>
          ) : (
            <div className="my-2.5 p-3 rounded-2xl bg-sky-50 border-2 border-sky-100 flex items-center justify-between gap-3 shadow-xs">
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                  <Bookmark className="w-3.5 h-3.5 text-lime-600 fill-lime-600 shrink-0" />
                  <span className="truncate">Huidige route opslaan</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {currentPubs.length} cafés, {currentDrinks.length} drankjes, {currentChallenges.length} minigames
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSaveForm(true);
                  sounds.playTick(700);
                }}
                className="wii-btn-green py-2 px-3 rounded-xl font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-transform shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Opslaan</span>
              </button>
            </div>
          )}

          {/* Routes List */}
          <div className="overflow-y-auto py-2 space-y-4 flex-1 pr-1">
            {/* ========================================================= */}
            {/* 1. OPGESLAGEN ROUTES (MET DEEL FUNCTIE) */}
            {/* ========================================================= */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 fill-sky-600" />
                  <span>Opgeslagen Routes ({savedRoutes.length})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Deelbaar met vrienden
                </span>
              </div>

              {savedRoutes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-sky-50/70 border-2 border-dashed border-sky-200 text-center space-y-1">
                  <div className="text-xs font-black text-slate-800 flex items-center justify-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-sky-600" />
                    <span>Nog geen eigen routes opgeslagen</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Tik hierboven op <strong>+ Opslaan</strong> om je huidige cafés en drankjes als eigen route op te slaan. Opgeslagen routes kun je direct via link of WhatsApp delen!
                  </p>
                </div>
              ) : (
                savedRoutes.map((tpl) => {
                  const isExpanded = expandedId === tpl.id;
                  const isApplied = appliedId === tpl.id;
                  const isDeleting = confirmDeleteId === tpl.id;

                  return (
                    <div
                      key={tpl.id}
                      className="rounded-2xl bg-white border-2 border-sky-100 overflow-hidden transition-all shadow-xs relative"
                    >
                      <div className="p-3 sm:p-3.5 relative">
                        {/* Prullenbakje rechtsboven in het vak */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          {isDeleting ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200 shadow-xs">
                              <button
                                onClick={() => handleDeleteTemplate(tpl.id)}
                                className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold active:scale-95"
                              >
                                Verwijder
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-1 text-slate-600 text-[10px] font-bold"
                              >
                                Nee
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(tpl.id);
                              }}
                              title="Verwijder route"
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center active:scale-90 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          {/* Links: Naam, Aantal cafes en drankjes BOVEN de categorie, en Categorie labels eronder */}
                          <div
                            className="min-w-0 cursor-pointer flex-1 pr-1"
                            onClick={() => {
                              setExpandedId(isExpanded ? null : tpl.id);
                              sounds.playTick(700);
                            }}
                          >
                            {/* 1. Naam */}
                            <div className="font-black text-sm text-slate-900 truncate pr-6">
                              {tpl.name}
                            </div>

                            {/* 2. Aantal cafes en drankjes BOVEN de categorie */}
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span>{tpl.pubs.length} Cafés</span>
                              <span>·</span>
                              <span>{tpl.drinks.length} Drankjes</span>
                              <span>·</span>
                              <span>{tpl.challenges.length} Minigames</span>
                            </div>

                            {/* 3. Categorie labels ONDER de aantallen */}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {tpl.city && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                                  {tpl.city}
                                </span>
                              )}
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-lime-100 text-lime-800">
                                Opgeslagen
                              </span>
                            </div>
                          </div>

                          {/* Rechts: Knoppen onder elkaar, Laden boven en Deel eronder */}
                          <div className="flex flex-col items-end gap-1 shrink-0 pt-5">
                            {/* Laden knop (boven) */}
                            <button
                              type="button"
                              onClick={() => handleApply(tpl)}
                              className={`w-20 py-1 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 active:scale-95 transition-transform ${
                                isApplied
                                  ? 'bg-emerald-500 text-white'
                                  : 'wii-btn-green shadow-2xs'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Geladen!</span>
                                </>
                              ) : (
                                <>
                                  <span>Laden</span>
                                  <ArrowRight className="w-3 h-3" />
                                </>
                              )}
                            </button>

                            {/* Deel knop (ONDER de laden knop) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSharingRoute(tpl);
                                sounds.playTick(700);
                              }}
                              title="Deel deze opgeslagen route via WhatsApp of link"
                              className="w-20 py-1 px-2 rounded-xl wii-btn-blue flex items-center justify-center gap-1 text-[11px] font-bold active:scale-90 transition-transform shadow-2xs"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Deel</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Detail Preview */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-2 border-t border-sky-100 bg-sky-50/50 space-y-2 text-xs">
                          <div>
                            <div className="font-bold text-sky-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-lime-600" /> Cafés in deze route:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {tpl.pubs.map((p, pIdx) => (
                                <span
                                  key={p.id}
                                  className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-slate-700 text-[11px] shadow-xs"
                                >
                                  {pIdx + 1}. {p.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="font-bold text-sky-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                              <Beer className="w-3 h-3 text-amber-500" /> Drankjes:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {tpl.drinks.map((d) => (
                                <span
                                  key={d.id}
                                  className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-slate-700 text-[11px] shadow-xs"
                                >
                                  {d.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="font-bold text-sky-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                              <Gamepad2 className="w-3 h-3 text-purple-500" /> Minigames:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {tpl.challenges.map((c) => (
                                <span
                                  key={c.id}
                                  className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-slate-700 text-[11px] shadow-xs"
                                >
                                  {c.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* ========================================================= */}
            {/* 2. STANDAARD ROUTES (GEEN DEEL FUNCTIE) */}
            {/* ========================================================= */}
            <div className="space-y-2 pt-2 border-t border-sky-200">
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⛳ Standaard Routes ({standardRoutes.length})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Standaardbanen
                </span>
              </div>

              {standardRoutes.map((tpl) => {
                const isExpanded = expandedId === tpl.id;
                const isApplied = appliedId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    className="rounded-2xl bg-white border-2 border-sky-100 overflow-hidden transition-all shadow-xs"
                  >
                    <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2">
                      {/* Links: Naam, Aantal cafes en drankjes BOVEN de categorie, en Categorie labels eronder */}
                      <div
                        className="min-w-0 cursor-pointer flex-1 pr-1"
                        onClick={() => {
                          setExpandedId(isExpanded ? null : tpl.id);
                          sounds.playTick(700);
                        }}
                      >
                        {/* 1. Naam */}
                        <div className="font-black text-sm text-slate-900 truncate">
                          {tpl.name}
                        </div>

                        {/* 2. Aantal cafes en drankjes BOVEN de categorie */}
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span>{tpl.pubs.length} Cafés</span>
                          <span>·</span>
                          <span>{tpl.drinks.length} Drankjes</span>
                          <span>·</span>
                          <span>{tpl.challenges.length} Minigames</span>
                        </div>

                        {/* 3. Categorie labels ONDER de aantallen */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {tpl.city && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                              {tpl.city}
                            </span>
                          )}
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sky-200 text-sky-900">
                            Standaard
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Note: Standaard routes hebben GEEN deel-knop volgens user request */}
                        <button
                          type="button"
                          onClick={() => handleApply(tpl)}
                          className={`w-20 py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 active:scale-95 transition-transform ${
                            isApplied
                              ? 'bg-emerald-500 text-white'
                              : 'wii-btn-green shadow-2xs'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Geladen!</span>
                            </>
                          ) : (
                            <>
                              <span>Laden</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Preview */}
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-2 border-t border-sky-100 bg-sky-50/50 space-y-2 text-xs">
                        <div>
                          <div className="font-bold text-sky-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-lime-600" /> Cafés in deze route:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tpl.pubs.map((p, pIdx) => (
                              <span
                                key={p.id}
                                className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-slate-700 text-[11px] shadow-xs"
                              >
                                {pIdx + 1}. {p.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-sky-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                            <Beer className="w-3 h-3 text-amber-500" /> Drankjes:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tpl.drinks.map((d) => (
                              <span
                                key={d.id}
                                className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-slate-700 text-[11px] shadow-xs"
                              >
                                {d.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-sky-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                            <Gamepad2 className="w-3 h-3 text-purple-500" /> Minigames:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tpl.challenges.map((c) => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-slate-700 text-[11px] shadow-xs"
                              >
                                {c.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {sharingRoute && (
        <ShareRouteModal
          isOpen={Boolean(sharingRoute)}
          onClose={() => setSharingRoute(null)}
          route={sharingRoute}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportRouteModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportAndPlay={handleImportPlay}
          onSaveToMyRoutes={handleImportSave}
        />
      )}
    </>
  );
}

