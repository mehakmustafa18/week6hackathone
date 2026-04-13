'use client';

import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={`${styles.content} container`}>
        <div className={styles.textSide}>
          <h1 className={styles.title}>
            FIND CLOTHES<br />THAT MATCHES<br />YOUR STYLE
          </h1>
          <p className={styles.description}>
            Browse through our diverse range of meticulously crafted garments, 
            designed to bring out your individuality and cater to your sense of style.
          </p>
          <button className="btn-black">Shop Now</button>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <h3>200+</h3>
              <p>International Brands</p>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <h3>2,000+</h3>
              <p>High-Quality Products</p>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <h3>30,000+</h3>
              <p>Happy Customers</p>
            </div>
          </div>
        </div>

        <div className={styles.imageSide}>
          {/* Main Hero Image */}
          <div className={styles.heroImageContainer}>
            <img src="/assets/home bg.jpg" alt="Fashion models" className={styles.heroImage} />
            {/* Design Stars */}
            <div className={styles.starOne}>✦</div>
            <div className={styles.starTwo}>✦</div>
          </div>
        </div>
      </div>
    </section>
  );
}
