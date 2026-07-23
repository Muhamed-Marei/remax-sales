import { verifySession } from '@/lib/auth/session';
import { getLeadById } from '@/lib/repositories/lead';
import { COLLECTIONS } from '@/lib/constants/collections';
import { redirect, notFound } from 'next/navigation';
import LeadForm from '@/components/forms/LeadForm';
import { adminDb } from '@/lib/firebase/admin';

export default async function EditLeadPage(props: { params: Promise<{ leadId: string }> }) {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  const { leadId } = await props.params;
  const orgId = 'default';
  const lead = await getLeadById(orgId, leadId);

  if (!lead) {
    redirect('/dashboard/leads');
  }

  const isAdmin = claims.role === 'admin';
  
  if (!isAdmin && lead.assignedSalesId !== claims.uid) {
    redirect('/dashboard/leads');
  }

  let salespeople: { id: string; name: string }[] = [];

  if (isAdmin) {
    const snapshot = await adminDb.collection(COLLECTIONS.USERS).where('role', '==', 'salesperson').get();
    salespeople = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || doc.data().email || 'Unknown',
    }));
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Edit Lead</h1>
      <LeadForm 
        initialData={lead}
        isEditing={true}
        leadId={lead.id}
        currentUserId={claims.uid} 
        isAdmin={isAdmin} 
        salespeople={salespeople} 
      />
    </div>
  );
}
