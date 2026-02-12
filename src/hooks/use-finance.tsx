import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { FinancialProfile, Loan, SAMPLE_PROFILE, calculateEMI } from '@/lib/financial-engine';

interface FinanceContextType {
  profile: FinancialProfile;
  setProfile: (p: FinancialProfile) => void;
  saveProfile: (p?: FinancialProfile) => Promise<void>;
  loading: boolean;
  hasData: boolean;
}

const FinanceContext = createContext<FinanceContextType>({
  profile: SAMPLE_PROFILE,
  setProfile: () => {},
  saveProfile: async () => {},
  loading: false,
  hasData: false,
});

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FinancialProfile>(SAMPLE_PROFILE);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  // Load from DB when user logs in
  useEffect(() => {
    if (!user) {
      // Fall back to localStorage for guests
      const saved = localStorage.getItem('financeProfile');
      if (saved) { setProfile(JSON.parse(saved)); setHasData(true); }
      return;
    }
    loadFromDB();
  }, [user]);

  const loadFromDB = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fpRes, loansRes] = await Promise.all([
        supabase.from('financial_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('loans').select('*').eq('user_id', user.id),
      ]);

      if (fpRes.data) {
        const fp = fpRes.data;
        const loans: Loan[] = (loansRes.data || []).map(l => ({
          id: l.id,
          name: l.name,
          type: l.loan_type as Loan['type'],
          principal: Number(l.principal),
          outstanding: Number(l.outstanding),
          interestRate: Number(l.interest_rate),
          tenureMonths: l.tenure_months,
          emi: Number(l.emi),
          lender: l.lender,
        }));
        setProfile({
          monthlyIncome: Number(fp.monthly_income),
          otherIncome: Number(fp.other_income),
          fixedExpenses: Number(fp.fixed_expenses),
          variableExpenses: Number(fp.variable_expenses),
          liquidSavings: Number(fp.liquid_savings),
          investments: Number(fp.investments),
          loans,
        });
        setHasData(true);
      }
    } catch (err) {
      console.error('Failed to load financial data', err);
    }
    setLoading(false);
  };

  const saveProfile = useCallback(async (overrideProfile?: FinancialProfile) => {
    const data = overrideProfile || profile;
    if (!user) {
      localStorage.setItem('financeProfile', JSON.stringify(data));
      return;
    }

    // Upsert financial profile
    await supabase.from('financial_profiles').upsert({
      user_id: user.id,
      monthly_income: data.monthlyIncome,
      other_income: data.otherIncome,
      fixed_expenses: data.fixedExpenses,
      variable_expenses: data.variableExpenses,
      liquid_savings: data.liquidSavings,
      investments: data.investments,
    }, { onConflict: 'user_id' });

    await supabase.from('loans').delete().eq('user_id', user.id);
    if (data.loans.length > 0) {
      await supabase.from('loans').insert(
        data.loans.map(l => ({
          user_id: user.id,
          name: l.name,
          loan_type: l.type,
          principal: l.principal,
          outstanding: l.outstanding,
          interest_rate: l.interestRate,
          tenure_months: l.tenureMonths,
          emi: l.emi,
          lender: l.lender,
        }))
      );
    }
    setHasData(true);
  }, [user, profile]);

  return (
    <FinanceContext.Provider value={{ profile, setProfile, saveProfile, loading, hasData }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
