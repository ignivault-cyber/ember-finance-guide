import { motion } from 'framer-motion';
import { calculateHealthScore, FinancialProfile } from '@/lib/financial-engine';

interface Props {
  profile: FinancialProfile;
}

export default function HealthScoreCard({ profile }: Props) {
  const { score, grade, color } = calculateHealthScore(profile);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-gradient-card rounded-2xl p-6 shadow-card border border-border flex flex-col items-center gap-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Financial Health</h3>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold font-display"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-lg font-semibold font-display" style={{ color }}>{grade}</span>
    </div>
  );
}
