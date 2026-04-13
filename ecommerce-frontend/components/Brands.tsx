import styles from './Brands.module.css';

export default function Brands() {
  const brands = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein'];
  
  return (
    <div className={styles.brandsBar}>
      <div className={`${styles.container} container`}>
        {brands.map(brand => (
          <span key={brand} className={styles.brandName}>{brand}</span>
        ))}
      </div>
    </div>
  );
}
