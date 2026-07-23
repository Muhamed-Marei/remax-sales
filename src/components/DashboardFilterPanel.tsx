'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, Suspense, useTransition } from 'react';
import { User } from '@/lib/types';
import styles from './DashboardFilterPanel.module.css';
import { FilterX } from 'lucide-react';

interface DashboardFilterPanelProps {
  isAdmin?: boolean;
  salespeople?: User[];
}

function FilterPanelContent({ isAdmin, salespeople = [] }: DashboardFilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    startTransition(() => {
      router.push(pathname + '?' + createQueryString(name, value));
    });
  };

  const handleClear = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className={styles.filterPanel} style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s ease', position: 'relative' }}>
      {isPending && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--primary)', animation: 'pulse 1.5s infinite', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }} />
      )}
      {isAdmin && (
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Salesperson</label>
          <select 
            value={searchParams.get('salesId') || ''} 
            onChange={(e) => handleFilterChange('salesId', e.target.value)}
            className={styles.filterInput}
          >
            <option value="">All Team</option>
            {salespeople.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.displayName}</option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Start Date</label>
        <input 
          type="date" 
          value={searchParams.get('startDate') || ''}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className={styles.filterInput}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>End Date</label>
        <input 
          type="date" 
          value={searchParams.get('endDate') || ''}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className={styles.filterInput}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Attendance</label>
        <select 
          value={searchParams.get('attendance') || ''}
          onChange={(e) => handleFilterChange('attendance', e.target.value)}
          className={styles.filterInput}
        >
          <option value="">Any</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Deal State</label>
        <select 
          value={searchParams.get('dealState') || ''}
          onChange={(e) => handleFilterChange('dealState', e.target.value)}
          className={styles.filterInput}
        >
          <option value="">Any</option>
          <option value="active">Active</option>
          <option value="negotiating">Negotiating</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>
      
      <div className={styles.clearButtonContainer}>
        <button 
          onClick={handleClear}
          className="btn btn-secondary"
          disabled={isPending}
        >
          <FilterX size={16} />
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export function DashboardFilterPanel(props: DashboardFilterPanelProps) {
  return (
    <Suspense fallback={<div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', opacity: 0.5 }}>Loading filters...</div>}>
      <FilterPanelContent {...props} />
    </Suspense>
  );
}
