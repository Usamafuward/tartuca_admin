import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { fetchDashboardStats, fetchOrders } from '../services/api';
import { DashboardSkeleton } from '../components/common/Skeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const [stats, orders] = await Promise.all([
        fetchDashboardStats(token).catch(() => null),
        fetchOrders().catch(() => [])
      ]);

      if (stats) {
        setStatsData(stats);
      }
      if (orders && Array.isArray(orders)) {
        setRecentOrders(orders.slice(0, 5));
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

  const stats = [
    { 
      label: 'Total Revenue', 
      value: statsData ? `$${Number(statsData.revenue || 0).toFixed(2)}` : '$0.00', 
      change: '+12%', 
      trend: 'up', 
      icon: DollarSign, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'Total Orders', 
      value: statsData ? statsData.orders_count : 0, 
      change: '+8%', 
      trend: 'up', 
      icon: ShoppingBag, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'New Customers', 
      value: statsData ? statsData.new_customers : 0, 
      change: '+5%', 
      trend: 'up', 
      icon: Users, 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      label: 'Avg Order Value', 
      value: statsData ? `$${Number(statsData.avg_order_value || 0).toFixed(2)}` : '$0.00', 
      change: '+4%', 
      trend: 'up', 
      icon: TrendingUp, 
      color: 'bg-orange-100 text-orange-600' 
    },
  ];

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cooking':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Dashboard Overview</h1>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
      
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-dark mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`flex items-center gap-1 font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </span>
                  <span className="text-gray-400 ml-2">vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-dark">Recent Orders</h2>
              <button 
                onClick={() => navigate('/orders')}
                className="text-primary text-sm font-medium hover:underline"
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-primary">#{order.id}</td>
                        <td className="px-6 py-4 text-dark font-medium">{order.customer_name}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {order.items ? `${order.items.length} items` : '1 item'}
                        </td>
                        <td className="px-6 py-4 font-medium text-dark">${Number(order.total_amount).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
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
