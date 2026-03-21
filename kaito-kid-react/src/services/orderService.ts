// Service đơn hàng - wrap localStorage
// Gom logic từ: checkout-page.js + order-tracking.js + admin-orders.js

import type { Order, CartItem } from '../types';

export const orderService = {
  getAll(): Order[] {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  },

  saveAll(orders: Order[]): void {
    localStorage.setItem('orders', JSON.stringify(orders));
  },

  getById(id: string): Order | undefined {
    return this.getAll().find(o => o.id === id);
  },

  // Lấy đơn hàng của user theo phone/email - từ order-tracking.js
  getByUser(phone?: string, email?: string): Order[] {
    return this.getAll().filter(
      o => o.customer?.phone === phone || o.customer?.email === email
    );
  },

  create(orderData: {
    customer: Order['customer'];
    items: CartItem[];
    total: number;
    subtotal: number;
    shippingFee: number;
    discount: number;
    couponCode?: string;
    paymentMethod: string;
    note?: string;
  }): Order {
    const orders = this.getAll();
    const order: Order = {
      id: 'ORD' + Date.now(),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    this.saveAll(orders);
    return order;
  },

  updateStatus(id: string, status: Order['status']): Order | undefined {
    const orders = this.getAll();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.saveAll(orders);
    }
    return order;
  },

  delete(id: string): void {
    const orders = this.getAll().filter(o => o.id !== id);
    this.saveAll(orders);
  },

  // Thống kê cho dashboard - từ admin-dashboard.js
  getStats() {
    const orders = this.getAll();
    const today = new Date().toISOString().split('T')[0];

    let todayRevenue = 0;
    let pending = 0;
    let shipping = 0;
    let completed = 0;
    let cancelled = 0;

    orders.forEach(order => {
      const orderDate = order.createdAt?.split('T')[0] || '';
      if (orderDate === today) todayRevenue += order.total || 0;

      switch (order.status) {
        case 'pending': pending++; break;
        case 'confirmed':
        case 'shipping': shipping++; break;
        case 'completed': completed++; break;
        case 'cancelled': cancelled++; break;
      }
    });

    return { todayRevenue, pending, shipping, completed, cancelled, total: orders.length };
  },
};
