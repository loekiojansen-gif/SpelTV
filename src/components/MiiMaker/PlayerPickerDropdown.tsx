import React, { useState, useEffect, useRef } from 'react';
import { MiiAvatar } from '../../types';
import { loadMiiAvatars } from '../../utils/storage';
import { MiiFace } from './MiiFace';
import { UserCheck, ChevronDown, Plus, Users } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PlayerPickerDropdownProps {
  onSelectPlayer: (name: string, avatar: MiiAvatar) => void;
  existingNames?: string[];
  buttonLabel?: string;
  className?: string;
  buttonClassName?: string;
  compact?: boolean;
}

export const PlayerPickerDropdown: React.FC<PlayerPickerDropdownProps> = ({
  onSelectPlayer,
  existingNames = [],
  buttonLabel = 'Kies Speler',
  className = '',
  buttonClassName,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [avatars, setAvatars] = useState<MiiAvatar[]>(() => loadMiiAvatars());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Refresh avatars when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setAvatars(loadMiiAvatars());
    }
  }, [isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (avatars.length === 0) return null;

  const normalizedExisting = new Set(existingNames.map(n => n.trim().toLowerCase()));

  const defaultButtonClass = compact
    ? 'px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300'
    : 'px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md active:scale-95';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          sounds.playTick(600);
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 rounded-xl font-black text-xs cursor-pointer transition-all shadow-xs ${buttonClassName || defaultButtonClass}`}
        title="Kies een opgeslagen speler van het Pleintje"
      >
        <span className="text-sm">👤</span>
        <span>{buttonLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Popover Menu with Player Cards */}
      {isOpen && (
        <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-xs mx-auto max-h-[75vh] sm:max-h-72 sm:inset-auto sm:translate-y-0 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-64 overflow-y-auto rounded-2xl bg-white shadow-2xl border-2 border-sky-300 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 mb-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider">
            <span>Spelers Pleintje</span>
            <span className="text-sky-600 font-bold">{avatars.length} poppetjes</span>
          </div>

          <div className="space-y-1">
            {avatars.map(avatar => {
              const isAlreadyAdded = normalizedExisting.has(avatar.name.trim().toLowerCase());

              return (
                <button
                  key={avatar.id}
                  type="button"
                  disabled={isAlreadyAdded}
                  onClick={() => {
                    sounds.playTick(750);
                    onSelectPlayer(avatar.name, avatar);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                    isAlreadyAdded
                      ? 'opacity-40 bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'hover:bg-sky-50 text-slate-800 hover:text-sky-950 active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MiiFace avatar={avatar} size={28} showBorder={false} />
                    <span className="text-xs font-black truncate">{avatar.name}</span>
                  </div>

                  {isAlreadyAdded ? (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Al gekozen</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black shrink-0">
                      +
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
