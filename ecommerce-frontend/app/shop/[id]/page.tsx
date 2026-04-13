'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProductGallery from "@/components/ProductGallery";
import ProductSelection from "@/components/ProductSelection";
import ReviewSection from "@/components/ReviewSection";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import api from '@/utils/api';
import styles from "./page.module.css";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  images: string[];
  category: string;
  stock: number;
  salePrice?: number;
  isOnSale?: boolean;
  purchaseType?: 'money' | 'points' | 'hybrid';
  pointsPrice?: number;
  pointsEarned?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeColor, setActiveColor] = useState<any>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const productRes = await api.get(`/products/${id}`);
        const currentProduct = productRes.data;
        setProduct(currentProduct);
        if (currentProduct.colors?.length > 0) {
           setActiveColor(currentProduct.colors[0]);
        }

        // Fetch recommendations from same category
        const recRes = await api.get(`/products?category=${currentProduct.category}&limit=4`);
        // Filter out current product from recommendations
        setRecommendations(recRes.data.products.filter((p: any) => p._id !== id));
      } catch (error) {
        console.error('Failed to fetch product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  if (isLoading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading dynamic product experience...</div>;
  if (!product) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Product not found.</div>;

  return (
    <div className={styles.wrapper}>
      {/* Breadcrumbs */}
      <div className={`${styles.breadcrumbs} container`}>
        <Link href="/">Home</Link>
        <ChevronRight size={16} />
        <Link href="/shop">Shop</Link>
        <ChevronRight size={16} />
        <Link href={`/shop?category=${product.category}`}>{product.category}</Link>
        <ChevronRight size={16} />
        <span>{product.name}</span>
      </div>

      {/* Main Product Section */}
      <section className="container">
        <div className={styles.productLayout}>
          <div className={styles.galleryCol}>
            <ProductGallery images={product.images} activeColorImage={activeColor?.imageUrl} colors={product.colors} />
          </div>
          <div className={styles.selectionCol}>
            <ProductSelection product={product} activeColor={activeColor} setActiveColor={setActiveColor} />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewSection productId={product._id} initialReviews={product.reviews || []} />

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="container">
          <h2 className="section-title">YOU MIGHT ALSO LIKE</h2>
          <div className={styles.recommendationGrid}>
            {recommendations.map((p) => (
              <ProductCard key={p._id} {...p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
