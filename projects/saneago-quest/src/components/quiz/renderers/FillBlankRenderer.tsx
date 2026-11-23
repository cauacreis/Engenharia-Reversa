import { FillBlankQuestion } from '../../../types/quiz';

interface FillBlankRendererProps {
  question: FillBlankQuestion;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  locked: boolean;
  showOutcome: boolean;
}

export function FillBlankRenderer({
  question,
  selectedAnswer,
  onSelect,
  locked,
  showOutcome,
}: FillBlankRendererProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;

  let slotClasses = 'border-[#00B8FF]/70 bg-[#00B8FF]/10 text-[#00B8FF]';
  if (!selectedAnswer) {
    slotClasses = 'border-dashed border-[#415870] bg-[#0B1117]/70 text-[#6B8299]';
  } else if (showOutcome) {
    slotClasses = isCorrect
      ? 'border-[#58CC02] bg-[#58CC02]/20 text-[#86F23B]'
      : 'border-[#FF4B4B] bg-[#FF4B4B]/20 text-[#FF8080]';
  }

  const selectedParts = selectedAnswer ? selectedAnswer.split(' / ') : [];
  const afterSegments = question.sentenceAfter.split('___');
  const firstSlotValue =
    afterSegments.length > 1
      ? (selectedParts[0] ?? '________')
      : (selectedAnswer ?? '________');

  return (
    <div className="space-y-6">
      {/* Caixa da frase com lacuna(s) destacada(s) */}
      <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 sm:p-6 text-base sm:text-lg font-semibold leading-relaxed text-[#E8F1F8]">
        {question.sentenceBefore && <span>{question.sentenceBefore} </span>}
        <span
          className={`inline-flex min-w-[100px] items-center justify-center rounded-xl border-2 px-3 py-1 mx-1 font-display font-extrabold transition-colors ${slotClasses}`}
        >
          {firstSlotValue}
        </span>
        {afterSegments.map((segment, idx) => (
          <span key={`seg-${idx}`}>
            {idx === 0 && segment ? ` ${segment}` : segment}
            {idx < afterSegments.length - 1 && (
              <span
                className={`inline-flex min-w-[100px] items-center justify-center rounded-xl border-2 px-3 py-1 mx-1 font-display font-extrabold transition-colors ${slotClasses}`}
              >
                {selectedParts[idx + 1] ?? '________'}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Banco de fichas táteis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isOptionCorrect = option === question.correctAnswer;

          let chipStyle =
            'bg-[#131C26] border-[#28384A] text-[#E8F1F8] hover:border-[#3D556E] hover:bg-[#182430]';
          if (showOutcome) {
            if (isOptionCorrect) {
              chipStyle = 'bg-[#58CC02]/15 border-[#58CC02] text-[#86F23B]';
            } else if (isSelected && !isOptionCorrect) {
              chipStyle = 'bg-[#FF4B4B]/15 border-[#FF4B4B] text-[#FF8080]';
            } else {
              chipStyle = 'bg-[#131C26]/60 border-[#1F2D3C] text-[#6A8098]';
            }
          } else if (isSelected) {
            chipStyle = 'bg-[#00B8FF]/15 border-[#00B8FF] text-[#61D5FF]';
          }

          return (
            <button
              key={option}
              type="button"
              disabled={locked}
              onClick={() => onSelect(option)}
              className={`rounded-2xl border-2 border-b-[4px] px-4 py-3.5 text-center font-display text-sm sm:text-base font-bold transition-all duration-100 ${chipStyle} ${
                locked
                  ? 'cursor-default'
                  : 'cursor-pointer active:translate-y-[2px] active:border-b-2'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
