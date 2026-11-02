import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, CheckCircle2, Copy, Check, Printer, Calendar, Clock, MapPin, User, Ticket } from 'lucide-react';

export function BookingPassModal({ booking, onClose, onViewMyBookings }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (booking?.booking_ref) {
      QRCode.toDataURL(
        `NOVARESERVE://PASS/${booking.booking_ref}?date=${booking.booking_date}&service=${encodeURIComponent(booking.service_title)}`,
        {
          width: 240,
          margin: 1,
          color: {
            dark: '#070a0f',
            light: '#ffffff',
          },
        }
      ).then(setQrDataUrl).catch(console.error);
    }
  }, [booking]);

  if (!booking) return null;

  const copyRef = () => {
    navigator.clipboard.writeText(booking.booking_ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg glass-card bg-dark-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-dark-950/70 hover:bg-dark-950 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Celebration Header */}
          <div className="text-center space-y-1.5 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Reservation Confirmed!</h3>
            <p className="text-xs text-slate-400">
              Your pass has been generated and slot is locked in real-time.
            </p>
          </div>

          {/* Printable Ticket Container */}
          <div id="printable-pass" className="rounded-3xl bg-dark-950 border border-white/10 overflow-hidden shadow-2xl relative">
            
            {/* Ticket Header */}
            <div className="p-5 bg-gradient-to-r from-dark-850 to-dark-900 border-b border-dashed border-white/15 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wider uppercase">NovaReserve</span>
                  <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.2 rounded font-semibold">PASS</span>
                </div>
                <h4 className="text-sm font-extrabold text-brand-400 mt-1 line-clamp-1">
                  {booking.service_title}
                </h4>
              </div>

              {/* Status pill */}
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                booking.status === 'confirmed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/10 text-slate-300'
              }`}>
                {booking.status}
              </span>
            </div>

            {/* Perforated Divider Visual Notches */}
            <div className="relative h-2 bg-dark-950">
              <div className="absolute -left-3 -top-2 w-5 h-5 rounded-full bg-dark-900 border-r border-white/10"></div>
              <div className="absolute -right-3 -top-2 w-5 h-5 rounded-full bg-dark-900 border-l border-white/10"></div>
            </div>

            {/* Ticket Content */}
            <div className="p-5 space-y-4">
              
              {/* Reference Bar */}
              <div className="p-3 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Booking Reference</p>
                  <p className="text-base font-mono font-bold text-white tracking-widest">{booking.booking_ref}</p>
                </div>
                <button
                  onClick={copyRef}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Timing & Location Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-400" /> Date
                  </span>
                  <p className="font-bold text-white">{booking.booking_date}</p>
                </div>

                <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-400" /> Time Slot
                  </span>
                  <p className="font-bold text-white">{booking.start_time} - {booking.end_time}</p>
                </div>
              </div>

              {/* Guest & Payment details */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Reserved For</span>
                  <span className="font-semibold text-white">{booking.customer_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Contact Email</span>
                  <span className="font-mono text-slate-200">{booking.customer_email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Total Charged</span>
                  <span className="font-bold text-brand-400 text-sm">${booking.total_price}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Payment Status</span>
                  <span className="capitalize text-emerald-400 font-medium">
                    {booking.payment_status === 'paid' ? '✓ Paid Online (Simulated)' : 'Pay at Arrival'}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Code Card */}
              {qrDataUrl && (
                <div className="pt-2 text-center flex flex-col items-center">
                  <div className="p-2.5 rounded-2xl bg-white shadow-xl inline-block">
                    <img src={qrDataUrl} alt="Booking QR Pass" className="w-32 h-32" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-2">
                    SCAN AT ENTRANCE FOR KEYLESS CHECK-IN
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="py-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onViewMyBookings(booking.booking_ref);
              }}
              className="py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 text-xs font-bold shadow-glow flex items-center justify-center gap-1.5 transition-all"
            >
              <Ticket className="w-4 h-4" />
              <span>Go to My Bookings</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
