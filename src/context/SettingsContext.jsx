import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchRestaurantSettings } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const DEFAULT_SETTINGS = {
  name: 'Tartuca',
  phone: '+94 11 257 4820',
  email: 'info@tartuca.lk',
  address: '42 Green Path (Ananda Coomaraswamy Mw), Colombo 07, Sri Lanka',
  opening_hours: 'Mon-Sun: 11:30 AM - 11:00 PM',
  delivery_fee: 350.0,
  min_delivery_time: 25,
  max_delivery_time: 45,
  currency: 'LKR (Rs.)'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchRestaurantSettings();
      if (data && typeof data === 'object') {
        setSettings(prev => ({
          ...prev,
          name: data.name || prev.name,
          phone: data.phone || prev.phone,
          email: data.email || prev.email,
          address: data.address || prev.address,
          opening_hours: data.opening_hours || prev.opening_hours,
          delivery_fee: data.delivery_fee != null ? Number(data.delivery_fee) : prev.delivery_fee,
          min_delivery_time: data.min_delivery_time != null ? Number(data.min_delivery_time) : prev.min_delivery_time,
          max_delivery_time: data.max_delivery_time != null ? Number(data.max_delivery_time) : prev.max_delivery_time,
          currency: data.currency || prev.currency
        }));
      }
    } catch (err) {
      console.warn('Using default restaurant settings in admin:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();

    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener('restaurant_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('restaurant_settings_updated', handleSettingsUpdate);
    };
  }, [loadSettings]);

  // Extract currency symbol e.g. "LKR (Rs.)" -> "Rs.", "USD ($)" -> "$", "EUR (€)" -> "€"
  const currencySymbol = useMemo(() => {
    const curr = settings.currency || '';
    const match = curr.match(/\(([^)]+)\)/);
    if (match && match[1]) return match[1];
    if (curr.includes('Rs') || curr.includes('LKR')) return 'Rs.';
    if (curr.includes('$') || curr.includes('USD')) return '$';
    if (curr.includes('€') || curr.includes('EUR')) return '€';
    if (curr.includes('£') || curr.includes('GBP')) return '£';
    if (curr.includes('₹') || curr.includes('INR')) return '₹';
    return 'Rs.';
  }, [settings.currency]);

  const formatPrice = useCallback((amount) => {
    const num = Number(amount) || 0;
    const formatted = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const space = (currencySymbol.length > 1 && !currencySymbol.endsWith(' ')) ? ' ' : '';
    return `${currencySymbol}${space}${formatted}`;
  }, [currencySymbol]);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
    window.dispatchEvent(new CustomEvent('restaurant_settings_updated'));
  }, [loadSettings]);

  const value = useMemo(() => ({
    settings,
    loading,
    currencySymbol,
    formatPrice,
    refreshSettings
  }), [settings, loading, currencySymbol, formatPrice, refreshSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
