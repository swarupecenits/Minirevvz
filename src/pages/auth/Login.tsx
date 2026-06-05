import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { signInAdmin } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { BRAND_NAME } from '../../lib/constants';
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, seller, setSeller } = useStore();
  const navigate = useNavigate();
  if (seller) {
    return <Navigate to="/admin" replace />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signInAdmin(email, password);
      if (result.error) {
        setError(result.error.message || 'Unable to sign in.');
        setIsLoading(false);
        return;
      }

      const user = result.data.user;
      if (user?.email) {
        setSeller({
          email: user.email,
          fullName: user.user_metadata?.full_name || undefined
        });
        navigate('/admin');
      } else {
        // Fallback for simple prototype mode
        const success = login(email, password);
        if (success) {
          navigate('/admin');
        } else {
          setError('Invalid credentials.');
        }
      }
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.');
    }

    setIsLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-zinc-300" />
          </div>
          <h1 className="text-3xl font-display font-bold text-zinc-100 mb-2">
            Seller Login
          </h1>
          <p className="text-zinc-400">Manage your {BRAND_NAME} store</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel p-8 rounded-3xl space-y-6">
          
          {error &&
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          }

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
              placeholder="admin@minirevvz.com" />
            
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all pr-12"
                placeholder="••••••••" />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                
                {showPassword ?
                <EyeOff className="w-5 h-5" /> :

                <Eye className="w-5 h-5" />
                }
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}>
            
            Sign In
          </Button>

          <div className="text-center text-sm text-zinc-500 pt-4">
            Seller Login Portal
          </div>
        </form>
      </motion.div>
    </div>);

}