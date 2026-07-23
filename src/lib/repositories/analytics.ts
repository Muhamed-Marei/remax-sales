import { adminDb } from '../firebase/admin';
import { type DashboardFilter, type DailyActivity, type Deal } from '../types';
import { COLLECTIONS } from '@/lib/constants/collections';

type DbDeal = Deal & { createdAt?: FirebaseFirestore.Timestamp; updatedAt?: FirebaseFirestore.Timestamp };

/**
 * Fetch activities matching the dashboard filter.
 */
export async function getFilteredActivities(filter: DashboardFilter): Promise<(DailyActivity & { id: string })[]> {
  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.ACTIVITIES);
  
  if (filter.orgId) {
    query = query.where('orgId', '==', filter.orgId);
  }
  if (filter.salesId) {
    query = query.where('salesId', '==', filter.salesId);
  }
  if (filter.startDate) {
    query = query.where('activityDate', '>=', filter.startDate);
  }
  if (filter.endDate) {
    query = query.where('activityDate', '<=', filter.endDate);
  }
  if (filter.source) {
    query = query.where('primarySource', '==', filter.source);
  }
  if (filter.attendance) {
    query = query.where('attendance', '==', filter.attendance);
  }

  query = query.orderBy('activityDate', 'desc');

  const snapshot = await query.get();
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as DailyActivity & { id: string }));
}

/**
 * Fetch deals matching the dashboard filter.
 */
export async function getFilteredDeals(filter: DashboardFilter): Promise<(DbDeal & { id: string })[]> {
  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.DEALS);
  
  if (filter.orgId) {
    query = query.where('orgId', '==', filter.orgId);
  }
  if (filter.salesId) {
    query = query.where('assignedSalesId', '==', filter.salesId);
  }
  if (filter.dealState) {
    query = query.where('dealState', '==', filter.dealState);
  }
  if (filter.dealType) {
    query = query.where('dealType', '==', filter.dealType);
  }
  if (filter.location) {
    query = query.where('location', '==', filter.location);
  }

  // Deals filtering by created date
  if (filter.startDate || filter.endDate) {
    // Firestore Timestamp conversion
    if (filter.startDate) {
      query = query.where('createdAt', '>=', new Date(filter.startDate));
    }
    if (filter.endDate) {
      // End of day
      const end = new Date(filter.endDate);
      end.setUTCHours(23, 59, 59, 999);
      query = query.where('createdAt', '<=', end);
    }
    query = query.orderBy('createdAt', 'desc');
  }

  const snapshot = await query.get();
  return snapshot.docs.map(d => ({ ...(d.data() as DbDeal), id: d.id }));
}
