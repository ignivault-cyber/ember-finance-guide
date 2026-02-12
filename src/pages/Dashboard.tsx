import { useFinance } from '@/hooks/use-finance';
import { generateRiskAlerts } from '@/lib/financial-engine';
import HealthScoreCard from '@/components/HealthScoreCard';
import MetricsGrid from '@/components/MetricsGrid';
import RiskAlerts from '@/components/RiskAlerts';
import DashboardCharts from '@/components/DashboardCharts';
import RepaymentComparison from '@/components/RepaymentComparison';
import ScenarioSimulator from '@/components/ScenarioSimulator';
import { Link } from 'react-router-dom';
import { Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { profile } = useFinance();
  const alerts = generateRiskAlerts(profile);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-display text-sm">₹</span>
            </div>
            <span className="font-display font-bold text-lg">LoanWise</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/onboarding">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4 mr-2" /> Edit Data
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold font-display mb-1">Your Financial Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time analysis of your financial health</p>
        </motion.div>

        {/* Top row: Score + Alerts */}
        <div className="grid md:grid-cols-3 gap-6">
          <HealthScoreCard profile={profile} />
          <div className="md:col-span-2">
            <RiskAlerts alerts={alerts} />
          </div>
        </div>

        {/* Metrics */}
        <MetricsGrid profile={profile} />

        {/* Charts */}
        <DashboardCharts profile={profile} />

        {/* Repayment */}
        <RepaymentComparison profile={profile} />

        {/* Simulator */}
        <ScenarioSimulator profile={profile} />

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center py-6 border-t border-border">
          ⚠️ This is not certified financial advice. Consult a qualified financial advisor for personalized recommendations.
        </p>
      </main>
    </div>
  );
}
