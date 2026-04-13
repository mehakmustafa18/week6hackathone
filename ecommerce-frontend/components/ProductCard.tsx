import { Star, StarHalf, Coins } from 'lucide-react';
import styles from './ProductCard.module.css';
import Link from 'next/link';

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  rating: number;
  images?: string[];
  colors?: { name: string; hex: string; imageUrl: string }[];
  salePrice?: number;
  isOnSale?: boolean;
  purchaseType?: 'money' | 'points' | 'hybrid';
  pointsPrice?: number;
}

export default function ProductCard({ 
  _id, 
  name, 
  price, 
  rating, 
  images,
  colors,
  salePrice, 
  isOnSale,
  purchaseType,
  pointsPrice 
}: ProductCardProps) {
  // Prefer color variant image first, then plain images array
  const imageUrl = colors?.[0]?.imageUrl || images?.[0] || '';
  const displayPrice = isOnSale && salePrice ? salePrice : price;
  const originalPrice = isOnSale ? price : null;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<Star key={i} size={16} fill="gold" color="gold" />);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<StarHalf key={i} size={16} fill="gold" color="gold" />);
        } else {
            stars.push(<Star key={i} size={16} color="#ccc" />);
        }
    }
    return stars;
  };

  return (
    <Link href={`/shop/${_id}`} className={styles.card}>
      <div className={styles.imageBox}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <div className={styles.placeholder}>No Image</div>
        )}
        {purchaseType === 'points' && (
          <div className={styles.pointsBadge}>Points Only</div>
        )}
      </div>
      <h3 className={styles.name}>{name}</h3>
      <div className={styles.ratingRow}>
        <div className={styles.stars}>{renderStars(rating)}</div>
        <span className={styles.ratingText}>{rating?.toFixed(1) || '0.0'}/5</span>
      </div>
      <div className={styles.priceRow}>
        <div className={styles.moneyPrice}>
          <span className={styles.price}>${displayPrice}</span>
          {originalPrice && <span className={styles.originalPrice}>${originalPrice}</span>}
          {originalPrice && (
            <span className={styles.discount}>
              -{Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
            </span>
          )}
        </div>
        
        {(purchaseType === 'points' || purchaseType === 'hybrid') && pointsPrice && (
          <div className={styles.pointsPrice}>
            <Coins size={14} color="#ffd700" />
            <span>{pointsPrice} pts</span>
          </div>
        )}
      </div>
    </Link>
  );
}
