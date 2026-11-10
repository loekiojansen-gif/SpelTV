import React, { useMemo, useState } from 'react';
import { Plus, Users, X } from 'lucide-react';
import { MiiAvatar } from '../../types';
import { loadMiiAvatars } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { MiiFace } from '../MiiMaker/MiiFace';
import { PlayerPickerDropdown } from '../MiiMaker/PlayerPickerDropdown';

const FALLBACK_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

/** Zoekt bij een spelersnaam het bijbehorende poppetje van het Spelers Pleintje. */
export function useAvatarLookup(refreshKey?: unknown) {
  return useMemo(() => {
    const map = new Map<string, MiiAvatar>();
    loadMiiAvatars().forEach(avatar => map.set(avatar.name.trim().toLowerCase(), avatar));
    return (name: string) => map.get(name.trim().toLowerCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);
}

interface PlayerBadgeProps {
  name: string;
  avatar?: MiiAvatar;
  size?: number;
  className?: string;
}

/** Rond hoofdje: het eigen poppetje als dat bestaat, anders een gekleurde initiaal. */
export const PlayerBadge: React.FC<PlayerBadgeProps> = ({ name, avatar, size = 32, className = '' }) => {
  if (avatar) {
    return (
      <span className={`inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
        <MiiFace avatar={avatar} size={size} showBorder={false} />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-black text-white border-2 border-white shadow-sm ${className}`}
      style={{ width: size, height: size, backgroundColor: colorForName(name), fontSize: size * 0.42 }}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
};

interface PlayerRosterProps {
  players: string[];
  onChange: (players: string[]) => void;
  min?: number;
  max?: number;
  title?: string;
  hint?: string;
  /** Tailwind klassen voor de "Toevoegen" knop, zodat het bij het kanaal past */
  accentButtonClass?: string;
}

export const PlayerRoster: React.FC<PlayerRosterProps> = ({
  players,
  onChange,
  min = 0,
  max = 20,
  title = 'Spelers',
  hint,
  accentButtonClass = 'bg-blue-600 hover:bg-blue-500 text-white border-blue-700',
}) => {
  const [input, setInput] = useState('');
  const getAvatar = useAvatarLookup(players.join('|'));
  const isFull = players.length >= max;

  const addPlayer = (rawName: string) => {
    const name = rawName.trim().slice(0, 18);
    if (!name || isFull) return;
    if (players.some(p => p.toLowerCase() === name.toLowerCase())) {
      sounds.playTick(300);
      return;
    }
    onChange([...players, name]);
    sounds.playTick(800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlayer(input);
    setInput('');
  };

  const removePlayer = (name: string) => {
    onChange(players.filter(p => p !== name));
    sounds.playTick(500);
  };

  const missing = Math.max(0, min - players.length);

  return (
    <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 shadow-lg text-slate-950">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {title} ({players.length})
        </span>
        {missing > 0 ? (
          <span className="text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            Nog {missing} nodig
          </span>
        ) : (
          hint && <span className="text-[11px] font-bold text-slate-500 text-right">{hint}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isFull ? 'Maximum bereikt' : 'Naam...'}
          disabled={isFull}
          maxLength={18}
          enterKeyHint="done"
          className="flex-1 min-w-0 px-3 py-2.5 text-sm font-bold rounded-xl outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isFull || !input.trim()}
          className={`px-3 py-2.5 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 transition-all border-2 disabled:opacity-40 disabled:cursor-not-allowed ${accentButtonClass}`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden min-[380px]:inline">Toevoegen</span>
        </button>
        {!isFull && (
          <PlayerPickerDropdown
            compact
            existingNames={players}
            buttonLabel="Kies"
            buttonClassName="px-2.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border-2 border-sky-300"
            onSelectPlayer={name => addPlayer(name)}
          />
        )}
      </form>

      {players.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {players.map(name => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full bg-slate-100 border-2 border-slate-200 text-xs font-black text-slate-800"
            >
              <PlayerBadge name={name} avatar={getAvatar(name)} size={24} />
              <span className="max-w-24 truncate">{name}</span>
              <button
                type="button"
                onClick={() => removePlayer(name)}
                aria-label={`${name} verwijderen`}
                className="w-5 h-5 rounded-full bg-white hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer border border-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs font-bold text-slate-400 mt-3 text-center">
          Typ een naam of kies een poppetje van het Spelers Pleintje.
        </p>
      )}
    </div>
  );
};
