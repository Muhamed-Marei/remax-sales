import { adminDb } from '../firebase/admin';
import { dealSchema } from '../schemas';
import { z } from 'zod';
import { writeAuditLog } from '../audit';
import { logger } from '../logger';
import { FieldValue } from 'firebase-admin/firestore';

type Deal = z.infer<typeof dealSchema>;

export async function saveDeal(orgId: string, dealData: Deal, actorUid: string, dealId?: string) {
  const validated = dealSchema.parse(dealData);
  
  const dealsCollection = adminDb.collection('organizations').doc(orgId).collection('deals');
  const docRef = dealId ? dealsCollection.doc(dealId) : dealsCollection.doc();
  
  await adminDb.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    if (!doc.exists) {
      t.set(docRef, { ...validated, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    } else {
      const existingData = doc.data() as Deal;
      
      // Enforce atomic state transition in history
      if (existingData.dealState !== validated.dealState) {
        const historyRef = adminDb.collection('organizations').doc(orgId).collection('dealStateHistory').doc();
        t.set(historyRef, {
          dealId: docRef.id,
          previousState: existingData.dealState,
          newState: validated.dealState,
          changedBy: actorUid,
          changedAt: FieldValue.serverTimestamp()
        });
      }

      t.update(docRef, { ...validated, updatedAt: FieldValue.serverTimestamp() });
    }
  });

  await writeAuditLog({
    orgId,
    actorUid,
    action: docRef.id === dealId ? 'DEAL_UPDATED' : 'DEAL_CREATED',
    resource: `deals/${docRef.id}`,
    timestamp: new Date()
  });

  logger.info({ message: 'Deal saved', orgId, dealId: docRef.id, actorUid });
  return docRef.id;
}

type DbDeal = Deal & { createdAt?: FirebaseFirestore.Timestamp; updatedAt?: FirebaseFirestore.Timestamp };

export async function getDeals(orgId: string, salesId?: string, state?: string) {
  let query: FirebaseFirestore.Query = adminDb.collection('organizations').doc(orgId).collection('deals');
  
  if (salesId) {
    query = query.where('assignedSalesId', '==', salesId);
  }
  if (state) {
    query = query.where('dealState', '==', state);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as DbDeal) }));
}

export async function getDealById(orgId: string, dealId: string) {
  const doc = await adminDb.collection('organizations').doc(orgId).collection('deals').doc(dealId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...(doc.data() as DbDeal) };
}
