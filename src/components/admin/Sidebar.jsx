import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  CalendarDays, 
  MessageSquare, 
  Settings,
  LogOut,
  Image,
  Tag
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: UtensilsCrossed, label: 'Menu', path: '/menu' },
    { icon: Tag, label: 'Special Offers', path: '/special-offers' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: CalendarDays, label: 'Reservations', path: '/reservations' },
    { icon: Image, label: 'Gallery', path: '/gallery' },
    { icon: MessageSquare, label: 'Reviews', path: '/reviews' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-full z-20">
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3">
          T
        </div>
        <span className="text-2xl font-bold text-dark tracking-tight">
          Admin<span className="text-primary">Panel</span>
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-dark'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
