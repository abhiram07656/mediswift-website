import React, { useState } from 'react';
import { Medicine } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  ShieldAlert,
  Store,
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  isOpen,
  onClose,
  onNavigate
}) => {
  const { addToCart, triggerBuyNow } = useCart();
  const { addToast } = useNotification();
  const [quantity, setQuantity] = useState(1);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');

  if (!isOpen || !medicine) return null;

  const defaultPharmacy = medicine.available_pharmacies?.[0];
  const activePharmacyId = selectedPharmacyId || defaultPharmacy?.pharmacy_id || 'ph-01';
  const activePharmacyName = defaultPharmacy?.pharmacy_name || 'Apollo Pharmacy Koramangala';

  const discountedPrice = Math.round((medicine.price * (1 - medicine.discount / 100)) * 100) / 100;

  const handleAddToCart = async () => {
    await addToCart(medicine.id, activePharmacyId, quantity);
    addToast(`Added ${quantity} x ${medicine.name} to cart!`, 'success');
  };

  const handleBuyNow = () => {
    triggerBuyNow(medicine, activePharmacyId, activePharmacyName);
    onClose();
    onNavigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 shadow-md border border-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image & Badges */}
          <div className="bg-slate-50 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
            <img
              src={medicine.image}
              alt={medicine.name}
              className="w-48 h-48 object-cover rounded-2xl shadow-md border border-white"
            />

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {medicine.prescription_required && (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Prescription Required
                </span>
              )}

              {medicine.discount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                  {medicine.discount}% OFF
                </span>
              )}
            </div>

            {/* Disclaimer note */}
            <p className="text-[10px] text-slate-400 text-center mt-6 italic">
              *Disclaimer: Please consult a registered doctor or pharmacist before consumption.
            </p>
          </div>

          {/* Details & Action */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <span>{medicine.brand}</span>
                <span>•</span>
                <span>{medicine.strength}</span>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 mt-1 leading-snug">{medicine.name}</h2>
              <p className="text-xs text-slate-500 font-medium italic mt-0.5">{medicine.generic_name}</p>
              <p className="text-xs text-slate-400 mt-1">Mfg: {medicine.manufacturer}</p>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">₹{discountedPrice}</span>
                {medicine.discount > 0 && (
                  <span className="text-sm text-slate-400 line-through font-semibold">₹{medicine.price}</span>
                )}
                <span className="text-xs text-slate-500 font-medium">/ strip</span>
              </div>

              {/* Pharmacy availability */}
              <div className="mt-4 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <Store className="w-4 h-4" />
                    Available Nearby
                  </span>
                  <span className="text-emerald-700 font-extrabold">⚡ 20–30 min delivery</span>
                </div>
                <p className="text-[11px] text-slate-600">Delivered from {activePharmacyName}</p>
              </div>

              {/* Uses & Warnings Tabs */}
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    Uses:
                  </h4>
                  <p className="text-slate-600 mt-0.5">{medicine.uses}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1 text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Important Warnings:
                  </h4>
                  <p className="text-slate-600 mt-0.5">{medicine.warnings}</p>
                </div>
              </div>
            </div>

            {/* Quantity & Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Quantity</span>
                <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-sm text-slate-800 w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-2xl border-2 border-emerald-600 text-emerald-700 font-extrabold text-xs hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
