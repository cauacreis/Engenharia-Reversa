import { motion } from 'framer-motion';
import { Award, CheckCircle2, Clock, Flame, Heart, Lightbulb, RotateCcw, Target, XCircle, Zap } from 'lucide-react';
import { QuizSummaryData } from '../../types/quiz';
import { TactileButton } from '../ui/TactileButton';

interface LessonSummaryProps {
  summary: QuizSummaryData;
  onFinish: () => void;
  onRetry?: () => void;
}

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function LessonSummary({ summary, onFinish, onRetry }: LessonSummaryProps) {
  const isStrong = summary.accuracy >= 70;

  return (
    <div className="min-h-dvh bg-[#0B1117] px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl space-y-6"
      >
        {/* Cabeçalho de conquista */}
        <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-6 sm:p-8 text-center space-y-4">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-b-[5px] ${
              isStrong
                ? 'bg-[#FFC800] border-[#D19D00] text-[#221700]'
                : 'bg-[#00B8FF] border-[#0088C2] text-[#041824]'
            }`}
          >
            <Award className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-display font-extrabold uppercase tracking-wider text-[#00B8FF]">
              {summary.mode === 'simulado'
                ? 'Resultado do Simulado Cronometrado'
                : summary.mode === 'mistake-review'
                ? 'Revisão de Erros Concluída'
                : 'Lição Concluída'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#E8F1F8]">
              {summary.title}
            </h1>
            {summary.timedOut && (
              <p className="text-sm font-bold text-[#FF8585]">
                O cronômetro encerrou e o gabarito foi enviado automaticamente.
              </p>
            )}
          </div>

          {/* Grid de métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-2xl border-2 border-[#FFC800]/40 bg-[#FFC800]/10 p-3.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#FFC800]">
                <Zap className="h-4 w-4 fill-current" />
                <span>XP Ganho</span>
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold text-white">
                +{summary.xpEarned}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-[#58CC02]/40 bg-[#58CC02]/10 p-3.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#86F23B]">
                <Target className="h-4 w-4" />
                <span>Precisão</span>
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold text-white">
                {summary.accuracy}%
              </p>
              <p className="text-[11px] text-[#92A8BE]">
                {summary.correctCount}/{summary.totalCount} acertos
              </p>
            </div>

            <div className="rounded-2xl border-2 border-[#FF9600]/40 bg-[#FF9600]/10 p-3.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#FFB340]">
                <Flame className="h-4 w-4 fill-current" />
                <span>Maior Combo</span>
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold text-white">
                {summary.maxCombo}x
              </p>
            </div>

            <div className="rounded-2xl border-2 border-[#00B8FF]/40 bg-[#00B8FF]/10 p-3.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#61D5FF]">
                {summary.heartsRecovered > 0 ? (
                  <>
                    <Heart className="h-4 w-4 fill-current text-[#FF4B4B]" />
                    <span className="text-[#FF8585]">Vidas</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Tempo</span>
                  </>
                )}
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold text-white">
                {summary.heartsRecovered > 0
                  ? `+${summary.heartsRecovered}`
                  : formatDuration(summary.durationSeconds)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onRetry && (
              <TactileButton variant="outline" size="lg" fullWidth onClick={onRetry}>
                <RotateCcw className="h-4 w-4" />
                <span>Refazer Agora</span>
              </TactileButton>
            )}
            <TactileButton variant="success" size="lg" fullWidth onClick={onFinish}>
              Voltar ao Mapa
            </TactileButton>
          </div>
        </div>

        {/* Gabarito Comentado (Simulado) */}
        {summary.reviewItems && summary.reviewItems.length > 0 && (
          <div className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-display text-xl font-extrabold text-[#E8F1F8]">
                Gabarito Comentado da Prova
              </h2>
              <p className="text-xs text-[#92A8BE]">
                As questões erradas foram enviadas automaticamente ao seu Banco de Erros.
              </p>
            </div>

            <div className="space-y-3">
              {summary.reviewItems.map((item, idx) => (
                <div
                  key={`${item.question.id}-${idx}`}
                  className={`rounded-2xl border-2 p-4 space-y-2 ${
                    item.isCorrect
                      ? 'border-[#58CC02]/35 bg-[#58CC02]/5'
                      : 'border-[#FF4B4B]/45 bg-[#FF4B4B]/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-bold text-[#92A8BE]">
                        Questão {idx + 1} • {item.question.topic}
                      </span>
                      <p className="text-sm font-bold text-[#E8F1F8]">{item.question.prompt}</p>
                    </div>
                    {item.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-[#58CC02] shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#FF4B4B] shrink-0" />
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-[#92A8BE]">
                      Sua resposta:{' '}
                      <span
                        className={`font-bold ${
                          item.isCorrect ? 'text-[#86F23B]' : 'text-[#FF8585]'
                        }`}
                      >
                        {item.userAnswerSummary}
                      </span>
                    </p>
                    {!item.isCorrect && (
                      <p className="text-[#92A8BE]">
                        Gabarito:{' '}
                        <span className="font-bold text-[#86F23B]">
                          {item.correctAnswerSummary}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-[#0B1117]/70 px-3 py-2 text-xs text-[#E8F1F8]/90">
                    <Lightbulb className="h-3.5 w-3.5 text-[#FFC800] shrink-0 mt-0.5" />
                    <span>{item.question.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
