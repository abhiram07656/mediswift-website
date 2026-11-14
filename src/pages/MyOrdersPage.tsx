import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { PackageCheck, Clock, MapPin, Store, ChevronRight, RefreshCw, Eye } from 'lucide-react';

interface MyOrdersPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onNavigate }) => {
  const { addToCart } = useCart();
  const { addToast } = useNotification();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await api.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load my orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReorder = async (order: Order) => {
    if (order.items) {
      for (const item of order.items) {
        await addToCart(item.medicine_id, order.pharmacy_id, item.quantity);
      }
      addToast(`Reordered items from order #${order.order_number}! Added to cart.`, 'success');
      onNavigate('/cart');
    }
  };

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.order_status === filterStatus);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Medicine Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Track status, view invoices or reorder previous prescriptions</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Placed', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 h-40 skeleton-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">No Orders Found</h3>
          <p className="text-xs text-slate-400 mt-1">You haven't placed any medicine orders matching this filter yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            let statusColor = 'bg-emerald-100 text-emerald-800';
            if (ord.order_status === 'Placed') statusColor = 'bg-amber-100 text-amber-800';
            else if (ord.order_status === 'Out for Delivery') statusColor = 'bg-cyan-100 text-cyan-800 animate-pulse';
            else if (ord.order_status === 'Cancelled') statusColor = 'bg-rose-100 text-rose-800';

            return (
              <div
                key={ord.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft hover:shadow-lg transition-all space-y-4"
              >
                {/* Top Row: Order ID & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">#{ord.order_number}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${statusColor}`}>
                      {ord.order_status}
                    </span>
                  </div>
                </div>

                {/* Items & Pharmacy Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{ord.pharmacy_name}</span>
                    </div>

                    <div className="text-slate-500 line-clamp-1">
                      Medicines: {ord.items?.map(i => `${i.medicine_name} (${i.quantity}x)`).join(', ')}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-lg font-black text-slate-900">₹{ord.total_amount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReorder(ord)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reorder
                  </button>

                  <button
                    onClick={() => onNavigate('/order-tracking', { id: ord.id })}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    Track Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
