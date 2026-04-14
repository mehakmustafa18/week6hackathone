'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Package, Truck, Calendar, Coins, CreditCard, MapPin } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import Footer from '@/components/Footer';
import styles from '../../page.module.css';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  if (isLoading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading order details...</div>;
  if (!order) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Order not found.</div>;

  return (
    <div className={styles.wrapper}>
      <header className={`${styles.profileHeader} ${styles.orderDetailHeader}`}>
        <div className="container">
          <Link href="/profile" className={styles.backLink}>
            <ChevronLeft size={20} /> Back to Profile
          </Link>
          <div className={styles.orderDetailHeaderInner}>
            <div>
              <h1 className={styles.orderDetailTitle}>Order Details</h1>
              <p className={styles.orderDetailSubtitle}>Order #{order.orderNumber}</p>
            </div>
            <div className={`${styles.status} ${styles[order.status.toLowerCase()]}`} style={{ fontSize: '1rem', padding: '0.6rem 1.5rem' }}>
              {order.status}
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className={styles.orderDetailGrid}>
          <div className={styles.orderDetailMain}>
            {/* Items Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Package size={22} /> Items Ordered
              </h2>
              <div className={styles.itemsList}>
                {order.items.map((item: any, i: number) => (
                  <div key={i} className={styles.itemRow}>
                    <div className={styles.itemImage}>
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} />
                      ) : (
                        <Package size={30} opacity={0.2} />
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <h3>{item.productName}</h3>
                      <p>Quantity: {item.quantity}</p>
                      {item.paidWithPoints && (
                        <span className={styles.pointsBadge}>
                          <Coins size={12} style={{ display: 'inline', marginRight: '4px' }} /> Paid with Points
                        </span>
                      )}
                    </div>
                    <div className={styles.itemPrice}>
                      {item.paidWithPoints ? '$0.00' : `$${(item.price * item.quantity).toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className={styles.infoGrid}>
               <div className={styles.infoCard}>
                 <h3 className={styles.infoCardTitle}>
                   <MapPin size={18} /> Shipping Address
                 </h3>
                 <div className={styles.infoCardBody}>
                   <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{order.shippingAddress.name}</p>
                   <p>{order.shippingAddress.street}</p>
                   <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                   <p>{order.shippingAddress.country}</p>
                   <p style={{ marginTop: '0.5rem' }}>Phone: {order.shippingAddress.phone}</p>
                 </div>
               </div>
               <div className={styles.infoCard}>
                 <h3 className={styles.infoCardTitle}>
                   <CreditCard size={18} /> Payment Info
                 </h3>
                 <div className={styles.infoCardBody}>
                   <p><span style={{ color: '#888' }}>Method:</span> <strong style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</strong></p>
                   <p><span style={{ color: '#888' }}>Status:</span> <strong style={{ color: order.paymentStatus === 'paid' ? '#43a047' : '#e53935', textTransform: 'capitalize' }}>{order.paymentStatus}</strong></p>
                   {order.stripePaymentIntentId && (
                     <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem', wordBreak: 'break-all' }}>ID: {order.stripePaymentIntentId}</p>
                   )}
                 </div>
               </div>
            </div>
          </div>

          <aside>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span style={{ color: '#666' }}>Items Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span style={{ color: '#666' }}>Shipping</span>
                  <span>$15.00</span>
                </div>
                {order.totalPointsUsed > 0 && (
                  <div className={styles.summaryRow} style={{ color: '#b8860b' }}>
                    <span>Points Used</span>
                    <span>-{order.totalPointsUsed} pts</span>
                  </div>
                )}
                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span>${(order.totalAmount + 15).toFixed(2)}</span>
                </div>
              </div>

              {order.totalPointsEarned > 0 && (
                <div className={styles.pointsEarnedBanner}>
                   🌟 You earned {order.totalPointsEarned} loyalty points from this order!
                </div>
              )}

              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div className={styles.orderInfoRow}>
                   <Calendar size={16} />
                   <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className={styles.orderInfoRow}>
                   <Truck size={16} />
                   <span>Estimated delivery: 3-5 business days</span>
                 </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
