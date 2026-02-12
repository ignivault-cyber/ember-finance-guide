import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Brain, TrendingUp, Calculator, BarChart3, Zap } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Smart algorithms assess your complete financial picture.' },
  { icon: Calculator, title: 'EMI Calculator', desc: 'Accurate EMI, interest, and tenure calculations.' },
  { icon: TrendingUp, title: 'Repayment Strategies', desc: 'Avalanche & snowball methods compared side by side.' },
  { icon: Zap, title: 'Scenario Simulator', desc: 'What happens if you lose income or rates spike?' },
  { icon: BarChart3, title: 'Health Score', desc: 'A single number that captures your financial wellness.' },
  { icon: Shield, title: 'Risk Alerts', desc: 'Proactive warnings before problems become crises.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container max-w-6xl mx-auto flex items-center justify-between py-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold font-display text-base">₹</span>
          </div>
          <span className="font-display font-bold text-xl">LoanWise</span>
        </div>
        <div className="flex gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="container max-w-6xl mx-auto px-4 pt-20 pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
            <Zap className="w-3.5 h-3.5" /> AI-Powered Financial Health Platform
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-tight mb-6">
            Master Your
            <span className="text-gradient-primary block">Loan Repayment</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Your digital financial advisor that analyzes debt, optimizes repayment, and forecasts risks — so you can become debt-free faster.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={user ? "/onboarding" : "/auth"}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base px-8">
                Check Your Financial Health <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary text-base px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-12">
          Everything you need to <span className="text-gradient-primary">take control</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-gradient-card rounded-2xl p-6 border border-border shadow-card hover:shadow-glow transition-shadow group"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container max-w-6xl mx-auto px-4 pb-24 text-center">
        <div className="bg-gradient-card rounded-3xl p-12 border border-border shadow-elevated">
          <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">Ready to become debt-free?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Enter your financial details and get instant, actionable insights.</p>
          <Link to={user ? "/onboarding" : "/auth"}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base px-8">
              Start Now — It's Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>⚠️ This platform provides financial analysis tools, not certified financial advice.</p>
          <p className="mt-2">© 2026 LoanWise. Built for smarter debt management.</p>
        </div>
      </footer>
    </div>
  );
}
