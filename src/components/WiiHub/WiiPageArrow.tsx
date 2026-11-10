import React from 'react';

interface WiiPageArrowProps {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
  onHover?: () => void;
}

export const WiiPageArrow: React.FC<WiiPageArrowProps> = ({
  direction,
  disabled,
  onClick,
  onHover,
}) => {
  const isLeft = direction === 'left';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={disabled ? undefined : onHover}
      className={`relative p-1 sm:p-1.5 transition-all duration-200 select-none flex items-center justify-center focus:outline-none before:absolute before:-inset-y-4 before:-inset-x-1 before:content-[''] ${
        disabled
          ? 'cursor-default opacity-35 grayscale pointer-events-none'
          : 'cursor-pointer hover:scale-110 active:scale-95 filter drop-shadow-[0_2px_6px_rgba(0,168,232,0.3)]'
      }`}
      aria-label={isLeft ? 'Vorige pagina' : 'Volgende pagina'}
      title={disabled ? undefined : isLeft ? 'Vorige pagina' : 'Volgende pagina'}
    >
      <div className={`w-4.5 h-9 sm:w-7 sm:h-14 transition-transform ${isLeft ? 'scale-x-[-1]' : ''}`}>
        <svg
          viewBox="0 0 32 64"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Active Vibrant Cyan/Blue Gradient matching Wii theme and user image */}
            <linearGradient id={`wiiArrowBlue_${direction}`} x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="35%" stopColor="#7dd3fc" />
              <stop offset="85%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>

            {/* Inactive Grey Gradient */}
            <linearGradient id={`wiiArrowGrey_${direction}`} x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <filter id={`wiiGlow_${direction}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={disabled ? '#475569' : '#0284c7'} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Concave arrowhead shape matching user image */}
          <path
            d="M 4,5 L 28,32 L 4,59 Q 12,32 4,5 Z"
            fill={disabled ? `url(#wiiArrowGrey_${direction})` : `url(#wiiArrowBlue_${direction})`}
            stroke={disabled ? '#64748b' : '#0369a1'}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#wiiGlow_${direction})`}
          />

          {/* Internal highlight glint near tip */}
          {!disabled && (
            <path
              d="M 9,12 L 23,30 L 10,48"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>
    </button>
  );
};
