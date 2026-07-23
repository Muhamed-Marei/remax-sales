import { adminDb } from '@/lib/firebase/admin';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import styles from './user-profile.module.css';
import { verifySession } from '@/lib/auth/session';
import { getFilteredActivities, getFilteredDeals } from '@/lib/repositories/analytics';
import { calculateKPIs } from '@/lib/analytics/kpi';
import { calculateChartData } from '@/lib/analytics/charts';
import { DashboardFilterPanel } from '@/components/DashboardFilterPanel';
import { DashboardCharts } from '@/components/DashboardCharts';
import { AttendanceStatus, DealState } from '@/lib/types';
import { COLLECTIONS } from '@/lib/constants/collections';

export const dynamic = 'force-dynamic';

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UserProfilePage(props: UserProfilePageProps) {
  const { userId } = await props.params;
  const searchParams = await props.searchParams;
  const claims = await verifySession();

  if (!claims || !claims.orgId) {
    redirect('/login');
  }

  if (claims.role !== 'admin' && claims.admin !== true) {
    redirect('/dashboard');
  }

  const orgId = claims.orgId;
  const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(userId).get();

  if (!userDoc.exists) {
    notFound();
  }

  const user = userDoc.data()!;

  const now = new Date();
  const defaultFirstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const defaultLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const startDate = (searchParams.startDate as string) || defaultFirstDay;
  const endDate = (searchParams.endDate as string) || defaultLastDay;
  const attendance = searchParams.attendance as AttendanceStatus;
  const dealState = searchParams.dealState as DealState;

  const activities = await getFilteredActivities({
    orgId,
    salesId: userId,
    startDate,
    endDate,
    attendance,
  });

  const deals = await getFilteredDeals({
    orgId,
    salesId: userId,
    startDate,
    endDate,
    dealState,
  });

  const kpis = calculateKPIs(activities, deals);
  const chartData = calculateChartData(activities, deals, false);

  return (
    <div className={styles.container}>
      <Link href="/admin/users" className={styles.backLink}>
        ← Back to Salespeople
      </Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{user.name || 'Unnamed Salesperson'}</h1>
          <p className={styles.subtitle}>{user.email}</p>
        </div>
        <div>
          <span className={user.active ? 'badge-active' : 'badge-inactive'} style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', backgroundColor: user.active ? 'var(--success)' : 'var(--error)', color: 'white' }}>
            {user.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </header>

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

      <DashboardCharts trendData={chartData.trendData} isAdmin={false} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
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
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Assigned Deals</h2>
          <p style={{ color: 'var(--text-secondary)' }}>See deals view for detailed list.</p>
        </div>
      </div>
    </div>
  );
}
