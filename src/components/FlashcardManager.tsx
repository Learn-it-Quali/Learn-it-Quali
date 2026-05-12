import { useState } from 'react';
import { FlashcardDeck, Flashcard, SUBJECTS } from '../types';
import { generateId } from '../store';
import { Plus, Trash2, Edit3, Play, BookOpen, Check, RotateCcw, Shuffle, ChevronRight, ChevronLeft, Star } from 'lucide-react';

const defaultCard = (): Flashcard => ({ id: generateId(), front: '', back: '', mastered: false, difficulty: 2, nextReview: 0, reviewCount: 0 });

// ==================== DECK LIST ====================
interface DeckListProps { decks: FlashcardDeck[]; onStudy: (deck: FlashcardDeck) => void; onMatch: (deck: FlashcardDeck) => void; onEdit: (deck: FlashcardDeck) => void; onDelete: (id: string) => void; onCreate: () => void; onBack: () => void; }

export function DeckList({ decks, onStudy, onMatch, onEdit, onDelete, onCreate, onBack }: DeckListProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">← Zurück</button>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">🃏 Karteikarten</h1>
        <div />
      </div>
      <button onClick={onCreate} className="w-full p-5 border-2 border-dashed border-emerald-300 dark:border-emerald-600 rounded-2xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-3 text-lg font-bold"><Plus className="w-6 h-6" /> Neues Kartendeck</button>
      {decks.length === 0 ? (
        <div className="text-center py-16"><span className="text-6xl">📚</span><h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mt-4">Noch keine Kartendecks</h3><p className="text-gray-500 dark:text-gray-400 mt-2">Erstelle dein erstes Deck!</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {decks.map(deck => {
            const mastered = deck.cards.filter(c => c.mastered).length;
            const progress = deck.cards.length > 0 ? Math.round((mastered / deck.cards.length) * 100) : 0;
            return (
              <div key={deck.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">{deck.title}</h3>{deck.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{deck.description}</p>}</div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(deck)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700"><Edit3 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" /></button>
                    <button onClick={() => onDelete(deck.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {deck.cards.length} Karten</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> {mastered} gelernt</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onStudy(deck)} disabled={deck.cards.length === 0} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg"><Play className="w-4 h-4" /> Lernen</button>
                  <button onClick={() => onMatch(deck)} disabled={deck.cards.length < 3} className="py-2.5 px-3 bg-gradient-to-r from-lime-500 to-green-600 text-white rounded-xl font-semibold disabled:opacity-30 flex items-center justify-center gap-1 shadow-lg text-sm">🎯 Match</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== DECK CREATOR ====================
interface DeckCreatorProps { existingDeck: FlashcardDeck | null; onSave: (deck: FlashcardDeck) => void; onCancel: () => void; }

export function DeckCreator({ existingDeck, onSave, onCancel }: DeckCreatorProps) {
  const [title, setTitle] = useState(existingDeck?.title || '');
  const [description, setDescription] = useState(existingDeck?.description || '');
  const [subject, setSubject] = useState(existingDeck?.subject || '');
  const [cards, setCards] = useState<Flashcard[]>(existingDeck?.cards?.length ? existingDeck.cards : [defaultCard()]);
  const [currentCard, setCurrentCard] = useState(0);

  const addCard = () => { setCards([...cards, defaultCard()]); setCurrentCard(cards.length); };
  const updateCard = (index: number, field: string, value: string) => { const u = [...cards]; u[index] = { ...u[index], [field]: value }; setCards(u); };
  const removeCard = (index: number) => { if (cards.length <= 1) return; const u = cards.filter((_, i) => i !== index); setCards(u); if (currentCard >= u.length) setCurrentCard(u.length - 1); };
  const handleSave = () => { if (!title.trim()) return; const valid = cards.filter(c => c.front.trim() || c.back.trim()); if (valid.length === 0) return; onSave({ id: existingDeck?.id || generateId(), title: title.trim(), description: description.trim(), subject, cards: valid, createdAt: existingDeck?.createdAt || Date.now() }); };

  const card = cards[currentCard];
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">← Abbrechen</button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">{existingDeck ? 'Deck bearbeiten' : 'Neues Deck'} 📝</h1>
        <div />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Deck-Titel..." className="w-full text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400" />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschreibung (optional)..." className="w-full bg-transparent border-none outline-none text-gray-600 dark:text-gray-300 placeholder-gray-400 text-sm" />
        <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {cards.map((c, i) => (<button key={c.id} onClick={() => setCurrentCard(i)} className={`flex-shrink-0 w-10 h-10 rounded-xl font-bold text-sm transition-all ${i === currentCard ? 'bg-emerald-500 text-white shadow-lg scale-110' : c.front && c.back ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}>{i + 1}</button>))}
        <button onClick={addCard} className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50"><Plus className="w-5 h-5 mx-auto" /></button>
      </div>
      {card && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-700 dark:text-gray-300">Karte {currentCard + 1} von {cards.length}</h3>
            {cards.length > 1 && <button onClick={() => removeCard(currentCard)} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Entfernen</button>}
          </div>
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Vorderseite (Frage)</label>
            <textarea value={card.front} onChange={e => updateCard(currentCard, 'front', e.target.value)} placeholder="Was möchtest du lernen?" rows={3} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="p-5">
            <label className="block text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Rückseite (Antwort)</label>
            <textarea value={card.back} onChange={e => updateCard(currentCard, 'back', e.target.value)} placeholder="Die Antwort..." rows={3} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentCard(Math.max(0, currentCard - 1))} disabled={currentCard === 0} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-30 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Zurück</button>
        <button onClick={handleSave} disabled={!title.trim() || cards.filter(c => c.front.trim() && c.back.trim()).length === 0} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold disabled:opacity-30 shadow-lg flex items-center gap-2"><Check className="w-4 h-4" /> Speichern</button>
        <button onClick={() => setCurrentCard(Math.min(cards.length - 1, currentCard + 1))} disabled={currentCard === cards.length - 1} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-30 flex items-center gap-1">Weiter <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ==================== FLASHCARD STUDY ====================
interface FlashcardStudyProps { deck: FlashcardDeck; onFinish: (known: number, total: number) => void; onUpdateDeck: (deck: FlashcardDeck) => void; onBack: () => void; }

export function FlashcardStudy({ deck, onFinish, onUpdateDeck, onBack }: FlashcardStudyProps) {
  const [cards, setCards] = useState<Flashcard[]>(() => [...deck.cards].sort(() => Math.random() - 0.5));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [finished, setFinished] = useState(false);
  const [flipAnim, setFlipAnim] = useState(false);

  const currentCard = cards[currentIdx];
  const progress = cards.length > 0 ? Math.round((currentIdx / cards.length) * 100) : 0;

  const handleFlip = () => { setFlipAnim(true); setTimeout(() => { setFlipped(!flipped); setFlipAnim(false); }, 150); };

  const handleAnswer = (knewIt: boolean, difficulty: 1 | 2 | 3) => {
    const updated = [...cards];
    updated[currentIdx] = { ...updated[currentIdx], mastered: knewIt, difficulty, reviewCount: updated[currentIdx].reviewCount + 1, nextReview: knewIt ? Date.now() + difficulty * 24 * 60 * 60 * 1000 : Date.now() };
    setCards(updated);
    if (knewIt) setKnown(p => p + 1); else setUnknown(p => p + 1);
    if (currentIdx + 1 >= cards.length) {
      const updatedDeck = { ...deck, cards: deck.cards.map(c => { const s = updated.find(u => u.id === c.id); return s ? { ...c, mastered: s.mastered, difficulty: s.difficulty, reviewCount: s.reviewCount, nextReview: s.nextReview } : c; }) };
      onUpdateDeck(updatedDeck); setFinished(true);
    } else { setFlipped(false); setCurrentIdx(p => p + 1); }
  };

  const handleRestart = () => { setCards([...deck.cards].sort(() => Math.random() - 0.5)); setCurrentIdx(0); setFlipped(false); setKnown(0); setUnknown(0); setFinished(false); };

  if (finished) {
    const pct = cards.length > 0 ? Math.round((known / cards.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 text-center">
          <span className="text-6xl">{pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪'}</span>
          <h2 className="text-3xl font-black text-white mt-4">{pct >= 80 ? 'Fantastisch!' : pct >= 50 ? 'Gut gemacht!' : 'Weiter üben!'}</h2>
          <p className="text-green-200 mt-2">{deck.title}</p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-emerald-300">{known}</p><p className="text-green-300 text-xs">Gewusst</p></div>
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-red-300">{unknown}</p><p className="text-green-300 text-xs">Nicht gewusst</p></div>
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-white">{pct}%</p><p className="text-green-300 text-xs">Quote</p></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleRestart} className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Nochmal</button>
            <button onClick={() => onFinish(known, cards.length)} className="flex-1 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-yellow-400 hover:text-gray-900">Fertig ✓</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-white/70 hover:text-white text-sm font-medium">← Beenden</button>
        <span className="text-white font-bold">{currentIdx + 1} / {cards.length}</span>
        <button onClick={() => setCards(prev => [...prev.slice(0, currentIdx + 1), ...prev.slice(currentIdx + 1).sort(() => Math.random() - 0.5)])} className="text-white/70 hover:text-white"><Shuffle className="w-5 h-5" /></button>
      </div>
      <div className="mx-4 h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div onClick={handleFlip} className={`w-full cursor-pointer transition-transform duration-300 ${flipAnim ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`} style={{ perspective: '1000px' }}>
            <div className={`w-full min-h-[280px] sm:min-h-[320px] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xl border-2 transition-colors duration-300 ${flipped ? 'bg-white border-green-400' : 'bg-white border-emerald-400'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider mb-4 ${flipped ? 'text-green-500' : 'text-emerald-500'}`}>{flipped ? '✅ Antwort' : '❓ Frage'}</span>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed">{flipped ? currentCard?.back : currentCard?.front}</p>
              {!flipped && <p className="text-gray-400 text-sm mt-6">Tippe zum Umdrehen →</p>}
            </div>
          </div>
          {flipped ? (
            <div className="space-y-3 mt-6">
              {/* Difficulty rating - spaced repetition */}
              <p className="text-white/70 text-sm text-center">Wie schwer war das?</p>
              <div className="grid grid-cols-3 gap-3">
                {[{ d: 1 as const, label: '😊 Leicht', color: 'bg-emerald-400 hover:bg-emerald-300', sub: '(+3 Tage)' }, { d: 2 as const, label: '🤔 Mittel', color: 'bg-yellow-400 hover:bg-yellow-300', sub: '(+2 Tage)' }, { d: 3 as const, label: '😰 Schwer', color: 'bg-red-400 hover:bg-red-300', sub: '(+1 Tag)' }].map(({ d, label, color, sub }) => (
                  <button key={d} onClick={() => handleAnswer(d <= 2, d)} className={`py-3 rounded-2xl text-gray-900 font-bold transition-all active:scale-95 shadow-lg text-sm ${color}`}>
                    <span className="block">{label}</span>
                    <span className="text-xs opacity-70">{sub}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => handleAnswer(false, 3)} className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">❌ Wusste ich nicht</button>
            </div>
          ) : (
            <button onClick={handleFlip} className="w-full mt-6 py-4 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg backdrop-blur flex items-center justify-center gap-2"><RotateCcw className="w-5 h-5" /> Umdrehen</button>
          )}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <span className="text-emerald-200">✓ {known}</span>
            <span className="text-red-200">✗ {unknown}</span>
            <span className="text-white/50">{cards.length - currentIdx} übrig</span>
          </div>
        </div>
      </div>
    </div>
  );
}
