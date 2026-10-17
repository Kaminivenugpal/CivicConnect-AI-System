import React from 'react';
import { formatDate } from '../utils/formatters';
import { CheckCircle2, Clock, AlertCircle, XCircle, FileText, User } from 'lucide-react';

export default function TimelineTracker({ currentStatus, history = [], remarks = [] }) {
  const steps = [
    { key: 'SUBMITTED', label: 'Complaint Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'IN_PROGRESS', label: 'Work In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'UNDER_REVIEW': return 1;
      case 'IN_PROGRESS': return 2;
      case 'RESOLVED': return 3;
      case 'REJECTED': return -1;
      default: return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  return (
    <div style={{ margin: '1.5rem 0' }}>
      {/* Visual Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '2.5rem' }}>
        {/* Track Line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            right: '30px',
            height: '4px',
            backgroundColor: '#e2e8f0',
            zIndex: 1,
          }}
        />

        {steps.map((step, idx) => {
          const isDone = !isRejected && idx <= activeIndex;
          const isCurrent = !isRejected && idx === activeIndex;

          return (
            <div
              key={step.key}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? '#2563eb' : '#ffffff',
                  border: `3px solid ${isDone ? '#2563eb' : '#cbd5e1'}`,
                  color: isDone ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone ? <CheckCircle2 size={20} /> : idx + 1}
              </div>
              <span
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#1e40af' : '#475569',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <XCircle size={18} />
          <div>
            <strong>Complaint Rejected:</strong> This complaint could not be resolved or was marked as invalid. Check the remarks below for details.
          </div>
        </div>
      )}

      {/* Audit History Log */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
          Activity & Audit Log
        </h4>

        {(!history || history.length === 0) ? (
          <p style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
            No status changes recorded yet.
          </p>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0' }}>
            {history.map((item, index) => (
              <div
                key={item.id || index}
                style={{
                  position: 'relative',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Node indicator */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.85rem',
                    top: '2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.newStatus === 'RESOLVED' ? '#059669' : item.newStatus === 'REJECTED' ? '#dc2626' : '#2563eb',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 0 2px #cbd5e1',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    Status changed to <span style={{ color: '#2563eb' }}>{item.newStatus}</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                {item.remarks && (
                  <p style={{ fontSize: '0.8125rem', color: '#334155', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '0.375rem' }}>
                    <strong>Note:</strong> {item.remarks}
                  </p>
                )}
                {item.changedBy && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> Logged by: {item.changedBy}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
