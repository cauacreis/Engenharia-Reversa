import { useCallback, useMemo, useState } from 'react';
import {
  getLessonsByUnit,
  getQuestionById,
  getUnitMeta,
  QUESTIONS,
  UNITS,
} from './data/questions';
import {
  findAIQuestionById,
  generateQuestionsWithGroq,
  generateSingleBatchSimuladoWithGroq,
  getGroqApiKey,
  saveAIPack,
} from './services/groqTutorService';
import {
  buildGeneralSimuladoSelection,
  buildUnitSimuladoSelection,
  selectLessonQuestions,
  shuffleQuestions,
} from './services/simuladoEngine';
import { GameProgressProvider, useGameProgress } from './hooks/useGameProgress';
import { BottomNav } from './components/layout/BottomNav';
import { TopStatsBar } from './components/layout/TopStatsBar';
import { StudyMapView } from './components/path/StudyMapView';
import { UnitGuideModal } from './components/path/UnitGuideModal';
import { ActiveQuizConfig, QuizSession } from './components/quiz/QuizSession';
import { ErrorAnalyticsView } from './components/extra/ErrorAnalyticsView';
import { SimuladoHubView } from './components/extra/SimuladoHubView';
import { ExamDayView } from './components/extra/ExamDayView';
import {
  AIQuestionGeneratorModal,
  GeneratorScope,
} from './components/extra/AIQuestionGeneratorModal';
import { Modal } from './components/ui/Modal';
import { SettingsModal } from './components/ui/SettingsModal';
import { TactileButton } from './components/ui/TactileButton';
import { AppTab, DifficultyMode, LessonMeta, Question, UnitId } from './types/quiz';
import { HeartCrack, RotateCcw } from 'lucide-react';

