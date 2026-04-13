'use client';

import { Tag, ArrowRight, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './OrderSummary.module.css';

interface OrderSummaryProps {
  totalAmount: number;
  discount: number;
  totalPointsUsed?: number;
  itemCount: number;
}

export default function OrderSummary({ totalAmount, discount, totalPointsUsed, itemCount }: OrderSummaryProps) {
  const router = useRouter();
  const deliveryFee = totalAmount > 0 ? 15 : 0;
  const grandTotal = totalAmount + deliveryFee;

  return (
    <div className={styles.card}>
      <h3>Order Summary</h3>
      
      <div className={styles.rows}>
        <div className={styles.row}>
          <span>Subtotal ({itemCount} items)</span>
          <span className={styles.value}>${totalAmount + discount}</span>
        </div>
        {discount > 0 && (
          <div className={styles.row}>
            <span>Discount</span>
            <span className={`${styles.value} ${styles.discount}`}>-${discount}</span>
          </div>
        )}
        <div className={styles.row}>
          <span>Delivery Fee</span>
          <span className={styles.value}>${deliveryFee === 0 ? 'Free' : `$${deliveryFee}`}</span>
        </div>
        {totalPointsUsed && totalPointsUsed > 0 ? (
          <div className={styles.row}>
            <div className={styles.pointsLabel}>
              <Coins size={14} color="#ffd700" />
              <span>Loyalty Points Used</span>
            </div>
            <span className={styles.value}>{totalPointsUsed} pts</span>
          </div>
        ) : null}
      </div>
      
      <hr className={styles.divider} />
      
      <div className={`${styles.row} ${styles.totalRow}`}>
        <span>Total</span>
        <span className={styles.totalValue}>${grandTotal}</span>
      </div>
      
      <div className={styles.promo}>
        <div className={styles.promoInput}>
          <Tag size={20} color="#666" />
          <input type="text" placeholder="Add promo code" />
        </div>
        <button className="btn-black" style={{ padding: '0.75rem 2rem' }}>Apply</button>
      </div>
      
      <button 
        className={`${styles.checkoutBtn} btn-black`}
        onClick={() => router.push('/checkout')}
        disabled={itemCount === 0}
      >
        Go to Checkout <ArrowRight size={20} />
      </button>
    </div>
  );
}
