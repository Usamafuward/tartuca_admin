import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, Award, UtensilsCrossed } from 'lucide-react';

const TopDishesLeaderboard = ({ items = [], currency = '$' }) => {
  const navigate = useNavigate();

  const topDishesShare = items.length > 0 && items[0]?.percentage 
    ? Math.min(items.reduce((acc, it) => acc + (Number(it.percentage) || 0), 0), 100) 
    : 78;

  const rankBadges = [
    { bg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30', label: '#1' },
    { bg: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600', label: '#2' },
    { bg: 'bg-amber-700/20 text-amber-700 dark:text-amber-500 border-amber-700/30', label: '#3' },
    { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5', label: '#4' },
    { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5', label: '#5' },
  ];

  return (
    <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/[0.08] p-5 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
              <Flame size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top-Selling Dishes</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Highest velocity menu items by order volume
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition-colors group"
        >
          <span>Menu</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="py-2 divide-y divide-slate-100 dark:divide-white/[0.04] space-y-1 flex-1 flex flex-col justify-around">
        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center">
            <UtensilsCrossed size={32} className="opacity-30 mb-2" />
            <p>No sales data registered yet</p>
          </div>
        ) : (
          items.map((item, idx) => {
            const badge = rankBadges[idx] || rankBadges[3];
            const pct = Math.min(Math.max(item.percentage || 0, 5), 100);

            return (
              <div key={idx} className="pt-3 pb-2 first:pt-1 group">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold border shrink-0 ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {item.quantity} sold
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white tnum">
                        {currency}{Number(item.revenue || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Insight */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Award size={13} className="text-amber-500" />
          <span>Top {items.length} dishes generate <strong className="text-slate-700 dark:text-slate-200 font-mono">{topDishesShare}%</strong> of volume</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">Live Velocity</span>
      </div>
    </div>
  );
};

export default TopDishesLeaderboard;
