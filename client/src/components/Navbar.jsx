import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Shield, Ticket, User, LogOut, Sparkles, ChevronDown, Menu, X } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenPassLookup }) {
  const { user, isAuthenticated, isAdmin, quickLogin, logout } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    setShowDemoMenu(false);
    await quickLogin(role);
    if (role === 'admin') {
      setActiveTab('admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-amber-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
            <Calendar className="w-6 h-6 text-dark-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
                Nova<span className="text-brand-400">Reserve</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Curated Spaces & Appointments</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-900/90 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-brand-500 text-dark-950 shadow-glow font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Explore & Book
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'my-bookings'
                ? 'bg-brand-500 text-dark-950 shadow-glow font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Ticket className="w-4 h-4" />
            My Bookings & Pass
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-brand-500 text-dark-950 shadow-glow font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin Command
            {isAdmin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>
        </nav>

        {/* Action Controls & Auth */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Quick Demo Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-2 transition-colors"
              title="One-click switch between demo roles"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Role: <strong className="text-white capitalize">{user ? user.role : 'Guest'}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-dark-900 border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  1-Click Role Switcher
                </p>
                <button
                  onClick={() => handleDemoSwitch('admin')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-brand-500/10 hover:text-brand-300 flex items-center justify-between text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span>👑</span>
                    <span>Admin (Elena)</span>
                  </span>
                  <span className="text-[10px] text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">Full Access</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch('customer')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center justify-between text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span>👤</span>
                    <span>Customer (Marcus)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">Client</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile or Login */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-brand-500/30 object-cover"
              />
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-slate-400 text-[10px] truncate max-w-[120px]">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-dark-900 border border-white/10 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-dark-900 border-b border-white/10 space-y-3">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                activeTab === 'explore' ? 'bg-brand-500 text-dark-950 font-semibold' : 'text-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Explore & Book
            </button>
            <button
              onClick={() => { setActiveTab('my-bookings'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                activeTab === 'my-bookings' ? 'bg-brand-500 text-dark-950 font-semibold' : 'text-slate-300'
              }`}
            >
              <Ticket className="w-4 h-4" />
              My Bookings & Pass
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                activeTab === 'admin' ? 'bg-brand-500 text-dark-950 font-semibold' : 'text-slate-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Command
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDemoSwitch('admin')}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20"
              >
                👑 Demo Admin
              </button>
              <button
                onClick={() => handleDemoSwitch('customer')}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-slate-300 border border-white/10"
              >
                👤 Demo Customer
              </button>
            </div>
            {isAuthenticated ? (
              <button onClick={logout} className="text-xs text-rose-400 font-medium">Log out</button>
            ) : (
              <button onClick={onOpenAuth} className="text-xs text-brand-400 font-semibold">Sign In</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
