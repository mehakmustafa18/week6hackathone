'use client';

import { Star, StarHalf, Minus, Plus, Coins } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './ProductSelection.module.css';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ProductSelectionProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    rating: number;
    salePrice?: number;
    isOnSale?: boolean;
    purchaseType?: 'money' | 'points' | 'hybrid';
    pointsPrice?: number;
    pointsEarned?: number;
    stock: number;
    colors?: { name: string; hex: string; imageUrl: string }[];
    sizes?: string[];
  };
  activeColor?: any;
  setActiveColor?: (color: any) => void;
}

export default function ProductSelection({ product, activeColor, setActiveColor }: ProductSelectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [usePoints, setUsePoints] = useState(product.purchaseType === 'points');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || null);

  const { user } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();

  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const originalPrice = product.isOnSale ? product.price : null;
  const pointsToSpend = product.pointsPrice ? product.pointsPrice * quantity : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<Star key={i} size={18} fill="gold" color="gold" />);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<StarHalf key={i} size={18} fill="gold" color="gold" />);
        } else {
            stars.push(<Star key={i} size={18} color="#ccc" />);
        }
    }
    return stars;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return router.push('/login');
    }

    if ((product.sizes?.length || 0) > 0 && !selectedSize) {
      return toast.error('Please select a size');
    }

    if (usePoints && user.loyaltyPoints < pointsToSpend) {
      return toast.error("Insufficient loyalty points");
    }

    setIsLoading(true);
    try {
      await api.post('/cart/items', {
        productId: product._id,
        quantity,
        usePoints,
      });
      toast.success('Added to cart!');
      refreshCart(); // update navbar badge instantly
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.selection}>
      <h1 className={styles.title}>{product.name}</h1>
      
      <div className={styles.ratingRow}>
        <div className={styles.stars}>{renderStars(product.rating)}</div>
        <span>{product.rating?.toFixed(1) || '0.0'}/5</span>
      </div>

      <div className={styles.priceRow}>
        <span className={styles.price}>${displayPrice}</span>
        {originalPrice && <span className={styles.originalPrice}>${originalPrice}</span>}
        {originalPrice && (
          <span className={styles.discount}>
            -{Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
          </span>
        )}
      </div>

      <p className={styles.description}>{product.description}</p>
      
      {product.colors && product.colors.length > 0 && (
        <>
          <hr className={styles.divider} />
          <div className={styles.variantsSection}>
            <span className={styles.sectionLabel}>Select Colors</span>
            <div className={styles.colorsWrapper}>
              {product.colors.map(color => (
                <button 
                  key={color.name}
                  onClick={() => setActiveColor && setActiveColor(color)}
                  className={`${styles.colorCircle} ${activeColor?.name === color.name ? styles.activeColor : ''}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {activeColor?.name === color.name && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <>
          <hr className={styles.divider} />
          <div className={styles.variantsSection}>
            <span className={styles.sectionLabel}>Choose Size</span>
            <div className={styles.sizesWrapper}>
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`${styles.sizePill} ${selectedSize === size ? styles.activeSize : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {(product.purchaseType === 'points' || product.purchaseType === 'hybrid') && (
        <>
          <hr className={styles.divider} />
          <div className={styles.loyaltyOption}>
            <div className={styles.loyaltyHeader}>
              <div className={styles.loyaltyTitle}>
                <Coins size={20} color="#ffd700" />
                <span>Loyalty Points Offer</span>
              </div>
              <span className={styles.pointsCost}>{product.pointsPrice} pts each</span>
            </div>
            
            <label className={styles.pointToggle}>
              <input 
                type="checkbox" 
                checked={usePoints} 
                onChange={(e) => setUsePoints(e.target.checked)}
                disabled={product.purchaseType === 'points'}
              />
              <span className={styles.toggleLabel}>
                {product.purchaseType === 'points' 
                  ? "This product can only be bought with points" 
                  : "Buy with loyalty points instead of money"}
              </span>
            </label>
            
            {usePoints && (
              <p className={styles.pointCalc}>
                Total cost: <strong>{pointsToSpend} pts</strong> 
                <span className={user && user.loyaltyPoints < pointsToSpend ? styles.error : ''}>
                  (Your balance: {user?.loyaltyPoints || 0} pts)
                </span>
              </p>
            )}
          </div>
        </>
      )}

      {product.purchaseType === 'money' && (
        <p className={styles.earnMsg}>
          🌟 You will earn <strong>{Math.floor(displayPrice * 10)} points</strong> with this purchase!
        </p>
      )}

      <hr className={styles.divider} />

      <div className={styles.actions}>
        <div className={styles.quantity}>
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={20} /></button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={20} /></button>
        </div>
        <button 
          className="btn-black" 
          style={{ flex: 1 }} 
          disabled={isLoading || product.stock === 0}
          onClick={handleAddToCart}
        >
          {product.stock === 0 ? 'Out of Stock' : (isLoading ? 'Adding...' : 'Add to Cart')}
        </button>
      </div>
      
      {product.stock > 0 && product.stock < 10 && (
        <p className={styles.stockWarning}>Only {product.stock} left in stock - order soon!</p>
      )}
    </div>
  );
}
