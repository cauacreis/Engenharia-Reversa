import { useCallback, useMemo, useState } from 'react';
import {
  getLessonsByUnit,
  getQuestionById,
  getQuestionsByLesson,
  getQuestionsByUnit,
  getUnitMeta,
  QUESTIONS,
  UNITS,
} from './data/questions';
import { findAIQuestionById } from './services/groqTutorService';
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
import { AppTab, LessonMeta, Question, UnitId } from './types/quiz';
import { HeartCrack, RotateCcw } from 'lucide-react';

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
  const [, setKeyBadgeRefresh] = useState(0);

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
        pool = shuffleArray(
          filterUnitId ? getQuestionsByUnit(filterUnitId) : QUESTIONS
        ).slice(0, 5);
      } else {
        pool = shuffleArray(pool).slice(0, 8);
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
      const lessonQuestions = getQuestionsByLesson(lesson.id);
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
        questions: lessonQuestions,
      });
    },
    [isLessonCompleted, progress.hearts]
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

  const handleStartUnitSimulado = useCallback((unitId: UnitId) => {
    const unitMeta = getUnitMeta(unitId);
    const pool = shuffleArray(getQuestionsByUnit(unitId)).slice(
      0,
      unitMeta.simuladoQuestionCount
    );
    setQuizSeed((s) => s + 1);
    setActiveQuiz({
      mode: 'simulado',
      title: `Simulado ${unitMeta.title}`,
      unitId,
      simuladoScope: unitId,
      durationMinutes: unitMeta.simuladoDurationMinutes,
      questions: pool,
    });
  }, []);

  const handleStartGeneralSimulado = useCallback(() => {
    // 20 questões ponderadas: 7 Português (maior peso), 5 Matemática, 4 Informática, 4 Saneago
    const ptPool = shuffleArray(getQuestionsByUnit('portugues')).slice(0, 7);
    const matPool = shuffleArray(getQuestionsByUnit('matematica')).slice(0, 5);
    const infPool = shuffleArray(getQuestionsByUnit('informatica')).slice(0, 4);
    const sanPool = shuffleArray(getQuestionsByUnit('saneago')).slice(0, 4);

    setQuizSeed((s) => s + 1);
    setActiveQuiz({
      mode: 'simulado',
      title: 'Simulado Geral SANEAGO — Banca Patativa',
      simuladoScope: 'geral',
      durationMinutes: 25,
      questions: [...ptPool, ...matPool, ...infPool, ...sanPool],
    });
  }, []);

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
        isAIGeneratedSession: true,
        questions: params.questions,
      });
    },
    [progress.hearts]
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
        isAIGeneratedSession: true,
        questions: params.questions,
      });
    },
    [progress.hearts]
  );

  const handleRetryActiveQuiz = useCallback(() => {
    if (!activeQuiz) return;
    if (activeQuiz.isAIGeneratedSession) {
      if (activeQuiz.mode === 'lesson' && progress.hearts <= 0) {
        setActiveQuiz(null);
        setNoHeartsModalOpen(true);
        return;
      }
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        ...activeQuiz,
        initialShowBriefing: false,
        questions: shuffleArray(activeQuiz.questions),
      });
      return;
    }

    if (activeQuiz.mode === 'lesson' && activeQuiz.lessonId) {
      if (progress.hearts <= 0) {
        setActiveQuiz(null);
        setNoHeartsModalOpen(true);
        return;
      }
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        ...activeQuiz,
        initialShowBriefing: false,
        questions: getQuestionsByLesson(activeQuiz.lessonId),
      });
    } else if (activeQuiz.mode === 'simulado') {
      if (activeQuiz.simuladoScope === 'geral') {
        handleStartGeneralSimulado();
      } else if (activeQuiz.unitId) {
        handleStartUnitSimulado(activeQuiz.unitId);
      }
    } else {
      handleStartMistakeReview(activeQuiz.unitId);
    }
  }, [
    activeQuiz,
    handleStartGeneralSimulado,
    handleStartMistakeReview,
    handleStartUnitSimulado,
    progress.hearts,
  ]);

  if (activeQuiz) {
    return (
      <QuizSession
        key={`${activeQuiz.mode}-${activeQuiz.lessonId ?? activeQuiz.simuladoScope ?? 'rev'}-${quizSeed}`}
        config={activeQuiz}
        onExit={() => setActiveQuiz(null)}
        onStartMistakeReview={() => handleStartMistakeReview()}
        onRetrySession={handleRetryActiveQuiz}
      />
    );
  }

  return (
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
              onStartLesson={handleStartLesson}
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

      {/* Modal Configurações (Chave Groq & Meta Diária) */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onKeyStatusChanged={() => setKeyBadgeRefresh((n) => n + 1)}
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
  );
}

export default function App() {
  return (
    <GameProgressProvider>
      <SaneagoQuestShell />
    </GameProgressProvider>
  );
}
