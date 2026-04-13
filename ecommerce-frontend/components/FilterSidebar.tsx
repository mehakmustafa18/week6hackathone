'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight, SlidersHorizontal, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import styles from './FilterSidebar.module.css';

interface FilterSidebarProps {
  currentCategory: string;
  currentColor: string;
  currentOnSale: boolean;
  currentPurchaseType: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const COMMON_COLORS = [

  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
];

export default function FilterSidebar({ 
  currentCategory, 
  currentColor, 
  currentOnSale, 
  currentPurchaseType,
  isOpen,
  onClose
}: FilterSidebarProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories');
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const updateFilters = (key: string, value: string | boolean | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '' || value === false) {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
    if (onClose) onClose(); // Close drawer on mobile after selection
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <h3>Filters</h3>
        <div className={styles.headerActions}>
          <SlidersHorizontal size={20} />
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
      </div>


      <hr className={styles.divider} />

      <div className={styles.section}>
        <h4>Categories</h4>
        <ul className={styles.categoryList}>
          <li 
            className={!currentCategory ? styles.activeItem : ''} 
            onClick={() => updateFilters('category', null)}
          >
            All Categories <ChevronRight size={16} />
          </li>
          {categories.map(cat => (
            <li 
              key={cat} 
              className={currentCategory === cat ? styles.activeItem : ''}
              onClick={() => updateFilters('category', cat)}
            >
              {cat} <ChevronRight size={16} />
            </li>
          ))}
        </ul>
      </div>

      <hr className={styles.divider} />

      <div className={styles.priceSection}>
        <h4>Price Range</h4>
        <div className={styles.priceInputs}>
          <input 
            type="number" 
            placeholder="Min" 
            defaultValue={searchParams.get('minPrice') || ''} 
            onBlur={(e) => updateFilters('minPrice', e.target.value)}
          />
          <span>to</span>
          <input 
            type="number" 
            placeholder="Max" 
            defaultValue={searchParams.get('maxPrice') || ''} 
            onBlur={(e) => updateFilters('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <h4>Colors</h4>
        <div className={styles.colorsGrid}>
          {COMMON_COLORS.map(color => (
            <div 
              key={color.name}
              className={`${styles.colorCircle} ${currentColor?.toLowerCase() === color.name.toLowerCase() ? styles.activeColor : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => updateFilters('color', currentColor === color.name ? null : color.name)}
              title={color.name}
            >
              {currentColor?.toLowerCase() === color.name.toLowerCase() && <Check size={14} className={styles.check} />}
            </div>
          ))}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <h4>Loyalty points & Offers</h4>
        <div className={styles.filterOptions}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={currentOnSale} 
              onChange={(e) => updateFilters('sale', e.target.checked)} 
            />
            <span>On Sale Products</span>
          </label>
          
          <label className={styles.checkboxLabel}>
            <input 
              type="radio" 
              name="purchaseType"
              checked={currentPurchaseType === ''} 
              onChange={() => updateFilters('purchaseType', null)} 
            />
            <span>All (Points & Money)</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input 
              type="radio" 
              name="purchaseType"
              checked={currentPurchaseType === 'points'} 
              onChange={() => updateFilters('purchaseType', 'points')} 
            />
            <span>Loyalty Points Only</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input 
              type="radio" 
              name="purchaseType"
              checked={currentPurchaseType === 'hybrid'} 
              onChange={() => updateFilters('purchaseType', 'hybrid')} 
            />
            <span>Hybrid (Money & Points)</span>
          </label>
        </div>
      </div>

      <button 
        className="btn-black" 
        style={{ width: '100%', marginTop: '2rem' }}
        onClick={() => router.push('/shop')}
      >
        Clear All Filters
      </button>
    </aside>
  );
}
