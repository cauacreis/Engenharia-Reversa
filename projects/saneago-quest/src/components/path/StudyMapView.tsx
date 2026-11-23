import { ArrowRight, CalendarCheck, Heart, RotateCcw, ShieldAlert, Target, Trophy } from 'lucide-react';
import { EXAM_DATE_DISPLAY, EXAM_DATE_ISO } from '../../data/examChecklist';
import { getLessonsByUnit, LESSONS, UNITS } from '../../data/questions';
import { useGameProgress } from '../../hooks/useGameProgress';
import { AppTab, LessonMeta, UnitId } from '../../types/quiz';
import { Mascot } from '../Mascot';
import { ProgressBar } from '../ui/ProgressBar';
import { TactileButton } from '../ui/TactileButton';
import { UnitBanner } from './UnitBanner';
import { WindingPath } from './WindingPath';

interface StudyMapViewProps {
  onStartLesson: (lesson: LessonMeta, options?: { forceBriefing?: boolean }) => void;
  onStartUnitSimulado: (unitId: UnitId) => void;
  onStartGeneralSimulado: () => void;
  onStartMistakeReview: () => void;
  onGenerateUnitAI: (unitId: UnitId) => void;
  onOpenUnitGuide: (unitId: UnitId) => void;
  onNavigateTab: (tab: AppTab) => void;
}

