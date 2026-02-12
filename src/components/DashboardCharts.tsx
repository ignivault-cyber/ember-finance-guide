import { FinancialProfile, totalIncome, totalExpenses, totalEMI, monthlySurplus } from '@/lib/financial-engine';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardCharts({ profile }: { profile: FinancialProfile }) {
  const income = totalIncome(profile);
  const expenses = totalExpenses(profile);
  const emi = totalEMI(profile);
  const surplus = monthlySurplus(profile);

  const pieData = [
    { name: 'Expenses', value: expenses },
    { name: 'EMIs', value: emi },
    { name: 'Surplus', value: Math.max(0, surplus) },
  ];
  const pieColors = ['hsl(215 15% 55%)', 'hsl(174 72% 46%)', 'hsl(152 60% 45%)'];

  const loanData = profile.loans.map(l => ({
    name: l.name.length > 10 ? l.name.slice(0, 10) + '…' : l.name,
    EMI: l.emi,
    Outstanding: l.outstanding / 1000,
    Rate: l.interestRate,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-gradient-card rounded-2xl p-6 border border-border shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Income Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 15% 18%)', borderRadius: '8px', color: 'hsl(210 20% 92%)' }}
              formatter={(value: number) => `₹${value.toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i] }} />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-card rounded-2xl p-6 border border-border shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Loan EMIs</h3>
        {loanData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={loanData}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 15% 18%)', borderRadius: '8px', color: 'hsl(210 20% 92%)' }}
                formatter={(value: number, name: string) => name === 'Outstanding' ? `₹${(value * 1000).toLocaleString()}` : `₹${value.toLocaleString()}`}
              />
              <Bar dataKey="EMI" fill="hsl(174 72% 46%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-12">No loans added yet</p>
        )}
      </div>
    </div>
  );
}
