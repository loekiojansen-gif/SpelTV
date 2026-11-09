import React, { useState } from 'react';
import {
  MiiAvatar,
  MiiHeadShape,
  MiiHairStyle,
  MiiFacialHair,
  MiiHeadwear,
  MiiMoleStyle,
} from '../../types';
import { loadMiiAvatars, addMiiAvatar, deleteMiiAvatar } from '../../utils/storage';
import { MiiFace } from './MiiFace';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const SKIN_COLORS = [
  { label: 'Licht perzik', value: '#fed7aa' },
  { label: 'Licht warm', value: '#fef08a' },
  { label: 'Warm beige', value: '#fde68a' },
  { label: 'Zongebruind', value: '#d99758' },
  { label: 'Porselein', value: '#fed7c3' },
  { label: 'Roze zacht', value: '#fedee1' },
  { label: 'Olijf getint', value: '#e2a76f' },
  { label: 'Goudbrons', value: '#d97706' },
  { label: 'Karamel', value: '#b45309' },
  { label: 'Mokka', value: '#92400e' },
  { label: 'Donkerbruin', value: '#78350f' },
  { label: 'Diep ebben', value: '#451a03' },
  { label: 'Blos roze', value: '#fecdd3' },
  { label: 'Pastel ijsblauw', value: '#bfdbfe' },
  { label: 'Alien groen', value: '#bbf7d0' },
  { label: 'Mystiek lila', value: '#ddd6fe' },
];

const HAIR_COLORS = [
  { label: 'Zwart', value: '#1e1b4b' },
  { label: 'Donker grafiet', value: '#334155' },
  { label: 'Donkerbruin', value: '#451a03' },
  { label: 'Kastanjebruin', value: '#78350f' },
  { label: 'Middenbruin', value: '#92400e' },
  { label: 'Lichtbruin', value: '#b45309' },
  { label: 'Koper / Rood', value: '#c2410c' },
  { label: 'Fel oranje', value: '#ea580c' },
  { label: 'Goudblond', value: '#ca8a04' },
  { label: 'Lichtblond', value: '#fde047' },
  { label: 'Platina', value: '#fef08a' },
  { label: 'Zilver grijs', value: '#94a3b8' },
  { label: 'Wit grijs', value: '#e2e8f0' },
  { label: 'Felroze', value: '#ec4899' },
  { label: 'Pastel roze', value: '#f472b6' },
  { label: 'Paars', value: '#a855f7' },
  { label: 'Blauw', value: '#3b82f6' },
  { label: 'Smaragd', value: '#10b981' },
];

const EYE_COLORS = [
  { label: 'Donkerbruin', value: '#1e293b' },
  { label: 'Diepbruin', value: '#451a03' },
  { label: 'Warm hazelnoot', value: '#78350f' },
  { label: 'Amber', value: '#b45309' },
  { label: 'Hemelsblauw', value: '#0284c7' },
  { label: 'Diep saffier', value: '#1d4ed8' },
  { label: 'Turquoise', value: '#0d9488' },
  { label: 'Smaragdgroen', value: '#15803d' },
  { label: 'Olijfgroen', value: '#65a30d' },
  { label: 'Paars', value: '#7c3aed' },
  { label: 'Grijs', value: '#94a3b8' },
  { label: 'Robijnrood', value: '#dc2626' },
  { label: 'Goudgeel', value: '#f59e0b' },
  { label: 'Nachtzwart', value: '#0f172a' },
];

