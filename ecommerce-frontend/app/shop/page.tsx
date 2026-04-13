'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { ChevronRight, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import api from '@/utils/api';
import styles from './page.module.css';

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
  category: string;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const color = searchParams.get('color') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const onSale = searchParams.get('sale') === 'true';
  const purchaseType = searchParams.get('purchaseType') || '';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {

      setIsLoading(true);
      try {
        const params: any = {
          page,
          limit: 9,
          sortBy,
          sortOrder,
        };
        if (category) params.category = category;
        if (color) params.color = color;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (onSale) params.onSale = true;
        if (purchaseType) params.purchaseType = purchaseType;

        const { data } = await api.get('/products', { params });
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, category, color, sortBy, sortOrder, minPrice, maxPrice, onSale, purchaseType]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'popular') {
      params.set('sortBy', 'rating');
      params.set('sortOrder', 'desc');
    } else if (val === 'newest') {
      params.set('sortBy', 'createdAt');
      params.set('sortOrder', 'desc');
    } else if (val === 'price-low') {
      params.set('sortBy', 'price');
      params.set('sortOrder', 'asc');
    } else if (val === 'price-high') {
      params.set('sortBy', 'price');
      params.set('sortOrder', 'desc');
    }
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.breadcrumbs} container`}>
        <Link href="/">Home</Link>
        <ChevronRight size={16} />
        <span>{category || 'All Products'}</span>
      </div>

      <main className={`${styles.main} container`}>
        <div className={styles.sidebarCol}>
          {/* Mobile Filter Toggle Overlay */}
          <div 
            className={`${styles.mobileOverlay} ${isSidebarOpen ? styles.active : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          />
          <FilterSidebar 
            currentCategory={category} 
            currentColor={color}
            currentOnSale={onSale}
            currentPurchaseType={purchaseType}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        <div className={styles.contentCol}>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h2>{category || 'All Products'}</h2>
              <button 
                className={styles.filterToggle}
                onClick={() => setIsSidebarOpen(true)}
              >
                <SlidersHorizontal size={24} />
              </button>
            </div>
            <div className={styles.meta}>

              <p>Showing {(page - 1) * 9 + 1}-{Math.min(page * 9, total)} of {total} Products</p>
              <div className={styles.sort}>
                Sort by: 
                <select 
                  className={styles.sortSelect} 
                  onChange={handleSortChange}
                  value={`${sortBy}-${sortOrder === 'desc' ? 'high' : 'low'}`}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="rating-desc">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loading}>Exploring our collection...</div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className={styles.noResults}>No products found matching your criteria.</div>
              ) : (
                <div className={styles.productGrid}>
                  {products.map((p) => (
                    <ProductCard key={p._id} {...p} />
                  ))}
                </div>
              )}
            </>
          )}

          <hr className={styles.divider} />

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.navBtn} 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft size={20} /> Previous
              </button>
              <div className={styles.pages}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button 
                    key={p}
                    className={p === page ? styles.pageBtnActive : styles.pageBtn}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button 
                className={styles.navBtn} 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container">Loading Shop...</div>}>
      <ShopContent />
      <Footer />
    </Suspense>
  );
}
