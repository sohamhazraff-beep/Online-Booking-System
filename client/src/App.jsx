import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ServiceCard } from './components/ServiceCard';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { BookingModal } from './components/BookingModal';
import { BookingPassModal } from './components/BookingPassModal';
import { AuthModal } from './components/AuthModal';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Sparkles, Calendar, ShieldCheck, Zap, Database, 
  ArrowRight, HeartHandshake, Layers 
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'my-bookings' | 'admin'

  // Data State
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [detailServiceId, setDetailServiceId] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const [passBooking, setPassBooking] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [initialLookupRef, setInitialLookupRef] = useState(null);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.categories.getAll();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Load Services whenever filters change
  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await api.services.getAll(params);
        setServices(res.services || []);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadServices, 150);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  // Handlers
  const handleBookingSuccess = (newBooking) => {
    setBookingService(null);
    setPassBooking(newBooking);
  };

  const handleOpenMyBookingsWithRef = (ref) => {
    setInitialLookupRef(ref);
    setActiveTab('my-bookings');
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPassLookup={() => setActiveTab('my-bookings')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: EXPLORE & BOOK */}
        {activeTab === 'explore' && (
          <div>
            {/* Editorial Hero */}
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onQuickBookClick={() => {
                if (services.length > 0) {
                  setBookingService(services[0]);
                }
              }}
            />

            {/* Catalog Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              
              {/* Category Pills Bar */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                totalCount={services.length}
              />

              {/* Service Cards Grid */}
              {loading ? (
                <div className="py-24 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-400">Loading verified experiences...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="py-20 text-center space-y-3 glass-card rounded-3xl p-8 max-w-md mx-auto">
                  <Layers className="w-12 h-12 text-slate-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No Experiences Found</h3>
                  <p className="text-xs text-slate-400">
                    Try adjusting your search terms or category selection.
                  </p>
                  <button
                    onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                    className="px-4 py-2 rounded-xl bg-brand-500/10 text-brand-400 text-xs font-semibold hover:bg-brand-500/20"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {services.map((svc) => (
                    <ServiceCard
                      key={svc.id}
                      service={svc}
                      onBook={(s) => setBookingService(s)}
                      onViewDetails={(s) => setDetailServiceId(s.id)}
                    />
                  ))}
                </div>
              )}

              {/* Why NovaReserve Feature Guarantee Strip */}
              <div className="pt-16 pb-8">
                <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white">Zero-Config Local SQLite</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        No external cloud credentials, MongoDB strings, or manual environment setup needed. Everything runs locally right from <code>database.sqlite</code>.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white">Dynamic Slot Engine</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Real-time capacity computation locks slots instantly to prevent overlaps and double-bookings.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white">Digital Pass & Self-Service</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Instant digital QR boarding tickets with self-service rescheduling, cancellations, and print-ready passes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: MY BOOKINGS & DIGITAL PASSES */}
        {activeTab === 'my-bookings' && (
          <MyBookingsView
            initialRef={initialLookupRef}
            onOpenPass={(booking) => setPassBooking(booking)}
          />
        )}

        {/* VIEW 3: ADMIN COMMAND CENTER */}
        {activeTab === 'admin' && (
          <AdminDashboard
            onOpenPass={(booking) => setPassBooking(booking)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 bg-dark-950/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">NovaReserve</span>
            <span>—</span>
            <span>Contemporary Online Booking Suite</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('explore')}
              className="hover:text-white transition-colors"
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className="hover:text-white transition-colors"
            >
              Lookup Pass
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-white transition-colors"
            >
              Admin
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Powered by React 18, Express.js & Local SQLite
          </p>
        </div>
      </footer>

      {/* MODALS */}

      {/* Service Detail Modal */}
      {detailServiceId && (
        <ServiceDetailModal
          serviceId={detailServiceId}
          onClose={() => setDetailServiceId(null)}
          onBook={(svc) => {
            setDetailServiceId(null);
            setBookingService(svc);
          }}
        />
      )}

      {/* Interactive 3-Step Booking Modal */}
      {bookingService && (
        <BookingModal
          service={bookingService}
          onClose={() => setBookingService(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Digital QR Booking Pass Modal */}
      {passBooking && (
        <BookingPassModal
          booking={passBooking}
          onClose={() => setPassBooking(null)}
          onViewMyBookings={handleOpenMyBookingsWithRef}
        />
      )}

      {/* Auth / Demo Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

    </div>
  );
}
