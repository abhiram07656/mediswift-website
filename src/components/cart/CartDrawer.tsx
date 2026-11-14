import React from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, X, Plus, Minus, Trash2, ShieldAlert, ArrowRight, Store } from 'lucide-react';

interface CartDrawerProps {
  onNavigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { items, summary, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();

  if (!isCartOpen) return null;

  const hasRxItem = items.some(i => i.prescription_required);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Your Cart</h3>
                <p className="text-xs text-slate-500">{summary.item_count} items in cart</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Rx Warning Notice */}
          {hasRxItem && (
            <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Prescription Required</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Some items in your cart require a doctor prescription. You will be asked to upload your prescription during checkout.
                </p>
              </div>
            </div>
          )}

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Your cart is empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Search for medicines or browse categories to add items to your cart.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('/medicines');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-200"
                >
                  Browse Medicines
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 relative group"
                >
                  <img
                    src={item.image}
                    alt={item.medicine_name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{item.medicine_name}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">{item.brand} • {item.strength}</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-0.5">
                      <Store className="w-3 h-3" />
                      <span className="truncate">{item.pharmacy_name}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-slate-900 text-xs">₹{item.discounted_price}</span>
                        {item.discount > 0 && (
                          <span className="text-[10px] text-slate-400 line-through">₹{item.price}</span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-sm"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary & Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{summary.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-slate-800">₹{summary.delivery_fee}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-emerald-600">₹{summary.total}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('/checkout');
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
