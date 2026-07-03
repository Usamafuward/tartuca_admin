import React from 'react';
import { TrendingUp, Users, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Revenue', value: '$12,426', change: '+12%', trend: 'up', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Total Orders', value: '1,245', change: '+8%', trend: 'up', icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'New Customers', value: '45', change: '-2%', trend: 'down', icon: Users, color: 'bg-purple-100 text-purple-600' },
    { label: 'Avg Order Value', value: '$42', change: '+4%', trend: 'up', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
  ];

  const recentOrders = [
    { id: '#ORD-1234', customer: 'John Doe', items: '2x Pizza, 1x Coke', total: '$35.00', status: 'Pending' },
    { id: '#ORD-1235', customer: 'Jane Smith', items: '1x Pasta, 1x Salad', total: '$28.50', status: 'Completed' },
    { id: '#ORD-1236', customer: 'Mike Johnson', items: '3x Burger, 3x Fries', total: '$45.00', status: 'Preparing' },
    { id: '#ORD-1237', customer: 'Sarah Williams', items: '1x Steak', total: '$55.00', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Dashboard Overview</h1>
      
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
          <button className="text-primary text-sm font-medium hover:underline">View All</button>
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
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{order.id}</td>
                  <td className="px-6 py-4 text-dark">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-500">{order.items}</td>
                  <td className="px-6 py-4 font-medium text-dark">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
