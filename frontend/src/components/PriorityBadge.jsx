import React from 'react';
import { PRIORITIES } from '../utils/constants';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  const config = PRIORITIES[priority] || {
    label: priority || 'Medium',
    color: '#64748b',
    bg: '#f1f5f9'
  };

  const renderIcon = () => {
    switch (priority) {
      case 'HIGH':
        return <AlertTriangle size={13} />;
      case 'MEDIUM':
        return <AlertCircle size={13} />;
      case 'LOW':
        return <Info size={13} />;
      default:
        return null;
    }
  };

  return (
    <span
      className="badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.color}40`,
        fontWeight: 700,
      }}
    >
      {renderIcon()}
      {config.label}
    </span>
  );
}
