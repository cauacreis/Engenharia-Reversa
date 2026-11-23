import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { Mascot } from '../Mascot';
import { TactileButton } from '../ui/TactileButton';

interface FeedbackBannerProps {
  isCorrect: boolean;
  correctLabel?: string;
  tip: string;
  isLastQuestion: boolean;
  recoveredHeart?: boolean;
  combo?: number;
  onContinue: () => void;
}

export function FeedbackBanner({
  isCorrect,
  correctLabel,
  tip,
  isLastQuestion,
  recoveredHeart = false,
  combo = 0,
  onContinue,
}: FeedbackBannerProps) {
  const mascotMood = isCorrect ? (combo >= 3 ? 'combo' : 'happy') : 'sad';

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={`border-t-2 ${
        isCorrect
          ? 'border-[#58CC02] bg-[#0F2617]'
          : 'border-[#FF4B4B] bg-[#2D1218]'
      }`}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="mt-0.5 shrink-0">
            <Mascot mood={mascotMood} size="sm" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`font-display text-lg font-extrabold ${
                  isCorrect ? 'text-[#86F23B]' : 'text-[#FF8585]'
                }`}
              >
                {isCorrect
                  ? combo >= 3
                    ? `Combo ${combo}x! Pingo orgulhoso!`
                    : 'Mandou bem!'
                  : 'Atenção na pegadinha!'}
              </h3>

              {recoveredHeart && (
                <span className="rounded-lg bg-[#FF4B4B]/20 border border-[#FF4B4B]/50 px-2 py-0.5 text-xs font-bold text-[#FF9E9E]">
                  +1 coração recuperado
                </span>
              )}
            </div>

            {!isCorrect && correctLabel && (
              <p className="text-sm font-bold text-[#FFD5D5]">
                Resposta certa: <span className="underline decoration-[#FF8585]">{correctLabel}</span>
              </p>
            )}

            <div className="flex items-start gap-2 rounded-2xl bg-black/25 px-3 py-2 text-xs sm:text-sm text-[#E8F1F8]/95 leading-relaxed">
              <Lightbulb className="h-4 w-4 shrink-0 text-[#FFC800] mt-0.5" />
              <span>{tip}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 sm:pl-4">
          <TactileButton
            variant={isCorrect ? 'success' : 'danger'}
            size="lg"
            fullWidth
            onClick={onContinue}
            className="sm:min-w-[170px]"
          >
            {isLastQuestion ? 'Ver Resumo' : 'Continuar'}
          </TactileButton>
        </div>
      </div>
    </motion.div>
  );
}
