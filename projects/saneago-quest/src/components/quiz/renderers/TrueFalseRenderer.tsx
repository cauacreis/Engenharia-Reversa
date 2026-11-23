import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { TrueFalseQuestion } from '../../../types/quiz';

interface TrueFalseRendererProps {
  question: TrueFalseQuestion;
  selectedAnswer: boolean | null;
  onSelect: (value: boolean) => void;
  locked: boolean;
  showOutcome: boolean;
}

export function TrueFalseRenderer({
  question,
  selectedAnswer,
  onSelect,
  locked,
  showOutcome,
}: TrueFalseRendererProps) {
  useEffect(() => {
    if (locked) return;
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === '1' || k === 'v') {
        onSelect(true);
      } else if (k === '2' || k === 'f') {
        onSelect(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [locked, onSelect]);

  const choices: Array<{ value: boolean; label: string; shortcut: string; Icon: typeof CheckCircle2 }> =
    [
      { value: true, label: 'Verdadeiro', shortcut: 'V', Icon: CheckCircle2 },
      { value: false, label: 'Falso', shortcut: 'F', Icon: XCircle },
    ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 sm:p-6">
        <p className="text-base sm:text-lg font-semibold leading-relaxed text-[#E8F1F8]">
          {question.statement}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {choices.map(({ value, label, shortcut, Icon }) => {
          const isSelected = selectedAnswer === value;
          const isRightChoice = question.correctAnswer === value;

          let cardClass =
            'bg-[#131C26] border-[#28384A] text-[#E8F1F8] hover:border-[#3D556E] hover:bg-[#182430]';
          if (showOutcome) {
            if (isRightChoice) {
              cardClass = 'bg-[#58CC02]/15 border-[#58CC02] text-[#86F23B]';
            } else if (isSelected && !isRightChoice) {
              cardClass = 'bg-[#FF4B4B]/15 border-[#FF4B4B] text-[#FF8080]';
            } else {
              cardClass = 'bg-[#131C26]/60 border-[#1F2D3C] text-[#6A8098]';
            }
          } else if (isSelected) {
            cardClass = 'bg-[#00B8FF]/15 border-[#00B8FF] text-[#61D5FF]';
          }

          return (
            <button
              key={label}
              type="button"
              disabled={locked}
              onClick={() => onSelect(value)}
              className={`flex items-center justify-between rounded-2xl border-2 border-b-[5px] px-5 py-4 transition-all duration-100 ${cardClass} ${
                locked
                  ? 'cursor-default'
                  : 'cursor-pointer active:translate-y-[3px] active:border-b-2'
              }`}
            >
              <span className="flex items-center gap-3 font-display text-base sm:text-lg font-extrabold">
                <Icon className="h-6 w-6" />
                <span>{label}</span>
              </span>
              {!locked && (
                <span className="rounded-lg bg-[#1D2A38] border border-[#28384A] px-2 py-0.5 font-mono text-xs text-[#92A8BE]">
                  {shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
