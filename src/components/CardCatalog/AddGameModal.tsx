import React, { useState } from 'react';
import { CardGame, CardMeaning } from './types';
import { X, Plus, Trash2, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: CardGame) => void;
  initialGame?: CardGame | null;
}

const EMOJI_OPTIONS = ['🍺', '🃏', '🎲', '👑', '⚡', '💣', '⚔️', '🏛️', '🔥', '🏆', '🎯', '💥', '👀', '🎱', '🎪'];
const COLOR_OPTIONS: { id: CardGame['coverColor']; label: string; bg: string }[] = [
  { id: 'burgundy', label: 'Bordeaux', bg: 'bg-[#5b141b]' },
  { id: 'emerald', label: 'Smaragd', bg: 'bg-[#064e3b]' },
  { id: 'sapphire', label: 'Saffier', bg: 'bg-[#1e3a8a]' },
  { id: 'amber', label: 'Amber', bg: 'bg-[#78350f]' },
  { id: 'amethyst', label: 'Amethist', bg: 'bg-[#4c1d95]' },
  { id: 'espresso', label: 'Espresso', bg: 'bg-[#291811]' },
  { id: 'crimson', label: 'Crimson', bg: 'bg-[#881337]' },
];

export const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose, onSave, initialGame }) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<CardGame['category']>('kaarten');
  const [requiredInput, setRequiredInput] = useState('');
  const [players, setPlayers] = useState('3 - 8 spelers');
  const [intensity, setIntensity] = useState(3);
  const [duration, setDuration] = useState('20 - 30 min');
  const [description, setDescription] = useState('');
  const [iconEmoji, setIconEmoji] = useState('🍺');
  const [coverColor, setCoverColor] = useState<CardGame['coverColor']>('burgundy');
  const [cardMeanings, setCardMeanings] = useState<CardMeaning[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newAction, setNewAction] = useState('');

  // Sync state whenever modal opens or initialGame changes
  React.useEffect(() => {
    if (initialGame) {
      setTitle(initialGame.title || '');
      setSubtitle(initialGame.subtitle || '');
      setCategory(initialGame.category || 'kaarten');
      setRequiredInput((initialGame.required || []).join(', '));
      setPlayers(initialGame.players || '3 - 8 spelers');
      setIntensity(initialGame.intensity || 3);
      setDuration(initialGame.durationMinutes || '20 - 30 min');
      setDescription(initialGame.description || '');
      setIconEmoji(initialGame.iconEmoji || '🍺');
      setCoverColor(initialGame.coverColor || 'burgundy');
      setCardMeanings(initialGame.cardMeanings || []);
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('kaarten');
      setRequiredInput('');
      setPlayers('3 - 8 spelers');
      setIntensity(3);
      setDuration('20 - 30 min');
      setDescription('');
      setIconEmoji('🍺');
      setCoverColor('burgundy');
      setCardMeanings([]);
    }
    setNewKey('');
    setNewAction('');
  }, [initialGame, isOpen]);

  if (!isOpen) return null;

  const handleAddCardMeaning = () => {
    if (!newKey.trim() || !newAction.trim()) return;
    setCardMeanings([...cardMeanings, { key: newKey.trim(), action: newAction.trim() }]);
    setNewKey('');
    setNewAction('');
    sounds.playTick(700);
  };

  const handleRemoveCardMeaning = (index: number) => {
    setCardMeanings(cardMeanings.filter((_, i) => i !== index));
    sounds.playTick(450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      // Melding in het venster zelf: een alert() wordt niet getoond als de app in een frame draait
      setFormError('Vul minimaal de titel en spelregels in!');
      sounds.playTick(300);
      return;
    }
    setFormError(null);

    const requiredList = requiredInput
      .split(',')
      .map(r => r.trim())
      .filter(Boolean);

    const savedGame: CardGame = {
      ...(initialGame || {}),
      id: initialGame ? initialGame.id : `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subtitle: subtitle.trim() || (initialGame ? initialGame.subtitle : 'Zelfgemaakt feestspel'),
      category,
      required: requiredList.length > 0 ? requiredList : ['Stok kaarten', 'Bier of drank naar keuze'],
      players: players.trim() || '3 - 8 spelers',
      intensity,
      durationMinutes: duration.trim() || '15 - 30 min',
      description: description.trim(),
      cardMeanings: cardMeanings.length > 0 ? cardMeanings : undefined,
      coverColor,
      iconEmoji,
      isCustom: true,
      createdAt: initialGame?.createdAt || Date.now(),
    };

    sounds.playReveal();
    onSave(savedGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{initialGame ? '✏️' : '✨'}</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {initialGame ? 'Spel Aanpassen' : 'Nieuw Spel Toevoegen'}
              </h2>
              <p className="text-xs text-amber-100">
                {initialGame ? 'Pas spelregels, kaartbetekenissen en benodigdheden aan' : 'Voeg je eigen drankspel toe aan de boekenkast'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTick(500);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-slate-700">
          {/* Titel & Ondertitel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Speltitel *
              </label>
              <input
                type="text"
                required
                placeholder="bijv. Bierbal of Klokje Rond"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Korte samenvatting / ondertitel
              </label>
              <input
                type="text"
                placeholder="bijv. Wie gooit drinkt, wie mist zuipt dubbel"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Categorie, Spelers, Intensiteit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Categorie</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CardGame['category'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-semibold"
              >
                <option value="kaarten">🃏 Kaarten</option>
                <option value="dobbelstenen">🎲 Dobbelstenen</option>
                <option value="muziek">🎵 Muziek</option>
                <option value="party">🎉 Party / Fysiek</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Spelers</label>
              <input
                type="text"
                placeholder="3 - 8 spelers"
                value={players}
                onChange={e => setPlayers(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Intensiteit ({intensity}/5 biertjes)
              </label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setIntensity(val)}
                    className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-transform ${
                      intensity >= val ? 'bg-amber-100 border border-amber-300 scale-105' : 'opacity-40 grayscale'
                    }`}
                  >
                    🍺
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Benodigdheden */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Benodigdheden (gescheiden door komma's)
            </label>
            <input
              type="text"
              placeholder="bijv. Stok kaarten, Tafel, Bierflesje in het midden"
              value={requiredInput}
              onChange={e => setRequiredInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Visual Customization: Emoji & Boekkleur */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Kies een Boek-icoon
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIconEmoji(em)}
                    className={`w-8 h-8 rounded-xl text-base flex items-center justify-center cursor-pointer transition-transform ${
                      iconEmoji === em ? 'bg-white shadow-md border-2 border-amber-500 scale-110' : 'hover:bg-white/80'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Kies Kleur van de Boekomslag
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCoverColor(c.id)}
                    className={`h-7 px-3 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all ${c.bg} ${
                      coverColor === c.id ? 'ring-3 ring-amber-400 scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Spelregels & Omschrijving */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Spelregels & Uitleg *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Leg duidelijk uit hoe het spel gespeeld wordt, wie wanneer moet drinken en hoe je wint of verliest..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Optioneel: Kaartbetekenissen */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Optioneel: Kaartbetekenissen of Worpen toevoegen
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Kaart/Worp (bijv. 7 of Mex)"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                className="w-1/3 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
              <input
                type="text"
                placeholder="Actie (bijv. Juffen of Shotje)"
                value={newAction}
                onChange={e => setNewAction(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCardMeaning}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Voeg toe
              </button>
            </div>

            {cardMeanings.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {cardMeanings.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm">
                        {m.key}
                      </span>
                      <span className="font-medium text-slate-800">{m.action}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCardMeaning(idx)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                sounds.playTick(500);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              Annuleren
            </button>
            {formError && (
              <span role="alert" className="text-[11px] font-bold text-red-600 mr-auto ml-2">
                {formError}
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {initialGame ? 'Wijzigingen Opslaan' : 'Spel Opslaan in Boekenkast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
