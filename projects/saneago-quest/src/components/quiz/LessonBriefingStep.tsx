import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Play,
  SkipForward,
  X,
} from 'lucide-react';
import { LessonGuide, UnitMeta } from '../../types/quiz';
import { Mascot } from '../Mascot';
import {
  CheatSheetTableCard,
  ExamplesComparisonList,
  KeyRulesList,
} from '../guide/GuideBlocks';
import { TactileButton } from '../ui/TactileButton';

interface LessonBriefingStepProps {
  guide: LessonGuide;
  unitMeta: UnitMeta;
  lessonTitle: string;
  questionCount: number;
  onStartQuestions: () => void;
  onExit: () => void;
}

interface BriefingCardDef {
  id: 'rules' | 'examples' | 'table';
  badge: string;
  title: string;
}

export function LessonBriefingStep({
  guide,
  unitMeta,
  lessonTitle,
  questionCount,
  onStartQuestions,
  onExit,
}: LessonBriefingStepProps) {
  const cards = useMemo<BriefingCardDef[]>(() => {
    const list: BriefingCardDef[] = [
      {
        id: 'rules',
        badge: 'Cartão 1 • Regras de Ouro',
        title: 'Aprenda a Regra do Zero',
      },
      {
        id: 'examples',
        badge: 'Cartão 2 • Pegadinhas da Banca',
        title: 'Comparativo: Certo vs. Errado',
      },
    ];
    if (guide.cheatSheetTable) {
      list.push({
        id: 'table',
        badge: 'Cartão 3 • Resumo Visual',
        title: guide.cheatSheetTable.title,
      });
    }
    return list;
  }, [guide.cheatSheetTable]);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLastStep = step === cards.length - 1;
  const activeCard = cards[step];

  const goToStep = useCallback(
    (nextStep: number) => {
      if (nextStep < 0 || nextStep >= cards.length || nextStep === step) return;
      setDirection(nextStep > step ? 1 : -1);
      setStep(nextStep);
    },
    [cards.length, step]
  );

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onStartQuestions();
    } else {
      goToStep(step + 1);
    }
  }, [goToStep, isLastStep, onStartQuestions, step]);

  const handlePrev = useCallback(() => {
    goToStep(step - 1);
  }, [goToStep, step]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -60 && !isLastStep) {
      goToStep(step + 1);
    } else if (info.offset.x > 60 && step > 0) {
      goToStep(step - 1);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (!isLastStep) goToStep(step + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (step > 0) goToStep(step - 1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToStep, handleNext, isLastStep, step]);

  return (
    <div className="min-h-dvh flex flex-col bg-[#0B1117]">
      {/* Header estilo Stories + Pular */}
      <header className="sticky top-0 z-20 border-b border-[#28384A] bg-[#0B1117]/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3.5 sm:px-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onExit}
              aria-label="Sair da lição"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#28384A] bg-[#131C26] text-[#92A8BE] hover:text-white hover:bg-[#1D2A38]"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Barrinhas segmentadas clicáveis estilo stories */}
            <div
              className="flex flex-1 items-center gap-2 max-w-md"
              role="tablist"
              aria-label="Etapas da explicação"
            >
              {cards.map((card, idx) => {
                const reached = idx <= step;
                return (
                  <button
                    key={card.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === step}
                    aria-label={card.badge}
                    onClick={() => goToStep(idx)}
                    className="h-2.5 flex-1 rounded-full bg-[#1D2A38] overflow-hidden cursor-pointer"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: reached ? '100%' : '0%',
                        backgroundColor: unitMeta.accentColor,
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <TactileButton
              size="sm"
              variant="outline"
              onClick={onStartQuestions}
              className="shrink-0"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pular para as Questões</span>
              <span className="sm:hidden">Pular</span>
            </TactileButton>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-display font-extrabold"
                style={{
                  backgroundColor: unitMeta.softBg,
                  color: unitMeta.accentColor,
                }}
              >
                <BookOpenCheck className="h-3.5 w-3.5" />
                {unitMeta.shortTitle}
              </span>
              <span className="font-display font-bold text-[#E8F1F8] truncate max-w-[210px] sm:max-w-none">
                {lessonTitle}
              </span>
            </div>

            <span className="font-mono text-[11px] font-bold text-[#92A8BE]">
              Cartão {step + 1} de {cards.length}
            </span>
          </div>
        </div>
      </header>

      {/* Cartão Central Deslizável */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 overflow-x-hidden">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeCard.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={handleDragEnd}
              className="rounded-3xl border-2 border-[#28384A] bg-[#131C26]/90 p-5 sm:p-6 shadow-xl space-y-5 cursor-grab active:cursor-grabbing"
            >
              <div className="space-y-1">
                <span
                  className="inline-block rounded-lg px-2.5 py-0.5 font-mono text-[11px] font-bold"
                  style={{
                    backgroundColor: unitMeta.softBg,
                    color: unitMeta.accentColor,
                  }}
                >
                  {activeCard.badge}
                </span>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#E8F1F8]">
                  {activeCard.title}
                </h1>
              </div>

              {activeCard.id === 'rules' && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[#28384A] bg-[#0B1117]/80 p-4 space-y-3">
                    <Mascot
                      mood="teaching"
                      size="md"
                      accentColor={unitMeta.accentColor}
                      speechTitle="Pingo • Briefing Rápido"
                      speech={guide.mascotWelcome}
                    />
                    <p className="text-xs sm:text-sm text-[#C7D7E6] leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>

                  <KeyRulesList
                    rules={guide.keyRules}
                    accentColor={unitMeta.accentColor}
                  />
                </div>
              )}

              {activeCard.id === 'examples' && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-[#92A8BE] leading-relaxed">
                    Veja na prática como a banca transforma o certo em pegadinha — compare lado a lado antes de responder:
                  </p>
                  <ExamplesComparisonList examples={guide.examples} />
                </div>
              )}

              {activeCard.id === 'table' && guide.cheatSheetTable && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-[#92A8BE] leading-relaxed">
                    Guarde esta tabela visual na memória antes de entrar no desafio. Você também poderá abri-la depois clicando em{' '}
                    <strong className="text-[#E8F1F8]">📖 Cola Teórica</strong> no topo da tela.
                  </p>
                  <CheatSheetTableCard
                    table={guide.cheatSheetTable}
                    accentColor={unitMeta.accentColor}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Rodapé Fixo de Navegação */}
      <footer className="sticky bottom-0 z-20 border-t border-[#28384A] bg-[#0B1117]/95 backdrop-blur-md px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div>
            {step > 0 ? (
              <TactileButton variant="outline" size="md" onClick={handlePrev}>
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </TactileButton>
            ) : (
              <p className="hidden sm:block text-xs text-[#92A8BE]">
                Deslize para o lado ou avance para revisar antes do treino.
              </p>
            )}
          </div>

          <TactileButton
            size="lg"
            customBg={isLastStep ? '#58CC02' : unitMeta.accentColor}
            customShade={isLastStep ? '#46A302' : unitMeta.shadeColor}
            customText="#071520"
            onClick={handleNext}
            className="min-w-[190px] sm:min-w-[240px]"
          >
            {isLastStep ? (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Começar as {questionCount} Questões</span>
              </>
            ) : (
              <>
                <span>Próximo Cartão</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </TactileButton>
        </div>
      </footer>
    </div>
  );
}
