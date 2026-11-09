interface SevenSegmentClockProps {
  time: string; // e.g. "10:06" or "23:45"
  className?: string;
}

// Segment maps for digits 0-9: [a, b, c, d, e, f, g]
const DIGIT_SEGMENTS: Record<string, boolean[]> = {
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
};

function Digit({ char }: { char: string }) {
  // Digit '1' has special slim width matching Nintendo Wii LCD clock
  if (char === '1') {
    return (
      <svg
        viewBox="0 0 14 60"
        className="h-7 sm:h-9 w-auto block select-none"
        style={{ filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.85))' }}
      >
        <defs>
          <linearGradient id="lcdSegmentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#68788c" />
            <stop offset="50%" stopColor="#556477" />
            <stop offset="100%" stopColor="#435061" />
          </linearGradient>
        </defs>
        {/* Top vertical segment */}
        <polygon
          points="7,7 10,9 10,27 7,29 4,27 4,9"
          fill="url(#lcdSegmentGrad)"
        />
        {/* Bottom vertical segment */}
        <polygon
          points="7,31 10,33 10,51 7,53 4,51 4,33"
          fill="url(#lcdSegmentGrad)"
        />
      </svg>
    );
  }

  const segs = DIGIT_SEGMENTS[char] || [false, false, false, false, false, false, false];

  return (
    <svg
      viewBox="0 0 34 60"
      className="h-7 sm:h-9 w-auto block select-none"
      style={{ filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.85))' }}
    >
      <defs>
        <linearGradient id="lcdSegmentGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#68788c" />
          <stop offset="50%" stopColor="#556477" />
          <stop offset="100%" stopColor="#435061" />
        </linearGradient>
      </defs>

      {/* Segment A: Top horizontal */}
      {segs[0] && (
        <polygon
          points="7,3 27,3 29,6 27,9 7,9 5,6"
          fill="url(#lcdSegmentGrad)"
        />
      )}

      {/* Segment B: Top-right vertical */}
      {segs[1] && (
        <polygon
          points="29,7 32,9 32,27 29,29 26,27 26,9"
          fill="url(#lcdSegmentGrad)"
        />
      )}

      {/* Segment C: Bottom-right vertical */}
      {segs[2] && (
        <polygon
          points="29,31 32,33 32,51 29,53 26,51 26,33"
          fill="url(#lcdSegmentGrad)"
        />
      )}

      {/* Segment D: Bottom horizontal */}
      {segs[3] && (
        <polygon
          points="7,51 27,51 29,54 27,57 7,57 5,54"
          fill="url(#lcdSegmentGrad)"
        />
      )}

      {/* Segment E: Bottom-left vertical */}
      {segs[4] && (
        <polygon
          points="5,31 8,33 8,51 5,53 2,51 2,33"
          fill="url(#lcdSegmentGrad)"
        />
      )}

      {/* Segment F: Top-left vertical */}
      {segs[5] && (
        <polygon
          points="5,7 8,9 8,27 5,29 2,27 2,9"
          fill="url(#lcdSegmentGrad)"
        />
      )}

      {/* Segment G: Center horizontal */}
      {segs[6] && (
        <polygon
          points="7,27 27,27 29,30 27,33 7,33 5,30"
          fill="url(#lcdSegmentGrad)"
        />
      )}
    </svg>
  );
}

function Colon() {
  return (
    <svg
      viewBox="0 0 16 60"
      className="h-7 sm:h-9 w-auto block select-none px-0.5"
      style={{ filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.85))' }}
    >
      <circle cx="8" cy="20" r="3.5" fill="url(#lcdSegmentGrad)" />
      <circle cx="8" cy="40" r="3.5" fill="url(#lcdSegmentGrad)" />
    </svg>
  );
}

export function SevenSegmentClock({ time, className = '' }: SevenSegmentClockProps) {
  // Expecting format "HH:MM" e.g. "10:06"
  const chars = (time || '00:00').split('');

  return (
    <div className={`flex items-center justify-center gap-0.5 sm:gap-1 ${className}`}>
      {chars.map((char, index) => {
        if (char === ':') {
          return <Colon key={index} />;
        }
        return <Digit key={index} char={char} />;
      })}
    </div>
  );
}
