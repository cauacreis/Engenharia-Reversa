import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLessonsByUnit, UNITS } from '../data/questions';
import {
  defaultProgressRepository,
  getLocalDateKey,
  getYesterdayDateKey,
  MAX_HEARTS,
} from '../services/progressRepository';
import {
  AnswerAttemptLog,
  GroqDiagnosisReport,
  Question,
  SimuladoRecord,
  UnitId,
  UserProgress,
} from '../types/quiz';

interface CompleteLessonInput {
  lessonId: string;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
}

interface CompleteSimuladoInput {
  scope: UnitId | 'geral';
  score: number;
  total: number;
  durationSeconds: number;
  wrongQuestionIds: string[];
  xpEarned: number;
}

interface RecordAnswerAttemptInput {
  question: Question;
  isCorrect: boolean;
  timeMs: number;
  userAnswer: string;
  correctAnswer: string;
}

interface GameProgressContextValue {
  progress: UserProgress;
  mistakeIds: string[];
  loseHeart: () => void;
  gainHeart: (amount?: number) => void;
  recordMistake: (
    questionId: string,
    details?: {
      userAnswer?: string;
      correctAnswer?: string;
      topic?: string;
      unitId?: UnitId;
      promptSnapshot?: string;
      tipSnapshot?: string;
    }
  ) => void;
  recordAnswerAttempt: (input: RecordAnswerAttemptInput) => void;
  resolveMistake: (questionId: string) => boolean;
  completeLesson: (input: CompleteLessonInput) => void;
  completePracticeSession: (xpEarned: number) => void;
  completeMistakeReview: (xpEarned: number) => void;
  completeSimulado: (input: CompleteSimuladoInput) => void;
  saveDiagnosis: (report: GroqDiagnosisReport) => void;
  isLessonUnlocked: (lessonId: string) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
  isUnitCompleted: (unitId: UnitId) => boolean;
  isUnitSimuladoUnlocked: (unitId: UnitId) => boolean;
  isGeneralSimuladoUnlocked: () => boolean;
  getUnitCompletedLessonCount: (unitId: UnitId) => number;
  toggleChecklistItem: (itemId: string) => void;
  toggleSound: () => void;
  setDailyGoal: (xp: number) => void;
  resetProgress: () => void;
}

const GameProgressContext = createContext<GameProgressContextValue | null>(null);

function bumpStreakForToday(prev: UserProgress): { streak: number; lastStudyDate: string } {
  const today = getLocalDateKey();
  const yesterday = getYesterdayDateKey();

  if (prev.lastStudyDate === today) {
    return {
      streak: Math.max(1, prev.streak),
      lastStudyDate: today,
    };
  }

  if (prev.lastStudyDate === yesterday) {
    return {
      streak: prev.streak + 1,
      lastStudyDate: today,
    };
  }

  return {
    streak: 1,
    lastStudyDate: today,
  };
}

function addXpToDaily(prev: UserProgress, xpDelta: number): { dailyXp: number; dailyXpDate: string } {
  const today = getLocalDateKey();
  const base = prev.dailyXpDate === today ? prev.dailyXp : 0;
  return {
    dailyXp: base + Math.max(0, xpDelta),
    dailyXpDate: today,
  };
}

