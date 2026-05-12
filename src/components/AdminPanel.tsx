import { useState } from 'react';
import { AppData, SUBJECTS, getSubjectEmoji, getSubjectLabel } from '../types';
import { exportData, importData } from '../store';
import { Shield, Database, Brain, BookOpen, StickyNote, Trash2, Download, Upload, Check, X, AlertTriangle, BarChart3, Clock, Zap, Star, Search, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

interface AdminPanelProps {
  data: AppData;
  onUpdateData: (data: AppData) => void;
  onBack: () => void;
}

export default function AdminPanel({ data, onUpdateData, onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'decks' | 'notes' | 'achievements' | 'system'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showNukeModal, setShowNukeModal] = useState(false);
  const [nukeConfirm, setNukeConfirm] = useState('');

  // Local setData wrapper that supports functional updates
  const setData = (updater: AppData | ((prev: AppData) => AppData)) => {
    const newData = typeof updater === 'function' ? updater(data) : updater;
    onUpdateData(newData);
  };

  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-black text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-2">Zugang nur für Administratoren</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-700">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Admin-Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Passwort..."
                className="w-full pl-11 pr-12 py-3 bg-gray-900 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                onKeyDown={e => {
                  if (e.key === 'Enter' && adminPassword === 'Michi1508B') setIsAdminUnlocked(true);
                }}
              />
              <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {adminPassword && adminPassword !== 'Michi1508B' && <p className="text-red-400 text-sm mt-2">✗ Falsches Passwort</p>}
            <button
              onClick={() => { if (adminPassword === 'Michi1508B') setIsAdminUnlocked(true); }}
              disabled={adminPassword !== 'Michi1508B'}
              className="w-full mt-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold rounded-xl disabled:opacity-30 hover:from-red-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Entsperren
            </button>
          </div>
          <button onClick={onBack} className="block mx-auto mt-4 text-gray-500 hover:text-gray-300 text-sm">← Zurück</button>
        </div>
      </div>
    );
  }

  // === OVERVIEW STATS ===
  const totalQuestions = data.quizzes.reduce((a, q) => a + q.questions.length, 0);
  const totalCards = data.flashcardDecks.reduce((a, d) => a + d.cards.length, 0);
  const masteredCards = data.flashcardDecks.reduce((a, d) => a + d.cards.filter(c => c.mastered).length, 0);
  const avgScore = data.studySessions.length > 0
    ? Math.round(data.studySessions.reduce((a, s) => a + (s.total > 0 ? (s.score / s.total) * 100 : 0), 0) / data.studySessions.length)
    : 0;

  // === SUBJECT BREAKDOWN ===
  const subjectStats = SUBJECTS.slice(1).map(s => ({
    ...s,
    quizzes: data.quizzes.filter(q => q.subject === s.value).length,
    decks: data.flashcardDecks.filter(d => d.subject === s.value).length,
    notes: data.notes.filter(n => n.subject === s.value).length,
    sessions: data.studySessions.filter(ss => ss.subject === s.value).length,
  })).filter(s => s.quizzes + s.decks + s.notes + s.sessions > 0);

  // === RECENTLY ACCESSED ===
  const recentItems = [
    ...data.quizzes.map(q => ({ type: 'Quiz' as const, title: q.title, date: q.createdAt, id: q.id })),
    ...data.flashcardDecks.map(d => ({ type: 'Deck' as const, title: d.title, date: d.createdAt, id: d.id })),
    ...data.notes.map(n => ({ type: 'Notiz' as const, title: n.title, date: n.updatedAt, id: n.id })),
  ].sort((a, b) => b.date - a.date).slice(0, 10);

  const tabs = [
    { key: 'overview' as const, label: 'Übersicht', emoji: '📊' },
    { key: 'quizzes' as const, label: 'Quizzes', emoji: '🎮' },
    { key: 'decks' as const, label: 'Decks', emoji: '🃏' },
    { key: 'notes' as const, label: 'Notizen', emoji: '📝' },
    { key: 'achievements' as const, label: 'Erfolge', emoji: '🏆' },
    { key: 'system' as const, label: 'System', emoji: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-black">Admin Panel</h1>
              <p className="text-gray-400 text-xs">Vollzugriff auf alle Daten</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold">ADMIN</span>
            <button onClick={onBack} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">← Zurück</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === t.key ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* === OVERVIEW === */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Quizzes', value: data.quizzes.length, icon: <Brain className="w-5 h-5" />, color: 'emerald' },
                { label: 'Fragen', value: totalQuestions, icon: <Zap className="w-5 h-5" />, color: 'blue' },
                { label: 'Karten', value: totalCards, icon: <BookOpen className="w-5 h-5" />, color: 'teal' },
                { label: 'Gelernt', value: masteredCards, icon: <Star className="w-5 h-5" />, color: 'yellow' },
                { label: 'Notizen', value: data.notes.length, icon: <StickyNote className="w-5 h-5" />, color: 'amber' },
                { label: 'Ø Score', value: `${avgScore}%`, icon: <BarChart3 className="w-5 h-5" />, color: 'purple' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-400 mb-1">{s.icon}</div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Streak & Sessions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Streak</h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-orange-500">{data.streak.currentStreak}</p>
                    <p className="text-xs text-gray-400">Aktuell</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-yellow-500">{data.streak.longestStreak}</p>
                    <p className="text-xs text-gray-400">Rekord</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">{data.streak.lastStudyDate || '–'}</p>
                    <p className="text-xs text-gray-400">Letzte Session</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Sessions</h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-blue-500">{data.studySessions.length}</p>
                    <p className="text-xs text-gray-400">Gesamt</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-emerald-500">{data.studySessions.filter(s => s.type === 'quiz').length}</p>
                    <p className="text-xs text-gray-400">Quiz</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-teal-500">{data.studySessions.filter(s => s.type === 'flashcard').length}</p>
                    <p className="text-xs text-gray-400">Karten</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Breakdown */}
            {subjectStats.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">📚 Fächer-Verteilung</h3>
                <div className="space-y-2">
                  {subjectStats.map(s => {
                    const total = s.quizzes + s.decks + s.notes;
                    const maxTotal = Math.max(...subjectStats.map(x => x.quizzes + x.decks + x.notes));
                    return (
                      <div key={s.value} className="flex items-center gap-3">
                        <span className="text-lg w-8 text-center">{s.emoji}</span>
                        <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{s.label}</span>
                        <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${(total / maxTotal) * 100}%`, minWidth: total > 0 ? '2rem' : '0' }}>
                            <span className="text-xs font-bold text-white">{total}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400 w-24 justify-end">
                          {s.quizzes > 0 && <span>🎮{s.quizzes}</span>}
                          {s.decks > 0 && <span>🃏{s.decks}</span>}
                          {s.notes > 0 && <span>📝{s.notes}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recently Created */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">🕐 Zuletzt erstellt/bearbeitet</h3>
              <div className="space-y-2">
                {recentItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium">{item.type}</span>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{item.title}</span>
                    <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString('de-DE')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit */}
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="text-lg">💎</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">von Michi Bombe gemacht</span>
                <span className="text-lg">💎</span>
              </div>
            </div>
          </div>
        )}

        {/* === QUIZZES === */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Quizzes durchsuchen..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            {data.quizzes.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Keine Quizzes vorhanden</p>
            ) : (
              data.quizzes.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase())).map(quiz => (
                <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{quiz.questions.length} Fragen</span>
                      {quiz.subject && <span>{getSubjectEmoji(quiz.subject)} {getSubjectLabel(quiz.subject)}</span>}
                      <span>{new Date(quiz.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  {confirmDelete === quiz.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setData(prev => ({ ...prev, quizzes: prev.quizzes.filter(q => q.id !== quiz.id) })); setConfirmDelete(null); }} className="p-2 bg-red-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDelete(null)} className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(quiz.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* === DECKS === */}
        {activeTab === 'decks' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Decks durchsuchen..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            {data.flashcardDecks.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Keine Decks vorhanden</p>
            ) : (
              data.flashcardDecks.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())).map(deck => (
                <div key={deck.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white">{deck.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{deck.cards.length} Karten</span>
                      <span>{deck.cards.filter(c => c.mastered).length} gelernt</span>
                      {deck.subject && <span>{getSubjectEmoji(deck.subject)} {getSubjectLabel(deck.subject)}</span>}
                    </div>
                  </div>
                  {confirmDelete === deck.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setData(prev => ({ ...prev, flashcardDecks: prev.flashcardDecks.filter(d => d.id !== deck.id) })); setConfirmDelete(null); }} className="p-2 bg-red-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDelete(null)} className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(deck.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* === NOTES === */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Notizen durchsuchen..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            {data.notes.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Keine Notizen vorhanden</p>
            ) : (
              data.notes.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase())).map(note => (
                <div key={note.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white">{note.title}</h3>
                    <p className="text-sm text-gray-400 truncate mt-0.5">{note.content || 'Leere Notiz'}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>Farbe: {note.color}</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  {confirmDelete === note.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== note.id) })); setConfirmDelete(null); }} className="p-2 bg-red-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDelete(null)} className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(note.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* === ACHIEVEMENTS === */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{data.achievements.filter(a => a.unlockedAt).length} / {data.achievements.length} freigeschaltet</h3>
                <p className="text-sm text-gray-400">Als Admin kannst du Erfolge manuell verwalten</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setData(prev => ({ ...prev, achievements: prev.achievements.map(a => ({ ...a, unlockedAt: Date.now() })) })); }} className="px-3 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors">Alle freischalten</button>
                <button onClick={() => { setData(prev => ({ ...prev, achievements: prev.achievements.map(a => ({ ...a, unlockedAt: null })) })); }} className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Alle zurücksetzen</button>
              </div>
            </div>
            {data.achievements.map(a => (
              <div key={a.id} className={`bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center gap-4 ${a.unlockedAt ? 'border-emerald-200 dark:border-emerald-700' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}>
                <span className="text-2xl">{a.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-sm text-gray-400">{a.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className={`px-2 py-0.5 rounded-md ${a.category === 'quiz' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : a.category === 'flashcard' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : a.category === 'streak' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'}`}>{a.category}</span>
                    {a.unlockedAt && <span className="text-gray-400">✓ {new Date(a.unlockedAt).toLocaleDateString('de-DE')}</span>}
                  </div>
                </div>
                <button onClick={() => {
                  setData(prev => ({ ...prev, achievements: prev.achievements.map(x => x.id === a.id ? { ...x, unlockedAt: x.unlockedAt ? null : Date.now() } : x) }));
                }} className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors ${a.unlockedAt ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100'}`}>
                  {a.unlockedAt ? '↩️ Zurücksetzen' : '✓ Freischalten'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* === SYSTEM === */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            {/* Data size */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Database className="w-5 h-5 text-blue-500" /> Datenspeicher</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Quizzes', size: new Blob([JSON.stringify(data.quizzes)]).size },
                  { label: 'Karten', size: new Blob([JSON.stringify(data.flashcardDecks)]).size },
                  { label: 'Notizen', size: new Blob([JSON.stringify(data.notes)]).size },
                  { label: 'Gesamt', size: new Blob([exportData(data)]).size },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <p className="text-lg font-black text-gray-900 dark:text-white">{(s.size / 1024).toFixed(1)} KB</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Export/Import */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Download className="w-5 h-5 text-emerald-500" /> Export / Import</h3>
              <div className="flex gap-3">
                <button onClick={() => {
                  const blob = new Blob([exportData(data)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `learnit-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
                  URL.revokeObjectURL(url);
                }} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg">
                  <Download className="w-4 h-4" /> Backup exportieren
                </button>
                <label className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <Upload className="w-4 h-4" /> Backup importieren
                  <input type="file" accept=".json" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => { setImportText(ev.target?.result as string); };
                    reader.readAsText(file);
                  }} />
                </label>
              </div>
              {importText && (
                <div className="space-y-3">
                  <textarea value={importText} readOnly className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-mono text-gray-500 resize-none" />
                  <div className="flex gap-3">
                    <button onClick={() => {
                      const imported = importData(importText);
                      if (imported) { onUpdateData(imported); setImportSuccess(true); setImportError(false); setTimeout(() => setImportSuccess(false), 3000); setImportText(''); }
                      else { setImportError(true); }
                    }} className="flex-1 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" /> Importieren
                    </button>
                    <button onClick={() => { setImportText(''); setImportError(false); }} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl">Abbrechen</button>
                  </div>
                  {importError && <p className="text-red-500 text-sm">❌ Fehlerhaftes Format</p>}
                  {importSuccess && <p className="text-emerald-500 text-sm">✅ Daten erfolgreich importiert!</p>}
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border-2 border-red-200 dark:border-red-800 p-5 space-y-4">
              <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Gefahrenzone</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <button onClick={() => { setData(prev => ({ ...prev, quizzes: [] })); }} className="py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">🎮 Alle Quizzes löschen</button>
                <button onClick={() => { setData(prev => ({ ...prev, flashcardDecks: [] })); }} className="py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">🃏 Alle Decks löschen</button>
                <button onClick={() => { setData(prev => ({ ...prev, notes: [] })); }} className="py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">📝 Alle Notizen löschen</button>
                <button onClick={() => { setData(prev => ({ ...prev, studySessions: [] })); }} className="py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">📊 Sessions zurücksetzen</button>
                <button onClick={() => { setData(prev => ({ ...prev, streak: { currentStreak: 0, longestStreak: 0, lastStudyDate: null } })); }} className="py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">🔥 Streak zurücksetzen</button>
                <button onClick={() => { setShowNukeModal(true); setNukeConfirm(''); }} className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm flex items-center justify-center gap-1"><Trash2 className="w-4 h-4" /> ALLES LÖSCHEN</button>
              </div>
            </div>

            {/* Nuke Confirmation Modal */}
            {showNukeModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border-2 border-red-300 dark:border-red-800">
                  <div className="text-center">
                    <span className="text-5xl">⚠️</span>
                    <h3 className="text-xl font-black text-red-600 dark:text-red-400 mt-3">ACHTUNG!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">Dies wird <strong>ALLE Daten unwiderruflich löschen</strong> – Quizzes, Karten, Notizen, Erfolge, alles!</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tippe <span className="text-red-500 font-mono bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">LÖSCHEN</span> ein um zu bestätigen:</label>
                    <input
                      value={nukeConfirm}
                      onChange={e => setNukeConfirm(e.target.value)}
                      placeholder="LÖSCHEN"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 font-mono text-center text-lg"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowNukeModal(false); setNukeConfirm(''); }} className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                      Abbrechen
                    </button>
                    <button
                      onClick={() => {
                        onUpdateData({ ...data, quizzes: [], flashcardDecks: [], notes: [], studySessions: [], streak: { currentStreak: 0, longestStreak: 0, lastStudyDate: null }, achievements: data.achievements.map(a => ({ ...a, unlockedAt: null })), exams: [] });
                        setShowNukeModal(false); setNukeConfirm('');
                      }}
                      disabled={nukeConfirm !== 'LÖSCHEN'}
                      className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl disabled:opacity-30 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Endgültig löschen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">ℹ️ System-Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-400">App-Version</span><span className="font-mono text-gray-700 dark:text-gray-300">LearnIt v2.0</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-400">Speicher</span><span className="font-mono text-gray-700 dark:text-gray-300">localStorage</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-400">Dark Mode</span><span className="font-mono text-gray-700 dark:text-gray-300">{document.documentElement.classList.contains('dark') ? 'Aktiv' : 'Inaktiv'}</span></div>
                <div className="flex justify-between py-1"><span className="text-gray-400">Viewport</span><span className="font-mono text-gray-700 dark:text-gray-300">{window.innerWidth}×{window.innerHeight}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
