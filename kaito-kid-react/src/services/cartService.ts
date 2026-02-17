// Service giỏ hàng - wrap localStorage
// Gom logic từ: cart-page.js + product-detail.js addToCart()

import type { CartItem, Product } from '../types';

export const cartService = {
  getCart(): CartItem[] {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  },

  saveCart(cart: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  addItem(product: Product, size: string, color: string, quantity = 1): CartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(
      item => item.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        color,
        quantity,
      });
    }
    this.saveCart(cart);
    return cart;
  },

  updateQuantity(index: number, quantity: number): CartItem[] {
    const cart = this.getCart();
    if (cart[index]) {
      cart[index].quantity = Math.max(1, quantity);
      this.saveCart(cart);
    }
    return cart;
  },

  removeItem(index: number): CartItem[] {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
    return cart;
  },

  clear(): void {
    localStorage.removeItem('cart');
  },

  getTotalItems(): number {
    return this.getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
  },

  getSubtotal(): number {
    return this.getCart().reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  },
};
