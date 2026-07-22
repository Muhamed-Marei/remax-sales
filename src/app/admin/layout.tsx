import React from 'react';
import AppBar from '@/components/ui/AppBar';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminLayout}>
      <AppBar portalType="admin" />
      <div className={styles.bodyWrapper}>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
