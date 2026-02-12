import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { FinancialProfile, SAMPLE_PROFILE } from '@/lib/financial-engine';

interface FinanceContextType {
  profile: FinancialProfile;
  setProfile: (p: FinancialProfile) => void;
  hasData: boolean;
}

const FinanceContext = createContext<FinanceContextType>({
  profile: SAMPLE_PROFILE,
  setProfile: () => {},
  hasData: false,
});

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<FinancialProfile>(() => {
    const saved = localStorage.getItem('financeProfile');
    return saved ? JSON.parse(saved) : SAMPLE_PROFILE;
  });
  const [hasData] = useState(() => !!localStorage.getItem('financeProfile'));

  const setProfile = (p: FinancialProfile) => {
    setProfileState(p);
    localStorage.setItem('financeProfile', JSON.stringify(p));
  };

  return (
    <FinanceContext.Provider value={{ profile, setProfile, hasData }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
