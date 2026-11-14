import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import {
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Store,
  Clock,
  ArrowRight,
  Sparkles,
  Building,
  Phone
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { user, addresses } = useAuth();
  const { items: cartItems, summary, buyNowItem, clearCart } = useCart();
  const { location } = useLocation();
  const { addToast } = useNotification();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || 'addr-001');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Determine items to checkout (Buy Now single item or Cart items)
  const itemsToCheckout = buyNowItem ? [
    {
      medicine_id: buyNowItem.medicine.id,
      medicine_name: buyNowItem.medicine.name,
      brand: buyNowItem.medicine.brand,
      quantity: buyNowItem.quantity,
      price: Math.round((buyNowItem.medicine.price * (1 - buyNowItem.medicine.discount / 100)) * 100) / 100,
      image: buyNowItem.medicine.image,
      pharmacy_id: buyNowItem.pharmacyId,
      pharmacy_name: buyNowItem.pharmacyName,
      prescription_required: buyNowItem.medicine.prescription_required
    }
  ] : cartItems;

  const checkoutSubtotal = buyNowItem ? itemsToCheckout[0].price : summary.subtotal;
  const deliveryFee = checkoutSubtotal > 0 ? 29 : 0;
  const discountAmount = checkoutSubtotal > 500 ? 50 : 0;
  const finalTotal = Math.round((checkoutSubtotal + deliveryFee - discountAmount) * 100) / 100;

  const selectedPharmacyId = buyNowItem ? buyNowItem.pharmacyId : (cartItems[0]?.pharmacy_id || 'ph-01');

  const handlePlaceOrder = async () => {
    if (itemsToCheckout.length === 0) {
      addToast('No items to checkout', 'error');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const res = await api.placeOrder({
        pharmacy_id: selectedPharmacyId,
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        items: itemsToCheckout.map(i => ({ medicine_id: i.medicine_id, quantity: i.quantity }))
      });

      addToast(`Order ${res.order.order_number} placed successfully! 🎉`, 'success');
      onNavigate('/order-confirmation', { order: res.order });
    } catch (err: any) {
      console.error('Order error:', err);
      addToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <h1 className="text-2xl font-black text-slate-900">Checkout & Payment</h1>
        <p className="text-xs text-slate-500 mt-1">Review items, select delivery address and payment method</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              1. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800 uppercase">{addr.label}</span>
                    {selectedAddressId === addr.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-900 mt-1">{addr.full_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{addr.house_no}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">{addr.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Pharmacy Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              2. Fulfilling Pharmacy Store
            </h3>

            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  Rx
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">Apollo Pharmacy — Koramangala</h4>
                  <p className="text-slate-500 text-[11px]">Licensed Drug License #KA-BLR-2026-9871</p>
                </div>
              </div>

              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                20–25 min Delivery
              </span>
            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              3. Payment Method
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'Card', label: 'Credit/Debit', icon: CreditCard },
                { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                { id: 'Demo Pay', label: 'Demo Pay', icon: Sparkles }
              ].map(m => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                      isSelected ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold block">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Order Items ({itemsToCheckout.length})</h3>

            <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-slate-100">
              {itemsToCheckout.map((item, idx) => (
                <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={item.image} className="w-10 h-10 rounded-lg object-cover border" />
                    <div>
                      <h4 className="font-bold text-slate-800">{item.medicine_name || item.brand}</h4>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">₹{checkoutSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-800">₹{deliveryFee}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Special Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-600">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isPlacingOrder ? 'Processing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
