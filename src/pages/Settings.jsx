import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, UserPlus, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { createAdmin, fetchRestaurantSettings, updateRestaurantSettings } from '../services/api';
import { SettingsSkeleton } from '../components/common/Skeleton';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    name: 'Tartuca',
    phone: '+1 (555) 123-4567',
    email: 'admin@tartuca.com',
    currency: 'USD ($)',
    address: '123 Pizza Street, Foodville, FV 12345',
    opening_hours: 'Mon-Sun: 11:00 AM - 10:00 PM',
    delivery_fee: 5.0,
    min_delivery_time: 30,
    max_delivery_time: 45
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchRestaurantSettings();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    const token = localStorage.getItem('adminToken');
    try {
      const updated = await updateRestaurantSettings(token, {
        ...settings,
        delivery_fee: Number(settings.delivery_fee) || 0,
        min_delivery_time: parseInt(settings.min_delivery_time) || 0,
        max_delivery_time: parseInt(settings.max_delivery_time) || 0
      });
      setSettings(prev => ({ ...prev, ...updated }));
      setSettingsMessage({ type: 'success', text: 'Restaurant settings saved successfully!' });
    } catch (err) {
      setSettingsMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSavingSettings(false);
    }
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
      {settingsLoading ? (
        <SettingsSkeleton />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Store size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark">Restaurant Information & Operations</h2>
            <p className="text-sm text-gray-500">Update global restaurant details displayed to customers</p>
          </div>
        </div>

        {settingsMessage && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${settingsMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {settingsMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {settingsMessage.text}
          </div>
        )}
        
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Restaurant Name</label>
              <input 
                type="text" 
                name="name"
                value={settings.name} 
                onChange={handleSettingsChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                type="text" 
                name="phone"
                value={settings.phone} 
                onChange={handleSettingsChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={settings.email} 
                onChange={handleSettingsChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <select 
                name="currency"
                value={settings.currency} 
                onChange={handleSettingsChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea 
              rows="2" 
              name="address"
              value={settings.address} 
              onChange={handleSettingsChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Opening Hours</label>
              <input 
                type="text" 
                name="opening_hours"
                value={settings.opening_hours} 
                onChange={handleSettingsChange}
                placeholder="Mon-Sun: 11:00 AM - 10:00 PM"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Standard Delivery Fee ($)</label>
              <input 
                type="number" 
                step="0.01"
                name="delivery_fee"
                value={settings.delivery_fee} 
                onChange={handleSettingsChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estimated Delivery Time (mins)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  name="min_delivery_time"
                  value={settings.min_delivery_time} 
                  onChange={handleSettingsChange}
                  placeholder="Min (30)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  name="max_delivery_time"
                  value={settings.max_delivery_time} 
                  onChange={handleSettingsChange}
                  placeholder="Max (45)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={savingSettings}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              <Save size={18} />
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
      )}

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
