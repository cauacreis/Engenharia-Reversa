export type UnitId = 'portugues' | 'matematica' | 'informatica' | 'saneago';

export type QuestionDifficulty = 'medium' | 'hard' | 'legendary';

export type DifficultyMode = 'balanced' | 'hard' | 'legendary';

export type LessonMasteryLevel = 0 | 1 | 2 | 3;

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
  sourceTag?: string;
  difficulty: QuestionDifficulty;
  /** Texto-base opcional (ex.: passagem densa de interpretação ou conjunto de assertivas I, II, III) */
  contextText?: string;
  prompt: string;
  /** Micro-macete exibido imediatamente após confirmar a resposta no modo treino/revisão e no gabarito do simulado */
  tip: string;
  isAIGenerated?: boolean;
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

export interface LessonProgress {
  level: LessonMasteryLevel; // 0: não iniciada, 1: concluída, 2: aprimorada, 3: Lendária/Dourada
  completions: number;
  bestAccuracy: number;
  lastCompletedAt: string;
  goldenCompletedAt?: string;
}

export type LessonCompletion = LessonProgress;

export interface MistakeRecord {
  questionId: string;
  wrongCount: number;
  lastWrongAt: string;
  lastUserAnswer?: string;
  correctAnswer?: string;
  topic?: string;
  unitId?: UnitId;
  promptSnapshot?: string;
  tipSnapshot?: string;
}

export interface PerformanceBucket {
  attempts: number;
  correct: number;
  totalTimeMs: number;
}

export interface TopicStatBucket extends PerformanceBucket {
  unitId: UnitId;
  topic: string;
}

export interface AnswerAttemptLog {
  questionId: string;
  unitId: UnitId;
  topic: string;
  isCorrect: boolean;
  timeMs: number;
  userAnswer: string;
  correctAnswer: string;
  timestamp: string;
}

export interface GroqDiagnosisReport {
  detectedPattern: string;
  keyRuleSummary: string;
  priorityTopics: string[];
  focusUnitId: UnitId;
  actionPlanSteps: string[];
  generatedAt: string;
  source: 'groq' | 'offline-fallback';
  modelUsed?: string;
}

export interface SavedAIQuestionPack {
  id: string;
  title: string;
  scope: UnitId | 'geral' | 'corretivo';
  mode: 'lesson' | 'simulado';
  createdAt: string;
  modelUsed?: string;
  questions: Question[];
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
  lessonProgress: Record<string, LessonProgress>;
  completedLessons: Record<string, LessonProgress>;
  seenQuestionIds: string[];
  preferredDifficulty: DifficultyMode;
  mistakes: Record<string, MistakeRecord>;
  simuladoHistory: SimuladoRecord[];
  examChecklist: Record<string, boolean>;
  soundEnabled: boolean;
  unitStats: Record<UnitId, PerformanceBucket>;
  topicStats: Record<string, TopicStatBucket>;
  recentAttempts: AnswerAttemptLog[];
  lastDiagnosis: GroqDiagnosisReport | null;
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
  isGoldenChallenge?: boolean;
  goldenVictory?: boolean;
  newLessonLevel?: LessonMasteryLevel;
  difficultyMode?: DifficultyMode;
  reviewItems?: SimuladoReviewItem[];
}

export interface GuideKeyRule {
  title: string;
  mnemonic: string;
  explanation: string;
  formula?: string;
}

export interface GuideComparisonExample {
  correct: string;
  wrong: string;
  explanation: string;
}

export interface GuideCheatSheetTable {
  title: string;
  headers: string[];
  rows: string[][];
  monoColumns?: number[];
}

export interface LessonGuide {
  lessonId: string;
  unitId: UnitId;
  title: string;
  summary: string;
  mascotWelcome: string;
  keyRules: GuideKeyRule[];
  examples: GuideComparisonExample[];
  cheatSheetTable?: GuideCheatSheetTable;
}

export interface UnitGuideOverview {
  unitId: UnitId;
  title: string;
  intro: string;
  examTip: string;
  mascotSpeech: string;
}
