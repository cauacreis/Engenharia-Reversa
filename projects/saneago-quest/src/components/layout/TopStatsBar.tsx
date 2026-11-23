import { CalendarClock, Droplets, Flame, Heart, Settings, Volume2, VolumeX, Zap } from 'lucide-react';
import { EXAM_DATE_ISO } from '../../data/examChecklist';
import { useGameProgress } from '../../hooks/useGameProgress';
import { getGroqApiKey } from '../../services/groqTutorService';

interface TopStatsBarProps {
  onOpenSettings: () => void;
}

function getDaysUntilExam(): number {
  const now = new Date();
  const examDate = new Date(EXAM_DATE_ISO);
  const diffMs = examDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function TopStatsBar({ onOpenSettings }: TopStatsBarProps) {
  const { progress, toggleSound } = useGameProgress();
  const daysLeft = getDaysUntilExam();
  const hasGroqKey = Boolean(getGroqApiKey());

  return (
    <header className="sticky top-0 z-30 border-b border-[#28384A] bg-[#0B1117]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-6">
        {/* Marca */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#00B8FF]/15 border-2 border-[#00B8FF]/40 text-[#00B8FF] shadow-[0_3px_0_0_rgba(0,136,194,0.45)]">
            <Droplets className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-[#E8F1F8] truncate">
                Saneago Quest
              </span>
              <span className="hidden sm:inline-flex items-center rounded-lg bg-[#1D2A38] border border-[#28384A] px-2 py-0.5 text-[11px] font-bold text-[#92A8BE]">
                Edital 001/2026
              </span>
            </div>
            <p className="hidden sm:block text-xs text-[#92A8BE] truncate">
              Banca Universidade Patativa do Assaré
            </p>
          </div>
        </div>

        {/* Métricas estilo Duolingo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            title="Dias até a prova online (06/12/2026)"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-xl bg-[#131C26] border border-[#28384A] px-3 py-1.5 text-xs font-bold text-[#92A8BE]"
          >
            <CalendarClock className="h-4 w-4 text-[#14B8A6]" />
            <span>{daysLeft === 0 ? 'Prova hoje!' : `${daysLeft}d p/ prova`}</span>
          </div>

          <div
            title="Ofensiva de dias seguidos"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#131C26] border border-[#28384A] px-2.5 py-1.5 text-sm font-display font-extrabold"
          >
            <Flame
              className={`h-4 w-4 ${
                progress.streak > 0 ? 'text-[#FF9600] fill-[#FF9600]' : 'text-[#92A8BE]'
              }`}
            />
            <span className={progress.streak > 0 ? 'text-[#FFB340]' : 'text-[#92A8BE]'}>
              {progress.streak}
            </span>
          </div>

          <div
            title="Pontos de experiência (XP)"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#131C26] border border-[#28384A] px-2.5 py-1.5 text-sm font-display font-extrabold"
          >
            <Zap className="h-4 w-4 text-[#FFC800] fill-[#FFC800]" />
            <span className="text-[#FFC800]">{progress.xp}</span>
          </div>

          <div
            title="Vidas disponíveis (5 máximas)"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-sm font-display font-extrabold ${
              progress.hearts <= 1
                ? 'bg-[#FF4B4B]/15 border-[#FF4B4B]/60 text-[#FF6E6E]'
                : 'bg-[#131C26] border-[#28384A] text-[#FF4B4B]'
            }`}
          >
            <Heart
              className={`h-4 w-4 ${
                progress.hearts > 0 ? 'fill-[#FF4B4B] text-[#FF4B4B]' : 'text-[#92A8BE]'
              }`}
            />
            <span>
              {progress.hearts}/{progress.maxHearts}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={progress.soundEnabled ? 'Silenciar efeitos' : 'Ativar efeitos'}
            title={progress.soundEnabled ? 'Som ativado' : 'Som silenciado'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#131C26] border border-[#28384A] text-[#92A8BE] hover:text-white hover:bg-[#1D2A38] transition-colors"
          >
            {progress.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[#00B8FF]" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Abrir configurações"
            title="Configurações e Chave API Groq"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#131C26] border border-[#28384A] text-[#92A8BE] hover:text-white hover:bg-[#1D2A38] transition-colors"
          >
            <Settings className="h-4 w-4" />
            {hasGroqKey && (
              <span
                className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1117] bg-[#58CC02]"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
