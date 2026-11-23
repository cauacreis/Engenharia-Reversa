import { UserProgress } from '../types/quiz';

export const PROGRESS_STORAGE_KEY = 'saneago_quest_progress_v1';
export const MAX_HEARTS = 5;

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
    completedLessons: {},
    mistakes: {},
    simuladoHistory: [],
    examChecklist: {},
    soundEnabled: true,
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
    completedLessons:
      raw.completedLessons && typeof raw.completedLessons === 'object' ? raw.completedLessons : {},
    mistakes: raw.mistakes && typeof raw.mistakes === 'object' ? raw.mistakes : {},
    simuladoHistory: Array.isArray(raw.simuladoHistory) ? raw.simuladoHistory : [],
    examChecklist:
      raw.examChecklist && typeof raw.examChecklist === 'object' ? raw.examChecklist : {},
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
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
