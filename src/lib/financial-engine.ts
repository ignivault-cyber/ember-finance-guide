// Financial Engine - Core calculations for loan repayment planning

export interface Loan {
  id: string;
  name: string;
  type: 'home' | 'car' | 'education' | 'personal' | 'credit_card' | 'other';
  principal: number;
  outstanding: number;
  interestRate: number; // annual %
  tenureMonths: number;
  emi: number;
  lender: string;
}

export interface FinancialProfile {
  monthlyIncome: number;
  otherIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  liquidSavings: number;
  investments: number;
  loans: Loan[];
}

export interface HealthScore {
  score: number; // 0-100
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  color: string;
}

export interface RiskAlert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface RepaymentPlan {
  loanId: string;
  loanName: string;
  order: number;
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
}

// EMI Calculation: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function totalIncome(profile: FinancialProfile): number {
  return profile.monthlyIncome + profile.otherIncome;
}

export function totalExpenses(profile: FinancialProfile): number {
  return profile.fixedExpenses + profile.variableExpenses;
}

export function totalEMI(profile: FinancialProfile): number {
  return profile.loans.reduce((sum, l) => sum + l.emi, 0);
}

export function totalOutstanding(profile: FinancialProfile): number {
  return profile.loans.reduce((sum, l) => sum + l.outstanding, 0);
}

export function debtToIncomeRatio(profile: FinancialProfile): number {
  const income = totalIncome(profile);
  if (income === 0) return 0;
  return (totalEMI(profile) / income) * 100;
}

export function emiBurdenPercent(profile: FinancialProfile): number {
  const income = totalIncome(profile);
  if (income === 0) return 0;
  return (totalEMI(profile) / income) * 100;
}

export function monthlySurplus(profile: FinancialProfile): number {
  return totalIncome(profile) - totalExpenses(profile) - totalEMI(profile);
}

export function emergencyFundMonths(profile: FinancialProfile): number {
  const monthlyNeed = totalExpenses(profile) + totalEMI(profile);
  if (monthlyNeed === 0) return 99;
  return profile.liquidSavings / monthlyNeed;
}

export function liquidityRatio(profile: FinancialProfile): number {
  const monthlyNeed = totalExpenses(profile) + totalEMI(profile);
  if (monthlyNeed === 0) return 99;
  return (profile.liquidSavings + profile.investments) / (monthlyNeed * 6);
}

export function calculateHealthScore(profile: FinancialProfile): HealthScore {
  let score = 50; // base

  // DTI ratio impact (-30 to +20)
  const dti = debtToIncomeRatio(profile);
  if (dti < 20) score += 20;
  else if (dti < 35) score += 10;
  else if (dti < 50) score -= 10;
  else score -= 30;

  // Emergency fund impact (-20 to +15)
  const efMonths = emergencyFundMonths(profile);
  if (efMonths >= 6) score += 15;
  else if (efMonths >= 3) score += 5;
  else if (efMonths >= 1) score -= 5;
  else score -= 20;

  // Surplus impact (-15 to +15)
  const surplus = monthlySurplus(profile);
  const income = totalIncome(profile);
  if (income > 0) {
    const savingsRate = (surplus / income) * 100;
    if (savingsRate >= 20) score += 15;
    else if (savingsRate >= 10) score += 5;
    else if (savingsRate >= 0) score -= 5;
    else score -= 15;
  }

  score = Math.max(0, Math.min(100, score));

  let grade: HealthScore['grade'];
  let color: string;
  if (score >= 80) { grade = 'Excellent'; color = 'hsl(152 60% 45%)'; }
  else if (score >= 60) { grade = 'Good'; color = 'hsl(174 72% 46%)'; }
  else if (score >= 40) { grade = 'Fair'; color = 'hsl(45 90% 55%)'; }
  else if (score >= 20) { grade = 'Poor'; color = 'hsl(25 80% 50%)'; }
  else { grade = 'Critical'; color = 'hsl(0 72% 55%)'; }

  return { score, grade, color };
}

export function generateRiskAlerts(profile: FinancialProfile): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const dti = debtToIncomeRatio(profile);
  const ef = emergencyFundMonths(profile);
  const surplus = monthlySurplus(profile);

  if (dti > 50) alerts.push({ type: 'critical', title: 'Extreme Debt Load', message: `Your EMIs consume ${dti.toFixed(0)}% of income. Immediate action needed.` });
  else if (dti > 35) alerts.push({ type: 'warning', title: 'High Debt-to-Income', message: `DTI at ${dti.toFixed(0)}%. Consider reducing debt load.` });

  if (ef < 1) alerts.push({ type: 'critical', title: 'No Emergency Fund', message: 'Less than 1 month of expenses saved. Build emergency reserves urgently.' });
  else if (ef < 3) alerts.push({ type: 'warning', title: 'Low Emergency Fund', message: `Only ${ef.toFixed(1)} months of buffer. Target 6 months.` });

  if (surplus < 0) alerts.push({ type: 'critical', title: 'Negative Cash Flow', message: `You're spending ₹${Math.abs(surplus).toLocaleString()} more than you earn monthly.` });

  const highRateLoans = profile.loans.filter(l => l.interestRate > 15);
  if (highRateLoans.length > 0) alerts.push({ type: 'warning', title: 'High Interest Loans', message: `${highRateLoans.length} loan(s) above 15% interest. Prioritize repayment.` });

  if (alerts.length === 0) alerts.push({ type: 'info', title: 'Looking Good', message: 'No critical financial risks detected. Keep it up!' });

  return alerts;
}

