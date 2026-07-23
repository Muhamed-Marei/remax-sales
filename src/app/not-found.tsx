import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <main 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1.5rem',
        textAlign: 'center'
      }}
    >
      <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <Logo size="lg" showText text="SaleTrack" />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
          Back to Workspace
        </Link>
      </div>
    </main>
  );
}
