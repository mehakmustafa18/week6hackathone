'use client';

import React, { useRef } from 'react';
import { Star, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    name: 'Sarah M.',
    text: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece l've bought has exceeded my expectations.",
    verified: true,
  },
  {
    name: 'Alex K.',
    text: "Finding clothes that truly match my personal style used to be a challenge until l discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
    verified: true,
  },
  {
    name: 'James L.',
    text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have found Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
    verified: true,
  },
  {
    name: 'Mooen',
    text: "The selection of clothes is not only diverse but also on-point with the latest trends. I'm thrilled to have found Shop.co.",
    verified: true,
  },
  {
    name: 'Alex M.',
    text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch.",
    verified: true,
  },
];

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className={`${styles.section} container`}>
      <div className={styles.header}>
        <h2 className={styles.title}>OUR HAPPY CUSTOMERS</h2>
        <div className={styles.controls}>
          <button onClick={() => scroll('left')} className={styles.arrowBtn} aria-label="Previous">
            <ArrowLeft size={24} />
          </button>
          <button onClick={() => scroll('right')} className={styles.arrowBtn} aria-label="Next">
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
      
      <div className={styles.scrollContainer} ref={scrollRef}>
        {testimonials.map((t, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#FFC633" color="#FFC633" />)}
            </div>
            <div className={styles.nameRow}>
              <h4>{t.name}</h4>
              {t.verified && <CheckCircle2 size={16} color="#01AB31" fill="#01AB31" stroke="white" />}
            </div>
            <p className={styles.text}>"{t.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}
