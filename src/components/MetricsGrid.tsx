import { FinancialProfile, debtToIncomeRatio, emiBurdenPercent, emergencyFundMonths, monthlySurplus, totalEMI, totalIncome } from '@/lib/financial-engine';
import { motion } from 'framer-motion';

interface MetricProps {
  label: string;
  value: string;
  subtitle?: string;
  status: 'good' | 'warning' | 'danger';
}

function MetricCard({ label, value, subtitle, status }: MetricProps) {
  const colors = {
    good: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
  };
  return (
    <motion.div
      className="bg-gradient-card rounded-xl p-5 border border-border shadow-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-bold font-display ${colors[status]}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </motion.div>
  );
}

export default function MetricsGrid({ profile }: { profile: FinancialProfile }) {
  const dti = debtToIncomeRatio(profile);
  const burden = emiBurdenPercent(profile);
  const ef = emergencyFundMonths(profile);
  const surplus = monthlySurplus(profile);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Debt-to-Income"
        value={`${dti.toFixed(0)}%`}
        subtitle={dti < 35 ? 'Healthy range' : 'Above recommended'}
        status={dti < 35 ? 'good' : dti < 50 ? 'warning' : 'danger'}
      />
      <MetricCard
        label="EMI Burden"
        value={`${burden.toFixed(0)}%`}
        subtitle={`₹${totalEMI(profile).toLocaleString()} / ₹${totalIncome(profile).toLocaleString()}`}
        status={burden < 40 ? 'good' : burden < 55 ? 'warning' : 'danger'}
      />
      <MetricCard
        label="Emergency Fund"
        value={`${ef.toFixed(1)} mo`}
        subtitle={ef >= 6 ? 'Well covered' : 'Build more buffer'}
        status={ef >= 6 ? 'good' : ef >= 3 ? 'warning' : 'danger'}
      />
      <MetricCard
        label="Monthly Surplus"
        value={`₹${surplus.toLocaleString()}`}
        subtitle={surplus > 0 ? 'Positive cash flow' : 'Deficit!'}
        status={surplus > 0 ? 'good' : 'danger'}
      />
    </div>
  );
}
