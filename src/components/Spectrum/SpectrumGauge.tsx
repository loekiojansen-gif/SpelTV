import React, { useRef } from 'react';

export interface SpectrumGaugeProps {
  /** Positie van het verborgen doel (0 = uiterst links, 100 = uiterst rechts) */
  targetPos: number;
  /** Huidige positie van de wijzer (0..100) */
  needlePos: number;
  /** Wordt de doelzone getoond aan de speler? */
  showTarget: boolean;
  /** Mag de speler aan de wijzer draaien/slepen? */
  interactive: boolean;
  /** Wordt de wijzer zelf getoond? (Bij alleen-hintgever fase evt verborgen of op 50) */
  showNeedle?: boolean;
  /** Uitersten onder de schaal */
  leftLabel: string;
  rightLabel: string;
  /** Callback wanneer de wijzer verplaatst wordt */
  onChangeNeedle?: (pos: number) => void;
  /** Optionele highlight voor gescoorde punten bij onthulling */
  revealScore?: number | null;
}

const CX = 180;
const CY = 172;
const R_OUTER = 148;
const R_INNER = 46;
const MIN_DEG = -84;
const MAX_DEG = 84;
const SPAN_DEG = MAX_DEG - MIN_DEG;

// Puntengrenzen in procentpunten vanaf targetPos
export const BAND_4 = 3.8; // Midden: 4 punten
export const BAND_3 = 9.5; // Binnenring: 3 punten
export const BAND_2 = 16.0; // Buitenring: 2 punten

export function calculateSpectrumScore(targetPos: number, needlePos: number): number {
  const diff = Math.abs(targetPos - needlePos);
  if (diff <= BAND_4) return 4;
  if (diff <= BAND_3) return 3;
  if (diff <= BAND_2) return 2;
  return 0;
}

function posToDeg(pos: number): number {
  const clamped = Math.max(0, Math.min(100, pos));
  return MIN_DEG + (clamped / 100) * SPAN_DEG;
}

