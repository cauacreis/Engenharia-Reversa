import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, Heart, HeartCrack, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { getUnitMeta } from '../../data/questions';
import { useGameProgress } from '../../hooks/useGameProgress';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import {
  Question,
  QuizSessionMode,
  QuizSummaryData,
  SimuladoReviewItem,
  UnitId,
} from '../../types/quiz';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { TactileButton } from '../ui/TactileButton';
import { FeedbackBanner } from './FeedbackBanner';
import { LessonSummary } from './LessonSummary';
import { FillBlankRenderer } from './renderers/FillBlankRenderer';
import { MatchPairsRenderer } from './renderers/MatchPairsRenderer';
import { MultipleChoiceRenderer } from './renderers/MultipleChoiceRenderer';
import { TrueFalseRenderer } from './renderers/TrueFalseRenderer';

export interface ActiveQuizConfig {
  mode: QuizSessionMode;
  title: string;
  unitId?: UnitId;
  lessonId?: string;
  simuladoScope?: UnitId | 'geral';
  durationMinutes?: number;
  isAIGeneratedSession?: boolean;
  questions: Question[];
}

interface QuizSessionProps {
  config: ActiveQuizConfig;
  onExit: () => void;
  onStartMistakeReview: () => void;
  onRetrySession: () => void;
}

function getCorrectLabel(question: Question): string {
  switch (question.type) {
    case 'multiple-choice':
      return question.options[question.correctIndex];
    case 'fill-blank':
      return question.correctAnswer;
    case 'true-false':
      return question.correctAnswer ? 'Verdadeiro' : 'Falso';
    case 'match-pairs':
      return question.pairs.map((p) => `${p.left} ↔ ${p.right}`).join(' | ');
  }
}

