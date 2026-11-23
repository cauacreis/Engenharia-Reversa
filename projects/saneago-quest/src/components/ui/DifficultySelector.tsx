import { Crown, Flame, Scale } from 'lucide-react';
import { DifficultyMode } from '../../types/quiz';

interface DifficultySelectorProps {
  value: DifficultyMode;
  onChange: (mode: DifficultyMode) => void;
  compact?: boolean;
}

const MODES: Array<{
  id: DifficultyMode;
  label: string;
  badge: string;
  description: string;
  Icon: typeof Scale;
}> = [
  {
    id: 'balanced',
    label: 'Equilibrado',
    badge: 'Padrão',
    description: 'Mistura questões médias de base com questões difíceis estilo banca.',
    Icon: Scale,
  },
  {
    id: 'hard',
    label: 'Banca Real',
    badge: 'Difícil',
    description: 'Apenas questões difíceis e densas com distratores sutis da Patativa.',
    Icon: Flame,
  },
  {
    id: 'legendary',
    label: 'Lendário',
    badge: 'Sem Cola',
    description: 'Somente questões difíceis/lendárias e com a Cola Teórica bloqueada.',
    Icon: Crown,
  },
];

export function DifficultySelector({
  value,
  onChange,
  compact = false,
}: DifficultySelectorProps) {
  const activeOption = MODES.find((m) => m.id === value) ?? MODES[0];

  return (
    <section
      className={`rounded-3xl border-2 border-[#28384A] bg-[#131C26] ${
        compact ? 'p-4 space-y-3' : 'p-4 sm:p-5 space-y-3'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-xs font-extrabold uppercase tracking-wider text-[#92A8BE]">
          Nível de Dificuldade das Sessões
        </span>
        <span
          className={`rounded-lg px-2 py-0.5 font-display text-[11px] font-extrabold ${
            value === 'legendary'
              ? 'bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/50'
              : value === 'hard'
              ? 'bg-[#FF9600]/20 text-[#FFB340] border border-[#FF9600]/50'
              : 'bg-[#00B8FF]/15 text-[#61D5FF] border border-[#00B8FF]/40'
          }`}
        >
          {activeOption.label} ({activeOption.badge})
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Selecionar dificuldade manual"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      >
        {MODES.map(({ id, label, badge, Icon }) => {
          const active = value === id;
          const activeClasses =
            id === 'legendary'
              ? 'border-[#F59E0B] bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/10 text-[#FDE68A]'
              : id === 'hard'
              ? 'border-[#FF9600] bg-[#FF9600]/15 text-[#FFD28A]'
              : 'border-[#00B8FF] bg-[#00B8FF]/15 text-[#8FE2FF]';

          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(id)}
              className={`flex items-center justify-between sm:justify-center gap-2 rounded-2xl border-2 border-b-[4px] px-3.5 py-2.5 text-left sm:text-center transition-all duration-100 active:translate-y-[2px] active:border-b-2 ${
                active
                  ? activeClasses
                  : 'border-[#28384A] bg-[#0B1117]/75 text-[#92A8BE] hover:border-[#3D556E] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-display text-xs sm:text-sm font-extrabold">
                  {label}
                </span>
              </div>
              <span className="rounded-md bg-black/30 px-1.5 py-0.5 text-[10px] font-mono font-bold">
                {badge}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#92A8BE] leading-relaxed">{activeOption.description}</p>
    </section>
  );
}
