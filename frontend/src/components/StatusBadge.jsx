import React from 'react';
import { STATUSES } from '../utils/constants';
import { Clock, CheckCircle2, AlertCircle, XCircle, FileText } from 'lucide-react';

export default function StatusBadge({ status }) {
  const config = STATUSES[status] || {
    label: status || 'Unknown',
    color: '#64748b',
    bg: '#f1f5f9'
  };

  const renderIcon = () => {
    switch (status) {
      case 'SUBMITTED':
        return <FileText size={13} />;
      case 'UNDER_REVIEW':
        return <Clock size={13} />;
      case 'IN_PROGRESS':
        return <AlertCircle size={13} />;
      case 'RESOLVED':
        return <CheckCircle2 size={13} />;
      case 'REJECTED':
        return <XCircle size={13} />;
      default:
        return <Clock size={13} />;
    }
  };

  return (
    <span
      className="badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      {renderIcon()}
      {config.label}
    </span>
  );
}
