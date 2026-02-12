import { useState } from 'react';
import { FinancialProfile, simulateScenario, ScenarioResult, calculateHealthScore } from '@/lib/financial-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingDown, Percent, Wallet } from 'lucide-react';

const scenarios = [
  { key: 'income_drop_20' as const, label: '20% Income Drop', icon: TrendingDown },
  { key: 'income_drop_50' as const, label: 'Job Loss (50%)', icon: Zap },
  { key: 'rate_increase_2' as const, label: '+2% Rate Hike', icon: Percent },
  { key: 'prepay_largest' as const, label: 'Prepay Largest', icon: Wallet },
];

export default function ScenarioSimulator({ profile }: { profile: FinancialProfile }) {
  const [active, setActive] = useState<ScenarioResult | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const current = calculateHealthScore(profile);

  const run = (key: typeof scenarios[number]['key']) => {
    if (activeKey === key) { setActive(null); setActiveKey(null); return; }
    setActive(simulateScenario(profile, key));
    setActiveKey(key);
  };

  return (
    <div className="bg-gradient-card rounded-2xl p-6 border border-border shadow-card">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">What-If Simulator</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {scenarios.map(s => (
          <button
            key={s.key}
            onClick={() => run(s.key)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
              activeKey === s.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/40'
            }`}
          >
            <s.icon className="w-5 h-5" />
            {s.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={activeKey}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
              <p className="text-xs text-muted-foreground">{active.impactDescription}</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Health Score</p>
                  <p className="text-lg font-bold font-display" style={{ color: active.newHealthScore.color }}>
                    {active.newHealthScore.score}
                    <span className="text-xs ml-1 text-muted-foreground">
                      ({active.newHealthScore.score > current.score ? '+' : ''}{active.newHealthScore.score - current.score})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">DTI Ratio</p>
                  <p className={`text-lg font-bold font-display ${active.newDTI > 50 ? 'text-destructive' : active.newDTI > 35 ? 'text-warning' : 'text-success'}`}>
                    {active.newDTI.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Surplus</p>
                  <p className={`text-lg font-bold font-display ${active.newSurplus >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ₹{active.newSurplus.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
