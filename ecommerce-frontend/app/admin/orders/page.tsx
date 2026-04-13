'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, RefreshCw, Filter, Calendar } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import styles from '../admin.module.css';

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      
      const { data } = await api.get('/orders/admin/all', { params });
      setOrders(data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Orders Management</h1>
        <div className={styles.headerActions}>
          <button className={styles.actionBtn} onClick={fetchOrders}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.search}>
          <Search size={20} color="#666" />
          <input 
            type="text" 
            placeholder="Search by Order #, Customer Name or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filter}>
          <Filter size={20} color="#666" style={{ marginRight: '0.5rem' }} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className={styles.recentTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Fetching orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No orders found.</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id}>
                <td style={{ fontWeight: 700 }}>{order.orderNumber}</td>
                <td>
                  <div>
                    <p style={{ fontWeight: 600 }}>{order.user?.name || 'Guest User'}</p>
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>{order.user?.email}</p>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <Calendar size={14} color="#666" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ fontWeight: 700 }}>${order.totalAmount.toFixed(2)}</td>
                <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>{order.paymentMethod}</td>
                <td>
                  <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select 
                      className={styles.statusSelect}
                      value={order.status.toLowerCase()}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option value="confirmed">Confirm</option>
                      <option value="shipped">Ship</option>
                      <option value="delivered">Deliver</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                    <button className={styles.iconBtn} title="View Details"><Eye size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
