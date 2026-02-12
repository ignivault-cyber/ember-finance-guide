import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email for a confirmation link!');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-elevated p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold font-display text-base">₹</span>
          </div>
          <span className="font-display font-bold text-xl">LoanWise</span>
        </Link>

        <h2 className="text-2xl font-bold font-display mb-1">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {isLogin ? 'Sign in to access your financial dashboard' : 'Start your journey to financial health'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="pl-10 bg-secondary border-border"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-10 bg-secondary border-border"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 bg-secondary border-border"
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline ml-1 font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
