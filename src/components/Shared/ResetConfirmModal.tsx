import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  open: boolean;
  gameName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  open,
  gameName,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border-4 border-red-500 rounded-3xl p-5 text-center max-w-sm w-full shadow-2xl text-slate-950 animate-in zoom-in-95">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-950 mb-1">Spel resetten?</h3>
        <p className="text-xs font-semibold text-slate-600 mb-5">
          Weet je zeker dat je het huidige potje {gameName} wilt stoppen?
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
          >
            Annuleren
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black cursor-pointer shadow-md"
          >
            Resetten
          </button>
        </div>
      </div>
    </div>
  );
};
