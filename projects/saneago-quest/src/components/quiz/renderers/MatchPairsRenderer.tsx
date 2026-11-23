import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Link2, Unlink } from 'lucide-react';
import { MatchPairItem, MatchPairsQuestion } from '../../../types/quiz';

interface MatchPairsRendererProps {
  question: MatchPairsQuestion;
  mode: 'practice' | 'exam';
  locked: boolean;
  /** Em modo prática, dispara quando todas as associações forem acertadas */
  onPracticeComplete: (hadAnyMistake: boolean) => void;
  /** Em modo prática, dispara na primeira falha dentro da questão para dedução justa de 1 vida */
  onPracticeFirstMistake: () => void;
  /** Em modo simulado, envia o mapa leftId -> rightPairId selecionado */
  examAssignments: Record<string, string>;
  onChangeExamAssignments: (next: Record<string, string>) => void;
}

function deterministicShuffle(items: MatchPairItem[], seed: string): MatchPairItem[] {
  const arr = [...items];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const j = hash % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Garante que a ordem embaralhada não fique idêntica à original
  if (arr.length > 1 && arr.every((item, idx) => item.id === items[idx].id)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

const PAIR_BADGE_COLORS = [
  'bg-[#00B8FF] text-[#041824]',
  'bg-[#FF9600] text-[#1E1000]',
  'bg-[#58CC02] text-[#071F00]',
  'bg-[#14B8A6] text-[#041D1A]',
];

export function MatchPairsRenderer({
  question,
  mode,
  locked,
  onPracticeComplete,
  onPracticeFirstMistake,
  examAssignments,
  onChangeExamAssignments,
}: MatchPairsRendererProps) {
  const shuffledRight = useMemo(
    () => deterministicShuffle(question.pairs, question.id),
    [question.id, question.pairs]
  );

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorPair, setErrorPair] = useState<{ leftId: string; rightId: string } | null>(null);
  const hadMistakeRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    setSelectedLeftId(null);
    setMatchedIds([]);
    setErrorPair(null);
    hadMistakeRef.current = false;
    completedRef.current = false;
  }, [question.id]);

  const handleSelectLeft = (leftId: string) => {
    if (locked) return;
    if (mode === 'practice' && matchedIds.includes(leftId)) return;

    if (mode === 'exam' && examAssignments[leftId] && selectedLeftId === null) {
      // Clicar em item já conectado no simulado desfaz o vínculo para facilitar ajuste
      const next = { ...examAssignments };
      delete next[leftId];
      onChangeExamAssignments(next);
      return;
    }

    setSelectedLeftId((prev) => (prev === leftId ? null : leftId));
  };

  const handleSelectRight = (rightPairId: string) => {
    if (locked) return;
    if (mode === 'practice' && matchedIds.includes(rightPairId)) return;

    if (!selectedLeftId) {
      // No modo simulado, clicar num item direito já conectado desfaz o vínculo
      if (mode === 'exam') {
        const ownerLeft = Object.entries(examAssignments).find(
          ([, assignedRight]) => assignedRight === rightPairId
        )?.[0];
        if (ownerLeft) {
          const next = { ...examAssignments };
          delete next[ownerLeft];
          onChangeExamAssignments(next);
        }
      }
      return;
    }

    if (mode === 'exam') {
      const next = { ...examAssignments };
      // Remove vínculo anterior caso este item direito já estivesse ligado a outro esquerdo
      for (const [k, v] of Object.entries(next)) {
        if (v === rightPairId) {
          delete next[k];
        }
      }
      next[selectedLeftId] = rightPairId;
      onChangeExamAssignments(next);
      setSelectedLeftId(null);
      return;
    }

    // Modo prática: validação imediata
    if (selectedLeftId === rightPairId) {
      const updated = [...matchedIds, rightPairId];
      setMatchedIds(updated);
      setSelectedLeftId(null);

      if (updated.length === question.pairs.length && !completedRef.current) {
        completedRef.current = true;
        onPracticeComplete(hadMistakeRef.current);
      }
    } else {
      setErrorPair({ leftId: selectedLeftId, rightId: rightPairId });
      if (!hadMistakeRef.current) {
        hadMistakeRef.current = true;
        onPracticeFirstMistake();
      }
      setSelectedLeftId(null);
      window.setTimeout(() => {
        setErrorPair(null);
      }, 500);
    }
  };

  // Índices visuais para o modo simulado (1..N)
  const leftOrderIndex = useMemo(() => {
    const map: Record<string, number> = {};
    question.pairs.forEach((p, idx) => {
      map[p.id] = idx;
    });
    return map;
  }, [question.pairs]);

  const rightAssignedByLeft = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [leftId, rightId] of Object.entries(examAssignments)) {
      map[rightId] = leftId;
    }
    return map;
  }, [examAssignments]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#92A8BE]">
        <span className="inline-flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 text-[#00B8FF]" />
          {mode === 'practice'
            ? 'Toque em um item à esquerda e depois no seu par à direita.'
            : 'Conecte todos os 4 pares antes de confirmar (toque novamente para desfazer).'}
        </span>
        {mode === 'practice' && (
          <span className="font-mono font-bold text-[#58CC02]">
            {matchedIds.length}/{question.pairs.length} pares
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coluna Esquerda */}
        <div className="space-y-2.5">
          {question.leftLabel && (
            <p className="text-[11px] font-display font-extrabold uppercase tracking-wider text-[#92A8BE] px-1">
              {question.leftLabel}
            </p>
          )}
          {question.pairs.map((pair, idx) => {
            const isMatched = mode === 'practice' && matchedIds.includes(pair.id);
            const isSelected = selectedLeftId === pair.id;
            const isError = errorPair?.leftId === pair.id;
            const examAssignedRight = mode === 'exam' ? examAssignments[pair.id] : undefined;

            let style =
              'bg-[#131C26] border-[#28384A] text-[#E8F1F8] hover:border-[#3D556E] hover:bg-[#182430]';
            if (isError) {
              style = 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-[#FFD2D2] animate-pulse';
            } else if (isMatched) {
              style = 'bg-[#58CC02]/15 border-[#58CC02]/60 text-[#86F23B] opacity-75';
            } else if (isSelected) {
              style = 'bg-[#00B8FF]/20 border-[#00B8FF] text-white';
            } else if (examAssignedRight) {
              style = 'bg-[#1D2A38] border-[#00B8FF]/60 text-[#E8F1F8]';
            }

            return (
              <button
                key={`L-${pair.id}`}
                type="button"
                disabled={locked || isMatched}
                onClick={() => handleSelectLeft(pair.id)}
                className={`w-full flex items-center justify-between gap-2.5 rounded-2xl border-2 border-b-[4px] px-4 py-3 text-left text-sm font-semibold transition-all duration-100 ${style} ${
                  locked || isMatched
                    ? 'cursor-default'
                    : 'cursor-pointer active:translate-y-[2px] active:border-b-2'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-display font-extrabold ${
                      mode === 'exam' && examAssignedRight
                        ? PAIR_BADGE_COLORS[idx % PAIR_BADGE_COLORS.length]
                        : 'bg-[#1D2A38] text-[#92A8BE]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{pair.left}</span>
                </span>
                {isMatched && <Check className="h-4 w-4 text-[#58CC02] shrink-0" />}
                {mode === 'exam' && examAssignedRight && (
                  <Unlink className="h-3.5 w-3.5 text-[#92A8BE] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Coluna Direita */}
        <div className="space-y-2.5">
          {question.rightLabel && (
            <p className="text-[11px] font-display font-extrabold uppercase tracking-wider text-[#92A8BE] px-1">
              {question.rightLabel}
            </p>
          )}
          {shuffledRight.map((pair) => {
            const isMatched = mode === 'practice' && matchedIds.includes(pair.id);
            const isError = errorPair?.rightId === pair.id;
            const ownerLeftId = mode === 'exam' ? rightAssignedByLeft[pair.id] : undefined;
            const ownerIdx = ownerLeftId !== undefined ? leftOrderIndex[ownerLeftId] : undefined;

            let style =
              'bg-[#131C26] border-[#28384A] text-[#E8F1F8] hover:border-[#3D556E] hover:bg-[#182430]';
            if (isError) {
              style = 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-[#FFD2D2] animate-pulse';
            } else if (isMatched) {
              style = 'bg-[#58CC02]/15 border-[#58CC02]/60 text-[#86F23B] opacity-75';
            } else if (ownerIdx !== undefined) {
              style = 'bg-[#1D2A38] border-[#00B8FF]/60 text-[#E8F1F8]';
            } else if (selectedLeftId) {
              style =
                'bg-[#131C26] border-[#00B8FF]/45 text-[#E8F1F8] hover:border-[#00B8FF] hover:bg-[#00B8FF]/10';
            }

            return (
              <button
                key={`R-${pair.id}`}
                type="button"
                disabled={locked || isMatched}
                onClick={() => handleSelectRight(pair.id)}
                className={`w-full flex items-center justify-between gap-2.5 rounded-2xl border-2 border-b-[4px] px-4 py-3 text-left text-sm font-semibold transition-all duration-100 ${style} ${
                  locked || isMatched
                    ? 'cursor-default'
                    : 'cursor-pointer active:translate-y-[2px] active:border-b-2'
                }`}
              >
                <span className="leading-snug">{pair.right}</span>
                {isMatched && <Check className="h-4 w-4 text-[#58CC02] shrink-0" />}
                {mode === 'exam' && ownerIdx !== undefined && (
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-display font-extrabold ${
                      PAIR_BADGE_COLORS[ownerIdx % PAIR_BADGE_COLORS.length]
                    }`}
                  >
                    {ownerIdx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
