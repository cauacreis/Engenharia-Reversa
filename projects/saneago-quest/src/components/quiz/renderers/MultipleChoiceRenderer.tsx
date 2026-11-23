import { useEffect } from 'react';
import { MultipleChoiceQuestion } from '../../../types/quiz';

interface MultipleChoiceRendererProps {
  question: MultipleChoiceQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  locked: boolean;
  showOutcome: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function MultipleChoiceRenderer({
  question,
  selectedIndex,
  onSelect,
  locked,
  showOutcome,
}: MultipleChoiceRendererProps) {
  useEffect(() => {
    if (locked) return;
    const handleKey = (e: KeyboardEvent) => {
      const idx = Number(e.key) - 1;
      if (!Number.isNaN(idx) && idx >= 0 && idx < question.options.length) {
        onSelect(idx);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [locked, onSelect, question.options.length]);

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Alternativas da questão">
      {question.options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrectOption = index === question.correctIndex;

        let containerClasses =
          'bg-[#131C26] border-[#28384A] text-[#E8F1F8] hover:border-[#3D556E] hover:bg-[#182430]';
        let badgeClasses = 'bg-[#1D2A38] border-[#28384A] text-[#92A8BE]';

        if (showOutcome) {
          if (isCorrectOption) {
            containerClasses = 'bg-[#58CC02]/15 border-[#58CC02] text-[#E8F1F8]';
            badgeClasses = 'bg-[#58CC02] border-[#46A302] text-[#071F00]';
          } else if (isSelected && !isCorrectOption) {
            containerClasses = 'bg-[#FF4B4B]/15 border-[#FF4B4B] text-[#FFD2D2]';
            badgeClasses = 'bg-[#FF4B4B] border-[#CC2E2E] text-white';
          } else {
            containerClasses = 'bg-[#131C26]/60 border-[#1F2D3C] text-[#6A8098]';
          }
        } else if (isSelected) {
          containerClasses = 'bg-[#00B8FF]/15 border-[#00B8FF] text-[#E8F1F8]';
          badgeClasses = 'bg-[#00B8FF] border-[#0088C2] text-[#041824]';
        }

        return (
          <button
            key={`${question.id}-opt-${index}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={locked}
            onClick={() => onSelect(index)}
            className={`w-full flex items-center gap-3.5 rounded-2xl border-2 border-b-[4px] px-4 py-3.5 text-left transition-all duration-100 ${containerClasses} ${
              locked
                ? 'cursor-default'
                : 'cursor-pointer active:translate-y-[2px] active:border-b-2'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-display font-extrabold ${badgeClasses}`}
            >
              {LETTERS[index] ?? index + 1}
            </span>
            <span className="flex-1 text-sm sm:text-base font-semibold leading-snug">
              {option}
            </span>
            {!locked && (
              <span className="hidden sm:inline-flex text-[11px] font-mono text-[#5D748B]">
                {index + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
