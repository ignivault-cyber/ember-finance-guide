import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/hooks/use-finance';
import { FinancialProfile, Loan, calculateEMI } from '@/lib/financial-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Onboarding() {
  const { profile, setProfile, saveProfile } = useFinance();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [income, setIncome] = useState(profile.monthlyIncome.toString());
  const [otherIncome, setOtherIncome] = useState(profile.otherIncome.toString());
  const [fixedExp, setFixedExp] = useState(profile.fixedExpenses.toString());
  const [varExp, setVarExp] = useState(profile.variableExpenses.toString());
  const [savings, setSavings] = useState(profile.liquidSavings.toString());
  const [investments, setInvestments] = useState(profile.investments.toString());
  const [loans, setLoans] = useState<Loan[]>(profile.loans);

  const addLoan = () => {
    setLoans(prev => [...prev, {
      id: generateId(),
      name: '',
      type: 'personal',
      principal: 0,
      outstanding: 0,
      interestRate: 10,
      tenureMonths: 36,
      emi: 0,
      lender: '',
    }]);
  };

  const updateLoan = (id: string, field: keyof Loan, value: any) => {
    setLoans(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (['outstanding', 'interestRate', 'tenureMonths'].includes(field)) {
        updated.emi = calculateEMI(updated.outstanding, updated.interestRate, updated.tenureMonths);
      }
      return updated;
    }));
  };

  const removeLoan = (id: string) => setLoans(prev => prev.filter(l => l.id !== id));

  const save = async () => {
    const p: FinancialProfile = {
      monthlyIncome: Number(income) || 0,
      otherIncome: Number(otherIncome) || 0,
      fixedExpenses: Number(fixedExp) || 0,
      variableExpenses: Number(varExp) || 0,
      liquidSavings: Number(savings) || 0,
      investments: Number(investments) || 0,
      loans,
    };
    setProfile(p);
    setSaving(true);
    try {
      await saveProfile(p);
      toast.success('Financial data saved!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save data');
    }
    setSaving(false);
  };

  const steps = [
    {
      title: 'Income',
      subtitle: 'Tell us about your monthly earnings',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Monthly Salary (₹)</label>
            <Input type="number" value={income} onChange={e => setIncome(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Other Income (₹)</label>
            <Input type="number" value={otherIncome} onChange={e => setOtherIncome(e.target.value)} className="bg-secondary border-border" />
          </div>
        </div>
      ),
    },
    {
      title: 'Expenses',
      subtitle: 'Your monthly spending',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Fixed Expenses (₹) — rent, utilities, subscriptions</label>
            <Input type="number" value={fixedExp} onChange={e => setFixedExp(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Variable Expenses (₹) — food, transport, shopping</label>
            <Input type="number" value={varExp} onChange={e => setVarExp(e.target.value)} className="bg-secondary border-border" />
          </div>
        </div>
      ),
    },
    {
      title: 'Savings',
      subtitle: 'Your financial reserves',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Liquid Savings (₹) — bank balance, FDs</label>
            <Input type="number" value={savings} onChange={e => setSavings(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Investments (₹) — stocks, MFs, PPF</label>
            <Input type="number" value={investments} onChange={e => setInvestments(e.target.value)} className="bg-secondary border-border" />
          </div>
        </div>
      ),
    },
    {
      title: 'Loans',
      subtitle: 'Add all your active loans',
      content: (
        <div className="space-y-4">
          {loans.map(loan => (
            <div key={loan.id} className="bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <Select value={loan.type} onValueChange={v => updateLoan(loan.id, 'type', v)}>
                  <SelectTrigger className="w-40 bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Loan</SelectItem>
                    <SelectItem value="car">Car Loan</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <button onClick={() => removeLoan(loan.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Input placeholder="Loan name" value={loan.name} onChange={e => updateLoan(loan.id, 'name', e.target.value)} className="bg-muted border-border" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Outstanding (₹)</label>
                  <Input type="number" value={loan.outstanding || ''} onChange={e => updateLoan(loan.id, 'outstanding', Number(e.target.value))} className="bg-muted border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Interest Rate (%)</label>
                  <Input type="number" step="0.1" value={loan.interestRate || ''} onChange={e => updateLoan(loan.id, 'interestRate', Number(e.target.value))} className="bg-muted border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tenure (months)</label>
                  <Input type="number" value={loan.tenureMonths || ''} onChange={e => updateLoan(loan.id, 'tenureMonths', Number(e.target.value))} className="bg-muted border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Lender</label>
                  <Input value={loan.lender} onChange={e => updateLoan(loan.id, 'lender', e.target.value)} className="bg-muted border-border" />
                </div>
              </div>
              {loan.emi > 0 && (
                <p className="text-xs text-primary">Calculated EMI: ₹{Math.round(loan.emi).toLocaleString()}/mo</p>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addLoan} className="w-full border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary">
            <Plus className="w-4 h-4 mr-2" /> Add Loan
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-elevated p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <h2 className="text-2xl font-bold font-display mb-1">{steps[step].title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{steps[step].subtitle}</p>

        {steps[step].content}

        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? 'Saving...' : 'View Dashboard'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
