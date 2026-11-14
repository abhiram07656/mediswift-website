import React from 'react';
import { Medicine } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { ShoppingCart, Zap, ShieldAlert, Clock, Store, ChevronRight } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  onSelect: (medicine: Medicine) => void;
  onNavigate: (route: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onSelect,
  onNavigate
}) => {
  const { addToCart, triggerBuyNow } = useCart();
  const { addToast } = useNotification();

  const defaultPharmacy = medicine.available_pharmacies?.[0];
  const pharmacyId = defaultPharmacy?.pharmacy_id || 'ph-01';
  const pharmacyName = defaultPharmacy?.pharmacy_name || 'Apollo Pharmacy';
  const deliveryMin = defaultPharmacy?.estimated_delivery_min || 25;

  const discountedPrice = Math.round((medicine.price * (1 - medicine.discount / 100)) * 100) / 100;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(medicine.id, pharmacyId, 1);
    addToast(`Added ${medicine.name} to cart!`, 'success');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerBuyNow(medicine, pharmacyId, pharmacyName);
    onNavigate('/checkout');
  };

  return (
    <div
      onClick={() => onSelect(medicine)}
      className="bg-white rounded-3xl border border-slate-200 shadow-soft hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
    >
      <div>
        {/* Image & Badges */}
        <div className="relative bg-slate-50 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
          <img
            src={medicine.image}
            alt={medicine.name}
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
          />

          {medicine.discount > 0 && (
            <span className="absolute top-3 left-3 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-1 rounded-full shadow-md">
              {medicine.discount}% OFF
            </span>
          )}

          {medicine.prescription_required && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Rx
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="truncate">{medicine.brand}</span>
            <span>{medicine.strength}</span>
          </div>

          <h3 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-emerald-600 transition-colors line-clamp-1">
            {medicine.name}
          </h3>

          <p className="text-[11px] text-slate-500 font-medium italic line-clamp-1">
            {medicine.generic_name}
          </p>

          {/* Delivery & Pharmacy Pill */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-600 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1 text-emerald-700 font-bold truncate">
              <Store className="w-3 h-3" />
              {pharmacyName.split('—')[0]}
            </span>
            <span className="flex items-center gap-0.5 text-slate-500 shrink-0">
              <Clock className="w-3 h-3" />
              {deliveryMin}m
            </span>
          </div>

          {/* Price */}
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900">₹{discountedPrice}</span>
            {medicine.discount > 0 && (
              <span className="text-xs text-slate-400 line-through">₹{medicine.price}</span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={handleAddToCart}
          className="py-2.5 px-2 rounded-2xl border border-emerald-600 text-emerald-700 font-bold text-xs hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Cart
        </button>

        <button
          onClick={handleBuyNow}
          className="py-2.5 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-colors flex items-center justify-center gap-1"
        >
          <Zap className="w-3.5 h-3.5" />
          Buy Now
        </button>
      </div>
    </div>
  );
};
