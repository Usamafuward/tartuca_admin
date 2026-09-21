import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, Clock, Sun, Moon } from 'lucide-react';
import CommandSearchModal from './CommandSearchModal';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../../context/ThemeContext';

const TopBar = ({ onOpenMobileMenu = () => {} }) => {
  const [time, setTime] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Digital clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <>
      <header className="h-18 shrink-0 bg-white/95 dark:bg-[#08090C]/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-white/[0.07] z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 w-full transition-colors">
        {/* Left: Mobile trigger & Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button 
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Real-time Clock */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-[11px] font-mono text-slate-600 dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-slate-400">
            <Clock size={12} className="text-amber-500 dark:text-amber-400" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold">{time || '20:00:00'}</span>
          </div>

          {/* Command Search Trigger */}
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full max-w-xs sm:max-w-sm cursor-pointer group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-amber-500 dark:text-slate-500 dark:group-hover:text-amber-400 transition-colors" size={14} />
            <input
              type="text"
              readOnly
              placeholder="Search orders, menu, reservations..."
              className="w-full h-8 pl-8 pr-12 text-xs bg-slate-100/80 border border-slate-200/90 group-hover:border-amber-500/40 rounded-lg text-slate-900 placeholder:text-slate-400 dark:bg-slate-900/60 dark:border-white/[0.08] dark:text-slate-200 dark:placeholder:text-slate-500 cursor-pointer transition-all pointer-events-none"
            />
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center text-[10px] font-mono text-slate-500 bg-white border border-slate-200 shadow-2xs dark:bg-slate-800/80 dark:border-white/5">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Status HUD, Theme, Alerts, Admin Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
          {/* Accepting Orders Status Pill */}
          <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span>Accepting Orders</span>
          </div>

          {/* Quick Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
            aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {resolvedTheme === 'dark' ? (
              <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform duration-200" />
            ) : (
              <Moon size={17} className="text-slate-600 hover:text-amber-600 hover:-rotate-12 transition-transform duration-200" />
            )}
          </button>

          {/* Notifications Trigger & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(prev => !prev)}
              title="Notifications"
              className={`relative p-2 rounded-lg transition-colors ${
                isNotificationsOpen 
                  ? 'text-amber-500 dark:text-amber-400 bg-amber-500/10' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-obsidian-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
              onUnreadCountChange={setUnreadCount}
            />
          </div>

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-white/[0.07]">
            <div className="text-right hidden xl:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 leading-tight">Admin</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Manager</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 dark:border-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-semibold shadow-xs">
              <User size={14} className="text-amber-700 dark:text-slate-300" />
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Search Modal */}
      <CommandSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default TopBar;
