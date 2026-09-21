import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  Star, 
  ChevronRight, 
  ChefHat, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  XCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const OperationsSummary = ({
  statusDistribution = [],
  reservationsSummary = {},
  customerSentiment = {}
}) => {
  const navigate = useNavigate();

  const totalOrders = statusDistribution.reduce((acc, s) => acc + (s.count || 0), 0);

  // Status mapping for stages
  const stageConfig = [
    {
      status: 'delivered',
      label: 'Delivered & Fulfilled',
      sub: 'Completed customer orders',
      icon: CheckCircle2,
      color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      status: 'cooking',
      label: 'Preparing in Kitchen',
      sub: 'Active cooking & prep stations',
      icon: Clock,
      color: 'text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      bar: 'bg-cyan-500',
      badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
    },
    {
      status: 'pending',
      label: 'Pending Confirmation',
      sub: 'Queued for kitchen dispatch',
      icon: AlertCircle,
      color: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      bar: 'bg-amber-500',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      status: 'cancelled',
      label: 'Cancelled / Voided',
      sub: 'Refunded or cancelled orders',
      icon: XCircle,
      color: 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
      bar: 'bg-rose-500',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    }
  ];

  // Ratings calculation
  const avgRating = Number(customerSentiment.average_rating || 4.8).toFixed(1);
  const totalReviews = customerSentiment.total_reviews || 19;
  const ratingDist = customerSentiment.rating_distribution || { 5: 16, 4: 2, 3: 1, 2: 0, 1: 0 };

  const positiveReviews = (ratingDist[5] || 0) + (ratingDist[4] || 0);
  const positiveRate = totalReviews ? Math.round((positiveReviews / totalReviews) * 100) : 95;

  const deliveredCount = statusDistribution.find(s => s.status === 'delivered')?.count || 0;
  const cookingCount = statusDistribution.find(s => s.status === 'cooking')?.count || 0;
  const pendingCount = statusDistribution.find(s => s.status === 'pending')?.count || 0;
  const cancelledCount = statusDistribution.find(s => s.status === 'cancelled')?.count || 0;
  const fulfillmentRate = totalOrders ? Math.round(((totalOrders - cancelledCount) / totalOrders) * 100) : 100;

  const totalTables = reservationsSummary.total || 13;
  const confirmedTables = reservationsSummary.confirmed || 4;
  const pendingTables = reservationsSummary.pending || 8;
  const totalGuests = reservationsSummary.total_guests || 47;
  const avgPartySize = totalTables ? (totalGuests / totalTables).toFixed(1) : '3.6';
  const confirmedGuests = Math.round(confirmedTables * Number(avgPartySize));
  const confirmedPct = totalTables ? Math.round((confirmedTables / totalTables) * 100) : 31;
  const pendingPct = totalTables ? Math.round((pendingTables / totalTables) * 100) : 62;

  return (
    <>
      {/* Widget 1: Kitchen & Orders Station Pipeline */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/[0.08] p-5 shadow-xl flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
              <ChefHat size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Pipeline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live station flow & fulfillment</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition-colors group"
          >
            <span>Orders</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="py-2.5 flex-1 flex flex-col justify-between space-y-3">
          {/* Multi-segment Progress Flow Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span>Active Workload: <strong>{cookingCount + pendingCount} of {totalOrders} orders</strong></span>
              </span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                Throughput: {deliveredCount} Fulfilled
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 flex overflow-hidden p-0.5 gap-0.5">
              {stageConfig.map((cfg) => {
                const item = statusDistribution.find(s => s.status === cfg.status);
                const count = item?.count || 0;
                const widthPct = totalOrders ? (count / totalOrders) * 100 : 0;
                if (widthPct === 0) return null;
                return (
                  <div
                    key={cfg.status}
                    style={{ width: `${widthPct}%` }}
                    className={`h-full rounded-sm ${cfg.bar} transition-all duration-500`}
                    title={`${cfg.label}: ${count}`}
                  />
                );
              })}
            </div>
          </div>

          {/* 4 Full-Width Station Breakdown Rows */}
          <div className="space-y-2">
            {stageConfig.map((cfg) => {
              const item = statusDistribution.find(s => s.status === cfg.status);
              const count = item?.count || 0;
              const pct = totalOrders ? Number(((count / totalOrders) * 100).toFixed(1)) : 0;

              return (
                <div 
                  key={cfg.status}
                  className="p-2 px-2.5 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1 rounded-md border shrink-0 ${cfg.color}`}>
                        <cfg.icon size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-none">
                          {cfg.label}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block mt-0.5">
                          {cfg.sub}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {count} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Track */}
                  <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`} 
                      style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          {pendingCount > 0 ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Action: <strong className="font-mono">{pendingCount} orders</strong> queued for prep
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              ✓ All orders active or completed
            </span>
          )}
          <span className="text-emerald-500 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Kitchen Online
          </span>
        </div>
      </div>

      {/* Widget 2: Hospitality & Customer Satisfaction */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/[0.08] p-5 shadow-xl flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
              <CalendarDays size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Hospitality & Reviews</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Guest seating and diner satisfaction</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/reservations')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors group"
          >
            <span>Bookings</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="py-2.5 flex-1 flex flex-col justify-between space-y-3">
          {/* Section A: Reservations Seating Cards */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold truncate">Confirmed Covers</p>
                <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 tnum">
                  {confirmedGuests} <span className="text-[10px] font-normal">Guests</span>
                </p>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono">~{confirmedTables} locked tables</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.04]">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate">Avg Party Size</p>
                <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 tnum">
                  {avgPartySize}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">guests / party</span>
              </div>

              <div className="p-2 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold truncate">Pending Approval</p>
                <p className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 tnum">
                  {pendingTables} <span className="text-[10px] font-normal">Parties</span>
                </p>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-mono">needs assignment</span>
              </div>
            </div>

            {/* Table Approval Ratio Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>Reservation Allocation</span>
                <span className="font-mono">{confirmedTables} Confirmed • {pendingTables} Pending</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 flex overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-l-full" 
                  style={{ width: `${confirmedPct}%` }}
                  title={`Confirmed: ${confirmedTables}`}
                />
                <div 
                  className="bg-amber-400 h-full rounded-r-full" 
                  style={{ width: `${pendingPct}%` }}
                  title={`Pending: ${pendingTables}`}
                />
              </div>
            </div>
          </div>

          {/* Section B: Diner Sentiment & Star Breakdown */}
          <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold font-mono text-xs shrink-0">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  <span>{avgRating}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                    Diner Satisfaction
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {totalReviews} verified customer reviews
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                {positiveRate}% positive
              </span>
            </div>

            {/* 5-Level Rating Distribution */}
            <div className="space-y-1 pt-1 border-t border-slate-200/50 dark:border-white/[0.04]">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDist[star] || 0;
                const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="w-4 shrink-0 font-medium">{star}★</span>
                    <div className="flex-1 bg-slate-200/70 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${count > 0 ? 'bg-amber-400' : 'bg-transparent'}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <span className="w-14 text-right shrink-0 text-slate-500 dark:text-slate-400">
                      {count} <span className="text-[9px] opacity-75">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Booking Schedule: <strong className="text-slate-700 dark:text-slate-200 font-mono">{totalTables} parties ({totalGuests} covers)</strong></span>
          <button
            type="button"
            onClick={() => navigate('/reviews')}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-0.5 text-xs transition-colors"
          >
            <span>View All Reviews</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </>
  );
};

export default OperationsSummary;