export function GameProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() =>
    defaultProgressRepository.loadSync()
  );

  useEffect(() => {
    defaultProgressRepository.saveSync(progress);
  }, [progress]);

  const loseHeart = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }));
  }, []);

  const gainHeart = useCallback((amount: number = 1) => {
    setProgress((prev) => ({
      ...prev,
      hearts: Math.min(MAX_HEARTS, prev.hearts + Math.max(1, amount)),
    }));
  }, []);

  const recordMistake = useCallback(
    (
      questionId: string,
      details?: {
        userAnswer?: string;
        correctAnswer?: string;
        topic?: string;
        unitId?: UnitId;
        promptSnapshot?: string;
        tipSnapshot?: string;
      }
    ) => {
      const nowIso = new Date().toISOString();
      setProgress((prev) => {
        const existing = prev.mistakes[questionId];
        return {
          ...prev,
          mistakes: {
            ...prev.mistakes,
            [questionId]: {
              questionId,
              wrongCount: existing ? existing.wrongCount + 1 : 1,
              lastWrongAt: nowIso,
              lastUserAnswer: details?.userAnswer ?? existing?.lastUserAnswer,
              correctAnswer: details?.correctAnswer ?? existing?.correctAnswer,
              topic: details?.topic ?? existing?.topic,
              unitId: details?.unitId ?? existing?.unitId,
              promptSnapshot: details?.promptSnapshot ?? existing?.promptSnapshot,
              tipSnapshot: details?.tipSnapshot ?? existing?.tipSnapshot,
            },
          },
        };
      });
    },
    []
  );

  const recordAnswerAttempt = useCallback((input: RecordAnswerAttemptInput) => {
    const nowIso = new Date().toISOString();
    const safeTimeMs = Math.max(200, Math.min(300000, Math.round(input.timeMs)));
    const { question, isCorrect, userAnswer, correctAnswer } = input;
    const topicKey = `${question.unitId}::${question.topic}`;

    setProgress((prev) => {
      const prevUnit = prev.unitStats[question.unitId] ?? {
        attempts: 0,
        correct: 0,
        totalTimeMs: 0,
      };
      const prevTopic = prev.topicStats[topicKey] ?? {
        unitId: question.unitId,
        topic: question.topic,
        attempts: 0,
        correct: 0,
        totalTimeMs: 0,
      };

      const logEntry: AnswerAttemptLog = {
        questionId: question.id,
        unitId: question.unitId,
        topic: question.topic,
        isCorrect,
        timeMs: safeTimeMs,
        userAnswer,
        correctAnswer,
        timestamp: nowIso,
      };

      const nextMistakes = { ...prev.mistakes };
      if (!isCorrect) {
        const existing = nextMistakes[question.id];
        nextMistakes[question.id] = {
          questionId: question.id,
          wrongCount: existing ? existing.wrongCount + 1 : 1,
          lastWrongAt: nowIso,
          lastUserAnswer: userAnswer,
          correctAnswer,
          topic: question.topic,
          unitId: question.unitId,
          promptSnapshot: question.prompt,
          tipSnapshot: question.tip,
        };
      }

      return {
        ...prev,
        unitStats: {
          ...prev.unitStats,
          [question.unitId]: {
            attempts: prevUnit.attempts + 1,
            correct: prevUnit.correct + (isCorrect ? 1 : 0),
            totalTimeMs: prevUnit.totalTimeMs + safeTimeMs,
          },
        },
        topicStats: {
          ...prev.topicStats,
          [topicKey]: {
            unitId: question.unitId,
            topic: question.topic,
            attempts: prevTopic.attempts + 1,
            correct: prevTopic.correct + (isCorrect ? 1 : 0),
            totalTimeMs: prevTopic.totalTimeMs + safeTimeMs,
          },
        },
        recentAttempts: [logEntry, ...prev.recentAttempts].slice(0, 120),
        mistakes: nextMistakes,
      };
    });
  }, []);

  const resolveMistake = useCallback((questionId: string): boolean => {
    let recovered = false;
    setProgress((prev) => {
      const nextMistakes = { ...prev.mistakes };
      delete nextMistakes[questionId];
      if (prev.hearts < MAX_HEARTS) {
        recovered = true;
      }
      return {
        ...prev,
        hearts: Math.min(MAX_HEARTS, prev.hearts + 1),
        mistakes: nextMistakes,
      };
    });
    return recovered;
  }, []);

  const completeLesson = useCallback((input: CompleteLessonInput) => {
    const accuracy =
      input.totalCount > 0 ? Math.round((input.correctCount / input.totalCount) * 100) : 100;
    const nowIso = new Date().toISOString();

    setProgress((prev) => {
      const existing = prev.completedLessons[input.lessonId];
      const streakInfo = bumpStreakForToday(prev);
      const dailyInfo = addXpToDaily(prev, input.xpEarned);

      return {
        ...prev,
        xp: prev.xp + input.xpEarned,
        ...dailyInfo,
        ...streakInfo,
        completedLessons: {
          ...prev.completedLessons,
          [input.lessonId]: {
            completions: existing ? existing.completions + 1 : 1,
            bestAccuracy: existing ? Math.max(existing.bestAccuracy, accuracy) : accuracy,
            lastCompletedAt: nowIso,
          },
        },
      };
    });
  }, []);

  const completeMistakeReview = useCallback((xpEarned: number) => {
    setProgress((prev) => {
      const streakInfo = bumpStreakForToday(prev);
      const dailyInfo = addXpToDaily(prev, xpEarned);
      return {
        ...prev,
        xp: prev.xp + Math.max(0, xpEarned),
        ...dailyInfo,
        ...streakInfo,
      };
    });
  }, []);

  const completePracticeSession = useCallback((xpEarned: number) => {
    setProgress((prev) => {
      const streakInfo = bumpStreakForToday(prev);
      const dailyInfo = addXpToDaily(prev, xpEarned);
      return {
        ...prev,
        xp: prev.xp + Math.max(0, xpEarned),
        ...dailyInfo,
        ...streakInfo,
      };
    });
  }, []);

  const saveDiagnosis = useCallback((report: GroqDiagnosisReport) => {
    setProgress((prev) => ({
      ...prev,
      lastDiagnosis: report,
    }));
  }, []);

  const completeSimulado = useCallback((input: CompleteSimuladoInput) => {
    const accuracy = input.total > 0 ? Math.round((input.score / input.total) * 100) : 0;
    const nowIso = new Date().toISOString();
    const record: SimuladoRecord = {
      id: `sim-${Date.now()}`,
      scope: input.scope,
      score: input.score,
      total: input.total,
      accuracy,
      durationSeconds: input.durationSeconds,
      completedAt: nowIso,
    };

    setProgress((prev) => {
      const streakInfo = bumpStreakForToday(prev);
      const dailyInfo = addXpToDaily(prev, input.xpEarned);
      const nextMistakes = { ...prev.mistakes };
      for (const qId of input.wrongQuestionIds) {
        const existing = nextMistakes[qId];
        nextMistakes[qId] = {
          questionId: qId,
          wrongCount: existing ? existing.wrongCount + 1 : 1,
          lastWrongAt: nowIso,
        };
      }

      return {
        ...prev,
        xp: prev.xp + input.xpEarned,
        ...dailyInfo,
        ...streakInfo,
        mistakes: nextMistakes,
        simuladoHistory: [record, ...prev.simuladoHistory].slice(0, 20),
      };
    });
  }, []);

  const isLessonCompleted = useCallback(
    (lessonId: string) => Boolean(progress.completedLessons[lessonId]),
    [progress.completedLessons]
  );

  const isLessonUnlocked = useCallback(
    (lessonId: string) => {
      for (const unit of UNITS) {
        const unitLessons = getLessonsByUnit(unit.id);
        const idx = unitLessons.findIndex((l) => l.id === lessonId);
        if (idx !== -1) {
          if (idx === 0) return true;
          const prevLesson = unitLessons[idx - 1];
          return Boolean(progress.completedLessons[prevLesson.id]);
        }
      }
      return false;
    },
    [progress.completedLessons]
  );

  const getUnitCompletedLessonCount = useCallback(
    (unitId: UnitId) => {
      const lessons = getLessonsByUnit(unitId);
      return lessons.filter((l) => Boolean(progress.completedLessons[l.id])).length;
    },
    [progress.completedLessons]
  );

  const isUnitCompleted = useCallback(
    (unitId: UnitId) => {
      const lessons = getLessonsByUnit(unitId);
      return lessons.every((l) => Boolean(progress.completedLessons[l.id]));
    },
    [progress.completedLessons]
  );

  const isUnitSimuladoUnlocked = useCallback(
    (unitId: UnitId) => isUnitCompleted(unitId),
    [isUnitCompleted]
  );

  const isGeneralSimuladoUnlocked = useCallback(
    () => UNITS.every((u) => isUnitCompleted(u.id)),
    [isUnitCompleted]
  );

  const toggleChecklistItem = useCallback((itemId: string) => {
    setProgress((prev) => ({
      ...prev,
      examChecklist: {
        ...prev.examChecklist,
        [itemId]: !prev.examChecklist[itemId],
      },
    }));
  }, []);

  const toggleSound = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  const setDailyGoal = useCallback((xp: number) => {
    setProgress((prev) => ({
      ...prev,
      dailyGoalXp: xp,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    void defaultProgressRepository.reset().then((fresh) => {
      setProgress(fresh);
    });
  }, []);

  const mistakeIds = useMemo(
    () =>
      Object.values(progress.mistakes)
        .sort((a, b) => b.lastWrongAt.localeCompare(a.lastWrongAt))
        .map((m) => m.questionId),
    [progress.mistakes]
  );

  const value: GameProgressContextValue = {
    progress,
    mistakeIds,
    loseHeart,
    gainHeart,
    recordMistake,
    recordAnswerAttempt,
    resolveMistake,
    completeLesson,
    completePracticeSession,
    completeMistakeReview,
    completeSimulado,
    saveDiagnosis,
    isLessonUnlocked,
    isLessonCompleted,
    isUnitCompleted,
    isUnitSimuladoUnlocked,
    isGeneralSimuladoUnlocked,
    getUnitCompletedLessonCount,
    toggleChecklistItem,
    toggleSound,
    setDailyGoal,
    resetProgress,
  };

  return React.createElement(GameProgressContext.Provider, { value }, children);
}

export function useGameProgress() {
  const ctx = useContext(GameProgressContext);
  if (!ctx) {
    throw new Error('useGameProgress deve ser usado dentro de GameProgressProvider');
  }
  return ctx;
}
