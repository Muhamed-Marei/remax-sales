'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  // global-error.tsx replaces the root layout, so it must include <html> and <body>
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: 'var(--bg-color, #0f1117)', color: 'var(--text-primary, #f1f5f9)' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '480px', width: '100%', padding: '3rem 2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.95rem' }}>
              {error.message || 'An unexpected critical error occurred. Please reload the page.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Try Again
              </button>
              <a
                href="/login"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', fontWeight: 600 }}
              >
                Back to Login
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
