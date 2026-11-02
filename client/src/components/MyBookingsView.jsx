import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
  Search, Ticket, Calendar, Clock, AlertCircle, CheckCircle, 
  XCircle, RotateCcw, QrCode, Star, ChevronRight, X 
} from 'lucide-react';

export function MyBookingsView({ initialRef, onOpenPass }) {
  const { user, isAuthenticated } = useAuth();

  const [searchRef, setSearchRef] = useState(initialRef || '');
  const [searchEmail, setSearchEmail] = useState(user?.email || '');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reschedule Modal State
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [selectedNewSlot, setSelectedNewSlot] = useState(null);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [rescheduleMsg, setRescheduleMsg] = useState(null);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Auto-fetch if user is logged in or if initialRef is provided
  useEffect(() => {
    if (initialRef) {
      handleLookup(initialRef, '');
    } else if (isAuthenticated) {
      fetchUserBookings();
    }
  }, [isAuthenticated, initialRef]);

  async function fetchUserBookings() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.bookings.getAll();
      setBookings(res.bookings || []);
    } catch (err) {
      setError(err.message || 'Could not load your bookings');
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(refToUse, emailToUse) {
    const r = (refToUse !== undefined ? refToUse : searchRef).trim();
    const e = (emailToUse !== undefined ? emailToUse : searchEmail).trim();

    if (!r && !e) {
      setError('Please enter a booking reference code or email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.bookings.lookup(r, e);
      setBookings(res.bookings || []);
    } catch (err) {
      setError(err.message || 'No bookings found matching your search');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(booking) {
    if (!window.confirm(`Are you sure you want to cancel reservation ${booking.booking_ref}?`)) {
      return;
    }

    try {
      await api.bookings.updateStatus(booking.id, 'cancelled', booking.booking_ref);
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      alert(`Failed to cancel: ${err.message}`);
    }
  }

  // Handle Reschedule flow
  const openReschedule = (b) => {
    setReschedulingBooking(b);
    setRescheduleDate(b.booking_date);
    setSelectedNewSlot(null);
    setRescheduleMsg(null);
  };

  useEffect(() => {
    async function loadSlots() {
      if (!reschedulingBooking || !rescheduleDate) return;
      setLoadingRescheduleSlots(true);
      try {
        const res = await api.availability.getSlots(reschedulingBooking.service_id, rescheduleDate);
        setRescheduleSlots(res.slots || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRescheduleSlots(false);
      }
    }
    loadSlots();
  }, [reschedulingBooking, rescheduleDate]);

  const submitReschedule = async () => {
    if (!selectedNewSlot) return;
    try {
      await api.bookings.reschedule(
        reschedulingBooking.id,
        rescheduleDate,
        selectedNewSlot.startTime
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === reschedulingBooking.id
            ? {
                ...b,
                booking_date: rescheduleDate,
                start_time: selectedNewSlot.startTime,
                end_time: selectedNewSlot.endTime,
                status: 'confirmed',
              }
            : b
        )
      );
      setReschedulingBooking(null);
    } catch (err) {
      setRescheduleMsg(err.message || 'Reschedule failed');
    }
  };

  // Handle Review submission
  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setReviewSubmitting(true);
    try {
      await api.bookings.addReview(reviewBooking.id, {
        rating: reviewRating,
        comment: reviewComment,
        author_name: user?.name || reviewBooking.customer_name,
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewBooking(null);
        setReviewSuccess(false);
        setReviewComment('');
      }, 1500);
    } catch (err) {
      alert(`Failed to post review: ${err.message}`);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold uppercase tracking-wider border border-brand-500/20">
          <Ticket className="w-3.5 h-3.5" />
          <span>Self-Service Portal</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white">My Reservations & Digital Passes</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Look up any booking by reference number or email address to view QR tickets, reschedule slots, or cancel reservations instantly.
        </p>
      </div>

      {/* Lookup Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl max-w-3xl mx-auto shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
              placeholder="Booking Ref (e.g. NR-72941-A)"
              className="w-full bg-dark-850 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 uppercase font-mono tracking-wider"
            />
          </div>

          <div className="sm:col-span-5 relative">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Or customer email address..."
              className="w-full bg-dark-850 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs shadow-glow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Lookup</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 max-w-3xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Searching reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center space-y-3 glass-card rounded-2xl p-6 max-w-lg mx-auto">
            <Ticket className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Bookings Found</h4>
            <p className="text-xs text-slate-400">
              Try searching with your 8-digit reference code (e.g. <code>NR-72941-A</code>) or your reservation email.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => {
              const isConfirmed = booking.status === 'confirmed';
              const isCompleted = booking.status === 'completed';
              const isCancelled = booking.status === 'cancelled';

              return (
                <div
                  key={booking.id}
                  className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between hover:border-brand-500/30 transition-all"
                >
                  <div className="space-y-3">
                    
                    {/* Top Row: Ref & Status */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20 tracking-wider">
                        {booking.booking_ref}
                      </span>
                      
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        isConfirmed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : isCompleted
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                      }`}>
                        {isConfirmed && <CheckCircle className="w-3 h-3" />}
                        {isCancelled && <XCircle className="w-3 h-3" />}
                        <span>{booking.status}</span>
                      </span>
                    </div>

                    {/* Service Details */}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {booking.category_name}
                      </span>
                      <h4 className="text-base font-bold text-white line-clamp-1">
                        {booking.service_title}
                      </h4>
                    </div>

                    {/* Schedule Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-dark-900/60 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                        <span className="font-semibold">{booking.booking_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                        <span className="font-semibold">{booking.start_time} - {booking.end_time}</span>
                      </div>
                    </div>

                    {/* Guest info */}
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Guest: <strong className="text-slate-200">{booking.customer_name}</strong> ({booking.customer_email})</p>
                      <p>Total: <strong className="text-brand-400">${booking.total_price}</strong></p>
                    </div>

                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    
                    <button
                      onClick={() => onOpenPass(booking)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-brand-400" />
                      <span>Pass / QR</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => openReschedule(booking)}
                            className="px-2.5 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition-colors"
                            title="Reschedule this booking"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span>Reschedule</span>
                          </button>

                          <button
                            onClick={() => handleCancel(booking)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs border border-rose-500/20 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {(isCompleted || isConfirmed) && (
                        <button
                          onClick={() => setReviewBooking(booking)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs border border-amber-500/20 flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 fill-current" />
                          <span>Review</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-dark-900 rounded-3xl p-6 border border-white/10 max-w-md w-full space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-brand-400" />
                Reschedule Reservation
              </h3>
              <button onClick={() => setReschedulingBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleMsg && (
              <p className="p-3 rounded-xl bg-rose-500/10 text-rose-300 text-xs">{rescheduleMsg}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-xs text-white mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Select New Time Slot</label>
                {loadingRescheduleSlots ? (
                  <p className="text-xs text-slate-400 py-3">Checking availability...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-1 max-h-48 overflow-y-auto">
                    {rescheduleSlots.map((slot, i) => (
                      <button
                        key={i}
                        disabled={!slot.available}
                        onClick={() => setSelectedNewSlot(slot)}
                        className={`p-2 rounded-xl text-xs border text-left transition-all ${
                          !slot.available
                            ? 'opacity-40 border-white/5 cursor-not-allowed'
                            : selectedNewSlot?.startTime === slot.startTime
                            ? 'bg-brand-500 text-dark-950 font-bold border-brand-400 shadow-glow'
                            : 'bg-dark-850 border-white/5 text-slate-200 hover:border-brand-500/40'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReschedulingBooking(null)}
                className="w-1/2 py-2.5 rounded-xl bg-dark-850 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={!selectedNewSlot}
                onClick={submitReschedule}
                className="w-1/2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 text-xs font-bold shadow-glow disabled:opacity-40"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-dark-900 rounded-3xl p-6 border border-white/10 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Leave a Verified Review
              </h3>
              <button onClick={() => setReviewBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-300 text-xs text-center space-y-1">
                <p className="font-bold">Thank you for your review!</p>
                <p className="text-slate-400">It is now published on the service page.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-2xl transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Your Experience Feedback</label>
                  <textarea
                    rows="3"
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell other guests about the ambiance, service quality, and setup..."
                    className="w-full bg-dark-850 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 mt-1 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs shadow-glow disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
