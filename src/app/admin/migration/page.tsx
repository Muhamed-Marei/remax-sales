/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';

export default function MigrationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('dryRun', String(dryRun));

    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Data Migration</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Upload a CSV file to import activity or deal records. Use dry-run mode first to validate data before importing.
      </p>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="input-group">
          <label className="input-label" htmlFor="csvFile">CSV File</label>
          <input 
            type="file" 
            id="csvFile" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="input-field"
            style={{ paddingTop: '0.5rem' }}
          />
        </div>

        <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="dryRun" 
            checked={dryRun} 
            onChange={(e) => setDryRun(e.target.checked)} 
            style={{ width: 'auto', accentColor: 'var(--primary)' }}
          />
          <label htmlFor="dryRun" style={{ margin: 0, cursor: 'pointer' }}>
            Dry Run (Validate only, do not save to database)
          </label>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleUpload} 
          disabled={!file || loading}
          style={{ alignSelf: 'flex-start' }}
        >
          {loading ? 'Processing...' : 'Upload and Process'}
        </button>
      </div>

      {results && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Results</h2>
          
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{results.successCount}</div>
              <div className="stat-label">Successful Rows</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{results.errorCount}</div>
              <div className="stat-label">Failed Rows</div>
            </div>
          </div>

          {results.errors && results.errors.length > 0 && (
            <div>
              <h3>Validation Errors</h3>
              <ul style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {results.errors.map((err: any, idx: number) => (
                  <li key={idx} style={{ padding: '0.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                    <strong>Row {err.row}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.message && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
              {results.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
