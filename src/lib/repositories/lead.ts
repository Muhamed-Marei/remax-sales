import { adminDb } from '../firebase/admin';
import { leadSchema } from '../schemas';
import type { Lead } from '../types';
import { z } from 'zod';
import { writeAuditLog } from '../audit';
import { logger } from '../logger';
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/constants/collections';

type DbLead = Lead & { createdAt?: FirebaseFirestore.Timestamp; updatedAt?: FirebaseFirestore.Timestamp };

export async function saveLead(orgId: string, leadData: z.infer<typeof leadSchema>, actorUid: string, leadId?: string) {
  const validated = leadSchema.parse(leadData);
  
  const leadsCollection = adminDb.collection(COLLECTIONS.LEADS);
  const docRef = leadId ? leadsCollection.doc(leadId) : leadsCollection.doc();
  
  await adminDb.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    if (!doc.exists) {
      t.set(docRef, { ...validated, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy: actorUid });
    } else {
      t.update(docRef, { ...validated, updatedAt: FieldValue.serverTimestamp() });
    }
  });

  await writeAuditLog({
    orgId,
    actorUid,
    action: docRef.id === leadId ? 'LEAD_UPDATED' : 'LEAD_CREATED',
    resource: `leads/${docRef.id}`,
    timestamp: new Date()
  });

  logger.info({ message: 'Lead saved', orgId, leadId: docRef.id, actorUid });
  return docRef.id;
}

export async function getLeads(orgId: string, salesId?: string, status?: string) {
  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.LEADS);
  
  if (salesId) {
    query = query.where('assignedSalesId', '==', salesId);
  }
  if (status) {
    query = query.where('status', '==', status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(d => ({ ...(d.data() as DbLead), id: d.id }));
}

export async function getLeadById(orgId: string, leadId: string) {
  const doc = await adminDb.collection(COLLECTIONS.LEADS).doc(leadId).get();
  if (!doc.exists) {
    return null;
  }
  return { ...(doc.data() as DbLead), id: doc.id };
}