function getDaysUntilExam(): number {
  const now = new Date();
  const examDate = new Date(EXAM_DATE_ISO);
  return Math.max(0, Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function StudyMapView({
  onStartLesson,
  onStartUnitSimulado,
  onStartGeneralSimulado,
  onStartMistakeReview,
  onGenerateUnitAI,
  onOpenUnitGuide,
  onNavigateTab,
}: StudyMapViewProps) {
  const {
    progress,
    mistakeIds,
    isLessonUnlocked,
    isLessonCompleted,
    isUnitSimuladoUnlocked,
    isGeneralSimuladoUnlocked,
    getUnitCompletedLessonCount,
  } = useGameProgress();

  const totalCompleted = Object.keys(progress.completedLessons).length;
  const generalUnlocked = isGeneralSimuladoUnlocked();
  const daysLeft = getDaysUntilExam();

  const mascotSpeech =
    progress.hearts === 0
      ? 'Eita! Sem corações. Vamos revisar seus erros para voltar à trilha agora mesmo!'
      : progress.streak > 0
      ? `Ofensiva de ${progress.streak} ${
          progress.streak === 1 ? 'dia' : 'dias'
        } ativa! Faltam ${daysLeft} dias para a prova de 06/12/2026.`
      : `Faltam ${daysLeft} dias para a prova online da Saneago! Lembre: Português vale mais e é o 1º desempate.`;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Coluna principal: Trilha das 4 Unidades */}
      <div className="space-y-8 lg:col-span-8">
        {/* Hero compacto da jornada */}
        <div className="hydro-grid-bg relative overflow-hidden rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#00B8FF]/15 border border-[#00B8FF]/40 px-2.5 py-1 text-xs font-display font-extrabold text-[#00B8FF]">
                Revisão Intensiva — Edital nº 001/2026
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#E8F1F8]">
                Trilha de Aprovação SANEAGO
              </h1>
              <p className="text-sm text-[#92A8BE]">
                Português possui o maior peso e é o critério de desempate. Conclua cada unidade para liberar os simulados cronometrados.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start sm:items-end gap-1 rounded-2xl bg-[#0B1117]/80 border border-[#28384A] px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#92A8BE]">
                Progresso Geral
              </span>
              <span className="font-display text-2xl font-extrabold text-[#58CC02]">
                {totalCompleted}/{LESSONS.length} lições
              </span>
            </div>
          </div>

          {/* Mascote Pingo na trilha principal com balão contextual */}
          <div className="mt-5 pt-4 border-t border-[#28384A]/70">
            <Mascot
              mood={progress.hearts === 0 ? 'sad' : 'idle'}
              size="md"
              accentColor={progress.hearts === 0 ? '#FF4B4B' : '#00B8FF'}
              speechTitle="Pingo • Engenheiro Saneago"
              speech={mascotSpeech}
            />
          </div>
        </div>

        {/* Banner de alerta quando está sem corações */}
        {progress.hearts === 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border-2 border-[#FF4B4B]/60 bg-[#FF4B4B]/10 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-[#FF4B4B] shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display text-lg font-extrabold text-[#FFD2D2]">
                  Você ficou sem corações!
                </h2>
                <p className="text-sm text-[#E8B4B4]">
                  Revise questões erradas ou faça uma prática de recuperação para ganhar vidas novamente.
                </p>
              </div>
            </div>
            <TactileButton variant="danger" size="sm" onClick={onStartMistakeReview}>
              <RotateCcw className="h-4 w-4" />
              <span>Recuperar Corações</span>
            </TactileButton>
          </div>
        )}

        {/* As 4 Unidades em Trilha */}
        <div className="space-y-10">
          {UNITS.map((unit) => {
            const unitLessons = getLessonsByUnit(unit.id);
            const completedCount = getUnitCompletedLessonCount(unit.id);
            const simuladoUnlocked = isUnitSimuladoUnlocked(unit.id);

            return (
              <div key={unit.id} className="space-y-4">
                <UnitBanner
                  unit={unit}
                  completedLessonsCount={completedCount}
                  simuladoUnlocked={simuladoUnlocked}
                  onStartSimulado={onStartUnitSimulado}
                  onOpenGuide={onOpenUnitGuide}
                />

                <WindingPath
                  unit={unit}
                  lessons={unitLessons}
                  isLessonUnlocked={isLessonUnlocked}
                  isLessonCompleted={isLessonCompleted}
                  getLessonBestAccuracy={(lessonId) =>
                    progress.completedLessons[lessonId]?.bestAccuracy
                  }
                  simuladoUnlocked={simuladoUnlocked}
                  onSelectLesson={onStartLesson}
                  onStartSimulado={onStartUnitSimulado}
                  onGenerateUnitAI={onGenerateUnitAI}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel Lateral (Desktop) / Cards Finais (Mobile) */}
      <aside className="space-y-5 lg:col-span-4">
        {/* Meta Diária */}
        <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FF9600]" />
              <h3 className="font-display text-lg font-extrabold">Meta Diária</h3>
            </div>
            <span className="font-mono text-xs font-bold text-[#FFC800]">
              {progress.dailyXp}/{progress.dailyGoalXp} XP
            </span>
          </div>

          <ProgressBar
            value={progress.dailyXp}
            max={progress.dailyGoalXp}
            color="#FFC800"
            heightClass="h-3.5"
          />

          <p className="text-xs text-[#92A8BE]">
            {progress.dailyXp >= progress.dailyGoalXp
              ? 'Meta batida hoje! Sua ofensiva está protegida.'
              : `Faltam ${Math.max(0, progress.dailyGoalXp - progress.dailyXp)} XP para bater sua meta de hoje.`}
          </p>
        </div>

        {/* Vidas & Recuperação */}
        <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-[#FF4B4B] fill-[#FF4B4B]" />
              <h3 className="font-display text-lg font-extrabold">Vidas & Erros</h3>
            </div>
            <span className="font-display text-sm font-extrabold text-[#FF4B4B]">
              {progress.hearts}/{progress.maxHearts}
            </span>
          </div>

          <p className="text-xs text-[#92A8BE] leading-relaxed">
            {mistakeIds.length > 0
              ? `Você tem ${mistakeIds.length} ${mistakeIds.length === 1 ? 'questão' : 'questões'} no banco de erros pronta para revisão.`
              : 'Nenhum erro pendente no momento. Excelente precisão!'}
          </p>

          {(progress.hearts < progress.maxHearts || mistakeIds.length > 0) && (
            <TactileButton
              variant={mistakeIds.length > 0 ? 'warning' : 'outline'}
              size="sm"
              fullWidth
              onClick={onStartMistakeReview}
            >
              <RotateCcw className="h-4 w-4" />
              <span>
                {mistakeIds.length > 0
                  ? 'Revisar Erros e Recuperar'
                  : 'Prática para Recuperar Vidas'}
              </span>
            </TactileButton>
          )}
        </div>

        {/* Simulado Geral Patativa */}
        <div className="rounded-3xl border-2 border-[#FFC800]/40 bg-[#131C26] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#FFC800]" />
            <h3 className="font-display text-lg font-extrabold">Simulado Final Patativa</h3>
          </div>
          <p className="text-xs text-[#92A8BE] leading-relaxed">
            20 questões cronometradas (25 min) com peso maior em Português e zero dicas durante a prova.
          </p>
          <TactileButton
            variant={generalUnlocked ? 'gold' : 'outline'}
            size="sm"
            fullWidth
            disabled={!generalUnlocked}
            onClick={onStartGeneralSimulado}
          >
            <span>
              {generalUnlocked
                ? 'Iniciar Simulado Geral'
                : `Faltam ${LESSONS.length - totalCompleted} lições para liberar`}
            </span>
            <ArrowRight className="h-4 w-4" />
          </TactileButton>
        </div>

        {/* Atalho Checklist Dia da Prova */}
        <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-[#14B8A6]" />
            <h3 className="font-display text-lg font-extrabold">Prova: {EXAM_DATE_DISPLAY}</h3>
          </div>
          <p className="text-xs text-[#92A8BE]">
            Lembrete crítico: cada desconexão na prova online desconta 1 questão.
          </p>
          <TactileButton
            variant="neutral"
            size="sm"
            fullWidth
            onClick={() => onNavigateTab('prova')}
          >
            <span>Abrir Checklist & Cola Rápida</span>
            <ArrowRight className="h-4 w-4" />
          </TactileButton>
        </div>
      </aside>
    </div>
  );
}
