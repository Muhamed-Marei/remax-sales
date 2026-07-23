import React from 'react';

export default function DashboardLoading() {
  return (
    <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title Placeholder */}
      <div 
        style={{ 
          width: '200px', 
          height: '32px', 
          borderRadius: 'var(--radius-md)', 
          background: 'var(--surface-color)', 
          opacity: 0.6,
          animation: 'pulse 1.5s infinite ease-in-out' 
        }} 
      />

      {/* KPI Cards Placeholder Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel" style={{ height: '110px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }} />
        ))}
      </div>

      {/* Main Content / Table / Chart Placeholder */}
      <div className="glass-panel" style={{ height: '320px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }} />
    </div>
  );
}
