import { FinancialProfile, avalancheStrategy, snowballStrategy, RepaymentPlan } from '@/lib/financial-engine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingDown, Snowflake } from 'lucide-react';

function PlanTable({ plans, label }: { plans: RepaymentPlan[]; label: string }) {
  const totalInterest = plans.reduce((s, p) => s + p.totalInterest, 0);
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase">
              <th className="text-left py-3 px-2">#</th>
              <th className="text-left py-3 px-2">Loan</th>
              <th className="text-right py-3 px-2">Months</th>
              <th className="text-right py-3 px-2">Interest</th>
              <th className="text-right py-3 px-2">Total Paid</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.loanId} className="border-b border-border/50">
                <td className="py-3 px-2 text-primary font-bold">{p.order}</td>
                <td className="py-3 px-2 font-medium">{p.loanName}</td>
                <td className="py-3 px-2 text-right text-muted-foreground">{p.monthsToPayoff}</td>
                <td className="py-3 px-2 text-right text-warning">₹{p.totalInterest.toLocaleString()}</td>
                <td className="py-3 px-2 text-right">₹{p.totalPaid.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-right text-sm text-muted-foreground">
        Total interest with {label}: <span className="text-warning font-semibold">₹{totalInterest.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function RepaymentComparison({ profile }: { profile: FinancialProfile }) {
  if (profile.loans.length === 0) return null;
  const avalanche = avalancheStrategy(profile.loans);
  const snowball = snowballStrategy(profile.loans);

  return (
    <div className="bg-gradient-card rounded-2xl p-6 border border-border shadow-card">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Repayment Strategy</h3>
      <Tabs defaultValue="avalanche">
        <TabsList className="bg-muted mb-4">
          <TabsTrigger value="avalanche" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingDown className="w-4 h-4" /> Avalanche
          </TabsTrigger>
          <TabsTrigger value="snowball" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Snowflake className="w-4 h-4" /> Snowball
          </TabsTrigger>
        </TabsList>
        <TabsContent value="avalanche">
          <p className="text-xs text-muted-foreground mb-3">Pay highest interest rate first — saves the most money.</p>
          <PlanTable plans={avalanche} label="Avalanche" />
        </TabsContent>
        <TabsContent value="snowball">
          <p className="text-xs text-muted-foreground mb-3">Pay smallest balance first — builds psychological momentum.</p>
          <PlanTable plans={snowball} label="Snowball" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
