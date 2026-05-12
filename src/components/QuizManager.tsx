import { useState, useEffect, useCallback, useRef } from 'react';
import { Quiz, QuizQuestion, QuestionType, SUBJECTS, getSubjectEmoji, getSubjectLabel } from '../types';
import { generateId } from '../store';
import { Plus, Trash2, Play, Edit3, ChevronRight, ChevronLeft, X, Check, Clock, Home, RotateCcw, Star, Zap, Users, Search, GripVertical } from 'lucide-react';

const defaultQuestion = (): QuizQuestion => ({
  id: generateId(),
  type: 'multiple-choice',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswerIndex: 0,
  correctAnswerIndexes: [],
  correctBoolean: true,
  items: ['', '', '', ''],
  timeLimit: 20,
});

const typeConfig: Record<QuestionType, { label: string; emoji: string; color: string; desc: string; points: string }> = {
  'multiple-choice': { label: 'Multiple Choice', emoji: '🔵', color: 'bg-blue-500', desc: 'Eine richtige Antwort', points: '500pts' },
  'multiple-select': { label: 'Mehrfachauswahl', emoji: '☑️', color: 'bg-purple-500', desc: 'Mehrere richtige Antworten (2x Punkte!)', points: '1000pts' },
  'true-false': { label: 'Wahr / Falsch', emoji: '✅', color: 'bg-emerald-500', desc: 'Richtig oder Falsch?', points: '300pts' },
  'order': { label: 'Reihenfolge', emoji: '🔢', color: 'bg-orange-500', desc: 'In die richtige Reihenfolge bringen', points: '1000pts' },
};

// ==================== QUIZ LIST ====================
interface QuizListProps {
  quizzes: Quiz[];
  onPlay: (quiz: Quiz) => void;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quizId: string) => void;
  onCreate: () => void;
  onBack: () => void;
}

