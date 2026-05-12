import { AppData, StudySession, DEFAULT_ACHIEVEMENTS } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'learnit_data';

const defaultData: AppData = {
  quizzes: [],
  flashcardDecks: [],
  notes: [],
  studySessions: [],
  pomodoroSettings: { workMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 },
  streak: { currentStreak: 0, longestStreak: 0, lastStudyDate: null },
  achievements: [...DEFAULT_ACHIEVEMENTS],
  exams: [],
  weeklyGoal: { target: 5, unit: 'sessions' },
  studyMinutesThisWeek: 0,
  studyMinutesWeekStart: getWeekStart(),
};

function getWeekStart(): number {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const data: AppData = {
        ...defaultData,
        ...parsed,
        pomodoroSettings: { ...defaultData.pomodoroSettings, ...(parsed.pomodoroSettings || {}) },
        streak: { ...defaultData.streak, ...(parsed.streak || {}) },
        weeklyGoal: { ...defaultData.weeklyGoal, ...(parsed.weeklyGoal || {}) },
      };
      if (!data.achievements || data.achievements.length === 0) data.achievements = [...DEFAULT_ACHIEVEMENTS];
      if (!data.exams) data.exams = [];

      // Migrate flashcards with new fields
      data.flashcardDecks = (data.flashcardDecks as any[]).map((d: any) => ({
        ...d, subject: d.subject || '',
        cards: (d.cards as any[]).map((c: any) => ({
          difficulty: 2, nextReview: 0, reviewCount: 0, ...c,
        })),
      }));
      data.quizzes = (data.quizzes as any[]).map((q: any) => ({
        ...q, subject: q.subject || '',
        questions: (q.questions as any[]).map((question: any) => ({
          type: 'multiple-choice' as const, correctAnswerIndex: 0, correctAnswerIndexes: [], correctBoolean: true, items: [], ...question,
        })),
      }));
      data.notes = (data.notes as any[]).map((n: any) => ({ ...n, subject: n.subject || '' }));
      data.studySessions = (data.studySessions as any[]).map((s: any) => ({ ...s, subject: s.subject || '' }));
      return data;
    }
  } catch (e) { console.error('Error loading data:', e); }
  return defaultData;
}

export function saveData(data: AppData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.error('Error saving data:', e); }
}

export function exportData(data: AppData): string { return JSON.stringify(data, null, 2); }

export function importData(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.quizzes || parsed.flashcardDecks || parsed.notes) return { ...defaultData, ...parsed };
    return null;
  } catch { return null; }
}

export function saveQuiz(data: AppData, quiz: any): AppData {
  const existing = data.quizzes.findIndex(q => q.id === quiz.id);
  if (existing >= 0) { const u = [...data.quizzes]; u[existing] = quiz; return { ...data, quizzes: u }; }
  return { ...data, quizzes: [...data.quizzes, quiz] };
}
export function deleteQuiz(data: AppData, id: string): AppData { return { ...data, quizzes: data.quizzes.filter(q => q.id !== id) }; }
export function saveDeck(data: AppData, deck: any): AppData {
  const existing = data.flashcardDecks.findIndex(d => d.id === deck.id);
  if (existing >= 0) { const u = [...data.flashcardDecks]; u[existing] = deck; return { ...data, flashcardDecks: u }; }
  return { ...data, flashcardDecks: [...data.flashcardDecks, deck] };
}
export function deleteDeck(data: AppData, id: string): AppData { return { ...data, flashcardDecks: data.flashcardDecks.filter(d => d.id !== id) }; }
export function saveNote(data: AppData, note: any): AppData {
  const existing = data.notes.findIndex(n => n.id === note.id);
  if (existing >= 0) { const u = [...data.notes]; u[existing] = note; return { ...data, notes: u }; }
  return { ...data, notes: [note, ...data.notes] };
}
export function deleteNote(data: AppData, id: string): AppData { return { ...data, notes: data.notes.filter(n => n.id !== id) }; }

export function addStudySession(data: AppData, session: StudySession): AppData {
  const today = new Date().toISOString().slice(0, 10);
  const streak = { ...data.streak };
  if (streak.lastStudyDate !== today) {
    if (streak.lastStudyDate) {
      const diff = Math.floor((new Date(today).getTime() - new Date(streak.lastStudyDate).getTime()) / (1000 * 60 * 60 * 24));
      streak.currentStreak = diff === 1 ? streak.currentStreak + 1 : 1;
    } else { streak.currentStreak = 1; }
    streak.lastStudyDate = today;
    if (streak.currentStreak > streak.longestStreak) streak.longestStreak = streak.currentStreak;
  }

  // Check time-based achievements
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) checkAndUnlock(data, 'night-owl');
  if (hour >= 5 && hour < 8) checkAndUnlock(data, 'early-bird');

  const quizSessions = data.studySessions.filter(s => s.type === 'quiz');
  const cardSessions = data.studySessions.filter(s => s.type === 'flashcard');
  if (session.type === 'quiz') {
    if (quizSessions.length === 0) checkAndUnlock(data, 'first-quiz');
    if (quizSessions.length + 1 >= 5) checkAndUnlock(data, 'quiz-master-5');
    if (quizSessions.length + 1 >= 20) checkAndUnlock(data, 'quiz-master-20');
    if (session.total > 0 && session.score === session.total) checkAndUnlock(data, 'perfect-score');
  }
  if (session.type === 'flashcard') { if (cardSessions.length === 0) checkAndUnlock(data, 'first-deck'); }
  if (session.type === 'match') { checkAndUnlock(data, 'match-winner'); }
  if (streak.currentStreak >= 3) checkAndUnlock(data, 'streak-3');
  if (streak.currentStreak >= 7) checkAndUnlock(data, 'streak-7');
  if (streak.currentStreak >= 30) checkAndUnlock(data, 'streak-30');

  // Check total cards mastered
  const totalMastered = data.flashcardDecks.reduce((a, d) => a + d.cards.filter(c => c.mastered).length, 0);
  if (totalMastered >= 50) checkAndUnlock(data, 'cards-50');
  if (totalMastered >= 200) checkAndUnlock(data, 'cards-200');

  return { ...data, studySessions: [session, ...data.studySessions].slice(0, 200), streak };
}

export function checkAndUnlock(data: AppData, achievementId: string): void {
  const a = data.achievements.find(x => x.id === achievementId);
  if (a && !a.unlockedAt) a.unlockedAt = Date.now();
}

export function checkNoteAchievements(data: AppData): void {
  if (data.notes.length >= 1) checkAndUnlock(data, 'first-note');
  if (data.notes.length >= 10) checkAndUnlock(data, 'notes-10');
}

export function checkDeckAchievements(data: AppData): void {
  if (data.flashcardDecks.length >= 1) checkAndUnlock(data, 'first-deck');
}

export function checkQuizCreatedAchievement(data: AppData): void {
  if (data.quizzes.length >= 1) checkAndUnlock(data, 'first-quiz');
}

export function generateId(): string { return uuidv4(); }
