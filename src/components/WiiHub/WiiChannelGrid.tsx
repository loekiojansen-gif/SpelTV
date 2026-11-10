import React, { useState, useEffect, useRef } from 'react';
import { SubAppId } from '../../types';
import { sounds } from '../../utils/audio';
import { SevenSegmentClock } from './SevenSegmentClock';
import { WiiPageArrow } from './WiiPageArrow';
import {
  Mail,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Move,
} from 'lucide-react';
import {
  DEFAULT_CHANNEL_ORDER,
  getChannelTitle,
  ChannelVisual,
} from './ChannelVisual';

interface WiiChannelGridProps {
  onSelectApp: (app: SubAppId) => void;
  pubGolfActive?: boolean;
  pubGolfHole?: number;
  pubGolfTeamsCount?: number;
}

export function WiiChannelGrid({
  onSelectApp,
  pubGolfActive = false,
  pubGolfHole = 1,
  pubGolfTeamsCount = 0,
}: WiiChannelGridProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [dateDisplay, setDateDisplay] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(() => sounds.getMuted());
  const [slabakkenActive] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('party_channels_slabakken_active_game');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.phase && parsed.phase !== 'setup' && parsed.phase !== 'game-over';
      }
    } catch {
      return false;
    }
    return false;
  });

  // Channel Custom Order state (24 slots across 2 pages)
  const [channelOrder, setChannelOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('party_channels_custom_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 24) {
          if (!parsed.includes('UNDERCOVER')) {
            const noiseIndex = parsed.findIndex(id => id.startsWith('NOISE_'));
            if (noiseIndex !== -1) {
              parsed[noiseIndex] = 'UNDERCOVER';
              try {
                localStorage.setItem('party_channels_custom_order', JSON.stringify(parsed));
              } catch {}
              return parsed;
            }
          }
          const hasAllGames = DEFAULT_CHANNEL_ORDER.every(
            id => id.startsWith('NOISE_') || parsed.includes(id)
          );
          if (hasAllGames) return parsed;
        }
      }
    } catch {}
    return DEFAULT_CHANNEL_ORDER;
  });

  // Long-press and Drag state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    sourceIndex: number | null;
    channelId: string | null;
    pointerX: number;
    pointerY: number;
    hoveredIndex: number | null;
  }>({
    isDragging: false,
    sourceIndex: null,
    channelId: null,
    pointerX: 0,
    pointerY: 0,
    hoveredIndex: null,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragTileSizeRef = useRef<{ width: number; height: number }>({ width: 130, height: 98 });
  const dragJustEndedRef = useRef<boolean>(false);
  const lastPageFlipTimeRef = useRef<number>(0);

  // Time & date clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const daysShort = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
      const dayName = daysShort[now.getDay()];
      const dayNum = now.getDate();
      const monthNum = now.getMonth() + 1;
      const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      const formattedMonth = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      setDateDisplay(`${dayName} ${formattedDay}-${formattedMonth}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !muted;
    sounds.setMuted(next);
    setMuted(next);
    if (!next) sounds.playTick(1000);
  };

  const handleChannelClick = (appId: SubAppId) => {
    sounds.playWiiSelect();
    onSelectApp(appId);
  };

  const handleChannelHover = () => {
    sounds.playWiiHover();
  };

  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('party_channels_wii_hub_page');
      if (saved === '1') return 1;
    } catch {}
    return 0;
  });

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return;
    if (newPage < 0 || newPage > 1) return;
    setCurrentPage(newPage);
    try {
      localStorage.setItem('party_channels_wii_hub_page', String(newPage));
    } catch {}
    sounds.playWhoosh();
  };

  // Keyboard navigation for Left/Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (dragState.isDragging) return;
      if (e.key === 'ArrowRight' && currentPage === 0) {
        handlePageChange(1);
      } else if (e.key === 'ArrowLeft' && currentPage === 1) {
        handlePageChange(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, dragState.isDragging]);

  // Page swipe handling (when not dragging a channel)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (dragState.isDragging) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragState.isDragging || touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = touchStartY.current !== null ? e.changedTouches[0].clientY - touchStartY.current : 0;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0 && currentPage === 0) {
        handlePageChange(1);
      } else if (deltaX > 0 && currentPage === 1) {
        handlePageChange(0);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragState.isDragging) return;
    touchStartX.current = e.clientX;
    isSwiping.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragState.isDragging || !isSwiping.current || touchStartX.current === null) return;
    const deltaX = e.clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0 && currentPage === 0) {
        handlePageChange(1);
      } else if (deltaX > 0 && currentPage === 1) {
        handlePageChange(0);
      }
    }
    touchStartX.current = null;
    isSwiping.current = false;
  };

  const handleNoiseTap = (num: string) => {
    setToastMessage(`Kanaal ${num} is in voorbereiding! Binnenkort beschikbaar.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset channel order to default
  const handleResetOrder = () => {
    sounds.playTick(700);
    setChannelOrder(DEFAULT_CHANNEL_ORDER);
    try {
      localStorage.removeItem('party_channels_custom_order');
    } catch {}
    setToastMessage('Standaard kanaalvolgorde hersteld! 🔄');
    setTimeout(() => setToastMessage(null), 2500);
    setShowMessageModal(false);
  };

  // Pointer Down on a Channel Tile: starts long press timer
  const handleTilePointerDown = (
    e: React.PointerEvent,
    slotIndex: number,
    channelId: string
  ) => {
    // Only handle primary pointer (left mouse button or single touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Lege kanalen (ruis/voorbereiding) kunnen niet worden verplaatst
    if (channelId.startsWith('NOISE_')) return;

    const targetEl = e.currentTarget as HTMLElement;
    const rect = targetEl.getBoundingClientRect();
    dragTileSizeRef.current = { width: rect.width, height: rect.height };
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // 320ms hold triggers the channel pickup/drag mode
    longPressTimerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([35, 25, 35]);
      }
      sounds.playTick(950);

      setDragState({
        isDragging: true,
        sourceIndex: slotIndex,
        channelId,
        pointerX: e.clientX,
        pointerY: e.clientY,
        hoveredIndex: slotIndex,
      });
    }, 320);
  };

  // Global window pointer move & pointer up listeners while user is pressing or dragging
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      // If holding down before drag has triggered:
      if (!dragState.isDragging && dragStartPosRef.current) {
        const dx = e.clientX - dragStartPosRef.current.x;
        const dy = e.clientY - dragStartPosRef.current.y;
        // If finger moved > 9px, cancel the long press so swipe works normally
        if (Math.hypot(dx, dy) > 9) {
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
        }
      }

      // If active dragging:
      if (dragState.isDragging) {
        e.preventDefault();

        // 1. Detect slot under pointer
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        const slotEl = targetElement?.closest('[data-channel-slot-index]');
        let nextHoveredIndex: number | null = null;
        if (slotEl) {
          const rawIdx = slotEl.getAttribute('data-channel-slot-index');
          if (rawIdx !== null) {
            nextHoveredIndex = parseInt(rawIdx, 10);
          }
        }

        if (nextHoveredIndex !== null && nextHoveredIndex !== dragState.hoveredIndex) {
          sounds.playWiiHover();
        }

        // 2. Edge page flipping: drag close to edge to flip between page 1 & 2
        const now = Date.now();
        if (now - lastPageFlipTimeRef.current > 600) {
          if (e.clientX < 55 && currentPage === 1) {
            handlePageChange(0);
            lastPageFlipTimeRef.current = now;
          } else if (e.clientX > window.innerWidth - 55 && currentPage === 0) {
            handlePageChange(1);
            lastPageFlipTimeRef.current = now;
          }
        }

        setDragState(prev => ({
          ...prev,
          pointerX: e.clientX,
          pointerY: e.clientY,
          hoveredIndex: nextHoveredIndex !== null ? nextHoveredIndex : prev.hoveredIndex,
        }));
      }
    };

    const handleWindowPointerUp = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      dragStartPosRef.current = null;

      if (dragState.isDragging) {
        const { sourceIndex, hoveredIndex } = dragState;

        if (
          sourceIndex !== null &&
          hoveredIndex !== null &&
          sourceIndex !== hoveredIndex
        ) {
          // Swap positions of the two channel slots!
          setChannelOrder(prev => {
            const next = [...prev];
            const temp = next[sourceIndex];
            next[sourceIndex] = next[hoveredIndex];
            next[hoveredIndex] = temp;
            try {
              localStorage.setItem('party_channels_custom_order', JSON.stringify(next));
            } catch {}
            return next;
          });

          sounds.playFanfare();
          setToastMessage('Kanaal verplaatst! ✨');
          setTimeout(() => setToastMessage(null), 2500);
        } else {
          // Snapped back
          sounds.playTick(500);
        }

        // Prevent synthetic click from firing on release
        dragJustEndedRef.current = true;
        setTimeout(() => {
          dragJustEndedRef.current = false;
        }, 220);

        setDragState({
          isDragging: false,
          sourceIndex: null,
          channelId: null,
          pointerX: 0,
          pointerY: 0,
          hoveredIndex: null,
        });
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [dragState.isDragging, dragState.hoveredIndex, dragState.sourceIndex, currentPage]);

  // Click on a tile
  const handleTileClick = (channelId: string) => {
    if (dragJustEndedRef.current) return;
    if (channelId.startsWith('NOISE_')) {
      const num = channelId.replace('NOISE_', '');
      handleNoiseTap(num);
    } else {
      handleChannelClick(channelId as SubAppId);
    }
  };

  // Render a specific slot (index 0 - 23)
  const renderSlot = (slotIndex: number) => {
    const channelId = channelOrder[slotIndex];
    if (!channelId) return null;

    const isThisSlotDragging = dragState.isDragging && dragState.sourceIndex === slotIndex;
    const isThisSlotTarget =
      dragState.isDragging &&
      dragState.hoveredIndex === slotIndex &&
      dragState.sourceIndex !== slotIndex;

    const title = getChannelTitle(channelId);

    // If this slot is currently being picked up and dragged, show the empty dock placeholder
    if (isThisSlotDragging) {
      return (
        <div
          key={`slot-${slotIndex}`}
          data-channel-slot-index={slotIndex}
          className="flex flex-col items-center select-none"
        >
          <div className="w-full party-channel-frame aspect-[4/3] rounded-2xl border-2 border-dashed border-[#00a0e9]/70 bg-sky-500/10 flex flex-col items-center justify-center text-[#00a0e9] font-bold text-xs shadow-inner animate-pulse">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider opacity-80">
              Verplaatsen
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-400 mt-1 truncate max-w-full text-center">
            ---
          </span>
        </div>
      );
    }

    return (
      <div
        key={`slot-${slotIndex}-${channelId}`}
        data-channel-slot-index={slotIndex}
        onPointerDown={e => handleTilePointerDown(e, slotIndex, channelId)}
        className="flex flex-col items-center select-none"
      >
        <button
          onClick={() => handleTileClick(channelId)}
          onMouseEnter={handleChannelHover}
          className={`w-full party-channel-frame aspect-[4/3] relative group cursor-pointer overflow-hidden flex items-center justify-center border-2 border-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-150 ${
            isThisSlotTarget
              ? 'ring-4 ring-[#00a0e9] ring-offset-2 ring-offset-white scale-105 shadow-xl'
              : ''
          }`}
          title={channelId.startsWith('NOISE_') ? title : `${title} (Houd ingedrukt om te verplaatsen)`}
        >
          <ChannelVisual
            channelId={channelId}
            pubGolfActive={pubGolfActive}
            slabakkenActive={slabakkenActive}
            onTapNoise={handleNoiseTap}
          />
          <div className="party-channel-sheen" />
        </button>
        <span className="text-xs sm:text-sm font-bold text-[#1e293b] mt-1 truncate max-w-full text-center">
          {title}
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        paddingTop: 'max(1.35rem, calc(1.35rem + env(safe-area-inset-top, 0px)))',
      }}
      className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between select-none party-menu-bg pb-0 overflow-hidden overscroll-none fixed inset-0"
    >
      {/* Main Channel Area with Side Wii Navigation Arrows */}
      <div className="w-full max-w-4xl mx-auto flex-1 px-0.5 sm:px-2 flex items-center justify-between relative overflow-hidden">
        {/* Left Wii Arrow (Disabled & grey on Page 1, Blue on Page 2) */}
        <div className="shrink-0 z-30">
          <WiiPageArrow
            direction="left"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(0)}
            onHover={handleChannelHover}
          />
        </div>

        {/* Channels Grid Viewport (clipped overflow for smooth slide) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="w-full max-w-xl sm:max-w-2xl mx-auto overflow-hidden flex flex-col justify-center px-1 sm:px-2.5 touch-pan-x"
        >
          {/* Active Pub Golf Alert (Shown only when game is in progress) */}
          {pubGolfActive && (
            <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400 text-emerald-800 text-xs font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Pub Golf bezig: Hole {pubGolfHole} ({pubGolfTeamsCount} teams)</span>
              </div>
              <button
                onClick={() => handleChannelClick('PUB_GOLF')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-black active:scale-95 cursor-pointer"
              >
                Hervatten
              </button>
            </div>
          )}

          {/* Sliding Carousel of 2 Pages */}
          <div
            className="w-full flex transition-transform duration-350 ease-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {/* PAGE 1 (Channels slots 0 - 11) */}
            <div className="w-full shrink-0">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-auto py-1">
                {Array.from({ length: 12 }, (_, i) => renderSlot(i))}
              </div>
            </div>

            {/* PAGE 2 (Channels slots 12 - 23) */}
            <div className="w-full shrink-0">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-auto py-1">
                {Array.from({ length: 12 }, (_, i) => renderSlot(12 + i))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Wii Arrow (Blue on Page 1, Disabled & grey on Page 2) */}
        <div className="shrink-0 z-30">
          <WiiPageArrow
            direction="right"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
            onHover={handleChannelHover}
          />
        </div>
      </div>

      {/* Floating Dragged Channel Clone (Tracks Finger/Cursor) */}
      {dragState.isDragging && dragState.channelId && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            left: `${dragState.pointerX}px`,
            top: `${dragState.pointerY}px`,
            width: `${dragTileSizeRef.current.width || 125}px`,
            height: `${dragTileSizeRef.current.height || 94}px`,
          }}
        >
          <div className="w-full h-full scale-105 -rotate-2 rounded-2xl border-3 border-[#00a0e9] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(0,160,233,0.65)] overflow-hidden bg-slate-900 relative">
            <ChannelVisual
              channelId={dragState.channelId}
              pubGolfActive={pubGolfActive}
              slabakkenActive={slabakkenActive}
            />
            <div className="party-channel-sheen" />
          </div>
          <div className="text-center mt-1">
            <span className="text-[11px] font-black text-white px-2 py-0.5 rounded-full bg-slate-950/85 border border-white/20 shadow-lg tracking-wide inline-block">
              {getChannelTitle(dragState.channelId)}
            </span>
          </div>
        </div>
      )}

      {/* 
        Curved Bottom Display Shelf:
        - 24-hour time format (00:00 - 24:00, no AM/PM).
        - Shelf surface under the blue line extends ALL THE WAY to the bottom edge.
        - Cyan curve sweeps high on sides, dips down smoothly in the middle.
        - Date is centered underneath the curve dip.
        - Left: Large circular embossed button with Cyan Volume speaker icon.
        - Right: Large circular embossed button with Slate Mail envelope icon.
      */}
      <footer className="w-full relative mt-auto z-20 select-none pb-0 mb-0">
        <div className="w-full relative overflow-hidden bg-transparent">
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox="0 0 400 95"
              preserveAspectRatio="none"
              className="w-full h-24 sm:h-28 block filter drop-shadow-[0_-3px_10px_rgba(0,0,0,0.06)]"
            >
              <defs>
                <linearGradient id="bottomShelfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                  <stop offset="35%" stopColor="#f8fafc" />
                  <stop offset="70%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#00a0e9" floodOpacity="0.38" />
                </filter>
              </defs>

              <path
                d="M 0,18 
                   C 65,18 95,20 125,36 
                   C 150,50 170,62 200,62 
                   C 230,62 250,50 275,36 
                   C 305,20 335,18 400,18 
                   L 400,95 L 0,95 Z"
                fill="url(#bottomShelfGrad)"
              />

              <path
                d="M 0,18 
                   C 65,18 95,20 125,36 
                   C 150,50 170,62 200,62 
                   C 230,62 250,50 275,36 
                   C 305,20 335,18 400,18"
                fill="none"
                stroke="#00a0e9"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#cyanGlow)"
              />
            </svg>

            {/* Elements Layered Over the Shelf */}
            <div className="absolute inset-0 px-5 sm:px-8 max-w-lg mx-auto flex items-center justify-between">
              {/* Left Circular Embossed Button: Volume Toggle */}
              <div className="flex items-center justify-center translate-y-1 sm:translate-y-2">
                <button
                  onClick={toggleSound}
                  className="w-13 h-13 sm:w-16 sm:h-16 rounded-full party-round-button flex items-center justify-center text-slate-600 active:scale-95 transition-transform cursor-pointer"
                  title={muted ? 'Geluid aanzetten' : 'Geluid dempen'}
                >
                  {muted ? (
                    <VolumeX className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400 stroke-[2.2]" />
                  ) : (
                    <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#00a0e9] stroke-[2.2]" />
                  )}
                </button>
              </div>

              {/* Center Stack: Time above dip, Date below */}
              <div className="flex-1 flex flex-col items-center justify-between h-full py-2 sm:py-2.5 text-center pointer-events-none">
                <div className="flex items-center justify-center pt-1 sm:pt-1.5">
                  <SevenSegmentClock time={currentTime} />
                </div>

                <div className="pb-1 sm:pb-2 translate-y-1 sm:translate-y-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-[#475569] tracking-wider capitalize drop-shadow-2xs">
                    {dateDisplay}
                  </span>
                </div>
              </div>

              {/* Right Circular Embossed Button: Message / Info */}
              <div className="flex items-center justify-center translate-y-1 sm:translate-y-2">
                <button
                  onClick={() => {
                    sounds.playWiiSelect();
                    setShowMessageModal(true);
                  }}
                  className="w-13 h-13 sm:w-16 sm:h-16 rounded-full party-round-button flex items-center justify-center text-slate-600 active:scale-95 transition-transform cursor-pointer"
                  title="Berichten & Info"
                >
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-[#64748b] stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-3 sm:h-4 bg-[#e2e8f0]" />
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 border border-sky-400/30 flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Message & Settings Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 max-w-sm w-full border-2 border-sky-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-800 text-sm">Wii Berichtenbord</h3>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100">
                <p className="font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-sky-600" />
                  Kanalen Verplaatsen
                </p>
                <p className="leading-relaxed">
                  Houd een kanaal ongeveer een halve seconde <strong>ingedrukt</strong> om het op te tillen. Sleep het naar een andere plek op pagina 1 of 2 om de kanalen met elkaar te ruilen!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="font-extrabold text-slate-800 mb-1">
                  🎉 Party Channels
                </p>
                <p className="leading-relaxed">
                  Start Pub Golf of een van de party tools zoals 30 Seconds, Wie is?, Chwazi (Vingeren), dobbelstenen, scorebord of het rad van fortuin. Je voortgang blijft altijd bewaard!
                </p>
              </div>

              {/* Reset Channel Order Button */}
              <button
                onClick={handleResetOrder}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Standaard volgorde herstellen</span>
              </button>
            </div>

            <button
              onClick={() => setShowMessageModal(false)}
              className="w-full py-2.5 rounded-full wii-btn-blue font-black text-xs shadow-md cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
