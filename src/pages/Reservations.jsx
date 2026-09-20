import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Mail, Phone, Check, X, Search, Filter, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchReservations, updateReservationStatus } from '../services/api';
import { useToast } from '../context/ToastContext';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await fetchReservations();
      const mappedReservations = data.map(res => ({
        id: res.id,
        name: res.customer_name,
        date: res.reservation_date,
        time: res.reservation_time,
        guests: res.party_size,
        email: res.customer_email,
        phone: res.customer_phone,
        occasion: res.occasion,
        status: res.status ? res.status.toLowerCase() : 'pending'
      }));
      setReservations(mappedReservations);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      showToast('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateReservationStatus(id, newStatus);
      setReservations(prev => prev.map(res => res.id === id ? { ...res, status: newStatus } : res));
      showToast(`Reservation #${id} ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'cancelled' ? 'declined' : 'updated'}`, 'success');
    } catch (error) {
      console.error('Failed to update reservation status:', error);
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      res.name.toLowerCase().includes(q) ||
      res.email.toLowerCase().includes(q) ||
      res.phone.includes(q) ||
      String(res.id).includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Table Reservations</h1>
        <button
          onClick={loadReservations}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-80">
                ({tab.id === 'all' ? reservations.length : reservations.filter(r => r.status === tab.id).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-400">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No reservations found</p>
          <p className="text-sm">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((res) => (
            <div key={res.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {res.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-dark">{res.name}</h3>
                      <p className="text-xs text-gray-500">ID: #{res.id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {res.status}
                  </span>
                </div>
                
                <div className="space-y-2.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 shrink-0" />
                    <span>{res.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400 shrink-0" />
                    <span>{res.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400 shrink-0" />
                    <span>{res.guests} Guests</span>
                    {res.occasion && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 ml-auto font-medium">
                        {res.occasion}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400 shrink-0" />
                    <span className="truncate">{res.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400 shrink-0" />
                    <span>{res.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                {res.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                      disabled={updatingId === res.id}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Check size={16} /> Confirm
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                      disabled={updatingId === res.id}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <X size={16} /> Decline
                    </button>
                  </>
                )}
                {res.status === 'confirmed' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(res.id, 'completed')}
                      disabled={updatingId === res.id}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} /> Mark Completed
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                      disabled={updatingId === res.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      title="Cancel reservation"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
                {res.status === 'cancelled' && (
                  <button 
                    onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                    disabled={updatingId === res.id}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Re-open & Confirm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reservations;

