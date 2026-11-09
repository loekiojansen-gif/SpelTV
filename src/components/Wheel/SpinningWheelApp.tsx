import { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { WheelSlice } from '../../types';
import {
  SlidersHorizontal,
  Share2,
  BookmarkPlus,
  Trash2,
  Copy,
  Check,
  QrCode,
  X,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import {
  loadSavedWheels,
  saveCustomWheel,
  deleteSavedWheel,
  generateWheelShareUrl,
  generateWheelQRCode,
  checkForSharedWheelInUrl,
  clearWheelParamFromUrl,
  SavedWheel,
} from '../../utils/wheelSharing';

const PRESET_COLORS = [
  '#dc2626', // circus red
  '#ffffff', // white
];

const PRESETS: Record<string, string[]> = {
  drankjes: [
    '1 Slok',
    '2 Slokken',
    'Deel 3 slokken uit',
    'Shotje nemen!',
    'Water pauze 💧',
    'Ad Fundum 🍺',
    'Iedereen 1 slok',
    'Geen straf! 🌟',
  ],
  uitdagingen: [
    'Zing een refrein 🎤',
    'Doe 10 pushups 💪',
    'Vertel een geheim 🤫',
    'Ruil van drankje 🔄',
    'Imiteer iemand 🎭',
    'Dans voor 20 sec 💃',
    'Fluister 1 ronde 🤐',
  ],
  wiebetaalt: [
    'Jij betaalt! 💸',
    'Degene links van je',
    'Degene rechts van je',
    'Ieder voor zich',
    'De jongste aan tafel',
    'De oudste aan tafel',
  ],
  snellekeuze: ['Ja!', 'Zeker niet ❌', 'Misschien 🤔', 'Draai opnieuw 🔄', '100% Zeker ✨'],
};

const CURRENT_WHEEL_STORAGE_KEY = 'party_channels_wheel_active_state';

interface ActiveWheelState {
  title: string;
  slices: WheelSlice[];
  rotationAngle?: number;
}

export function SpinningWheelApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load persisted wheel title or default
  const [wheelTitle, setWheelTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_WHEEL_STORAGE_KEY);
      if (saved) {
        const parsed: ActiveWheelState = JSON.parse(saved);
        if (parsed.title) return parsed.title;
      }
    } catch (e) {
      console.error('Failed to load active wheel state:', e);
    }
    return 'Party Rad';
  });

  // Load persisted slices or default
  const [slices, setSlices] = useState<WheelSlice[]>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_WHEEL_STORAGE_KEY);
      if (saved) {
        const parsed: ActiveWheelState = JSON.parse(saved);
        if (Array.isArray(parsed.slices) && parsed.slices.length >= 2) {
          return parsed.slices;
        }
      }
    } catch (e) {
      console.error('Failed to load active wheel state:', e);
    }
    return PRESETS.drankjes.map((text, idx) => ({
      id: `${idx}-${Date.now()}`,
      text,
      color: PRESET_COLORS[idx % PRESET_COLORS.length],
    }));
  });

  const [newSliceText, setNewSliceText] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winnerSlice, setWinnerSlice] = useState<WheelSlice | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);

  // Saving and Sharing state
  const [savedWheels, setSavedWheels] = useState<SavedWheel[]>(() => loadSavedWheels());
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveWheelNameInput, setSaveWheelNameInput] = useState<string>('');
  const [deleteConfirmWheel, setDeleteConfirmWheel] = useState<{ id: string; name: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Wheel physics state held in refs for 60fps canvas loop
  const rotationAngleRef = useRef<number>(0);
  const angularVelocityRef = useRef<number>(0);
  const lastTickIndexRef = useRef<number>(-1);
  const animationFrameRef = useRef<number | null>(null);

  // Persist current active wheel state to localStorage
  useEffect(() => {
    try {
      const state: ActiveWheelState = {
        title: wheelTitle,
        slices,
        rotationAngle: rotationAngleRef.current,
      };
      localStorage.setItem(CURRENT_WHEEL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist wheel state:', e);
    }
  }, [wheelTitle, slices]);

  // Check on mount for incoming shared wheel via URL ?wheel=...
  useEffect(() => {
    const incoming = checkForSharedWheelInUrl();
    if (incoming) {
      setWheelTitle(incoming.name);
      setSlices(
        incoming.slices.map((text, idx) => ({
          id: `shared-${idx}-${Date.now()}`,
          text,
          color: PRESET_COLORS[idx % PRESET_COLORS.length],
        }))
      );
      sounds.playReveal();
      showToast(`Gedeeld rad "${incoming.name}" geladen!`);
      clearWheelParamFromUrl();
    }
  }, []);

  // Draw the wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 16;

    ctx.clearRect(0, 0, width, height);

    if (slices.length === 0) return;

    const sliceAngle = (2 * Math.PI) / slices.length;
    const currentRot = rotationAngleRef.current;

    // Draw slices
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRot);

    slices.forEach((slice, idx) => {
      const startAngle = idx * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const isRed = idx % 2 === 0;
      const sliceFill = isRed ? '#dc2626' : '#ffffff';
      const textFill = isRed ? '#ffffff' : '#b91c1c';

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Slice fill
      ctx.fillStyle = sliceFill;
      ctx.fill();

      // Slice divider line
      ctx.strokeStyle = isRed ? '#fca5a5' : '#b91c1c';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textFill;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.shadowColor = isRed ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = 3;

      // Truncate long slice text
      let displayText = slice.text;
      if (displayText.length > 17) {
        displayText = displayText.slice(0, 15) + '..';
      }
      ctx.fillText(displayText, radius - 20, 0);
      ctx.restore();
    });

    // Outer wheel gold border ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Subtle outer shadow line
    ctx.beginPath();
    ctx.arc(0, 0, radius + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Center Hub (Pin)
    ctx.save();
    ctx.translate(centerX, centerY);

    // Hub Outer white ring
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.fill();

    // Hub Center silver gradient
    const hubGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 22);
    hubGrad.addColorStop(0, '#ffffff');
    hubGrad.addColorStop(0.5, '#f1f5f9');
    hubGrad.addColorStop(1, '#cbd5e1');
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Gold Pin
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }, [slices]);

  // Redraw whenever slices change
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Spin animation frame loop with authentic deceleration physics
  const spinLoop = () => {
    const vel = angularVelocityRef.current;
    if (vel > 0.001) {
      rotationAngleRef.current += vel;

      // Friction: smooth exponential decay
      angularVelocityRef.current *= 0.984;

      // Audio click when passing needle
      if (slices.length > 0) {
        const sliceAngle = (2 * Math.PI) / slices.length;
        // Pointer is at TOP: 3*PI/2 (270 deg)
        const pointerAngle = (3 * Math.PI) / 2;
        let effectiveAngle = (pointerAngle - rotationAngleRef.current) % (2 * Math.PI);
        if (effectiveAngle < 0) effectiveAngle += 2 * Math.PI;

        const currentSliceIndex = Math.floor(effectiveAngle / sliceAngle) % slices.length;
        if (currentSliceIndex !== lastTickIndexRef.current) {
          lastTickIndexRef.current = currentSliceIndex;
          sounds.playWheelTick();
        }
      }

      drawWheel();
      animationFrameRef.current = requestAnimationFrame(spinLoop);
    } else {
      // Stopped spinning
      angularVelocityRef.current = 0;
      setIsSpinning(false);

      if (slices.length > 0) {
        const sliceAngle = (2 * Math.PI) / slices.length;
        const pointerAngle = (3 * Math.PI) / 2;
        let effectiveAngle = (pointerAngle - rotationAngleRef.current) % (2 * Math.PI);
        if (effectiveAngle < 0) effectiveAngle += 2 * Math.PI;

        const winIndex = Math.floor(effectiveAngle / sliceAngle) % slices.length;
        const winner = slices[winIndex];
        setWinnerSlice(winner);

        // Celebration
        sounds.playWheelStop();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // Trigger Spin
  const handleSpin = () => {
    if (isSpinning || slices.length < 2) return;

    setIsSpinning(true);
    setWinnerSlice(null);
    sounds.playWiiSelect();

    // Initial random angular velocity
    angularVelocityRef.current = 0.28 + Math.random() * 0.22;

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(spinLoop);
  };

  // Add slice
  const handleAddSlice = () => {
    const trimmed = newSliceText.trim();
    if (!trimmed) return;
    const newSlice: WheelSlice = {
      id: Date.now().toString(),
      text: trimmed,
      color: PRESET_COLORS[slices.length % PRESET_COLORS.length],
    };
    setSlices(prev => [...prev, newSlice]);
    setNewSliceText('');
    sounds.playTick(700);
  };

  // Remove slice
  const handleRemoveSlice = (id: string) => {
    if (slices.length <= 2) return;
    setSlices(prev => prev.filter(s => s.id !== id));
    sounds.playTick(500);
  };

  // Load preset
  const handleApplyPreset = (key: keyof typeof PRESETS) => {
    const list = PRESETS[key];
    const newSlices = list.map((text, idx) => ({
      id: `${key}-${idx}-${Date.now()}`,
      text,
      color: PRESET_COLORS[idx % PRESET_COLORS.length],
    }));
    setSlices(newSlices);
    setWinnerSlice(null);
    sounds.playWiiSelect();
  };

  // Winner Action: Remove from wheel
  const handleRemoveWinnerSlice = () => {
    if (winnerSlice && slices.length > 2) {
      setSlices(prev => prev.filter(s => s.id !== winnerSlice.id));
      sounds.playTick(500);
      showToast(`"${winnerSlice.text}" verwijderd van het rad`);
    }
    setWinnerSlice(null);
  };

  // Winner Action: Keep on wheel
  const handleKeepWinnerSlice = () => {
    setWinnerSlice(null);
    sounds.playTick(750);
  };

  // Open Save Wheel In-App Modal (Works 100% on desktop & mobile without window.prompt)
  const handleOpenSaveModal = () => {
    setSaveWheelNameInput(wheelTitle || 'Mijn Rad');
    setShowSaveModal(true);
    sounds.playTick(700);
  };

  // Confirm Save Wheel from Modal
  const handleConfirmSaveWheel = () => {
    const trimmed = saveWheelNameInput.trim() || 'Mijn Rad';
    const texts = slices.map(s => s.text);
    saveCustomWheel(trimmed, texts);
    setWheelTitle(trimmed);
    setSavedWheels(loadSavedWheels());
    setShowSaveModal(false);
    sounds.playWiiSelect();
    showToast(`Rad "${trimmed}" opgeslagen!`);
  };

  // Load saved wheel
  const handleLoadSavedWheel = (saved: SavedWheel) => {
    setWheelTitle(saved.name);
    setSlices(
      saved.slices.map((text, idx) => ({
        id: `saved-${idx}-${Date.now()}`,
        text,
        color: PRESET_COLORS[idx % PRESET_COLORS.length],
      }))
    );
    setWinnerSlice(null);
    sounds.playWiiSelect();
    showToast(`Rad "${saved.name}" geopend`);
  };

  // Confirm delete saved wheel
  const handleConfirmDeleteSavedWheel = () => {
    if (!deleteConfirmWheel) return;
    const remaining = deleteSavedWheel(deleteConfirmWheel.id);
    setSavedWheels(remaining);
    setDeleteConfirmWheel(null);
    sounds.playTick(500);
    showToast('Rad verwijderd');
  };

  // Open Share Modal
  const handleOpenShare = async () => {
    const url = generateWheelShareUrl(wheelTitle, slices.map(s => s.text));
    setShareUrl(url);
    setShowShareModal(true);
    setCopiedLink(false);

    try {
      const qr = await generateWheelQRCode(wheelTitle, slices.map(s => s.text));
      setQrCodeDataUrl(qr);
    } catch (err) {
      console.error('Failed to generate QR:', err);
    }
  };

  // Copy share URL to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    sounds.playTick(800);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto px-4 pb-12 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Title & Preset Bar - Circus Red, Gold & Black Theme */}
      <div className="w-full rounded-3xl p-3.5 sm:p-5 mb-4 bg-[#140609]/95 border-2 border-amber-500 shadow-2xl backdrop-blur-md text-amber-50">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {wheelTitle && wheelTitle !== 'Party Rad' ? (
              <h2 className="font-black text-amber-400 text-lg sm:text-xl tracking-tight">
                {wheelTitle}
              </h2>
            ) : (
              <span className="text-xs font-black text-amber-300/80 uppercase tracking-widest">
                Kies een optie of draai direct
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Share Wheel Button */}
            <button
              onClick={handleOpenShare}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer bg-[#3b0b12] hover:bg-[#520f1a] text-amber-200 border border-amber-500/50 transition-all"
              title="Deel dit rad met vrienden"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Delen</span>
            </button>

            {/* Save Wheel Button */}
            <button
              onClick={handleOpenSaveModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 border border-amber-200 transition-all"
              title="Sla dit rad op"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Opslaan</span>
            </button>

            {/* Edit Slices Button */}
            <button
              onClick={() => setShowEditor(prev => !prev)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer bg-black/60 hover:bg-black/80 text-amber-100 border border-amber-500/50 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
              <span>{showEditor ? 'Sluit' : 'Aanpassen'}</span>
            </button>
          </div>
        </div>

        {/* Preset Chips & Saved Wheels */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-amber-400/70 mr-1 shrink-0 uppercase tracking-wider">
            Thema&apos;s:
          </span>
          <button
            onClick={() => handleApplyPreset('drankjes')}
            className="px-2.5 py-1 rounded-xl bg-[#7f1d1d] hover:bg-[#991b1b] text-amber-100 border border-amber-500/40 text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            🍺 Drankjes
          </button>
          <button
            onClick={() => handleApplyPreset('uitdagingen')}
            className="px-2.5 py-1 rounded-xl bg-[#7f1d1d] hover:bg-[#991b1b] text-amber-100 border border-amber-500/40 text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            🎭 Uitdagingen
          </button>
          <button
            onClick={() => handleApplyPreset('wiebetaalt')}
            className="px-2.5 py-1 rounded-xl bg-[#7f1d1d] hover:bg-[#991b1b] text-amber-100 border border-amber-500/40 text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            💸 Wie Betaalt?
          </button>
          <button
            onClick={() => handleApplyPreset('snellekeuze')}
            className="px-2.5 py-1 rounded-xl bg-[#7f1d1d] hover:bg-[#991b1b] text-amber-100 border border-amber-500/40 text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            ✨ Ja / Nee
          </button>
        </div>

        {/* Saved Wheels Quick Selector */}
        {savedWheels.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 mt-2">
            <span className="text-[11px] font-bold text-amber-600 mr-1 shrink-0">
              Mijn Raden:
            </span>
            {savedWheels.map(saved => (
              <div
                key={saved.id}
                className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-2 py-0.5 text-xs font-bold text-amber-900 shrink-0"
              >
                <button
                  onClick={() => handleLoadSavedWheel(saved)}
                  className="hover:underline cursor-pointer"
                >
                  {saved.name} ({saved.slices.length})
                </button>
                <button
                  onClick={() => setDeleteConfirmWheel({ id: saved.id, name: saved.name })}
                  className="text-amber-400 hover:text-rose-500 ml-1 cursor-pointer"
                  title="Verwijder"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Slice Editor Panel Collapse */}
        {showEditor && (
          <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newSliceText}
                onChange={e => setNewSliceText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSlice()}
                placeholder="Voeg optie toe aan het rad..."
                className="flex-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 outline-none"
              />
              <button
                onClick={handleAddSlice}
                className="px-3 py-1.5 rounded-xl wii-btn-green text-xs font-bold shrink-0 cursor-pointer"
              >
                + Toevoegen
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {slices.map(slice => (
                <div
                  key={slice.id}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-slate-800">{slice.text}</span>
                  {slices.length > 2 && (
                    <button
                      onClick={() => handleRemoveSlice(slice.id)}
                      className="text-slate-300 hover:text-rose-500 ml-1 cursor-pointer font-black"
                      title="Verwijder vakje"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Wheel Canvas Arena */}
      <div className="relative flex flex-col items-center justify-center p-4">
        {/* Needle / Pointer at Top */}
        <div
          className="absolute top-2 z-20 flex flex-col items-center pointer-events-none"
          style={{ transform: 'translateY(-6px)' }}
        >
          {/* Triangular pointer */}
          <div
            className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-rose-600 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
          />
          <div className="w-4 h-4 rounded-full bg-white border-2 border-rose-600 -mt-7 shadow-xs" />
        </div>

        {/* Canvas Element with interactive tap-to-spin */}
        <div
          onClick={handleSpin}
          className="w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] rounded-full p-2 bg-gradient-to-b from-white via-slate-100 to-slate-200 border-4 border-white shadow-2xl flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform group"
          title="Klik op het rad om te draaien"
        >
          <canvas
            ref={canvasRef}
            width={344}
            height={344}
            className="w-full h-full rounded-full pointer-events-none"
          />
        </div>
      </div>

      {/* Winner Modal with Option to Remove or Keep Slice */}
      {winnerSlice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-6 text-center border-4 border-sky-300 shadow-2xl max-w-sm w-full">
            <div
              className="w-20 h-20 rounded-full border-2 border-white mx-auto flex items-center justify-center text-4xl shadow-lg mb-3"
              style={{ backgroundColor: winnerSlice.color }}
            >
              🎉
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-sky-700 block">
              Het Rad Heeft Beslist!
            </span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 mb-2">
              {winnerSlice.text}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-5">
              Wat wil je doen met dit vakje voor de volgende rondes?
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {/* Keep on wheel button */}
                <button
                  onClick={handleKeepWinnerSlice}
                  className="flex-1 py-2.5 rounded-2xl wii-btn-white font-extrabold text-xs shadow-xs cursor-pointer"
                >
                  Behouden
                </button>

                {/* Remove from wheel button */}
                <button
                  onClick={handleRemoveWinnerSlice}
                  disabled={slices.length <= 2}
                  className={`flex-1 py-2.5 rounded-2xl font-extrabold text-xs shadow-xs cursor-pointer transition-all ${
                    slices.length > 2
                      ? 'bg-rose-500 hover:bg-rose-600 text-white border border-rose-400'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title={slices.length <= 2 ? 'Minimaal 2 vakjes nodig' : 'Verwijder van rad'}
                >
                  Verwijder van rad
                </button>
              </div>

              {/* Spin again shortcut */}
              <button
                onClick={() => {
                  setWinnerSlice(null);
                  handleSpin();
                }}
                className="w-full py-2.5 rounded-2xl wii-btn-green font-extrabold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nog eens draaien</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Custom Wheel Modal (Works 100% on desktop & mobile without window.prompt) */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 sm:p-6 max-w-sm w-full border-4 border-amber-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-800 text-base sm:text-lg">
                  Rad Opslaan
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4">
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                Naam van je rad:
              </label>
              <input
                type="text"
                value={saveWheelNameInput}
                onChange={e => setSaveWheelNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirmSaveWheel()}
                placeholder="Bijv. Vrijdagborrel Rad..."
                className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 outline-none shadow-inner"
                autoFocus
              />
              <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                Dit rad bevat {slices.length} vakjes en wordt bewaard in je browser.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2.5 rounded-full wii-btn-white font-extrabold text-xs shadow-xs cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmSaveWheel}
                className="flex-1 py-2.5 rounded-full wii-btn-yellow font-extrabold text-xs shadow-md cursor-pointer"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Saved Wheel Confirmation Modal */}
      {deleteConfirmWheel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 sm:p-6 text-center border-4 border-rose-300 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-2.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1">
              Rad Verwijderen?
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-4">
              Weet je zeker dat je "{deleteConfirmWheel.name}" wilt verwijderen uit je opgeslagen raden?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmWheel(null)}
                className="flex-1 py-2 rounded-full wii-btn-white font-extrabold text-xs shadow-xs cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmDeleteSavedWheel}
                className="flex-1 py-2 rounded-full wii-btn-red font-extrabold text-xs shadow-md cursor-pointer"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal with QR code and Copy Link */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="wii-card rounded-3xl p-5 sm:p-6 max-w-sm w-full border-4 border-sky-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-black text-slate-800 text-base sm:text-lg">
                  Rad Delen
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-center">
              <p className="text-xs font-bold text-slate-600 mb-3">
                Deel "{wheelTitle}" ({slices.length} vakjes) via QR-code of directe link:
              </p>

              {/* QR Code */}
              {qrCodeDataUrl ? (
                <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 inline-block shadow-md mb-3">
                  <img
                    src={qrCodeDataUrl}
                    alt="Rad QR Code"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">
                    Scan met camera om rad te openen
                  </span>
                </div>
              ) : (
                <div className="w-44 h-44 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                </div>
              )}

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-full wii-btn-blue font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Link Gekopieerd!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopieer Deellink</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 rounded-full wii-btn-white font-bold text-xs cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
