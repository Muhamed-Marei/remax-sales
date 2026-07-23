import React from 'react';

export default function AdminLoading() {
  return (
    <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title Placeholder */}
      <div 
        style={{ 
          width: '240px', 
          height: '36px', 
          borderRadius: 'var(--radius-md)', 
          background: 'var(--surface-color)', 
          opacity: 0.6,
          animation: 'pulse 1.5s infinite ease-in-out' 
        }} 
      />

      {/* KPI Summary Placeholder Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel" style={{ height: '110px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }} />
        ))}
      </div>

      {/* Charts & Reports Placeholder */}
      <div className="glass-panel" style={{ height: '350px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }} />
    </div>
  );
}
