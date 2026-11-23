import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, Lightbulb, Play, X } from 'lucide-react';
import { getGuidesByUnit, getUnitGuideOverview } from '../../data/lessonGuides';
import { getLessonsByUnit, getUnitMeta } from '../../data/questions';
import { UnitId } from '../../types/quiz';
import { Mascot } from '../Mascot';
import {
  CheatSheetTableCard,
  ExamplesComparisonList,
  KeyRulesList,
} from '../guide/GuideBlocks';
import { TactileButton } from '../ui/TactileButton';

interface UnitGuideModalProps {
  unitId: UnitId | null;
  onClose: () => void;
  onPracticeNow: (unitId: UnitId, preferredLessonId?: string) => void;
}

export function UnitGuideModal({
  unitId,
  onClose,
  onPracticeNow,
}: UnitGuideModalProps) {
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');

  useEffect(() => {
    setSelectedLessonFilter('all');
  }, [unitId]);

  useEffect(() => {
    if (!unitId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, unitId]);

  const unitData = useMemo(() => {
    if (!unitId) return null;
    const unit = getUnitMeta(unitId);
    const overview = getUnitGuideOverview(unitId);
    const guides = getGuidesByUnit(unitId);
    const lessons = getLessonsByUnit(unitId);
    return { unit, overview, guides, lessons };
  }, [unitId]);

  const visibleGuides = useMemo(() => {
    if (!unitData) return [];
    if (selectedLessonFilter === 'all') return unitData.guides;
    return unitData.guides.filter((g) => g.lessonId === selectedLessonFilter);
  }, [selectedLessonFilter, unitData]);

  return (
    <AnimatePresence>
      {unitData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={`Guia Teórico — ${unitData.unit.title}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-2 border-[#28384A] bg-[#131C26] shadow-2xl"
          >
            {/* Faixa superior colorida */}
            <div
              className="h-1.5 w-full shrink-0"
              style={{ backgroundColor: unitData.unit.accentColor }}
            />

            {/* Header Fixo */}
            <div className="shrink-0 border-b border-[#28384A] px-4 py-4 sm:px-6 space-y-3 bg-[#131C26]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-0.5 text-[11px] font-display font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: unitData.unit.softBg,
                      color: unitData.unit.accentColor,
                    }}
                  >
                    <BookOpenCheck className="h-3.5 w-3.5" />
                    Guia Teórico • Unidade {unitData.unit.number}
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#E8F1F8] truncate">
                    {unitData.unit.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar guia teórico"
                  className="shrink-0 rounded-xl p-1.5 text-[#92A8BE] hover:bg-[#1D2A38] hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filtro por lição */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedLessonFilter('all')}
                  className={`shrink-0 rounded-xl border px-3 py-1.5 font-display text-xs font-extrabold transition-colors ${
                    selectedLessonFilter === 'all'
                      ? 'border-transparent text-[#071520]'
                      : 'border-[#28384A] bg-[#0B1117]/80 text-[#92A8BE] hover:text-white'
                  }`}
                  style={
                    selectedLessonFilter === 'all'
                      ? { backgroundColor: unitData.unit.accentColor }
                      : undefined
                  }
                >
                  Todas as {unitData.lessons.length} Lições
                </button>

                {unitData.lessons.map((lesson) => {
                  const active = selectedLessonFilter === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setSelectedLessonFilter(lesson.id)}
                      className={`shrink-0 rounded-xl border px-3 py-1.5 font-display text-xs font-extrabold transition-colors ${
                        active
                          ? 'border-transparent text-[#071520]'
                          : 'border-[#28384A] bg-[#0B1117]/80 text-[#92A8BE] hover:text-white'
                      }`}
                      style={
                        active
                          ? { backgroundColor: unitData.unit.accentColor }
                          : undefined
                      }
                    >
                      {lesson.order}. {lesson.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corpo Rolável */}
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-6">
              {/* Boas-vindas com Pingo */}
              <div className="rounded-2xl border-2 border-[#28384A] bg-[#0B1117]/85 p-4 sm:p-5 space-y-3.5">
                <Mascot
                  mood="teaching"
                  size="md"
                  accentColor={unitData.unit.accentColor}
                  speechTitle="Pingo • Guia de Estudo"
                  speech={unitData.overview.mascotSpeech}
                />

                <p className="text-xs sm:text-sm text-[#C7D7E6] leading-relaxed">
                  {unitData.overview.intro}
                </p>

                <div className="flex items-start gap-2 rounded-xl border border-[#FFC800]/35 bg-[#FFC800]/10 px-3.5 py-2.5 text-xs text-[#FFE58F] leading-relaxed">
                  <Lightbulb className="h-4 w-4 shrink-0 text-[#FFC800] mt-0.5" />
                  <span>{unitData.overview.examTip}</span>
                </div>
              </div>

              {/* Lista das Lições Visíveis */}
              <div className="space-y-6">
                {visibleGuides.map((guide) => {
                  const lessonMeta = unitData.lessons.find(
                    (l) => l.id === guide.lessonId
                  );
                  return (
                    <article
                      key={guide.lessonId}
                      className="rounded-2xl border-2 border-[#28384A] bg-[#0B1117]/80 p-4 sm:p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#28384A] pb-3">
                        <div className="space-y-1">
                          <span
                            className="inline-block rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold"
                            style={{
                              backgroundColor: unitData.unit.softBg,
                              color: unitData.unit.accentColor,
                            }}
                          >
                            Lição {lessonMeta?.order ?? ''}
                          </span>
                          <h3 className="font-display text-lg font-extrabold text-[#E8F1F8]">
                            {guide.title}
                          </h3>
                        </div>

                        <TactileButton
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onPracticeNow(unitData.unit.id, guide.lessonId)
                          }
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Praticar Lição</span>
                        </TactileButton>
                      </div>

                      <p className="text-xs sm:text-sm text-[#C7D7E6] leading-relaxed">
                        {guide.summary}
                      </p>

                      <div className="space-y-2">
                        <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#92A8BE]">
                          Regras de Ouro & Mnemônicos
                        </h4>
                        <KeyRulesList
                          rules={guide.keyRules}
                          accentColor={unitData.unit.accentColor}
                        />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#92A8BE]">
                          Certo vs. Errado na Banca
                        </h4>
                        <ExamplesComparisonList examples={guide.examples} />
                      </div>

                      {guide.cheatSheetTable && (
                        <CheatSheetTableCard
                          table={guide.cheatSheetTable}
                          accentColor={unitData.unit.accentColor}
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Rodapé Fixo */}
            <div className="shrink-0 border-t border-[#28384A] bg-[#131C26] px-4 py-3.5 sm:px-6 flex items-center justify-between gap-3">
              <TactileButton variant="outline" size="md" onClick={onClose}>
                Fechar
              </TactileButton>

              <TactileButton
                size="md"
                customBg={unitData.unit.accentColor}
                customShade={unitData.unit.shadeColor}
                customText="#071520"
                onClick={() =>
                  onPracticeNow(
                    unitData.unit.id,
                    selectedLessonFilter === 'all'
                      ? undefined
                      : selectedLessonFilter
                  )
                }
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Praticar Agora</span>
              </TactileButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
