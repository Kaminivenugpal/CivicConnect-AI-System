import React from 'react';
import { CATEGORIES } from '../utils/constants';
import {
  Truck,
  Droplets,
  Zap,
  Trash2,
  Waves,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export default function CategoryBadge({ category }) {
  const config = CATEGORIES[category] || {
    label: category || 'Other',
    color: '#64748b',
    icon: 'HelpCircle'
  };

  const renderIcon = () => {
    switch (category) {
      case 'ROADS':
        return <Truck size={13} />;
      case 'WATER_SUPPLY':
        return <Droplets size={13} />;
      case 'ELECTRICITY':
        return <Zap size={13} />;
      case 'SANITATION':
        return <Trash2 size={13} />;
      case 'DRAINAGE':
        return <Waves size={13} />;
      case 'PUBLIC_SAFETY':
        return <ShieldAlert size={13} />;
      default:
        return <HelpCircle size={13} />;
    }
  };

  return (
    <span
      className="badge"
      style={{
        backgroundColor: '#f8fafc',
        color: config.color,
        border: `1px solid ${config.color}40`,
        fontWeight: 600,
        textTransform: 'none',
      }}
    >
      {renderIcon()}
      {config.label}
    </span>
  );
}
