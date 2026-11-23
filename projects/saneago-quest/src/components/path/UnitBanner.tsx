import { BookOpen, Calculator, Crown, Droplets, Lock, Monitor, Timer, Trophy } from 'lucide-react';
import { UnitId, UnitMeta } from '../../types/quiz';
import { TactileButton } from '../ui/TactileButton';

interface UnitBannerProps {
  unit: UnitMeta;
  completedLessonsCount: number;
  goldenLessonsCount?: number;
  simuladoUnlocked: boolean;
  onStartSimulado: (unitId: UnitId) => void;
  onOpenGuide: (unitId: UnitId) => void;
}

const UNIT_ICONS: Record<UnitId, typeof BookOpen> = {
  portugues: BookOpen,
  matematica: Calculator,
  informatica: Monitor,
  saneago: Droplets,
};

export function UnitBanner({
  unit,
  completedLessonsCount,
  goldenLessonsCount = 0,
  simuladoUnlocked,
  onStartSimulado,
  onOpenGuide,
}: UnitBannerProps) {
  const Icon = UNIT_ICONS[unit.id];
  const percent = Math.round((completedLessonsCount / unit.lessonCount) * 100);
  const allGolden = goldenLessonsCount >= unit.lessonCount;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 shadow-lg"
      style={{
        backgroundColor: '#131C26',
        borderColor: allGolden ? '#F59E0B' : `${unit.accentColor}55`,
      }}
    >
      {/* Barra de acento superior */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: allGolden
            ? 'linear-gradient(90deg, #FDE68A, #FBBF24, #F59E0B)'
            : unit.accentColor,
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-display font-extrabold uppercase tracking-wider"
              style={{
                backgroundColor: unit.softBg,
                color: unit.accentColor,
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              Unidade {unit.number}
            </span>
            <span className="rounded-xl bg-[#1D2A38] border border-[#28384A] px-2.5 py-1 text-[11px] font-bold text-[#92A8BE]">
              {unit.badgeText}
            </span>
            {goldenLessonsCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/55 px-2.5 py-1 text-[11px] font-display font-extrabold text-[#FBBF24]">
                <Crown className="h-3 w-3" />
                <span>
                  {goldenLessonsCount}/{unit.lessonCount} douradas
                </span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#E8F1F8]">
            {unit.title}
          </h2>
          <p className="text-sm text-[#92A8BE] leading-relaxed">{unit.subtitle}</p>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2.5 shrink-0">
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-bold text-[#92A8BE]">
            <span>
              {completedLessonsCount}/{unit.lessonCount} lições
            </span>
            <span style={{ color: allGolden ? '#FBBF24' : unit.accentColor }}>
              {percent}%
            </span>
          </div>

          {/* Indicador de progresso dourado (4 segmentos da unidade) */}
          <div
            className="flex items-center gap-1.5 self-end"
            aria-label={`Maestria dourada: ${goldenLessonsCount} de ${unit.lessonCount}`}
          >
            {Array.from({ length: unit.lessonCount }, (_, idx) => (
              <span
                key={`gold-seg-${idx}`}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  idx < goldenLessonsCount
                    ? 'bg-gradient-to-r from-[#FDE68A] to-[#F59E0B] shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'bg-[#28384A]'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <TactileButton
              size="sm"
              variant="outline"
              onClick={() => onOpenGuide(unit.id)}
              style={{ borderColor: `${unit.accentColor}75` }}
              title={`Abrir Guia Teórico completo de ${unit.shortTitle}`}
            >
              <span aria-hidden="true">📖</span>
              <span>Guia Teórico</span>
            </TactileButton>

            <TactileButton
              size="sm"
              variant={simuladoUnlocked ? 'gold' : 'outline'}
              disabled={!simuladoUnlocked}
              onClick={() => onStartSimulado(unit.id)}
              title={
                simuladoUnlocked
                  ? `Iniciar Simulado Cronometrado de ${unit.shortTitle}`
                  : `Conclua as ${unit.lessonCount} lições desta unidade para liberar`
              }
            >
              {simuladoUnlocked ? (
                <>
                  <Trophy className="h-4 w-4" />
                  <span>Simulado ({unit.simuladoDurationMinutes}m)</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <Timer className="h-3.5 w-3.5" />
                  <span>Simulado bloqueado</span>
                </>
              )}
            </TactileButton>
          </div>
        </div>
      </div>
    </section>
  );
}
