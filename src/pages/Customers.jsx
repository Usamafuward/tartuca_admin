import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  CalendarDays, 
  Star, 
  Eye, 
  X, 
  TrendingUp, 
  UtensilsCrossed,
  Calendar,
  DollarSign,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { fetchCustomers, fetchCustomerDetails } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import CustomSelect from '../components/common/CustomSelect';
import UserAvatar from '../components/common/UserAvatar';

const Customers = () => {
  const { formatPrice, currencySymbol } = useSettings();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'frequent' | 'high_value' | 'has_reservations'
  const [sortBy, setSortBy] = useState('spent_desc'); // 'spent_desc' | 'orders_desc' | 'name_asc' | 'recent'
  
  // Selected Customer Modal / Drawer State (View-Only)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'reservations' | 'reviews' | 'contact'

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedCustomerId) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [selectedCustomerId]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const data = await fetchCustomers(token);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCustomerDetails = async (customerId) => {
    setSelectedCustomerId(customerId);
    setDetailsLoading(true);
    setActiveTab('orders');

    try {
      const token = localStorage.getItem('adminToken');
      const details = await fetchCustomerDetails(token, customerId);
      setCustomerDetails(details);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // High-level customer KPIs
  const stats = useMemo(() => {
    const totalCount = customers.length;
    const activeDiners = customers.filter(c => c.orders_count > 0).length;
    const totalSpent = customers.reduce((acc, c) => acc + (c.total_spent || 0), 0);
    const avgSpend = activeDiners > 0 ? (totalSpent / activeDiners) : 0;
    return {
      totalCount,
      activeDiners,
      totalSpent,
      avgSpend
    };
  }, [customers]);

  // Filtered and Sorted Customers
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.full_name?.toLowerCase().includes(q) || 
        c.email?.toLowerCase().includes(q) || 
        c.phone?.toLowerCase().includes(q) || 
        c.address?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === 'frequent') return c.orders_count >= 2;
      if (filterType === 'high_value') return c.total_spent >= 100;
      if (filterType === 'has_reservations') return c.reservations_count > 0;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'spent_desc') return (b.total_spent || 0) - (a.total_spent || 0);
      if (sortBy === 'orders_desc') return (b.orders_count || 0) - (a.orders_count || 0);
      if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
      if (sortBy === 'recent') return (b.id || 0) - (a.id || 0);
      return 0;
    });

    return result;
  }, [customers, searchQuery, filterType, sortBy]);

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'CU';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarBg = (id) => {
    const colors = [
      'bg-amber-500/15 text-amber-500 border-amber-500/30',
      'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      'bg-rose-500/15 text-rose-400 border-rose-500/30',
      'bg-purple-500/15 text-purple-400 border-purple-500/30'
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Customer Relationship Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse registered diners, order histories, table reservations, lifetime spend, and delivery details.
          </p>
        </div>

        <button 
          onClick={loadCustomers}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
          title="Refresh customer data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Customers</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalCount}</p>
            <span className="text-[10px] text-amber-400 font-medium">All registered accounts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Ordering Diners</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{stats.activeDiners}</p>
            <span className="text-[10px] text-slate-400">Placed 1+ orders</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Customer LTV</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono tnum">{formatPrice(stats.totalSpent)}</p>
            <span className="text-[10px] text-slate-400">Cumulative revenue</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Spend / Diner</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono tnum">{formatPrice(stats.avgSpend)}</p>
            <span className="text-[10px] text-slate-400">Per active account</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-4 border border-white/[0.08] space-y-3 relative z-30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-20">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by customer name, email, phone number, or Colombo address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Sort Selector using CustomSelect */}
          <div className="flex items-center gap-2 shrink-0 relative z-30">
            <span className="text-xs text-slate-400 font-medium">Sort:</span>
            <CustomSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target ? e.target.value : e)}
              options={[
                { value: 'spent_desc', label: 'Highest Spend' },
                { value: 'orders_desc', label: 'Most Orders' },
                { value: 'name_asc', label: 'Name (A-Z)' },
                { value: 'recent', label: 'Newest Registered' }
              ]}
              size="sm"
              width="w-44"
              align="right"
            />
          </div>
        </div>

        {/* Mobile Filter Selector using CustomSelect */}
        <div className="sm:hidden flex items-center gap-2 pt-1 relative z-10">
          <span className="text-xs text-slate-400 font-medium shrink-0">Filter:</span>
          <CustomSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target ? e.target.value : e)}
            options={[
              { value: 'all', label: `All Customers (${customers.length})` },
              { value: 'frequent', label: 'Frequent Diners (2+ Orders)' },
              { value: 'high_value', label: 'High Value (Top LTV)' },
              { value: 'has_reservations', label: 'Has Table Reservations' }
            ]}
            size="sm"
            width="w-full"
          />
        </div>

        {/* Filter Pills (Desktop / Tablet) */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
          {[
            { id: 'all', label: `All (${customers.length})` },
            { id: 'frequent', label: 'Frequent Diners (2+ Orders)' },
            { id: 'high_value', label: 'High Value (Top LTV)' },
            { id: 'has_reservations', label: 'Has Table Reservations' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                filterType === f.id
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/20'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List Table */}
      <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0D13] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4 text-center">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4 text-center">Bookings</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-normal">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-amber-500" />
                      <p className="text-xs">Loading customer directory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <Users size={32} className="opacity-30 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No customers found</p>
                    <p className="text-xs text-slate-500 mt-1">Try modifying your search query or filter</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const initials = getInitials(cust.full_name);
                  const avatarClass = getAvatarBg(cust.id);
                  return (
                    <tr 
                      key={cust.id} 
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => openCustomerDetails(cust.id)}
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            src={cust.profile_picture} 
                            name={cust.full_name} 
                            id={cust.id} 
                            size="md" 
                            rounded="rounded-xl" 
                          />
                          <div>
                            <p className="font-bold text-white group-hover:text-amber-400 transition-colors">
                              {cust.full_name}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: #{cust.id} • Registered {cust.created_at ? new Date(cust.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Recently'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-300 font-medium flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-500 shrink-0" />
                            <span className="truncate max-w-[180px]">{cust.email}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                            <Phone size={11} className="text-slate-500 shrink-0" />
                            <span>{cust.phone || 'No phone provided'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                          cust.orders_count > 0 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {cust.orders_count} {cust.orders_count === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-100 tnum">
                        {formatPrice(cust.total_spent)}
                      </td>

                      {/* Bookings */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
                          cust.reservations_count > 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'text-slate-500'
                        }`}>
                          {cust.reservations_count}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCustomerDetails(cust.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-semibold text-[11px] transition-all border border-amber-500/25 inline-flex items-center gap-1.5"
                        >
                          <Eye size={13} />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomerId && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-[100] animate-in fade-in duration-200">
          <div className="glass-card-elevated rounded-3xl overflow-hidden border border-white/10 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl bg-[#0B0D13]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/[0.08] flex justify-between items-start bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <UserAvatar 
                  src={customerDetails?.customer?.profile_picture} 
                  name={customerDetails?.customer?.full_name} 
                  id={selectedCustomerId} 
                  size="xl" 
                  rounded="rounded-2xl" 
                  className="border-2 shadow-xl" 
                />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-white">
                      {customerDetails?.customer?.full_name || 'Customer Profile'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Verified Diner
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                    <span>{customerDetails?.customer?.email}</span>
                    <span>•</span>
                    <span className="font-mono">{customerDetails?.customer?.phone || 'No phone'}</span>
                    {customerDetails?.customer?.address && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin size={12} className="text-amber-500 shrink-0" />
                          <span>{customerDetails.customer.address}</span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCustomerId(null)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                title="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics Ribbon */}
            {customerDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06] bg-black/40 border-b border-white/[0.06] text-xs">
                <div className="p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Spent</span>
                  <span className="font-mono text-base font-bold text-amber-400 tnum">
                    {formatPrice(customerDetails.metrics?.total_spent || 0)}
                  </span>
                </div>
                <div className="p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Orders</span>
                  <span className="font-mono text-base font-bold text-white">
                    {customerDetails.metrics?.total_orders || 0}
                  </span>
                </div>
                <div className="p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Avg Order Value</span>
                  <span className="font-mono text-base font-bold text-cyan-400 tnum">
                    {formatPrice(customerDetails.metrics?.avg_order_value || 0)}
                  </span>
                </div>
                <div className="p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Reservations</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {customerDetails.metrics?.reservations_count || 0}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/[0.08] px-6 bg-white/[0.01]">
              {[
                { id: 'orders', label: `Orders (${customerDetails?.orders?.length || 0})`, icon: ShoppingBag },
                { id: 'reservations', label: `Table Bookings (${customerDetails?.reservations?.length || 0})`, icon: CalendarDays },
                { id: 'reviews', label: `Reviews (${customerDetails?.reviews?.length || 0})`, icon: Star },
                { id: 'contact', label: 'Delivery & Contact', icon: MapPin }
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                      activeTab === t.id
                        ? 'border-amber-500 text-amber-400 bg-amber-500/[0.04]'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {detailsLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw size={24} className="animate-spin text-amber-500 mx-auto mb-2" />
                  <p className="text-xs">Fetching customer record & history...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: ORDERS */}
                  {activeTab === 'orders' && (
                    <div className="space-y-4">
                      {customerDetails?.orders?.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs">
                          <ShoppingBag size={32} className="opacity-30 mx-auto mb-2" />
                          <p>No orders recorded for this customer yet.</p>
                        </div>
                      ) : (
                        customerDetails.orders.map((ord) => (
                          <div 
                            key={ord.id} 
                            className="glass-card rounded-2xl p-4 border border-white/[0.08] space-y-3 hover:border-amber-500/30 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-amber-400 text-sm">
                                  Order #{ord.id}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  ord.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                  ord.status === 'cooking' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                                  ord.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                                  'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                }`}>
                                  {ord.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs font-mono">
                                <span className="text-slate-400">
                                  {ord.created_at ? new Date(ord.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                                </span>
                                <span className="text-white font-bold text-sm tnum">
                                  {formatPrice(ord.total_amount)}
                                </span>
                              </div>
                            </div>

                            {/* Order Items List */}
                            <div className="space-y-1.5 pt-1">
                              {ord.items?.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs py-1 text-slate-300">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded bg-white/[0.06] text-amber-400 font-mono font-bold flex items-center justify-center text-[10px]">
                                      {it.quantity}x
                                    </span>
                                    <span>{it.name}</span>
                                  </div>
                                  <span className="font-mono text-slate-400 tnum">
                                    {formatPrice(it.total_price)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {ord.delivery_address && (
                              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-white/[0.04]">
                                <MapPin size={12} className="text-amber-400/80 shrink-0" />
                                <span className="truncate">Delivery Address: {ord.delivery_address}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 2: RESERVATIONS */}
                  {activeTab === 'reservations' && (
                    <div className="space-y-3">
                      {customerDetails?.reservations?.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs">
                          <CalendarDays size={32} className="opacity-30 mx-auto mb-2" />
                          <p>No table reservations made by this customer.</p>
                        </div>
                      ) : (
                        customerDetails.reservations.map((res) => (
                          <div 
                            key={res.id} 
                            className="glass-card rounded-2xl p-4 border border-white/[0.08] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                <Calendar size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">
                                  Table Reservation #{res.id} • {res.party_size} {res.party_size === 1 ? 'Guest' : 'Guests'}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                  Date: {res.reservation_date} at {res.reservation_time} {res.occasion ? `• Occasion: ${res.occasion}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              res.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              res.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {res.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 3: REVIEWS */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-3">
                      {customerDetails?.reviews?.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs">
                          <Star size={32} className="opacity-30 mx-auto mb-2" />
                          <p>No published reviews from this customer.</p>
                        </div>
                      ) : (
                        customerDetails.reviews.map((rev) => (
                          <div 
                            key={rev.id} 
                            className="glass-card rounded-2xl p-4 border border-white/[0.08] space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} 
                                  />
                                ))}
                                <span className="text-xs font-mono font-bold text-white ml-2">{rev.rating}/5</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">
                                {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 italic leading-relaxed">
                              "{rev.comment}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 4: CONTACT & DETAILS (VIEW ONLY) */}
                  {activeTab === 'contact' && (
                    <div className="space-y-4">
                      <div className="glass-card rounded-2xl p-5 border border-white/[0.08] space-y-5 text-xs">
                        <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-400" />
                            <h3 className="font-bold text-white text-sm">Customer Profile & Delivery Details</h3>
                          </div>
                          <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                            <Eye size={12} />
                            <span>View Only</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">   
                          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="text-slate-500 text-[11px] font-medium block">Full Name</span>
                            <p className="font-bold text-white text-sm mt-0.5">{customerDetails?.customer?.full_name}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="text-slate-500 text-[11px] font-medium block">Email Address</span>
                            <p className="font-mono text-slate-200 text-sm mt-0.5 flex items-center gap-2">
                              <span>{customerDetails?.customer?.email}</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-sans font-semibold border border-emerald-500/20">Verified</span>
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="text-slate-500 text-[11px] font-medium block">Mobile Phone</span>
                            <p className="font-mono text-slate-200 text-sm mt-0.5">{customerDetails?.customer?.phone || 'Not set'}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="text-slate-500 text-[11px] font-medium block">Primary Delivery Address</span>
                            <p className="text-slate-200 text-sm mt-0.5 flex items-start gap-1.5">
                              <MapPin size={14} className="text-amber-400 shrink-0 mt-0.5" />
                              <span>{customerDetails?.customer?.address || 'Colombo, Sri Lanka'}</span>
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="text-slate-500 text-[11px] font-medium block">Account Created</span>
                            <p className="text-slate-200 text-xs mt-0.5">
                              {customerDetails?.customer?.created_at ? new Date(customerDetails.customer.created_at).toLocaleDateString([], { dateStyle: 'long' }) : 'Registered Customer'}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="text-slate-500 text-[11px] font-medium block">Customer Account ID</span>
                            <p className="font-mono text-amber-400 font-bold text-xs mt-0.5">#{customerDetails?.customer?.id}</p>
                          </div>
                        </div>

                        {/* Favorite Dishes summary */}
                        {customerDetails?.metrics?.favorite_dishes?.length > 0 && (
                          <div className="pt-4 border-t border-white/[0.06]">
                            <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider block mb-2">
                              Most Ordered Dishes
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {customerDetails.metrics.favorite_dishes.map((f, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
                                  <UtensilsCrossed size={11} className="text-amber-400" />
                                  <span>{f.dish}</span>
                                  <span className="text-[10px] font-mono text-amber-400 font-bold">({f.count}x)</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-white/[0.08] flex items-center justify-between bg-black/40 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Customer Account #{selectedCustomerId}
              </span>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-300 font-medium transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Customers;
