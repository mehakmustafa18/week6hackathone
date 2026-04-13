'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType>({ cartCount: 0, refreshCart: () => {} });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await api.get('/cart');
      const count = data?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
      setCartCount(count);
    } catch {
      // Silently fail — user may be offline or cart is empty
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
