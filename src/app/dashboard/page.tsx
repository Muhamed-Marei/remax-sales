import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';
import { getFilteredActivities, getFilteredDeals } from '@/lib/repositories/analytics';
import { calculateKPIs } from '@/lib/analytics/kpi';
import { DashboardFilterPanel } from '@/components/DashboardFilterPanel';
import { DashboardCharts } from '@/components/DashboardCharts';
import { AttendanceStatus, DealState } from '@/lib/types';

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const claims = await verifySession();
  
  if (!claims || !claims.orgId) {
    redirect('/login');
  }

  if (claims.role === 'admin') {
    redirect('/admin');
  }

  const now = new Date();
  const defaultFirstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const defaultLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const startDate = (searchParams.startDate as string) || defaultFirstDay;
  const endDate = (searchParams.endDate as string) || defaultLastDay;
  const attendance = searchParams.attendance as AttendanceStatus;
  const dealState = searchParams.dealState as DealState;

  const activities = await getFilteredActivities({
    orgId: claims.orgId,
    salesId: claims.uid,
    startDate,
    endDate,
    attendance,
  });

  const deals = await getFilteredDeals({
    orgId: claims.orgId,
    salesId: claims.uid,
    startDate,
    endDate,
    dealState,
  });

  const kpis = calculateKPIs(activities, deals);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      <DashboardFilterPanel isAdmin={false} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3>Total Leads</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis.totalLeads}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3>Open Deals</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis.openDeals}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3>Win Rate</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(kpis.winRate * 100).toFixed(1)}%</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3>Meetings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis.totalMeetings}</p>
        </div>
      </div>

      <DashboardCharts activities={activities} deals={deals} isAdmin={false} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/dashboard/activities/new" className="btn btn-primary" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
              Log Daily Activity
            </Link>
            <Link href="/dashboard/deals/new" className="btn btn-outline" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
              Add New Deal
            </Link>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Funnel</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Leads ➔ Responses:</span>
              <strong>{(kpis.leadToResponseRate * 100).toFixed(1)}%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Responses ➔ Meetings:</span>
              <strong>{(kpis.responseToMeetingRate * 100).toFixed(1)}%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Meetings ➔ Deals:</span>
              <strong>{(kpis.meetingToDealRate * 100).toFixed(1)}%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <span>Overall Conversion:</span>
              <strong>{(kpis.overallConversionRate * 100).toFixed(1)}%</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
