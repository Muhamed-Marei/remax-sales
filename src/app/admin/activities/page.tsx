/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { verifySession } from '@/lib/auth/session';
import { getActivities } from '@/lib/repositories/activity';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/constants/collections';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminActivitiesPage() {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  if (claims.role !== 'admin' && claims.admin !== true) {
    // NOTE: Temporarily comment out for local development without admin claim set if needed
    // redirect('/dashboard');
  }

  // MVP hardcodes organization ID
  const orgId = 'default';
  
  // Fetch all activities for the organization
  const activities = await getActivities(orgId);

  // Fetch all users to map salesId to user names
  const usersSnapshot = await adminDb.collection(COLLECTIONS.USERS).get();
  const userMap: Record<string, any> = {};
  usersSnapshot.docs.forEach(doc => {
    userMap[doc.id] = doc.data();
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>All Sales Activities</h1>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {activities.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No activities logged yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Salesperson</th>
                <th style={{ padding: '1rem' }}>Source</th>
                <th style={{ padding: '1rem' }}>Attendance</th>
                <th style={{ padding: '1rem' }}>New Leads</th>
                <th style={{ padding: '1rem' }}>Calls</th>
                <th style={{ padding: '1rem' }}>Meetings</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{activity.activityDate}</td>
                  <td style={{ padding: '1rem' }}>
                    {userMap[activity.salesId]?.displayName || userMap[activity.salesId]?.email || activity.salesId}
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{activity.primarySource}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{activity.attendance}</td>
                  <td style={{ padding: '1rem' }}>{activity.leads}</td>
                  <td style={{ padding: '1rem' }}>{activity.calls}</td>
                  <td style={{ padding: '1rem' }}>{activity.meetings}</td>
                  <td style={{ padding: '1rem' }}>
                    <Link href={`/admin/activities/${activity.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
