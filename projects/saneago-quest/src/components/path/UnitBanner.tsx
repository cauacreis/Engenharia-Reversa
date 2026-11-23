import { BookOpen, Calculator, Droplets, Lock, Monitor, Timer, Trophy } from 'lucide-react';
import { UnitId, UnitMeta } from '../../types/quiz';
import { TactileButton } from '../ui/TactileButton';

interface UnitBannerProps {
  unit: UnitMeta;
  completedLessonsCount: number;
  simuladoUnlocked: boolean;
  onStartSimulado: (unitId: UnitId) => void;
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
  simuladoUnlocked,
  onStartSimulado,
}: UnitBannerProps) {
  const Icon = UNIT_ICONS[unit.id];
  const percent = Math.round((completedLessonsCount / unit.lessonCount) * 100);

  return (
    <section
      className="relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 shadow-lg"
      style={{
        backgroundColor: '#131C26',
        borderColor: `${unit.accentColor}55`,
      }}
    >
      {/* Barra de acento superior */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: unit.accentColor }}
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
            <span style={{ color: unit.accentColor }}>{percent}%</span>
          </div>

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
    </section>
  );
}
