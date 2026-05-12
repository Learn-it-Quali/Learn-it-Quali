import { useState, useEffect, useCallback } from 'react';
import { FlashcardDeck } from '../types';
import { Home, RotateCcw, Clock, Zap, Trophy } from 'lucide-react';

interface MatchGameProps {
  decks: FlashcardDeck[];
  onFinish: (score: number, total: number) => void;
  onBack: () => void;
}

interface MatchCard {
  id: string;
  pairId: string;
  text: string;
  type: 'front' | 'back';
  flipped: boolean;
  matched: boolean;
}

export default function MatchGame({ decks, onFinish, onBack }: MatchGameProps) {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const allCards = decks.flatMap(d => d.cards.filter(c => c.front.trim() && c.back.trim()));

  const startGame = useCallback((deckId?: string) => {
    const sourceCards = deckId
      ? decks.find(d => d.id === deckId)?.cards.filter(c => c.front.trim() && c.back.trim()) || []
      : allCards;
    const gameCards = sourceCards.slice(0, Math.min(8, sourceCards.length));

    const matchCards: MatchCard[] = [];
    gameCards.forEach(c => {
      matchCards.push({ id: c.id + '-front', pairId: c.id, text: c.front, type: 'front', flipped: false, matched: false });
      matchCards.push({ id: c.id + '-back', pairId: c.id, text: c.back, type: 'back', flipped: false, matched: false });
    });

    // Shuffle
    for (let i = matchCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [matchCards[i], matchCards[j]] = [matchCards[j], matchCards[i]];
    }

    setCards(matchCards);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setTotalPairs(gameCards.length);
    setGameStarted(true);
    setGameOver(false);
    setTime(0);
    setIsChecking(false);
  }, [decks, allCards]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => setTime(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const handleFlip = (cardId: string) => {
    if (isChecking) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (flippedCards.length >= 2) return;

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, flipped: true } : c));
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(p => p + 1);
      setIsChecking(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;

      if (firstCard.pairId === secondCard.pairId && firstId !== secondId) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === firstId || c.id === secondId ? { ...c, matched: true, flipped: true } : c));
          setFlippedCards([]);
          setIsChecking(false);
          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);
          if (newMatched >= totalPairs) setGameOver(true);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const score = gameOver ? Math.max(0, 1000 - (moves - totalPairs) * 50 - time * 2) : 0;

  // Deck selection
  if (!gameStarted) {
    const availableDecks = decks.filter(d => d.cards.filter(c => c.front.trim() && c.back.trim()).length >= 2);
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-600 via-green-600 to-emerald-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <span className="text-6xl">🎯</span>
            <h1 className="text-4xl font-black text-white mt-4">Match Game</h1>
            <p className="text-green-200 mt-2">Finde die passenden Kartenpaare!</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 space-y-4">
            <p className="text-white font-bold text-center">Wähle ein Deck:</p>
            {availableDecks.length === 0 ? (
              <p className="text-green-200 text-center py-4">Du brauchst mindestens ein Deck mit 2 Karten.</p>
            ) : (
              availableDecks.map(deck => (
                <button key={deck.id} onClick={() => { setSelectedDeckId(deck.id); startGame(deck.id); }} className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-left transition-all flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-emerald-500/30 rounded-xl flex items-center justify-center text-xl">🃏</div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{deck.title}</p>
                    <p className="text-green-300 text-sm">{deck.cards.length} Karten ({Math.min(8, deck.cards.filter(c => c.front.trim() && c.back.trim()).length)} Paare)</p>
                  </div>
                  <Zap className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                </button>
              ))
            )}
            {allCards.length >= 4 && (
              <button onClick={() => startGame()} className="w-full p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl text-gray-900 font-bold transition-all hover:from-yellow-300 hover:to-orange-400 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" /> Alle Karten mischen
              </button>
            )}
          </div>
          <button onClick={onBack} className="block mx-auto mt-4 text-green-300 hover:text-white text-sm">← Zurück</button>
        </div>
      </div>
    );
  }

  // Game over
  if (gameOver) {
    const stars = moves <= totalPairs + 2 ? 3 : moves <= totalPairs + 5 ? 2 : 1;
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-600 via-green-600 to-emerald-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 text-center">
          <span className="text-6xl">{stars >= 3 ? '🏆' : stars >= 2 ? '🌟' : '⭐'}</span>
          <h2 className="text-3xl font-black text-white mt-4">Geschafft!</h2>
          <div className="text-4xl mt-2">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-white">{moves}</p><p className="text-green-300 text-xs">Züge</p></div>
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-yellow-400">{formatTime(time)}</p><p className="text-green-300 text-xs">Zeit</p></div>
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-emerald-300">{score}</p><p className="text-green-300 text-xs">Punkte</p></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => startGame(selectedDeckId || undefined)} className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Nochmal</button>
            <button onClick={() => onFinish(matchedPairs, totalPairs)} className="flex-1 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-yellow-400 hover:text-gray-900 flex items-center justify-center gap-2"><Home className="w-4 h-4" /> Fertig</button>
          </div>
        </div>
      </div>
    );
  }

  // Game board
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-600 via-green-600 to-emerald-700 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-white/70 hover:text-white text-sm font-medium">← Beenden</button>
        <div className="flex items-center gap-4 text-white">
          <span className="flex items-center gap-1 text-sm"><Clock className="w-4 h-4" /> {formatTime(time)}</span>
          <span className="flex items-center gap-1 text-sm"><Zap className="w-4 h-4" /> {moves} Züge</span>
          <span className="flex items-center gap-1 text-sm"><Trophy className="w-4 h-4" /> {matchedPairs}/{totalPairs}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mx-4 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(matchedPairs / totalPairs) * 100}%` }} />
      </div>

      {/* Card grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`grid gap-3 w-full max-w-lg ${cards.length <= 8 ? 'grid-cols-4' : cards.length <= 12 ? 'grid-cols-4' : 'grid-cols-4'}`}>
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={`aspect-[3/4] rounded-2xl transition-all duration-300 flex items-center justify-center p-2 text-center ${
                card.matched ? 'bg-emerald-400/30 border-2 border-emerald-300 scale-95' :
                card.flipped ? 'bg-white shadow-xl scale-105 border-2 border-yellow-400' :
                'bg-white/20 backdrop-blur border-2 border-white/30 hover:bg-white/30 hover:scale-[1.03] cursor-pointer active:scale-95'
              }`}
              disabled={card.flipped || card.matched || flippedCards.length >= 2}
            >
              {card.matched ? (
                <span className="text-emerald-200 text-2xl">✓</span>
              ) : card.flipped ? (
                <span className={`text-xs sm:text-sm font-bold leading-tight ${card.type === 'front' ? 'text-emerald-700' : 'text-teal-700'}`}>
                  {card.text.length > 40 ? card.text.slice(0, 40) + '…' : card.text}
                </span>
              ) : (
                <span className="text-white/40 text-2xl">?</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
