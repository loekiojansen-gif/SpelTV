import { useState } from 'react';
import { Smartphone, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="wii-btn-green flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-md active:scale-95 transition-transform"
        title="Installeer Pub Golf op je telefoon"
      >
        <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="hidden sm:inline">Installeer App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="wii-btn-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm active:scale-95 transition-transform"
          title="Uitleg: zet op beginscherm"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden sm:inline">Beginscherm</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-3xl wii-modal-card p-6 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl wii-btn-green flex items-center justify-center text-2xl mx-auto shadow-md">
                ⛳
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Pub Golf op je beginscherm
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed text-left bg-sky-50/80 p-3.5 rounded-2xl border border-sky-100">
                1. Tik op de <strong>Deel-knop</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> onderin je Safari browser.<br /><br />
                2. Scroll naar beneden en tik op <strong>'Zet op beginscherm'</strong>.<br /><br />
                3. Tik op <strong>'Voeg toe'</strong>. Het ⛳ icoontje staat nu direct tussen je apps!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="wii-btn-green w-full py-3 rounded-2xl font-black text-sm active:scale-95"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
