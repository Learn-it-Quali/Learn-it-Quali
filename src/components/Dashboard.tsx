import { useState } from 'react';
import { Quiz, FlashcardDeck, Note, StudySession, Achievement, ExamCountdown, WeeklyGoal, SUBJECTS, getSubjectEmoji } from '../types';
import { Brain, BookOpen, StickyNote, Clock, Trophy, Zap, ArrowRight, Target, Plus, X, Trash2, Award, Flame, Calendar, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  quizzes: Quiz[];
  decks: FlashcardDeck[];
  notes: Note[];
  sessions: StudySession[];
  achievements: Achievement[];
  exams: ExamCountdown[];
  weeklyGoal: WeeklyGoal;
  onNavigate: (page: string) => void;
  onAddExam: (exam: ExamCountdown) => void;
  onDeleteExam: (id: string) => void;
}

export default function Dashboard({ quizzes, decks, notes, sessions, achievements, exams, weeklyGoal, onNavigate, onAddExam, onDeleteExam }: DashboardProps) {
  const [showExamModal, setShowExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examSubject, setExamSubject] = useState('');

  const totalCards = decks.reduce((a, d) => a + d.cards.length, 0);
  const totalQuestions = quizzes.reduce((a, q) => a + q.questions.length, 0);
  const masteredCards = decks.reduce((a, d) => a + d.cards.filter(c => c.mastered).length, 0);
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const recentSessions = sessions.slice(0, 5);

  // Weekly progress
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return d >= monday;
  });
  const weekProgress = weeklyGoal.target > 0 ? Math.min(100, Math.round((weekSessions.length / weeklyGoal.target) * 100)) : 0;

  const handleAddExam = () => {
    if (!examTitle.trim() || !examDate) return;
    onAddExam({ id: Math.random().toString(36), title: examTitle, date: examDate, subject: examSubject, color: examColors[exams.length % examColors.length] });
    setExamTitle(''); setExamDate(''); setExamSubject(''); setShowExamModal(false);
  };

  const getDaysUntil = (dateStr: string) => {
    const exam = new Date(dateStr);
    const now = new Date();
    exam.setHours(0, 0, 0, 0); now.setHours(0, 0, 0, 0);
    return Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Willkommen zurück! 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">Bereit zu lernen?</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">{sessions.length > 0 ? '🔥 ' : ''}0</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Brain className="w-6 h-6" />, label: 'Quizzes', value: quizzes.length, sub: `${totalQuestions} Fragen`, color: 'emerald', onClick: () => onNavigate('quizzes') },
          { icon: <BookOpen className="w-6 h-6" />, label: 'Karten', value: totalCards, sub: `${masteredCards} gelernt`, color: 'teal', onClick: () => onNavigate('flashcards') },
          { icon: <StickyNote className="w-6 h-6" />, label: 'Notizen', value: notes.length, sub: 'gespeichert', color: 'green', onClick: () => onNavigate('notes') },
          { icon: <Award className="w-6 h-6" />, label: 'Erfolge', value: `${unlockedCount}/${achievements.length}`, sub: 'freigeschaltet', color: 'yellow', onClick: () => onNavigate('achievements') },
        ].map(s => (
          <div key={s.label} onClick={s.onClick} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-${s.color}-50 dark:bg-${s.color}-900/30 text-${s.color}-600 dark:text-${s.color}-400`}>{s.icon}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Goal + Exam Countdowns */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Weekly Goal */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Target className="w-5 h-5" /> Wochenziel</h3>
            <span className="text-sm text-emerald-100">{weekSessions.length} / {weeklyGoal.target} {weeklyGoal.unit === 'sessions' ? 'Sessions' : weeklyGoal.unit === 'minutes' ? 'Minuten' : 'Karten'}</span>
          </div>
          <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${weekProgress}%` }} />
          </div>
          <p className="text-emerald-100 text-sm">{weekProgress >= 100 ? '🎉 Ziel erreicht! Weiter so!' : `Noch ${weeklyGoal.target - weekSessions.length} ${weeklyGoal.unit === 'sessions' ? 'Sessions' : 'Einheiten'} bis zum Ziel`}</p>
        </div>

        {/* Exam Countdowns */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-500" /> Klausuren</h3>
            <button onClick={() => setShowExamModal(true)} className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"><Plus className="w-4 h-4" /></button>
          </div>
          {exams.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">Keine Klausuren eingetragen</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {exams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(exam => {
                const days = getDaysUntil(exam.date);
                return (
                  <div key={exam.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 group">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${days <= 3 ? 'bg-red-500' : days <= 7 ? 'bg-orange-500' : 'bg-emerald-500'}`}>{days}d</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{exam.title}</p>
                      <p className="text-xs text-gray-400">{exam.subject ? `${getSubjectEmoji(exam.subject)} ` : ''}{new Date(exam.date).toLocaleDateString('de-DE')}</p>
                    </div>
                    <button onClick={() => onDeleteExam(exam.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-emerald-500" /> Schnellstart</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji: '🎮', title: 'Quiz erstellen', desc: 'Mit 4 Fragetypen', gradient: 'from-emerald-500 to-green-600', onClick: () => onNavigate('quiz-create') },
            { emoji: '🃏', title: 'Karten erstellen', desc: 'Vorder- & Rückseite', gradient: 'from-teal-500 to-emerald-600', onClick: () => onNavigate('flashcard-create') },
            { emoji: '🎯', title: 'Match Game', desc: 'Paare finden!', gradient: 'from-green-500 to-lime-600', onClick: () => onNavigate('match-game') },
            { emoji: '⏱️', title: 'Pomodoro Timer', desc: 'Fokussiert lernen', gradient: 'from-amber-500 to-orange-600', onClick: () => onNavigate('pomodoro') },
            { emoji: '📝', title: 'Notizen', desc: 'Wichtiges festhalten', gradient: 'from-yellow-500 to-amber-600', onClick: () => onNavigate('notes') },
            { emoji: '🏆', title: 'Erfolge', desc: `${unlockedCount}/${achievements.length} freigeschaltet`, gradient: 'from-purple-500 to-pink-600', onClick: () => onNavigate('achievements') },
          ].map(f => (
            <div key={f.title} onClick={f.onClick} className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${f.gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
              <div className="relative">
                <span className="text-3xl">{f.emoji}</span>
                <h3 className="font-bold text-gray-900 dark:text-white mt-3 text-lg">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{f.desc}</p>
                <div className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold bg-gradient-to-r ${f.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>Starten <ArrowRight className="w-4 h-4" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      {achievements.filter(a => a.unlockedAt).length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Neue Erfolge</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.filter(a => a.unlockedAt).slice(0, 6).map(a => (
              <div key={a.id} className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 w-40 text-center">
                <span className="text-3xl">{a.emoji}</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white mt-2">{a.title}</p>
                <p className="text-xs text-gray-400 mt-1">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-500" /> Letzte Aktivitäten</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {recentSessions.map((s, i) => (
              <div key={s.id} className={`flex items-center justify-between p-4 ${i !== recentSessions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${s.type === 'quiz' ? 'bg-emerald-500' : s.type === 'match' ? 'bg-lime-500' : 'bg-teal-500'}`}>
                    {s.type === 'quiz' ? '🎮' : s.type === 'match' ? '🎯' : '🃏'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(s.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 dark:text-white">{s.score}/{s.total}</span>
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                    <div className={`h-full rounded-full ${s.total > 0 && s.score / s.total >= 0.7 ? 'bg-emerald-500' : s.total > 0 && s.score / s.total >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.total > 0 ? (s.score / s.total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900 dark:text-white">📅 Klausur eintragen</h3><button onClick={() => setShowExamModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <input value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="Fach / Titel..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <select value={examSubject} onChange={e => setExamSubject(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
            </select>
            <button onClick={handleAddExam} disabled={!examTitle.trim() || !examDate} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl disabled:opacity-30 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Eintragen</button>
          </div>
        </div>
      )}
    </div>
  );
}

const examColors = ['bg-red-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500'];
