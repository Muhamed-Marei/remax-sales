import React from 'react';
import type { Metadata } from 'next';
import AppBar from '@/components/ui/AppBar';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: 'Admin Portal | SaleTrack',
  description: 'Team management, sales overview, activity audit, and reports.',
};

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
