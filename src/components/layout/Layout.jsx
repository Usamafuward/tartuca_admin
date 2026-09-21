import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Sidebar from '../admin/Sidebar';
import TopBar from '../admin/TopBar';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Reset scroll to top on every route / page transition
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setShowScrollTop(false);
  }, [location.pathname, location.search]);

  const handleScroll = (e) => {
    if (e.target.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <main 
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0 w-full relative"
        >
          <div className="max-w-[1600px] w-full mx-auto">
            <Outlet />
          </div>

          {/* Floating Back to Top Button */}
          {showScrollTop && (
            <button
              type="button"
              onClick={scrollToTop}
              title="Scroll to top"
              aria-label="Scroll to top"
              className="fixed bottom-6 right-6 z-40 p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/25 border border-amber-400/40 transition-all duration-200 hover:scale-105 active:scale-95 animate-in fade-in zoom-in-90"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
