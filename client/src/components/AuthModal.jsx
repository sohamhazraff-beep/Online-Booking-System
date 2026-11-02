import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Sparkles, AlertCircle } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { login, register, quickLogin } = useAuth();
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === 'signin') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md glass-card bg-dark-900 rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-white">
            {tab === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h3>
          <p className="text-xs text-slate-400">
            {tab === 'signin'
              ? 'Access your digital passes and reservation history.'
              : 'Join NovaReserve to track your bookings in real time.'}
          </p>
        </div>

        {/* 1-Click Demo Login Shortcuts */}
        <div className="p-3.5 rounded-2xl bg-dark-850 border border-white/5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            ⚡ Quick 1-Click Demo Evaluation
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="px-3 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>👑 Demo Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>👤 Demo Customer</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-dark-850 p-1 border border-white/5">
          <button
            onClick={() => { setTab('signin'); setError(null); }}
            className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signin' ? 'bg-dark-900 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(null); }}
            className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signup' ? 'bg-dark-900 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marcus Thorne"
                  className="w-full bg-dark-850 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-dark-850 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-850 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold shadow-glow flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{tab === 'signin' ? 'Sign In to Account' : 'Create Free Account'}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
