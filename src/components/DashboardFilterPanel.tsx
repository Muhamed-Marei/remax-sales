'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { User } from '@/lib/types';

interface DashboardFilterPanelProps {
  isAdmin?: boolean;
  salespeople?: User[];
}

export function DashboardFilterPanel({ isAdmin, salespeople = [] }: DashboardFilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    router.push(pathname + '?' + createQueryString(name, value));
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {isAdmin && (
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Salesperson</label>
          <select 
            value={searchParams.get('salesId') || ''} 
            onChange={(e) => handleFilterChange('salesId', e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
          >
            <option value="">All Team</option>
            {salespeople.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.displayName}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Start Date</label>
        <input 
          type="date" 
          value={searchParams.get('startDate') || ''}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>End Date</label>
        <input 
          type="date" 
          value={searchParams.get('endDate') || ''}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Attendance</label>
        <select 
          value={searchParams.get('attendance') || ''}
          onChange={(e) => handleFilterChange('attendance', e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
        >
          <option value="">Any</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Deal State</label>
        <select 
          value={searchParams.get('dealState') || ''}
          onChange={(e) => handleFilterChange('dealState', e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
        >
          <option value="">Any</option>
          <option value="active">Active</option>
          <option value="negotiating">Negotiating</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>
      
      <div style={{ marginLeft: 'auto' }}>
        <button 
          onClick={() => router.push(pathname)}
          className="btn btn-outline"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
