import { useFinance } from '@/hooks/use-finance';
import { useAuth } from '@/hooks/use-auth';
import { generateRiskAlerts } from '@/lib/financial-engine';
import HealthScoreCard from '@/components/HealthScoreCard';
import MetricsGrid from '@/components/MetricsGrid';
import RiskAlerts from '@/components/RiskAlerts';
import DashboardCharts from '@/components/DashboardCharts';
import RepaymentComparison from '@/components/RepaymentComparison';
import ScenarioSimulator from '@/components/ScenarioSimulator';
import AIChatbot from '@/components/AIChatbot';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { profile, loading } = useFinance();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const alerts = generateRiskAlerts(profile);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-muted-foreground">Loading your financial data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border glass sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-display text-sm">₹</span>
            </div>
            <span className="font-display font-bold text-lg">LoanWise</span>
          </Link>
          <div className="flex gap-2 items-center">
            {user && <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>}
            <Link to="/onboarding">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4 mr-2" /> Edit Data
              </Button>
            </Link>
            {user && (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold font-display mb-1">Your Financial Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time analysis of your financial health</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <HealthScoreCard profile={profile} />
          <div className="md:col-span-2">
            <RiskAlerts alerts={alerts} />
          </div>
        </div>

        <MetricsGrid profile={profile} />
        <DashboardCharts profile={profile} />
        <RepaymentComparison profile={profile} />
        <ScenarioSimulator profile={profile} />

        <p className="text-xs text-muted-foreground text-center py-6 border-t border-border">
          ⚠️ This is not certified financial advice. Consult a qualified financial advisor for personalized recommendations.
        </p>
      </main>

      <AIChatbot />
    </div>
  );
}