function SaneagoQuestShell() {
  const {
    progress,
    mistakeIds,
    isLessonUnlocked,
    isLessonCompleted,
    isUnitSimuladoUnlocked,
    isGeneralSimuladoUnlocked,
  } = useGameProgress();

  const [activeTab, setActiveTab] = useState<AppTab>('trilha');
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizConfig | null>(null);
  const [quizSeed, setQuizSeed] = useState(0);
  const [noHeartsModalOpen, setNoHeartsModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideModalUnitId, setGuideModalUnitId] = useState<UnitId | null>(null);
  const [keyBadgeRefresh, setKeyBadgeRefresh] = useState(0);
  const [loadingGoldenLessonId, setLoadingGoldenLessonId] = useState<string | null>(
    null
  );

  const [aiGenState, setAiGenState] = useState<{
    open: boolean;
    scope: GeneratorScope;
    count: number;
    mode: 'lesson' | 'simulado';
  }>({
    open: false,
    scope: 'geral',
    count: 20,
    mode: 'simulado',
  });

  const unlockedSimuladosCount = useMemo(() => {
    const unitCount = UNITS.filter((u) => isUnitSimuladoUnlocked(u.id)).length;
    return unitCount + (isGeneralSimuladoUnlocked() ? 1 : 0);
  }, [isGeneralSimuladoUnlocked, isUnitSimuladoUnlocked]);

  const buildMistakeReviewConfig = useCallback(
    (filterUnitId?: UnitId): ActiveQuizConfig | null => {
      let pool = mistakeIds
        .map((id) => getQuestionById(id) ?? findAIQuestionById(id))
        .filter((q): q is Question => Boolean(q))
        .filter((q) => !filterUnitId || q.unitId === filterUnitId);

      if (pool.length === 0) {
        pool = shuffleQuestions(
          filterUnitId
            ? QUESTIONS.filter((q) => q.unitId === filterUnitId)
            : QUESTIONS
        ).slice(0, 5);
      } else {
        pool = shuffleQuestions(pool).slice(0, 8);
      }

      if (pool.length === 0) return null;

      return {
        mode: 'mistake-review',
        title: filterUnitId
          ? `Revisão de Erros — ${getUnitMeta(filterUnitId).shortTitle}`
          : 'Revisão de Erros & Recuperação de Vidas',
        unitId: filterUnitId,
        questions: pool,
      };
    },
    [mistakeIds]
  );

  const handleStartMistakeReview = useCallback(
    (filterUnitId?: UnitId) => {
      const cfg = buildMistakeReviewConfig(filterUnitId);
      if (!cfg) return;
      setNoHeartsModalOpen(false);
      setQuizSeed((s) => s + 1);
      setActiveQuiz(cfg);
    },
    [buildMistakeReviewConfig]
  );

  const handleStartLesson = useCallback(
    (lesson: LessonMeta, options?: { forceBriefing?: boolean }) => {
      if (progress.hearts <= 0) {
        setNoHeartsModalOpen(true);
        return;
      }
      const { questions: lessonQuestions } = selectLessonQuestions(
        lesson.id,
        progress.seenQuestionIds,
        progress.preferredDifficulty,
        false
      );
      if (lessonQuestions.length === 0) return;

      const isFirstTime = !isLessonCompleted(lesson.id);
      const initialShowBriefing = Boolean(options?.forceBriefing || isFirstTime);

      const unitMeta = getUnitMeta(lesson.unitId);
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        mode: 'lesson',
        title: `${unitMeta.shortTitle} • ${lesson.title}`,
        unitId: lesson.unitId,
        lessonId: lesson.id,
        initialShowBriefing,
        difficultyMode: progress.preferredDifficulty,
        disableCheatSheet: progress.preferredDifficulty === 'legendary',
        questions: lessonQuestions,
      });
    },
    [
      isLessonCompleted,
      progress.hearts,
      progress.preferredDifficulty,
      progress.seenQuestionIds,
    ]
  );

  const handleStartGoldenChallenge = useCallback(
    async (lesson: LessonMeta) => {
      if (loadingGoldenLessonId) return;

      const unitMeta = getUnitMeta(lesson.unitId);
      const { questions: staticGoldenPool, allHardUnseenExhausted } =
        selectLessonQuestions(
          lesson.id,
          progress.seenQuestionIds,
          'legendary',
          true
        );

      let finalQuestions = staticGoldenPool;
      let usedAI = false;

      if (allHardUnseenExhausted && getGroqApiKey()) {
        setLoadingGoldenLessonId(lesson.id);
        try {
          const { questions: aiGoldenQuestions } =
            await generateQuestionsWithGroq({
              scope: lesson.unitId,
              count: 5,
              focusTopics: [lesson.title, lesson.subtitle],
              focusUnitId: lesson.unitId,
              difficultyMode: 'legendary',
            });
          if (aiGoldenQuestions.length > 0) {
            finalQuestions = aiGoldenQuestions;
            usedAI = true;
          }
        } catch {
          // Fallback silencioso para o banco estático difícil/lendário
        } finally {
          setLoadingGoldenLessonId(null);
        }
      }

      if (finalQuestions.length === 0) return;

      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        mode: 'lesson',
        title: `Desafio Dourado • ${unitMeta.shortTitle} • ${lesson.title}`,
        unitId: lesson.unitId,
        lessonId: lesson.id,
        initialShowBriefing: false,
        isGoldenChallenge: true,
        disableCheatSheet: true,
        sessionMaxHearts: 3,
        difficultyMode: 'legendary',
        isAIGeneratedSession: usedAI,
        questions: finalQuestions,
      });
    },
    [loadingGoldenLessonId, progress.seenQuestionIds]
  );

  const handlePracticeFromUnitGuide = useCallback(
    (unitId: UnitId, preferredLessonId?: string) => {
      setGuideModalUnitId(null);
      const unitLessons = getLessonsByUnit(unitId);
      const targetLesson =
        (preferredLessonId && isLessonUnlocked(preferredLessonId)
          ? unitLessons.find((l) => l.id === preferredLessonId)
          : undefined) ??
        unitLessons.find(
          (l) => isLessonUnlocked(l.id) && !isLessonCompleted(l.id)
        ) ??
        unitLessons[0];

      if (targetLesson) {
        handleStartLesson(targetLesson);
      }
    },
    [handleStartLesson, isLessonCompleted, isLessonUnlocked]
  );

  const handleStartUnitSimulado = useCallback(
    (unitId: UnitId) => {
      const unitMeta = getUnitMeta(unitId);
      const selection = buildUnitSimuladoSelection(
        unitId,
        progress.seenQuestionIds,
        progress.preferredDifficulty,
        unitMeta.simuladoQuestionCount
      );
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        mode: 'simulado',
        title: `Simulado ${unitMeta.title}`,
        unitId,
        simuladoScope: unitId,
        durationMinutes: unitMeta.simuladoDurationMinutes,
        difficultyMode: progress.preferredDifficulty,
        disableCheatSheet: true,
        questions: selection.questions,
      });
    },
    [progress.preferredDifficulty, progress.seenQuestionIds]
  );

  const handleStartGeneralSimulado = useCallback(
    (count: 20 | 30 = 20) => {
      const selection = buildGeneralSimuladoSelection(
        count,
        progress.seenQuestionIds,
        progress.preferredDifficulty
      );

      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        mode: 'simulado',
        title: `Simulado Geral SANEAGO (${count}q) — Banca Patativa`,
        simuladoScope: 'geral',
        durationMinutes: count === 30 ? 40 : 25,
        difficultyMode: progress.preferredDifficulty,
        disableCheatSheet: true,
        questions: selection.questions,
      });
    },
    [progress.preferredDifficulty, progress.seenQuestionIds]
  );

  const handleGenerateSingleBatchAISimulado = useCallback(
    async (params: {
      scope: UnitId | 'geral';
      count: number;
      difficultyMode: DifficultyMode;
    }) => {
      const { questions, modelUsed } =
        await generateSingleBatchSimuladoWithGroq(params);

      const scopeLabel =
        params.scope === 'geral'
          ? 'Geral Patativa'
          : getUnitMeta(params.scope).shortTitle;
      const title = `Simulado IA Inédito • ${scopeLabel} (${questions.length}q)`;

      saveAIPack({
        id: `pack-${Date.now()}`,
        title,
        scope: params.scope,
        mode: 'simulado',
        createdAt: new Date().toISOString(),
        modelUsed,
        questions,
      });

      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        mode: 'simulado',
        title,
        unitId: params.scope === 'geral' ? undefined : params.scope,
        simuladoScope: params.scope,
        durationMinutes:
          params.count >= 30 ? 40 : params.count >= 20 ? 25 : 15,
        difficultyMode: params.difficultyMode,
        disableCheatSheet: true,
        isAIGeneratedSession: true,
        questions,
      });
    },
    []
  );

  const handleStartGeneratedSession = useCallback(
    (params: {
      title: string;
      mode: 'lesson' | 'simulado';
      scope: UnitId | 'geral';
      durationMinutes?: number;
      questions: Question[];
    }) => {
      if (params.mode === 'lesson' && progress.hearts <= 0) {
        setNoHeartsModalOpen(true);
        return;
      }
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        mode: params.mode,
        title: params.title,
        unitId: params.scope === 'geral' ? undefined : params.scope,
        simuladoScope: params.mode === 'simulado' ? params.scope : undefined,
        durationMinutes: params.durationMinutes,
        difficultyMode: progress.preferredDifficulty,
        disableCheatSheet:
          params.mode === 'simulado' ||
          progress.preferredDifficulty === 'legendary',
        isAIGeneratedSession: true,
        questions: params.questions,
      });
    },
    [progress.hearts, progress.preferredDifficulty]
  );

  const handleStartCustomTraining = useCallback(
    (params: { title: string; questions: Question[]; unitId?: UnitId }) => {
      if (progress.hearts <= 0) {
        setNoHeartsModalOpen(true);
        return;
      }
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        mode: 'lesson',
        title: params.title,
        unitId: params.unitId,
        difficultyMode: progress.preferredDifficulty,
        disableCheatSheet: progress.preferredDifficulty === 'legendary',
        isAIGeneratedSession: true,
        questions: params.questions,
      });
    },
    [progress.hearts, progress.preferredDifficulty]
  );

  const handleRetryActiveQuiz = useCallback(() => {
    if (!activeQuiz) return;
    if (activeQuiz.isAIGeneratedSession) {
      if (
        activeQuiz.mode === 'lesson' &&
        !activeQuiz.isGoldenChallenge &&
        progress.hearts <= 0
      ) {
        setActiveQuiz(null);
        setNoHeartsModalOpen(true);
        return;
      }
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        ...activeQuiz,
        initialShowBriefing: false,
        questions: shuffleQuestions(activeQuiz.questions),
      });
      return;
    }

    if (activeQuiz.mode === 'lesson' && activeQuiz.lessonId) {
      if (activeQuiz.isGoldenChallenge) {
        const lessonMeta = activeQuiz.unitId
          ? getLessonsByUnit(activeQuiz.unitId).find(
              (l) => l.id === activeQuiz.lessonId
            )
          : undefined;
        if (lessonMeta) {
          void handleStartGoldenChallenge(lessonMeta);
          return;
        }
        const { questions: goldenRetry } = selectLessonQuestions(
          activeQuiz.lessonId,
          progress.seenQuestionIds,
          'legendary',
          true
        );
        setQuizSeed((s) => s + 1);
        setActiveQuiz({
          ...activeQuiz,
          initialShowBriefing: false,
          questions: goldenRetry,
        });
        return;
      }

      if (progress.hearts <= 0) {
        setActiveQuiz(null);
        setNoHeartsModalOpen(true);
        return;
      }
      const { questions: retryQuestions } = selectLessonQuestions(
        activeQuiz.lessonId,
        progress.seenQuestionIds,
        activeQuiz.difficultyMode ?? progress.preferredDifficulty,
        false
      );
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        ...activeQuiz,
        initialShowBriefing: false,
        questions: retryQuestions,
      });
    } else if (activeQuiz.mode === 'simulado') {
      if (activeQuiz.simuladoScope === 'geral') {
        handleStartGeneralSimulado(
          activeQuiz.questions.length >= 30 ? 30 : 20
        );
      } else if (activeQuiz.unitId) {
        handleStartUnitSimulado(activeQuiz.unitId);
      }
    } else {
      handleStartMistakeReview(activeQuiz.unitId);
    }
  }, [
    activeQuiz,
    handleStartGeneralSimulado,
    handleStartGoldenChallenge,
    handleStartMistakeReview,
    handleStartUnitSimulado,
    progress.hearts,
    progress.preferredDifficulty,
    progress.seenQuestionIds,
  ]);

  return (
    <>
      {activeQuiz ? (
        <QuizSession
          key={`${activeQuiz.mode}-${activeQuiz.lessonId ?? activeQuiz.simuladoScope ?? 'rev'}-${quizSeed}`}
          config={activeQuiz}
          keyRefreshTick={keyBadgeRefresh}
          onExit={() => setActiveQuiz(null)}
          onStartMistakeReview={() => handleStartMistakeReview()}
          onRetrySession={handleRetryActiveQuiz}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : (
        <div className="min-h-dvh flex flex-col bg-[#0B1117]">
          <TopStatsBar onOpenSettings={() => setSettingsOpen(true)} />

          <div className="mx-auto flex w-full max-w-6xl flex-1">
            <BottomNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              mistakeCount={mistakeIds.length}
              unlockedSimuladosCount={unlockedSimuladosCount}
            />

            <main className="flex-1 min-w-0 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-12">
              {activeTab === 'trilha' && (
                <StudyMapView
                  loadingGoldenLessonId={loadingGoldenLessonId}
                  onStartLesson={handleStartLesson}
                  onStartGoldenChallenge={handleStartGoldenChallenge}
                  onStartUnitSimulado={handleStartUnitSimulado}
                  onStartGeneralSimulado={handleStartGeneralSimulado}
                  onStartMistakeReview={() => handleStartMistakeReview()}
                  onGenerateUnitAI={(unitId) =>
                    setAiGenState({
                      open: true,
                      scope: unitId,
                      count: 5,
                      mode: 'lesson',
                    })
                  }
                  onOpenUnitGuide={setGuideModalUnitId}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'erros' && (
                <ErrorAnalyticsView
                  onStartMistakeReview={handleStartMistakeReview}
                  onStartCustomTraining={handleStartCustomTraining}
                  onOpenSettings={() => setSettingsOpen(true)}
                />
              )}

              {activeTab === 'simulados' && (
                <SimuladoHubView
                  keyRefreshTick={keyBadgeRefresh}
                  onStartUnitSimulado={handleStartUnitSimulado}
                  onStartGeneralSimulado={handleStartGeneralSimulado}
                  onOpenAIGenerator={(scope = 'geral', count = 20) =>
                    setAiGenState({
                      open: true,
                      scope,
                      count,
                      mode: 'simulado',
                    })
                  }
                  onGenerateSingleBatchAISimulado={
                    handleGenerateSingleBatchAISimulado
                  }
                  onStartSavedAIPack={handleStartGeneratedSession}
                />
              )}

              {activeTab === 'prova' && <ExamDayView />}
            </main>
          </div>

          {/* Modal Guia Teórico da Unidade */}
          <UnitGuideModal
            unitId={guideModalUnitId}
            onClose={() => setGuideModalUnitId(null)}
            onPracticeNow={handlePracticeFromUnitGuide}
          />

          {/* Modal Gerador IA */}
          <AIQuestionGeneratorModal
            open={aiGenState.open}
            initialScope={aiGenState.scope}
            initialCount={aiGenState.count}
            initialMode={aiGenState.mode}
            onClose={() => setAiGenState((prev) => ({ ...prev, open: false }))}
            onStartGeneratedSession={handleStartGeneratedSession}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {/* Modal de bloqueio quando o usuário tenta abrir lição com 0 corações */}
          <Modal
            open={noHeartsModalOpen}
            onClose={() => setNoHeartsModalOpen(false)}
            title="Você está sem corações!"
          >
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF4B4B]/15 border-2 border-[#FF4B4B]/50 text-[#FF4B4B]">
                <HeartCrack className="h-8 w-8" />
              </div>
              <p className="text-sm text-[#92A8BE] leading-relaxed">
                Para entrar em uma nova lição você precisa de pelo menos 1 coração. Faça uma revisão rápida de erros para recuperar vidas agora mesmo!
              </p>
              <div className="flex flex-col gap-3">
                <TactileButton
                  variant="danger"
                  fullWidth
                  onClick={() => handleStartMistakeReview()}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Recuperar Corações Agora</span>
                </TactileButton>
                <TactileButton
                  variant="outline"
                  fullWidth
                  onClick={() => setNoHeartsModalOpen(false)}
                >
                  Fechar
                </TactileButton>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* Modal Configurações (Chave Groq & Meta Diária) acessível inclusive durante o Pergunte ao Pingo */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onKeyStatusChanged={() => setKeyBadgeRefresh((n) => n + 1)}
      />
    </>
  );
}

export default function App() {
  return (
    <GameProgressProvider>
      <SaneagoQuestShell />
    </GameProgressProvider>
  );
}
