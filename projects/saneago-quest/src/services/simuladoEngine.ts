import { getQuestionsByLesson, getQuestionsByUnit, UNITS } from '../data/questions';
import { DifficultyMode, Question, UnitId } from '../types/quiz';

export interface SimuladoSelectionResult {
  questions: Question[];
  eligibleTotal: number;
  unseenEligibleCount: number;
  newQuestionsCount: number;
  repeatedQuestionsCount: number;
  isPoolExhausted: boolean;
  hasInsufficientUnseen: boolean;
}

export interface LessonSelectionResult {
  questions: Question[];
  allHardUnseenExhausted: boolean;
}

export function shuffleQuestions<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getEligibleByDifficulty(
  pool: Question[],
  difficultyMode: DifficultyMode
): Question[] {
  if (difficultyMode === 'balanced') {
    return [...pool];
  }
  return pool.filter((q) => q.difficulty === 'hard' || q.difficulty === 'legendary');
}

function orderBucketByDifficulty(
  bucket: Question[],
  difficultyMode: DifficultyMode,
  targetCount: number
): Question[] {
  if (bucket.length === 0) return [];

  if (difficultyMode === 'legendary') {
    const legendary = shuffleQuestions(bucket.filter((q) => q.difficulty === 'legendary'));
    const hard = shuffleQuestions(bucket.filter((q) => q.difficulty === 'hard'));
    return [...legendary, ...hard];
  }

  if (difficultyMode === 'hard') {
    return shuffleQuestions(bucket);
  }

  // Modo Equilibrado: mistura ~60% médias + ~40% difíceis/lendárias quando disponíveis no bucket
  const medium = shuffleQuestions(bucket.filter((q) => q.difficulty === 'medium'));
  const advanced = shuffleQuestions(
    bucket.filter((q) => q.difficulty === 'hard' || q.difficulty === 'legendary')
  );

  const desiredMedium = Math.min(medium.length, Math.ceil(targetCount * 0.55));
  const desiredAdvanced = Math.min(advanced.length, Math.max(0, targetCount - desiredMedium));

  const pickedMedium = medium.slice(0, desiredMedium);
  const pickedAdvanced = advanced.slice(0, desiredAdvanced);
  const leftover = shuffleQuestions([
    ...medium.slice(desiredMedium),
    ...advanced.slice(desiredAdvanced),
  ]);

  const head = shuffleQuestions([...pickedMedium, ...pickedAdvanced]);
  return [...head, ...leftover];
}

export function selectAntiRepetitionQuestions(
  pool: Question[],
  count: number,
  seenQuestionIds: string[],
  difficultyMode: DifficultyMode
): SimuladoSelectionResult {
  const eligible = getEligibleByDifficulty(pool, difficultyMode);
  const seenSet = new Set(seenQuestionIds);

  const unseen = eligible.filter((q) => !seenSet.has(q.id));
  const seen = eligible.filter((q) => seenSet.has(q.id));

  const orderedUnseen = orderBucketByDifficulty(unseen, difficultyMode, count);
  const chosenUnseen = orderedUnseen.slice(0, count);

  const remainingNeeded = Math.max(0, count - chosenUnseen.length);
  const orderedSeen = orderBucketByDifficulty(seen, difficultyMode, remainingNeeded);
  const chosenSeen = orderedSeen.slice(0, remainingNeeded);

  const questions = [...chosenUnseen, ...chosenSeen];

  return {
    questions,
    eligibleTotal: eligible.length,
    unseenEligibleCount: unseen.length,
    newQuestionsCount: chosenUnseen.length,
    repeatedQuestionsCount: chosenSeen.length,
    isPoolExhausted: unseen.length === 0,
    hasInsufficientUnseen: unseen.length < Math.min(count, eligible.length),
  };
}

export function buildUnitSimuladoSelection(
  unitId: UnitId,
  seenQuestionIds: string[],
  difficultyMode: DifficultyMode,
  count: number = 10
): SimuladoSelectionResult {
  return selectAntiRepetitionQuestions(
    getQuestionsByUnit(unitId),
    count,
    seenQuestionIds,
    difficultyMode
  );
}

const GENERAL_DISTRIBUTION_20: Record<UnitId, number> = {
  portugues: 7,
  matematica: 5,
  informatica: 4,
  saneago: 4,
};

const GENERAL_DISTRIBUTION_30: Record<UnitId, number> = {
  portugues: 11,
  matematica: 7,
  informatica: 6,
  saneago: 6,
};

export function buildGeneralSimuladoSelection(
  count: 20 | 30,
  seenQuestionIds: string[],
  difficultyMode: DifficultyMode
): SimuladoSelectionResult {
  const distribution = count === 30 ? GENERAL_DISTRIBUTION_30 : GENERAL_DISTRIBUTION_20;

  const combinedQuestions: Question[] = [];
  let eligibleTotal = 0;
  let unseenEligibleCount = 0;
  let newQuestionsCount = 0;
  let repeatedQuestionsCount = 0;
  let anySliceShort = false;

  for (const unit of UNITS) {
    const qty = distribution[unit.id];
    const slice = selectAntiRepetitionQuestions(
      getQuestionsByUnit(unit.id),
      qty,
      seenQuestionIds,
      difficultyMode
    );
    combinedQuestions.push(...slice.questions);
    eligibleTotal += slice.eligibleTotal;
    unseenEligibleCount += slice.unseenEligibleCount;
    newQuestionsCount += slice.newQuestionsCount;
    repeatedQuestionsCount += slice.repeatedQuestionsCount;
    if (slice.unseenEligibleCount < qty) {
      anySliceShort = true;
    }
  }

  return {
    questions: combinedQuestions,
    eligibleTotal,
    unseenEligibleCount,
    newQuestionsCount,
    repeatedQuestionsCount,
    isPoolExhausted: unseenEligibleCount === 0,
    hasInsufficientUnseen: anySliceShort || unseenEligibleCount < count,
  };
}

export function selectLessonQuestions(
  lessonId: string,
  seenQuestionIds: string[],
  difficultyMode: DifficultyMode,
  isGoldenChallenge: boolean = false
): LessonSelectionResult {
  const pool = getQuestionsByLesson(lessonId);

  if (isGoldenChallenge) {
    const selection = selectAntiRepetitionQuestions(pool, 5, seenQuestionIds, 'legendary');
    return {
      questions: selection.questions,
      allHardUnseenExhausted: selection.isPoolExhausted,
    };
  }

  const selection = selectAntiRepetitionQuestions(pool, 5, seenQuestionIds, difficultyMode);
  return {
    questions: selection.questions,
    allHardUnseenExhausted: selection.isPoolExhausted,
  };
}
