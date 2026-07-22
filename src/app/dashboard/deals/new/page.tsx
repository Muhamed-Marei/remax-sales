import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import DealForm from '@/components/forms/DealForm';
import { adminDb } from '@/lib/firebase/admin';

export default async function NewDealPage() {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  const isAdmin = claims.role === 'admin';
  let salespeople: { id: string; name: string }[] = [];

  if (isAdmin) {
    const orgId = 'default';
    const snapshot = await adminDb.collection('organizations').doc(orgId).collection('users').where('role', '==', 'salesperson').get();
    salespeople = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || doc.data().email || 'Unknown',
    }));
  }

  const orgId = 'default';
  let leadsQuery: FirebaseFirestore.Query = adminDb.collection('organizations').doc(orgId).collection('leads');
  if (!isAdmin) {
    leadsQuery = leadsQuery.where('assignedSalesId', '==', claims.uid);
  }
  const leadsSnapshot = await leadsQuery.get();
  const leads = leadsSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name || 'Unknown',
    phone: doc.data().phone || '',
  }));

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>New Deal / Unit</h1>
      <DealForm 
        currentUserId={claims.uid} 
        isAdmin={isAdmin} 
        salespeople={salespeople} 
        leads={leads}
      />
    </div>
  );
}
