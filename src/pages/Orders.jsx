import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, CheckCircle, Truck, XCircle, MoreVertical, Eye, X, ChevronDown } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../services/api';
import { useToast } from '../context/ToastContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadOrders = async () => {
        try {
          const data = await fetchOrders();
          setOrders(data);
        } catch (error) {
          console.error('Failed to load orders:', error);
          showToast('Failed to load orders', 'error');
        } finally {
          setLoading(false);
        }
      };
    loadOrders();
  }, [showToast]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
        await updateOrderStatus(orderId, newStatus);
        const updatedOrders = orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
    } catch {
        showToast("Failed to update status", 'error');
    } finally {
        setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cooking': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'cooking': return <CheckCircle size={16} />;
      case 'delivered': return <Truck size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Orders</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <Filter size={20} />
            <span>Filter Status</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">#{order.id}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-dark">{order.customer_name}</td>
                  <td className="px-6 py-4 text-gray-500">{order.items ? order.items.length : 0} items</td>
                  <td className="px-6 py-4 font-bold text-dark">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>
                        <div className="relative">
                            <select 
                                disabled={updating === order.id}
                                className={`text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white font-medium ${
                                    order.status === 'pending' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                                    order.status === 'cooking' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                    order.status === 'delivered' ? 'text-green-700 bg-green-50 border-green-200' :
                                    'text-red-700 bg-red-50 border-red-200'
                                }`}
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="cooking">Cooking</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={14} />
                        </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                        Order #{selectedOrder.id}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                        </span>
                    </h2>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Status & Date */}
                    <div className="flex flex-wrap gap-4 justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Order Date</p>
                            <p className="font-medium text-dark">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Update Status</p>
                            <div className="relative">
                                <select 
                                    className={`text-sm border rounded-xl pl-3 pr-10 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer w-full ${
                                        selectedOrder.status === 'pending' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                                        selectedOrder.status === 'cooking' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                        selectedOrder.status === 'delivered' ? 'text-green-700 bg-green-50 border-green-200' :
                                        'text-red-700 bg-red-50 border-red-200'
                                    }`}
                                    value={selectedOrder.status}
                                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                    disabled={updating === selectedOrder.id}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="cooking">Cooking</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-dark mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                Customer
                            </h3>
                            <div className="space-y-3 text-sm bg-white p-4 rounded-xl border border-gray-100 h-full">
                                <p><span className="text-gray-500 block text-xs">Name</span> <span className="font-medium">{selectedOrder.customer_name}</span></p>
                                <p><span className="text-gray-500 block text-xs">Email</span> <span className="font-medium">{selectedOrder.customer_email || 'N/A'}</span></p>
                                <p><span className="text-gray-500 block text-xs">Phone</span> <span className="font-medium">{selectedOrder.customer_phone}</span></p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-dark mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                Delivery
                            </h3>
                            <div className="space-y-3 text-sm bg-white p-4 rounded-xl border border-gray-100 h-full">
                                <p><span className="text-gray-500 block text-xs">Address</span> <span className="font-medium">{selectedOrder.delivery_address}</span></p>
                                {selectedOrder.delivery_instructions && (
                                    <div className="mt-2 pt-2 border-t border-gray-50">
                                        <span className="text-gray-500 block text-xs mb-1">Instructions</span>
                                        <p className="bg-yellow-50 p-2 rounded text-yellow-800 text-xs">
                                            {selectedOrder.delivery_instructions}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-sm font-bold text-dark mb-3 uppercase tracking-wider">Order Items</h3>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Item</th>
                                        <th className="px-4 py-3 text-center font-medium">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium">Price</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-dark">
                                                    {item.menu_item?.name || item.special_offer?.title || `Item #${item.menu_item_id || item.special_offer_id}`}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-gray-500">${Number(item.unit_price).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-dark">${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-100">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-right font-bold text-dark uppercase text-xs tracking-wider">Total Amount</td>
                                        <td className="px-4 py-3 text-right font-bold text-primary text-lg">${Number(selectedOrder.total_amount).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-dark font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Orders;