const HEADWEAR_COLORS = [
  { label: 'Rood', value: '#ef4444' },
  { label: 'Donkerrood', value: '#b91c1c' },
  { label: 'Oranje', value: '#f97316' },
  { label: 'Goudgeel', value: '#eab308' },
  { label: 'Groen', value: '#10b981' },
  { label: 'Donkergroen', value: '#15803d' },
  { label: 'Cyaan', value: '#06b6d4' },
  { label: 'Blauw', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Paars', value: '#a855f7' },
  { label: 'Donkerpaars', value: '#4c1d95' },
  { label: 'Roze', value: '#ec4899' },
  { label: 'Zwart', value: '#1e293b' },
  { label: 'Leisteen', value: '#475569' },
  { label: 'Wit', value: '#f8fafc' },
  { label: 'Bruin', value: '#78350f' },
  { label: 'Karamel', value: '#b45309' },
  { label: 'Goud', value: '#fbbf24' },
];

const FAVORITE_COLORS = [
  { label: 'Blauw', value: '#3b82f6' },
  { label: 'Rood', value: '#ef4444' },
  { label: 'Groen', value: '#10b981' },
  { label: 'Geel', value: '#eab308' },
  { label: 'Oranje', value: '#f97316' },
  { label: 'Roze', value: '#ec4899' },
  { label: 'Paars', value: '#a855f7' },
  { label: 'Cyaan', value: '#06b6d4' },
  { label: 'Smaragd', value: '#059669' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Bordeaux', value: '#991b1b' },
  { label: 'Bruin', value: '#78350f' },
  { label: 'Zwart', value: '#1e293b' },
  { label: 'Lichtgrijs', value: '#94a3b8' },
  { label: 'Wit', value: '#f8fafc' },
  { label: 'Goud', value: '#d97706' },
];

interface DeformControlsProps {
  label: string;
  scaleX: number;
  scaleY: number;
  offsetX?: number;
  offsetY?: number;
  onScaleXChange: (val: number) => void;
  onScaleYChange: (val: number) => void;
  onOffsetXChange?: (val: number) => void;
  onOffsetYChange?: (val: number) => void;
  onReset: () => void;
}

const DeformControls: React.FC<DeformControlsProps> = ({
  label,
  scaleX,
  scaleY,
  offsetX,
  offsetY,
  onScaleXChange,
  onScaleYChange,
  onOffsetXChange,
  onOffsetYChange,
  onReset,
}) => {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-3">
      <div className="flex items-center justify-between text-xs font-black text-slate-700">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>{label} Vervormen & Positie:</span>
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer flex items-center gap-0.5"
          title="Herstellen naar standaard"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Herstel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Breedte / Uitrekken horizontaal (< >) */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500">Breedte (&lt; &gt;)</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onScaleXChange(Math.max(0.6, Number((scaleX - 0.05).toFixed(2))))}
              className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black cursor-pointer text-slate-800"
              title="Smaller maken"
            >
              &lt;
            </button>
            <span className="text-[11px] font-mono font-bold w-9 text-center text-slate-800">
              {Math.round(scaleX * 100)}%
            </span>
            <button
              type="button"
              onClick={() => onScaleXChange(Math.min(1.5, Number((scaleX + 0.05).toFixed(2))))}
              className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black cursor-pointer text-slate-800"
              title="Breder uitrekken"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Hoogte / Uitrekken verticaal (v ^) */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500">Hoogte (v ^)</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onScaleYChange(Math.max(0.6, Number((scaleY - 0.05).toFixed(2))))}
              className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black cursor-pointer text-slate-800"
              title="Platter samendrukken"
            >
              v
            </button>
            <span className="text-[11px] font-mono font-bold w-9 text-center text-slate-800">
              {Math.round(scaleY * 100)}%
            </span>
            <button
              type="button"
              onClick={() => onScaleYChange(Math.min(1.5, Number((scaleY + 0.05).toFixed(2))))}
              className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black cursor-pointer text-slate-800"
              title="Hoger uitrekken"
            >
              ^
            </button>
          </div>
        </div>

        {/* Positie (wanneer van toepassing) */}
        {onOffsetXChange && onOffsetYChange && offsetX !== undefined && offsetY !== undefined && (
          <div className="sm:col-span-2 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500">Positie</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onOffsetXChange(Math.max(-12, offsetX - 2))}
                className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black cursor-pointer"
                title="Naar links"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => onOffsetYChange(Math.max(-12, offsetY - 2))}
                className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black cursor-pointer"
                title="Omhoog"
              >
                <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => onOffsetYChange(Math.min(12, offsetY + 2))}
                className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black cursor-pointer"
                title="Omlaag"
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => onOffsetXChange(Math.min(12, offsetX + 2))}
                className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center font-black cursor-pointer"
                title="Naar rechts"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function MiiMakerApp() {
  const [avatars, setAvatars] = useState<MiiAvatar[]>(() => loadMiiAvatars());
  const [editingAvatar, setEditingAvatar] = useState<MiiAvatar | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<
    'huid' | 'hoofd' | 'haar' | 'ogen' | 'neus' | 'oren' | 'mond' | 'baard' | 'extras' | 'shirt'
  >('huid');

  // Open editor for new Player
  const handleCreateNew = () => {
    sounds.playWiiSelect();
    const newPlayer: MiiAvatar = {
      id: 'speler-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: '',
      gender: 'm',
      skinColor: '#fed7aa',
      headShape: 'oval',
      headScaleX: 1,
      headScaleY: 1,
      hairStyle: 'spiky',
      hairColor: '#78350f',
      hairScale: 1,
      hairScaleX: 1,
      hairScaleY: 1,
      hairOffsetX: 0,
      hairOffsetY: 0,
      eyeStyle: 'normal',
      eyeColor: '#0284c7',
      eyeScale: 1,
      eyeScaleX: 1,
      eyeScaleY: 1,
      eyeOffsetX: 0,
      eyeOffsetY: 0,
      eyebrowStyle: 'normal',
      mouthStyle: 'smile',
      mouthScale: 1,
      mouthScaleX: 1,
      mouthScaleY: 1,
      mouthOffsetX: 0,
      mouthOffsetY: 0,
      noseStyle: 'classic',
      noseScale: 1,
      noseScaleX: 1,
      noseScaleY: 1,
      noseOffsetX: 0,
      noseOffsetY: 0,
      earStyle: 'normal',
      earScale: 1,
      earScaleX: 1,
      earScaleY: 1,
      facialHair: 'none',
      facialHairColor: '#78350f',
      facialHairScaleX: 1,
      facialHairScaleY: 1,
      facialHairOffsetX: 0,
      facialHairOffsetY: 0,
      glasses: 'none',
      headwear: 'none',
      headwearColor: '#3b82f6',
      headwearScaleX: 1,
      headwearScaleY: 1,
      headwearOffsetX: 0,
      headwearOffsetY: 0,
      moleStyle: 'none',
      moleScale: 1,
      moleOffsetX: 0,
      moleOffsetY: 0,
      blush: false,
      favoriteColor: '#3b82f6',
      createdAt: Date.now(),
    };
    setEditingAvatar(newPlayer);
    setEditorTab('huid');
  };

  // Open editor for existing Player
  const handleEditPlayer = (avatar: MiiAvatar) => {
    sounds.playTick(600);
    setEditingAvatar({
      ...avatar,
      headShape: avatar.headShape ?? 'oval',
      headScaleX: avatar.headScaleX ?? 1,
      headScaleY: avatar.headScaleY ?? 1,
      hairScaleX: avatar.hairScaleX ?? avatar.hairScale ?? 1,
      hairScaleY: avatar.hairScaleY ?? avatar.hairScale ?? 1,
      hairOffsetX: avatar.hairOffsetX ?? 0,
      hairOffsetY: avatar.hairOffsetY ?? 0,
      eyeScaleX: avatar.eyeScaleX ?? avatar.eyeScale ?? 1,
      eyeScaleY: avatar.eyeScaleY ?? avatar.eyeScale ?? 1,
      eyeOffsetX: avatar.eyeOffsetX ?? 0,
      eyeOffsetY: avatar.eyeOffsetY ?? 0,
      mouthScaleX: avatar.mouthScaleX ?? avatar.mouthScale ?? 1,
      mouthScaleY: avatar.mouthScaleY ?? avatar.mouthScale ?? 1,
      mouthOffsetX: avatar.mouthOffsetX ?? 0,
      mouthOffsetY: avatar.mouthOffsetY ?? 0,
      noseStyle: avatar.noseStyle ?? 'classic',
      noseScaleX: avatar.noseScaleX ?? avatar.noseScale ?? 1,
      noseScaleY: avatar.noseScaleY ?? avatar.noseScale ?? 1,
      noseOffsetX: avatar.noseOffsetX ?? 0,
      noseOffsetY: avatar.noseOffsetY ?? 0,
      earStyle: avatar.earStyle ?? 'normal',
      earScaleX: avatar.earScaleX ?? avatar.earScale ?? 1,
      earScaleY: avatar.earScaleY ?? avatar.earScale ?? 1,
      facialHair: avatar.facialHair ?? 'none',
      facialHairColor: avatar.facialHairColor ?? avatar.hairColor ?? '#78350f',
      facialHairScaleX: avatar.facialHairScaleX ?? 1,
      facialHairScaleY: avatar.facialHairScaleY ?? 1,
      facialHairOffsetX: avatar.facialHairOffsetX ?? 0,
      facialHairOffsetY: avatar.facialHairOffsetY ?? 0,
      headwear: avatar.headwear ?? 'none',
      headwearColor: avatar.headwearColor ?? avatar.favoriteColor ?? '#3b82f6',
      headwearScaleX: avatar.headwearScaleX ?? 1,
      headwearScaleY: avatar.headwearScaleY ?? 1,
      headwearOffsetX: avatar.headwearOffsetX ?? 0,
      headwearOffsetY: avatar.headwearOffsetY ?? 0,
      moleStyle: avatar.moleStyle ?? 'none',
      moleScale: avatar.moleScale ?? 1,
      moleOffsetX: avatar.moleOffsetX ?? 0,
      moleOffsetY: avatar.moleOffsetY ?? 0,
    });
    setEditorTab('huid');
  };

  // Delete Player
  const handleDeletePlayer = (id: string) => {
    sounds.playTick(350);
    const updated = deleteMiiAvatar(id);
    setAvatars(updated);
    setSelectedAvatarId(null);
  };

  // Save Player
  const handleSavePlayer = () => {
    if (!editingAvatar) return;
    const trimmed = editingAvatar.name.trim() || 'Speler';
    const toSave: MiiAvatar = {
      ...editingAvatar,
      name: trimmed,
    };
    const updated = addMiiAvatar(toSave);
    setAvatars(updated);
    setEditingAvatar(null);
    sounds.playCheerFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-14 select-none">
      {/* =========================================================================
          VIEW 1: SPELERS PLEINTJE / OVERZICHT (When not in editor mode)
         ========================================================================= */}
      {!editingAvatar ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Clean Top Action Bar */}
          <div className="w-full flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                Spelers Pleintje ({avatars.length})
              </span>
            </div>

            <button
              onClick={handleCreateNew}
              className="wii-btn-blue px-4 py-2 rounded-2xl font-black text-xs sm:text-sm cursor-pointer shadow-md flex items-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nieuwe Speler Maken</span>
            </button>
          </div>

          {/* Pleintje Grid displaying all created player avatars */}
          <div className="w-full wii-card rounded-3xl p-4 sm:p-6 border-2 border-white shadow-sm bg-gradient-to-b from-sky-50/50 via-white to-sky-100/40">
            {avatars.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-3xl">
                Er zijn nog geen spelers gemaakt. Maak er een aan via de knop hierboven!
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                {avatars.map(avatar => {
                  const isSelected = selectedAvatarId === avatar.id;

                  return (
                    <div
                      key={avatar.id}
                      onClick={() => {
                        sounds.playTick(500);
                        setSelectedAvatarId(isSelected ? null : avatar.id);
                      }}
                      className={`relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-100 border-2 border-sky-400 shadow-md scale-103'
                          : 'bg-white/80 border border-slate-200/80 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="relative mb-2">
                        <MiiFace avatar={avatar} size={70} />
                      </div>

                      <span className="font-black text-xs text-slate-800 text-center truncate max-w-full px-1">
                        {avatar.name || 'Naamloos'}
                      </span>

                      {isSelected && (
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleEditPlayer(avatar);
                            }}
                            className="p-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white cursor-pointer shadow-xs active:scale-95"
                            title="Bewerken"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeletePlayer(avatar.id);
                            }}
                            className="p-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-xs active:scale-95"
                            title="Verwijderen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: SPELER EDITOR (With Always Visible / Sticky Live Head Preview)
           ========================================================================= */
        <div className="space-y-3 sm:space-y-4">
          {/* Main Layout Container: Sticky Preview (Mobile Top / Desktop Left) + Options */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-start relative">
            {/* Pinned / Sticky Live Player Preview Card with Background Shield */}
            {/* On mobile: pinned at top right below WiiNavBar with safe-area offset.
                A solid background shield extends above to the top and below with a clean gap,
                so scrolling options disappear BEHIND the background, leaving a clean empty rim under the head tab! */}
            <div
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 3.2rem)' }}
              className="sticky z-25 w-full md:w-5/12 md:shrink-0 -mx-3 px-3 sm:mx-0 sm:px-0 pt-1 pb-3 sm:pb-0 bg-gradient-to-b from-[#e0f2fe] via-[#e2f3fe] to-[#eaf6ff] sm:bg-transparent"
            >
              {/* Top Shield extending upwards to cover space behind WiiNavBar on mobile */}
              <div className="sm:hidden absolute inset-x-0 bottom-full h-32 bg-[#e0f2fe] pointer-events-none" />

              {/* Bottom Soft Fade Edge into the page background on mobile */}
              <div className="sm:hidden absolute inset-x-0 -bottom-3 h-3 bg-gradient-to-b from-[#eaf6ff] to-transparent pointer-events-none" />

              <div className="wii-card rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border-2 border-white shadow-xl bg-white relative z-10">
                {/* Mobile View (< sm): Compact horizontal layout with larger 100px head */}
                <div className="sm:hidden flex items-center gap-3">
                  {/* Big Live Head (100px) in crisp elevated badge */}
                  <div className="relative shrink-0 p-1.5 rounded-2xl border-2 border-sky-300 shadow-md bg-gradient-to-b from-sky-50 to-white">
                    <MiiFace avatar={editingAvatar} size={100} showBorder={false} />
                  </div>

                  {/* Name Input & Action Buttons */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingAvatar.name}
                        onChange={e => setEditingAvatar({ ...editingAvatar, name: e.target.value })}
                        placeholder="Typ spelernaam..."
                        maxLength={16}
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-sky-200 focus:border-sky-500 font-black text-xs outline-none text-slate-900 shadow-2xs"
                      />
                      <button
                        onClick={handleSavePlayer}
                        className="wii-btn-green px-3 py-1.5 rounded-xl font-black text-xs text-white flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer shrink-0"
                        title="Opslaan"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Opslaan</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <button
                        onClick={() => {
                          setEditingAvatar(null);
                          sounds.playWiiBack();
                        }}
                        className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer active:scale-95 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Pleintje</span>
                      </button>

                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full border border-sky-200">
                        Live Hoofd
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tablet & Desktop View (sm and up): Spacious vertical live preview with big 160px head */}
                <div className="hidden sm:flex flex-col items-center justify-center text-center">
                  <div className="w-full flex items-center justify-between mb-2">
                    <button
                      onClick={() => {
                        setEditingAvatar(null);
                        sounds.playWiiBack();
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Terug naar Pleintje</span>
                    </button>

                    <span className="text-[11px] font-black text-sky-800 uppercase tracking-widest">
                      Live Voorbeeld
                    </span>

                    <button
                      onClick={handleSavePlayer}
                      className="wii-btn-green px-4 py-1.5 rounded-full font-black text-xs sm:text-sm cursor-pointer shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Opslaan</span>
                    </button>
                  </div>

                  {/* Responsive Large Face (160px) */}
                  <div className="relative my-2 p-2 rounded-full border-4 border-white shadow-xl bg-gradient-to-b from-sky-50 to-white">
                    <MiiFace avatar={editingAvatar} size={160} showBorder={false} />
                  </div>

                  {/* Name Input */}
                  <div className="w-full mt-2">
                    <input
                      type="text"
                      value={editingAvatar.name}
                      onChange={e => setEditingAvatar({ ...editingAvatar, name: e.target.value })}
                      placeholder="Typ spelernaam..."
                      maxLength={16}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-50 border-2 border-sky-200 focus:border-sky-500 font-black text-center text-sm outline-none shadow-2xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Customization Tabs & Options */}
            <div className="w-full md:w-7/12 wii-card rounded-3xl p-3.5 sm:p-5 border-2 border-white shadow-sm space-y-4 relative z-10">
              {/* Category Navigation (Horizontal scrollable bar) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'huid', label: 'Huid' },
                    { id: 'hoofd', label: 'Hoofd' },
                    { id: 'haar', label: 'Haar' },
                    { id: 'ogen', label: 'Ogen' },
                    { id: 'neus', label: 'Neus' },
                    { id: 'oren', label: 'Oren' },
                    { id: 'mond', label: 'Mond' },
                    { id: 'baard', label: 'Baard' },
                    { id: 'extras', label: "Extra's" },
                    { id: 'shirt', label: 'Shirt' },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setEditorTab(tab.id);
                      sounds.playTick(500);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap text-center shrink-0 ${
                      editorTab === tab.id
                        ? 'bg-sky-500 text-white shadow-xs scale-102'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* =========================================================
                  TAB 1: HUID
                 ========================================================= */}
              {editorTab === 'huid' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Huidskleur ({SKIN_COLORS.length} opties):
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {SKIN_COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, skinColor: c.value });
                            sounds.playTick(450);
                          }}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                            editingAvatar.skinColor === c.value
                              ? 'border-sky-500 shadow-md scale-110 ring-3 ring-sky-300'
                              : 'border-white shadow-xs hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        >
                          {editingAvatar.skinColor === c.value && (
                            <Check className="w-4 h-4 text-slate-900 stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 2: HOOFD & HOOFDVORM (Met vervorming < > v ^)
                 ========================================================= */}
              {editorTab === 'hoofd' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Hoofdvorm:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'oval', label: 'Ovaal' },
                          { id: 'round', label: 'Rond' },
                          { id: 'square', label: 'Hoekig' },
                          { id: 'triangle', label: 'Puntig' },
                          { id: 'wide', label: 'Breed' },
                          { id: 'heart', label: 'Hartvormig' },
                        ] as const
                      ).map(h => (
                        <button
                          key={h.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, headShape: h.id });
                            sounds.playTick(450);
                          }}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            (editingAvatar.headShape ?? 'oval') === h.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blush Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Rode blosjes op wangen:</span>
                    <button
                      type="button"
                      onClick={() => setEditingAvatar({ ...editingAvatar, blush: !editingAvatar.blush })}
                      className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                        editingAvatar.blush
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {editingAvatar.blush ? 'Aan' : 'Uit'}
                    </button>
                  </div>

                  {/* Hoofdvorm Vervormen */}
                  <DeformControls
                    label="Hoofd"
                    scaleX={editingAvatar.headScaleX ?? 1}
                    scaleY={editingAvatar.headScaleY ?? 1}
                    onScaleXChange={val => setEditingAvatar({ ...editingAvatar, headScaleX: val })}
                    onScaleYChange={val => setEditingAvatar({ ...editingAvatar, headScaleY: val })}
                    onReset={() => setEditingAvatar({ ...editingAvatar, headScaleX: 1, headScaleY: 1 })}
                  />
                </div>
              )}

              {/* =========================================================
                  TAB 3: HAAR & KAPSEL (Uitgebreide stijlen + Deform)
                 ========================================================= */}
              {editorTab === 'haar' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  {/* Haarkleur */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Haarkleur ({HAIR_COLORS.length} opties):
                    </label>
                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                      {HAIR_COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, hairColor: c.value });
                            sounds.playTick(450);
                          }}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                            editingAvatar.hairColor === c.value
                              ? 'border-sky-500 shadow-md scale-110 ring-2 ring-sky-300'
                              : 'border-white shadow-xs hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        >
                          {editingAvatar.hairColor === c.value && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kapsel Selectie */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Kapsel:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { id: 'short', label: 'Kort' },
                          { id: 'buzzcut', label: 'Gemillimeterd' },
                          { id: 'spiky', label: 'Stekels' },
                          { id: 'undercut', label: 'Opgeschoren' },
                          { id: 'parted', label: 'Scheiding' },
                          { id: 'middle_part', label: 'Gordijntjes' },
                          { id: 'side_fringe', label: 'Schuine Lok' },
                          { id: 'curly', label: 'Krullen' },
                          { id: 'wavy', label: 'Golvend' },
                          { id: 'bob', label: 'Boblijn' },
                          { id: 'long', label: 'Lang Haar' },
                          { id: 'bun', label: 'Knotje' },
                          { id: 'ponytail', label: 'Paardenstaart' },
                          { id: 'dreadlocks', label: 'Dreadlocks' },
                          { id: 'braids', label: 'Vlechten' },
                          { id: 'afro', label: 'Afro' },
                        ] as const
                      ).map(h => (
                        <button
                          key={h.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, hairStyle: h.id as MiiHairStyle });
                            sounds.playTick(450);
                          }}
                          className={`p-2 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            editingAvatar.hairStyle === h.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Haar Vervormen & Positie */}
                  <DeformControls
                    label="Kapsel"
                    scaleX={editingAvatar.hairScaleX ?? 1}
                    scaleY={editingAvatar.hairScaleY ?? 1}
                    offsetX={editingAvatar.hairOffsetX ?? 0}
                    offsetY={editingAvatar.hairOffsetY ?? 0}
                    onScaleXChange={val => setEditingAvatar({ ...editingAvatar, hairScaleX: val })}
                    onScaleYChange={val => setEditingAvatar({ ...editingAvatar, hairScaleY: val })}
                    onOffsetXChange={val => setEditingAvatar({ ...editingAvatar, hairOffsetX: val })}
                    onOffsetYChange={val => setEditingAvatar({ ...editingAvatar, hairOffsetY: val })}
                    onReset={() =>
                      setEditingAvatar({
                        ...editingAvatar,
                        hairScaleX: 1,
                        hairScaleY: 1,
                        hairOffsetX: 0,
                        hairOffsetY: 0,
                      })
                    }
                  />
                </div>
              )}

              {/* =========================================================
                  TAB 4: OGEN & WENKBRAUWEN (Met Deform)
                 ========================================================= */}
              {editorTab === 'ogen' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  {/* Oogkleur */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Oogkleur ({EYE_COLORS.length} opties):
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {EYE_COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, eyeColor: c.value });
                            sounds.playTick(450);
                          }}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                            editingAvatar.eyeColor === c.value
                              ? 'border-sky-500 shadow-md scale-110 ring-2 ring-sky-300'
                              : 'border-white shadow-xs hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        >
                          {editingAvatar.eyeColor === c.value && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Oogstijl */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Oogstijl:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'normal', label: 'Normaal' },
                          { id: 'happy', label: 'Blij' },
                          { id: 'wink', label: 'Knipoog' },
                          { id: 'round', label: 'Rond & Groot' },
                          { id: 'cool', label: 'Stoer' },
                          { id: 'dots', label: 'Puntjes' },
                        ] as const
                      ).map(e => (
                        <button
                          key={e.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, eyeStyle: e.id });
                            sounds.playTick(450);
                          }}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            editingAvatar.eyeStyle === e.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wenkbrauwen */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Wenkbrauwen:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { id: 'normal', label: 'Klassiek' },
                          { id: 'thick', label: 'Dik' },
                          { id: 'arched', label: 'Boog' },
                          { id: 'flat', label: 'Vlak' },
                        ] as const
                      ).map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, eyebrowStyle: b.id });
                            sounds.playTick(450);
                          }}
                          className={`p-2 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            editingAvatar.eyebrowStyle === b.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ogen Vervormen & Positie */}
                  <DeformControls
                    label="Ogen"
                    scaleX={editingAvatar.eyeScaleX ?? 1}
                    scaleY={editingAvatar.eyeScaleY ?? 1}
                    offsetX={editingAvatar.eyeOffsetX ?? 0}
                    offsetY={editingAvatar.eyeOffsetY ?? 0}
                    onScaleXChange={val => setEditingAvatar({ ...editingAvatar, eyeScaleX: val })}
                    onScaleYChange={val => setEditingAvatar({ ...editingAvatar, eyeScaleY: val })}
                    onOffsetXChange={val => setEditingAvatar({ ...editingAvatar, eyeOffsetX: val })}
                    onOffsetYChange={val => setEditingAvatar({ ...editingAvatar, eyeOffsetY: val })}
                    onReset={() =>
                      setEditingAvatar({
                        ...editingAvatar,
                        eyeScaleX: 1,
                        eyeScaleY: 1,
                        eyeOffsetX: 0,
                        eyeOffsetY: 0,
                      })
                    }
                  />
                </div>
              )}

              {/* =========================================================
                  TAB 5: NEUS (Aparte tab met Deform < > v ^)
                 ========================================================= */}
              {editorTab === 'neus' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Neusstijl:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'classic', label: 'Klassiek L' },
                          { id: 'button', label: 'Knopneus' },
                          { id: 'triangle', label: 'Driehoek' },
                          { id: 'pointed', label: 'Puntig' },
                          { id: 'round', label: 'Rond' },
                          { id: 'dots', label: 'Twee Stipjes' },
                        ] as const
                      ).map(n => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, noseStyle: n.id });
                            sounds.playTick(450);
                          }}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            (editingAvatar.noseStyle ?? 'classic') === n.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Neus Vervormen & Positie */}
                  <DeformControls
                    label="Neus"
                    scaleX={editingAvatar.noseScaleX ?? 1}
                    scaleY={editingAvatar.noseScaleY ?? 1}
                    offsetX={editingAvatar.noseOffsetX ?? 0}
                    offsetY={editingAvatar.noseOffsetY ?? 0}
                    onScaleXChange={val => setEditingAvatar({ ...editingAvatar, noseScaleX: val })}
                    onScaleYChange={val => setEditingAvatar({ ...editingAvatar, noseScaleY: val })}
                    onOffsetXChange={val => setEditingAvatar({ ...editingAvatar, noseOffsetX: val })}
                    onOffsetYChange={val => setEditingAvatar({ ...editingAvatar, noseOffsetY: val })}
                    onReset={() =>
                      setEditingAvatar({
                        ...editingAvatar,
                        noseScaleX: 1,
                        noseScaleY: 1,
                        noseOffsetX: 0,
                        noseOffsetY: 0,
                      })
                    }
                  />
                </div>
              )}

              {/* =========================================================
                  TAB 6: OREN (Aparte tab met Deform < > v ^)
                 ========================================================= */}
              {editorTab === 'oren' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Oorstijl:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'normal', label: 'Normaal' },
                          { id: 'small', label: 'Klein' },
                          { id: 'large', label: 'Groot' },
                          { id: 'pointed', label: 'Puntig / Elf' },
                          { id: 'round', label: 'Rond' },
                          { id: 'none', label: 'Geen oren' },
                        ] as const
                      ).map(e => (
                        <button
                          key={e.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, earStyle: e.id });
                            sounds.playTick(450);
                          }}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            (editingAvatar.earStyle ?? 'normal') === e.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Oren Vervormen */}
                  <DeformControls
                    label="Oren"
                    scaleX={editingAvatar.earScaleX ?? 1}
                    scaleY={editingAvatar.earScaleY ?? 1}
                    onScaleXChange={val => setEditingAvatar({ ...editingAvatar, earScaleX: val })}
                    onScaleYChange={val => setEditingAvatar({ ...editingAvatar, earScaleY: val })}
                    onReset={() =>
                      setEditingAvatar({
                        ...editingAvatar,
                        earScaleX: 1,
                        earScaleY: 1,
                      })
                    }
                  />
                </div>
              )}

              {/* =========================================================
                  TAB 7: MOND (Met Deform < > v ^)
                 ========================================================= */}
              {editorTab === 'mond' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Mondstijl:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'smile', label: 'Glimlach' },
                          { id: 'big_smile', label: 'Grote Lach' },
                          { id: 'teeth', label: 'Tanden' },
                          { id: 'smirk', label: 'Grijns' },
                          { id: 'neutral', label: 'Neutraal' },
                          { id: 'o', label: 'Verbaasd O' },
                        ] as const
                      ).map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, mouthStyle: m.id });
                            sounds.playTick(450);
                          }}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            editingAvatar.mouthStyle === m.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mond Vervormen & Positie */}
                  <DeformControls
                    label="Mond"
                    scaleX={editingAvatar.mouthScaleX ?? 1}
                    scaleY={editingAvatar.mouthScaleY ?? 1}
                    offsetX={editingAvatar.mouthOffsetX ?? 0}
                    offsetY={editingAvatar.mouthOffsetY ?? 0}
                    onScaleXChange={val => setEditingAvatar({ ...editingAvatar, mouthScaleX: val })}
                    onScaleYChange={val => setEditingAvatar({ ...editingAvatar, mouthScaleY: val })}
                    onOffsetXChange={val => setEditingAvatar({ ...editingAvatar, mouthOffsetX: val })}
                    onOffsetYChange={val => setEditingAvatar({ ...editingAvatar, mouthOffsetY: val })}
                    onReset={() =>
                      setEditingAvatar({
                        ...editingAvatar,
                        mouthScaleX: 1,
                        mouthScaleY: 1,
                        mouthOffsetX: 0,
                        mouthOffsetY: 0,
                      })
                    }
                  />
                </div>
              )}

              {/* =========================================================
                  TAB 8: BAARD & SNOR (Aparte baardkleur + Meer stijlen + Deform)
                 ========================================================= */}
              {editorTab === 'baard' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  {/* Snor & Baard Stijl */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Gezichtsbeharing:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'none', label: 'Geen' },
                          { id: 'mustache', label: 'Klassieke Snor' },
                          { id: 'walrus', label: 'Borstelsnor' },
                          { id: 'handlebar', label: 'Krulsnor' },
                          { id: 'goatee', label: 'Sikje' },
                          { id: 'soul_patch', label: 'Soul Patch' },
                          { id: 'stubble', label: 'Stoppels' },
                          { id: 'chinstrap', label: 'Kaaklijn' },
                          { id: 'beard', label: 'Volle Baard' },
                        ] as const
                      ).map(f => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, facialHair: f.id as MiiFacialHair });
                            sounds.playTick(450);
                          }}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            (editingAvatar.facialHair ?? 'none') === f.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aparte Baardkleur (onafhankelijk van kapsel!) */}
                  {editingAvatar.facialHair && editingAvatar.facialHair !== 'none' && (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-500">
                            Aparte Baardkleur ({HAIR_COLORS.length} opties):
                          </label>
                          <span className="text-[10px] text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">
                            Onafhankelijk van haar
                          </span>
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                          {HAIR_COLORS.map(c => {
                            const curColor = editingAvatar.facialHairColor || editingAvatar.hairColor;
                            return (
                              <button
                                key={c.value}
                                onClick={() => {
                                  setEditingAvatar({ ...editingAvatar, facialHairColor: c.value });
                                  sounds.playTick(450);
                                }}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                                  curColor === c.value
                                    ? 'border-sky-500 shadow-md scale-110 ring-2 ring-sky-300'
                                    : 'border-white shadow-xs hover:scale-105'
                                }`}
                                style={{ backgroundColor: c.value }}
                                title={c.label}
                              >
                                {curColor === c.value && (
                                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Baard Vervormen & Positie */}
                      <DeformControls
                        label="Baard / Snor"
                        scaleX={editingAvatar.facialHairScaleX ?? 1}
                        scaleY={editingAvatar.facialHairScaleY ?? 1}
                        offsetX={editingAvatar.facialHairOffsetX ?? 0}
                        offsetY={editingAvatar.facialHairOffsetY ?? 0}
                        onScaleXChange={val =>
                          setEditingAvatar({ ...editingAvatar, facialHairScaleX: val })
                        }
                        onScaleYChange={val =>
                          setEditingAvatar({ ...editingAvatar, facialHairScaleY: val })
                        }
                        onOffsetXChange={val =>
                          setEditingAvatar({ ...editingAvatar, facialHairOffsetX: val })
                        }
                        onOffsetYChange={val =>
                          setEditingAvatar({ ...editingAvatar, facialHairOffsetY: val })
                        }
                        onReset={() =>
                          setEditingAvatar({
                            ...editingAvatar,
                            facialHairScaleX: 1,
                            facialHairScaleY: 1,
                            facialHairOffsetX: 0,
                            facialHairOffsetY: 0,
                          })
                        }
                      />
                    </>
                  )}
                </div>
              )}

              {/* =========================================================
                  TAB 9: EXTRA'S (Hoofddeksels, Moedervlekken, Brillen)
                 ========================================================= */}
              {editorTab === 'extras' && (
                <div className="space-y-5 animate-in fade-in duration-100">
                  {/* Hoofddeksels */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Hoofddeksels & Hoeden:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'none', label: 'Geen' },
                          { id: 'cap', label: 'Pet' },
                          { id: 'beanie', label: 'Muts' },
                          { id: 'party_hat', label: 'Feestmuts' },
                          { id: 'crown', label: 'Kroon' },
                          { id: 'cowboy', label: 'Cowboyhoed' },
                          { id: 'bandana', label: 'Bandana' },
                          { id: 'beret', label: 'Baret' },
                          { id: 'chef', label: 'Koksmuts' },
                        ] as const
                      ).map(hw => (
                        <button
                          key={hw.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, headwear: hw.id as MiiHeadwear });
                            sounds.playTick(450);
                          }}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            (editingAvatar.headwear ?? 'none') === hw.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {hw.label}
                        </button>
                      ))}
                    </div>

                    {/* Hoofddeksel Kleur & Vervorming als er eentje gekozen is */}
                    {editingAvatar.headwear && editingAvatar.headwear !== 'none' && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                            Kleur Hoofddeksel ({HEADWEAR_COLORS.length} opties):
                          </label>
                          <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                            {HEADWEAR_COLORS.map(c => {
                              const curColor = editingAvatar.headwearColor || editingAvatar.favoriteColor;
                              return (
                                <button
                                  key={c.value}
                                  onClick={() => {
                                    setEditingAvatar({ ...editingAvatar, headwearColor: c.value });
                                    sounds.playTick(450);
                                  }}
                                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                                    curColor === c.value
                                      ? 'border-sky-500 shadow-md scale-110 ring-2 ring-sky-300'
                                      : 'border-white shadow-xs hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: c.value }}
                                  title={c.label}
                                >
                                  {curColor === c.value && (
                                    <Check className="w-3 h-3 text-white stroke-[3]" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <DeformControls
                          label="Hoofddeksel"
                          scaleX={editingAvatar.headwearScaleX ?? 1}
                          scaleY={editingAvatar.headwearScaleY ?? 1}
                          offsetX={editingAvatar.headwearOffsetX ?? 0}
                          offsetY={editingAvatar.headwearOffsetY ?? 0}
                          onScaleXChange={val =>
                            setEditingAvatar({ ...editingAvatar, headwearScaleX: val })
                          }
                          onScaleYChange={val =>
                            setEditingAvatar({ ...editingAvatar, headwearScaleY: val })
                          }
                          onOffsetXChange={val =>
                            setEditingAvatar({ ...editingAvatar, headwearOffsetX: val })
                          }
                          onOffsetYChange={val =>
                            setEditingAvatar({ ...editingAvatar, headwearOffsetY: val })
                          }
                          onReset={() =>
                            setEditingAvatar({
                              ...editingAvatar,
                              headwearScaleX: 1,
                              headwearScaleY: 1,
                              headwearOffsetX: 0,
                              headwearOffsetY: 0,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Moedervlekken, Sproetjes & Littekens */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Moedervlekken, Sproetjes & Littekens:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'none', label: 'Geen' },
                          { id: 'mole_cheek', label: 'Vlek Wang' },
                          { id: 'mole_chin', label: 'Vlek Kin' },
                          { id: 'mole_lip', label: 'Vlek Lip' },
                          { id: 'freckles', label: 'Sproetjes' },
                          { id: 'scar', label: 'Litteken' },
                        ] as const
                      ).map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, moleStyle: m.id as MiiMoleStyle });
                            sounds.playTick(450);
                          }}
                          className={`p-2 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            (editingAvatar.moleStyle ?? 'none') === m.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {editingAvatar.moleStyle && editingAvatar.moleStyle !== 'none' && (
                      <DeformControls
                        label="Moedervlek / Teken"
                        scaleX={editingAvatar.moleScale ?? 1}
                        scaleY={editingAvatar.moleScale ?? 1}
                        offsetX={editingAvatar.moleOffsetX ?? 0}
                        offsetY={editingAvatar.moleOffsetY ?? 0}
                        onScaleXChange={val => setEditingAvatar({ ...editingAvatar, moleScale: val })}
                        onScaleYChange={val => setEditingAvatar({ ...editingAvatar, moleScale: val })}
                        onOffsetXChange={val =>
                          setEditingAvatar({ ...editingAvatar, moleOffsetX: val })
                        }
                        onOffsetYChange={val =>
                          setEditingAvatar({ ...editingAvatar, moleOffsetY: val })
                        }
                        onReset={() =>
                          setEditingAvatar({
                            ...editingAvatar,
                            moleScale: 1,
                            moleOffsetX: 0,
                            moleOffsetY: 0,
                          })
                        }
                      />
                    )}
                  </div>

                  {/* Bril */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Bril:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { id: 'none', label: 'Geen' },
                          { id: 'round', label: 'Rond' },
                          { id: 'square', label: 'Vierkant' },
                          { id: 'sunglasses', label: 'Zonnebril' },
                        ] as const
                      ).map(g => (
                        <button
                          key={g.id}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, glasses: g.id });
                            sounds.playTick(450);
                          }}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all text-center ${
                            editingAvatar.glasses === g.id
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 10: SHIRT / FAVORIETE KLEUR
                 ========================================================= */}
              {editorTab === 'shirt' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                      Shirt- & Favoriete Kleur ({FAVORITE_COLORS.length} opties):
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                      {FAVORITE_COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => {
                            setEditingAvatar({ ...editingAvatar, favoriteColor: c.value });
                            sounds.playTick(450);
                          }}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                            editingAvatar.favoriteColor === c.value
                              ? 'border-sky-500 shadow-md scale-110 ring-3 ring-sky-300'
                              : 'border-white shadow-xs hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        >
                          {editingAvatar.favoriteColor === c.value && (
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
