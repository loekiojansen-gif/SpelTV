import { useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';

export function NoiseVisual({ channelNumber }: { channelNumber: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const w = 48;
    const h = 36;
    canvas.width = w;
    canvas.height = h;

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    let lastTime = 0;
    const render = (time: number) => {
      // Update static at ~18fps for authentic TV jitter without draining CPU
      if (time - lastTime > 55) {
        lastTime = time;
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale TV noise with authentic brightness variation
          const val = 175 + Math.random() * 75;
          data[i] = val; // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
          data[i + 3] = 255; // A
        }
        ctx.putImageData(imgData, 0, 0);
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated TV Static Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover filter contrast-125"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 crt-scanlines opacity-45 z-2 pointer-events-none" />

      {/* Center Channel Watermark */}
      <div className="relative z-6 flex flex-col items-center justify-center pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity">
        <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-800 drop-shadow-xs uppercase">
          CH {channelNumber}
        </span>
        <div className="w-5 h-0.5 bg-slate-700/80 rounded-full mt-0.5" />
      </div>
    </div>
  );
}

interface NoiseChannelProps {
  channelNumber: string;
  label?: string;
  onTap?: () => void;
}

export function NoiseChannel({ channelNumber, label = 'Binnenkort', onTap }: NoiseChannelProps) {
  const handleClick = () => {
    sounds.playTick(300);
    if (onTap) onTap();
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        className="w-full party-channel-frame aspect-[4/3] flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden border-2 border-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] bg-slate-900"
        title={`Kanaal ${channelNumber} - Binnenkort`}
      >
        <NoiseVisual channelNumber={channelNumber} />
        <div className="party-channel-sheen" />
      </button>

      {/* Label Underneath */}
      <span className="text-xs sm:text-sm font-bold text-[#1e293b] mt-1 truncate max-w-full text-center select-none">
        {label}
      </span>
    </div>
  );
}
