import styles from './admin.module.css';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';
import { getFilteredActivities, getFilteredDeals } from '@/lib/repositories/analytics';
import { calculateKPIs } from '@/lib/analytics/kpi';
import { calculateChartData } from '@/lib/analytics/charts';
import { COLLECTIONS } from '@/lib/constants/collections';
import { DashboardFilterPanel } from '@/components/DashboardFilterPanel';
import { DashboardCharts } from '@/components/DashboardCharts';
import { AttendanceStatus, DealState, User } from '@/lib/types';
import { adminDb } from '@/lib/firebase/admin';
import { Users, Target, TrendingUp, DollarSign, AlertCircle, AlertTriangle } from '@/components/ui/Icons';

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

  let salespeople: User[] = [];
  let activities: any[] = [];
  let deals: any[] = [];
  let errorState: { message: string, indexLink?: string } | null = null;

  try {
    // Fetch salespeople for the filter panel and activities/deals in parallel
    const [usersSnapshot, fetchedActivities, fetchedDeals] = await Promise.all([
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
    
    salespeople = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        lastLoginAt: data.lastLoginAt?.toDate ? data.lastLoginAt.toDate().toISOString() : data.lastLoginAt
      } as User;
    });
    activities = fetchedActivities;
    deals = fetchedDeals;
  } catch (error: any) {
    console.error('Admin Overview Data Fetch Error:', error);
    const errorMessage = error?.message ? String(error.message) : 'Failed to load admin data';
    let indexLink = '';
    
    // Extract Firebase Console index creation link if present
    const urlMatch = errorMessage.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/);
    if (urlMatch) {
      indexLink = urlMatch[1];
    }
    
    errorState = { message: errorMessage, indexLink };
  }

  if (errorState) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Admin Overview</h1>
        </header>
        
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginTop: '2rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Failed to load Dashboard Data</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem', wordBreak: 'break-word' }}>
            {errorState.message}
          </p>
          
          {errorState.indexLink && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: 'var(--radius-md)', display: 'inline-block', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
                <AlertTriangle size={20} className="text-warning" />
                Missing Database Index
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Firebase requires a composite index to run this specific filter combination efficiently. 
                Click the button below to create it in the Firebase Console.
              </p>
              <a 
                href={errorState.indexLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                Create Index in Firebase
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  const kpis = calculateKPIs(activities as any, deals as any);
  const chartData = calculateChartData(activities as any, deals as any, true);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Overview</h1>
      </header>
      
      <div>
        <DashboardFilterPanel isAdmin={true} salespeople={salespeople} />

        <div className={styles.kpiGrid}>
          <div className={`glass-panel ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}>
              <h3>Team Leads</h3>
              <Users className={styles.kpiIcon} size={20} />
            </div>
            <p className={styles.kpiValue}>{kpis.totalLeads}</p>
          </div>
          
          <div className={`glass-panel ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}>
              <h3>Active Deals</h3>
              <Target className={styles.kpiIcon} size={20} />
            </div>
            <p className={styles.kpiValue}>{kpis.openDeals}</p>
          </div>
          
          <div className={`glass-panel ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}>
              <h3>Team Win Rate</h3>
              <TrendingUp className={styles.kpiIcon} size={20} />
            </div>
            <p className={styles.kpiValue}>{(kpis.winRate * 100).toFixed(1)}%</p>
          </div>
          
          <div className={`glass-panel ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}>
              <h3>Total Won</h3>
              <DollarSign className={styles.kpiIcon} size={20} />
            </div>
            <p className={styles.kpiValue}>{kpis.wonDeals}</p>
          </div>
        </div>

        <DashboardCharts 
          trendData={chartData.trendData} 
          sourceMixData={chartData.sourceMixData}
          dealPipelineData={chartData.dealPipelineData}
          isAdmin={true} 
        />

        <div className={styles.summaryGrid}>
          <div className={`glass-panel ${styles.summaryCard}`}>
            <h2 className={styles.summaryTitle}>Team Funnel</h2>
            <ul className={styles.funnelList}>
              <li className={styles.funnelItem}>
                <span>Leads ➔ Responses:</span>
                <strong>{(kpis.leadToResponseRate * 100).toFixed(1)}%</strong>
              </li>
              <li className={styles.funnelItem}>
                <span>Responses ➔ Meetings:</span>
                <strong>{(kpis.responseToMeetingRate * 100).toFixed(1)}%</strong>
              </li>
              <li className={styles.funnelItem}>
                <span>Meetings ➔ Deals:</span>
                <strong>{(kpis.meetingToDealRate * 100).toFixed(1)}%</strong>
              </li>
            </ul>
          </div>
          
          <div className={`glass-panel ${styles.summaryCard}`}>
            <h2 className={styles.summaryTitle}>Needs Attention</h2>
            <div style={{ marginTop: '0.5rem' }}>
              {kpis.lostDeals > 0 ? (
                <p className={styles.attentionDanger}>
                  <AlertCircle size={18} />
                  {kpis.lostDeals} deal(s) lost. Check deal reports for lost reasons.
                </p>
              ) : (
                <p className={styles.attentionText}>No immediate red flags.</p>
              )}
              {activities.length === 0 && (
                <p className={styles.attentionWarning} style={{ marginTop: '1rem' }}>
                  <AlertTriangle size={18} />
                  No activities logged in the selected period.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
