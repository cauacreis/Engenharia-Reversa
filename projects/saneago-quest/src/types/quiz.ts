export type UnitId = 'portugues' | 'matematica' | 'informatica' | 'saneago';

export type QuestionDifficulty = 'facil' | 'medio' | 'dificil';

export type QuestionType =
  | 'multiple-choice'
  | 'fill-blank'
  | 'true-false'
  | 'match-pairs';

export interface BaseQuestion {
  id: string;
  unitId: UnitId;
  lessonId: string;
  topic: string;
  sourceSection: string;
  difficulty: QuestionDifficulty;
  prompt: string;
  /** Micro-macete exibido imediatamente após confirmar a resposta no modo treino/revisão e no gabarito do simulado */
  tip: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctIndex: number;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  sentenceBefore: string;
  sentenceAfter: string;
  options: string[];
  correctAnswer: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  statement: string;
  correctAnswer: boolean;
}

export interface MatchPairItem {
  id: string;
  left: string;
  right: string;
}

export interface MatchPairsQuestion extends BaseQuestion {
  type: 'match-pairs';
  leftLabel?: string;
  rightLabel?: string;
  pairs: MatchPairItem[];
}

export type Question =
  | MultipleChoiceQuestion
  | FillBlankQuestion
  | TrueFalseQuestion
  | MatchPairsQuestion;

export interface UnitMeta {
  id: UnitId;
  number: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  badgeText: string;
  accentColor: string;
  shadeColor: string;
  softBg: string;
  lessonCount: number;
  simuladoDurationMinutes: number;
  simuladoQuestionCount: number;
}

export interface LessonMeta {
  id: string;
  unitId: UnitId;
  order: number;
  title: string;
  subtitle: string;
  xpReward: number;
}

export interface LessonCompletion {
  completions: number;
  bestAccuracy: number;
  lastCompletedAt: string;
}

export interface MistakeRecord {
  questionId: string;
  wrongCount: number;
  lastWrongAt: string;
}

export interface SimuladoRecord {
  id: string;
  scope: UnitId | 'geral';
  score: number;
  total: number;
  accuracy: number;
  durationSeconds: number;
  completedAt: string;
}

export interface UserProgress {
  schemaVersion: 1;
  xp: number;
  dailyXp: number;
  dailyXpDate: string;
  dailyGoalXp: number;
  hearts: number;
  maxHearts: number;
  streak: number;
  lastStudyDate: string | null;
  completedLessons: Record<string, LessonCompletion>;
  mistakes: Record<string, MistakeRecord>;
  simuladoHistory: SimuladoRecord[];
  examChecklist: Record<string, boolean>;
  soundEnabled: boolean;
}

export type AppTab = 'trilha' | 'erros' | 'simulados' | 'prova';

export type QuizSessionMode = 'lesson' | 'mistake-review' | 'simulado';

export interface SimuladoReviewItem {
  question: Question;
  userAnswerSummary: string;
  correctAnswerSummary: string;
  isCorrect: boolean;
}

export interface QuizSummaryData {
  mode: QuizSessionMode;
  title: string;
  unitId?: UnitId;
  lessonId?: string;
  simuladoScope?: UnitId | 'geral';
  correctCount: number;
  totalCount: number;
  accuracy: number;
  xpEarned: number;
  maxCombo: number;
  heartsRecovered: number;
  durationSeconds: number;
  timedOut?: boolean;
  reviewItems?: SimuladoReviewItem[];
}
