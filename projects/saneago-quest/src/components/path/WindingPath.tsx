import { Check, Lock, Play, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { LessonMeta, UnitId, UnitMeta } from '../../types/quiz';

interface WindingPathProps {
  unit: UnitMeta;
  lessons: LessonMeta[];
  isLessonUnlocked: (lessonId: string) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
  getLessonBestAccuracy: (lessonId: string) => number | undefined;
  simuladoUnlocked: boolean;
  onSelectLesson: (lesson: LessonMeta) => void;
  onStartSimulado: (unitId: UnitId) => void;
}

/**
 * Calcula deslocamento horizontal em onda senoidal inspirado em trilhas estilo Duolingo,
 * mantendo amplitude segura para caber perfeitamente em viewports móveis (360px+).
 */
function getSinOffset(index: number): number {
  const cycleIndex = index % 8;
  return Math.round(Math.sin(cycleIndex * (Math.PI / 3.1)) * 52);
}

export function WindingPath({
  unit,
  lessons,
  isLessonUnlocked,
  isLessonCompleted,
  getLessonBestAccuracy,
  simuladoUnlocked,
  onSelectLesson,
  onStartSimulado,
}: WindingPathProps) {
  const totalNodes = lessons.length + 1; // 3 lições + 1 troféu simulado
  const rowHeight = 112;
  const centerX = 160;
  const svgHeight = totalNodes * rowHeight;

  const nodeCoords = Array.from({ length: totalNodes }, (_, idx) => ({
    x: centerX + getSinOffset(idx),
    y: idx * rowHeight + 52,
  }));

  const firstPlayableLessonId = lessons.find(
    (lesson) => isLessonUnlocked(lesson.id) && !isLessonCompleted(lesson.id)
  )?.id;

  return (
    <div className="relative mx-auto w-full max-w-[340px] py-4 select-none">
      {/* Conector sinuoso SVG por trás dos nós */}
      <svg
        viewBox={`0 0 320 ${svgHeight}`}
        className="pointer-events-none absolute inset-x-0 top-4 mx-auto h-auto w-[320px]"
        aria-hidden="true"
      >
        {nodeCoords.slice(0, -1).map((from, idx) => {
          const to = nodeCoords[idx + 1];
          const midY = (from.y + to.y) / 2;
          const d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
          const sourceLesson = lessons[idx];
          const segmentDone = sourceLesson ? isLessonCompleted(sourceLesson.id) : false;

          return (
            <g key={`path-${idx}`}>
              <path
                d={d}
                fill="none"
                stroke="#1D2A38"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d={d}
                fill="none"
                stroke={segmentDone ? unit.accentColor : '#2B3D50'}
                strokeOpacity={segmentDone ? 0.65 : 1}
                strokeWidth="6"
                strokeDasharray={segmentDone ? undefined : '8 8'}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>

      {/* Nós da trilha */}
      <div className="relative z-10 flex flex-col items-center">
        {lessons.map((lesson, idx) => {
          const unlocked = isLessonUnlocked(lesson.id);
          const completed = isLessonCompleted(lesson.id);
          const isCurrent = lesson.id === firstPlayableLessonId;
          const bestAccuracy = getLessonBestAccuracy(lesson.id);
          const offsetX = getSinOffset(idx);

          return (
            <div
              key={lesson.id}
              style={{ height: `${rowHeight}px`, transform: `translateX(${offsetX}px)` }}
              className="relative flex flex-col items-center justify-center"
            >
              {isCurrent && (
                <motion.div
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: [0, -5, 0], opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.9, ease: 'easeInOut' }}
                  className="relative mb-1.5 rounded-xl bg-[#E8F1F8] px-3 py-1 text-[11px] font-display font-extrabold uppercase tracking-wider text-[#0B1117] shadow-md"
                >
                  Começar
                  <span className="absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#E8F1F8]" />
                </motion.div>
              )}

              <div className="relative flex items-center justify-center">
                {isCurrent && (
                  <span
                    className="animate-pulse-ring absolute -inset-2 rounded-full border-4"
                    style={{ borderColor: unit.accentColor }}
                  />
                )}

                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onSelectLesson(lesson)}
                  aria-label={`${lesson.title} (${completed ? 'Concluída' : unlocked ? 'Disponível' : 'Bloqueada'})`}
                  style={
                    unlocked
                      ? {
                          backgroundColor: completed ? unit.accentColor : unit.accentColor,
                          borderColor: unit.shadeColor,
                          color: '#071520',
                        }
                      : undefined
                  }
                  className={`group relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-b-[6px] transition-all duration-100 ${
                    unlocked
                      ? 'cursor-pointer hover:brightness-110 active:translate-y-[4px] active:border-b-0 shadow-lg'
                      : 'cursor-not-allowed bg-[#1D2A38] border-[#0F1720] text-[#5B728A]'
                  }`}
                >
                  {completed ? (
                    <Check className="h-8 w-8 stroke-[3]" />
                  ) : unlocked ? (
                    <Play className="h-7 w-7 fill-current translate-x-0.5" />
                  ) : (
                    <Lock className="h-6 w-6" />
                  )}

                  {completed && bestAccuracy !== undefined && (
                    <span className="absolute -top-1.5 -right-2 inline-flex items-center gap-0.5 rounded-full bg-[#FFC800] border-2 border-[#0B1117] px-1.5 py-0.5 text-[10px] font-display font-extrabold text-[#1E1500]">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      {bestAccuracy}%
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-1.5 max-w-[190px] text-center">
                <p
                  className={`text-xs font-display font-bold leading-tight ${
                    unlocked ? 'text-[#E8F1F8]' : 'text-[#6A8098]'
                  }`}
                >
                  {lesson.order}. {lesson.title}
                </p>
              </div>
            </div>
          );
        })}

        {/* Nó final da unidade: Simulado Cronometrado */}
        <div
          style={{
            height: `${rowHeight}px`,
            transform: `translateX(${getSinOffset(lessons.length)}px)`,
          }}
          className="relative flex flex-col items-center justify-center"
        >
          <button
            type="button"
            disabled={!simuladoUnlocked}
            onClick={() => onStartSimulado(unit.id)}
            aria-label={`Simulado Cronometrado — ${unit.title}`}
            className={`flex h-[74px] w-[74px] items-center justify-center rounded-full border-b-[6px] transition-all duration-100 ${
              simuladoUnlocked
                ? 'cursor-pointer bg-[#FFC800] border-[#D19D00] text-[#221700] hover:brightness-105 active:translate-y-[4px] active:border-b-0 shadow-[0_0_24px_rgba(255,200,0,0.28)]'
                : 'cursor-not-allowed bg-[#1D2A38] border-[#0F1720] text-[#5B728A]'
            }`}
          >
            {simuladoUnlocked ? <Trophy className="h-8 w-8" /> : <Lock className="h-6 w-6" />}
          </button>

          <p
            className={`mt-1.5 text-xs font-display font-extrabold ${
              simuladoUnlocked ? 'text-[#FFC800]' : 'text-[#6A8098]'
            }`}
          >
            Simulado da Unidade
          </p>
        </div>
      </div>
    </div>
  );
}
