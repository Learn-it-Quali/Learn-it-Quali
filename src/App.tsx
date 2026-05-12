import { useState, useEffect, useCallback } from 'react';
import { Page, AppData, Quiz, FlashcardDeck, Note, ExamCountdown } from './types';
import { loadData, saveData, saveQuiz, deleteQuiz, saveDeck, deleteDeck, saveNote, deleteNote, addStudySession, generateId, checkNoteAchievements, checkDeckAchievements, checkQuizCreatedAchievement } from './store';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { QuizList, QuizCreator, QuizPlay } from './components/QuizManager';
import { DeckList, DeckCreator, FlashcardStudy } from './components/FlashcardManager';
import PomodoroTimer from './components/PomodoroTimer';
import { NotesList, NoteEditor } from './components/NotesManager';
import MatchGame from './components/MatchGame';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';
import { Home, Brain, BookOpen, StickyNote, Clock, Settings as SettingsIcon, Sun, Moon, Trophy, Shield } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('learnit_auth') === 'true');
  const [data, setData] = useState<AppData>(() => loadData());
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('learnit_dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('learnit_dark', String(darkMode));
  }, [darkMode]);

  const handleLogin = () => { setIsLoggedIn(true); localStorage.setItem('learnit_auth', 'true'); };
  const handleLogout = () => { setIsLoggedIn(false); localStorage.removeItem('learnit_auth'); setPage('dashboard'); };

  // Quiz
  const handleSaveQuiz = useCallback((quiz: Quiz) => { setData(prev => { const d = saveQuiz(prev, quiz); checkQuizCreatedAchievement(d); return d; }); setPage('quizzes'); }, []);
  const handleDeleteQuiz = useCallback((id: string) => { setData(prev => deleteQuiz(prev, id)); }, []);
  const handlePlayQuiz = useCallback((quiz: Quiz) => { setSelectedQuiz(quiz); setPage('quiz-play'); }, []);
  const handleEditQuiz = useCallback((quiz: Quiz) => { setSelectedQuiz(quiz); setPage('quiz-create'); }, []);
  const handleQuizFinish = useCallback((score: number, total: number) => {
    if (selectedQuiz) {
      setData(prev => addStudySession(prev, { id: generateId(), type: 'quiz', title: selectedQuiz.title, subject: selectedQuiz.subject, score, total, date: Date.now() }));
    }
    setPage('quizzes');
  }, [selectedQuiz]);

  // Flashcard
  const handleSaveDeck = useCallback((deck: FlashcardDeck) => { setData(prev => { const d = saveDeck(prev, deck); checkDeckAchievements(d); return d; }); setPage('flashcards'); }, []);
  const handleDeleteDeck = useCallback((id: string) => { setData(prev => deleteDeck(prev, id)); }, []);
  const handleStudyDeck = useCallback((deck: FlashcardDeck) => { setSelectedDeck(deck); setPage('flashcard-study'); }, []);
  const handleMatchDeck = useCallback((deck: FlashcardDeck) => { setSelectedDeck(deck); setPage('match-game'); }, []);
  const handleEditDeck = useCallback((deck: FlashcardDeck) => { setSelectedDeck(deck); setPage('flashcard-create'); }, []);
  const handleUpdateDeck = useCallback((deck: FlashcardDeck) => { setData(prev => saveDeck(prev, deck)); }, []);
  const handleFlashcardFinish = useCallback((known: number, total: number) => {
    if (selectedDeck) {
      setData(prev => addStudySession(prev, { id: generateId(), type: 'flashcard', title: selectedDeck.title, subject: selectedDeck.subject, score: known, total, date: Date.now() }));
    }
    setPage('flashcards');
  }, [selectedDeck]);

  // Match game
  const handleMatchFinish = useCallback((score: number, total: number) => {
    setData(prev => addStudySession(prev, { id: generateId(), type: 'match', title: 'Match Game', subject: '', score, total, date: Date.now() }));
    setPage('flashcards');
  }, []);

  // Notes
  const handleSaveNote = useCallback((note: Note) => { setData(prev => { const d = saveNote(prev, note); checkNoteAchievements(d); return d; }); setPage('notes'); }, []);
  const handleDeleteNote = useCallback((id: string) => { setData(prev => deleteNote(prev, id)); }, []);
  const handleEditNote = useCallback((note: Note) => { setSelectedNote(note); setPage('notes-edit'); }, []);

  // Pomodoro
  const handleUpdatePomodoroSettings = useCallback((settings: typeof data.pomodoroSettings) => { setData(prev => ({ ...prev, pomodoroSettings: settings })); }, []);

  // Exams
  const handleAddExam = useCallback((exam: ExamCountdown) => { setData(prev => ({ ...prev, exams: [...prev.exams, exam] })); }, []);
  const handleDeleteExam = useCallback((id: string) => { setData(prev => ({ ...prev, exams: prev.exams.filter(e => e.id !== id) })); }, []);

  const fullscreenPages: Page[] = ['quiz-play', 'flashcard-study', 'pomodoro', 'match-game'];
  const isFullscreen = fullscreenPages.includes(page);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard quizzes={data.quizzes} decks={data.flashcardDecks} notes={data.notes} sessions={data.studySessions} achievements={data.achievements} exams={data.exams} weeklyGoal={data.weeklyGoal} onNavigate={p => setPage(p as Page)} onAddExam={handleAddExam} onDeleteExam={handleDeleteExam} />;
      case 'quizzes':
        return <QuizList quizzes={data.quizzes} onPlay={handlePlayQuiz} onEdit={handleEditQuiz} onDelete={handleDeleteQuiz} onCreate={() => { setSelectedQuiz(null); setPage('quiz-create'); }} onBack={() => setPage('dashboard')} />;
      case 'quiz-create':
        return <QuizCreator existingQuiz={selectedQuiz} onSave={handleSaveQuiz} onCancel={() => setPage('quizzes')} />;
      case 'quiz-play':
        return selectedQuiz ? <QuizPlay quiz={selectedQuiz} onFinish={handleQuizFinish} onBack={() => setPage('quizzes')} /> : null;
      case 'flashcards':
        return <DeckList decks={data.flashcardDecks} onStudy={handleStudyDeck} onMatch={handleMatchDeck} onEdit={handleEditDeck} onDelete={handleDeleteDeck} onCreate={() => { setSelectedDeck(null); setPage('flashcard-create'); }} onBack={() => setPage('dashboard')} />;
      case 'flashcard-create':
        return <DeckCreator existingDeck={selectedDeck} onSave={handleSaveDeck} onCancel={() => setPage('flashcards')} />;
      case 'flashcard-study':
        return selectedDeck ? <FlashcardStudy deck={selectedDeck} onFinish={handleFlashcardFinish} onUpdateDeck={handleUpdateDeck} onBack={() => setPage('flashcards')} /> : null;
      case 'match-game':
        return <MatchGame decks={data.flashcardDecks} onFinish={handleMatchFinish} onBack={() => setPage('flashcards')} />;
      case 'pomodoro':
        return <PomodoroTimer settings={data.pomodoroSettings} onUpdateSettings={handleUpdatePomodoroSettings} onBack={() => setPage('dashboard')} />;
      case 'notes':
        return <NotesList notes={data.notes} onEdit={handleEditNote} onDelete={handleDeleteNote} onCreate={() => { setSelectedNote(null); setPage('notes-edit'); }} onBack={() => setPage('dashboard')} />;
      case 'notes-edit':
        return <NoteEditor existingNote={selectedNote} onSave={handleSaveNote} onCancel={() => setPage('notes')} />;
      case 'achievements':
        return <AchievementsPage achievements={data.achievements} onBack={() => setPage('dashboard')} />;
      case 'admin':
        return <AdminPanel data={data} onUpdateData={setData} onBack={() => setPage('dashboard')} />;
      case 'settings':
        return <Settings data={data} onUpdateData={setData} onLogout={handleLogout} onBack={() => setPage('dashboard')} />;
      default: return null;
    }
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;
  if (isFullscreen) return <>{renderPage()}</>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col items-center py-6 z-30">
        <button onClick={() => setPage('dashboard')} className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg mb-8">L</button>
        <div className="flex-1 flex flex-col items-center gap-2">
          {[
            { icon: <Home className="w-5 h-5" />, label: 'Home', active: page === 'dashboard', onClick: () => setPage('dashboard') },
            { icon: <Brain className="w-5 h-5" />, label: 'Quizzes', active: page === 'quizzes' || page === 'quiz-create', onClick: () => setPage('quizzes') },
            { icon: <BookOpen className="w-5 h-5" />, label: 'Karten', active: page === 'flashcards' || page === 'flashcard-create', onClick: () => setPage('flashcards') },
            { icon: <StickyNote className="w-5 h-5" />, label: 'Notizen', active: page === 'notes' || page === 'notes-edit', onClick: () => setPage('notes') },
            { icon: <Clock className="w-5 h-5" />, label: 'Timer', active: page === 'pomodoro', onClick: () => setPage('pomodoro') },
            { icon: <Trophy className="w-5 h-5" />, label: 'Erfolge', active: page === 'achievements', onClick: () => setPage('achievements') },
          ].map(n => (
            <button key={n.label} onClick={n.onClick} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${n.active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {n.icon}<span className="text-[10px] font-medium">{n.label}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          <button onClick={() => setPage('admin')} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${page === 'admin' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <Shield className="w-5 h-5" /><span className="text-[10px] font-medium">Admin</span>
          </button>
          <button onClick={() => setPage('settings')} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${page === 'settings' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <SettingsIcon className="w-5 h-5" /><span className="text-[10px] font-medium">Mehr</span>
          </button>
        </div>
      </div>

      <main className="lg:ml-20 pb-24 lg:pb-6">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <button onClick={() => setPage('dashboard')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white font-black text-sm">L</div>
            <span className="font-black text-gray-900 dark:text-white">Learn<span className="text-emerald-500">It</span></span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button onClick={() => setPage('admin')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"><Shield className="w-5 h-5" /></button>
            <button onClick={() => setPage('settings')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"><SettingsIcon className="w-5 h-5" /></button>
          </div>
        </div>
        {renderPage()}
      </main>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: <Home className="w-5 h-5" />, label: 'Home', active: page === 'dashboard', onClick: () => setPage('dashboard') },
            { icon: <Brain className="w-5 h-5" />, label: 'Quiz', active: page === 'quizzes' || page === 'quiz-create' || page === 'quiz-play', onClick: () => setPage('quizzes') },
            { icon: <BookOpen className="w-5 h-5" />, label: 'Karten', active: page === 'flashcards' || page === 'flashcard-create' || page === 'flashcard-study' || page === 'match-game', onClick: () => setPage('flashcards') },
            { icon: <StickyNote className="w-5 h-5" />, label: 'Notizen', active: page === 'notes' || page === 'notes-edit', onClick: () => setPage('notes') },
            { icon: <Trophy className="w-5 h-5" />, label: 'Erfolge', active: page === 'achievements', onClick: () => setPage('achievements') },
          ].map(n => (
            <button key={n.label} onClick={n.onClick} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${n.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {n.icon}<span className="text-[10px] font-medium">{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Achievements Page
function AchievementsPage({ achievements, onBack }: { achievements: any[]; onBack: () => void }) {
  const unlocked = achievements.filter((a: any) => a.unlockedAt);
  const categories = [
    { key: 'quiz', label: '🎮 Quiz', items: achievements.filter((a: any) => a.category === 'quiz') },
    { key: 'flashcard', label: '🃏 Karten', items: achievements.filter((a: any) => a.category === 'flashcard') },
    { key: 'streak', label: '🔥 Streak', items: achievements.filter((a: any) => a.category === 'streak') },
    { key: 'general', label: '⭐ Allgemein', items: achievements.filter((a: any) => a.category === 'general') },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">← Zurück</button>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">🏆 Erfolge</h1>
        <div />
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white text-center">
        <span className="text-5xl">🏅</span>
        <h2 className="text-2xl font-black mt-3">{unlocked.length} / {achievements.length}</h2>
        <p className="text-green-100 mt-1">Erfolge freigeschaltet</p>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${(unlocked.length / achievements.length) * 100}%` }} />
        </div>
      </div>

      {/* Categories */}
      {categories.map(cat => (
        <div key={cat.key}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{cat.label}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {cat.items.map((a: any) => (
              <div key={a.id} className={`bg-white dark:bg-gray-800 rounded-2xl border p-4 flex items-center gap-4 transition-all ${a.unlockedAt ? 'border-emerald-200 dark:border-emerald-700 shadow-md' : 'border-gray-200 dark:border-gray-700 opacity-50'}`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${a.unlockedAt ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-700 grayscale'}`}>
                  {a.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{a.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{a.description}</p>
                  {a.unlockedAt && <p className="text-emerald-500 text-xs mt-1">✓ {new Date(a.unlockedAt).toLocaleDateString('de-DE')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
