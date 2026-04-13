'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartItem from '@/components/CartItem';
import OrderSummary from '@/components/OrderSummary';
import Footer from '@/components/Footer';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import styles from './page.module.css';

interface CartItemData {
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    pointsPrice?: number;
    colors?: { name: string; hex: string; imageUrl: string }[];
  };
  quantity: number;
  usePoints: boolean;
  priceAtTime: number;
  pointsPriceAtTime: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
    }
    fetchCart();
  }, [user]);

  const removeProduct = async (productId: string) => {
    try {
      await api.delete(`/cart/items/${productId}`);
      toast.success('Item removed from cart');
      fetchCart();
      refreshCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await api.patch('/cart/items', { productId, quantity });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  if (!user && !isLoading) {
    return (
      <div className="container" style={{ padding: '10rem 1rem', textAlign: 'center' }}>
        <h2>Please login to view your cart</h2>
        <Link href="/login" className="btn-black" style={{ marginTop: '2rem', display: 'inline-block', padding: '1rem 3rem' }}>
          Login Now
        </Link>
      </div>
    );
  }

  if (isLoading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading your bag...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '10rem 1rem', textAlign: 'center' }}>
        <ShoppingBag size={64} style={{ marginBottom: '2rem', opacity: 0.2 }} />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link href="/shop" className="btn-black" style={{ marginTop: '2rem', display: 'inline-block', padding: '1rem 3rem' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.breadcrumbs} container`}>
        <Link href="/">Home</Link>
        <ChevronRight size={16} />
        <span>Cart</span>
      </div>

      <main className={`${styles.main} container`}>
        <h1 className={styles.title}>YOUR CART</h1>
        
        <div className={styles.layout}>
          <div className={styles.itemsCol}>
            <div className={styles.itemsBox}>
              {cart.items.map((item: CartItemData) => (
                <CartItem 
                  key={item.product._id} 
                  productId={item.product._id}
                  name={item.product.name}
                  price={item.priceAtTime}
                  imageUrl={item.product.colors?.[0]?.imageUrl || item.product.images?.[0]}
                  quantity={item.quantity}
                  usePoints={item.usePoints}
                  pointsPrice={item.pointsPriceAtTime}
                  onRemove={() => removeProduct(item.product._id)}
                  onUpdateQuantity={(qty) => updateQuantity(item.product._id, qty)}
                />
              ))}
            </div>
          </div>
          
          <div className={styles.summaryCol}>
            <OrderSummary 
              totalAmount={cart.totalAmount} 
              discount={0} 
              totalPointsUsed={cart.totalPoints}
              itemCount={cart.items.length}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
