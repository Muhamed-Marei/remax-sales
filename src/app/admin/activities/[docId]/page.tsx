import { verifySession } from '@/lib/auth/session';
import { getActivityById } from '@/lib/repositories/activity';
import { COLLECTIONS } from '@/lib/constants/collections';
import { redirect } from 'next/navigation';
import AdminActivityEditForm from '@/components/admin/AdminActivityEditForm';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export default async function AdminActivityEditPage({ params }: { params: Promise<{ docId: string }> }) {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  if (claims.role !== 'admin' && claims.admin !== true) {
    // NOTE: Temporarily comment out for local development without admin claim set if needed
    // redirect('/dashboard');
  }

  const { docId } = await params;
  const orgId = 'default';

  const activity = await getActivityById(orgId, docId);

  if (!activity) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Activity Not Found</h2>
        <p>The activity record you are trying to edit does not exist.</p>
      </div>
    );
  }

  // Fetch user to display name
  const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(activity.salesId).get();
  const userData = userDoc.exists ? userDoc.data() : null;
  const userName = userData?.displayName || userData?.email || activity.salesId;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Correct Activity</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Editing activity for <strong>{userName}</strong> on <strong>{activity.activityDate}</strong>
        </p>
      </div>

      <AdminActivityEditForm 
        activityId={activity.id} 
        initialData={activity} 
      />
    </div>
  );
}
