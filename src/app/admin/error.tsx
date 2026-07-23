'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Portal Error:', error);
  }, [error]);

  return (
    <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--danger)', marginBottom: '1rem' }}>
          Admin Portal Error
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error.message || 'Failed to load Admin workspace data.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => reset()} className="btn btn-primary">
            Retry Loading
          </button>
          <Link href="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Re-authenticate
          </Link>
        </div>
      </div>
    </div>
  );
}
