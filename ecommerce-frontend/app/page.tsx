'use client';

import React, { useEffect, useState } from 'react';
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import api from '@/utils/api';
import styles from "./page.module.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  rating: number;
  images: string[];
  salePrice?: number;
  isOnSale?: boolean;
  purchaseType?: 'money' | 'points' | 'hybrid';
  pointsPrice?: number;
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [newRes, topRes] = await Promise.all([
          api.get('/products?sortBy=createdAt&sortOrder=desc&limit=4'),
          api.get('/products?sortBy=rating&sortOrder=desc&limit=4')
        ]);
        
        setNewArrivals(newRes.data.products);
        setTopSelling(topRes.data.products);
      } catch (error) {
        console.error('Failed to fetch home products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className={styles.wrapper}>
      <Hero />
      <Brands />
      
      {/* New Arrivals */}
      <section className="container">
        <h2 className="section-title">NEW ARRIVALS</h2>
        {isLoading ? (
          <div className={styles.loading}>Loading latest trends...</div>
        ) : (
          <div className={styles.productGrid}>
            {newArrivals.map((p) => (
              <ProductCard key={p._id} {...p} />
            ))}
          </div>
        )}
        <div className={styles.viewAllRow}>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* Top Selling */}
      <section className="container">
        <h2 className="section-title">TOP SELLING</h2>
        {isLoading ? (
          <div className={styles.loading}>Loading top picks...</div>
        ) : (
          <div className={styles.productGrid}>
            {topSelling.map((p) => (
              <ProductCard key={p._id} {...p} />
            ))}
          </div>
        )}
        <div className={styles.viewAllRow}>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
      </section>

      <CategoryGrid />
      <Testimonials />
      <Footer />
    </div>
  );
}
