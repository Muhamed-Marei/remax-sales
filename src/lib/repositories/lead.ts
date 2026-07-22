import { adminDb } from '../firebase/admin';
import { leadSchema } from '../schemas';
import { z } from 'zod';
import { writeAuditLog } from '../audit';
import { logger } from '../logger';
import { FieldValue } from 'firebase-admin/firestore';

type Lead = z.infer<typeof leadSchema>;
type DbLead = Lead & { createdAt?: FirebaseFirestore.Timestamp; updatedAt?: FirebaseFirestore.Timestamp };

export async function saveLead(orgId: string, leadData: Lead, actorUid: string, leadId?: string) {
  const validated = leadSchema.parse(leadData);
  
  const leadsCollection = adminDb.collection('organizations').doc(orgId).collection('leads');
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
  let query: FirebaseFirestore.Query = adminDb.collection('organizations').doc(orgId).collection('leads');
  
  if (salesId) {
    query = query.where('assignedSalesId', '==', salesId);
  }
  if (status) {
    query = query.where('status', '==', status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as DbLead) }));
}

export async function getLeadById(orgId: string, leadId: string) {
  const doc = await adminDb.collection('organizations').doc(orgId).collection('leads').doc(leadId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...(doc.data() as DbLead) };
}
