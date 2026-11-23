import {
  DifficultyMode,
  LessonMasteryLevel,
  LessonProgress,
  PerformanceBucket,
  UnitId,
  UserProgress,
} from '../types/quiz';

export const PROGRESS_STORAGE_KEY = 'saneago_quest_progress_v1';
export const MAX_HEARTS = 5;

function normalizeDifficultyMode(raw: unknown): DifficultyMode {
  if (raw === 'balanced' || raw === 'hard' || raw === 'legendary') {
    return raw;
  }
  return 'balanced';
}

function clampMasteryLevel(rawLevel: unknown, completions: number): LessonMasteryLevel {
  if (rawLevel === 0 || rawLevel === 1 || rawLevel === 2 || rawLevel === 3) {
    return rawLevel;
  }
  if (completions <= 0) return 0;
  return (completions >= 2 ? 2 : 1) as LessonMasteryLevel;
}

function normalizeLessonProgressMap(
  rawLessonProgress: unknown,
  rawCompletedLessons: unknown
): {
  lessonProgress: Record<string, LessonProgress>;
  completedLessons: Record<string, LessonProgress>;
} {
  const mergedKeys = new Set<string>();
  const lpObj =
    rawLessonProgress && typeof rawLessonProgress === 'object'
      ? (rawLessonProgress as Record<string, Partial<LessonProgress>>)
      : {};
  const clObj =
    rawCompletedLessons && typeof rawCompletedLessons === 'object'
      ? (rawCompletedLessons as Record<string, Partial<LessonProgress>>)
      : {};

  Object.keys(lpObj).forEach((k) => mergedKeys.add(k));
  Object.keys(clObj).forEach((k) => mergedKeys.add(k));

  const lessonProgress: Record<string, LessonProgress> = {};
  const completedLessons: Record<string, LessonProgress> = {};

  for (const lessonId of mergedKeys) {
    const primary = lpObj[lessonId];
    const fallback = clObj[lessonId];
    const source = primary ?? fallback;
    if (!source || typeof source !== 'object') continue;

    const completions =
      typeof source.completions === 'number' ? Math.max(0, Math.round(source.completions)) : 1;
    const level = clampMasteryLevel(source.level, completions);
    const bestAccuracy =
      typeof source.bestAccuracy === 'number'
        ? Math.min(100, Math.max(0, Math.round(source.bestAccuracy)))
        : 0;
    const lastCompletedAt =
      typeof source.lastCompletedAt === 'string' && source.lastCompletedAt
        ? source.lastCompletedAt
        : new Date().toISOString();

    const normalizedEntry: LessonProgress = {
      level,
      completions: Math.max(completions, level >= 1 ? 1 : 0),
      bestAccuracy,
      lastCompletedAt,
      ...(typeof source.goldenCompletedAt === 'string' && source.goldenCompletedAt
        ? { goldenCompletedAt: source.goldenCompletedAt }
        : {}),
    };

    lessonProgress[lessonId] = normalizedEntry;
    if (normalizedEntry.level >= 1) {
      completedLessons[lessonId] = normalizedEntry;
    }
  }

  return { lessonProgress, completedLessons };
}

function normalizeSeenQuestionIds(
  rawSeen: unknown,
  recentAttempts: Array<{ questionId?: unknown }>,
  mistakes: Record<string, unknown>
): string[] {
  const set = new Set<string>();
  if (Array.isArray(rawSeen)) {
    for (const id of rawSeen) {
      if (typeof id === 'string' && id.trim()) {
        set.add(id.trim());
      }
    }
  } else {
    for (const attempt of recentAttempts) {
      if (attempt && typeof attempt.questionId === 'string' && attempt.questionId.trim()) {
        set.add(attempt.questionId.trim());
      }
    }
    for (const mistakeId of Object.keys(mistakes)) {
      if (mistakeId.trim()) {
        set.add(mistakeId.trim());
      }
    }
  }
  return Array.from(set);
}

