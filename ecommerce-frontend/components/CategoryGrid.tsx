import styles from './CategoryGrid.module.css';

interface Category {
  name: string;
  imageUrl: string;
  size: 'small' | 'large';
  id: string;
}

export default function CategoryGrid() {
  const categories: Category[] = [
    { name: 'Casual', size: 'small', imageUrl: '/assets/casual.png', id: 'imgCasual' },
    { name: 'Formal', size: 'large', imageUrl: '/assets/formal.png', id: 'imgFormal' },
    { name: 'Party', size: 'large', imageUrl: '/assets/party.png', id: 'imgParty' },
    { name: 'Gym', size: 'small', imageUrl: '/assets/gym.png', id: 'imgGym' },
  ];

  return (
    <section className="container" id="dress-style">
      <div className={styles.sectionBox}>
        <h2 className={styles.title}>BROWSE BY DRESS STYLE</h2>
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              className={`${styles.categoryCard} ${styles[cat.size]}`}
            >
              <h3 className={styles.catName}>{cat.name}</h3>
              <img src={cat.imageUrl} alt={cat.name} className={`${styles.catImage} ${styles[cat.id]}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
