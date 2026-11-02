import React from 'react';
import { Search, Sparkles, CheckCircle2, Clock, ShieldCheck, Zap } from 'lucide-react';

export function HeroBanner({ searchQuery, setSearchQuery, onQuickBookClick }) {
  return (
    <div className="relative overflow-hidden pt-10 pb-14 border-b border-white/5">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* Editorial Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold tracking-wide uppercase shadow-glow animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Curated Appointments & Private Spaces</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
          <span className="text-slate-400 font-normal">Real-Time Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Reserve Extraordinary Moments,{' '}
          <span className="bg-gradient-to-r from-brand-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            Without the Friction.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-light">
          From soundproof 4K broadcast studios and contrast therapy suites to private executive boardrooms — pick your exact slot, receive an instant digital QR pass, and manage your reservation seamlessly.
        </p>

        {/* Quick Search & Filter Bar */}
        <div className="max-w-xl mx-auto pt-2">
          <div className="relative glass-card rounded-2xl p-2 flex items-center gap-2 shadow-2xl focus-within:border-brand-500/50 transition-all">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-brand-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, podcast studios, sauna, advisory..."
              className="w-full bg-transparent border-none text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-0 py-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs px-2 py-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
              >
                Clear
              </button>
            )}
            <button
              onClick={onQuickBookClick}
              className="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-dark-950 font-bold text-sm shadow-glow items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <Zap className="w-4 h-4 fill-current" />
              Quick Book
            </button>
          </div>
        </div>

        {/* Feature Micro-Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant Slot Conflict Lock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Digital QR Ticket Pass</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent-500" />
            <span>Self-Service Rescheduling</span>
          </div>
        </div>

      </div>
    </div>
  );
}
