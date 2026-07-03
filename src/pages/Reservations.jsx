import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Mail, Phone, Check, X } from 'lucide-react';
import { fetchReservations } from '../services/api';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
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
          status: res.status || 'Pending' // default status if missing
        }));
        setReservations(mappedReservations);
      } catch (error) {
        console.error('Failed to load reservations:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReservations();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Table Reservations</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((res) => (
          <div key={res.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {res.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-dark">{res.name}</h3>
                  <p className="text-xs text-gray-500">ID: #{res.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                res.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                res.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {res.status}
              </span>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>{res.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>{res.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span>{res.guests} Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span>{res.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span>{res.phone}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {res.status === 'Pending' && (
                <>
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Check size={16} /> Confirm
                  </button>
                  <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <X size={16} /> Decline
                  </button>
                </>
              )}
              {res.status === 'Confirmed' && (
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-dark py-2 rounded-lg text-sm font-semibold transition-colors">
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reservations;
