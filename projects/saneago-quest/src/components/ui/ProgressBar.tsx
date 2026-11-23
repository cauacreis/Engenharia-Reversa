import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  heightClass?: string;
  combo?: number;
}

export function ProgressBar({
  value,
  max,
  color = '#58CC02',
  heightClass = 'h-4',
  combo = 0,
}: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        className={`relative flex-1 ${heightClass} rounded-full bg-[#1D2A38] border border-[#28384A] overflow-hidden`}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 140, damping: 20 }}
        >
          <div className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/30" />
        </motion.div>
      </div>

      {combo >= 2 && (
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={combo}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FF9600]/20 border border-[#FF9600]/50 text-[#FFB340] font-display font-bold text-xs shrink-0"
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>{combo}x</span>
        </motion.div>
      )}
    </div>
  );
}
