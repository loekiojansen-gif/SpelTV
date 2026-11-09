import React, { useState, useRef, useEffect } from 'react';
import { WireColor, WIRE_COLORS } from './types';
import { sounds } from '../../utils/audio';

interface Props {
  onComplete: () => void;
  orientation?: 'horizontal' | 'vertical';
}

export function WireConnectModule({ onComplete, orientation = 'horizontal' }: Props) {
  const [wireCount] = useState<number>(() => (Math.random() > 0.5 ? 4 : 3));
  const [sideAPlugs, setSideAPlugs] = useState<WireColor[]>([]);
  const [sideBPlugs, setSideBPlugs] = useState<WireColor[]>([]);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  // Bidirectional drag tracking: can start from side 'A' or 'B'
  const [activeDrag, setActiveDrag] = useState<{ id: string; fromSide: 'A' | 'B' } | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sideAPointsRef = useRef<Record<string, { x: number; y: number }>>({});
  const sideBPointsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Initialize random wire scramble
  useEffect(() => {
    const chosen = WIRE_COLORS.slice(0, wireCount);
    setSideAPlugs([...chosen].sort(() => Math.random() - 0.5));
    setSideBPlugs([...chosen].sort(() => Math.random() - 0.5));
    setConnectedIds([]);
    setActiveDrag(null);
    setDragCurrentPos(null);
  }, [wireCount]);

  // Check completion
  useEffect(() => {
    if (sideAPlugs.length > 0 && connectedIds.length === sideAPlugs.length) {
      setTimeout(() => {
        onComplete();
      }, 350);
    }
  }, [connectedIds, sideAPlugs, onComplete]);

  // Register anchor positions
  const registerPoint = (side: 'A' | 'B', id: string, el: HTMLDivElement | null) => {
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const pt = {
        x: elRect.left + elRect.width / 2 - containerRect.left,
        y: elRect.top + elRect.height / 2 - containerRect.top,
      };
      if (side === 'A') sideAPointsRef.current[id] = pt;
      else sideBPointsRef.current[id] = pt;
    }
  };

  // Bidirectional Pointer down on ANY plug (side A or side B)
  const handlePointerDown = (side: 'A' | 'B', id: string, e: React.PointerEvent) => {
    if (connectedIds.includes(id)) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setActiveDrag({ id, fromSide: side });

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragCurrentPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    sounds.playTick(500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDragCurrentPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDrag || !containerRef.current) {
      setActiveDrag(null);
      setDragCurrentPos(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const upX = e.clientX - rect.left;
    const upY = e.clientY - rect.top;

    // The other side points
    const oppositePoints = activeDrag.fromSide === 'A' ? sideBPointsRef.current : sideAPointsRef.current;
    const targetPt = oppositePoints[activeDrag.id];

    if (targetPt) {
      const dist = Math.hypot(upX - targetPt.x, upY - targetPt.y);
      if (dist < 60) {
        // Success match!
        setConnectedIds(prev => [...prev, activeDrag.id]);
        sounds.playWireConnect();
      } else {
        // Check if released on wrong endpoint
        let releasedOnWrong = false;
        Object.entries(oppositePoints).forEach(([otherId, pt]) => {
          if (otherId !== activeDrag.id && Math.hypot(upX - pt.x, upY - pt.y) < 50) {
            releasedOnWrong = true;
          }
        });
        if (releasedOnWrong) {
          sounds.playErrorBuzzer();
        } else {
          sounds.playTick(300);
        }
      }
    }

    setActiveDrag(null);
    setDragCurrentPos(null);
  };

  // Bidirectional tap-to-connect fallback
  const handleTapPlug = (side: 'A' | 'B', id: string) => {
    if (connectedIds.includes(id)) return;

    if (!activeDrag) {
      setActiveDrag({ id, fromSide: side });
      sounds.playTick(520);
    } else {
      // Already selected one side
      if (activeDrag.fromSide === side) {
        // Tapping same side: change selection or cancel
        if (activeDrag.id === id) {
          setActiveDrag(null);
        } else {
          setActiveDrag({ id, fromSide: side });
          sounds.playTick(520);
        }
      } else {
        // Tapping opposite side: check if same color!
        if (activeDrag.id === id) {
          setConnectedIds(prev => [...prev, id]);
          sounds.playWireConnect();
          setActiveDrag(null);
        } else {
          sounds.playErrorBuzzer();
          setActiveDrag(null);
        }
      }
    }
  };

  const isVertical = orientation === 'vertical';

  // Get active drag start point based on which side was touched
  let activeStartPt: { x: number; y: number } | null = null;
  if (activeDrag) {
    activeStartPt =
      activeDrag.fromSide === 'A'
        ? sideAPointsRef.current[activeDrag.id]
        : sideBPointsRef.current[activeDrag.id];
  }

  return (
    <div className="w-full h-full select-none flex flex-col items-center justify-between">
      <div className="mb-2 text-center shrink-0">
        <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-slate-900/90 px-3 py-1 rounded-full border border-amber-500/40">
          🔌 Sleep een draad van links naar rechts (of andersom!)
        </span>
      </div>

      {/* Main wire interaction board - elongated screen filling height */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full max-w-sm flex-1 min-h-[350px] sm:min-h-[400px] bg-slate-950 rounded-3xl border-3 border-slate-700 p-4 relative overflow-hidden flex ${
          isVertical ? 'flex-col justify-between' : 'flex-row justify-between items-center'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* SVG Drawing Layer for connected and dragging wires */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="wire-glow-bidir" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connected Wires */}
          {connectedIds.map(id => {
            const start = sideAPointsRef.current[id];
            const end = sideBPointsRef.current[id];
            const wire = WIRE_COLORS.find(w => w.id === id);
            if (!start || !end || !wire) return null;

            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const d = isVertical
              ? `M ${start.x} ${start.y} Q ${midX + 20} ${midY} ${end.x} ${end.y}`
              : `M ${start.x} ${start.y} C ${start.x + 70} ${start.y}, ${end.x - 70} ${end.y}, ${end.x} ${end.y}`;

            return (
              <g key={id}>
                <path d={d} stroke={wire.color} strokeWidth="12" opacity="0.3" fill="none" filter="url(#wire-glow-bidir)" />
                <path d={d} stroke={wire.color} strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d={d} stroke="#ffffff" strokeWidth="2" opacity="0.8" fill="none" strokeLinecap="round" />
              </g>
            );
          })}

          {/* Live Dragging Wire (starts from wherever user grabbed it) */}
          {activeDrag && dragCurrentPos && activeStartPt && (
            <g>
              {(() => {
                const wire = WIRE_COLORS.find(w => w.id === activeDrag.id);
                if (!wire) return null;
                const d = `M ${activeStartPt.x} ${activeStartPt.y} Q ${(activeStartPt.x + dragCurrentPos.x) / 2} ${(activeStartPt.y + dragCurrentPos.y) / 2} ${dragCurrentPos.x} ${dragCurrentPos.y}`;

                return (
                  <>
                    <path d={d} stroke={wire.color} strokeWidth="12" opacity="0.4" fill="none" filter="url(#wire-glow-bidir)" />
                    <path d={d} stroke={wire.color} strokeWidth="6" fill="none" strokeLinecap="round" />
                    <circle cx={dragCurrentPos.x} cy={dragCurrentPos.y} r="9" fill={wire.color} stroke="#ffffff" strokeWidth="2.5" />
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Side A Terminals (Left or Top) */}
        <div className={`flex ${isVertical ? 'flex-row justify-around w-full' : 'flex-col gap-4 sm:gap-5'} z-20`}>
          {sideAPlugs.map(plug => {
            const isConnected = connectedIds.includes(plug.id);
            const isDraggingThis = activeDrag?.id === plug.id && activeDrag?.fromSide === 'A';
            const isTarget = activeDrag && activeDrag.fromSide === 'B' && activeDrag.id === plug.id;

            return (
              <div
                key={plug.id}
                ref={el => registerPoint('A', plug.id, el)}
                onPointerDown={e => handlePointerDown('A', plug.id, e)}
                onClick={() => handleTapPlug('A', plug.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base cursor-grab active:cursor-grabbing border-3 transition-transform ${
                  isConnected
                    ? 'opacity-40 border-slate-600 bg-slate-800'
                    : isDraggingThis
                    ? 'border-white scale-115 shadow-xl ring-4 ring-white/60'
                    : isTarget
                    ? 'border-white scale-110 animate-pulse shadow-lg'
                    : 'border-slate-500 hover:scale-105 active:scale-95 shadow-md'
                }`}
                style={{
                  backgroundColor: plug.color,
                  boxShadow: isDraggingThis || isTarget ? `0 0 16px ${plug.color}` : undefined,
                }}
              >
                {isConnected ? '✓' : plug.symbol}
              </div>
            );
          })}
        </div>

        {/* Side B Terminals (Right or Bottom) */}
        <div className={`flex ${isVertical ? 'flex-row justify-around w-full' : 'flex-col gap-4 sm:gap-5'} z-20`}>
          {sideBPlugs.map(plug => {
            const isConnected = connectedIds.includes(plug.id);
            const isDraggingThis = activeDrag?.id === plug.id && activeDrag?.fromSide === 'B';
            const isTarget = activeDrag && activeDrag.fromSide === 'A' && activeDrag.id === plug.id;

            return (
              <div
                key={plug.id}
                ref={el => registerPoint('B', plug.id, el)}
                onPointerDown={e => handlePointerDown('B', plug.id, e)}
                onClick={() => handleTapPlug('B', plug.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base cursor-grab active:cursor-grabbing border-3 transition-transform ${
                  isConnected
                    ? 'opacity-40 border-slate-600 bg-slate-800'
                    : isDraggingThis
                    ? 'border-white scale-115 shadow-xl ring-4 ring-white/60'
                    : isTarget
                    ? 'border-white scale-110 animate-pulse shadow-lg'
                    : 'border-slate-500 hover:scale-105 active:scale-95 shadow-md'
                }`}
                style={{
                  backgroundColor: isConnected ? plug.color : '#0f172a',
                  borderColor: isDraggingThis || isTarget ? plug.color : undefined,
                  boxShadow: isDraggingThis || isTarget ? `0 0 16px ${plug.color}` : undefined,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 border-white/80"
                  style={{ backgroundColor: plug.color }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-2 text-xs font-mono font-bold text-slate-400 shrink-0">
        Verbonden: <span className="text-emerald-400 font-black">{connectedIds.length} / {sideAPlugs.length}</span>
      </div>
    </div>
  );
}
