import { useId } from 'react';
import { motion } from 'framer-motion';

export type MascotMood = 'idle' | 'happy' | 'combo' | 'sad' | 'thinking' | 'teaching';

interface MascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  speech?: string;
  speechTitle?: string;
  accentColor?: string;
  className?: string;
}

const SIZE_MAP: Record<'sm' | 'md' | 'lg', number> = {
  sm: 58,
  md: 86,
  lg: 112,
};

export function Mascot({
  mood = 'idle',
  size = 'md',
  speech,
  speechTitle,
  accentColor = '#00B8FF',
  className = '',
}: MascotProps) {
  const uid = useId().replace(/:/g, '');
  const bodyGradId = `pingoBodyGrad-${uid}`;
  const helmetGradId = `pingoHelmetGrad-${uid}`;
  const visorGradId = `pingoVisorGrad-${uid}`;

  const px = SIZE_MAP[size];
  const isCelebratory = mood === 'happy' || mood === 'combo';
  const isTeaching = mood === 'teaching';

  const bodyAnimation =
    mood === 'combo'
      ? { y: [0, -10, 0], rotate: [0, -5, 5, 0], scale: [1, 1.07, 1] }
      : mood === 'happy'
      ? { y: [0, -8, 0], scale: [1, 1.04, 1] }
      : mood === 'sad'
      ? { y: [0, 2, 0], rotate: [0, -4, 0] }
      : mood === 'thinking'
      ? { y: [0, -3, 0], rotate: [0, 3, -3, 0] }
      : isTeaching
      ? { y: [0, -5, 0], rotate: [0, 2, -2, 0] }
      : { y: [0, -4, 0] };

  const bodyTransition =
    mood === 'combo'
      ? { repeat: Infinity, duration: 1.1, ease: 'easeInOut' }
      : mood === 'happy'
      ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }
      : mood === 'sad'
      ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
      : mood === 'thinking'
      ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
      : isTeaching
      ? { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }
      : { repeat: Infinity, duration: 3.1, ease: 'easeInOut' };

  return (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      <div className="relative shrink-0" style={{ width: px, height: px }}>
        {/* Aura neon sutil atrás do mascote */}
        <motion.div
          animate={{
            opacity: mood === 'combo' ? [0.45, 0.9, 0.45] : [0.22, 0.42, 0.22],
            scale: mood === 'combo' ? [0.95, 1.12, 0.95] : [0.96, 1.04, 0.96],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="absolute inset-1 rounded-full blur-md pointer-events-none"
          style={{
            background:
              mood === 'sad'
                ? 'radial-gradient(circle, rgba(255,75,75,0.42) 0%, transparent 70%)'
                : mood === 'combo'
                ? 'radial-gradient(circle, rgba(255,200,0,0.48) 0%, rgba(0,184,255,0.28) 55%, transparent 75%)'
                : isTeaching
                ? `radial-gradient(circle, ${accentColor}66 0%, rgba(20,184,166,0.25) 60%, transparent 75%)`
                : 'radial-gradient(circle, rgba(0,184,255,0.4) 0%, rgba(20,184,166,0.2) 60%, transparent 75%)',
          }}
        />

        {/* Partículas comemorativas */}
        {isCelebratory && (
          <>
            <motion.span
              animate={{ y: [-2, -14, -2], opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="absolute -top-1 left-1 h-2 w-2 rounded-full bg-[#FFC800]"
            />
            <motion.span
              animate={{ y: [-4, -16, -4], opacity: [0.2, 1, 0.2], scale: [0.8, 1.25, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.4, delay: 0.35 }}
              className="absolute -top-1 right-1 h-2 w-2 rounded-full bg-[#58CC02]"
            />
            {mood === 'combo' && (
              <motion.span
                animate={{ x: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute top-1/2 -right-1 h-2 w-2 rounded-full bg-[#00B8FF]"
              />
            )}
          </>
        )}

        {/* Badge de ideia/aula no modo teaching */}
        {isTeaching && (
          <motion.div
            animate={{ y: [-2, -7, -2], rotate: [-6, 6, -6], scale: [0.95, 1.08, 0.95] }}
            transition={{ repeat: Infinity, duration: 2.1, ease: 'easeInOut' }}
            aria-hidden="true"
            className="absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-[#FFE15A]/70 bg-[#0B1117] text-[11px] shadow-md"
          >
            💡
          </motion.div>
        )}

        <motion.svg
          viewBox="0 0 120 120"
          width={px}
          height={px}
          animate={bodyAnimation}
          transition={bodyTransition}
          aria-label={`Mascote Pingo (${mood})`}
          className="relative z-10 overflow-visible drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
        >
          <defs>
            <linearGradient id={bodyGradId} x1="25%" y1="15%" x2="80%" y2="92%">
              <stop offset="0%" stopColor="#35D7FF" />
              <stop offset="55%" stopColor="#009DE0" />
              <stop offset="100%" stopColor="#0D7E8C" />
            </linearGradient>
            <linearGradient id={helmetGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE15A" />
              <stop offset="65%" stopColor="#FFC800" />
              <stop offset="100%" stopColor="#D19D00" />
            </linearGradient>
            <linearGradient id={visorGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#071926" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#0E2C40" stopOpacity="0.88" />
            </linearGradient>
          </defs>

          {/* Sombra no chão */}
          <ellipse cx="60" cy="112" rx="28" ry="5" fill="#05090D" opacity="0.55" />

          {/* Corpo em formato de gota d'água */}
          <path
            d="M60 18 C75 40 94 58 94 79 C94 98 79 109 60 109 C41 109 26 98 26 79 C26 58 45 40 60 18 Z"
            fill={`url(#${bodyGradId})`}
            stroke="#78E4FF"
            strokeWidth="2.5"
          />

          {/* Brilho especular na gota */}
          <path
            d="M39 68 C36 77 37 87 43 94"
            fill="none"
            stroke="#D6F7FF"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Capacete de Engenheiro da Saneago */}
          <g>
            {/* Copa do capacete */}
            <path
              d="M31 44 C32 23 45 14 60 14 C75 14 88 23 89 44 Z"
              fill={`url(#${helmetGradId})`}
              stroke="#FFF0A6"
              strokeWidth="2"
            />
            {/* Crista superior do capacete */}
            <rect
              x="55"
              y="12"
              width="10"
              height="18"
              rx="4"
              fill="#FFE77A"
              stroke="#D19D00"
              strokeWidth="1.5"
            />
            {/* Emblema gota/engenharia no capacete */}
            <circle cx="60" cy="33" r="6" fill="#0B1117" stroke="#00B8FF" strokeWidth="1.5" />
            <path d="M60 29 L63 34 A3 3 0 1 1 57 34 Z" fill="#00B8FF" />
            {/* Aba frontal */}
            <path
              d="M25 43 Q60 50 95 43 Q96 48 91 49 Q60 56 29 49 Q24 48 25 43 Z"
              fill="#E5AE00"
              stroke="#FFF0A6"
              strokeWidth="1.2"
            />
          </g>

          {/* Visor tech translúcido */}
          <rect
            x="33"
            y="53"
            width="54"
            height="24"
            rx="10"
            fill={`url(#${visorGradId})`}
            stroke={mood === 'sad' ? '#FF5E5E' : isTeaching ? accentColor : '#00D4FF'}
            strokeWidth="2"
          />

          {/* Scanner animado no visor quando pensando */}
          {mood === 'thinking' && (
            <motion.rect
              x="36"
              y="56"
              width="12"
              height="18"
              rx="5"
              fill="#00B8FF"
              opacity="0.45"
              animate={{ x: [36, 72, 36] }}
              transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
            />
          )}

          {/* Expressões dos olhos dentro do visor */}
          {mood === 'happy' || mood === 'combo' ? (
            <g stroke="#64F3FF" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M42 66 Q47 59 52 66" />
              <path d="M68 66 Q73 59 78 66" />
            </g>
          ) : mood === 'sad' ? (
            <g>
              <circle cx="47" cy="66" r="4" fill="#FF8080" />
              <circle cx="73" cy="66" r="4" fill="#FF8080" />
              <path
                d="M41 60 L52 63 M79 60 L68 63"
                stroke="#FF8080"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ) : (
            <motion.g
              animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
              transition={{ repeat: Infinity, duration: 3.8, times: [0, 0.46, 0.5, 0.54, 1] }}
              style={{ transformOrigin: '60px 65px' }}
            >
              <circle cx="47" cy="65" r="4.8" fill="#7BF5FF" />
              <circle cx="73" cy="65" r="4.8" fill="#7BF5FF" />
              <circle cx="48.5" cy="63.3" r="1.6" fill="#FFFFFF" />
              <circle cx="74.5" cy="63.3" r="1.6" fill="#FFFFFF" />
            </motion.g>
          )}

          {/* Boca / Expressão */}
          {mood === 'happy' || mood === 'combo' ? (
            <path
              d="M50 86 Q60 95 70 86"
              fill="none"
              stroke="#E8F1F8"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          ) : mood === 'sad' ? (
            <path
              d="M51 92 Q60 84 69 92"
              fill="none"
              stroke="#FFD2D2"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : mood === 'thinking' ? (
            <line
              x1="53"
              y1="89"
              x2="67"
              y2="87"
              stroke="#D6F7FF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : isTeaching ? (
            <path
              d="M51 86 Q60 93 69 86"
              fill="none"
              stroke="#E8F1F8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M53 87 Q60 92 67 87"
              fill="none"
              stroke="#E8F1F8"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          )}

          {/* Gotinha de preocupação no estado sad */}
          {mood === 'sad' && (
            <motion.path
              d="M93 52 C96 57 98 60 98 63 A5 5 0 1 1 88 63 C88 60 90 57 93 52 Z"
              fill="#61D5FF"
              animate={{ y: [0, 5, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
          )}
        </motion.svg>
      </div>

      {/* Balão de fala contextual */}
      {speech && (
        <div
          className="relative rounded-2xl border-2 bg-[#0B1117]/90 px-4 py-2.5 text-xs sm:text-sm leading-snug shadow-md"
          style={{ borderColor: `${accentColor}66` }}
        >
          <span
            className="hidden sm:block absolute -left-2 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-l-2 border-b-2 bg-[#0B1117]"
            style={{ borderColor: `${accentColor}66` }}
          />
          {speechTitle && (
            <p
              className="font-display text-[11px] font-extrabold uppercase tracking-wider mb-0.5"
              style={{ color: accentColor }}
            >
              {speechTitle}
            </p>
          )}
          <p className="font-semibold text-[#E8F1F8]">{speech}</p>
        </div>
      )}
    </div>
  );
}
