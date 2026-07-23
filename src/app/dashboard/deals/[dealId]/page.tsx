/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifySession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import DealForm from '@/components/forms/DealForm';
import { getDealById } from '@/lib/repositories/deal';
import { adminDb } from '@/lib/firebase/admin';

export default async function EditDealPage(props: { params: Promise<{ dealId: string }> }) {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  const { dealId } = await props.params;
  const orgId = 'default';
  
  const deal = await getDealById(orgId, dealId);
  if (!deal) {
    notFound();
  }

  if (claims.role === 'salesperson' && deal.assignedSalesId !== claims.uid) {
    redirect('/dashboard/deals');
  }

  const isAdmin = claims.role === 'admin';
  let salespeople: { id: string; name: string }[] = [];

  if (isAdmin) {
    const snapshot = await adminDb.collection('users').where('role', '==', 'salesperson').get();
    salespeople = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || doc.data().email || 'Unknown',
    }));
  }

  let leadsQuery: FirebaseFirestore.Query = adminDb.collection('leads');
  if (!isAdmin) {
    leadsQuery = leadsQuery.where('assignedSalesId', '==', claims.uid);
  }
  const leadsSnapshot = await leadsQuery.get();
  const leads = leadsSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name || 'Unknown',
    phone: doc.data().phone || '',
  }));

  // Convert Firebase Timestamps if needed for the form
  const serializedDeal = {
    ...deal,
    createdAt: deal.createdAt?.toDate ? deal.createdAt.toDate() : deal.createdAt,
    updatedAt: deal.updatedAt?.toDate ? deal.updatedAt.toDate() : deal.updatedAt,
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Edit Deal / Unit</h1>
      <DealForm 
        initialData={serializedDeal as any} 
        isEditing={true} 
        dealId={dealId}
        currentUserId={claims.uid} 
        isAdmin={isAdmin} 
        salespeople={salespeople} 
        leads={leads}
      />
    </div>
  );
}
