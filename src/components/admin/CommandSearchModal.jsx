import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  ShoppingBag, 
  CalendarDays, 
  UtensilsCrossed, 
  Tag, 
  Image, 
  MessageSquare, 
  Sliders,
  ShieldCheck, 
  LayoutDashboard,
  ArrowRight,
  Clock,
  User,
  DollarSign
} from 'lucide-react';
import { fetchOrders, fetchMenuItems, fetchReservations } from '../../services/api';

const staticPages = [
  { id: 'page-dashboard', title: 'Dashboard', path: '/', icon: LayoutDashboard, category: 'Pages', description: 'Overview and sales statistics' },
  { id: 'page-orders', title: 'Orders', path: '/orders', icon: ShoppingBag, category: 'Pages', description: 'Live order board and customer orders' },
  { id: 'page-reservations', title: 'Reservations', path: '/reservations', icon: CalendarDays, category: 'Pages', description: 'Table bookings and guest schedule' },
  { id: 'page-menu', title: 'Menu', path: '/menu', icon: UtensilsCrossed, category: 'Pages', description: 'Dishes, categories, and pricing' },
  { id: 'page-offers', title: 'Offers', path: '/special-offers', icon: Tag, category: 'Pages', description: 'Discounts and promotional deals' },
  { id: 'page-gallery', title: 'Gallery', path: '/gallery', icon: Image, category: 'Pages', description: 'Restaurant and food showcase photography' },
  { id: 'page-reviews', title: 'Reviews', path: '/reviews', icon: MessageSquare, category: 'Pages', description: 'Customer feedback and testimonials' },
  { id: 'page-preferences', title: 'System preferences', path: '/settings', icon: Sliders, category: 'Pages', description: 'Restaurant hours, delivery fees, and general configuration' },
  { id: 'page-admin-options', title: 'Admin options', path: '/admin-options', icon: ShieldCheck, category: 'Pages', description: 'Administrator accounts and access management' },
];

const CommandSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  const [loading, setLoading] = useState(false);

  // Cached remote data
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Fetch searchable records on open
  useEffect(() => {
    if (!isOpen) return;
    
    setQuery('');
    setSelectedIndex(0);

    const loadData = async () => {
      setLoading(true);
      try {
        const [ordersData, menuData, resData] = await Promise.allSettled([
          fetchOrders(),
          fetchMenuItems(),
          fetchReservations()
        ]);
        
        if (ordersData.status === 'fulfilled' && Array.isArray(ordersData.value)) {
          setOrders(ordersData.value);
        }
        if (menuData.status === 'fulfilled' && Array.isArray(menuData.value)) {
          setMenuItems(menuData.value);
        }
        if (resData.status === 'fulfilled' && Array.isArray(resData.value)) {
          setReservations(resData.value);
        }
      } catch (err) {
        console.error('Failed to load search index:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [isOpen]);

  // Compute matched results
  const q = query.trim().toLowerCase();

  const matchedPages = staticPages.filter(p => 
    !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );

  const matchedOrders = orders.filter(o => {
    if (!q) return false;
    const idMatch = String(o.id).includes(q);
    const nameMatch = o.customer_name && o.customer_name.toLowerCase().includes(q);
    const phoneMatch = o.customer_phone && o.customer_phone.includes(q);
    const statusMatch = o.status && o.status.toLowerCase().includes(q);
    return idMatch || nameMatch || phoneMatch || statusMatch;
  }).slice(0, 5);

  const matchedMenuItems = menuItems.filter(m => {
    if (!q) return false;
    const nameMatch = m.name && m.name.toLowerCase().includes(q);
    const descMatch = m.description && m.description.toLowerCase().includes(q);
    return nameMatch || descMatch;
  }).slice(0, 5);

  const matchedReservations = reservations.filter(r => {
    if (!q) return false;
    const nameMatch = r.name && r.name.toLowerCase().includes(q);
    const phoneMatch = r.phone && r.phone.includes(q);
    const dateMatch = r.date && r.date.includes(q);
    return nameMatch || phoneMatch || dateMatch;
  }).slice(0, 4);

  // Flatten results for keyboard navigation
  const flatResults = [
    ...matchedPages.map(p => ({ ...p, type: 'page' })),
    ...matchedOrders.map(o => ({
      id: `order-${o.id}`,
      title: `Order #${o.id} - ${o.customer_name || 'Guest'}`,
      description: `$${Number(o.total_amount).toFixed(2)} • ${o.status || 'pending'}`,
      path: '/orders',
      icon: ShoppingBag,
      type: 'order',
      meta: o
    })),
    ...matchedMenuItems.map(m => ({
      id: `menu-${m.id}`,
      title: m.name,
      description: `$${Number(m.price).toFixed(2)} • ${m.status === 'out_of_stock' ? 'Out of Stock' : 'Available'}`,
      path: '/menu',
      icon: UtensilsCrossed,
      type: 'menu',
      meta: m
    })),
    ...matchedReservations.map(r => ({
      id: `res-${r.id}`,
      title: `Reservation: ${r.name}`,
      description: `${r.guests || 2} Guests • ${r.date || 'Today'} at ${r.time || '19:30'}`,
      path: '/reservations',
      icon: CalendarDays,
      type: 'reservation',
      meta: r
    }))
  ];

  // Handle keyboard selection
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (flatResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatResults.length) % (flatResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = (item) => {
    onClose();
    navigate(item.path);
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0e1117] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#08090C] rounded-t-2xl">
          <Search size={18} className="text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search orders, menu dishes, reservations, or pages..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md transition-colors mr-2"
            >
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div 
          ref={resultsContainerRef}
          className="overflow-y-auto flex-1 p-2 space-y-4 max-h-[55vh] modal-scrollbar"
        >
          {loading && flatResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Indexing navigation and orders...
            </div>
          ) : flatResults.length === 0 ? (
            <div className="p-10 text-center text-slate-500 space-y-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Try searching with a customer name, order number, or dish title.</p>
            </div>
          ) : (
            <>
              {/* Pages Section */}
              {matchedPages.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Navigation Pages
                  </p>
                  <div className="space-y-0.5">
                    {matchedPages.map((page) => {
                      const itemIndex = flatResults.findIndex(r => r.id === page.id);
                      const isSelected = itemIndex === selectedIndex;
                      const Icon = page.icon;
                      return (
                        <div
                          key={page.id}
                          onClick={() => handleSelect(page)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-medium' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                              <Icon size={15} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-200">{page.title}</p>
                              <p className="text-[11px] text-slate-500">{page.description}</p>
                            </div>
                          </div>
                          <ArrowRight size={14} className={isSelected ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {matchedOrders.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Orders
                  </p>
                  <div className="space-y-0.5">
                    {matchedOrders.map((order) => {
                      const itemIndex = flatResults.findIndex(r => r.id === `order-${order.id}`);
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={order.id}
                          onClick={() => handleSelect({ path: '/orders' })}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-medium' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                              <ShoppingBag size={15} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-200">
                                Order #{order.id} <span className="font-normal text-slate-500 dark:text-slate-400">• {order.customer_name || 'Guest'}</span>
                              </p>
                              <p className="text-[11px] text-slate-500">
                                ${Number(order.total_amount).toFixed(2)} • {order.customer_phone || 'No phone'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-transparent">
                            {order.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Menu Items Section */}
              {matchedMenuItems.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Menu Dishes
                  </p>
                  <div className="space-y-0.5">
                    {matchedMenuItems.map((item) => {
                      const itemIndex = flatResults.findIndex(r => r.id === `menu-${item.id}`);
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect({ path: '/menu' })}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-medium' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                              <UtensilsCrossed size={15} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-200">{item.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">${Number(item.price).toFixed(2)}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            item.status === 'out_of_stock' 
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {item.status === 'out_of_stock' ? 'Out of Stock' : 'Available'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reservations Section */}
              {matchedReservations.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Reservations
                  </p>
                  <div className="space-y-0.5">
                    {matchedReservations.map((res) => {
                      const itemIndex = flatResults.findIndex(r => r.id === `res-${res.id}`);
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={res.id}
                          onClick={() => handleSelect({ path: '/reservations' })}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-medium' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                              <CalendarDays size={15} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-200">{res.name}</p>
                              <p className="text-[11px] text-slate-500">{res.guests || 2} Guests • {res.date} at {res.time}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-transparent">
                            {res.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#08090C] border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-400 font-mono text-[10px]">↑↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-400 font-mono text-[10px]">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-400 font-mono text-[10px]">esc</kbd> to close</span>
          </div>
          <span className="hidden sm:inline font-medium text-slate-400">Command Search</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandSearchModal;
