import { Clock, Lock, Play, ShieldAlert, Trophy } from 'lucide-react';
import { LESSONS, UNITS } from '../../data/questions';
import { useGameProgress } from '../../hooks/useGameProgress';
import { UnitId } from '../../types/quiz';
import { TactileButton } from '../ui/TactileButton';

interface SimuladoHubViewProps {
  onStartUnitSimulado: (unitId: UnitId) => void;
  onStartGeneralSimulado: () => void;
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function SimuladoHubView({
  onStartUnitSimulado,
  onStartGeneralSimulado,
}: SimuladoHubViewProps) {
  const {
    progress,
    isUnitSimuladoUnlocked,
    isGeneralSimuladoUnlocked,
    getUnitCompletedLessonCount,
  } = useGameProgress();

  const generalUnlocked = isGeneralSimuladoUnlocked();
  const completedLessonsTotal = Object.keys(progress.completedLessons).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cabeçalho */}
      <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 sm:p-6 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-xl bg-[#FFC800]/15 border border-[#FFC800]/40 px-2.5 py-1 text-xs font-display font-extrabold text-[#FFC800]">
          <Trophy className="h-3.5 w-3.5" />
          <span>Simulação Real — Banca Universidade Patativa do Assaré</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-[#E8F1F8]">
          Simulados Cronometrados
        </h1>
        <p className="text-sm text-[#92A8BE]">
          Sem dicas nem feedback imediato durante as questões. O gabarito comentado e os erros aparecem apenas ao finalizar ou encerrar o cronômetro.
        </p>
      </div>

      {/* Card do Simulado Geral */}
      <div className="rounded-3xl border-2 border-[#FFC800]/50 bg-gradient-to-br from-[#19232E] to-[#131C26] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFC800] px-2.5 py-0.5 text-[11px] font-display font-extrabold text-[#221700]">
              Prova Completa Ponderada
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Simulado Geral SANEAGO (20 Questões)
            </h2>
            <p className="text-sm text-[#92A8BE]">
              Distribuição estratégica: 7 de Português (maior peso), 5 de Matemática/Lógica, 4 de Informática e 4 de Saneago/Marco Legal em 25 minutos.
            </p>
          </div>

          <TactileButton
            variant={generalUnlocked ? 'gold' : 'outline'}
            size="lg"
            disabled={!generalUnlocked}
            onClick={onStartGeneralSimulado}
            className="shrink-0"
          >
            {generalUnlocked ? (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Iniciar (25 min)</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>
                  {completedLessonsTotal}/{LESSONS.length} lições
                </span>
              </>
            )}
          </TactileButton>
        </div>

        {!generalUnlocked && (
          <div className="flex items-center gap-2 rounded-2xl bg-[#0B1117]/70 px-3.5 py-2.5 text-xs text-[#92A8BE]">
            <ShieldAlert className="h-4 w-4 text-[#FFC800] shrink-0" />
            <span>
              Complete todas as 12 lições das 4 unidades para liberar o Simulado Geral.
            </span>
          </div>
        )}
      </div>

      {/* Simulados por Unidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {UNITS.map((unit) => {
          const unlocked = isUnitSimuladoUnlocked(unit.id);
          const doneLessons = getUnitCompletedLessonCount(unit.id);
          const bestAttempt = progress.simuladoHistory
            .filter((s) => s.scope === unit.id)
            .sort((a, b) => b.accuracy - a.accuracy)[0];

          return (
            <div
              key={unit.id}
              className="flex flex-col justify-between rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-lg px-2.5 py-0.5 text-xs font-display font-extrabold"
                    style={{ backgroundColor: unit.softBg, color: unit.accentColor }}
                  >
                    Unidade {unit.number}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-[#92A8BE]">
                    <Clock className="h-3.5 w-3.5" />
                    {unit.simuladoDurationMinutes} min • {unit.simuladoQuestionCount}q
                  </span>
                </div>

                <h3 className="font-display text-lg font-extrabold text-[#E8F1F8]">
                  {unit.title}
                </h3>

                <p className="text-xs text-[#92A8BE]">
                  {bestAttempt
                    ? `Melhor marca: ${bestAttempt.accuracy}% (${bestAttempt.score}/${bestAttempt.total})`
                    : unlocked
                    ? 'Liberado! Teste sua velocidade sem dicas.'
                    : `Progresso da unidade: ${doneLessons}/${unit.lessonCount} lições concluídas.`}
                </p>
              </div>

              <TactileButton
                variant={unlocked ? 'primary' : 'outline'}
                size="md"
                fullWidth
                disabled={!unlocked}
                customBg={unlocked ? unit.accentColor : undefined}
                customShade={unlocked ? unit.shadeColor : undefined}
                customText={unlocked ? '#071520' : undefined}
                onClick={() => onStartUnitSimulado(unit.id)}
              >
                {unlocked ? (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Fazer Simulado</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Conclua a Unidade {unit.number}</span>
                  </>
                )}
              </TactileButton>
            </div>
          );
        })}
      </div>

      {/* Histórico recente */}
      {progress.simuladoHistory.length > 0 && (
        <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 space-y-3">
          <h2 className="font-display text-lg font-extrabold text-[#E8F1F8]">
            Tentativas Recentes
          </h2>
          <div className="space-y-2">
            {progress.simuladoHistory.slice(0, 6).map((attempt) => {
              const label =
                attempt.scope === 'geral'
                  ? 'Simulado Geral Patativa'
                  : UNITS.find((u) => u.id === attempt.scope)?.title ?? attempt.scope;

              return (
                <div
                  key={attempt.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#0B1117]/70 border border-[#28384A] px-4 py-2.5 text-sm"
                >
                  <span className="font-bold text-[#E8F1F8]">{label}</span>
                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-[#92A8BE]">{formatSec(attempt.durationSeconds)}</span>
                    <span
                      className={`font-bold ${
                        attempt.accuracy >= 70 ? 'text-[#58CC02]' : 'text-[#FF9600]'
                      }`}
                    >
                      {attempt.score}/{attempt.total} ({attempt.accuracy}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