// Avalanche: highest interest first
export function avalancheStrategy(loans: Loan[]): RepaymentPlan[] {
  return [...loans]
    .sort((a, b) => b.interestRate - a.interestRate)
    .map((loan, i) => {
      const totalPaid = loan.emi * loan.tenureMonths;
      return {
        loanId: loan.id,
        loanName: loan.name,
        order: i + 1,
        monthsToPayoff: loan.tenureMonths,
        totalInterest: totalPaid - loan.outstanding,
        totalPaid,
      };
    });
}

// Snowball: smallest outstanding first
export function snowballStrategy(loans: Loan[]): RepaymentPlan[] {
  return [...loans]
    .sort((a, b) => a.outstanding - b.outstanding)
    .map((loan, i) => {
      const totalPaid = loan.emi * loan.tenureMonths;
      return {
        loanId: loan.id,
        loanName: loan.name,
        order: i + 1,
        monthsToPayoff: loan.tenureMonths,
        totalInterest: totalPaid - loan.outstanding,
        totalPaid,
      };
    });
}

// Scenario simulation
export interface ScenarioResult {
  label: string;
  newSurplus: number;
  newDTI: number;
  newHealthScore: HealthScore;
  impactDescription: string;
}

export function simulateScenario(
  profile: FinancialProfile,
  scenario: 'income_drop_20' | 'income_drop_50' | 'rate_increase_2' | 'prepay_largest'
): ScenarioResult {
  const modified = JSON.parse(JSON.stringify(profile)) as FinancialProfile;

  switch (scenario) {
    case 'income_drop_20':
      modified.monthlyIncome *= 0.8;
      return {
        label: '20% Income Drop',
        newSurplus: monthlySurplus(modified),
        newDTI: debtToIncomeRatio(modified),
        newHealthScore: calculateHealthScore(modified),
        impactDescription: 'Simulates a 20% salary cut or income reduction.',
      };
    case 'income_drop_50':
      modified.monthlyIncome *= 0.5;
      return {
        label: '50% Income Drop (Job Loss)',
        newSurplus: monthlySurplus(modified),
        newDTI: debtToIncomeRatio(modified),
        newHealthScore: calculateHealthScore(modified),
        impactDescription: 'Simulates losing half your income.',
      };
    case 'rate_increase_2':
      modified.loans = modified.loans.map(l => ({
        ...l,
        interestRate: l.interestRate + 2,
        emi: calculateEMI(l.outstanding, l.interestRate + 2, l.tenureMonths),
      }));
      return {
        label: '+2% Interest Rate Hike',
        newSurplus: monthlySurplus(modified),
        newDTI: debtToIncomeRatio(modified),
        newHealthScore: calculateHealthScore(modified),
        impactDescription: 'Simulates a 2% increase across all loan rates.',
      };
    case 'prepay_largest': {
      const largest = [...modified.loans].sort((a, b) => b.outstanding - a.outstanding)[0];
      if (largest && modified.liquidSavings >= largest.outstanding * 0.2) {
        const prepayAmount = largest.outstanding * 0.2;
        largest.outstanding -= prepayAmount;
        largest.emi = calculateEMI(largest.outstanding, largest.interestRate, largest.tenureMonths);
        modified.liquidSavings -= prepayAmount;
      }
      return {
        label: '20% Prepayment on Largest Loan',
        newSurplus: monthlySurplus(modified),
        newDTI: debtToIncomeRatio(modified),
        newHealthScore: calculateHealthScore(modified),
        impactDescription: 'Uses 20% of savings to prepay the largest loan.',
      };
    }
  }
}

export function getLoanTypeLabel(type: Loan['type']): string {
  const labels: Record<Loan['type'], string> = {
    home: 'Home Loan',
    car: 'Car Loan',
    education: 'Education Loan',
    personal: 'Personal Loan',
    credit_card: 'Credit Card',
    other: 'Other',
  };
  return labels[type];
}

export const SAMPLE_PROFILE: FinancialProfile = {
  monthlyIncome: 80000,
  otherIncome: 5000,
  fixedExpenses: 25000,
  variableExpenses: 15000,
  liquidSavings: 200000,
  investments: 300000,
  loans: [
    { id: '1', name: 'Home Loan', type: 'home', principal: 3000000, outstanding: 2500000, interestRate: 8.5, tenureMonths: 240, emi: 26036, lender: 'SBI' },
    { id: '2', name: 'Car Loan', type: 'car', principal: 600000, outstanding: 350000, interestRate: 9.5, tenureMonths: 48, emi: 15066, lender: 'HDFC' },
    { id: '3', name: 'Credit Card', type: 'credit_card', principal: 80000, outstanding: 80000, interestRate: 36, tenureMonths: 12, emi: 8133, lender: 'ICICI' },
  ],
};
