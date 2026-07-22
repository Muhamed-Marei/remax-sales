'use client';

import { DailyActivity, Deal } from '@/lib/types';
import { exportActivitiesToCsv, exportDealsToCsv } from '@/lib/analytics/export';
import { logProductEvent } from '@/lib/analytics/events';

interface ReportTablesProps {
  activities: DailyActivity[];
  deals: Deal[];
}

export function ReportTables({ activities, deals }: ReportTablesProps) {
  const handleExportActivities = () => {
    logProductEvent('report_exported', { type: 'activities', count: activities.length });
    exportActivitiesToCsv(activities);
  };

  const handleExportDeals = () => {
    logProductEvent('report_exported', { type: 'deals', count: deals.length });
    exportDealsToCsv(deals);
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Activities Report</h2>
          <button onClick={handleExportActivities} className="btn btn-outline">
            Export CSV
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Date</th>
              <th style={{ padding: '0.5rem' }}>Sales ID</th>
              <th style={{ padding: '0.5rem' }}>Source</th>
              <th style={{ padding: '0.5rem' }}>Leads</th>
              <th style={{ padding: '0.5rem' }}>Responses</th>
              <th style={{ padding: '0.5rem' }}>Meetings</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>No activities found.</td></tr>
            ) : (
              activities.map(act => (
                <tr key={act.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem' }}>{act.activityDate}</td>
                  <td style={{ padding: '0.5rem' }}>{act.salesId}</td>
                  <td style={{ padding: '0.5rem' }}>{act.primarySource}</td>
                  <td style={{ padding: '0.5rem' }}>{act.leads}</td>
                  <td style={{ padding: '0.5rem' }}>{act.responses}</td>
                  <td style={{ padding: '0.5rem' }}>{act.meetings}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Deals Report</h2>
          <button onClick={handleExportDeals} className="btn btn-outline">
            Export CSV
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Deal ID</th>
              <th style={{ padding: '0.5rem' }}>Sales ID</th>
              <th style={{ padding: '0.5rem' }}>State</th>
              <th style={{ padding: '0.5rem' }}>Type</th>
              <th style={{ padding: '0.5rem' }}>Location</th>
              <th style={{ padding: '0.5rem' }}>Asking Price</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>No deals found.</td></tr>
            ) : (
              deals.map(deal => (
                <tr key={deal.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem' }}>{deal.id.slice(0,8)}...</td>
                  <td style={{ padding: '0.5rem' }}>{deal.assignedSalesId}</td>
                  <td style={{ padding: '0.5rem' }}>{deal.dealState}</td>
                  <td style={{ padding: '0.5rem' }}>{deal.dealType}</td>
                  <td style={{ padding: '0.5rem' }}>{deal.location}</td>
                  <td style={{ padding: '0.5rem' }}>{deal.askingPrice} EGP</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
