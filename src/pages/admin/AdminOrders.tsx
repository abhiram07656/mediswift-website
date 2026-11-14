import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { PackageCheck, ArrowLeft, Printer, CheckCircle2, Store, User, Clock } from 'lucide-react';

interface AdminOrdersProps {
  onNavigate: (route: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ onNavigate }) => {
  const { addToast } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminOrders(statusFilter);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      addToast(`Order status updated to ${newStatus}`, 'success');
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('/admin')} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manage Customer Orders</h1>
            <p className="text-xs text-slate-500">Update order fulfillment status and print invoices</p>
          </div>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
        >
          <option value="All">All Statuses</option>
          <option value="Placed">Placed</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading order queue...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Pharmacy</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-mono font-bold text-slate-900">#{ord.order_number}</p>
                      <p className="text-[10px] text-slate-400">{new Date(ord.created_at).toLocaleString()}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900">{ord.customer_name}</p>
                      <p className="text-[10px] text-slate-400">{ord.customer_email}</p>
                    </td>

                    <td className="p-4 font-bold text-slate-800">{ord.pharmacy_name}</td>

                    <td className="p-4 font-black text-slate-900">₹{ord.total_amount}</td>

                    <td className="p-4">
                      <select
                        value={ord.order_status}
                        onChange={e => handleStatusChange(ord.id, e.target.value)}
                        className="bg-slate-100 font-bold text-xs p-1.5 rounded-lg border border-slate-200 focus:outline-none"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">MediSwift Official Invoice</h3>
              <button onClick={() => setSelectedInvoiceOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">Close</button>
            </div>

            <div className="text-xs space-y-2 font-mono">
              <p><strong>Order #:</strong> {selectedInvoiceOrder.order_number}</p>
              <p><strong>Date:</strong> {new Date(selectedInvoiceOrder.created_at).toLocaleString()}</p>
              <p><strong>Pharmacy:</strong> {selectedInvoiceOrder.pharmacy_name}</p>
              <p><strong>Customer:</strong> {selectedInvoiceOrder.delivery_name || 'Abhiram Reddy'}</p>
              <p><strong>Status:</strong> {selectedInvoiceOrder.order_status}</p>

              <div className="border-t border-b py-2 space-y-1 my-2">
                {selectedInvoiceOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.medicine_name} x {item.quantity}</span>
                    <span>₹{item.unit_price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-extrabold text-sm pt-1">
                <span>TOTAL PAID:</span>
                <span>₹{selectedInvoiceOrder.total_amount}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Print Invoice Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
