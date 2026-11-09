import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Home, Package, Play, Users } from 'lucide-react';
import { SubAppId } from '../../types';
import { GAME_RULES } from '../Navigation/gameRules';
import { ChannelVisual, getChannelTitle } from './ChannelVisual';
import { CHANNEL_META } from './channelMeta';

/** Breedte waarop het kanaal-artwork ontworpen is; daarboven schalen we het mee. */
export const CHANNEL_ART_BASE_WIDTH = 105;

interface ChannelPreviewProps {
  channelId: SubAppId;
  /** Positie van de aangetikte tegel, zodat de voorvertoning daaruit "opent" */
  originRect: DOMRect | null;
  showNewBadge?: boolean;
  pubGolfActive?: boolean;
  slabakkenActive?: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function ChannelPreview({
  channelId,
  originRect,
  showNewBadge = false,
  pubGolfActive = false,
  slabakkenActive = false,
  onClose,
  onStart,
}: ChannelPreviewProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [artZoom, setArtZoom] = useState(2.6);
  const [launching, setLaunching] = useState(false);

  const meta = CHANNEL_META[channelId];
  const rules = GAME_RULES[channelId];
  const title = rules?.title ?? getChannelTitle(channelId);
  const accent = meta?.accent ?? '#0284c7';

  // Schaal het artwork mee met de grootte van het voorvertoningsscherm
  useLayoutEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const measure = () => setArtZoom(Math.max(1, el.clientWidth / CHANNEL_ART_BASE_WIDTH));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const launchedRef = useRef(false);
  const onStartRef = useRef(onStart);
  const onCloseRef = useRef(onClose);
  onStartRef.current = onStart;
  onCloseRef.current = onClose;

  const handleStart = () => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    setLaunching(true);
    window.setTimeout(() => onStartRef.current(), 360);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !launchedRef.current) onCloseRef.current();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // De voorvertoning groeit vanuit het midden van de aangetikte tegel
  const origin = originRect
    ? `${originRect.left + originRect.width / 2}px ${originRect.top + originRect.height / 2}px`
    : '50% 50%';

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Voorvertoning ${title}`}
    >
      {/* Vervaagde menu-achtergrond; tik ernaast om terug te gaan */}
      <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-md" onClick={onClose} />

      <motion.div
        className="relative w-full h-full max-w-md md:max-w-4xl mx-auto px-4 pt-4 pb-4 flex flex-col md:flex-row md:items-center md:gap-8 pointer-events-none"
        style={{
          transformOrigin: origin,
          paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        }}
        initial={{ scale: 0.25, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.25, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        {/* Het grote "televisiescherm" met het kanaal-artwork */}
        <div className="shrink-0 md:flex-1 flex items-center justify-center pointer-events-auto">
          <motion.div
            ref={screenRef}
            className="relative aspect-[4/3] w-[min(100%,calc(38dvh*4/3))] md:w-[min(100%,calc(70dvh*4/3))] rounded-[1.75rem] overflow-hidden bg-slate-900 border-[3px] border-white"
            style={{
              boxShadow: `0 18px 40px -8px ${accent}66, 0 0 0 3px ${accent}`,
            }}
            animate={launching ? { scale: 3.2, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.36, ease: [0.5, 0, 0.9, 0.4] }}
          >
            <div className="absolute inset-0" style={{ zoom: artZoom }}>
              <ChannelVisual
                channelId={channelId}
                pubGolfActive={pubGolfActive}
                slabakkenActive={slabakkenActive}
              />
            </div>
            <div className="absolute inset-0 crt-scanlines opacity-15 z-10" />
            <div className="party-channel-sheen !rounded-t-[1.6rem]" />
            {showNewBadge && (
              <span className="hub-new-badge absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                Nieuw
              </span>
            )}
          </motion.div>
        </div>

        {/* Uitleg van het kanaal */}
        <motion.div
          className="flex-1 min-h-0 md:max-h-full flex flex-col mt-4 md:mt-0 pointer-events-auto"
          animate={launching ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-3xl shrink-0 drop-shadow-sm">{rules?.emoji}</span>
            <div className="min-w-0">
              <span
                className="text-[10px] font-black uppercase tracking-widest block"
                style={{ color: accent }}
              >
                {meta?.kind ?? 'Kanaal'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight truncate">
                {title}
              </h2>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-600 mt-2 leading-snug">{rules?.summary}</p>

          {meta && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border-2 border-slate-200 text-xs font-black text-slate-700 shadow-xs">
                <Users className="w-3.5 h-3.5" style={{ color: accent }} />
                {meta.players} spelers
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border-2 border-slate-200 text-xs font-black text-slate-700 shadow-xs">
                <Clock className="w-3.5 h-3.5" style={{ color: accent }} />
                {meta.duration}
              </span>
              {meta.needs && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border-2 border-slate-200 text-xs font-black text-slate-700 shadow-xs">
                  <Package className="w-3.5 h-3.5" style={{ color: accent }} />
                  {meta.needs}
                </span>
              )}
            </div>
          )}

          {/* Korte spelregels; scrollt als het niet past */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-3 space-y-1.5 pr-0.5">
            {rules?.rules.slice(0, 4).map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-xl bg-white/85 border border-slate-200 text-xs text-slate-700"
              >
                <span
                  className="w-4.5 h-4.5 rounded-full text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-px"
                  style={{ backgroundColor: accent }}
                >
                  {idx + 1}
                </span>
                <span className="font-semibold leading-snug">{rule}</span>
              </div>
            ))}
          </div>

          {/* Menu / Start knoppen, net als bij een echt kanalenmenu */}
          <div className="flex items-center gap-2.5 pt-3 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-full wii-btn-white font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <button
              onClick={handleStart}
              autoFocus
              className="flex-[1.6] py-3.5 rounded-full wii-btn-blue font-black text-base flex items-center justify-center gap-1.5 cursor-pointer outline-none"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start</span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Scherm flitst wit op bij het starten */}
      {launching && (
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.34, ease: 'easeIn' }}
        />
      )}
    </motion.div>
  );
}
