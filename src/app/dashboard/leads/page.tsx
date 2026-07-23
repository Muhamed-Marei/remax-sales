import Link from 'next/link';
import { verifySession } from '@/lib/auth/session';
import { getLeads } from '@/lib/repositories/lead';
import { redirect } from 'next/navigation';

export default async function LeadsPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  const orgId = 'default';
  const statusFilter = searchParams.status;
  
  let salesId;
  if (claims.role === 'salesperson') {
    salesId = claims.uid;
  }

  const leads = await getLeads(orgId, salesId, statusFilter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Leads & Customers</h1>
        <Link href="/dashboard/leads/new" className="btn btn-primary">
          + New Lead
        </Link>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <Link href="/dashboard/leads" className={`btn ${!statusFilter ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>All</Link>
        <Link href="/dashboard/leads?status=new" className={`btn ${statusFilter === 'new' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>New</Link>
        <Link href="/dashboard/leads?status=contacted" className={`btn ${statusFilter === 'contacted' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Contacted</Link>
        <Link href="/dashboard/leads?status=qualified" className={`btn ${statusFilter === 'qualified' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Qualified</Link>
        <Link href="/dashboard/leads?status=disqualified" className={`btn ${statusFilter === 'disqualified' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Disqualified</Link>
        <Link href="/dashboard/leads?status=won" className={`btn ${statusFilter === 'won' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Won</Link>
        <Link href="/dashboard/leads?status=lost" className={`btn ${statusFilter === 'lost' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Lost</Link>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {leads.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No leads found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Phone</th>
                <th style={{ padding: '1rem' }}>Source</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Created</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{lead.name}</td>
                  <td style={{ padding: '1rem' }}>{lead.phone}</td>
                  <td style={{ padding: '1rem' }}>{lead.source || 'N/A'}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.85rem',
                      backgroundColor: lead.status === 'won' ? 'rgba(46, 204, 113, 0.2)' : 
                                       lead.status === 'lost' || lead.status === 'disqualified' ? 'rgba(231, 76, 60, 0.2)' : 
                                       'rgba(52, 152, 219, 0.2)',
                      color: lead.status === 'won' ? '#2ecc71' : 
                             lead.status === 'lost' || lead.status === 'disqualified' ? '#e74c3c' : 
                             'var(--text-primary)'
                    }}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {lead.createdAt ? new Date(lead.createdAt.toMillis()).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link href={`/dashboard/leads/${lead.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                      View / Edit
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
