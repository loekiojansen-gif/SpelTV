import { Home } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  onBackToWiiMenu?: () => void;
}

export function Header({ onBackToWiiMenu }: HeaderProps) {
  const handleHomeClick = () => {
    sounds.playWiiBack();
    if (onBackToWiiMenu) {
      onBackToWiiMenu();
    }
  };

  return (
    <header
      style={{
        paddingTop: 'max(1.35rem, calc(1.35rem + env(safe-area-inset-top, 0px)))',
      }}
      className="sticky top-0 z-30 w-full bg-transparent px-4 pb-2 transition-all"
    >
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Home Button */}
        <div className="flex items-center shrink-0">
          {onBackToWiiMenu && (
            <button
              onClick={handleHomeClick}
              className="wii-home-btn w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
              title="Party Menu"
            >
              <Home className="w-5 h-5 text-sky-200" />
            </button>
          )}
        </div>

        {/* Center: Title with Emoji */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xl sm:text-2xl shrink-0 select-none">
            🏌️‍♂️
          </span>
          <span className="wii-title-shadow font-black tracking-wide text-white text-xl sm:text-2xl block leading-none select-none truncate">
            PUB GOLF
          </span>
        </div>

        <div className="w-9 h-9 shrink-0" aria-hidden="true" />
      </div>
    </header>
  );
}


