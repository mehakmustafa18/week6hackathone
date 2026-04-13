'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Tag, Users, DollarSign, TrendingUp, Package } from 'lucide-react';
import api from '@/utils/api';
import styles from './admin.module.css';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts?: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          api.get('/orders/admin/stats'),
          api.get('/orders/admin/all?limit=5'),
          api.get('/products?limit=1')
        ]);
        
        setStats({
          ...statsRes.data,
          totalProducts: productsRes.data.total
        });
        setRecentOrders(ordersRes.data.orders);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <div className={styles.loading}>Loading analytics...</div>;

  const statCards = [
    { label: 'Total Revenue', value: `$${stats?.totalRevenue.toFixed(2)}`, icon: <DollarSign size={24} />, color: '#43a047' },
    { label: 'Total Orders', value: stats?.totalOrders, icon: <ShoppingCart size={24} />, color: '#1e88e5' },
    { label: 'Total Products', value: stats?.totalProducts, icon: <Package size={24} />, color: '#fbc02d' },
    { label: 'Pending Orders', value: stats?.pendingOrders, icon: <TrendingUp size={24} />, color: '#e53935' },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Dashboard Overview</h1>
        <div className={styles.dateRange}>Last 30 Days</div>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map((stat, i) => (
          <div key={i} className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <h3 className={styles.statValue}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionContainer}>
        <div className={styles.recentTable}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Recent Orders</h2>
            <button className={styles.viewAllLink}>View All</button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Points Used</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.user?.name || 'Guest'}</td>
                  <td>
                    <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>{order.totalPointsUsed} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.quickActions}>
          <div className={styles.card}>
            <h3 className={styles.tableTitle}>Quick Actions</h3>
            <div className={styles.actionGrid}>
              <button onClick={() => window.location.href='/admin/products'}>Add New Product</button>
              <button onClick={() => window.location.href='/admin/orders'}>Manage Shipments</button>
              <button>Broadcast Sale Notification</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
