import { verifySession } from '@/lib/auth/session';
import { COLLECTIONS } from '@/lib/constants/collections';
import { redirect } from 'next/navigation';
import LeadForm from '@/components/forms/LeadForm';
import { adminDb } from '@/lib/firebase/admin';

export default async function NewLeadPage() {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  const isAdmin = claims.role === 'admin';
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
      <h1 style={{ marginBottom: '2rem' }}>New Lead</h1>
      <LeadForm 
        currentUserId={claims.uid} 
        isAdmin={isAdmin} 
        salespeople={salespeople} 
      />
    </div>
  );
}
