import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary, Medicine } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface BuyNowItem {
  medicine: Medicine;
  pharmacyId: string;
  pharmacyName: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (medicineId: string, pharmacyId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  buyNowItem: BuyNowItem | null;
  setBuyNowItem: (item: BuyNowItem | null) => void;
  triggerBuyNow: (medicine: Medicine, pharmacyId: string, pharmacyName: string) => void;
}

const defaultSummary: CartSummary = {
  subtotal: 0,
  delivery_fee: 0,
  total: 0,
  item_count: 0
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setSummary(defaultSummary);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getCart();
      setItems(data.items);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (medicineId: string, pharmacyId: string, quantity = 1) => {
    if (!user) return;
    try {
      await api.addToCart(medicineId, pharmacyId, quantity);
      await fetchCart();
      setIsCartOpen(true);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await api.updateCartItem(cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await api.removeFromCart(cartItemId);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      await fetchCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const triggerBuyNow = (medicine: Medicine, pharmacyId: string, pharmacyName: string) => {
    setBuyNowItem({
      medicine,
      pharmacyId,
      pharmacyName,
      quantity: 1
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
        buyNowItem,
        setBuyNowItem,
        triggerBuyNow
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
