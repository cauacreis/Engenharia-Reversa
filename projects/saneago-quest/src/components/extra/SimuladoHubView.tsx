import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { LESSONS, QUESTIONS, UNITS } from '../../data/questions';
import { useGameProgress } from '../../hooks/useGameProgress';
import { getGroqApiKey, loadSavedAIPacks } from '../../services/groqTutorService';
import {
  buildGeneralSimuladoSelection,
  buildUnitSimuladoSelection,
} from '../../services/simuladoEngine';
import { DifficultyMode, Question, UnitId } from '../../types/quiz';
import { DifficultySelector } from '../ui/DifficultySelector';
import { TactileButton } from '../ui/TactileButton';

interface SimuladoHubViewProps {
  keyRefreshTick?: number;
  onStartUnitSimulado: (unitId: UnitId) => void;
  onStartGeneralSimulado: (count: 20 | 30) => void;
  onOpenAIGenerator: (scope?: UnitId | 'geral', count?: number) => void;
  onGenerateSingleBatchAISimulado: (params: {
    scope: UnitId | 'geral';
    count: number;
    difficultyMode: DifficultyMode;
  }) => Promise<void>;
  onStartSavedAIPack: (params: {
    title: string;
    mode: 'lesson' | 'simulado';
    scope: UnitId | 'geral';
    durationMinutes?: number;
    questions: Question[];
  }) => void;
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function SimuladoHubView({
  keyRefreshTick = 0,
  onStartUnitSimulado,
  onStartGeneralSimulado,
  onOpenAIGenerator,
  onGenerateSingleBatchAISimulado,
  onStartSavedAIPack,
}: SimuladoHubViewProps) {
  const {
    progress,
    setPreferredDifficulty,
    resetSeenQuestionIds,
    isUnitSimuladoUnlocked,
    isGeneralSimuladoUnlocked,
    getUnitCompletedLessonCount,
  } = useGameProgress();

  const [generalCount, setGeneralCount] = useState<20 | 30>(20);
  const [generatingScope, setGeneratingScope] = useState<UnitId | 'geral' | null>(null);
  const [exhaustedError, setExhaustedError] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState(false);

  const generalUnlocked = isGeneralSimuladoUnlocked();
  const completedLessonsTotal = UNITS.reduce(
    (sum, u) => sum + getUnitCompletedLessonCount(u.id),
    0
  );
  const savedPacks = loadSavedAIPacks();
  const hasGroqKey = useMemo(() => {
    void keyRefreshTick;
    return Boolean(getGroqApiKey());
  }, [keyRefreshTick]);

  const generalSelection = useMemo(
    () =>
      buildGeneralSimuladoSelection(
        generalCount,
        progress.seenQuestionIds,
        progress.preferredDifficulty
      ),
    [generalCount, progress.preferredDifficulty, progress.seenQuestionIds]
  );

  const unitSelections = useMemo(() => {
    return UNITS.reduce(
      (acc, unit) => {
        acc[unit.id] = buildUnitSimuladoSelection(
          unit.id,
          progress.seenQuestionIds,
          progress.preferredDifficulty,
          unit.simuladoQuestionCount
        );
        return acc;
      },
      {} as Record<UnitId, ReturnType<typeof buildUnitSimuladoSelection>>
    );
  }, [progress.preferredDifficulty, progress.seenQuestionIds]);

  const exhaustedUnit = UNITS.find(
    (u) => isUnitSimuladoUnlocked(u.id) && unitSelections[u.id]?.isPoolExhausted
  );

  const handleExhaustedAI = async (scope: UnitId | 'geral', count: number) => {
    setGeneratingScope(scope);
    setExhaustedError(null);
    try {
      await onGenerateSingleBatchAISimulado({
        scope,
        count,
        difficultyMode: progress.preferredDifficulty,
      });
    } catch (err) {
      setExhaustedError(
        err instanceof Error
          ? err.message
          : 'Não foi possível gerar o simulado inédito via IA agora.'
      );
    } finally {
      setGeneratingScope(null);
    }
  };

  const handleResetSeen = () => {
    resetSeenQuestionIds();
    setResetFeedback(true);
    window.setTimeout(() => setResetFeedback(false), 3000);
  };

  const durationMinutes = generalCount === 30 ? 40 : 25;
  const distributionCopy =
    generalCount === 30
      ? '11 de Português (maior peso), 7 de Matemática/Lógica, 6 de Informática e 6 de Saneago/Marco Legal em 40 minutos.'
      : '7 de Português (maior peso), 5 de Matemática/Lógica, 4 de Informática e 4 de Saneago/Marco Legal em 25 minutos.';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cabeçalho */}
      <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-[#FFC800]/15 border border-[#FFC800]/40 px-2.5 py-1 text-xs font-display font-extrabold text-[#FFC800]">
            <Trophy className="h-3.5 w-3.5" />
            <span>Simulação Real — Banca Universidade Patativa do Assaré</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-[#E8F1F8]">
            Simulados Cronometrados
          </h1>
          <p className="text-sm text-[#92A8BE]">
            Motor anti-repetição ativo: priorizamos sempre questões ainda não respondidas por você, sem dicas durante a prova.
          </p>
        </div>

        <TactileButton
          variant="primary"
          size="md"
          onClick={() => onOpenAIGenerator('geral', generalCount)}
          className="shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>Gerar Simulado Inédito com IA</span>
        </TactileButton>
      </div>

      {/* Seletor de Dificuldade Manual na configuração de Simulados */}
      <DifficultySelector
        value={progress.preferredDifficulty}
        onChange={setPreferredDifficulty}
        compact
      />

      {/* Painel do Motor Anti-Repetição */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-[#28384A] bg-[#131C26] px-4 py-3.5">
        <div className="space-y-0.5">
          <p className="font-display text-sm font-extrabold text-[#E8F1F8]">
            Controle Anti-Repetição • Questões vistas: {progress.seenQuestionIds.length}/
            {QUESTIONS.length}
          </p>
          <p className="text-xs text-[#92A8BE]">
            Neste nível, o Simulado Geral possui{' '}
            <strong className="text-[#61D5FF]">
              {generalSelection.unseenEligibleCount}/{generalSelection.eligibleTotal}
            </strong>{' '}
            questões inéditas disponíveis antes de repetir qualquer questão.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {resetFeedback && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#86F23B]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Histórico limpo!
            </span>
          )}
          <TactileButton
            size="sm"
            variant="outline"
            disabled={progress.seenQuestionIds.length === 0}
            onClick={handleResetSeen}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Resetar histórico de vistas</span>
          </TactileButton>
        </div>
      </div>

      {/* Banner automático quando o banco estático daquele filtro foi esgotado */}
      {hasGroqKey && (generalSelection.isPoolExhausted || exhaustedUnit) && (
        <div className="rounded-3xl border-2 border-[#00B8FF]/60 bg-gradient-to-br from-[#0D2436] to-[#131C26] p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#00B8FF]/20 border border-[#00B8FF]/50 px-2.5 py-0.5 text-[11px] font-display font-extrabold text-[#61D5FF]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Banco Estático Esgotado neste Filtro</span>
              </div>
              <h2 className="font-display text-lg font-extrabold text-white">
                {generalSelection.isPoolExhausted
                  ? 'Você já respondeu 100% das questões elegíveis do Simulado Geral!'
                  : `Você já respondeu todas as questões inéditas de ${exhaustedUnit?.shortTitle} neste filtro!`}
              </h2>
              <p className="text-xs text-[#C7D7E6] leading-relaxed">
                Gere agora em lote único JSON um simulado 100% inédito no nível{' '}
                <strong>{progress.preferredDifficulty}</strong> com regras anti-óbvias via Groq.
              </p>
            </div>

            <TactileButton
              variant="primary"
              size="md"
              disabled={generatingScope !== null}
              onClick={() =>
                void handleExhaustedAI(
                  generalSelection.isPoolExhausted ? 'geral' : exhaustedUnit!.id,
                  generalSelection.isPoolExhausted
                    ? generalCount
                    : exhaustedUnit!.simuladoQuestionCount
                )
              }
              className="shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {generatingScope !== null
                  ? 'Gerando lote inédito...'
                  : 'Gerar Simulado 100% Inédito via IA'}
              </span>
            </TactileButton>
          </div>

          {exhaustedError && (
            <p className="rounded-xl bg-[#FF4B4B]/15 border border-[#FF4B4B]/40 px-3 py-2 text-xs text-[#FFD2D2]">
              {exhaustedError}
            </p>
          )}
        </div>
      )}

      {/* Card do Simulado Geral */}
      <div className="rounded-3xl border-2 border-[#FFC800]/50 bg-gradient-to-br from-[#19232E] to-[#131C26] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFC800] px-2.5 py-0.5 text-[11px] font-display font-extrabold text-[#221700]">
                Prova Completa Ponderada
              </span>
              <span className="rounded-lg border border-[#00B8FF]/40 bg-[#00B8FF]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#61D5FF]">
                {generalSelection.newQuestionsCount} inéditas na próxima rodada
                {generalSelection.repeatedQuestionsCount > 0
                  ? ` + ${generalSelection.repeatedQuestionsCount} revisadas`
                  : ''}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Simulado Geral SANEAGO ({generalCount} Questões)
            </h2>
            <p className="text-sm text-[#92A8BE]">
              Distribuição estratégica: {distributionCopy}
            </p>

            {/* Seletor 20q vs 30q */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-[#92A8BE]">Extensão:</span>
              {([20, 30] as const).map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setGeneralCount(qty)}
                  className={`rounded-xl border-2 px-3 py-1 font-display text-xs font-extrabold transition-colors ${
                    generalCount === qty
                      ? 'border-[#FFC800] bg-[#FFC800]/15 text-[#FFC800]'
                      : 'border-[#28384A] bg-[#0B1117]/75 text-[#92A8BE] hover:text-white'
                  }`}
                >
                  {qty} questões ({qty === 30 ? '40 min' : '25 min'})
                </button>
              ))}
            </div>
          </div>

          <TactileButton
            variant={generalUnlocked ? 'gold' : 'outline'}
            size="lg"
            disabled={!generalUnlocked}
            onClick={() => onStartGeneralSimulado(generalCount)}
            className="shrink-0"
          >
            {generalUnlocked ? (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Iniciar ({durationMinutes} min)</span>
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
              Complete todas as {LESSONS.length} lições das 4 unidades para liberar o Simulado Geral (ou gere um inédito com IA a qualquer momento).
            </span>
          </div>
        )}
      </div>

      {/* Simulados por Unidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {UNITS.map((unit) => {
          const unlocked = isUnitSimuladoUnlocked(unit.id);
          const doneLessons = getUnitCompletedLessonCount(unit.id);
          const sel = unitSelections[unit.id];
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

                <p className="font-mono text-[11px] font-bold text-[#61D5FF]">
                  {sel.unseenEligibleCount}/{sel.eligibleTotal} inéditas disponíveis neste filtro
                </p>
              </div>

              <div className="space-y-2">
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

                {unlocked && sel.isPoolExhausted && hasGroqKey && (
                  <TactileButton
                    size="sm"
                    variant="outline"
                    fullWidth
                    disabled={generatingScope !== null}
                    onClick={() =>
                      void handleExhaustedAI(unit.id, unit.simuladoQuestionCount)
                    }
                    className="border-[#00B8FF]/50 text-[#61D5FF]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      {generatingScope === unit.id
                        ? 'Gerando inéditas...'
                        : 'Gerar 100% Inédito via IA'}
                    </span>
                  </TactileButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pacotes Inéditos Salvos no Dispositivo */}
      {savedPacks.length > 0 && (
        <div className="rounded-3xl border-2 border-[#00B8FF]/35 bg-[#131C26] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-extrabold text-[#E8F1F8]">
              Simulados & Treinos IA Salvos
            </h2>
            <span className="text-xs text-[#92A8BE]">{savedPacks.length} pacote(s)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedPacks.slice(0, 6).map((pack) => (
              <div
                key={pack.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#0B1117]/75 border border-[#28384A] px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#E8F1F8] truncate">{pack.title}</p>
                  <p className="text-[11px] text-[#92A8BE]">
                    {pack.questions.length} questões • {pack.mode === 'simulado' ? 'Simulado' : 'Treino'}
                  </p>
                </div>
                <TactileButton
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    onStartSavedAIPack({
                      title: pack.title,
                      mode: pack.mode,
                      scope: pack.scope === 'corretivo' ? 'geral' : pack.scope,
                      durationMinutes:
                        pack.mode === 'simulado'
                          ? pack.questions.length >= 30
                            ? 40
                            : pack.questions.length >= 20
                            ? 25
                            : 10
                          : undefined,
                      questions: pack.questions,
                    })
                  }
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Abrir</span>
                </TactileButton>
              </div>
            ))}
          </div>
        </div>
      )}

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
