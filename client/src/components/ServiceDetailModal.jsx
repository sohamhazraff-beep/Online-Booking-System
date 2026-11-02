import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { X, Clock, Users, Star, CheckCircle, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';

export function ServiceDetailModal({ serviceId, onClose, onBook }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await api.services.getById(serviceId);
        setData(res.service);
      } catch (err) {
        console.error('Failed to load service detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (serviceId) {
      fetchDetail();
    }
  }, [serviceId]);

  if (!serviceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-card bg-dark-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-dark-950/70 hover:bg-dark-950 text-slate-300 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-400">Loading experience details...</p>
          </div>
        ) : data ? (
          <>
            {/* Header Image Banner */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden shrink-0">
              <img
                src={data.image_url}
                alt={data.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

              <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {data.category_name}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                    {data.title}
                  </h2>
                </div>

                <div className="bg-dark-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Standard Rate</p>
                    <p className="text-xl font-black text-brand-400">${data.price}</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-1 text-sm font-bold text-white">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{data.avg_rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Quick Specs Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-dark-850 border border-white/5 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-brand-400" />
                  <div>
                    <p className="text-[11px] text-slate-400">Duration</p>
                    <p className="text-sm font-bold text-white">{data.duration_min} Minutes</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-dark-850 border border-white/5 flex items-center gap-3">
                  <Users className="w-5 h-5 text-brand-400" />
                  <div>
                    <p className="text-[11px] text-slate-400">Capacity</p>
                    <p className="text-sm font-bold text-white">Up to {data.capacity} People</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-dark-850 border border-white/5 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-[11px] text-slate-400">Policy</p>
                    <p className="text-sm font-bold text-white">Free Cancel (24h)</p>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">About this Experience</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {data.description}
                </p>
              </div>

              {/* Included Amenities / Highlights */}
              {data.highlights && data.highlights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">What is Included</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {data.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <CheckCircle className="w-4 h-4 text-brand-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Verified Guest Reviews ({data.reviews?.length || 0})
                  </h4>
                  <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {data.avg_rating} out of 5.0
                  </span>
                </div>

                {data.reviews && data.reviews.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.reviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 rounded-xl bg-dark-850/80 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{rev.author_name}</span>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(rev.rating)].map((_, idx) => (
                              <Star key={idx} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to experience this!</p>
                )}
              </div>

            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 bg-dark-950 border-t border-white/10 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Total Price</p>
                <p className="text-xl font-extrabold text-white">${data.price}</p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onBook(data);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-dark-950 font-bold text-sm shadow-glow flex items-center gap-2 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Select Date & Time Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : null}

      </div>
    </div>
  );
}
