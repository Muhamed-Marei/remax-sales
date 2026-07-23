import { adminDb } from '../firebase/admin';
import { dailyActivitySchema } from '../schemas';
import type { DailyActivity } from '../types';
import { COLLECTIONS } from '@/lib/constants/collections';
import { z } from 'zod';
import { writeAuditLog } from '../audit';
import { logger } from '../logger';

export async function saveActivity(orgId: string, salesId: string, activityData: z.infer<typeof dailyActivitySchema>, actorUid: string) {
  const validated = dailyActivitySchema.parse(activityData);
  const docId = `${salesId}_${validated.activityDate}`;
  const docRef = adminDb.collection(COLLECTIONS.ACTIVITIES).doc(docId);
  
  await adminDb.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    if (!doc.exists) {
      t.set(docRef, { ...validated, salesId, createdAt: new Date(), updatedAt: new Date() });
    } else {
      t.update(docRef, { ...validated, updatedAt: new Date() });
    }
  });

  await writeAuditLog({
    orgId,
    actorUid,
    action: 'ACTIVITY_SAVED',
    resource: `activities/${docId}`,
    timestamp: new Date()
  });

  logger.info({ message: 'Activity saved', orgId, docId, salesId });
  return docId;
}

export async function getActivities(orgId: string, salesId?: string, startDate?: string, endDate?: string) {
  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.ACTIVITIES);
  
  if (salesId) {
    query = query.where('salesId', '==', salesId);
  }
  if (startDate) {
    query = query.where('activityDate', '>=', startDate);
  }
  if (endDate) {
    query = query.where('activityDate', '<=', endDate);
  }

  query = query.orderBy('activityDate', 'desc');

  const snapshot = await query.get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DailyActivity & { id: string, salesId: string }));
}

export async function getActivityById(orgId: string, docId: string) {
  const docRef = adminDb.collection(COLLECTIONS.ACTIVITIES).doc(docId);
  const doc = await docRef.get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as DailyActivity & { id: string, salesId: string };
}

export async function adminEditActivity(orgId: string, docId: string, newData: z.infer<typeof dailyActivitySchema>, adminUid: string) {
  const validated = dailyActivitySchema.parse(newData);
  const docRef = adminDb.collection(COLLECTIONS.ACTIVITIES).doc(docId);
  
  let oldData = null;

  await adminDb.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    if (!doc.exists) {
      throw new Error('Activity not found');
    }
    oldData = doc.data();
    t.update(docRef, { ...validated, updatedAt: new Date() });
  });

  await writeAuditLog({
    orgId,
    actorUid: adminUid,
    action: 'ACTIVITY_ADMIN_CORRECTION',
    resource: `activities/${docId}`,
    timestamp: new Date(),
    details: {
      before: oldData,
      after: validated
    }
  });

  logger.info({ message: 'Activity admin correction', orgId, docId, adminUid });
  return docId;
}
