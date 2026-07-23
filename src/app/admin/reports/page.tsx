import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession } from '@/lib/auth/session';
import { getFilteredActivities, getFilteredDeals } from '@/lib/repositories/analytics';
import { DashboardFilterPanel } from '@/components/DashboardFilterPanel';
import { ReportTables } from '@/components/ReportTables';
import { AttendanceStatus, DealState, User } from '@/lib/types';
import { COLLECTIONS } from '@/lib/constants/collections';
import styles from '../users/users.module.css';

export const dynamic = 'force-dynamic';

interface ReportsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReportsPage(props: ReportsPageProps) {
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

  // Fetch salespeople for the filter panel
  const usersSnapshot = await adminDb
    .collection(COLLECTIONS.USERS)
    .where('role', '==', 'salesperson')
    .get();
  
  const salespeople = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

  const activities = await getFilteredActivities({
    orgId: claims.orgId,
    salesId,
    startDate,
    endDate,
    attendance,
  });

  const deals = await getFilteredDeals({
    orgId: claims.orgId,
    salesId,
    startDate,
    endDate,
    dealState,
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reports & Exports</h1>
      </header>
      
      <div className={styles.content}>
        <DashboardFilterPanel isAdmin={true} salespeople={salespeople} />
        
        <ReportTables activities={activities} deals={deals} />
      </div>
    </div>
  );
}