export function QuizList({ quizzes, onPlay, onEdit, onDelete, onCreate, onBack }: QuizListProps) {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const filtered = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.description.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = !subjectFilter || q.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">← Zurück</button>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">🎮 Meine Quizzes</h1>
        <div />
      </div>

      <button onClick={onCreate} className="w-full p-5 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-2xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-3 text-lg font-bold">
        <Plus className="w-6 h-6" /> Neues Quiz erstellen
      </button>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">🎯</span>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mt-4">{quizzes.length === 0 ? 'Noch keine Quizzes' : 'Keine Ergebnisse'}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Erstelle dein erstes Quiz!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(quiz => {
            const typeBreakdown = quiz.questions.reduce((acc, q) => { acc[q.type] = (acc[q.type] || 0) + 1; return acc; }, {} as Record<string, number>);
            return (
              <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
                      {quiz.subject && <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">{getSubjectEmoji(quiz.subject)} {getSubjectLabel(quiz.subject)}</span>}
                    </div>
                    {quiz.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{quiz.description}</p>}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs font-medium px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">{quiz.questions.length} Frage{quiz.questions.length !== 1 ? 'n' : ''}</span>
                      {Object.entries(typeBreakdown).map(([type, count]) => (
                        <span key={type} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
                          {typeConfig[type as QuestionType]?.emoji} {count}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400">{new Date(quiz.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(quiz)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-300" /></button>
                    <button onClick={() => onDelete(quiz.id)} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    <button onClick={() => onPlay(quiz)} className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-400 hover:to-purple-500 transition-all flex items-center gap-2 shadow-lg"><Play className="w-4 h-4" /> Spielen</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== QUIZ CREATOR ====================
interface QuizCreatorProps {
  existingQuiz: Quiz | null;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export function QuizCreator({ existingQuiz, onSave, onCancel }: QuizCreatorProps) {
  const [title, setTitle] = useState(existingQuiz?.title || '');
  const [description, setDescription] = useState(existingQuiz?.description || '');
  const [subject, setSubject] = useState(existingQuiz?.subject || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(existingQuiz?.questions?.length ? existingQuiz.questions : [defaultQuestion()]);
  const [currentQ, setCurrentQ] = useState(0);

  const addQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
    setCurrentQ(questions.length);
  };

  const updateQuestion = (index: number, field: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...field };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
    if (currentQ >= questions.length - 1) setCurrentQ(Math.max(0, questions.length - 2));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const validQuestions = questions.filter(q => {
      if (!q.questionText.trim()) return false;
      if (q.type === 'order') return q.items.filter(i => i.trim()).length >= 2;
      if (q.type === 'true-false') return true;
      return q.options.some(o => o.trim());
    });
    if (validQuestions.length === 0) return;
    onSave({
      id: existingQuiz?.id || generateId(),
      title: title.trim(),
      description: description.trim(),
      subject,
      questions: validQuestions,
      createdAt: existingQuiz?.createdAt || Date.now(),
    });
  };

  const q = questions[currentQ];
  if (!q) return null;

  const optionColors = ['🔴 A', '🔵 B', '🟡 C', '🟢 D'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">← Abbrechen</button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">{existingQuiz ? 'Quiz bearbeiten' : 'Neues Quiz'} ✏️</h1>
        <div />
      </div>

      {/* Title & Meta */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Quiz-Titel..." className="w-full text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400" />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschreibung (optional)..." className="w-full bg-transparent border-none outline-none text-gray-600 dark:text-gray-300 placeholder-gray-400 text-sm" />
        <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
          {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
        </select>
      </div>

      {/* Question Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {questions.map((qq, i) => (
          <button key={qq.id} onClick={() => setCurrentQ(i)} className={`flex-shrink-0 w-10 h-10 rounded-xl font-bold text-sm transition-all ${i === currentQ ? 'bg-indigo-500 text-white shadow-lg scale-110' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}>
            {i + 1}
          </button>
        ))}
        <button onClick={addQuestion} className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"><Plus className="w-5 h-5 mx-auto" /></button>
      </div>

      {/* Question Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-700 dark:text-gray-300">Frage {currentQ + 1}</h3>
          {questions.length > 1 && <button onClick={() => removeQuestion(currentQ)} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Entfernen</button>}
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.entries(typeConfig) as [QuestionType, typeof typeConfig[QuestionType]][]).map(([type, config]) => (
            <button key={type} onClick={() => updateQuestion(currentQ, { type })} className={`p-3 rounded-xl border-2 text-center transition-all ${q.type === type ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
              <span className="text-lg">{config.emoji}</span>
              <p className="text-xs font-bold mt-1 text-gray-700 dark:text-gray-300">{config.label}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{typeConfig[q.type].desc} • {typeConfig[q.type].points}</p>

        {/* Question text */}
        <textarea value={q.questionText} onChange={e => updateQuestion(currentQ, { questionText: e.target.value })} placeholder="Frage eingeben..." rows={2} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />

        {/* Type-specific options */}
        {q.type === 'multiple-choice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <div key={i} className={`relative rounded-xl border-2 transition-all ${q.correctAnswerIndex === i ? 'border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-800' : 'border-gray-200 dark:border-gray-600'}`}>
                <span className="absolute top-2.5 left-3 text-xs font-bold text-gray-400">{optionColors[i]}</span>
                <input value={opt} onChange={e => { const o = [...q.options]; o[i] = e.target.value; updateQuestion(currentQ, { options: o }); }} placeholder={`Antwort ${String.fromCharCode(65 + i)}...`} className="w-full pl-14 pr-10 py-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400" />
                <button onClick={() => updateQuestion(currentQ, { correctAnswerIndex: i })} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${q.correctAnswerIndex === i ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-400'}`}><Check className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}

        {q.type === 'multiple-select' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const isSelected = q.correctAnswerIndexes.includes(i);
              return (
                <div key={i} className={`relative rounded-xl border-2 transition-all ${isSelected ? 'border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800' : 'border-gray-200 dark:border-gray-600'}`}>
                  <span className="absolute top-2.5 left-3 text-xs font-bold text-gray-400">{optionColors[i]}</span>
                  <input value={opt} onChange={e => { const o = [...q.options]; o[i] = e.target.value; updateQuestion(currentQ, { options: o }); }} placeholder={`Antwort ${String.fromCharCode(65 + i)}...`} className="w-full pl-14 pr-10 py-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400" />
                  <button onClick={() => {
                    const indexes = isSelected ? q.correctAnswerIndexes.filter(x => x !== i) : [...q.correctAnswerIndexes, i];
                    updateQuestion(currentQ, { correctAnswerIndexes: indexes });
                  }} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-400'}`}>
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <span className="text-xs">☐</span>}
                  </button>
                </div>
              );
            })}
            <p className="col-span-full text-xs text-purple-500 font-medium">☑️ Wähle alle richtigen Antworten aus (2x Punkte!)</p>
          </div>
        )}

        {q.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => updateQuestion(currentQ, { correctBoolean: true })} className={`py-6 rounded-xl border-2 font-bold text-lg transition-all ${q.correctBoolean ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-800' : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-gray-300'}`}>
              ✅ Wahr
            </button>
            <button onClick={() => updateQuestion(currentQ, { correctBoolean: false })} className={`py-6 rounded-xl border-2 font-bold text-lg transition-all ${!q.correctBoolean ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-2 ring-red-200 dark:ring-red-800' : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-gray-300'}`}>
              ❌ Falsch
            </button>
          </div>
        )}

        {q.type === 'order' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">📌 Gib die Elemente in der richtigen Reihenfolge ein:</p>
            {q.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center font-bold text-sm">{i + 1}</div>
                <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <input value={item} onChange={e => { const items = [...q.items]; items[i] = e.target.value; updateQuestion(currentQ, { items }); }} placeholder={`Position ${i + 1}...`} className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                {q.items.length > 2 && <button onClick={() => { const items = q.items.filter((_, idx) => idx !== i); updateQuestion(currentQ, { items }); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>}
              </div>
            ))}
            <button onClick={() => updateQuestion(currentQ, { items: [...q.items, ''] })} className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl text-gray-400 hover:text-gray-500 hover:border-gray-300 text-sm font-medium flex items-center justify-center gap-1"><Plus className="w-4 h-4" /> Element hinzufügen</button>
          </div>
        )}

        {/* Time limit */}
        <div className="flex items-center gap-3 flex-wrap">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Zeit:</span>
          {[10, 15, 20, 30, 45, 60].map(t => (
            <button key={t} onClick={() => updateQuestion(currentQ, { timeLimit: t })} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${q.timeLimit === t ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>{t}s</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-30 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Zurück</button>
        <button onClick={handleSave} disabled={!title.trim() || questions.filter(q => q.questionText.trim()).length === 0} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold disabled:opacity-30 shadow-lg flex items-center gap-2"><Check className="w-4 h-4" /> Speichern</button>
        <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))} disabled={currentQ === questions.length - 1} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-30 flex items-center gap-1">Weiter <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ==================== QUIZ PLAY ====================
interface QuizPlayProps {
  quiz: Quiz;
  onFinish: (score: number, total: number) => void;
  onBack: () => void;
}

export function QuizPlay({ quiz, onFinish, onBack }: QuizPlayProps) {
  const [phase, setPhase] = useState<'intro' | 'question' | 'feedback' | 'results'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [practiceMode, setPracticeMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = quiz.questions[currentQ];
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const correctCount = scores.filter(s => s > 0).length;

  const getBasePoints = (type: QuestionType) => {
    switch (type) {
      case 'multiple-choice': return 500;
      case 'multiple-select': return 1000;
      case 'true-false': return 300;
      case 'order': return 1000;
    }
  };

  const startQuestion = useCallback(() => {
    if (!q) return;
    setPhase('question');
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setUserOrder([]);
    setTimeLeft(q.timeLimit);
  }, [q]);

  useEffect(() => {
    if (phase === 'question' && timeLeft > 0 && !practiceMode) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    if (phase === 'question' && timeLeft === 0 && selectedAnswer === null && selectedAnswers.length === 0 && userOrder.length === 0 && !practiceMode) {
      setScores(prev => [...prev, 0]);
      setPhase('feedback');
    }
  }, [phase, timeLeft, selectedAnswer, selectedAnswers, userOrder, practiceMode]);

  const handleMultipleChoiceAnswer = (index: number) => {
    if (selectedAnswer !== null || phase !== 'question') return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(index);
    const isCorrect = index === q.correctAnswerIndex;
    const base = getBasePoints(q.type);
    const timeBonus = isCorrect ? Math.round((timeLeft / q.timeLimit) * base) : 0;
    setScores(prev => [...prev, isCorrect ? base + timeBonus : 0]);
    setTimeout(() => setPhase('feedback'), 200);
  };

  const handleMultipleSelectSubmit = () => {
    if (phase !== 'question') return;
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = q.correctAnswerIndexes.sort().join(',') === [...selectedAnswers].sort().join(',');
    const base = getBasePoints(q.type);
    const timeBonus = correct ? Math.round((timeLeft / q.timeLimit) * base) : 0;
    setScores(prev => [...prev, correct ? base + timeBonus : 0]);
    setPhase('feedback');
  };

  const toggleMultipleSelectAnswer = (index: number) => {
    if (phase !== 'question') return;
    setSelectedAnswers(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const handleTrueFalseAnswer = (value: boolean) => {
    if (selectedAnswer !== null || phase !== 'question') return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(value ? 1 : 0);
    const isCorrect = value === q.correctBoolean;
    const base = getBasePoints(q.type);
    const timeBonus = isCorrect ? Math.round((timeLeft / q.timeLimit) * base) : 0;
    setScores(prev => [...prev, isCorrect ? base + timeBonus : 0]);
    setTimeout(() => setPhase('feedback'), 200);
  };

  const handleOrderTap = (shuffledIndex: number) => {
    if (phase !== 'question') return;
    const originalIndex = shuffledOrder.current[shuffledIndex];
    if (userOrder.includes(originalIndex)) {
      setUserOrder(prev => prev.filter(i => i !== originalIndex));
    } else {
      setUserOrder(prev => [...prev, originalIndex]);
    }
  };

  const handleOrderSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const isCorrect = userOrder.every((val, idx) => val === idx);
    const base = getBasePoints(q.type);
    const timeBonus = isCorrect ? Math.round((timeLeft / q.timeLimit) * base) : 0;
    setScores(prev => [...prev, isCorrect ? base + timeBonus : 0]);
    setPhase('feedback');
  };

  // Shuffle order for order questions
  const shuffledOrder = useRef<number[]>([]);
  useEffect(() => {
    if (q?.type === 'order' && phase === 'question') {
      const indices = q.items.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      shuffledOrder.current = indices;
    }
  }, [currentQ, phase, q]);

  const nextQuestion = () => {
    if (currentQ + 1 >= quiz.questions.length) {
      setPhase('results');
    } else {
      setCurrentQ(prev => prev + 1);
      startQuestion();
    }
  };

  const handleFinish = () => {
    onFinish(correctCount, quiz.questions.length);
  };

  const restart = () => {
    setPhase('intro');
    setCurrentQ(0);
    setScores([]);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setUserOrder([]);
  };

  // INTRO
  if (phase === 'intro') {
    const typeBreakdown = quiz.questions.reduce((acc, qq) => { acc[qq.type] = (acc[qq.type] || 0) + 1; return acc; }, {} as Record<string, number>);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-2xl mb-6"><Users className="w-10 h-10 text-white" /></div>
          <h1 className="text-4xl font-black text-white mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-purple-200 text-lg mb-2">{quiz.description}</p>}
          {quiz.subject && <p className="text-purple-300 text-sm mb-4">{getSubjectEmoji(quiz.subject)} {getSubjectLabel(quiz.subject)}</p>}
          <div className="flex items-center justify-center gap-3 flex-wrap text-purple-200 mb-2">
            <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> {quiz.questions.length} Fragen</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Je max. {quiz.questions[0]?.timeLimit || 20}s</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <span key={type} className="text-xs px-2 py-1 bg-white/10 rounded-lg text-purple-200">{typeConfig[type as QuestionType]?.emoji} {count}x {typeConfig[type as QuestionType]?.label}</span>
            ))}
          </div>
          {/* Practice mode toggle */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button onClick={() => setPracticeMode(false)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${!practiceMode ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>🎮 Punktemodus</button>
            <button onClick={() => setPracticeMode(true)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${practiceMode ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>📖 Lernmodus</button>
          </div>
          {practiceMode && <p className="text-purple-300 text-sm mb-4">💡 Kein Timer, kein Druck – einfach lernen!</p>}
          <button onClick={startQuestion} className="px-8 py-4 bg-white text-indigo-700 font-black text-xl rounded-2xl hover:bg-yellow-400 hover:text-gray-900 transition-all shadow-2xl hover:scale-105 active:scale-95">🚀 Los geht's!</button>
          <button onClick={onBack} className="block mx-auto mt-4 text-purple-300 hover:text-white text-sm">Zurück</button>
        </div>
      </div>
    );
  }

  // RESULTS
  if (phase === 'results') {
    const percentage = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 0;
    const grade = percentage >= 90 ? { emoji: '🏆', text: 'Unglaublich!' } : percentage >= 70 ? { emoji: '🌟', text: 'Sehr gut!' } : percentage >= 50 ? { emoji: '👍', text: 'Gut gemacht!' } : percentage >= 30 ? { emoji: '💪', text: 'Weiter üben!' } : { emoji: '📚', text: 'Nicht aufgeben!' };
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full border border-white/20 text-center">
          <span className="text-6xl">{grade.emoji}</span>
          <h2 className="text-3xl font-black text-white mt-4">{grade.text}</h2>
          <p className="text-purple-200 mt-2 text-lg">{quiz.title}</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-white">{correctCount}/{quiz.questions.length}</p><p className="text-purple-300 text-xs">Richtig</p></div>
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-yellow-400">{practiceMode ? '–' : totalScore}</p><p className="text-purple-300 text-xs">{practiceMode ? 'Lernmodus' : 'Punkte'}</p></div>
            <div className="bg-white/10 rounded-xl p-3"><p className="text-2xl font-black text-white">{percentage}%</p><p className="text-purple-300 text-xs">Quote</p></div>
          </div>
          <div className="mt-6 space-y-1.5 max-h-48 overflow-y-auto">
            {quiz.questions.map((question, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${scores[i] > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                <span>{scores[i] > 0 ? '✅' : '❌'}</span>
                <span className="text-white truncate flex-1 text-left">{question.questionText}</span>
                <span className="text-xs text-purple-300">{typeConfig[question.type]?.emoji}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={restart} className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Nochmal</button>
            <button onClick={handleFinish} className="flex-1 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-yellow-400 hover:text-gray-900 flex items-center justify-center gap-2"><Home className="w-4 h-4" /> Fertig</button>
          </div>
        </div>
      </div>
    );
  }

  // QUESTION / FEEDBACK
  const optionBgColors = ['bg-red-500 hover:bg-red-400', 'bg-blue-500 hover:bg-blue-400', 'bg-yellow-500 hover:bg-yellow-400', 'bg-green-500 hover:bg-green-400'];
  const optionShapes = ['▲', '◆', '●', '■'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 flex flex-col">
      {/* Top bar */}
      <div className="p-4 flex items-center justify-between">
        <span className="text-white/70 text-sm font-medium">{currentQ + 1} / {quiz.questions.length}</span>
        <span className="text-xs text-white/50">{typeConfig[q.type]?.emoji} {typeConfig[q.type]?.label}</span>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-bold">{practiceMode ? '📖' : totalScore}</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="mx-4 h-2 bg-white/20 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft > (q.timeLimit * 0.5) ? 'bg-emerald-400' : timeLeft > (q.timeLimit * 0.25) ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${(timeLeft / q.timeLimit) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/20 text-center mb-6">
          {!practiceMode && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className={`w-5 h-5 ${timeLeft <= 5 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-purple-300'}`} />
              <span className={`text-lg font-bold ${timeLeft <= 5 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-white">{q.questionText}</h2>
        </div>

        {/* Answer area based on type */}
        <div className="max-w-2xl w-full">
          {/* MULTIPLE CHOICE */}
          {q.type === 'multiple-choice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctAnswerIndex;
                const isSelected = selectedAnswer === i;
                let cls = `${optionBgColors[i]} text-white font-bold py-4 px-5 rounded-2xl text-left transition-all flex items-center gap-3 `;
                if (phase === 'feedback') {
                  if (isCorrect) cls = 'bg-emerald-500 text-white font-bold py-4 px-5 rounded-2xl text-left transition-all flex items-center gap-3 ring-4 ring-emerald-300 scale-[1.02] ';
                  else if (isSelected) cls = 'bg-red-600 text-white font-bold py-4 px-5 rounded-2xl text-left transition-all flex items-center gap-3 opacity-70 ';
                  else cls = 'bg-gray-500/30 text-gray-300 font-bold py-4 px-5 rounded-2xl text-left transition-all flex items-center gap-3 opacity-40 ';
                } else if (selectedAnswer !== null) cls += 'pointer-events-none ';
                else cls += 'hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer ';
                return (
                  <button key={i} onClick={() => handleMultipleChoiceAnswer(i)} className={cls} disabled={selectedAnswer !== null || phase === 'feedback'}>
                    <span className="text-2xl">{optionShapes[i]}</span>
                    <span className="flex-1 text-sm sm:text-base">{opt || `Antwort ${String.fromCharCode(65 + i)}`}</span>
                    {phase === 'feedback' && isCorrect && <Check className="w-5 h-5" />}
                    {phase === 'feedback' && isSelected && !isCorrect && <X className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* MULTIPLE SELECT */}
          {q.type === 'multiple-select' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  const isCorrect = q.correctAnswerIndexes.includes(i);
                  const isSelected = selectedAnswers.includes(i);
                  let cls = 'font-bold py-4 px-5 rounded-2xl text-left transition-all flex items-center gap-3 ';
                  if (phase === 'feedback') {
                    if (isCorrect) cls += 'bg-emerald-500 text-white ring-4 ring-emerald-300 ';
                    else if (isSelected && !isCorrect) cls += 'bg-red-600 text-white opacity-70 ';
                    else cls += 'bg-gray-500/30 text-gray-300 opacity-40 ';
                  } else {
                    cls += `${isSelected ? optionBgColors[i] + ' ring-4 ring-white/30 scale-[1.02]' : optionBgColors[i]} text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer `;
                  }
                  return (
                    <button key={i} onClick={() => toggleMultipleSelectAnswer(i)} className={cls} disabled={phase === 'feedback'}>
                      <span className="text-xl">{isSelected || (phase === 'feedback' && isCorrect) ? '☑️' : '☐'}</span>
                      <span className="flex-1 text-sm sm:text-base">{opt || `Antwort ${String.fromCharCode(65 + i)}`}</span>
                      {phase === 'feedback' && isCorrect && <Check className="w-5 h-5" />}
                      {phase === 'feedback' && isSelected && !isCorrect && <X className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>
              {phase === 'question' && (
                <button onClick={handleMultipleSelectSubmit} disabled={selectedAnswers.length === 0} className="w-full py-4 bg-white text-indigo-700 font-black rounded-2xl disabled:opacity-30 hover:bg-yellow-400 hover:text-gray-900 transition-all shadow-lg text-lg">✅ Bestätigen ({selectedAnswers.length} ausgewählt)</button>
              )}
            </div>
          )}

          {/* TRUE/FALSE */}
          {q.type === 'true-false' && (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleTrueFalseAnswer(true)} disabled={selectedAnswer !== null || phase === 'feedback'} className={`py-8 rounded-2xl font-bold text-xl transition-all ${
                phase === 'feedback' ? (q.correctBoolean ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 scale-[1.02]' : selectedAnswer === 1 ? 'bg-red-600 text-white opacity-70' : 'bg-gray-500/30 text-gray-300 opacity-40') : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              }`}>
                ✅ Wahr
              </button>
              <button onClick={() => handleTrueFalseAnswer(false)} disabled={selectedAnswer !== null || phase === 'feedback'} className={`py-8 rounded-2xl font-bold text-xl transition-all ${
                phase === 'feedback' ? (!q.correctBoolean ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 scale-[1.02]' : selectedAnswer === 0 ? 'bg-red-600 text-white opacity-70' : 'bg-gray-500/30 text-gray-300 opacity-40') : 'bg-red-500 hover:bg-red-400 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              }`}>
                ❌ Falsch
              </button>
            </div>
          )}

          {/* ORDER */}
          {q.type === 'order' && shuffledOrder.current.length > 0 && (
            <div className="space-y-3">
              {shuffledOrder.current.map((originalIdx, shuffledIdx) => {
                const item = q.items[originalIdx];
                if (!item?.trim()) return null;
                const orderPosition = userOrder.indexOf(originalIdx);
                const isPlaced = orderPosition >= 0;
                const isCorrectPosition = isPlaced && originalIdx === orderPosition;
                let cls = 'w-full py-4 px-5 rounded-2xl font-bold text-left transition-all flex items-center gap-3 ';
                if (phase === 'feedback') {
                  if (isCorrectPosition) cls += 'bg-emerald-500 text-white ring-2 ring-emerald-300 ';
                  else if (isPlaced && !isCorrectPosition) cls += 'bg-red-500 text-white ring-2 ring-red-300 ';
                  else cls += 'bg-gray-500/30 text-gray-300 opacity-40 ';
                } else {
                  cls += isPlaced ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300 scale-[0.97] ' : 'bg-white/20 backdrop-blur text-white shadow-lg hover:bg-white/30 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ';
                }
                return (
                  <button key={shuffledIdx} onClick={() => phase === 'question' && handleOrderTap(shuffledIdx)} className={cls}>
                    {isPlaced ? <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black text-sm">{orderPosition + 1}</span> : <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-lg">{optionShapes[shuffledIdx % 4]}</span>}
                    <span className="flex-1">{item}</span>
                    {phase === 'feedback' && (isCorrectPosition ? <Check className="w-5 h-5" /> : isPlaced ? <X className="w-5 h-5" /> : null)}
                  </button>
                );
              })}
              {phase === 'question' && (
                <button onClick={handleOrderSubmit} disabled={userOrder.length < q.items.filter(i => i.trim()).length} className="w-full py-4 bg-white text-indigo-700 font-black rounded-2xl disabled:opacity-30 hover:bg-yellow-400 hover:text-gray-900 transition-all shadow-lg text-lg">
                  ✅ Reihenfolge bestätigen ({userOrder.length}/{q.items.filter(i => i.trim()).length})
                </button>
              )}
            </div>
          )}

          {/* Feedback */}
          {phase === 'feedback' && (
            <div className="mt-6 text-center space-y-3">
              {(() => {
                const lastScore = scores[scores.length - 1] || 0;
                if (q.type === 'order') {
                  const allCorrect = userOrder.every((val, idx) => val === idx);
                  return allCorrect ? <p className="text-emerald-300 font-bold text-lg">✅ Perfekte Reihenfolge! {!practiceMode && `+${lastScore} Punkte`}</p> : <p className="text-red-300 font-bold text-lg">❌ Reihenfolge nicht ganz richtig!</p>;
                }
                if (q.type === 'multiple-select') {
                  return lastScore > 0 ? <p className="text-emerald-300 font-bold text-lg">✅ Richtig! {!practiceMode && `+${lastScore} Punkte`}</p> : <p className="text-red-300 font-bold text-lg">❌ Falsch! Richtige Antworten: {q.correctAnswerIndexes.map(i => q.options[i]).join(', ')}</p>;
                }
                if (q.type === 'true-false') {
                  return lastScore > 0 ? <p className="text-emerald-300 font-bold text-lg">✅ Richtig! Die Antwort ist {q.correctBoolean ? 'Wahr' : 'Falsch'} {!practiceMode && `+${lastScore} Pkt`}</p> : <p className="text-red-300 font-bold text-lg">❌ Falsch! Die Antwort ist {q.correctBoolean ? 'Wahr' : 'Falsch'}</p>;
                }
                // multiple-choice
                return lastScore > 0 ? <p className="text-emerald-300 font-bold text-lg">✅ Richtig! {!practiceMode && `+${lastScore} Punkte`}</p> : <p className="text-red-300 font-bold text-lg">❌ Falsch! Richtige Antwort: {q.options[q.correctAnswerIndex]}</p>;
              })()}
              <button onClick={nextQuestion} className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition-all shadow-lg flex items-center gap-2 mx-auto">
                {currentQ + 1 >= quiz.questions.length ? 'Ergebnisse' : 'Nächste Frage'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
