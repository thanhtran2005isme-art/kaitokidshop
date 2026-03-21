// CartContext - thay thế cart logic rải rác ở cart-page.js, product-detail.js, auth-check.js

import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartService } from '../services/cartService';
import type { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, size: string, color: string, qty?: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(cartService.getCart());

  // Sync với localStorage mỗi khi cart thay đổi
  useEffect(() => {
    cartService.saveCart(cart);
  }, [cart]);

  const addItem = (product: Product, size: string, color: string, qty = 1) => {
    const updated = cartService.addItem(product, size, color, qty);
    setCart([...updated]);
  };

  const updateQuantity = (index: number, qty: number) => {
    const updated = cartService.updateQuantity(index, qty);
    setCart([...updated]);
  };

  const removeItem = (index: number) => {
    const updated = cartService.removeItem(index);
    setCart([...updated]);
  };

  const clearCart = () => {
    setCart([]);
    cartService.clear();
  };

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cart, totalItems, subtotal, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
