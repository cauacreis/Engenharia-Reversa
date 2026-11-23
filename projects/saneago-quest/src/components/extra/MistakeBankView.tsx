import { useMemo, useState } from 'react';
import { CheckCircle2, Heart, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import { getQuestionById, getUnitMeta, UNITS } from '../../data/questions';
import { useGameProgress } from '../../hooks/useGameProgress';
import { UnitId } from '../../types/quiz';
import { TactileButton } from '../ui/TactileButton';

interface MistakeBankViewProps {
  onStartMistakeReview: (filterUnitId?: UnitId) => void;
}

export function MistakeBankView({ onStartMistakeReview }: MistakeBankViewProps) {
  const { progress, mistakeIds } = useGameProgress();
  const [filterUnit, setFilterUnit] = useState<UnitId | 'all'>('all');

  const mistakeItems = useMemo(() => {
    return mistakeIds
      .map((id) => {
        const question = getQuestionById(id);
        const record = progress.mistakes[id];
        if (!question || !record) return null;
        return { question, record };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => filterUnit === 'all' || item.question.unitId === filterUnit);
  }, [filterUnit, mistakeIds, progress.mistakes]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-xl bg-[#FF4B4B]/15 border border-[#FF4B4B]/40 px-2.5 py-1 text-xs font-display font-extrabold text-[#FF8585]">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>{progress.hearts}/{progress.maxHearts} corações disponíveis</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-[#E8F1F8]">
            Banco de Erros & Recuperação
          </h1>
          <p className="text-sm text-[#92A8BE]">
            Cada questão revisada corretamente sai da lista de pendências e recupera +1 coração.
          </p>
        </div>

        <TactileButton
          variant={mistakeIds.length > 0 ? 'danger' : 'success'}
          size="md"
          onClick={() =>
            onStartMistakeReview(filterUnit === 'all' ? undefined : filterUnit)
          }
          disabled={mistakeIds.length === 0 && progress.hearts >= progress.maxHearts}
        >
          <RotateCcw className="h-4 w-4" />
          <span>
            {mistakeIds.length > 0
              ? `Revisar ${mistakeItems.length} ${mistakeItems.length === 1 ? 'Erro' : 'Erros'}`
              : progress.hearts < progress.maxHearts
              ? 'Prática para Recuperar Vidas'
              : 'Tudo em Dia (5/5 Vidas)'}
          </span>
        </TactileButton>
      </div>

      {/* Filtros por Unidade */}
      {mistakeIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterUnit('all')}
            className={`rounded-xl border-2 px-3 py-1.5 text-xs font-display font-bold transition-colors ${
              filterUnit === 'all'
                ? 'border-[#00B8FF] bg-[#00B8FF]/15 text-[#61D5FF]'
                : 'border-[#28384A] bg-[#131C26] text-[#92A8BE] hover:text-white'
            }`}
          >
            Todas ({mistakeIds.length})
          </button>

          {UNITS.map((u) => {
            const count = mistakeIds.filter(
              (id) => getQuestionById(id)?.unitId === u.id
            ).length;
            if (count === 0) return null;
            const active = filterUnit === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setFilterUnit(u.id)}
                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-display font-bold transition-colors ${
                  active
                    ? 'text-white'
                    : 'border-[#28384A] bg-[#131C26] text-[#92A8BE] hover:text-white'
                }`}
                style={
                  active
                    ? { borderColor: u.accentColor, backgroundColor: u.softBg, color: u.accentColor }
                    : undefined
                }
              >
                {u.shortTitle} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Lista de Erros ou Estado Limpo */}
      {mistakeItems.length === 0 ? (
        <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-8 text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#58CC02]/15 border-2 border-[#58CC02]/40 text-[#58CC02]">
            {progress.hearts < progress.maxHearts ? (
              <Sparkles className="h-8 w-8" />
            ) : (
              <CheckCircle2 className="h-8 w-8" />
            )}
          </div>
          <h2 className="font-display text-xl font-extrabold text-[#E8F1F8]">
            Nenhum erro pendente aqui!
          </h2>
          <p className="mx-auto max-w-md text-sm text-[#92A8BE]">
            {progress.hearts < progress.maxHearts
              ? 'Você não possui erros pendentes, mas pode iniciar uma prática rápida para encher seus corações.'
              : 'Sempre que você errar alguma questão nas lições ou nos simulados, ela aparecerá aqui com o respectivo macete.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakeItems.map(({ question, record }) => {
            const unit = getUnitMeta(question.unitId);
            return (
              <div
                key={question.id}
                className="rounded-2xl border-2 border-[#28384A] bg-[#131C26] p-4 sm:p-5 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-lg px-2 py-0.5 text-[11px] font-display font-extrabold"
                      style={{ backgroundColor: unit.softBg, color: unit.accentColor }}
                    >
                      {unit.shortTitle}
                    </span>
                    <span className="text-xs font-bold text-[#92A8BE]">{question.topic}</span>
                  </div>
                  <span className="rounded-lg bg-[#FF4B4B]/15 border border-[#FF4B4B]/40 px-2 py-0.5 font-mono text-[11px] font-bold text-[#FF8585]">
                    {record.wrongCount}x {record.wrongCount === 1 ? 'erro' : 'erros'}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold text-[#E8F1F8]">
                  {question.prompt}
                </p>

                <div className="flex items-start gap-2 rounded-xl bg-[#0B1117]/75 px-3 py-2 text-xs text-[#92A8BE]">
                  <Lightbulb className="h-4 w-4 text-[#FFC800] shrink-0 mt-0.5" />
                  <span>{question.tip}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
