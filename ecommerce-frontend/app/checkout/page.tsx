'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, CreditCard, Truck, Coins } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import styles from './page.module.css';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Pakistan',
    phone: '',
    paymentMethod: 'cash', // Default to cash as per plan
  });

  useEffect(() => {
    if (user && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.name || '' }));
    }
  }, [user, formData.name]);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const { data } = await api.get('/cart');
        if (data.items.length === 0) {
          router.push('/cart');
          return;
        }
        setCart(data);
      } catch (error) {
        console.error('Checkout fetch error:', error);
        router.push('/cart');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCheckoutData();
    } else {
      router.push('/login?redirect=/checkout');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const orderData = {
        items: cart.items.map((item: any) => ({
          productId: item.product._id,
          quantity: item.quantity,
          usePoints: item.usePoints
        })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        notes: '',
      };

      const { data } = await api.post('/orders', orderData);
      toast.success('🎉 Order created successfully!');
      
      // Manually clear local cart state for immediate UI feedback
      setCart({ items: [], totalAmount: 0, totalPoints: 0 });
      
      // Handle Stripe redirect
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Handle orders with 0 money (points only) or non-stripe payments
        toast.success(`Order placed successfully! Order #${data.orderNumber}`);
        // Refresh user to update loyalty points balance and clear cart count
        await refreshUser();
        await refreshCart();
        // Cart is cleared by backend
        router.push(`/profile?orderId=${data._id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Preparing your checkout...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.breadcrumbs} container`}>
        <Link href="/cart">Cart</Link>
        <ChevronRight size={16} />
        <span>Checkout</span>
      </div>

      <main className={`${styles.main} container`}>
        <h1 className={styles.title}>CHECKOUT</h1>

        <form onSubmit={handleSubmit} className={styles.layout}>
          <div className={styles.checkoutForm}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}><Truck size={20} /> Shipping Address</h2>
              <div className={styles.grid}>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Full Name</label>
                  <input name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
                </div>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Street Address</label>
                  <input name="street" required value={formData.street} onChange={handleChange} placeholder="House 123, Street 45..." />
                </div>
                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input name="city" required value={formData.city} onChange={handleChange} placeholder="Karachi" />
                </div>
                <div className={styles.inputGroup}>
                  <label>State / Province</label>
                  <input name="state" required value={formData.state} onChange={handleChange} placeholder="Sindh" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Zip Code</label>
                  <input name="zip" required value={formData.zip} onChange={handleChange} placeholder="75500" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Phone Number</label>
                  <input name="phone" required value={formData.phone} onChange={handleChange} placeholder="+92 3XX XXXXXXX" />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}><CreditCard size={20} /> Payment Method</h2>
              <div className={styles.paymentOptions}>
                <label className={styles.paymentOption}>
                  <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleChange} />
                  <div className={styles.paymentInfo}>
                    <p className={styles.paymentLabel}>Cash on Delivery</p>
                    <p className={styles.paymentDesc}>Pay when you receive the package.</p>
                  </div>
                </label>
                
                <label className={`${styles.paymentOption} ${cart?.totalAmount === 0 ? styles.disabledOption : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="stripe" 
                    checked={formData.paymentMethod === 'stripe'} 
                    onChange={handleChange}
                    disabled={cart?.totalAmount === 0}
                  />
                  <div className={styles.paymentInfo}>
                    <p className={styles.paymentLabel}>Credit / Debit Card {cart?.totalAmount === 0 && <span style={{ fontSize: '0.7rem', color: '#e53935' }}>(Not available for $0 orders)</span>}</p>
                    <p className={styles.paymentDesc}>Secure payment via Stripe.</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <aside className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3>Review Order</h3>
              <div className={styles.itemList}>
                {cart.items.map((item: any) => (
                  <div key={item.product._id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.product.name} x {item.quantity}</p>
                      {item.usePoints && (
                        <span className={styles.pointsFlag}>
                          <Coins size={12} /> Paid with Points
                        </span>
                      )}
                    </div>
                    <span>{item.usePoints ? '0.00' : `$${(item.priceAtTime * item.quantity).toFixed(2)}`}</span>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>$15.00</span>
                </div>
                {cart.totalPoints > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.pointsLabel}>Loyalty Points Used</span>
                    <span>{cart.totalPoints} pts</span>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>${(cart.totalAmount + 15).toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.loyaltyNotice}>
                🌟 You'll earn <strong>{Math.floor(cart.totalAmount * 10)}</strong> loyalty points from this order!
              </div>

              <button type="submit" className="btn-black" disabled={isSubmitting} style={{ width: '100%', marginTop: '1.5rem' }}>
                {isSubmitting ? 'Processing Order...' : 'Complete Order'}
              </button>
            </div>
          </aside>
        </form>
      </main>

      <Footer />
    </div>
  );
}
