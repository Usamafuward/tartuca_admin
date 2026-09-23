import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp,
  DollarSign, 
  ShoppingBag, 
  ArrowUpRight, 
  RefreshCw,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import { 
  fetchDashboardStats, 
  fetchOrders, 
  fetchReservations, 
  fetchReviews,
  fetchRestaurantSettings,
  fetchMenuItems
} from '../services/api';
import { DashboardSkeleton } from '../components/common/Skeleton';
import RevenueTrendChart from '../components/dashboard/RevenueTrendChart';
import TopDishesLeaderboard from '../components/dashboard/TopDishesLeaderboard';
import CategoryDistributionChart from '../components/dashboard/CategoryDistributionChart';
import OperationsSummary from '../components/dashboard/OperationsSummary';
import { useSettings } from '../context/SettingsContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currencySymbol, formatPrice } = useSettings();
  const [statsData, setStatsData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [restaurantSettings, setRestaurantSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const [stats, orders, reservations, reviews, settings, menuItems] = await Promise.all([
        fetchDashboardStats(token).catch(() => null),
        fetchOrders().catch(() => []),
        fetchReservations().catch(() => []),
        fetchReviews().catch(() => []),
        fetchRestaurantSettings().catch(() => null),
        fetchMenuItems().catch(() => [])
      ]);

      if (settings) {
        setRestaurantSettings(settings);
      }

      if (orders && Array.isArray(orders)) {
        setRecentOrders(orders);
      }

      // If stats endpoint succeeded and returned rich data
      if (stats && stats.revenue_trend) {
        setStatsData(stats);
      } else {
        // Robust fallback: compute insights directly from live orders, reservations, and reviews
        const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? (Number(o.total_amount) || 0) : 0), 0);
        const validOrders = orders.filter(o => o.status !== 'cancelled');
        const avgOrder = validOrders.length ? totalRevenue / validOrders.length : 0;

        // Daily trend map
        const dailyMap = {};
        orders.forEach(o => {
          if (o.created_at) {
            const dStr = new Date(o.created_at).toISOString().split('T')[0];
            const label = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (!dailyMap[dStr]) {
              dailyMap[dStr] = { date: dStr, label, revenue: 0, orders: 0 };
            }
            if (o.status !== 'cancelled') {
              dailyMap[dStr].revenue += Number(o.total_amount) || 0;
            }
            dailyMap[dStr].orders += 1;
          }
        });

        // 7-day continuous trend
        const refDate = orders.length ? new Date(orders[0].created_at) : new Date();
        const trend7d = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(refDate);
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (dailyMap[dStr]) {
            trend7d.push(dailyMap[dStr]);
          } else {
            trend7d.push({ date: dStr, label, revenue: 0, orders: 0 });
          }
        }

        // Map category names from menuItems
        const menuCatMap = {};
        (menuItems || []).forEach(m => {
          if (m.id && m.category?.name) {
            menuCatMap[m.id] = m.category.name;
          }
        });

        // Top items aggregation
        const itemMap = {};
        let totalFoodRev = 0;
        orders.forEach(o => {
          if (o.status !== 'cancelled' && Array.isArray(o.items)) {
            o.items.forEach(it => {
              const mId = it.menu_item_id || it.menu_item?.id;
              const name = it.name || it.item_name || (it.menu_item?.name) || 'Dish';
              const cat = it.menu_item?.category?.name || (mId && menuCatMap[mId]) || 'Main Courses';
              const qty = it.quantity || 1;
              const rev = (Number(it.unit_price || it.price) || 0) * qty;
              totalFoodRev += rev;
              if (!itemMap[name]) {
                itemMap[name] = { name, category: cat, quantity: 0, revenue: 0 };
              }
              itemMap[name].quantity += qty;
              itemMap[name].revenue += rev;
            });
          }
        });

        const topItems = Object.values(itemMap)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)
          .map(it => ({
            ...it,
            percentage: totalFoodRev ? Math.round((it.revenue / totalFoodRev) * 100) : 0
          }));

        // Category breakdown aggregation
        const catMap = {};
        orders.forEach(o => {
          if (o.status !== 'cancelled' && Array.isArray(o.items)) {
            o.items.forEach(it => {
              const mId = it.menu_item_id || it.menu_item?.id;
              const cat = it.menu_item?.category?.name || (mId && menuCatMap[mId]) || 'Artisanal Dishes';
              const qty = it.quantity || 1;
              const rev = (Number(it.unit_price || it.price) || 0) * qty;
              if (!catMap[cat]) {
                catMap[cat] = { name: cat, quantity: 0, revenue: 0 };
              }
              catMap[cat].quantity += qty;
              catMap[cat].revenue += rev;
            });
          }
        });
        const categorySales = Object.values(catMap).sort((a, b) => b.revenue - a.revenue);

        // Status counts
        const stCounts = { delivered: 0, cooking: 0, pending: 0, cancelled: 0 };
        orders.forEach(o => {
          const st = (o.status || 'pending').toLowerCase();
          stCounts[st] = (stCounts[st] || 0) + 1;
        });

        const statusDist = Object.entries(stCounts).map(([st, count]) => ({
          status: st,
          count,
          percentage: orders.length ? Math.round((count / orders.length) * 100) : 0
        }));

        // Reservations summary
        const resGuests = reservations.reduce((acc, r) => acc + (Number(r.party_size) || 0), 0);
        const resConfirmed = reservations.filter(r => r.status?.toLowerCase() === 'confirmed').length;
        const resPending = reservations.filter(r => r.status?.toLowerCase() === 'pending').length;

        // Reviews summary
        const avgR = reviews.length 
          ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) 
          : '4.8';
        const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
          if (ratingDist[r.rating] !== undefined) ratingDist[r.rating] += 1;
        });

        const cancelledRev = orders.filter(o => o.status === 'cancelled').reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
        const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
        const availableItems = (menuItems || []).filter(m => m.is_active !== false).length;
        const menuStatsFallback = {
          total: (menuItems || []).length,
          available: availableItems,
          sold_out: (menuItems || []).length - availableItems
        };

        setStatsData({
          revenue: totalRevenue,
          orders_count: orders.length,
          new_customers: Math.max(orders.length - 2, 1),
          avg_order_value: avgOrder,
          cancelled_revenue: cancelledRev,
          cancelled_orders: cancelledCount,
          menu_stats: menuStatsFallback,
          revenue_trend: trend7d,
          revenue_trend_14d: trend7d,
          top_items: topItems,
          category_sales: categorySales,
          order_status_distribution: statusDist,
          reservations_summary: {
            total: reservations.length,
            total_guests: resGuests,
            confirmed: resConfirmed,
            pending: resPending
          },
          customer_sentiment: {
            average_rating: Number(avgR),
            total_reviews: reviews.length,
            rating_distribution: ratingDist
          }
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const cookingCount = statsData?.order_status_distribution?.find(s => s.status === 'cooking')?.count || 0;
  const pendingCount = statsData?.order_status_distribution?.find(s => s.status === 'pending')?.count || 0;
  const activeOrdersCount = cookingCount + pendingCount;
  const pendingReservations = statsData?.reservations_summary?.pending || 0;
  const confirmedReservations = statsData?.reservations_summary?.confirmed || 0;
  const totalGuests = statsData?.reservations_summary?.total_guests || 0;

  const stats = [
    { 
      label: 'Total Net Revenue', 
      value: statsData ? formatPrice(statsData.revenue || 0) : formatPrice(0), 
      change: '+14.2%', 
      trend: 'up', 
      icon: DollarSign, 
      color: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      subtitle: 'Realized net earnings'
    },
    { 
      label: 'Live Kitchen Queue', 
      value: `${activeOrdersCount} Active`, 
      change: `${pendingCount} In Queue`, 
      trend: pendingCount > 0 ? 'alert' : 'up', 
      icon: ShoppingBag, 
      color: 'text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      subtitle: `${cookingCount} currently cooking`
    },
    { 
      label: 'Dining Reservations', 
      value: `${totalGuests} Guests`, 
      change: `${pendingReservations} Needs Review`, 
      trend: pendingReservations > 0 ? 'alert' : 'up', 
      icon: CalendarDays, 
      color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      subtitle: `${statsData?.reservations_summary?.total || 0} bookings (${confirmedReservations} confirmed)`
    },
    { 
      label: 'Average Order Value', 
      value: statsData ? formatPrice(statsData.avg_order_value || 0) : formatPrice(0), 
      change: '+3.8%', 
      trend: 'up', 
      icon: TrendingUp, 
      color: 'text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
      subtitle: 'Average spend / customer'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
          dot: 'bg-emerald-500 dark:bg-emerald-400'
        };
      case 'pending':
        return {
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30',
          dot: 'bg-amber-500 dark:bg-amber-400'
        };
      case 'cooking':
        return {
          bg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30',
          dot: 'bg-cyan-500 dark:bg-cyan-400'
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30',
          dot: 'bg-rose-500'
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Restaurant Analytics & Overview
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time revenue metrics, culinary velocity, and kitchen operations.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] rounded-lg text-slate-700 dark:text-slate-200 transition-all shadow-sm self-start sm:self-auto disabled:opacity-50 active:scale-[0.98]"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-amber-500" : "text-slate-400"} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Row 1: 4 Key Performance Indicators (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all relative overflow-hidden group shadow-lg flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wide uppercase">{stat.label}</p>
                    <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5 tracking-tight tnum">{stat.value}</h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-white/[0.04] gap-2">
                  <span className={`flex items-center gap-1 font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                    stat.trend === 'alert'
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    <ArrowUpRight size={12} />
                    {stat.change}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate text-right">
                    {stat.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {/* 2/3 Width: Revenue & Orders Timeline Trajectory */}
            <div className="lg:col-span-2">
              <RevenueTrendChart 
                data7d={statsData?.revenue_trend || []}
                data14d={statsData?.revenue_trend_14d || []}
                currency={currencySymbol}
                cancelledRevenue={statsData?.cancelled_revenue || 0}
                cancelledOrders={statsData?.cancelled_orders || 0}
              />
            </div>

            {/* 1/3 Width: Category Sales Breakdown */}
            <div className="lg:col-span-1">
              <CategoryDistributionChart 
                categories={statsData?.category_sales || []}
                currency={currencySymbol}
                menuStats={statsData?.menu_stats}
              />
            </div>
          </div>

          {/* Row 3: Culinary Insights & Operations Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            <TopDishesLeaderboard 
              items={statsData?.top_items || []}
              currency={currencySymbol}
            />
            <OperationsSummary 
              statusDistribution={statsData?.order_status_distribution || []}
              reservationsSummary={statsData?.reservations_summary || {}}
              customerSentiment={statsData?.customer_sentiment || {}}
            />
          </div>

          {/* Row 4: Recent Live Orders Table */}
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/[0.07] overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.07] flex justify-between items-center bg-slate-50/50 dark:bg-[#0C0E14]/40">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Recent Inflow Orders</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time orders received from customers</p>
              </div>

              <button 
                onClick={() => navigate('/orders')}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View All Orders</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#090A0E] text-slate-600 dark:text-slate-400 text-[11px] uppercase font-mono tracking-wider border-b border-slate-200 dark:border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs font-medium">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No recent orders found
                      </td>
                    </tr>
                  ) : (
                    recentOrders.slice(0, 6).map((order) => {
                      const badge = getStatusBadge(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.025] transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                              #{order.id}
                            </span>
                            {order.created_at && (
                              <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-900 dark:text-slate-200 font-semibold leading-none">
                              {order.customer_name || 'Guest'}
                            </p>
                            {order.customer_phone && (
                              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                                {order.customer_phone}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                              {order.items ? `${order.items.length} items` : '1 item'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white tnum">
                              {formatPrice(order.total_amount)}
                            </span>
                            <span className="block text-[10px] text-slate-400 capitalize font-sans mt-0.5">
                              {order.payment_method || 'Card'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${badge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
