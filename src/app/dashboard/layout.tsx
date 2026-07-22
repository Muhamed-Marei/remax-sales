import React from 'react';
import AppBar from '@/components/ui/AppBar';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardLayout}>
      <AppBar portalType="sales" />
      <div className={styles.bodyWrapper}>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
