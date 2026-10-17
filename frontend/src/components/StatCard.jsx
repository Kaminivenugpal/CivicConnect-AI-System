import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = '#2563eb', bg = '#eff6ff', description }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={26} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, margin: '2px 0' }}>
          {value !== undefined && value !== null ? value : 0}
        </div>
        {description && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
