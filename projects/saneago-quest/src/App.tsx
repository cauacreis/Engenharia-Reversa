import { useCallback, useMemo, useState } from 'react';
import {
  getQuestionById,
  getQuestionsByLesson,
  getQuestionsByUnit,
  getUnitMeta,
  QUESTIONS,
  UNITS,
} from './data/questions';
import { GameProgressProvider, useGameProgress } from './hooks/useGameProgress';
import { BottomNav } from './components/layout/BottomNav';
import { TopStatsBar } from './components/layout/TopStatsBar';
import { StudyMapView } from './components/path/StudyMapView';
import { ActiveQuizConfig, QuizSession } from './components/quiz/QuizSession';
import { MistakeBankView } from './components/extra/MistakeBankView';
import { SimuladoHubView } from './components/extra/SimuladoHubView';
import { ExamDayView } from './components/extra/ExamDayView';
import { Modal } from './components/ui/Modal';
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
    isUnitSimuladoUnlocked,
    isGeneralSimuladoUnlocked,
  } = useGameProgress();

  const [activeTab, setActiveTab] = useState<AppTab>('trilha');
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizConfig | null>(null);
  const [quizSeed, setQuizSeed] = useState(0);
  const [noHeartsModalOpen, setNoHeartsModalOpen] = useState(false);

  const unlockedSimuladosCount = useMemo(() => {
    const unitCount = UNITS.filter((u) => isUnitSimuladoUnlocked(u.id)).length;
    return unitCount + (isGeneralSimuladoUnlocked() ? 1 : 0);
  }, [isGeneralSimuladoUnlocked, isUnitSimuladoUnlocked]);

  const buildMistakeReviewConfig = useCallback(
    (filterUnitId?: UnitId): ActiveQuizConfig | null => {
      let pool = mistakeIds
        .map((id) => getQuestionById(id))
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
    (lesson: LessonMeta) => {
      if (progress.hearts <= 0) {
        setNoHeartsModalOpen(true);
        return;
      }
      const lessonQuestions = getQuestionsByLesson(lesson.id);
      if (lessonQuestions.length === 0) return;

      const unitMeta = getUnitMeta(lesson.unitId);
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        mode: 'lesson',
        title: `${unitMeta.shortTitle} • ${lesson.title}`,
        unitId: lesson.unitId,
        lessonId: lesson.id,
        questions: lessonQuestions,
      });
    },
    [progress.hearts]
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

  const handleRetryActiveQuiz = useCallback(() => {
    if (!activeQuiz) return;
    if (activeQuiz.mode === 'lesson' && activeQuiz.lessonId) {
      if (progress.hearts <= 0) {
        setActiveQuiz(null);
        setNoHeartsModalOpen(true);
        return;
      }
      setQuizSeed((s) => s + 1);
      setActiveQuiz({
        ...activeQuiz,
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
      <TopStatsBar />

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
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'erros' && (
            <MistakeBankView onStartMistakeReview={handleStartMistakeReview} />
          )}

          {activeTab === 'simulados' && (
            <SimuladoHubView
              onStartUnitSimulado={handleStartUnitSimulado}
              onStartGeneralSimulado={handleStartGeneralSimulado}
            />
          )}

          {activeTab === 'prova' && <ExamDayView />}
        </main>
      </div>

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
