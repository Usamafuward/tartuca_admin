import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Search, 
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { fetchReservations, updateReservationStatus } from '../services/api';
import { ReservationsSkeleton } from '../components/common/Skeleton';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await fetchReservations();
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateReservationStatus(id, newStatus);
      setReservations(reservations.map(res => 
        res.id === id ? { ...res, status: newStatus } : res
      ));
    } catch (error) {
      alert('Failed to update reservation status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          dot: 'bg-emerald-400'
        };
      case 'pending':
        return {
          pill: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
          dot: 'bg-amber-400'
        };
      case 'cancelled':
        return {
          pill: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          dot: 'bg-rose-500'
        };
      default:
        return {
          pill: 'bg-slate-800 text-slate-300 border border-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (res.name && res.name.toLowerCase().includes(q)) ||
      (res.email && res.email.toLowerCase().includes(q)) ||
      (res.phone && res.phone.includes(q)) ||
      String(res.id).includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reservations</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage table reservations, guest counts, and booking confirmations.
          </p>
        </div>

        <button
          onClick={loadReservations}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] rounded-lg text-slate-700 dark:text-slate-200 transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-amber-500" : "text-slate-400"} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/[0.07] flex flex-col md:flex-row gap-4 justify-between items-center shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search reservations by name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Reservations' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'cancelled', label: 'Declined' }
          ].map(tab => {
            const count = tab.id === 'all' ? reservations.length : reservations.filter(r => r.status === tab.id).length;
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.04]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-amber-500/30 text-amber-800 dark:text-amber-200 font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Reservation Cards */}
      {loading ? (
        <ReservationsSkeleton count={6} />
      ) : filteredReservations.length === 0 ? (
        <div className="glass-card p-12 rounded-xl border border-slate-200 dark:border-white/[0.07] text-center text-slate-500 shadow-xl">
          <Calendar size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No reservations found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map((res) => {
            const badge = getStatusBadge(res.status);
            return (
              <div 
                key={res.id} 
                className="glass-card p-5 rounded-xl border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between shadow-xl space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-500 dark:text-amber-400">#{res.id}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${badge.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {res.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{res.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-mono text-xs">
                      <Users size={12} className="text-amber-500 dark:text-amber-400" />
                      <span>{res.guests || 2} Guests</span>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#090A0E] p-3 rounded-lg border border-slate-200 dark:border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-amber-500 shrink-0" />
                      <span>{res.date ? new Date(res.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-amber-500 shrink-0" />
                      <span>{res.time || '19:30'}</span>
                    </div>
                    {res.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="font-mono">{res.phone}</span>
                      </div>
                    )}
                    {res.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="font-mono truncate">{res.email}</span>
                      </div>
                    )}
                  </div>

                  {res.special_requests && (
                    <div className="mt-3 p-2 rounded bg-amber-500/5 border border-amber-500/10 text-xs text-amber-800 dark:text-amber-200/80">
                      <p className="font-semibold text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">Note</p>
                      <p className="italic">"{res.special_requests}"</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex gap-2 justify-end">
                  {res.status !== 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'confirmed')}
                      disabled={updatingId === res.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Check size={13} />
                      <span>Confirm</span>
                    </button>
                  )}
                  {res.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'cancelled')}
                      disabled={updatingId === res.id}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <X size={13} />
                      <span>Decline</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reservations;
