import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/common/Button';
import { ShieldAlert, LogIn, Lock, Mail, UserCheck, Shield, HeartHandshake } from 'lucide-react';

export const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const role = res.user?.role;
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'volunteer') {
        navigate('/volunteer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Helper
  const fillDemoAccount = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const res = await login(demoEmail, demoPassword);
      const role = res.user?.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'volunteer') {
        navigate('/volunteer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {t('auth.loginTitle', 'Welcome Back')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t('auth.loginSubtitle', 'Sign in to access emergency response portals and coordinate emergency operations.')}
          </p>
        </div>

        {/* 1-Click Quick Demo Switcher Card */}
        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-2.5">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>⚡ {t('auth.quickDemo', 'Quick Demo Login')}:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@disasteraid.org', 'admin123')}
              className="p-2 rounded-xl bg-red-950/70 border border-red-600/40 hover:bg-red-900 text-red-200 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <Shield className="w-4 h-4 text-red-400" />
              <span>{t('auth.adminDemo', 'Admin Demo')}</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('volunteer@disasteraid.org', 'volunteer123')}
              className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-600/40 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>{t('auth.volunteerDemo', 'Volunteer Demo')}</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('citizen@disasteraid.org', 'citizen123')}
              className="p-2 rounded-xl bg-blue-950/70 border border-blue-600/40 hover:bg-blue-900 text-blue-200 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>{t('auth.citizenDemo', 'Citizen Demo')}</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@disasteraid.org"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('auth.password', 'Password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={LogIn}
            >
              {t('auth.submitLogin', 'Sign In to Account')}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            {t('auth.noAccount', "Don't have an account yet?")}{' '}
            <Link to="/register" className="text-red-400 hover:text-red-300 font-semibold">
              {t('auth.registerTitle', 'Register as Citizen or Volunteer')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
