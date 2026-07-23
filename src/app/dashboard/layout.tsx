import React from 'react';
import type { Metadata } from 'next';
import AppBar from '@/components/ui/AppBar';
import styles from './dashboard.module.css';

export const metadata: Metadata = {
  title: 'Sales Dashboard | SaleTrack',
  description: 'Sales performance tracking, activity logging, and deal management.',
};

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