function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function QuizSession({
  config,
  onExit,
  onStartMistakeReview,
  onRetrySession,
}: QuizSessionProps) {
  const {
    progress,
    loseHeart,
    recordAnswerAttempt,
    resolveMistake,
    gainHeart,
    completeLesson,
    completePracticeSession,
    completeMistakeReview,
    completeSimulado,
  } = useGameProgress();
  const { playCorrect, playWrong, playPairMatch, playComplete } = useSoundEffects();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMc, setSelectedMc] = useState<number | null>(null);
  const [selectedBlank, setSelectedBlank] = useState<string | null>(null);
  const [selectedTf, setSelectedTf] = useState<boolean | null>(null);
  const [examPairMap, setExamPairMap] = useState<Record<string, string>>({});

  const [feedbackState, setFeedbackState] = useState<{
    checked: boolean;
    isCorrect: boolean;
    recoveredHeart: boolean;
  } | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [heartsRecovered, setHeartsRecovered] = useState(0);
  const [reviewItems, setReviewItems] = useState<SimuladoReviewItem[]>([]);
  const [summary, setSummary] = useState<QuizSummaryData | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const questionStartedAtRef = useRef<number>(Date.now());
  const totalTimeSec = (config.durationMinutes ?? 10) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalTimeSec);
  const finalizingRef = useRef(false);

  const currentQuestion = config.questions[currentIndex];
  const isLastQuestion = currentIndex === config.questions.length - 1;
  const isSimulado = config.mode === 'simulado';

  const unitAccent = config.unitId
    ? getUnitMeta(config.unitId).accentColor
    : currentQuestion
    ? getUnitMeta(currentQuestion.unitId).accentColor
    : '#00B8FF';

  const resetInputs = useCallback(() => {
    setSelectedMc(null);
    setSelectedBlank(null);
    setSelectedTf(null);
    setExamPairMap({});
    setFeedbackState(null);
    questionStartedAtRef.current = Date.now();
  }, []);

  const finalizeSession = useCallback(
    (
      finalCorrect: number,
      finalMaxCombo: number,
      finalHeartsRecovered: number,
      finalReviewItems: SimuladoReviewItem[],
      timedOut: boolean = false
    ) => {
      if (finalizingRef.current) return;
      finalizingRef.current = true;

      const totalCount = config.questions.length;
      const elapsedSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAtRef.current) / 1000)
      );
      const accuracy = totalCount > 0 ? Math.round((finalCorrect / totalCount) * 100) : 0;

      let xpEarned = finalCorrect * 10 + finalMaxCombo * 2;
      if (config.mode === 'lesson') {
        xpEarned += 15;
        if (config.isAIGeneratedSession || !config.lessonId) {
          completePracticeSession(xpEarned);
        } else {
          completeLesson({
            lessonId: config.lessonId,
            correctCount: finalCorrect,
            totalCount,
            xpEarned,
          });
        }
      } else if (config.mode === 'mistake-review') {
        completeMistakeReview(xpEarned);
      } else if (config.mode === 'simulado') {
        xpEarned = finalCorrect * 12 + (accuracy >= 70 ? 25 : 0);
        const wrongIds = finalReviewItems
          .filter((item) => !item.isCorrect)
          .map((item) => item.question.id);
        completeSimulado({
          scope: config.simuladoScope ?? 'geral',
          score: finalCorrect,
          total: totalCount,
          durationSeconds: elapsedSeconds,
          wrongQuestionIds: wrongIds,
          xpEarned,
        });
      }

      playComplete();
      setSummary({
        mode: config.mode,
        title: config.title,
        unitId: config.unitId,
        lessonId: config.lessonId,
        simuladoScope: config.simuladoScope,
        correctCount: finalCorrect,
        totalCount,
        accuracy,
        xpEarned,
        maxCombo: finalMaxCombo,
        heartsRecovered: finalHeartsRecovered,
        durationSeconds: elapsedSeconds,
        timedOut,
        reviewItems: config.mode === 'simulado' ? finalReviewItems : undefined,
      });
    },
    [
      completeLesson,
      completeMistakeReview,
      completePracticeSession,
      completeSimulado,
      config,
      playComplete,
    ]
  );

  // Cronômetro regressivo exclusivo do modo Simulado
  useEffect(() => {
    if (!isSimulado || summary) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isSimulado, summary]);

  // Submete automaticamente quando o tempo do simulado zera
  useEffect(() => {
    if (!isSimulado || summary || remainingSeconds > 0 || finalizingRef.current) return;

    const filledReview = [...reviewItems];
    for (let i = filledReview.length; i < config.questions.length; i++) {
      const q = config.questions[i];
      filledReview.push({
        question: q,
        userAnswerSummary: 'Não respondida (tempo esgotado)',
        correctAnswerSummary: getCorrectLabel(q),
        isCorrect: false,
      });
    }
    finalizeSession(correctCount, maxCombo, 0, filledReview, true);
  }, [
    config.questions,
    correctCount,
    finalizeSession,
    isSimulado,
    maxCombo,
    remainingSeconds,
    reviewItems,
    summary,
  ]);

  const canConfirmAnswer = (() => {
    if (!currentQuestion || feedbackState?.checked) return false;
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return selectedMc !== null;
      case 'fill-blank':
        return selectedBlank !== null;
      case 'true-false':
        return selectedTf !== null;
      case 'match-pairs':
        return isSimulado && Object.keys(examPairMap).length === currentQuestion.pairs.length;
    }
  })();

  const handleConfirm = useCallback(() => {
    if (!currentQuestion || feedbackState?.checked) return;

    let isCorrect = false;
    let userSummary = '';

    if (currentQuestion.type === 'multiple-choice' && selectedMc !== null) {
      isCorrect = selectedMc === currentQuestion.correctIndex;
      userSummary = currentQuestion.options[selectedMc];
    } else if (currentQuestion.type === 'fill-blank' && selectedBlank !== null) {
      isCorrect = selectedBlank === currentQuestion.correctAnswer;
      userSummary = selectedBlank;
    } else if (currentQuestion.type === 'true-false' && selectedTf !== null) {
      isCorrect = selectedTf === currentQuestion.correctAnswer;
      userSummary = selectedTf ? 'Verdadeiro' : 'Falso';
    } else if (currentQuestion.type === 'match-pairs' && isSimulado) {
      isCorrect = currentQuestion.pairs.every((p) => examPairMap[p.id] === p.id);
      userSummary = currentQuestion.pairs
        .map((p) => {
          const rightMatch = currentQuestion.pairs.find((r) => r.id === examPairMap[p.id]);
          return `${p.left} ↔ ${rightMatch?.right ?? '?'}`;
        })
        .join(' | ');
    } else {
      return;
    }

    const elapsedQuestionMs = Date.now() - questionStartedAtRef.current;
    const correctSummary = getCorrectLabel(currentQuestion);

    recordAnswerAttempt({
      question: currentQuestion,
      isCorrect,
      timeMs: elapsedQuestionMs,
      userAnswer: userSummary,
      correctAnswer: correctSummary,
    });

    if (isSimulado) {
      const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
      const nextCombo = isCorrect ? combo + 1 : 0;
      const nextMaxCombo = Math.max(maxCombo, nextCombo);
      const nextReview: SimuladoReviewItem[] = [
        ...reviewItems,
        {
          question: currentQuestion,
          userAnswerSummary: userSummary,
          correctAnswerSummary: correctSummary,
          isCorrect,
        },
      ];

      setCorrectCount(nextCorrect);
      setCombo(nextCombo);
      setMaxCombo(nextMaxCombo);
      setReviewItems(nextReview);

      if (isLastQuestion) {
        finalizeSession(nextCorrect, nextMaxCombo, 0, nextReview, false);
      } else {
        setCurrentIndex((prev) => prev + 1);
        resetInputs();
      }
      return;
    }

    // Modos Lição e Revisão de Erros: feedback imediato + micro-macete
    let recovered = false;
    if (isCorrect) {
      playCorrect();
      const nextCombo = combo + 1;
      setCorrectCount((prev) => prev + 1);
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));

      if (config.mode === 'mistake-review') {
        const hadMistakeEntry = Boolean(progress.mistakes[currentQuestion.id]);
        if (hadMistakeEntry) {
          recovered = resolveMistake(currentQuestion.id);
        } else if (progress.hearts < progress.maxHearts) {
          gainHeart(1);
          recovered = true;
        }
        if (recovered) {
          setHeartsRecovered((prev) => prev + 1);
        }
      }
    } else {
      playWrong();
      setCombo(0);
      if (config.mode === 'lesson') {
        loseHeart();
      }
    }

    setFeedbackState({
      checked: true,
      isCorrect,
      recoveredHeart: recovered,
    });
  }, [
    combo,
    config.mode,
    correctCount,
    currentQuestion,
    examPairMap,
    feedbackState?.checked,
    finalizeSession,
    gainHeart,
    isLastQuestion,
    isSimulado,
    loseHeart,
    maxCombo,
    playCorrect,
    playWrong,
    progress.hearts,
    progress.maxHearts,
    progress.mistakes,
    recordAnswerAttempt,
    resetInputs,
    resolveMistake,
    reviewItems,
    selectedBlank,
    selectedMc,
    selectedTf,
  ]);

  const handleContinue = useCallback(() => {
    if (isLastQuestion) {
      finalizeSession(correctCount, maxCombo, heartsRecovered, reviewItems, false);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    resetInputs();
  }, [
    correctCount,
    finalizeSession,
    heartsRecovered,
    isLastQuestion,
    maxCombo,
    resetInputs,
    reviewItems,
  ]);

  // Atalho Enter para confirmar ou continuar
  useEffect(() => {
    if (summary || showExitModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      if (feedbackState?.checked) {
        event.preventDefault();
        handleContinue();
      } else if (canConfirmAnswer) {
        event.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canConfirmAnswer, feedbackState?.checked, handleConfirm, handleContinue, showExitModal, summary]);

  if (summary) {
    return (
      <LessonSummary
        summary={summary}
        onFinish={onExit}
        onRetry={() => {
          onRetrySession();
        }}
      />
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const outOfHeartsInLesson =
    config.mode === 'lesson' && progress.hearts === 0 && !feedbackState?.checked;

  const unitMeta = getUnitMeta(currentQuestion.unitId);

  return (
    <div className="min-h-dvh flex flex-col bg-[#0B1117]">
      {/* Barra Superior do Quiz */}
      <header className="sticky top-0 z-20 border-b border-[#28384A] bg-[#0B1117]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            aria-label="Sair da sessão"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#28384A] bg-[#131C26] text-[#92A8BE] hover:text-white hover:bg-[#1D2A38]"
          >
            <X className="h-5 w-5" />
          </button>

          <ProgressBar
            value={currentIndex + (feedbackState?.checked ? 1 : 0)}
            max={config.questions.length}
            color={unitAccent}
            combo={!isSimulado ? combo : 0}
          />

          {isSimulado ? (
            <div
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-sm font-bold ${
                remainingSeconds <= 120
                  ? 'border-[#FF4B4B] bg-[#FF4B4B]/15 text-[#FF8585] animate-pulse'
                  : 'border-[#28384A] bg-[#131C26] text-[#FFC800]'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{formatClock(remainingSeconds)}</span>
            </div>
          ) : config.mode === 'mistake-review' ? (
            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#58CC02]/40 bg-[#58CC02]/10 px-3 py-1.5 text-xs font-display font-extrabold text-[#86F23B]">
              <ShieldCheck className="h-4 w-4" />
              <span>Modo Recuperação</span>
            </div>
          ) : (
            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#28384A] bg-[#131C26] px-3 py-1.5 font-display text-sm font-extrabold text-[#FF4B4B]">
              <Heart
                className={`h-4 w-4 ${
                  progress.hearts > 0 ? 'fill-[#FF4B4B] text-[#FF4B4B]' : 'text-[#92A8BE]'
                }`}
              />
              <span>{progress.hearts}</span>
            </div>
          )}
        </div>
      </header>

      {/* Área Central da Questão */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-xl px-2.5 py-1 text-xs font-display font-extrabold"
                style={{
                  backgroundColor: unitMeta.softBg,
                  color: unitMeta.accentColor,
                }}
              >
                {unitMeta.shortTitle}
              </span>
              {!isSimulado && (
                <span className="rounded-xl bg-[#131C26] border border-[#28384A] px-2.5 py-1 text-xs font-bold text-[#92A8BE]">
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            <span className="font-mono text-xs font-bold text-[#92A8BE]">
              {currentIndex + 1} / {config.questions.length}
            </span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl font-extrabold leading-snug text-[#E8F1F8]">
            {currentQuestion.prompt}
          </h1>

          {currentQuestion.type === 'multiple-choice' && (
            <MultipleChoiceRenderer
              question={currentQuestion}
              selectedIndex={selectedMc}
              onSelect={setSelectedMc}
              locked={Boolean(feedbackState?.checked)}
              showOutcome={!isSimulado && Boolean(feedbackState?.checked)}
            />
          )}

          {currentQuestion.type === 'fill-blank' && (
            <FillBlankRenderer
              question={currentQuestion}
              selectedAnswer={selectedBlank}
              onSelect={setSelectedBlank}
              locked={Boolean(feedbackState?.checked)}
              showOutcome={!isSimulado && Boolean(feedbackState?.checked)}
            />
          )}

          {currentQuestion.type === 'true-false' && (
            <TrueFalseRenderer
              question={currentQuestion}
              selectedAnswer={selectedTf}
              onSelect={setSelectedTf}
              locked={Boolean(feedbackState?.checked)}
              showOutcome={!isSimulado && Boolean(feedbackState?.checked)}
            />
          )}

          {currentQuestion.type === 'match-pairs' && (
            <MatchPairsRenderer
              question={currentQuestion}
              mode={isSimulado ? 'exam' : 'practice'}
              locked={Boolean(feedbackState?.checked)}
              examAssignments={examPairMap}
              onChangeExamAssignments={setExamPairMap}
              onPracticeFirstMistake={() => {
                playWrong();
                setCombo(0);
                recordAnswerAttempt({
                  question: currentQuestion,
                  isCorrect: false,
                  timeMs: Date.now() - questionStartedAtRef.current,
                  userAnswer: 'Associação incorreta na tentativa',
                  correctAnswer: getCorrectLabel(currentQuestion),
                });
                if (config.mode === 'lesson') {
                  loseHeart();
                }
              }}
              onPracticeComplete={(hadAnyMistake) => {
                playPairMatch();
                let recovered = false;
                if (!hadAnyMistake) {
                  recordAnswerAttempt({
                    question: currentQuestion,
                    isCorrect: true,
                    timeMs: Date.now() - questionStartedAtRef.current,
                    userAnswer: getCorrectLabel(currentQuestion),
                    correctAnswer: getCorrectLabel(currentQuestion),
                  });
                  const nextCombo = combo + 1;
                  setCorrectCount((prev) => prev + 1);
                  setCombo(nextCombo);
                  setMaxCombo((prev) => Math.max(prev, nextCombo));
                  if (config.mode === 'mistake-review') {
                    if (progress.mistakes[currentQuestion.id]) {
                      recovered = resolveMistake(currentQuestion.id);
                    } else if (progress.hearts < progress.maxHearts) {
                      gainHeart(1);
                      recovered = true;
                    }
                    if (recovered) {
                      setHeartsRecovered((prev) => prev + 1);
                    }
                  }
                }
                setFeedbackState({
                  checked: true,
                  isCorrect: !hadAnyMistake,
                  recoveredHeart: recovered,
                });
              }}
            />
          )}
        </div>
      </main>

      {/* Rodapé Fixo: Botão Confirmar ou Barra de Feedback */}
      <footer className="sticky bottom-0 z-20 bg-[#0B1117]/95 backdrop-blur-md">
        {feedbackState?.checked ? (
          <FeedbackBanner
            isCorrect={feedbackState.isCorrect}
            correctLabel={getCorrectLabel(currentQuestion)}
            tip={currentQuestion.tip}
            isLastQuestion={isLastQuestion}
            recoveredHeart={feedbackState.recoveredHeart}
            combo={combo}
            onContinue={handleContinue}
          />
        ) : (
          <div className="border-t border-[#28384A] px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
              <p className="hidden sm:block text-xs text-[#92A8BE]">
                {isSimulado
                  ? 'Modo Simulado: sem dicas durante a prova. Gabarito ao final.'
                  : currentQuestion.type === 'match-pairs'
                  ? 'Conecte todos os 4 pares corretos para avançar.'
                  : 'Selecione sua resposta e pressione Verificar.'}
              </p>

              {!(currentQuestion.type === 'match-pairs' && !isSimulado) && (
                <TactileButton
                  variant={isSimulado ? 'gold' : 'success'}
                  size="lg"
                  disabled={!canConfirmAnswer}
                  onClick={handleConfirm}
                  className="w-full sm:w-auto sm:min-w-[200px] ml-auto"
                >
                  {isSimulado
                    ? isLastQuestion
                      ? 'Finalizar Simulado'
                      : 'Confirmar & Próxima'
                    : 'Verificar'}
                </TactileButton>
              )}
            </div>
          </div>
        )}
      </footer>

      {/* Modal de Saída */}
      <Modal
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Sair desta sessão?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#92A8BE] leading-relaxed">
            Seu progresso nesta rodada será perdido, mas as vidas e o histórico anterior continuam preservados.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <TactileButton
              variant="outline"
              fullWidth
              onClick={() => setShowExitModal(false)}
            >
              Continuar Estudando
            </TactileButton>
            <TactileButton variant="danger" fullWidth onClick={onExit}>
              Sair Mesmo Assim
            </TactileButton>
          </div>
        </div>
      </Modal>

      {/* Modal sem corações durante uma lição */}
      <Modal
        open={outOfHeartsInLesson}
        onClose={onExit}
        title="Seus corações acabaram!"
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF4B4B]/15 border-2 border-[#FF4B4B]/50 text-[#FF4B4B]">
            <HeartCrack className="h-8 w-8" />
          </div>
          <p className="text-sm text-[#92A8BE] leading-relaxed">
            Você perdeu todas as 5 vidas nesta rodada. Revise as questões que errou para recuperar corações imediatamente e voltar com tudo!
          </p>
          <div className="flex flex-col gap-3">
            <TactileButton variant="danger" fullWidth onClick={onStartMistakeReview}>
              <RotateCcw className="h-4 w-4" />
              <span>Revisar Erros e Ganhar Vidas</span>
            </TactileButton>
            <TactileButton variant="outline" fullWidth onClick={onExit}>
              Voltar ao Mapa
            </TactileButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