function createEmptyUnitStats(): Record<UnitId, PerformanceBucket> {
  return {
    portugues: { attempts: 0, correct: 0, totalTimeMs: 0 },
    matematica: { attempts: 0, correct: 0, totalTimeMs: 0 },
    informatica: { attempts: 0, correct: 0, totalTimeMs: 0 },
    saneago: { attempts: 0, correct: 0, totalTimeMs: 0 },
  };
}

function normalizeUnitStats(
  raw: Partial<Record<UnitId, Partial<PerformanceBucket>>> | undefined
): Record<UnitId, PerformanceBucket> {
  const base = createEmptyUnitStats();
  if (!raw || typeof raw !== 'object') return base;
  const ids: UnitId[] = ['portugues', 'matematica', 'informatica', 'saneago'];
  for (const id of ids) {
    const entry = raw[id];
    if (entry && typeof entry === 'object') {
      base[id] = {
        attempts: typeof entry.attempts === 'number' ? Math.max(0, entry.attempts) : 0,
        correct: typeof entry.correct === 'number' ? Math.max(0, entry.correct) : 0,
        totalTimeMs: typeof entry.totalTimeMs === 'number' ? Math.max(0, entry.totalTimeMs) : 0,
      };
    }
  }
  return base;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey(date: Date = new Date()): string {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - 1);
  return getLocalDateKey(copy);
}

export function createInitialProgress(): UserProgress {
  return {
    schemaVersion: 1,
    xp: 0,
    dailyXp: 0,
    dailyXpDate: getLocalDateKey(),
    dailyGoalXp: 60,
    hearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    streak: 0,
    lastStudyDate: null,
    lessonProgress: {},
    completedLessons: {},
    seenQuestionIds: [],
    preferredDifficulty: 'balanced',
    mistakes: {},
    simuladoHistory: [],
    examChecklist: {},
    soundEnabled: true,
    unitStats: createEmptyUnitStats(),
    topicStats: {},
    recentAttempts: [],
    lastDiagnosis: null,
  };
}

export interface ProgressRepository {
  load(): Promise<UserProgress>;
  save(progress: UserProgress): Promise<void>;
  reset(): Promise<UserProgress>;
}

function normalizeProgress(raw: Partial<UserProgress> | null | undefined): UserProgress {
  const base = createInitialProgress();
  if (!raw || typeof raw !== 'object') {
    return base;
  }

  const today = getLocalDateKey();
  const yesterday = getYesterdayDateKey();

  const dailyXpDate = typeof raw.dailyXpDate === 'string' ? raw.dailyXpDate : today;
  const dailyXp = dailyXpDate === today && typeof raw.dailyXp === 'number' ? Math.max(0, raw.dailyXp) : 0;

  const lastStudyDate = typeof raw.lastStudyDate === 'string' ? raw.lastStudyDate : null;
  let streak = typeof raw.streak === 'number' ? Math.max(0, raw.streak) : 0;
  if (lastStudyDate && lastStudyDate !== today && lastStudyDate !== yesterday) {
    streak = 0;
  }

  const maxHearts = MAX_HEARTS;
  const hearts =
    typeof raw.hearts === 'number'
      ? Math.min(maxHearts, Math.max(0, Math.round(raw.hearts)))
      : maxHearts;

  const mistakesObj = raw.mistakes && typeof raw.mistakes === 'object' ? raw.mistakes : {};
  const recentAttempts = Array.isArray(raw.recentAttempts)
    ? raw.recentAttempts.slice(0, 120)
    : [];
  const { lessonProgress, completedLessons } = normalizeLessonProgressMap(
    raw.lessonProgress,
    raw.completedLessons
  );
  const seenQuestionIds = normalizeSeenQuestionIds(
    raw.seenQuestionIds,
    recentAttempts,
    mistakesObj
  );

  return {
    schemaVersion: 1,
    xp: typeof raw.xp === 'number' ? Math.max(0, raw.xp) : 0,
    dailyXp,
    dailyXpDate: today,
    dailyGoalXp:
      typeof raw.dailyGoalXp === 'number' && raw.dailyGoalXp >= 20 ? raw.dailyGoalXp : 60,
    hearts,
    maxHearts,
    streak,
    lastStudyDate,
    lessonProgress,
    completedLessons,
    seenQuestionIds,
    preferredDifficulty: normalizeDifficultyMode(raw.preferredDifficulty),
    mistakes: mistakesObj,
    simuladoHistory: Array.isArray(raw.simuladoHistory) ? raw.simuladoHistory : [],
    examChecklist:
      raw.examChecklist && typeof raw.examChecklist === 'object' ? raw.examChecklist : {},
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
    unitStats: normalizeUnitStats(
      raw.unitStats as Partial<Record<UnitId, Partial<PerformanceBucket>>> | undefined
    ),
    topicStats:
      raw.topicStats && typeof raw.topicStats === 'object' ? raw.topicStats : {},
    recentAttempts,
    lastDiagnosis:
      raw.lastDiagnosis && typeof raw.lastDiagnosis === 'object' ? raw.lastDiagnosis : null,
  };
}

