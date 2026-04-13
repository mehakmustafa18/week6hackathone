'use client';

import Link from 'next/link';
import { Search, ShoppingCart, UserCircle, ChevronDown, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      {/* Promo Bar */}
      {!user && (
        <div className={styles.promoBar}>
          <p>Sign up and get 20% off to your first order. <Link href="/register">Sign Up Now</Link></p>
        </div>
      )}

      <nav className={`${styles.nav} container`}>
        <div className={styles.leftSection}>
          <button 
            className={styles.mobileMenu}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <Link href="/" className={styles.logo}>
            SHOP.CO
          </Link>
        </div>

        {/* Desktop Menu */}
        <ul className={styles.navLinks}>
          <li>
            <Link href="/shop" className={styles.link}>
              Shop <ChevronDown size={14} />
            </Link>
          </li>
          <li><Link href="/shop?sale=true" className={styles.link}>On Sale</Link></li>
          <li><Link href="/shop?sort=newest" className={styles.link}>New Arrivals</Link></li>
          <li><Link href="/brands" className={styles.link}>Brands</Link></li>
        </ul>

        {/* Mobile Menu Overlay */}
        <div className={`${styles.mobileOverlay} ${isMenuOpen ? styles.active : ''}`}>
          <div className={styles.mobileDrawer}>
            <div className={styles.drawerHeader}>
              <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>SHOP.CO</Link>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>
            <ul className={styles.mobileNavLinks}>
              <li><Link href="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link></li>
              <li><Link href="/shop?sale=true" onClick={() => setIsMenuOpen(false)}>On Sale</Link></li>
              <li><Link href="/shop?sort=newest" onClick={() => setIsMenuOpen(false)}>New Arrivals</Link></li>
              <li><Link href="/brands" onClick={() => setIsMenuOpen(false)}>Brands</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.searchBar}>

          <Search size={20} className={styles.searchIcon} />
          <input type="text" placeholder="Search for products..." />
        </div>

        <div className={styles.actions}>
          <Link href="/cart" className={styles.actionBtn} style={{ position: 'relative' }}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#000',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className={styles.userSection}>
              <div className={styles.pointsBadge}>
                🌟 {user.loyaltyPoints} pts
              </div>
              <div className={styles.userMenuWrapper}>
                <button 
                  className={styles.actionBtn}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <UserCircle size={24} />
                </button>
                
                {isUserMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.name}</span>
                      <span className={styles.userRole}>{user.role}</span>
                    </div>
                    <hr />
                    <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                      <UserCircle size={18} /> Profile & Orders
                    </Link>
                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <Link href="/admin" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                        <LayoutDashboard size={18} /> Admin Dashboard
                      </Link>
                    )}
                    <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={() => { logout(); setIsUserMenuOpen(false); }}>
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login" className={styles.actionBtn}>
              <UserCircle size={24} />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
