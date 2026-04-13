'use client';

import { Trash2, Minus, Plus, Coins } from 'lucide-react';
import styles from './CartItem.module.css';

interface CartItemProps {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  usePoints: boolean;
  pointsPrice?: number;
  onRemove: () => void;
  onUpdateQuantity: (newQty: number) => void;
}

export default function CartItem({ 
  name, 
  price, 
  imageUrl, 
  quantity, 
  usePoints, 
  pointsPrice,
  onRemove,
  onUpdateQuantity 
}: CartItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.imageBox}>
        {imageUrl ? <img src={imageUrl} alt={name} /> : <div className={styles.placeholder}>Item</div>}
      </div>
      
      <div className={styles.details}>
        <div className={styles.header}>
          <h3>{name}</h3>
          <button className={styles.deleteBtn} onClick={onRemove} title="Remove item">
            <Trash2 size={20} />
          </button>
        </div>
        
        <div className={styles.metaRow}>
          {usePoints ? (
            <div className={styles.pointsLabel}>
              <Coins size={14} color="#ffd700" />
              <span>Paid with {pointsPrice} pts</span>
            </div>
          ) : (
            <span className={styles.moneyLabel}>Standard Purchase</span>
          )}
        </div>
        
        <div className={styles.bottomRow}>
          <span className={styles.price}>
            {usePoints ? '0.00' : `$${price}`}
          </span>
          <div className={styles.quantity}>
            <button onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}><Minus size={18} /></button>
            <span>{quantity}</span>
            <button onClick={() => onUpdateQuantity(quantity + 1)}><Plus size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
