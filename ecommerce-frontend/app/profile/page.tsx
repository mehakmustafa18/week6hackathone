'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Coins, User as UserIcon, Calendar, Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import Footer from '@/components/Footer';
import styles from './page.module.css';

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  totalPointsUsed: number;
  totalPointsEarned: number;
  status: string;
  createdAt: string;
  items: any[];
}

function ProfileContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '10rem 1rem', textAlign: 'center' }}>
        <h2>Please login to view your profile</h2>
        <Link href="/login" className="btn-black" style={{ marginTop: '2rem', display: 'inline-block', padding: '1rem 3rem' }}>
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.profileHeader}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
                <div className={styles.badge}>{user.role}</div>
              </div>
            </div>
            
            <div className={styles.pointsCard}>
              <div className={styles.pointsInfo}>
                <Coins size={32} color="#ffd700" />
                <div>
                  <p>Available Balance</p>
                  <h3>{user.loyaltyPoints} Points</h3>
                </div>
              </div>
              <Link href="/shop?purchaseType=points" className={styles.redeemBtn}>
                Redeem Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className={styles.profileLayout}>
          <div className={styles.sidebar}>
            <nav className={styles.nav}>
              <button className={`${styles.navItem} ${styles.active}`}>
                <ShoppingBag size={20} /> My Orders
              </button>
              <button className={styles.navItem}>
                <UserIcon size={20} /> Account Settings
              </button>
            </nav>
          </div>

          <div className={styles.content}>
            <div className={styles.sectionHeader}>
              <h2>Order History</h2>
              <p>Manage your orders and tracking status</p>
            </div>

            {isLoading ? (
              <div className={styles.loading}>Retrieving your order history...</div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <ShoppingBag size={48} opacity={0.2} />
                <p>You haven't placed any orders yet.</p>
                <Link href="/shop" className="btn-black">Start Shopping</Link>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map((order) => (
                  <div 
                    key={order._id} 
                    className={`${styles.orderCard} ${highlightedOrderId === order._id ? styles.highlight : ''}`}
                  >
                    <div className={styles.orderTop}>
                      <div className={styles.orderMeta}>
                        <div>
                          <p className={styles.label}>Order #</p>
                          <p className={styles.val}>{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className={styles.label}>Date</p>
                          <p className={styles.val}>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className={styles.label}>Total</p>
                          <p className={styles.val}>${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                        {order.status}
                      </div>
                    </div>
                    
                    <div className={styles.orderItems}>
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className={styles.miniItem}>
                           {item.productName || 'Product'} x {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className={styles.moreItems}>+ {order.items.length - 3} more items</div>
                      )}
                    </div>

                    <div className={styles.orderBottom}>
                      <div className={styles.pointsSummary}>
                        {order.totalPointsEarned > 0 && (
                          <span className={styles.earned}>🌟 +{order.totalPointsEarned} earned</span>
                        )}
                        {order.totalPointsUsed > 0 && (
                          <span className={styles.used}>💎 -{order.totalPointsUsed} used</span>
                        )}
                      </div>
                      <Link href={`/profile/orders/${order._id}`} className={styles.detailsLink}>
                        View Details <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <Suspense fallback={<div className="container">Loading Profile...</div>}>
        <ProfileContent />
      </Suspense>
      <Footer />
    </>
  );
}
