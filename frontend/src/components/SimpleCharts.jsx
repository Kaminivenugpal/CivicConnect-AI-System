import React from 'react';
import { CATEGORIES, STATUSES } from '../utils/constants';

export function CategoryDistributionChart({ data = {} }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, count]) => sum + (count || 0), 0);

  return (
    <div className="card">
      <h3 className="card-title">Complaints by Category</h3>
      <p className="card-subtitle">Distribution across municipal civic departments</p>

      {total === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No complaints filed yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {entries.map(([categoryKey, count]) => {
            const config = CATEGORIES[categoryKey] || { label: categoryKey, color: '#64748b' };
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={categoryKey}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{config.label}</span>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{count} ({percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: config.color,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StatusDistributionChart({ data = {} }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, count]) => sum + (count || 0), 0);

  return (
    <div className="card">
      <h3 className="card-title">Complaints by Status</h3>
      <p className="card-subtitle">Current resolution pipeline breakdown</p>

      {total === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No complaints recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {entries.map(([statusKey, count]) => {
            const config = STATUSES[statusKey] || { label: statusKey, color: '#64748b' };
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={statusKey}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{config.label}</span>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{count} ({percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: config.color,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