export class LocalStorageProgressRepository implements ProgressRepository {
  private readonly storageKey: string;

  constructor(storageKey: string = PROGRESS_STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  loadSync(): UserProgress {
    try {
      const serialized = window.localStorage.getItem(this.storageKey);
      if (!serialized) {
        return createInitialProgress();
      }
      const parsed = JSON.parse(serialized) as Partial<UserProgress>;
      return normalizeProgress(parsed);
    } catch {
      return createInitialProgress();
    }
  }

  saveSync(progress: UserProgress): void {
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(progress));
    } catch {
      // Silencioso caso modo privado bloqueie armazenamento local
    }
  }

  async load(): Promise<UserProgress> {
    return this.loadSync();
  }

  async save(progress: UserProgress): Promise<void> {
    this.saveSync(progress);
  }

  async reset(): Promise<UserProgress> {
    const fresh = createInitialProgress();
    this.saveSync(fresh);
    return fresh;
  }
}

export interface SupabaseLikeClient {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: unknown }>;
      };
    };
    upsert: (payload: Record<string, unknown>) => Promise<{ error: unknown }>;
  };
}

/**
 * Adaptador preparado para sincronização em nuvem futura via Supabase.
 * Mantém fallback imediato no armazenamento local quando offline ou não autenticado.
 */
export class SupabaseProgressRepository implements ProgressRepository {
  private readonly fallback = new LocalStorageProgressRepository();

  constructor(
    private readonly client: SupabaseLikeClient,
    private readonly userId: string
  ) {}

  async load(): Promise<UserProgress> {
    try {
      const { data, error } = await this.client
        .from('user_progress')
        .select('payload')
        .eq('user_id', this.userId)
        .maybeSingle();

      if (error || !data || !data.payload) {
        return this.fallback.load();
      }

      const normalized = normalizeProgress(data.payload as Partial<UserProgress>);
      this.fallback.saveSync(normalized);
      return normalized;
    } catch {
      return this.fallback.load();
    }
  }

  async save(progress: UserProgress): Promise<void> {
    this.fallback.saveSync(progress);
    try {
      await this.client.from('user_progress').upsert({
        user_id: this.userId,
        schema_version: progress.schemaVersion,
        xp: progress.xp,
        hearts: progress.hearts,
        streak: progress.streak,
        payload: progress,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Fallback local já persistiu o estado
    }
  }

  async reset(): Promise<UserProgress> {
    const fresh = await this.fallback.reset();
    await this.save(fresh);
    return fresh;
  }
}

export const defaultProgressRepository = new LocalStorageProgressRepository();
