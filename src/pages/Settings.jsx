import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { createAdmin } from '../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const [newAdmin, setNewAdmin] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const token = localStorage.getItem('adminToken');
    
    try {
      await createAdmin(token, newAdmin);
      setMessage({ type: 'success', text: 'New admin created successfully!' });
      setNewAdmin({ full_name: '', email: '', password: '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create admin. Email might be taken.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Settings</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Restaurant Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-lg font-bold text-dark mb-6">Restaurant Information</h2>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Restaurant Name</label>
              <input type="text" defaultValue="Tartuca" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input type="text" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" defaultValue="admin@tartuca.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea rows="3" defaultValue="123 Pizza Street, Foodville, FV 12345" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="button" className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Create New Admin */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
          <UserPlus size={24} className="text-primary" />
          Create New Admin
        </h2>

        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                name="full_name"
                value={newAdmin.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                placeholder="Admin Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={newAdmin.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                placeholder="new.admin@tartuca.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                name="password"
                value={newAdmin.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <UserPlus size={18} />
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
