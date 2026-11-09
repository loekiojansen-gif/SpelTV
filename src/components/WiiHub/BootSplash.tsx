import { useEffect, useState } from 'react';
import { Tv } from 'lucide-react';

const SESSION_KEY = 'party_channels_boot_splash_shown';
const COLOR_BARS = ['#f8fafc', '#fde047', '#22d3ee', '#4ade80', '#e879f9', '#f87171', '#3b82f6'];

function shouldShowSplash(): boolean {
  try {
    // Gedeelde links (route of rad) openen meteen het juiste scherm, zonder intro
    const params = new URLSearchParams(window.location.search);
    if (params.has('route') || params.has('wheel')) return false;
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  } catch {
    return false;
  }
}

/**
 * Korte opstartanimatie: een beeldbuis die aanspringt met het Spel TV logo.
 * Wordt één keer per sessie getoond en is met een tik over te slaan.
 */
export function BootSplash() {
  const [visible, setVisible] = useState<boolean>(shouldShowSplash);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Zonder sessionStorage tonen we de intro gewoon elke keer
    }
    const timer = window.setTimeout(() => setVisible(false), 1650);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="boot-splash fixed inset-0 z-[70] bg-[#05070d] flex items-center justify-center cursor-pointer select-none"
      onClick={() => setVisible(false)}
      role="presentation"
    >
      <div className="boot-splash-screen absolute inset-0 party-menu-bg flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 crt-scanlines opacity-10" />
        <div className="boot-splash-logo relative flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-16 h-16 rounded-3xl bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(2,132,199,0.45)] border-2 border-white">
              <Tv className="w-9 h-9 stroke-[2.4]" />
            </span>
            <span className="text-5xl font-black tracking-tight text-slate-800 leading-none">
              SPEL<span className="text-[#00a0e9]">TV</span>
            </span>
          </div>
          <div className="flex h-2.5 w-56 rounded-full overflow-hidden shadow-inner border border-white">
            {COLOR_BARS.map(color => (
              <span key={color} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
            Party Channels
          </span>
        </div>
      </div>
    </div>
  );
}
