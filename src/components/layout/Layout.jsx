import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../admin/Sidebar';
import TopBar from '../admin/TopBar';

const Layout = () => {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#08090C] text-slate-100 relative font-sans selection:bg-amber-500/20 selection:text-amber-300 transition-colors duration-200">
      {/* Executive Command Center Ambient Grid & Glow */}
      <div className="ambient-grid fixed inset-0 pointer-events-none opacity-40 z-0" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/[0.02] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Navigation Sidebar */}
      <Sidebar 
        mobileOpen={mobileNavOpen} 
        onClose={() => setMobileNavOpen(false)} 
      />

      {/* Main Command Rail */}
      <div className="md:pl-64 flex flex-col h-full flex-1 w-full min-w-0 relative z-10 overflow-hidden">
        {/* TopBar is fixed at the top and never scrolls */}
        <TopBar onOpenMobileMenu={() => setMobileNavOpen(true)} />
        
        {/* Main content scroll container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0 w-full">
          <div className="max-w-[1600px] w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
