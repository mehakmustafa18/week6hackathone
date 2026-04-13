'use client';

import { useState, useEffect } from 'react';
import styles from './ProductGallery.module.css';

interface GalleryProps {
  images?: string[];
  activeColorImage?: string;
  colors?: { name: string; hex: string; imageUrl: string }[];
}

export default function ProductGallery({ images, activeColorImage, colors }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Re-sync selected image to 0 when activeColorImage changes to ensure we show the variant immediately
  useEffect(() => {
    setSelectedImage(0);
  }, [activeColorImage]);

  // Priority: 1. Active Color Image, 2. Array of Images, 3. Fallback
  const displayImages = [];
  if (activeColorImage) {
    displayImages.push(activeColorImage);
  } else if (images && images.length > 0) {
     // Wait, if there are multiple images pushed into product.images we can just map those.
     // But wait, the user's design shows all color variant images AS thumbnails on the left side!
  }

  // To match the user's design, the thumbnails should probably be the available color images!
  let thumbnails = [];
  if (colors && colors.length > 0) {
    thumbnails = colors.map(c => c.imageUrl).filter(Boolean);
  } else if (images && images.length > 0) {
    thumbnails = images;
  } else {
    thumbnails = ['https://via.placeholder.com/600x600?text=No+Image+Available'];
  }

  // If we have an activeColorImage, ensure it's shown in the main view.
  const mainImageSrc = activeColorImage && selectedImage === 0 ? activeColorImage : thumbnails[selectedImage];

  return (
    <div className={styles.gallery}>
      <div className={styles.thumbnails}>
        {thumbnails.map((img, i) => (
          <div 
            key={i} 
            className={`${styles.thumbBox} ${mainImageSrc === img ? styles.active : ''}`}
            onClick={() => setSelectedImage(i)}
          >
            <img src={img} alt={`Product thumbnail ${i + 1}`} />
          </div>
        ))}
      </div>
      <div className={styles.mainImage}>
        <img src={mainImageSrc} alt="Main product" />
      </div>
    </div>
  );
}
