import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  MapPin,
  Beer,
  Gamepad2,
  ChevronRight,
  Play,
  GripVertical,
  History,
  Bookmark,
  Sparkles,
  Search,
  Trophy,
  Minus,
} from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { PubItem, DrinkItem, ChallengeItem, CourseTemplate, Round } from '../types';
import { DEFAULT_PUBS, DEFAULT_DRINKS, DEFAULT_CHALLENGES, loadTemplates } from '../utils/storage';
import { sounds } from '../utils/audio';
import { TemplatesModal } from './TemplatesModal';
import { HistoryModal } from './HistoryModal';
import { PWAInstallButton } from './PWAInstallButton';

interface PubRowItemProps {
  pub: PubItem;
  idx: number;
  onEdit: () => void;
  onDelete: () => void;
}

function PubRowItem({ pub, idx, onEdit, onDelete }: PubRowItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={pub}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 14px 30px -4px rgba(12, 74, 110, 0.25)',
        borderColor: '#a3e635',
        zIndex: 30,
      }}
      className="wii-card flex items-center justify-between p-3 sm:p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow select-none border-2 border-white"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="text-slate-400 hover:text-slate-600 p-1 shrink-0 touch-none cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition-colors"
          title="Sleep dit icoon om de volgorde te wijzigen"
        >
          <GripVertical className="w-4 h-4" />
        </div>

       

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-bubble-green font-black text-xs sm:text-sm flex items-center justify-center shadow-md shrink-0 font-mono">
          {idx + 1}
        </div>

        <div className="min-w-0">
          <div className="font-black text-slate-900 text-sm sm:text-base truncate">{pub.name}</div>
          {pub.location && (
            <div className="text-xs text-slate-500 truncate mt-0.5 font-normal">
              {pub.location}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title={`Bewerk ${pub.name}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-btn-blue text-white flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"
        >
          <Pencil className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Verwijder ${pub.name}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-btn-red text-white flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"
        >
          <Minus className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </Reorder.Item>
  );
}

interface DrinkRowItemProps {
  drink: DrinkItem;
  idx: number;
  onEdit: () => void;
  onDelete: () => void;
}

function DrinkRowItem({ drink, idx, onEdit, onDelete }: DrinkRowItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={drink}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 14px 30px -4px rgba(12, 74, 110, 0.25)',
        borderColor: '#a3e635',
        zIndex: 30,
      }}
      className="wii-card flex items-center justify-between p-3 sm:p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow select-none border-2 border-white"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="text-slate-400 hover:text-slate-600 p-1 shrink-0 touch-none cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition-colors"
          title="Sleep dit icoon om de volgorde te wijzigen"
        >
          <GripVertical className="w-4 h-4" />
        </div>

      

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-bubble-amber font-black text-xs sm:text-sm flex items-center justify-center shadow-md shrink-0 font-mono">
          {idx + 1}
        </div>

        <div className="min-w-0">
          <div className="font-black text-slate-900 text-sm sm:text-base truncate">{drink.name}</div>
          <div className="text-xs text-slate-500 font-normal mt-0.5 truncate">
            {drink.category || 'Drankje'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title={`Bewerk ${drink.name}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-btn-blue text-white flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"
        >
          <Pencil className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Verwijder ${drink.name}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-btn-red text-white flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"
        >
          <Minus className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </Reorder.Item>
  );
}

interface ChallengeRowItemProps {
  challenge: ChallengeItem;
  idx: number;
  onEdit: () => void;
  onDelete: () => void;
}

function ChallengeRowItem({ challenge, idx, onEdit, onDelete }: ChallengeRowItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={challenge}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 14px 30px -4px rgba(12, 74, 110, 0.25)',
        borderColor: '#a3e635',
        zIndex: 30,
      }}
      className="wii-card flex items-start justify-between p-3 sm:p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow select-none border-2 border-white"
    >
      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="text-slate-400 hover:text-slate-600 p-1 shrink-0 mt-0.5 touch-none cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition-colors"
          title="Sleep dit icoon om de volgorde te wijzigen"
        >
          <GripVertical className="w-4 h-4" />
        </div>

       

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-bubble-purple font-black text-xs sm:text-sm flex items-center justify-center shadow-md shrink-0 mt-0.5 font-mono">
          {idx + 1}
        </div>

        <div className="min-w-0">
          <div className="font-black text-slate-900 text-sm sm:text-base">
            {challenge.title}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 font-normal leading-relaxed">
            {challenge.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2 mt-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title={`Bewerk ${challenge.title}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-btn-blue text-white flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"
        >
          <Pencil className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Verwijder ${challenge.title}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full wii-btn-red text-white flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"
        >
          <Minus className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </Reorder.Item>
  );
}

interface HomeScreenProps {
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
  isGameActive: boolean;
  isGameFinished?: boolean;
  isPermanentlyFinished?: boolean;
  rounds?: Round[];
  currentRoundNumber: number;
  onUpdatePubs: (pubs: PubItem[]) => void;
  onUpdateDrinks: (drinks: DrinkItem[]) => void;
  onUpdateChallenges: (challenges: ChallengeItem[]) => void;
  onStartNewGame: () => void;
  onResumeGame: () => void;
  onContinueGame?: () => void;
  onViewResults?: () => void;
}

type TabType = 'pubs' | 'drinks' | 'challenges';

export function HomeScreen({
  pubs,
  drinks,
  challenges,
  isGameActive,
  isGameFinished,
  isPermanentlyFinished = false,
  rounds,
  currentRoundNumber,
  onUpdatePubs,
  onUpdateDrinks,
  onUpdateChallenges,
  onStartNewGame,
  onResumeGame,
  onContinueGame,
  onViewResults,
}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pubs');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeTemplateName, setActiveTemplateName] = useState<string>('Eindhoven Stratumseind');

  // Add modal mode: 'suggestions' (pick from other templates) or 'custom' (type your own)
  const [addSourceTab, setAddSourceTab] = useState<'suggestions' | 'custom'>('suggestions');
  const [suggestionSearch, setSuggestionSearch] = useState('');

  // Edit item state
  const [editingItem, setEditingItem] = useState<{
    type: TabType;
    id: string;
    nameOrTitle: string;
    extraOrLocation: string;
  } | null>(null);

  // New item input states
  const [customName, setCustomName] = useState('');
  const [customExtra, setCustomExtra] = useState('');

  // Available templates pool for suggestions
  const [allTemplates, setAllTemplates] = useState<CourseTemplate[]>([]);

  useEffect(() => {
    setAllTemplates(loadTemplates());
  }, [showAddModal, showTemplatesModal]);

  // Scroll to top when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Compute suggestions from all templates that are not currently in the active list
  const existingPubNames = new Set(pubs.map((p) => p.name.toLowerCase()));
  const existingDrinkNames = new Set(drinks.map((d) => d.name.toLowerCase()));
  const existingChallengeTitles = new Set(challenges.map((c) => c.title.toLowerCase()));

  const suggestedPubs = allTemplates.flatMap((tpl) =>
    tpl.pubs
      .filter((p) => !existingPubNames.has(p.name.toLowerCase()))
      .map((p) => ({ ...p, cityName: tpl.city || tpl.name }))
  );

  const suggestedDrinks = allTemplates.flatMap((tpl) =>
    tpl.drinks
      .filter((d) => !existingDrinkNames.has(d.name.toLowerCase()))
      .map((d) => ({ ...d, cityName: tpl.city || tpl.name }))
  );

  const suggestedChallenges = allTemplates.flatMap((tpl) =>
    tpl.challenges
      .filter((c) => !existingChallengeTitles.has(c.title.toLowerCase()))
      .map((c) => ({ ...c, cityName: tpl.city || tpl.name }))
  );

  // Filter suggestions by search
  const filteredSuggestedPubs = suggestedPubs.filter(
    (p) =>
      p.name.toLowerCase().includes(suggestionSearch.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(suggestionSearch.toLowerCase()))
  );

  const filteredSuggestedDrinks = suggestedDrinks.filter(
    (d) =>
      d.name.toLowerCase().includes(suggestionSearch.toLowerCase()) ||
      (d.category && d.category.toLowerCase().includes(suggestionSearch.toLowerCase()))
  );

  const filteredSuggestedChallenges = suggestedChallenges.filter(
    (c) =>
      c.title.toLowerCase().includes(suggestionSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(suggestionSearch.toLowerCase())
  );

  // Delete handlers
  const handleDeletePub = (id: string) => {
    sounds.playTick(400);
    onUpdatePubs(pubs.filter((p) => p.id !== id));
  };

  const handleDeleteDrink = (id: string) => {
    sounds.playTick(400);
    onUpdateDrinks(drinks.filter((d) => d.id !== id));
  };

  const handleDeleteChallenge = (id: string) => {
    sounds.playTick(400);
    onUpdateChallenges(challenges.filter((c) => c.id !== id));
  };

  // Add custom item
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    if (activeTab === 'pubs') {
      const newPub: PubItem = {
        id: `pub-${Date.now()}`,
        name: customName.trim(),
        location: customExtra.trim() || undefined,
      };
      onUpdatePubs([...pubs, newPub]);
    } else if (activeTab === 'drinks') {
      const newDrink: DrinkItem = {
        id: `drink-${Date.now()}`,
        name: customName.trim(),
        category: customExtra.trim() || 'Drankje',
      };
      onUpdateDrinks([...drinks, newDrink]);
    } else if (activeTab === 'challenges') {
      const newChallenge: ChallengeItem = {
        id: `ch-${Date.now()}`,
        title: customName.trim(),
        description: customExtra.trim() || 'Minigame voor deze ronde.',
      };
      onUpdateChallenges([...challenges, newChallenge]);
    }

    setCustomName('');
    setCustomExtra('');
    setShowAddModal(false);
    sounds.playReveal();
  };

  // Quick add from suggestion
  const handleAddSuggestedPub = (item: PubItem) => {
    const newPub: PubItem = {
      id: `pub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      location: item.location,
    };
    onUpdatePubs([...pubs, newPub]);
    sounds.playReveal();
  };

  const handleAddSuggestedDrink = (item: DrinkItem) => {
    const newDrink: DrinkItem = {
      id: `drink-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      category: item.category,
    };
    onUpdateDrinks([...drinks, newDrink]);
    sounds.playReveal();
  };

  const handleAddSuggestedChallenge = (item: ChallengeItem) => {
    const newChallenge: ChallengeItem = {
      id: `ch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: item.title,
      description: item.description,
    };
    onUpdateChallenges([...challenges, newChallenge]);
    sounds.playReveal();
  };

  // Edit save handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.type === 'pubs') {
      const updated = pubs.map((p) =>
        p.id === editingItem.id
          ? {
              ...p,
              name: editingItem.nameOrTitle.trim(),
              location: editingItem.extraOrLocation.trim() || undefined,
            }
          : p
      );
      onUpdatePubs(updated);
    } else if (editingItem.type === 'drinks') {
      const updated = drinks.map((d) =>
        d.id === editingItem.id
          ? {
              ...d,
              name: editingItem.nameOrTitle.trim(),
              category: editingItem.extraOrLocation.trim() || 'Drankje',
            }
          : d
      );
      onUpdateDrinks(updated);
    } else if (editingItem.type === 'challenges') {
      const updated = challenges.map((c) =>
        c.id === editingItem.id
          ? {
              ...c,
              title: editingItem.nameOrTitle.trim(),
              description: editingItem.extraOrLocation.trim(),
            }
          : c
      );
      onUpdateChallenges(updated);
    }

    setEditingItem(null);
    sounds.playReveal();
  };

  const handleResetDefaults = () => {
    onUpdatePubs(DEFAULT_PUBS);
    onUpdateDrinks(DEFAULT_DRINKS);
    onUpdateChallenges(DEFAULT_CHALLENGES);
    setActiveTemplateName('Eindhoven Stratumseind');
    sounds.playTick(600);
  };

  const handleApplyTemplate = (template: CourseTemplate) => {
    onUpdatePubs(template.pubs);
    onUpdateDrinks(template.drinks);
    onUpdateChallenges(template.challenges);
    setActiveTemplateName(template.name);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-28 pt-3 space-y-4">
      {/* ========================================================= */}
      {/* 1. ROUTE & TEMPLATE HUB (Main Screen Starter) */}
      {/* ========================================================= */}
      <div className="wii-card rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-3.5 border-2 border-white">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-500 shadow-sm" />
              <span>GEKOZEN ROUTE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {activeTemplateName}
            </h1>
          </div>

          <PWAInstallButton />
        </div>

        {/* Action Row for Templates & History */}
        <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
          <button
            onClick={() => {
              setShowTemplatesModal(true);
              sounds.playTick(700);
            }}
            className="wii-btn-green py-3 px-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Bookmark className="w-4 h-4 fill-[#14300a]" />
            <span>Kies Route</span>
          </button>

          <button
            onClick={() => {
              setShowHistoryModal(true);
              sounds.playTick(700);
            }}
            className="wii-btn-blue py-3 px-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <History className="w-4 h-4 text-white" />
            <span>Geschiedenis</span>
          </button>
        </div>
      </div>

      {/* Active Game Resume Banner */}
      {isGameActive && (
        <div className="wii-card rounded-2xl border-2 border-lime-400 p-4 shadow-md flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black text-lime-600 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-ping" />
              Route Actief
            </div>
            <div className="text-sm font-black text-slate-800 mt-0.5">
              Hole {currentRoundNumber} is bezig
            </div>
          </div>
          <button
            onClick={onResumeGame}
            className="wii-btn-green px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>Hervatten</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Finished Game Resume Banner (Allows continuing after ending, unless permanently finalized!) */}
      {!isGameActive && isGameFinished && !isPermanentlyFinished && rounds && rounds.length > 0 && (
        <div className="wii-card rounded-2xl border-2 border-lime-400 p-4 shadow-md flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black text-lime-600 uppercase tracking-wide flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Kroegentocht Afgerond
            </div>
            <div className="text-sm font-black text-slate-800 mt-0.5">
              {rounds.length} {rounds.length === 1 ? 'hole' : 'holes'} gespeeld
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onViewResults && (
              <button
                onClick={onViewResults}
                className="wii-btn-blue px-3 py-2 rounded-xl font-bold text-xs active:scale-95 transition-all"
              >
                Podium
              </button>
            )}
            {onContinueGame && (
              <button
                onClick={onContinueGame}
                className="wii-btn-green px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-[#14300a]" />
                <span>Verder Spelen</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TABS SELECTOR (Wii Pill Control) */}
      {/* ========================================================= */}
      <div className="wii-card p-1 rounded-full border-2 border-white shadow-md flex items-center w-full">
        <button
          onClick={() => {
            setActiveTab('pubs');
            sounds.playTick(700);
          }}
          className={`flex-1 py-2 px-1 sm:px-2 rounded-full text-[10px] min-[380px]:text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all whitespace-nowrap min-w-0 ${
            activeTab === 'pubs'
              ? 'wii-btn-green shadow-sm text-[#14300a]'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="whitespace-nowrap truncate">Cafés ({pubs.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('drinks');
            sounds.playTick(700);
          }}
          className={`flex-1 py-2 px-1 sm:px-2 rounded-full text-[10px] min-[380px]:text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all whitespace-nowrap min-w-0 ${
            activeTab === 'drinks'
              ? 'wii-btn-green shadow-sm text-[#14300a]'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Beer className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="whitespace-nowrap truncate">Drankjes ({drinks.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('challenges');
            sounds.playTick(700);
          }}
          className={`flex-1 py-2 px-1 sm:px-2 rounded-full text-[10px] min-[380px]:text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all whitespace-nowrap min-w-0 ${
            activeTab === 'challenges'
              ? 'wii-btn-green shadow-sm text-[#14300a]'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Gamepad2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="whitespace-nowrap truncate">Minigames ({challenges.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. REORDERABLE LISTS */}
      {/* ========================================================= */}
      <div>
        {/* CAFES LIST */}
        {activeTab === 'pubs' && (
          <div className="space-y-2">
            {pubs.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setAddSourceTab('suggestions');
                  setSuggestionSearch('');
                  setShowAddModal(true);
                  sounds.playTick(700);
                }}
                className="w-full text-center py-8 px-4 wii-card rounded-2xl border-2 border-dashed border-sky-300 hover:border-lime-500 text-sky-800 hover:text-slate-900 text-xs font-bold transition-all block cursor-pointer shadow-xs"
              >
                Geen cafés in deze route. Tik hier op "+ Toevoegen" om cafés toe te voegen of kies een stadstemplate.
              </button>
            ) : (
              <Reorder.Group
                axis="y"
                values={pubs}
                onReorder={(newOrder) => {
                  onUpdatePubs(newOrder);
                  sounds.playTick(600);
                }}
                className="space-y-2"
              >
                {pubs.map((pub, idx) => (
                  <PubRowItem
                    key={pub.id}
                    pub={pub}
                    idx={idx}
                    onEdit={() => {
                      setEditingItem({
                        type: 'pubs',
                        id: pub.id,
                        nameOrTitle: pub.name,
                        extraOrLocation: pub.location || '',
                      });
                      sounds.playTick(750);
                    }}
                    onDelete={() => handleDeletePub(pub.id)}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>
        )}

        {/* DRINKS LIST */}
        {activeTab === 'drinks' && (
          <div className="space-y-2">
            {drinks.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setAddSourceTab('suggestions');
                  setSuggestionSearch('');
                  setShowAddModal(true);
                  sounds.playTick(700);
                }}
                className="w-full text-center py-8 px-4 wii-card rounded-2xl border-2 border-dashed border-sky-300 hover:border-lime-500 text-sky-800 hover:text-slate-900 text-xs font-bold transition-all block cursor-pointer shadow-xs"
              >
                Geen drankjes ingesteld. Tik hier op "+ Toevoegen" om drankjes toe te voegen.
              </button>
            ) : (
              <Reorder.Group
                axis="y"
                values={drinks}
                onReorder={(newOrder) => {
                  onUpdateDrinks(newOrder);
                  sounds.playTick(600);
                }}
                className="space-y-2"
              >
                {drinks.map((drink, idx) => (
                  <DrinkRowItem
                    key={drink.id}
                    drink={drink}
                    idx={idx}
                    onEdit={() => {
                      setEditingItem({
                        type: 'drinks',
                        id: drink.id,
                        nameOrTitle: drink.name,
                        extraOrLocation: drink.category || '',
                      });
                      sounds.playTick(750);
                    }}
                    onDelete={() => handleDeleteDrink(drink.id)}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>
        )}

        {/* MINIGAMES LIST */}
        {activeTab === 'challenges' && (
          <div className="space-y-2">
            {challenges.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setAddSourceTab('suggestions');
                  setSuggestionSearch('');
                  setShowAddModal(true);
                  sounds.playTick(700);
                }}
                className="w-full text-center py-8 px-4 wii-card rounded-2xl border-2 border-dashed border-sky-300 hover:border-lime-500 text-sky-800 hover:text-slate-900 text-xs font-bold transition-all block cursor-pointer shadow-xs"
              >
                Geen minigames ingesteld. Tik hier op "+ Toevoegen" om minigames toe te voegen.
              </button>
            ) : (
              <Reorder.Group
                axis="y"
                values={challenges}
                onReorder={(newOrder) => {
                  onUpdateChallenges(newOrder);
                  sounds.playTick(600);
                }}
                className="space-y-2"
              >
                {challenges.map((challenge, idx) => (
                  <ChallengeRowItem
                    key={challenge.id}
                    challenge={challenge}
                    idx={idx}
                    onEdit={() => {
                      setEditingItem({
                        type: 'challenges',
                        id: challenge.id,
                        nameOrTitle: challenge.title,
                        extraOrLocation: challenge.description,
                      });
                      sounds.playTick(750);
                    }}
                    onDelete={() => handleDeleteChallenge(challenge.id)}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>
        )}

        {/* TOEVOEGEN KNOP ONDER AAN DE LIJST */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setAddSourceTab('suggestions');
              setSuggestionSearch('');
              setShowAddModal(true);
              sounds.playTick(700);
            }}
            className="wii-card w-full py-3.5 px-4 rounded-2xl hover:bg-white text-slate-800 font-black text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-md group border-2 border-dashed border-lime-500"
          >
            <div className="w-7 h-7 rounded-full wii-bubble-green text-[#14300a] flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>
              {activeTab === 'pubs'
                ? '+ Café Toevoegen'
                : activeTab === 'drinks'
                ? '+ Drankje Toevoegen'
                : '+ Minigame Toevoegen'}
            </span>
          </button>
        </div>
      </div>

      {/* Prominent Fixed Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#22c55e]/95 via-[#22c55e]/80 to-transparent z-20 backdrop-blur-xs">
        <div className="max-w-xl mx-auto">
          {isGameActive ? (
            <button
              onClick={() => {
                onResumeGame();
              }}
              className="wii-btn-green w-full h-14 sm:h-16 rounded-3xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(101,163,13,0.45)] hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5 fill-[#14300a]" />
              <span>Kroegentocht Hervatten (Hole {currentRoundNumber})</span>
            </button>
          ) : isGameFinished && !isPermanentlyFinished && rounds && rounds.length > 0 && onContinueGame ? (
            <button
              onClick={() => {
                onContinueGame();
              }}
              className="wii-btn-green w-full h-14 sm:h-16 rounded-3xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(101,163,13,0.45)] hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5 fill-[#14300a]" />
              <span>Verder Spelen (Hole {rounds.length + 1})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onStartNewGame();
              }}
              className="wii-btn-green w-full h-14 sm:h-16 rounded-3xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(101,163,13,0.45)] hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5 fill-[#14300a]" />
              <span>Start Pub Golf</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. TOEVOEGEN MODAL (MET KEUZE UIT ANDERE TEMPLATES!) */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-sky-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg wii-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh] space-y-3.5 border-2 border-white">
            <div className="flex items-center justify-between pb-2 border-b border-sky-200/80">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-[#bef264] to-[#65a30d] border-2 border-white shadow-sm flex items-center justify-center text-[#14300a]">
                  {activeTab === 'pubs' ? (
                    <MapPin className="w-4 h-4" />
                  ) : activeTab === 'drinks' ? (
                    <Beer className="w-4 h-4" />
                  ) : (
                    <Gamepad2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {activeTab === 'pubs'
                      ? 'Café Toevoegen'
                      : activeTab === 'drinks'
                      ? 'Drankje Toevoegen'
                      : 'Minigame Toevoegen'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kies uit suggesties van andere steden of typ zelf
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center active:scale-95 transition-transform"
              >
                ✕
              </button>
            </div>

            {/* Source Switcher: Suggestions vs Custom Form */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-sky-100/80 border border-sky-200">
              <button
                type="button"
                onClick={() => setAddSourceTab('suggestions')}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  addSourceTab === 'suggestions'
                    ? 'wii-btn-green shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kies uit Steden</span>
              </button>
              <button
                type="button"
                onClick={() => setAddSourceTab('custom')}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  addSourceTab === 'custom'
                    ? 'wii-btn-green shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Zelf Typen</span>
              </button>
            </div>

            {/* OPTION A: CHOOSE FROM OTHER TEMPLATES / CITIES */}
            {addSourceTab === 'suggestions' && (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {/* Search in suggestions */}
                <div className="relative">
                  <Search className="w-4 h-4 text-sky-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Zoek in suggesties...`}
                    value={suggestionSearch}
                    onChange={(e) => setSuggestionSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border-2 border-sky-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500 shadow-xs"
                  />
                </div>

                {/* Suggested Pubs */}
                {activeTab === 'pubs' && (
                  <div className="space-y-1.5">
                    {filteredSuggestedPubs.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs font-bold">
                        Geen nieuwe cafés gevonden in andere templates. Schakel over naar "Zelf Typen".
                      </div>
                    ) : (
                      filteredSuggestedPubs.map((pub, sIdx) => (
                        <div
                          key={`s-pub-${pub.id}-${sIdx}`}
                          className="p-2.5 rounded-xl wii-box border border-sky-200 shadow-xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 text-xs truncate">{pub.name}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <span>{pub.location || 'Centrum'}</span>
                              <span>·</span>
                              <span className="text-lime-600 font-bold">{pub.cityName}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedPub(pub)}
                            className="px-3 py-1.5 rounded-xl wii-btn-green font-black text-xs shrink-0 active:scale-90"
                          >
                            + Voeg toe
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Suggested Drinks */}
                {activeTab === 'drinks' && (
                  <div className="space-y-1.5">
                    {filteredSuggestedDrinks.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs font-bold">
                        Geen nieuwe drankjes gevonden. Schakel over naar "Zelf Typen".
                      </div>
                    ) : (
                      filteredSuggestedDrinks.map((drink, sIdx) => (
                        <div
                          key={`s-drink-${drink.id}-${sIdx}`}
                          className="p-2.5 rounded-xl wii-box border border-sky-200 shadow-xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 text-xs truncate">
                              {drink.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                              <span>{drink.category || 'Drankje'}</span>
                              <span>·</span>
                              <span className="text-lime-600 font-bold">{drink.cityName}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedDrink(drink)}
                            className="px-3 py-1.5 rounded-xl wii-btn-green font-black text-xs shrink-0 active:scale-90"
                          >
                            + Voeg toe
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Suggested Minigames */}
                {activeTab === 'challenges' && (
                  <div className="space-y-1.5">
                    {filteredSuggestedChallenges.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs font-bold">
                        Geen nieuwe minigames gevonden. Schakel over naar "Zelf Typen".
                      </div>
                    ) : (
                      filteredSuggestedChallenges.map((challenge, sIdx) => (
                        <div
                          key={`s-ch-${challenge.id}-${sIdx}`}
                          className="p-2.5 rounded-xl wii-box border border-sky-200 shadow-xs flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 text-xs">
                              {challenge.title}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                              {challenge.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedChallenge(challenge)}
                            className="px-3 py-1.5 rounded-xl wii-btn-green font-black text-xs shrink-0 active:scale-90 mt-0.5"
                          >
                            + Voeg toe
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* OPTION B: CUSTOM FORM (TYPE YOUR OWN) */}
            {addSourceTab === 'custom' && (
              <form onSubmit={handleAddCustom} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    {activeTab === 'pubs'
                      ? 'Naam Café'
                      : activeTab === 'drinks'
                      ? 'Naam Drankje'
                      : 'Titel Minigame'}{' '}
                    *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      activeTab === 'pubs'
                        ? 'bijv. Café De Drie Fleschjes'
                        : activeTab === 'drinks'
                        ? 'bijv. Fluitje Pils of Salmari'
                        : 'bijv. Split the G of Zing een liedje'
                    }
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-sky-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    {activeTab === 'pubs'
                      ? 'Locatie / Straat (Optioneel)'
                      : activeTab === 'drinks'
                      ? 'Categorie (bijv. Bier, Shot, Mix)'
                      : 'Uitleg van de Minigame'}
                  </label>
                  {activeTab === 'challenges' ? (
                    <textarea
                      rows={2}
                      placeholder="Beschrijf hoe de minigame werkt..."
                      value={customExtra}
                      onChange={(e) => setCustomExtra(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-sky-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm resize-none shadow-xs"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={
                        activeTab === 'pubs' ? 'bijv. Centrum of Markt' : 'bijv. Bier, Shot of Mix'
                      }
                      value={customExtra}
                      onChange={(e) => setCustomExtra(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-sky-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm shadow-xs"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  className="wii-btn-green w-full py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-md"
                >
                  Opslaan in Lijst
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. BEWERKEN MODAL (Wii Sports Style) */}
      {/* ========================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md wii-card rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-lime-600" />
                <span>
                  {editingItem.type === 'pubs'
                    ? 'Café Aanpassen'
                    : editingItem.type === 'drinks'
                    ? 'Drankje Aanpassen'
                    : 'Minigame Aanpassen'}
                </span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold p-1"
              >
                Annuleren
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {editingItem.type === 'pubs'
                    ? 'Naam Café'
                    : editingItem.type === 'drinks'
                    ? 'Naam Drankje'
                    : 'Titel Minigame'}{' '}
                  *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.nameOrTitle}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, nameOrTitle: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-sky-200 text-slate-900 text-sm focus:outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {editingItem.type === 'pubs'
                    ? 'Locatie / Straat'
                    : editingItem.type === 'drinks'
                    ? 'Categorie'
                    : 'Uitleg'}
                </label>
                {editingItem.type === 'challenges' ? (
                  <textarea
                    rows={3}
                    value={editingItem.extraOrLocation}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, extraOrLocation: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-sky-200 text-slate-900 text-sm focus:outline-none focus:border-sky-500 resize-none shadow-xs"
                  />
                ) : (
                  <input
                    type="text"
                    value={editingItem.extraOrLocation}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, extraOrLocation: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-sky-200 text-slate-900 text-sm focus:outline-none focus:border-sky-500 shadow-xs"
                  />
                )}
              </div>

              <button
                type="submit"
                className="wii-btn-green w-full py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-md"
              >
                Wijzigingen Opslaan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        currentPubs={pubs}
        currentDrinks={drinks}
        currentChallenges={challenges}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* History Modal */}
      <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
    </div>
  );
}
