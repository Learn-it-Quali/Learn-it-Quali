export type QuestionType = 'multiple-choice' | 'multiple-select' | 'true-false' | 'order';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  correctAnswerIndexes: number[];
  correctBoolean: boolean;
  items: string[];
  timeLimit: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questions: QuizQuestion[];
  createdAt: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  subject: string;
  cards: Flashcard[];
  createdAt: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
  difficulty: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
  nextReview: number;
  reviewCount: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
}

export interface StudySession {
  id: string;
  type: 'quiz' | 'flashcard' | 'match';
  title: string;
  subject: string;
  score: number;
  total: number;
  date: number;
}

export interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt: number | null;
  category: 'quiz' | 'flashcard' | 'streak' | 'general';
}

export interface ExamCountdown {
  id: string;
  title: string;
  date: string;
  subject: string;
  color: string;
}

export interface WeeklyGoal {
  target: number;
  unit: 'minutes' | 'sessions' | 'cards';
}

export type Page =
  | 'dashboard'
  | 'quizzes'
  | 'quiz-create'
  | 'quiz-play'
  | 'flashcards'
  | 'flashcard-create'
  | 'flashcard-study'
  | 'match-game'
  | 'pomodoro'
  | 'notes'
  | 'notes-edit'
  | 'achievements'
  | 'admin'
  | 'settings';

export interface AppData {
  quizzes: Quiz[];
  flashcardDecks: FlashcardDeck[];
  notes: Note[];
  studySessions: StudySession[];
  pomodoroSettings: PomodoroSettings;
  streak: StreakData;
  achievements: Achievement[];
  exams: ExamCountdown[];
  weeklyGoal: WeeklyGoal;
  studyMinutesThisWeek: number;
  studyMinutesWeekStart: number;
}

export const SUBJECTS = [
  { value: '', label: 'Alle Fächer', emoji: '📚' },
  { value: 'mathe', label: 'Mathe', emoji: '🔢' },
  { value: 'deutsch', label: 'Deutsch', emoji: '📖' },
  { value: 'englisch', label: 'Englisch', emoji: '🇬🇧' },
  { value: 'franzoesisch', label: 'Französisch', emoji: '🇫🇷' },
  { value: 'latein', label: 'Latein', emoji: '🏛️' },
  { value: 'physik', label: 'Physik', emoji: '⚡' },
  { value: 'chemie', label: 'Chemie', emoji: '🧪' },
  { value: 'biologie', label: 'Biologie', emoji: '🧬' },
  { value: 'geschichte', label: 'Geschichte', emoji: '📜' },
  { value: 'erdkunde', label: 'Erdkunde', emoji: '🌍' },
  { value: 'politik', label: 'Politik', emoji: '⚖️' },
  { value: 'informatik', label: 'Informatik', emoji: '💻' },
  { value: 'kunst', label: 'Kunst', emoji: '🎨' },
  { value: 'musik', label: 'Musik', emoji: '🎵' },
  { value: 'religion', label: 'Religion', emoji: '🕊️' },
  { value: 'wirtschaft', label: 'Wirtschaft', emoji: '📊' },
  { value: 'sonstiges', label: 'Sonstiges', emoji: '📌' },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-quiz', title: 'Erstes Quiz!', description: 'Erstelle dein erstes Quiz', emoji: '🎮', unlockedAt: null, category: 'quiz' },
  { id: 'quiz-master-5', title: 'Quiz-Meister', description: 'Schließe 5 Quizzes ab', emoji: '🏅', unlockedAt: null, category: 'quiz' },
  { id: 'quiz-master-20', title: 'Quiz-Legende', description: 'Schließe 20 Quizzes ab', emoji: '👑', unlockedAt: null, category: 'quiz' },
  { id: 'perfect-score', title: 'Perfektionist', description: 'Erziele 100% in einem Quiz', emoji: '💯', unlockedAt: null, category: 'quiz' },
  { id: 'first-deck', title: 'Karten-Anfänger', description: 'Erstelle dein erstes Kartendeck', emoji: '🃏', unlockedAt: null, category: 'flashcard' },
  { id: 'cards-50', title: 'Karten-Profi', description: 'Lerne 50 Karteikarten', emoji: '🌟', unlockedAt: null, category: 'flashcard' },
  { id: 'cards-200', title: 'Karten-Champion', description: 'Lerne 200 Karteikarten', emoji: '🏆', unlockedAt: null, category: 'flashcard' },
  { id: 'match-winner', title: 'Match-Sieger', description: 'Gewinne ein Match-Spiel', emoji: '🎯', unlockedAt: null, category: 'flashcard' },
  { id: 'streak-3', title: 'Am Ball', description: '3 Tage Streak', emoji: '🔥', unlockedAt: null, category: 'streak' },
  { id: 'streak-7', title: 'Eine Woche!', description: '7 Tage Streak', emoji: '⚡', unlockedAt: null, category: 'streak' },
  { id: 'streak-30', title: 'Unaufhaltsam', description: '30 Tage Streak', emoji: '🚀', unlockedAt: null, category: 'streak' },
  { id: 'first-note', title: 'Notizen gemacht', description: 'Schreibe deine erste Notiz', emoji: '📝', unlockedAt: null, category: 'general' },
  { id: 'notes-10', title: 'Schreiberling', description: 'Schreibe 10 Notizen', emoji: '✍️', unlockedAt: null, category: 'general' },
  { id: 'night-owl', title: 'Nachteule', description: 'Lerne nach 22 Uhr', emoji: '🦉', unlockedAt: null, category: 'general' },
  { id: 'early-bird', title: 'Frühaufsteher', description: 'Lerne vor 8 Uhr', emoji: '🌅', unlockedAt: null, category: 'general' },
  { id: 'pomodoro-5', title: 'Fokus-Meister', description: 'Schließe 5 Pomodoro-Sessions ab', emoji: '🍅', unlockedAt: null, category: 'general' },
];

export function getSubjectEmoji(subject: string): string {
  return SUBJECTS.find(s => s.value === subject)?.emoji || '📚';
}

export function getSubjectLabel(subject: string): string {
  if (!subject) return 'Alle Fächer';
  return SUBJECTS.find(s => s.value === subject)?.label || subject;
}
