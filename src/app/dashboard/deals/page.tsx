import Link from 'next/link';
import { verifySession } from '@/lib/auth/session';
import { getDeals } from '@/lib/repositories/deal';
import { redirect } from 'next/navigation';

export default async function DealsPage({
  searchParams,
}: {
  searchParams: { state?: string };
}) {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  const orgId = 'default';
  const stateFilter = searchParams.state;
  
  let salesId;
  if (claims.role === 'salesperson') {
    salesId = claims.uid;
  }

  const deals = await getDeals(orgId, salesId, stateFilter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Deals Pipeline</h1>
        <Link href="/dashboard/deals/new" className="btn btn-primary">
          + New Deal / Unit
        </Link>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <Link href="/dashboard/deals" className={`btn ${!stateFilter ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>All</Link>
        <Link href="/dashboard/deals?state=active" className={`btn ${stateFilter === 'active' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Active</Link>
        <Link href="/dashboard/deals?state=negotiating" className={`btn ${stateFilter === 'negotiating' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Negotiating</Link>
        <Link href="/dashboard/deals?state=reserved" className={`btn ${stateFilter === 'reserved' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Reserved</Link>
        <Link href="/dashboard/deals?state=won" className={`btn ${stateFilter === 'won' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Won</Link>
        <Link href="/dashboard/deals?state=lost" className={`btn ${stateFilter === 'lost' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>Lost</Link>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {deals.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No deals found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                <th style={{ padding: '1rem' }}>Unit Type</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Price (EGP)</th>
                <th style={{ padding: '1rem' }}>State</th>
                <th style={{ padding: '1rem' }}>Created</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{deal.unitType}</td>
                  <td style={{ padding: '1rem' }}>{deal.location}</td>
                  <td style={{ padding: '1rem' }}>{deal.askingPrice.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.85rem',
                      backgroundColor: deal.dealState === 'won' ? 'rgba(46, 204, 113, 0.2)' : 
                                       deal.dealState === 'lost' ? 'rgba(231, 76, 60, 0.2)' : 
                                       'rgba(52, 152, 219, 0.2)',
                      color: deal.dealState === 'won' ? '#2ecc71' : 
                             deal.dealState === 'lost' ? '#e74c3c' : 
                             'var(--text-primary)'
                    }}>
                      {deal.dealState.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {deal.createdAt ? new Date(deal.createdAt.toMillis()).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link href={`/dashboard/deals/${deal.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
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
