import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  CalendarDays, 
  MessageSquare, 
  Sliders,
  ShieldCheck,
  LogOut,
  Image,
  Radio,
  Tag,
  X
} from 'lucide-react';

const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { icon: ShoppingBag, label: 'Orders', path: '/orders' },
        { icon: CalendarDays, label: 'Reservations', path: '/reservations' },
        { icon: UtensilsCrossed, label: 'Menu Management', path: '/menu' },
        { icon: Tag, label: 'Special Offers', path: '/special-offers' },
      ]
    },
    {
      title: 'CONTENT & SOCIAL',
      items: [
        { icon: MessageSquare, label: 'Reviews & Feedback', path: '/reviews' },
        { icon: Image, label: 'Gallery', path: '/gallery' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { icon: Sliders, label: 'General Settings', path: '/settings' },
        { icon: ShieldCheck, label: 'Role Management', path: '/admin-options' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Rail */}
      <aside className={`w-64 bg-[#0B0C10]/95 backdrop-blur-2xl border-r border-white/[0.07] flex flex-col fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-5 border-b border-slate-200/90 dark:border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/25 via-amber-600/10 to-transparent border border-amber-500/40 text-amber-500 dark:text-amber-400 font-bold text-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              T
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Tartuca</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-medium">ADMIN</span>
              </div>
              <p className="text-[10px] tracking-wide text-slate-500">Restaurant Management</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Service Status Indicator */}
        <div className="px-4 pt-4 pb-1">
          <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/[0.08] dark:border-emerald-500/25 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium tracking-wide">SERVICE ONLINE</span>
            </div>
            <Radio size={12} className="text-emerald-500 dark:text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-800 dark:bg-gradient-to-r dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent dark:text-amber-300 border-l-2 border-amber-500 dark:border-amber-400 shadow-xs dark:shadow-[inset_0_0_12px_rgba(245,158,11,0.06)] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={16} className="shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-white/[0.07] bg-slate-50/80 dark:bg-[#07080A]/60 transition-colors">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:bg-slate-800 dark:border-slate-700/80 dark:text-slate-200 flex items-center justify-center text-xs font-bold shadow-xs">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">Admin</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Manager</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
