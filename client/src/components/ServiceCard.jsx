import React from 'react';
import { Clock, Users, Star, ArrowRight, Info } from 'lucide-react';

export function ServiceCard({ service, onBook, onViewDetails }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40">
      
      {/* Media Banner */}
      <div className="relative h-52 w-full overflow-hidden bg-dark-900">
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent" />

        {/* Tag Badge */}
        {service.tag && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-brand-500 text-dark-950 shadow-md">
              {service.tag}
            </span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-900/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{service.avg_rating}</span>
            <span className="text-slate-400 text-[10px]">({service.review_count})</span>
          </div>
        </div>

        {/* Bottom meta inside image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <span className="px-2 py-0.5 rounded-md bg-dark-950/70 backdrop-blur-sm border border-white/5 text-[11px] font-medium text-brand-300">
            {service.category_name}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-dark-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/5 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              {service.duration_min} min
            </span>
            <span className="flex items-center gap-1 bg-dark-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/5 text-[11px]">
              <Users className="w-3 h-3 text-slate-400" />
              Max {service.capacity}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {service.title}
          </h3>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Highlights pills preview */}
          {service.highlights && service.highlights.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {service.highlights.slice(0, 2).map((highlight, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5"
                >
                  ✓ {highlight}
                </span>
              ))}
              {service.highlights.length > 2 && (
                <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                  +{service.highlights.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer / Price & Actions */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-white">${service.price}</span>
              <span className="text-xs text-slate-400">/ session</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(service)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              title="View full specs & reviews"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={() => onBook(service)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-dark-950 font-bold text-xs sm:text-sm shadow-glow flex items-center gap-1.5 transition-all"
            >
              <span>Book Slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
