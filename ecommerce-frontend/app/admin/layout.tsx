'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tag, ShoppingCart, Users, ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import styles from './admin.module.css';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Tag size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  ];

  return (
    <AdminGuard>
      <div className={styles.adminWrapper}>
        <button 
          className={styles.sidebarToggle}
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>

        <div 
          className={`${styles.overlay} ${isSidebarOpen ? styles.active : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            <Link href="/" className={styles.backBtn}>
              <ArrowLeft size={16} /> Storefront
            </Link>
            <div className={styles.headerTitleRow}>
              <h2>SHOP.CO ADMIN</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className={styles.sidebarFooter}>
            <button onClick={logout} className={styles.logoutBtn}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
        
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}

