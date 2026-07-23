/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from '@/lib/firebase/admin';
import { verifySession } from '@/lib/auth/session';
import { COLLECTIONS } from '@/lib/constants/collections';
import styles from './users.module.css';
import { InviteUserForm } from '@/components/admin/InviteUserForm';
import { UserTableRow } from '@/components/admin/UserTableRow';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const claims = await verifySession();
  
  if (!claims || !claims.orgId || (claims.role !== 'admin' && claims.admin !== true)) {
    return null; // proxy.ts or layout handles redirect
  }
  
  // Fetch users from the root Firestore collection filtered by orgId
  const usersSnapshot = await adminDb.collection(COLLECTIONS.USERS)
    .where('orgId', '==', claims.orgId)
    .get();
  
  const users = usersSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.displayName || data.name || '',
      email: data.email || '',
      role: data.role || 'salesperson',
      active: data.active ?? true,
      // Safely serialize Firestore Timestamps for Client Components
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()),
    };
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Salespeople Management</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.listSection}>
          <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      No salespeople found.
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <UserTableRow key={u.id} user={u} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.actionSection}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 className={styles.subtitle}>Invite Salesperson</h2>
            <InviteUserForm />
          </div>
        </div>
      </div>
    </div>
  );
}
