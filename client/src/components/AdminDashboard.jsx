import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
  Shield, DollarSign, Calendar, Users, Layers, CheckCircle2, 
  XCircle, Clock, Search, Plus, Edit2, Trash2, RotateCcw, 
  Sparkles, AlertCircle, ArrowUpRight, QrCode, X 
} from 'lucide-react';

export function AdminDashboard({ onOpenPass }) {
  const { user, isAdmin, quickLogin } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState('bookings'); // 'bookings' | 'services'
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state for bookings table
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    title: '',
    category_id: 1,
    tag: '',
    description: '',
    price: 90,
    duration_min: 60,
    capacity: 2,
    image_url: '',
    highlights: '',
  });

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, statusFilter, searchQuery]);

  async function loadAdminData() {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, bookingsRes, servicesRes, categoriesRes] = await Promise.all([
        api.admin.getStats(),
        api.bookings.getAll({ status: statusFilter, search: searchQuery }),
        api.services.getAll({ activeOnly: 'false' }),
        api.categories.getAll(),
      ]);

      setStats(statsRes);
      setBookings(bookingsRes.bookings || []);
      setServices(servicesRes.services || []);
      setCategories(categoriesRes.categories || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(bookingId, newStatus) {
    try {
      await api.bookings.updateStatus(bookingId, newStatus);
      loadAdminData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  }

  async function handleToggleServiceActive(service) {
    try {
      await api.services.update(service.id, { active: service.active ? 0 : 1 });
      loadAdminData();
    } catch (err) {
      alert(`Failed to update service: ${err.message}`);
    }
  }

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceFormData({
      title: '',
      category_id: categories[0]?.id || 1,
      tag: 'New',
      description: '',
      price: 95,
      duration_min: 60,
      capacity: 1,
      image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
      highlights: 'High-speed setup, Refreshment bar, Private entrance',
    });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (svc) => {
    setEditingService(svc);
    setServiceFormData({
      title: svc.title,
      category_id: svc.category_id,
      tag: svc.tag || '',
      description: svc.description,
      price: svc.price,
      duration_min: svc.duration_min,
      capacity: svc.capacity,
      image_url: svc.image_url,
      highlights: Array.isArray(svc.highlights) ? svc.highlights.join(', ') : '',
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const highlightsArray = serviceFormData.highlights
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...serviceFormData,
        price: parseFloat(serviceFormData.price),
        duration_min: parseInt(serviceFormData.duration_min),
        capacity: parseInt(serviceFormData.capacity),
        highlights: highlightsArray,
      };

      if (editingService) {
        await api.services.update(editingService.id, payload);
      } else {
        await api.services.create(payload);
      }

      setIsServiceModalOpen(false);
      loadAdminData();
    } catch (err) {
      alert(`Save service failed: ${err.message}`);
    }
  };

  // If user is not admin, show instant switch helper
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto shadow-glow">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Admin Command Center</h3>
          <p className="text-sm text-slate-400">
            You are currently browsing in non-admin mode. Click below to immediately switch to the pre-configured Demo Administrator account.
          </p>
        </div>

        <button
          onClick={() => quickLogin('admin')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-dark-950 font-bold text-sm shadow-glow flex items-center gap-2 mx-auto transition-all"
        >
          <span>👑 1-Click Switch to Admin (Elena)</span>
        </button>
      </div>
    );
  }

  const metrics = stats?.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider border border-brand-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Operational Center</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-1">Admin Dashboard</h2>
          <p className="text-xs text-slate-400">Live SQLite telemetry, bookings control, and service catalog manager.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-dark-900 p-1.5 rounded-xl border border-white/5 self-start">
          <button
            onClick={() => setActiveAdminTab('bookings')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeAdminTab === 'bookings'
                ? 'bg-brand-500 text-dark-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reservations ({metrics?.totalBookings || 0})
          </button>
          <button
            onClick={() => setActiveAdminTab('services')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeAdminTab === 'services'
                ? 'bg-brand-500 text-dark-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Services ({services.length})
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">${metrics.totalRevenue}</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% Zero-credential SQLite
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Total Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.totalBookings}</p>
            <p className="text-[11px] text-slate-400">
              {metrics.confirmedBookings} confirmed • {metrics.completedBookings} done
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Today's Schedule</span>
              <div className="w-8 h-8 rounded-lg bg-accent-500/10 text-accent-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.bookingsToday}</p>
            <p className="text-[11px] text-slate-400">Active sessions today</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Active Services</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.totalServices}</p>
            <p className="text-[11px] text-slate-400">Across 4 distinct categories</p>
          </div>

        </div>
      )}

      {/* TAB 1: BOOKINGS MANAGEMENT */}
      {activeAdminTab === 'bookings' && (
        <div className="space-y-4">
          
          {/* Controls bar */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-brand-500 text-dark-950 font-bold shadow-glow'
                      : 'bg-dark-850 text-slate-300 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest, ref, or service..."
                className="w-full bg-dark-850 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

          </div>

          {/* Bookings Table */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-900/90 text-slate-400 uppercase font-semibold border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Experience</th>
                    <th className="px-5 py-3.5">Guest Info</th>
                    <th className="px-5 py-3.5">Date & Slot</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading bookings table...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No bookings matching filters.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-brand-400 whitespace-nowrap">
                          {b.booking_ref}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{b.service_title}</p>
                          <p className="text-[10px] text-slate-400">{b.category_name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-200">{b.customer_name}</p>
                          <p className="text-[10px] text-slate-400">{b.customer_email}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-medium text-white">{b.booking_date}</p>
                          <p className="text-[10px] text-brand-400">{b.start_time} - {b.end_time}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                          ${b.total_price}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : b.status === 'completed'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenPass(b)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                              title="View Pass & QR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {b.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(b.id, 'completed')}
                                  className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleStatusChange(b.id, 'cancelled')}
                                  className="px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold border border-rose-500/20"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {b.status === 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(b.id, 'confirmed')}
                                className="px-2 py-1 rounded-md bg-dark-850 hover:bg-dark-800 text-slate-300 text-[10px] font-semibold border border-white/10"
                              >
                                Re-confirm
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SERVICES MANAGEMENT */}
      {activeAdminTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Service Offerings</h3>
            <button
              onClick={openAddServiceModal}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs shadow-glow flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-brand-400 font-semibold uppercase">{svc.category_name}</span>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{svc.title}</h4>
                    </div>
                    <span className="text-base font-extrabold text-white">${svc.price}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{svc.description}</p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span>{svc.duration_min} min</span>
                    <span>•</span>
                    <span>Capacity: {svc.capacity}</span>
                    <span>•</span>
                    <span className={svc.active ? 'text-emerald-400' : 'text-slate-500'}>
                      {svc.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleServiceActive(svc)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                      svc.active
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    }`}
                  >
                    {svc.active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => openEditServiceModal(svc)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-dark-900 rounded-3xl p-6 border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingService ? 'Edit Experience' : 'Create New Experience'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Category</label>
                <select
                  value={serviceFormData.category_id}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, category_id: Number(e.target.value) })}
                  className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300">Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.title}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                  className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                  placeholder="e.g. Executive Glass Boardroom"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                    className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={serviceFormData.duration_min}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, duration_min: e.target.value })}
                    className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300">Capacity (Persons)</label>
                  <input
                    type="number"
                    required
                    value={serviceFormData.capacity}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, capacity: e.target.value })}
                    className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Badge Tag (Optional)</label>
                  <input
                    type="text"
                    value={serviceFormData.tag}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, tag: e.target.value })}
                    className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                    placeholder="e.g. Bestseller, Signature"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">Image URL</label>
                <input
                  type="url"
                  required
                  value={serviceFormData.image_url}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, image_url: e.target.value })}
                  className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Description</label>
                <textarea
                  rows="3"
                  required
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Highlights (comma separated)</label>
                <input
                  type="text"
                  value={serviceFormData.highlights}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, highlights: e.target.value })}
                  className="w-full bg-dark-850 border border-white/10 rounded-xl p-2.5 text-white mt-1"
                  placeholder="Private Shower, Free Wi-Fi, Fresh Towels"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold shadow-glow mt-2"
              >
                {editingService ? 'Save Changes' : 'Create Experience'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
