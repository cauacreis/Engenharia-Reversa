import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Heart,
  KeyRound,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { calculateWeightedProjection } from '../../data/editalContext';
import { getQuestionById, getUnitMeta, UNITS } from '../../data/questions';
import { useGameProgress } from '../../hooks/useGameProgress';
import {
  analyzeWeaknessesWithGroq,
  buildOfflineDiagnosisFallback,
  buildOfflineQuestionsFallback,
  findAIQuestionById,
  generateQuestionsWithGroq,
  getGroqApiKey,
  GroqServiceError,
  saveAIPack,
} from '../../services/groqTutorService';
import { GroqDiagnosisReport, Question, UnitId } from '../../types/quiz';
import { Mascot } from '../Mascot';
import { TactileButton } from '../ui/TactileButton';

interface ErrorAnalyticsViewProps {
  onStartMistakeReview: (filterUnitId?: UnitId) => void;
  onStartCustomTraining: (params: {
    title: string;
    questions: Question[];
    unitId?: UnitId;
  }) => void;
  onOpenSettings: () => void;
}

function CircularProjectionGauge({ value }: { value: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const strokeColor =
    clamped >= 80 ? '#58CC02' : clamped >= 65 ? '#FFC800' : clamped > 0 ? '#FF9600' : '#28384A';

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="#1D2A38"
          strokeWidth="10"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-extrabold text-[#E8F1F8]">
          {clamped}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#92A8BE]">
          / 100 pts
        </span>
      </div>
    </div>
  );
}

export function ErrorAnalyticsView({
  onStartMistakeReview,
  onStartCustomTraining,
  onOpenSettings,
}: ErrorAnalyticsViewProps) {
  const { progress, mistakeIds, saveDiagnosis } = useGameProgress();
  const [filterUnit, setFilterUnit] = useState<UnitId | 'all'>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');

  const [analyzing, setAnalyzing] = useState(false);
  const [generatingDrill, setGeneratingDrill] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [needsKeyHint, setNeedsKeyHint] = useState(false);

  const projection = useMemo(
    () => calculateWeightedProjection(progress.unitStats),
    [progress.unitStats]
  );

  const criticalTopics = useMemo(() => {
    return Object.values(progress.topicStats)
      .filter((t) => t.attempts > 0)
      .map((t) => ({
        ...t,
        accuracy: Math.round((t.correct / t.attempts) * 100),
      }))
      .filter((t) => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
  }, [progress.topicStats]);

  const mistakeItems = useMemo(() => {
    return mistakeIds
      .map((id) => {
        const record = progress.mistakes[id];
        if (!record) return null;
        const resolved = getQuestionById(id) ?? findAIQuestionById(id);
        return {
          record,
          unitId: resolved?.unitId ?? record.unitId ?? 'portugues',
          topic: resolved?.topic ?? record.topic ?? 'Revisão',
          prompt: resolved?.prompt ?? record.promptSnapshot ?? 'Questão registrada para revisão',
          tip: resolved?.tip ?? record.tipSnapshot ?? 'Revise a regra principal do tópico no guia.',
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [mistakeIds, progress.mistakes]);

  const availableTopics = useMemo(() => {
    const scoped =
      filterUnit === 'all'
        ? mistakeItems
        : mistakeItems.filter((item) => item.unitId === filterUnit);
    return Array.from(new Set(scoped.map((item) => item.topic))).sort();
  }, [filterUnit, mistakeItems]);

  const filteredMistakes = useMemo(() => {
    return mistakeItems.filter((item) => {
      if (filterUnit !== 'all' && item.unitId !== filterUnit) return false;
      if (filterTopic !== 'all' && item.topic !== filterTopic) return false;
      return true;
    });
  }, [filterTopic, filterUnit, mistakeItems]);

  const diagnosis: GroqDiagnosisReport | null = progress.lastDiagnosis;

  const handleRunGroqDiagnosis = async () => {
    setAnalyzing(true);
    setAiNotice(null);
    setNeedsKeyHint(false);

    const payload = {
      mistakes: progress.mistakes,
      unitStats: progress.unitStats,
      topicStats: progress.topicStats,
    };

    try {
      const report = await analyzeWeaknessesWithGroq(payload);
      saveDiagnosis(report);
    } catch (err) {
      const offline = buildOfflineDiagnosisFallback(payload);
      saveDiagnosis(offline);
      if (err instanceof GroqServiceError && err.code === 'MISSING_KEY') {
        setNeedsKeyHint(true);
        setAiNotice(
          'Chave API Groq não configurada: geramos uma análise local com seus dados abaixo. Configure sua chave para análises personalizadas via Llama 3.3.'
        );
      } else {
        setAiNotice(
          'Não foi possível conectar à Groq agora (offline ou limite atingido). Exibindo análise local equivalente.'
        );
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCorrectiveDrill = async () => {
    const activeReport =
      diagnosis ??
      buildOfflineDiagnosisFallback({
        mistakes: progress.mistakes,
        unitStats: progress.unitStats,
        topicStats: progress.topicStats,
      });

    setGeneratingDrill(true);
    setAiNotice(null);
    setNeedsKeyHint(false);

    try {
      if (getGroqApiKey()) {
        const result = await generateQuestionsWithGroq({
          scope: 'corretivo',
          count: 5,
          focusTopics: activeReport.priorityTopics,
          focusUnitId: activeReport.focusUnitId,
        });
        const title = `Treino Corretivo IA • ${getUnitMeta(activeReport.focusUnitId).shortTitle}`;
        saveAIPack({
          id: `pack-corretivo-${Date.now()}`,
          title,
          scope: 'corretivo',
          mode: 'lesson',
          createdAt: new Date().toISOString(),
          modelUsed: result.modelUsed,
          questions: result.questions,
        });
        onStartCustomTraining({
          title,
          questions: result.questions,
          unitId: activeReport.focusUnitId,
        });
        return;
      }
      throw new GroqServiceError('Chave não configurada', 'MISSING_KEY');
    } catch (err) {
      const fallbackQuestions = buildOfflineQuestionsFallback({
        scope: 'corretivo',
        count: 5,
        focusTopics: activeReport.priorityTopics,
        focusUnitId: activeReport.focusUnitId,
      });
      if (err instanceof GroqServiceError && err.code === 'MISSING_KEY') {
        setNeedsKeyHint(true);
      }
      onStartCustomTraining({
        title: `Treino Corretivo • ${getUnitMeta(activeReport.focusUnitId).shortTitle}`,
        questions: fallbackQuestions,
        unitId: activeReport.focusUnitId,
      });
    } finally {
      setGeneratingDrill(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Cabeçalho + Recuperação de Corações */}
      <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-xl bg-[#00B8FF]/15 border border-[#00B8FF]/40 px-2.5 py-1 text-xs font-display font-extrabold text-[#61D5FF]">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Central Diagnóstica — Edital nº 001/2026</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-[#E8F1F8]">
            Relatório de Erros & Desempenho
          </h1>
          <p className="text-sm text-[#92A8BE]">
            Acompanhe sua precisão pelos pesos de desempate da banca Patativa e gere treinos corretivos cirúrgicos.
          </p>
        </div>

        <TactileButton
          variant={mistakeIds.length > 0 ? 'danger' : 'success'}
          size="md"
          onClick={() =>
            onStartMistakeReview(filterUnit === 'all' ? undefined : filterUnit)
          }
          disabled={mistakeIds.length === 0 && progress.hearts >= progress.maxHearts}
          className="shrink-0"
        >
          <RotateCcw className="h-4 w-4" />
          <span>
            {mistakeIds.length > 0
              ? `Revisar ${mistakeIds.length} ${mistakeIds.length === 1 ? 'Erro' : 'Erros'}`
              : progress.hearts < progress.maxHearts
              ? 'Recuperar Vidas'
              : `Vidas Cheias (${progress.hearts}/${progress.maxHearts})`}
          </span>
        </TactileButton>
      </div>

      {/* Bloco 1: Métricas Visuais (Projeção Ponderada + Gráfico por Unidade + Tópicos Críticos) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Card Projeção Ponderada */}
        <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FFC800]" />
              <h2 className="font-display text-lg font-extrabold text-[#E8F1F8]">
                Projeção Ponderada
              </h2>
            </div>
            <span className="rounded-lg bg-[#1D2A38] border border-[#28384A] px-2 py-0.5 text-[11px] font-bold text-[#92A8BE]">
              Desempate: 1º PT • 2º Lóg
            </span>
          </div>

          <div className="flex items-center gap-4">
            <CircularProjectionGauge value={projection.projectedScore} />
            <div className="space-y-1.5 min-w-0">
              <p className="font-display text-base font-extrabold text-[#FFC800]">
                {projection.statusLabel}
              </p>
              <p className="text-xs text-[#92A8BE]">
                {projection.totalAttempts > 0
                  ? `${projection.totalAttempts} questões respondidas • ${projection.overallAccuracy}% geral`
                  : 'Responda questões para calcular sua projeção ponderada.'}
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1117]/80 border border-[#28384A] px-2.5 py-1 text-xs font-mono text-[#61D5FF]">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {projection.avgSecondsPerQuestion > 0
                    ? `${projection.avgSecondsPerQuestion}s / questão`
                    : '-- s / questão'}
                </span>
              </div>
            </div>
          </div>

          {/* Tópicos Críticos (< 70%) */}
          <div className="rounded-2xl bg-[#0B1117]/75 border border-[#28384A] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 text-[#FF9600]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Tópicos Críticos (&lt; 70%)
              </span>
              <span className="text-[#92A8BE]">{criticalTopics.length}</span>
            </div>

            {criticalTopics.length === 0 ? (
              <p className="text-xs text-[#92A8BE]">
                {projection.totalAttempts === 0
                  ? 'Nenhum tópico crítico identificado ainda.'
                  : 'Nenhum tópico abaixo de 70%! Excelente consistência.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {criticalTopics.slice(0, 5).map((t) => (
                  <span
                    key={`${t.unitId}-${t.topic}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#FF4B4B]/15 border border-[#FF4B4B]/40 px-2 py-0.5 text-[11px] font-bold text-[#FF9E9E]"
                  >
                    <span>{t.topic}</span>
                    <span className="font-mono text-white">{t.accuracy}%</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gráfico SVG/Tailwind por Unidade */}
        <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-extrabold text-[#E8F1F8]">
              Taxa de Acerto por Disciplina
            </h2>
            <span className="text-xs text-[#92A8BE]">Meta de segurança: 70%</span>
          </div>

          <div className="space-y-3.5">
            {projection.breakdown.map((row) => {
              const unit = getUnitMeta(row.unitId);
              const weightPct = Math.round(row.weight * 100);
              return (
                <div key={row.unitId} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: unit.accentColor }}
                      />
                      <span className="font-display font-bold text-[#E8F1F8]">
                        {unit.title}
                      </span>
                      <span className="rounded-md bg-[#1D2A38] px-1.5 py-0.5 font-mono text-[10px] text-[#92A8BE]">
                        peso {weightPct}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[#92A8BE]">
                        {row.attempts > 0 ? `${row.avgSecondsPerQuestion}s/q` : '--'}
                      </span>
                      <span
                        className="font-bold"
                        style={{ color: row.attempts > 0 ? unit.accentColor : '#6A8098' }}
                      >
                        {row.attempts > 0 ? `${row.accuracy}% (${row.attempts}q)` : 'Sem dados'}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-3.5 w-full rounded-full bg-[#0B1117] border border-[#28384A] overflow-hidden">
                    {/* Linha vertical da meta 70% */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                      style={{ left: '70%' }}
                      title="Meta 70%"
                    />
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${row.attempts > 0 ? row.accuracy : 0}%`,
                        backgroundColor: unit.accentColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bloco 2: Tutor Diagnóstico com IA (Groq) */}
      <section className="rounded-3xl border-2 border-[#00B8FF]/45 bg-[#131C26] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Mascot
            mood={analyzing || generatingDrill ? 'thinking' : diagnosis ? 'happy' : 'idle'}
            size="sm"
            accentColor="#00B8FF"
            speechTitle="Pingo • Tutor Edital 001/2026"
            speech={
              analyzing
                ? 'Analisando seu histórico de erros e os pesos da banca Patativa...'
                : diagnosis
                ? 'Plano cirúrgico pronto! Foque nos blocos abaixo para virar o jogo.'
                : 'Posso cruzar seus erros com os pesos do edital e montar um treino sob medida.'
            }
          />

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <TactileButton
              variant="primary"
              size="md"
              disabled={analyzing}
              onClick={() => void handleRunGroqDiagnosis()}
            >
              <BrainCircuit className="h-4 w-4" />
              <span>
                {analyzing
                  ? 'Analisando...'
                  : 'Analisar Meus Pontos Fracos com IA (Groq)'}
              </span>
            </TactileButton>
          </div>
        </div>

        {aiNotice && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#FFC800]/45 bg-[#FFC800]/10 px-4 py-3 text-xs text-[#FFE58F]">
            <span>{aiNotice}</span>
            {needsKeyHint && (
              <TactileButton
                size="sm"
                variant="outline"
                onClick={onOpenSettings}
                className="shrink-0"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Configurar Chave Groq</span>
              </TactileButton>
            )}
          </div>
        )}

        {diagnosis && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Bloco 1: Padrão de erro detectado */}
            <div className="rounded-2xl border-2 border-[#FF4B4B]/40 bg-[#0B1117]/75 p-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold uppercase tracking-wider text-[#FF8585]">
                <AlertTriangle className="h-3.5 w-3.5" />
                1. Padrão Detectado
              </span>
              <p className="text-sm font-semibold text-[#E8F1F8] leading-relaxed">
                {diagnosis.detectedPattern}
              </p>
              {diagnosis.priorityTopics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {diagnosis.priorityTopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-lg bg-[#1D2A38] px-2 py-0.5 text-[11px] font-bold text-[#92A8BE]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bloco 2: Regra-chave resumida */}
            <div className="rounded-2xl border-2 border-[#FFC800]/40 bg-[#0B1117]/75 p-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold uppercase tracking-wider text-[#FFC800]">
                <Lightbulb className="h-3.5 w-3.5" />
                2. Regra-Chave Resumida
              </span>
              <p className="text-sm text-[#E8F1F8]/95 leading-relaxed">
                {diagnosis.keyRuleSummary}
              </p>
              {diagnosis.actionPlanSteps.length > 0 && (
                <ul className="space-y-1 pt-1 text-xs text-[#92A8BE]">
                  {diagnosis.actionPlanSteps.slice(0, 2).map((step, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Zap className="h-3 w-3 text-[#FFC800] shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bloco 3: Treino Corretivo (5 questões) */}
            <div className="rounded-2xl border-2 border-[#58CC02]/45 bg-[#0B1117]/75 p-4 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold uppercase tracking-wider text-[#86F23B]">
                  <Sparkles className="h-3.5 w-3.5" />
                  3. Ação Imediata
                </span>
                <p className="text-sm font-semibold text-[#E8F1F8]">
                  Foco recomendado:{' '}
                  <span className="text-[#86F23B]">
                    {getUnitMeta(diagnosis.focusUnitId).title}
                  </span>
                </p>
                <p className="text-xs text-[#92A8BE]">
                  Gera na hora 5 questões exclusivas nos tópicos críticos detectados acima.
                </p>
              </div>

              <TactileButton
                variant="success"
                size="md"
                fullWidth
                disabled={generatingDrill}
                onClick={() => void handleGenerateCorrectiveDrill()}
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {generatingDrill
                    ? 'Gerando Treino...'
                    : 'Gerar Treino Corretivo (5 questões)'}
                </span>
              </TactileButton>
            </div>
          </div>
        )}
      </section>

      {/* Bloco 3: Histórico Detalhado de Erros */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-[#E8F1F8]">
              Histórico Detalhado de Erros
            </h2>
            <p className="text-xs text-[#92A8BE]">
              Filtre por disciplina ou tópico e compare sua resposta com o gabarito comentado.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#131C26] border border-[#28384A] px-3 py-1.5 text-xs font-bold text-[#FF8585]">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>
              {progress.hearts}/{progress.maxHearts} vidas
            </span>
          </div>
        </div>

        {/* Filtros por Unidade e Tópico */}
        {mistakeItems.length > 0 && (
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterUnit('all');
                  setFilterTopic('all');
                }}
                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-display font-bold transition-colors ${
                  filterUnit === 'all'
                    ? 'border-[#00B8FF] bg-[#00B8FF]/15 text-[#61D5FF]'
                    : 'border-[#28384A] bg-[#131C26] text-[#92A8BE] hover:text-white'
                }`}
              >
                Todas ({mistakeItems.length})
              </button>

              {UNITS.map((u) => {
                const count = mistakeItems.filter((item) => item.unitId === u.id).length;
                if (count === 0) return null;
                const active = filterUnit === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setFilterUnit(u.id);
                      setFilterTopic('all');
                    }}
                    className={`rounded-xl border-2 px-3 py-1.5 text-xs font-display font-bold transition-colors ${
                      active
                        ? 'text-white'
                        : 'border-[#28384A] bg-[#131C26] text-[#92A8BE] hover:text-white'
                    }`}
                    style={
                      active
                        ? {
                            borderColor: u.accentColor,
                            backgroundColor: u.softBg,
                            color: u.accentColor,
                          }
                        : undefined
                    }
                  >
                    {u.shortTitle} ({count})
                  </button>
                );
              })}
            </div>

            {availableTopics.length > 1 && (
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                aria-label="Filtrar por tópico"
                className="rounded-xl border-2 border-[#28384A] bg-[#131C26] px-3 py-1.5 text-xs font-bold text-[#E8F1F8] focus:border-[#00B8FF] focus:outline-none"
              >
                <option value="all">Todos os tópicos</option>
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {filteredMistakes.length === 0 ? (
          <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#58CC02]/15 border-2 border-[#58CC02]/40 text-[#58CC02]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-display text-lg font-extrabold text-[#E8F1F8]">
              Nenhum erro pendente neste filtro!
            </h3>
            <p className="mx-auto max-w-md text-xs sm:text-sm text-[#92A8BE]">
              Quando você errar uma questão nas lições ou simulados, ela ficará registrada aqui com sua resposta marcada, o gabarito e o macete.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMistakes.map((item) => {
              const unit = getUnitMeta(item.unitId);
              return (
                <div
                  key={item.record.questionId}
                  className="rounded-2xl border-2 border-[#28384A] bg-[#131C26] p-4 sm:p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-lg px-2 py-0.5 text-[11px] font-display font-extrabold"
                        style={{ backgroundColor: unit.softBg, color: unit.accentColor }}
                      >
                        {unit.shortTitle}
                      </span>
                      <span className="text-xs font-bold text-[#92A8BE]">{item.topic}</span>
                    </div>
                    <span className="rounded-lg bg-[#FF4B4B]/15 border border-[#FF4B4B]/40 px-2 py-0.5 font-mono text-[11px] font-bold text-[#FF8585]">
                      {item.record.wrongCount}x {item.record.wrongCount === 1 ? 'erro' : 'erros'}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-[#E8F1F8]">
                    {item.prompt}
                  </p>

                  {(item.record.lastUserAnswer || item.record.correctAnswer) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {item.record.lastUserAnswer && (
                        <div className="rounded-xl border border-[#FF4B4B]/35 bg-[#FF4B4B]/10 px-3 py-2">
                          <span className="font-bold text-[#FF8585]">Você marcou: </span>
                          <span className="text-[#FFD2D2]">{item.record.lastUserAnswer}</span>
                        </div>
                      )}
                      {item.record.correctAnswer && (
                        <div className="rounded-xl border border-[#58CC02]/35 bg-[#58CC02]/10 px-3 py-2">
                          <span className="font-bold text-[#86F23B]">Correta: </span>
                          <span className="text-[#E8F1F8]">{item.record.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-start gap-2 rounded-xl bg-[#0B1117]/75 px-3 py-2 text-xs text-[#92A8BE]">
                    <Lightbulb className="h-4 w-4 text-[#FFC800] shrink-0 mt-0.5" />
                    <span>{item.tip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
