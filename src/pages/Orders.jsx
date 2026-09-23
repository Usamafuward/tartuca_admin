import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Eye, 
  Search, 
  RefreshCw, 
  ChevronDown, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../services/api';
import { OrdersTableSkeleton } from '../components/common/Skeleton';
import OrderStatusDropdown from '../components/admin/OrderStatusDropdown';
import { useSettings } from '../context/SettingsContext';

const Orders = () => {
  const { formatPrice } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedOrder) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [selectedOrder]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const getAvailableStatusOptions = (currentStatus) => {
    const s = currentStatus ? currentStatus.toLowerCase() : '';
    const allOptions = [
      { value: 'pending', label: 'Pending' },
      { value: 'cooking', label: 'Preparing' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' }
    ];

    if (s === 'pending') {
      return allOptions;
    } else if (s === 'cooking') {
      return allOptions.filter(opt => opt.value !== 'pending');
    } else if (s === 'delivered') {
      return allOptions.filter(opt => opt.value === 'delivered');
    } else if (s === 'cancelled') {
      return allOptions.filter(opt => opt.value === 'cancelled');
    }
    return allOptions;
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          dot: 'bg-emerald-400'
        };
      case 'pending':
        return {
          pill: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
          dot: 'bg-amber-400'
        };
      case 'cooking':
        return {
          pill: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
          dot: 'bg-cyan-400'
        };
      case 'cancelled':
        return {
          pill: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          dot: 'bg-rose-500'
        };
      default:
        return {
          pill: 'bg-slate-800 text-slate-300 border border-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (order.id && String(order.id).includes(q)) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(q)) ||
      (order.customer_phone && order.customer_phone.includes(q)) ||
      (order.customer_address && order.customer_address.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Orders</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage incoming orders, delivery status, and order details.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] rounded-lg text-slate-700 dark:text-slate-200 transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-amber-500" : "text-slate-400"} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-xl border border-slate-200 dark:border-white/[0.07] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-slate-50/50 dark:bg-[#0C0E14]/40">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search by order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all shadow-xs"
            />
          </div>
          
          <div className="flex gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending' },
              { id: 'cooking', label: 'Preparing' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map(tab => {
              const count = tab.id === 'all' ? orders.length : orders.filter(o => o.status === tab.id).length;
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.04]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-amber-500/30 text-amber-800 dark:text-amber-200 font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-[#090A0E] text-slate-600 dark:text-slate-400 text-[11px] uppercase font-mono tracking-wider border-b border-slate-200 dark:border-white/[0.06]">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Time</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              {loading ? (
                <OrdersTableSkeleton rows={7} />
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const cfg = getStatusConfig(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.025] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{order.customer_name}</p>
                        <p className="text-[11px] font-mono text-slate-500">{order.customer_phone || order.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {order.items ? `${order.items.length} items` : '1 item'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white tnum">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${cfg.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <OrderStatusDropdown
                            status={order.status}
                            onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                            isUpdating={updating === order.id}
                            size="sm"
                            align="right"
                            variant="minimal"
                            width="w-[108px]"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && createPortal(
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card-elevated rounded-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-white/[0.1] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center shrink-0 bg-white/95 dark:bg-[#0E1017]/95 backdrop-blur-xl z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Order #{selectedOrder.id}</span>
                </h2>
                {(() => {
                  const cfg = getStatusConfig(selectedOrder.status);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cfg.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {selectedOrder.status}
                    </span>
                  );
                })()}
              </div>

              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto modal-scrollbar">
              {/* Status Bar */}
              <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-50 dark:bg-[#090A0E] p-4 rounded-xl border border-slate-200 dark:border-white/[0.06]">
                <div>
                  <p className="text-[10px] uppercase font-medium text-slate-500 tracking-wider mb-0.5">Date & Time</p>
                  <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-medium text-slate-500 tracking-wider mb-1">Status Action</p>
                  <OrderStatusDropdown
                    status={selectedOrder.status}
                    onStatusChange={(newStatus) => handleStatusChange(selectedOrder.id, newStatus)}
                    isUpdating={updating === selectedOrder.id}
                    size="md"
                    align="right"
                  />
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                    <User size={16} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Customer Name</p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{selectedOrder.customer_name}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                    <Phone size={16} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Phone Number</p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 font-mono">{selectedOrder.customer_phone || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center gap-3 md:col-span-2">
                      <Mail size={16} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase">Email</p>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 font-mono">{selectedOrder.customer_email}</p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.customer_address && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center gap-3 md:col-span-2">
                      <MapPin size={16} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase">Delivery Address</p>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{selectedOrder.customer_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Order Items
                </h3>
                <div className="border border-slate-200 dark:border-white/[0.07] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#090A0E] text-slate-600 dark:text-slate-400 text-[10px] uppercase font-mono border-b border-slate-200 dark:border-white/[0.06]">
                      <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02]">
                            <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">
                              {item.name || item.item_name || `Item #${item.menu_item_id}`}
                            </td>
                            <td className="p-3 text-center text-slate-500 dark:text-slate-400 font-mono">
                              {item.quantity}
                            </td>
                            <td className="p-3 text-right text-slate-500 dark:text-slate-400 font-mono tnum">
                              {formatPrice(item.price)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white tnum">
                              {formatPrice(Number(item.price) * Number(item.quantity))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-slate-500">
                            No item details found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total Footer */}
              <div className="p-4 bg-slate-50 dark:bg-[#090A0E] rounded-xl border border-slate-200 dark:border-white/[0.06] flex justify-between items-center">
                <span className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">Order Total</span>
                <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tnum">
                  {formatPrice(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Orders;