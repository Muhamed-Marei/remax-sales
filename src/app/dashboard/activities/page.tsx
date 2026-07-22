import Link from 'next/link';
import { verifySession } from '@/lib/auth/session';
import { getActivities } from '@/lib/repositories/activity';
import { redirect } from 'next/navigation';

export default async function ActivitiesPage() {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  // MVP hardcodes organization ID
  const orgId = 'default';
  
  // Fetch activities for the current salesperson
  const activities = await getActivities(orgId, claims.uid);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>My Activities</h1>
        <Link href="/dashboard/activities/new" className="btn btn-primary">
          + New Activity
        </Link>
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
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{activity.primarySource}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{activity.attendance}</td>
                  <td style={{ padding: '1rem' }}>{activity.leads}</td>
                  <td style={{ padding: '1rem' }}>{activity.calls}</td>
                  <td style={{ padding: '1rem' }}>{activity.meetings}</td>
                  <td style={{ padding: '1rem' }}>
                    <Link href={`/dashboard/activities/${activity.activityDate}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
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
