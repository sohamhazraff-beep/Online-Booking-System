import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';
import { 
  X, Calendar, Clock, ChevronRight, ChevronLeft, Check, AlertCircle, 
  Sparkles, User, Mail, Phone, Users, ShieldCheck, CreditCard 
} from 'lucide-react';

const SAMPLE_ADD_ONS = [
  { id: 'beverage', name: 'Artisan Cold-Pressed Refreshment Pack', price: 15, desc: 'Fresh electrolyte blend & herbal cold tea' },
  { id: 'media', name: 'Raw Digital Stems & Recording Archive', price: 35, desc: 'Direct multi-track export provided immediately' },
  { id: 'concierge', name: 'Priority White-Glove Check-In', price: 20, desc: 'Dedicated host ready 15 minutes before slot' },
];

export function BookingModal({ service, onClose, onBookingSuccess }) {
  const { user } = useAuth();

  // Booking Flow Steps: 1: Slot, 2: Add-ons, 3: Details & Confirmation
  const [step, setStep] = useState(1);

  // Step 1: Date & Slot State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slotsData, setSlotsData] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);

  // Step 2: Add-Ons State
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  // Step 3: Customer Details State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentOption, setPaymentOption] = useState('paid');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Generate next 7 dates for quick picker
  const upcomingDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayName, formatted };
  });

  // Fetch dynamic availability slots whenever selectedDate or service changes
  useEffect(() => {
    async function fetchSlots() {
      if (!service || !selectedDate) return;
      setLoadingSlots(true);
      setSlotError(null);
      setSelectedSlot(null);

      try {
        const res = await api.availability.getSlots(service.id, selectedDate);
        setSlotsData(res.slots || []);
      } catch (err) {
        setSlotError(err.message || 'Failed to load availability slots');
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [service, selectedDate]);

  if (!service) return null;

  // Pricing calculations
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = Number((service.price + addOnsTotal).toFixed(2));

  const toggleAddOn = (addon) => {
    if (selectedAddOns.some((a) => a.id === addon.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      setSubmitError('Please enter your name and email address');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        service_id: service.id,
        booking_date: selectedDate,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        guests_count: guestsCount,
        special_requests: specialRequests,
        add_ons: selectedAddOns.map((a) => ({ name: a.name, price: a.price })),
        payment_status: paymentOption,
      };

      const res = await api.bookings.create(payload);

      // Trigger celebratory confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#6366f1', '#10b981'],
      });

      onBookingSuccess(res.booking);
    } catch (err) {
      setSubmitError(err.message || 'Failed to confirm booking. Slot may have been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl glass-card bg-dark-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-dark-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Reserve Experience</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-normal">
                  Step {step} of 3
                </span>
              </h3>
              <p className="text-xs text-brand-400 font-medium truncate max-w-xs">{service.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="h-1 bg-dark-800 w-full flex">
          <div className={`h-full bg-brand-500 transition-all duration-300 ${
            step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
          }`} />
        </div>

        {/* Scrollable Step Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* STEP 1: Date & Time Slot Engine */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Rapid Date Selector */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                  <span>1. Choose Date</span>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-dark-800 border border-white/10 rounded-lg text-xs px-2 py-1 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {upcomingDates.map((item) => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        onClick={() => setSelectedDate(item.dateStr)}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-brand-500 text-dark-950 font-bold border-brand-400 shadow-glow'
                            : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-dark-950' : 'text-slate-400'}`}>
                          {item.dayName}
                        </span>
                        <span className="text-xs sm:text-sm font-bold mt-0.5">
                          {item.formatted}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Slots Engine */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    2. Select Time Slot ({service.duration_min} min session)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {slotsData.filter((s) => s.available).length} slots open
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-12 text-center space-y-2 bg-dark-850 rounded-2xl border border-white/5">
                    <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Calculating real-time slot availability...</p>
                  </div>
                ) : slotError ? (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{slotError}</span>
                  </div>
                ) : slotsData.length === 0 ? (
                  <div className="py-8 text-center bg-dark-850 rounded-2xl border border-white/5 text-xs text-slate-400">
                    No operating hours scheduled for this day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {slotsData.map((slot, idx) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      const isAvail = slot.available;

                      return (
                        <button
                          key={idx}
                          disabled={!isAvail}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                            !isAvail
                              ? 'bg-dark-950/40 border-white/5 opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'bg-brand-500/15 border-brand-500 text-white shadow-glow'
                              : 'bg-dark-850 hover:bg-dark-800 border-white/5 text-slate-200 hover:border-brand-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-brand-400" />
                              {slot.startTime}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-brand-500 text-dark-950 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">to {slot.endTime}</span>
                            <span className={isAvail ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                              {isAvail ? (slot.remainingCapacity > 1 ? `${slot.remainingCapacity} spots` : 'Available') : 'Booked'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 2: Add-Ons & Extras */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  Elevate Your Experience
                </h4>
                <p className="text-xs text-slate-400">
                  Optional perks and enhancements tailored for this reservation.
                </p>
              </div>

              <div className="space-y-3">
                {SAMPLE_ADD_ONS.map((addon) => {
                  const isChecked = selectedAddOns.some((a) => a.id === addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isChecked
                          ? 'bg-brand-500/10 border-brand-500/50 text-white'
                          : 'bg-dark-850 hover:bg-dark-800 border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-brand-500 border-brand-500 text-dark-950' : 'border-white/20 bg-dark-900'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-white">{addon.name}</p>
                          <p className="text-[11px] text-slate-400">{addon.desc}</p>
                        </div>
                      </div>

                      <span className="text-sm font-bold text-brand-400 whitespace-nowrap">
                        +${addon.price}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-dark-850/80 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Total:</span>
                <span className="text-sm font-bold text-white">${totalPrice}</span>
              </div>
            </div>
          )}

          {/* STEP 3: Customer Details & Confirmation */}
          {step === 3 && (
            <form onSubmit={handleConfirmBooking} className="space-y-5 animate-in fade-in duration-150">
              
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Guest / User Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Marcus Thorne"
                    className="w-full bg-dark-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-400" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. marcus@example.com"
                    className="w-full bg-dark-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-dark-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Number of Attendees
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={service.capacity || 10}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    className="w-full bg-dark-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Special Notes or Setup Requests (Optional)
                </label>
                <textarea
                  rows="2"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Room temperature preference, specific microphone layout..."
                  className="w-full bg-dark-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Payment Option</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('paid')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentOption === 'paid'
                        ? 'bg-brand-500/10 border-brand-500 text-white'
                        : 'bg-dark-850 border-white/5 text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-brand-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Instant Online Sim</p>
                      <p className="text-[10px] text-slate-400">Auto-confirmed immediately</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption('pay_at_arrival')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentOption === 'pay_at_arrival'
                        ? 'bg-brand-500/10 border-brand-500 text-white'
                        : 'bg-dark-850 border-white/5 text-slate-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Pay at Arrival</p>
                      <p className="text-[10px] text-slate-400">Card or cash in-person</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Final Summary Ticket */}
              <div className="p-4 rounded-2xl bg-dark-950 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Experience ({service.title})</span>
                  <span className="font-semibold text-white">${service.price}</span>
                </div>
                {selectedAddOns.map((a) => (
                  <div key={a.id} className="flex justify-between text-slate-400">
                    <span>+ {a.name}</span>
                    <span>${a.price}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-400">
                  <span>Schedule</span>
                  <span className="font-medium text-white">{selectedDate} @ {selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-brand-400 text-base">${totalPrice}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-dark-950 font-extrabold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Confirm Reservation & Generate Pass</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* Modal Bottom Navigation Buttons */}
        <div className="p-4 bg-dark-950/90 border-t border-white/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              disabled={step === 1 && !selectedSlot}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs shadow-glow flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
}
