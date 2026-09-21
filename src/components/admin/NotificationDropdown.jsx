import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ShoppingBag, 
  CalendarDays, 
  Star, 
  AlertTriangle, 
  CheckCheck, 
  Trash2, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchOrders, fetchReservations, fetchReviews, fetchMenuItems } from '../../services/api';

const NotificationDropdown = ({ isOpen, onClose, onUnreadCountChange = () => {} }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tartuca_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Fetch real system activities to generate notifications
  const loadNotifications = async () => {
    try {
      const [ordersRes, reservationsRes, reviewsRes, menuRes] = await Promise.allSettled([
        fetchOrders(),
        fetchReservations(),
        fetchReviews(),
        fetchMenuItems()
      ]);

      const items = [];

      // Pending or recent orders
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        const pendingOrders = ordersRes.value.filter(o => o.status === 'pending');
        pendingOrders.slice(0, 5).forEach(order => {
          items.push({
            id: `order-pending-${order.id}`,
            type: 'order',
            title: `New Order #${order.id}`,
            message: `${order.customer_name || 'Guest'} placed an order for $${Number(order.total_amount).toFixed(2)}`,
            timestamp: order.created_at || new Date().toISOString(),
            timeAgo: 'Awaiting confirmation',
            path: '/orders',
            icon: ShoppingBag,
            color: 'amber'
          });
        });
      }

      // Pending table reservations
      if (reservationsRes.status === 'fulfilled' && Array.isArray(reservationsRes.value)) {
        const pendingRes = reservationsRes.value.filter(r => r.status === 'pending');
        pendingRes.slice(0, 5).forEach(res => {
          items.push({
            id: `res-pending-${res.id}`,
            type: 'reservation',
            title: `Reservation Request #${res.id}`,
            message: `${res.name} requested a table for ${res.guests || 2} on ${res.date || 'Today'} at ${res.time || '19:30'}`,
            timestamp: res.created_at || new Date().toISOString(),
            timeAgo: 'Pending Review',
            path: '/reservations',
            icon: CalendarDays,
            color: 'cyan'
          });
        });
      }

      // Pending reviews
      if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value)) {
        const pendingReviews = reviewsRes.value.filter(r => !r.is_approved);
        pendingReviews.slice(0, 4).forEach(review => {
          items.push({
            id: `review-pending-${review.id}`,
            type: 'review',
            title: `New Guest Review (${review.rating} Stars)`,
            message: `"${review.comment?.slice(0, 60)}${review.comment?.length > 60 ? '...' : ''}" - ${review.author_name || 'Patron'}`,
            timestamp: review.created_at || new Date().toISOString(),
            timeAgo: 'Requires approval',
            path: '/reviews',
            icon: Star,
            color: 'emerald'
          });
        });
      }

      // Out of stock dishes alert
      if (menuRes.status === 'fulfilled' && Array.isArray(menuRes.value)) {
        const outOfStock = menuRes.value.filter(m => m.status === 'out_of_stock');
        if (outOfStock.length > 0) {
          items.push({
            id: 'menu-out-of-stock-alert',
            type: 'inventory',
            title: 'Inventory Alert',
            message: `${outOfStock.length} ${outOfStock.length === 1 ? 'dish is' : 'dishes are'} currently marked out of stock.`,
            timestamp: new Date().toISOString(),
            timeAgo: 'Inventory',
            path: '/menu',
            icon: AlertTriangle,
            color: 'rose'
          });
        }
      }

      setNotifications(items);
    } catch (error) {
      console.error('Failed to aggregate notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Update parent unread count
  useEffect(() => {
    const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;
    onUnreadCountChange(unreadCount);
  }, [notifications, readIds, onUnreadCountChange]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const next = [...readIds, id];
      setReadIds(next);
      localStorage.setItem('tartuca_read_notifications', JSON.stringify(next));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const next = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(next);
    localStorage.setItem('tartuca_read_notifications', JSON.stringify(next));
  };

  const clearAll = () => {
    markAllAsRead();
    setNotifications([]);
  };

  const handleNotificationClick = (item) => {
    markAsRead(item.id);
    onClose();
    navigate(item.path);
  };

  if (!isOpen) return null;

  const unreadItems = notifications.filter(n => !readIds.includes(n.id));
  const displayedItems = activeTab === 'unread' ? unreadItems : notifications;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#0E1017] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#08090C] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
          {unreadItems.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {unreadItems.length} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Mark read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/5 px-3 pt-2 bg-slate-50/50 dark:bg-[#08090C]/50 gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 text-xs font-semibold px-2 border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`pb-2 text-xs font-semibold px-2 border-b-2 transition-all ${
            activeTab === 'unread'
              ? 'border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Unread ({unreadItems.length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
        {displayedItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-1.5">
            <Bell size={28} className="mx-auto text-slate-400 dark:text-slate-600 mb-2 opacity-50" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">No new alerts or pending tasks right now.</p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const isRead = readIds.includes(item.id);
            const Icon = item.icon;
            
            const colorMap = {
              amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
              cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
              emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
              rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
            };

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors group ${
                  isRead 
                    ? 'hover:bg-slate-50 dark:hover:bg-white/[0.02] opacity-75' 
                    : 'bg-amber-500/[0.03] hover:bg-amber-500/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.05]'
                }`}
              >
                {/* Icon */}
                <div className={`p-2 rounded-xl border shrink-0 ${colorMap[item.color] || colorMap.amber}`}>
                  <Icon size={16} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs truncate ${isRead ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-900 dark:text-slate-100 font-bold'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                      {item.timeAgo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {/* Status Dot */}
                <div className="shrink-0 flex items-center pt-1.5">
                  {!isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2.5 px-4 bg-slate-50 dark:bg-[#08090C] border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px]">
          <button
            onClick={clearAll}
            className="text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <Trash2 size={13} />
            <span>Clear list</span>
          </button>
          <span className="text-slate-400 dark:text-slate-500 text-[10px]">
            Updated live from restaurant queue
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
