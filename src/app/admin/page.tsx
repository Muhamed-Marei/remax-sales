import styles from './users/users.module.css';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';
import { getFilteredActivities, getFilteredDeals } from '@/lib/repositories/analytics';
import { calculateKPIs } from '@/lib/analytics/kpi';
import { COLLECTIONS } from '@/lib/constants/collections';
import { DashboardFilterPanel } from '@/components/DashboardFilterPanel';
import { DashboardCharts } from '@/components/DashboardCharts';
import { AttendanceStatus, DealState, User } from '@/lib/types';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

interface AdminOverviewPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminOverviewPage(props: AdminOverviewPageProps) {
  const searchParams = await props.searchParams;
  const claims = await verifySession();
  
  if (!claims || !claims.orgId) {
    redirect('/login');
  }

  if (claims.role !== 'admin' && claims.admin !== true) {
    redirect('/dashboard');
  }

  const now = new Date();
  const defaultFirstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const defaultLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const startDate = (searchParams.startDate as string) || defaultFirstDay;
  const endDate = (searchParams.endDate as string) || defaultLastDay;
  const attendance = searchParams.attendance as AttendanceStatus;
  const dealState = searchParams.dealState as DealState;
  const salesId = searchParams.salesId as string;

  // Fetch salespeople for the filter panel and activities/deals in parallel
  const [usersSnapshot, activities, deals] = await Promise.all([
    adminDb
      .collection(COLLECTIONS.USERS)
      .where('role', '==', 'salesperson')
      .get(),
    getFilteredActivities({
      orgId: claims.orgId,
      salesId,
      startDate,
      endDate,
      attendance,
    }),
    getFilteredDeals({
      orgId: claims.orgId,
      salesId,
      startDate,
      endDate,
      dealState,
    })
  ]);
  
  const salespeople = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

  const kpis = calculateKPIs(activities, deals);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Overview</h1>
      </header>
      
      <div className={styles.content}>
        <DashboardFilterPanel isAdmin={true} salespeople={salespeople} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Team Leads</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis.totalLeads}</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Active Deals</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis.openDeals}</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Team Win Rate</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(kpis.winRate * 100).toFixed(1)}%</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Total Won</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis.wonDeals}</p>
          </div>
        </div>

        <DashboardCharts activities={activities} deals={deals} isAdmin={true} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Team Funnel</h2>
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
            </ul>
          </div>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Needs Attention</h2>
            {kpis.lostDeals > 0 ? (
              <p style={{ color: 'var(--error)' }}>
                {kpis.lostDeals} deal(s) lost. Check deal reports for lost reasons.
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No immediate red flags.</p>
            )}
            {activities.length === 0 && (
              <p style={{ color: 'var(--warning)', marginTop: '1rem' }}>
                No activities logged in the selected period.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
