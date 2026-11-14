import React from 'react';
import { Order } from '../types';
import { CheckCircle2, Clock, MapPin, Store, PackageCheck, ArrowRight, Home } from 'lucide-react';

interface OrderConfirmationPageProps {
  order: Order | null;
  onNavigate: (route: string, params?: any) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, onNavigate }) => {
  const orderIdDisplay = order?.order_number || '#ORD-20260822-00142';

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 text-center">
      {/* Success Celebration Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed 🎉
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Order Placed Successfully!</h1>
          <p className="text-xs text-slate-500 mt-1">Thank you for ordering with MediSwift</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block font-mono font-bold text-slate-800 text-sm">
          Order ID: <span className="text-emerald-600">#{orderIdDisplay}</span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft text-left space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm">Delivery Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              ESTIMATED DELIVERY
            </span>
            <p className="font-extrabold text-slate-900 text-sm">20–30 Minutes</p>
            <p className="text-slate-500 text-[11px]">Pharmacist is packing your order</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              FULFILLING PHARMACY
            </span>
            <p className="font-extrabold text-slate-900 text-sm">{order?.pharmacy_name || 'Apollo Pharmacy Koramangala'}</p>
            <p className="text-slate-500 text-[11px]">Verified Licensed Pharmacy</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
          <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            DELIVERY ADDRESS
          </span>
          <p className="font-bold text-slate-900">{order?.delivery_name || 'Abhiram Reddy'}</p>
          <p className="text-slate-600">{order?.street || '#42, 3rd Cross, Koramangala 4th Block, Bengaluru 560034'}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
        <button
          onClick={() => onNavigate('/order-tracking', { id: order?.id || orderIdDisplay })}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Track Order Status</span>
        </button>

        <button
          onClick={() => onNavigate('/orders')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-colors"
        >
          View Order History
        </button>

        <button
          onClick={() => onNavigate('/')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
