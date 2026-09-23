import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Save, 
  LogOut, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Store, 
  Sliders, 
  ShieldCheck, 
  ShieldAlert,
  UserCog,
  Clock,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Palette,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { createAdmin, fetchRestaurantSettings, updateRestaurantSettings } from '../services/api';
import { SettingsSkeleton } from '../components/common/Skeleton';
import CustomSelect from '../components/common/CustomSelect';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const Settings = ({ initialTab = 'preferences' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { refreshSettings } = useSettings();

  const isExplicitAdmin = location.pathname === '/admin-options' || initialTab === 'admin';
  const [activeTab, setActiveTab] = useState(isExplicitAdmin ? 'admin' : 'preferences');

  useEffect(() => {
    if (location.pathname === '/admin-options') {
      setActiveTab('admin');
    } else if (location.pathname === '/settings') {
      setActiveTab('preferences');
    }
  }, [location.pathname]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'admin') {
      navigate('/admin-options');
    } else {
      navigate('/settings');
    }
  };

  const [settings, setSettings] = useState({
    name: 'Tartuca',
    phone: '+94 11 257 4820',
    email: 'info@tartuca.lk',
    currency: 'LKR (Rs.)',
    address: '42 Green Path (Ananda Coomaraswamy Mw), Colombo 07, Sri Lanka',
    opening_hours: 'Mon-Sun: 11:30 AM - 11:00 PM',
    delivery_fee: 350.0,
    min_delivery_time: 25,
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
      setSettingsMessage({ type: 'success', text: 'System preferences saved successfully!' });
      refreshSettings();
    } catch (err) {
      setSettingsMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
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
      setMessage({ type: 'success', text: 'New administrator created successfully!' });
      setNewAdmin({ full_name: '', email: '', password: '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create admin. Email might already be registered.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            {activeTab === 'admin' ? 'Admin Options' : 'System Preferences'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'admin' 
              ? 'Manage administrator accounts, authentication credentials, and security settings' 
              : 'Configure restaurant operational hours, delivery rates, store contact, and currency'}
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-rose-400 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all shadow-sm"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'preferences'
              ? 'bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.03]'
          }`}
        >
          <Sliders size={14} />
          System Preferences
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'admin'
              ? 'bg-cyan-500/15 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.03]'
          }`}
        >
          <ShieldCheck size={14} />
          Admin Options
        </button>
      </div>

      {/* System Preferences Tab View */}
      {activeTab === 'preferences' && (
        <>
          {/* Theme & Appearance */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 md:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Palette size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Theme & Appearance</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize your visual interface. Default applies your system device preference.</p>
                </div>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 w-fit">
                {theme === 'system' ? 'System Theme (Auto)' : theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* System Option */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  theme === 'system'
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                    : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 shadow-2xs">
                    <Monitor size={18} />
                  </div>
                  {theme === 'system' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      Default
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">System (Default)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Syncs automatically with your operating system theme</p>
                </div>
              </button>

              {/* Dark Option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  theme === 'dark'
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                    : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-amber-600 dark:text-amber-400 shadow-2xs">
                    <Moon size={18} />
                  </div>
                  {theme === 'dark' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Dark Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Deep obsidian executive suite for focused management</p>
                </div>
              </button>

              {/* Light Option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  theme === 'light'
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                    : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-amber-600 dark:text-amber-500 shadow-2xs">
                    <Sun size={18} />
                  </div>
                  {theme === 'light' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Light Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High contrast presentation for daytime and well-lit venues</p>
                </div>
              </button>
            </div>
          </div>

          {settingsLoading ? (
            <SettingsSkeleton />
          ) : (
            <div className="glass-card rounded-2xl border border-white/5 p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Store size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Restaurant Information</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Global configuration and customer-facing restaurant details</p>
                  </div>
                </div>
              </div>

              {settingsMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                  settingsMessage.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}>
                  {settingsMessage.type === 'success' ? <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" /> : <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />}
                  <span className="text-xs font-semibold">{settingsMessage.text}</span>
                </div>
              )}
              
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Store size={13} className="text-slate-500" />
                      Restaurant Name
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={settings.name} 
                      onChange={handleSettingsChange}
                      required
                      className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm transition-all" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-500" />
                      Phone Number
                    </label>
                    <input 
                      type="text" 
                      name="phone"
                      value={settings.phone} 
                      onChange={handleSettingsChange}
                      required
                      className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm transition-all font-mono" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-500" />
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={settings.email} 
                      onChange={handleSettingsChange}
                      required
                      className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm transition-all font-mono" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <DollarSign size={13} className="text-slate-500" />
                      Currency
                    </label>
                    <CustomSelect 
                      name="currency"
                      value={settings.currency} 
                      onChange={handleSettingsChange}
                      size="lg"
                      className="!bg-[#08090C] !border-white/10 !text-slate-100"
                      options={[
                        { value: 'LKR (Rs.)', label: 'LKR (Rs.) - Sri Lankan Rupee' },
                        { value: 'USD ($)', label: 'USD ($) - US Dollar' },
                        { value: 'EUR (€)', label: 'EUR (€) - Euro' },
                        { value: 'GBP (£)', label: 'GBP (£) - British Pound' },
                        { value: 'INR (₹)', label: 'INR (₹) - Indian Rupee' }
                      ]}
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-500" />
                    Address
                  </label>
                  <textarea 
                    rows="2" 
                    name="address"
                    value={settings.address} 
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm transition-all"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-500" />
                      Opening Hours
                    </label>
                    <input 
                      type="text" 
                      name="opening_hours"
                      value={settings.opening_hours} 
                      onChange={handleSettingsChange}
                      placeholder="Mon-Sun: 11:30 AM - 11:00 PM"
                      className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm transition-all" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <DollarSign size={13} className="text-slate-500" />
                      Delivery Fee ({settings.currency ? (settings.currency.includes('Rs') ? 'Rs.' : settings.currency.includes('$') ? '$' : settings.currency.includes('€') ? '€' : settings.currency.includes('£') ? '£' : '') : ''})
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="delivery_fee"
                      value={settings.delivery_fee} 
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm transition-all font-mono" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-500" />
                      Estimated Delivery Time (mins)
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        name="min_delivery_time"
                        value={settings.min_delivery_time} 
                        onChange={handleSettingsChange}
                        placeholder="Min (30)"
                        className="w-full px-3 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm transition-all font-mono" 
                      />
                      <span className="text-slate-600 font-bold">-</span>
                      <input 
                        type="number" 
                        name="max_delivery_time"
                        value={settings.max_delivery_time} 
                        onChange={handleSettingsChange}
                        placeholder="Max (45)"
                        className="w-full px-3 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm transition-all font-mono" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingSettings}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-obsidian-950 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-60 text-sm active:scale-[0.98]"
                  >
                    <Save size={16} className="stroke-[2.5]" />
                    {savingSettings ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Admin Options Tab View */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          {/* Active Admin Session Card */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <UserCog size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Current Session & Permissions</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Active logged-in credentials and security privileges</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Session Authenticated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[11px] font-medium text-slate-400">Current Role</span>
                <p className="text-sm font-bold text-white mt-1">Super Administrator</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Full write & execute permissions</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[11px] font-medium text-slate-400">Access Scope</span>
                <p className="text-sm font-bold text-cyan-300 mt-1">Global System</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Orders, Menu, Staff & Billing</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[11px] font-medium text-slate-400">Security Status</span>
                <p className="text-sm font-bold text-emerald-400 mt-1">Protected (JWT)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Encrypted bearer authorization</p>
              </div>
            </div>
          </div>

          {/* Create New Admin Form */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Create New Admin</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Add an administrator account to manage this portal</p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}>
                {message.type === 'success' ? <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" /> : <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />}
                <span className="text-xs font-semibold">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    name="full_name"
                    value={newAdmin.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-sm transition-all" 
                    placeholder="Admin Name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={newAdmin.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-sm transition-all font-mono" 
                    placeholder="new.admin@tartuca.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={newAdmin.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-sm transition-all font-mono" 
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-70 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
                >
                  <UserPlus size={16} />
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