function polarToXY(degFromUp: number, radius: number): { x: number; y: number } {
  const rad = ((-90 + degFromUp) * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function describeRingSlice(
  startPos: number,
  endPos: number,
  rInner: number,
  rOuter: number
): string {
  const sDeg = posToDeg(Math.max(0, startPos));
  const eDeg = posToDeg(Math.min(100, endPos));
  if (eDeg <= sDeg) return '';

  const p1 = polarToXY(sDeg, rOuter);
  const p2 = polarToXY(eDeg, rOuter);
  const p3 = polarToXY(eDeg, rInner);
  const p4 = polarToXY(sDeg, rInner);
  const largeArc = eDeg - sDeg > 180 ? 1 : 0;

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export const SpectrumGauge: React.FC<SpectrumGaugeProps> = ({
  targetPos,
  needlePos,
  showTarget,
  interactive,
  showNeedle = true,
  leftLabel,
  rightLabel,
  onChangeNeedle,
  revealScore = null,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const updateFromClientPoint = (clientX: number, clientY: number) => {
    if (!interactive || !onChangeNeedle || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const sx = ((clientX - rect.left) / rect.width) * 360;
    const sy = ((clientY - rect.top) / rect.height) * 194;

    const dx = sx - CX;
    const dy = Math.min(-6, sy - CY);
    const degFromUp = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const clampedDeg = Math.max(MIN_DEG, Math.min(MAX_DEG, degFromUp));
    const nextPos = ((clampedDeg - MIN_DEG) / SPAN_DEG) * 100;
    onChangeNeedle(Math.round(nextPos * 10) / 10);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !draggingRef.current) return;
    updateFromClientPoint(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
  };

  const needleDeg = posToDeg(needlePos);
  const needleTip = polarToXY(needleDeg, R_OUTER - 8);

  // Doelzone segmenten: [2 links] [3 links] [4 midden] [3 rechts] [2 rechts]
  const bands = [
    {
      label: '2',
      from: targetPos - BAND_2,
      to: targetPos - BAND_3,
      fill: '#0ea5e9',
      textColor: '#ffffff',
      points: 2,
    },
    {
      label: '3',
      from: targetPos - BAND_3,
      to: targetPos - BAND_4,
      fill: '#f59e0b',
      textColor: '#1e293b',
      points: 3,
    },
    {
      label: '4',
      from: targetPos - BAND_4,
      to: targetPos + BAND_4,
      fill: '#ef4444',
      textColor: '#ffffff',
      points: 4,
    },
    {
      label: '3',
      from: targetPos + BAND_4,
      to: targetPos + BAND_3,
      fill: '#f59e0b',
      textColor: '#1e293b',
      points: 3,
    },
    {
      label: '2',
      from: targetPos + BAND_3,
      to: targetPos + BAND_2,
      fill: '#0ea5e9',
      textColor: '#ffffff',
      points: 2,
    },
  ];

  // Schaalverdeling streepjes
  const ticks = Array.from({ length: 21 }, (_, idx) => {
    const p = idx * 5;
    const deg = posToDeg(p);
    const isMajor = idx % 5 === 0;
    const outer = polarToXY(deg, R_OUTER);
    const inner = polarToXY(deg, R_OUTER - (isMajor ? 11 : 6));
    return { p, outer, inner, isMajor };
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Halve cirkel meter */}
      <div className="w-full max-w-[380px] relative">
        <svg
          ref={svgRef}
          viewBox="0 0 360 194"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full h-auto overflow-visible select-none touch-none ${
            interactive ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          role={interactive ? 'slider' : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(needlePos)}
          aria-label="Spectrum schaal"
        >
          <defs>
            <linearGradient id="spectrumDialBg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="spectrumCoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <clipPath id="spectrumSemicircleClip">
              <path d={describeRingSlice(0, 100, R_INNER, R_OUTER)} />
            </clipPath>
          </defs>

          {/* Buitenrand behuizing */}
          <path
            d={describeRingSlice(0, 100, R_INNER - 6, R_OUTER + 8)}
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="3"
          />

          {/* Achtergrond halve cirkel */}
          <path
            d={describeRingSlice(0, 100, R_INNER, R_OUTER)}
            fill={showTarget ? '#f8fafc' : 'url(#spectrumDialBg)'}
          />

          {/* Geheime Doelzones (zichtbaar bij hintgever en bij onthulling) */}
          <g clipPath="url(#spectrumSemicircleClip)">
            {/* Neutrale achtergrond achter doelzones */}
            <rect
              x="0"
              y="0"
              width="360"
              height="194"
              fill="#f8fafc"
              className="transition-opacity duration-500"
              style={{ opacity: showTarget ? 1 : 0 }}
            />

            {bands.map((band, idx) => {
              const d = describeRingSlice(band.from, band.to, R_INNER, R_OUTER);
              if (!d) return null;
              const midPos = (Math.max(0, band.from) + Math.min(100, band.to)) / 2;
              const labelPt = polarToXY(posToDeg(midPos), (R_INNER + R_OUTER) * 0.56);
              const isScoredBand = revealScore !== null && revealScore === band.points;
              return (
                <g
                  key={idx}
                  className="transition-opacity duration-500"
                  style={{ opacity: showTarget ? 1 : 0 }}
                >
                  <path
                    d={d}
                    fill={band.fill}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity={revealScore !== null && !isScoredBand ? 0.72 : 1}
                  />
                  {band.to - band.from >= 4 && (
                    <text
                      x={labelPt.x}
                      y={labelPt.y + 4}
                      textAnchor="middle"
                      fill={band.textColor}
                      fontSize="14"
                      fontWeight="900"
                    >
                      {band.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Afdekscherm wanneer doel verborgen is (schuift/vervaagt weg bij onthulling) */}
          <g
            className="transition-all duration-700 ease-out pointer-events-none"
            style={{
              opacity: showTarget ? 0 : 1,
              transformOrigin: `${CX}px ${CY}px`,
              transform: showTarget ? 'scale(0.95)' : 'scale(1)',
            }}
          >
            <path
              d={describeRingSlice(0, 100, R_INNER, R_OUTER)}
              fill="url(#spectrumCoverGrad)"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Subtiele booglijnen op het schild */}
            <path
              d={describeRingSlice(0, 100, R_OUTER - 32, R_OUTER - 31)}
              fill="#94a3b8"
              opacity="0.22"
            />
            <path
              d={describeRingSlice(0, 100, R_INNER + 28, R_INNER + 29)}
              fill="#94a3b8"
              opacity="0.18"
            />
          </g>

          {/* Schaal-streepjes langs buitenboog */}
          {ticks.map(t => (
            <line
              key={t.p}
              x1={t.outer.x}
              y1={t.outer.y}
              x2={t.inner.x}
              y2={t.inner.y}
              stroke={showTarget ? '#334155' : '#cbd5e1'}
              strokeWidth={t.isMajor ? '2.2' : '1.2'}
              strokeLinecap="round"
              opacity={t.isMajor ? 0.85 : 0.45}
            />
          ))}

          {/* Draaiende Wijzer (Naald) */}
          {showNeedle && (
            <g className="pointer-events-none">
              {/* Schaduw */}
              <line
                x1={CX}
                y1={CY + 2}
                x2={needleTip.x}
                y2={needleTip.y + 3}
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Rode naald */}
              <line
                x1={CX}
                y1={CY}
                x2={needleTip.x}
                y2={needleTip.y}
                stroke="#ef4444"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              {/* Glanslijn op naald */}
              <line
                x1={CX}
                y1={CY}
                x2={needleTip.x}
                y2={needleTip.y}
                stroke="#fecaca"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* Naaldpunt cirkel */}
              <circle
                cx={needleTip.x}
                cy={needleTip.y}
                r="5.5"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Centrale draaiknop onderaan */}
          <circle
            cx={CX}
            cy={CY}
            r="18"
            fill="#1e293b"
            stroke="#e2e8f0"
            strokeWidth="3"
          />
          <circle cx={CX} cy={CY} r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>

      {/* De twee uitersten direct onder de schaal */}
      <div className="w-full max-w-[380px] grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 mt-1">
        <div className="rounded-2xl bg-sky-950/90 border-2 border-sky-400/70 px-3 py-2.5 flex items-center justify-center text-center shadow-md">
          <span className="text-xs sm:text-sm font-black text-sky-100 leading-tight">
            {leftLabel}
          </span>
        </div>
        <div className="flex items-center justify-center text-slate-400 font-black text-sm px-0.5">
          ↔
        </div>
        <div className="rounded-2xl bg-rose-950/90 border-2 border-rose-400/70 px-3 py-2.5 flex items-center justify-center text-center shadow-md">
          <span className="text-xs sm:text-sm font-black text-rose-100 leading-tight">
            {rightLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
