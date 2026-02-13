import { useState, useCallback } from 'react';
import { FinancialProfile, totalIncome, totalEMI, totalOutstanding, debtToIncomeRatio, emiBurdenPercent, emergencyFundMonths, monthlySurplus } from '@/lib/financial-engine';

export interface DefaultRisk {
  probability: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  keyFactors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[];
  recommendation: string;
}

export interface CreditScore {
  estimated: number;
  range: { low: number; high: number };
  category: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  factors: { name: string; score: number; status: 'excellent' | 'good' | 'fair' | 'poor' }[];
  improvementTips: string[];
}

export interface RepaymentOptimizer {
  strategy: 'avalanche' | 'snowball' | 'hybrid';
  reason: string;
  allocations: { loanName: string; currentEMI: number; suggestedEMI: number; priority: number; interestSaved: number; monthsSaved: number }[];
  totalInterestSaved: number;
  totalMonthsSaved: number;
}

export interface Anomaly {
  type: 'spending' | 'debt' | 'savings' | 'income';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  metric: string;
  value: string;
  benchmark: string;
}

export interface MLPredictions {
  defaultRisk: DefaultRisk;
  creditScore: CreditScore;
  repaymentOptimizer: RepaymentOptimizer;
  anomalies: Anomaly[];
}

export function useMLPredictions() {
  const [predictions, setPredictions] = useState<MLPredictions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async (profile: FinancialProfile) => {
    setLoading(true);
    setError(null);

    const financialContext = {
      monthlyIncome: totalIncome(profile),
      totalEMI: totalEMI(profile),
      totalOutstanding: totalOutstanding(profile),
      debtToIncome: debtToIncomeRatio(profile).toFixed(1) + '%',
      emiBurden: emiBurdenPercent(profile).toFixed(1) + '%',
      emergencyFundMonths: emergencyFundMonths(profile).toFixed(1),
      monthlySurplus: monthlySurplus(profile),
      loans: profile.loans.map(l => ({ name: l.name, type: l.type, outstanding: l.outstanding, rate: l.interestRate, emi: l.emi, tenure: l.tenureMonths })),
      liquidSavings: profile.liquidSavings,
      investments: profile.investments,
      fixedExpenses: profile.fixedExpenses,
      variableExpenses: profile.variableExpenses,
    };

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ml-predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ financialContext }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'ML prediction failed');
      }

      const data: MLPredictions = await resp.json();
      setPredictions(data);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  return { predictions, loading, error, fetchPredictions };
}
