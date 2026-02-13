import { useEffect } from 'react';
import { useFinance } from '@/hooks/use-finance';
import { useMLPredictions, type MLPredictions } from '@/hooks/use-ml-predictions';
import { motion } from 'framer-motion';
import { Brain, ShieldAlert, CreditCard, TrendingUp, AlertTriangle, Sparkles, RefreshCw, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function MLInsights() {
  const { profile } = useFinance();
  const { predictions, loading, error, fetchPredictions } = useMLPredictions();

  useEffect(() => {
    if (profile.loans.length > 0) {
      fetchPredictions(profile);
    }
  }, []);

  if (profile.loans.length === 0) return null;

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display">AI/ML Insights</h2>
            <p className="text-sm text-muted-foreground">Running prediction models...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-destructive" />
          <p className="text-sm text-muted-foreground">ML analysis unavailable: {error}</p>
          <button onClick={() => fetchPredictions(profile)} className="ml-auto text-xs text-primary hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!predictions) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              AI/ML Insights <Sparkles className="w-4 h-4 text-accent" />
            </h2>
            <p className="text-sm text-muted-foreground">Powered by advanced prediction models</p>
          </div>
        </div>
        <button onClick={() => fetchPredictions(profile)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <DefaultRiskCard data={predictions.defaultRisk} />
        <CreditScoreCard data={predictions.creditScore} />
        <RepaymentCard data={predictions.repaymentOptimizer} />
        <AnomalyCard data={predictions.anomalies} />
      </div>
    </motion.div>
  );
}

function DefaultRiskCard({ data }: { data: MLPredictions['defaultRisk'] }) {
  const colors = { low: 'text-success', moderate: 'text-warning', high: 'text-destructive', critical: 'text-destructive' };
  const bgColors = { low: 'bg-success/10', moderate: 'bg-warning/10', high: 'bg-destructive/10', critical: 'bg-destructive/10' };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className={`w-4 h-4 ${colors[data.riskLevel]}`} />
        <h3 className="font-display font-semibold text-sm">Default Risk Prediction</h3>
      </div>

      <div className="flex items-end gap-3">
        <span className={`text-3xl font-bold font-display ${colors[data.riskLevel]}`}>{data.probability}%</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bgColors[data.riskLevel]} ${colors[data.riskLevel]}`}>
          {data.riskLevel.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2">
        {data.keyFactors.slice(0, 4).map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {f.impact === 'positive' ? <ArrowDown className="w-3 h-3 text-success" /> :
             f.impact === 'negative' ? <ArrowUp className="w-3 h-3 text-destructive" /> :
             <Minus className="w-3 h-3 text-muted-foreground" />}
            <span className="text-muted-foreground flex-1">{f.factor}</span>
            <span className="text-foreground/70">{(f.weight * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground border-t border-border pt-3">{data.recommendation}</p>
    </div>
  );
}

function CreditScoreCard({ data }: { data: MLPredictions['creditScore'] }) {
  const scorePercent = ((data.estimated - 300) / 600) * 100;
  const catColors = { poor: 'text-destructive', fair: 'text-warning', good: 'text-accent', very_good: 'text-primary', excellent: 'text-success' };
  const catLabels = { poor: 'Poor', fair: 'Fair', good: 'Good', very_good: 'Very Good', excellent: 'Excellent' };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className={`w-4 h-4 ${catColors[data.category]}`} />
        <h3 className="font-display font-semibold text-sm">Credit Score Estimator</h3>
      </div>

      <div className="flex items-end gap-3">
        <span className={`text-3xl font-bold font-display ${catColors[data.category]}`}>{data.estimated}</span>
        <span className="text-xs text-muted-foreground">/ 900</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[data.category]} bg-muted`}>
          {catLabels[data.category]}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>300</span>
          <span>Range: {data.range.low}-{data.range.high}</span>
          <span>900</span>
        </div>
        <Progress value={scorePercent} className="h-2" />
      </div>

      <div className="space-y-1.5">
        {data.factors.slice(0, 4).map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ background: f.status === 'excellent' ? 'hsl(var(--success))' : f.status === 'good' ? 'hsl(var(--primary))' : f.status === 'fair' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }} />
            <span className="text-muted-foreground flex-1">{f.name}</span>
            <span className="text-foreground/70">{f.score}/100</span>
          </div>
        ))}
      </div>

      {data.improvementTips.length > 0 && (
        <p className="text-xs text-muted-foreground border-t border-border pt-3">💡 {data.improvementTips[0]}</p>
      )}
    </div>
  );
}

function RepaymentCard({ data }: { data: MLPredictions['repaymentOptimizer'] }) {
  const stratLabels = { avalanche: '⚡ Avalanche', snowball: '❄️ Snowball', hybrid: '🔀 Hybrid' };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Smart Repayment Optimizer</h3>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Best Strategy</p>
          <p className="font-display font-semibold text-sm">{stratLabels[data.strategy]}</p>
        </div>
        <div className="border-l border-border pl-4">
          <p className="text-xs text-muted-foreground">Interest Saved</p>
          <p className="font-display font-semibold text-sm text-success">₹{data.totalInterestSaved.toLocaleString()}</p>
        </div>
        <div className="border-l border-border pl-4">
          <p className="text-xs text-muted-foreground">Months Saved</p>
          <p className="font-display font-semibold text-sm text-primary">{data.totalMonthsSaved}</p>
        </div>
      </div>

      <div className="space-y-2">
        {data.allocations.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">{a.priority}</span>
            <span className="text-muted-foreground flex-1 truncate">{a.loanName}</span>
            <span className="text-foreground/50">₹{a.currentEMI.toLocaleString()}</span>
            <span className="text-foreground/30">→</span>
            <span className="text-success font-medium">₹{a.suggestedEMI.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground border-t border-border pt-3">{data.reason}</p>
    </div>
  );
}

function AnomalyCard({ data }: { data: MLPredictions['anomalies'] }) {
  const sevColors = { info: 'text-info', warning: 'text-warning', critical: 'text-destructive' };
  const sevBg = { info: 'bg-info/10', warning: 'bg-warning/10', critical: 'bg-destructive/10' };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        <h3 className="font-display font-semibold text-sm">Anomaly Detection</h3>
        {data.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium ml-auto">{data.length} found</span>
        )}
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">✅ No anomalies detected</p>
      ) : (
        <div className="space-y-3">
          {data.map((a, i) => (
            <div key={i} className={`rounded-lg p-3 ${sevBg[a.severity]} space-y-1`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${sevColors[a.severity]}`}>{a.severity.toUpperCase()}</span>
                <span className="text-xs font-medium text-foreground">{a.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{a.description}</p>
              <div className="flex gap-4 text-xs">
                <span className="text-foreground/70">Actual: <strong>{a.value}</strong></span>
                <span className="text-muted-foreground">Benchmark: {a.benchmark}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
