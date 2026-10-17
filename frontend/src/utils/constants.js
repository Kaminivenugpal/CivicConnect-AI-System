export const CATEGORIES = {
  ROADS: { label: 'Roads & Potholes', icon: 'Truck', color: '#6366f1' },
  WATER_SUPPLY: { label: 'Water Supply', icon: 'Droplets', color: '#0284c7' },
  ELECTRICITY: { label: 'Electricity & Streetlights', icon: 'Zap', color: '#d97706' },
  SANITATION: { label: 'Garbage & Sanitation', icon: 'Trash2', color: '#059669' },
  DRAINAGE: { label: 'Drainage & Sewage', icon: 'Waves', color: '#0d9488' },
  PUBLIC_SAFETY: { label: 'Public Safety', icon: 'ShieldAlert', color: '#dc2626' },
  OTHER: { label: 'Other Civic Issue', icon: 'HelpCircle', color: '#64748b' }
};

export const PRIORITIES = {
  LOW: { label: 'Low', badgeClass: 'priority-low', color: '#64748b', bg: '#f1f5f9' },
  MEDIUM: { label: 'Medium', badgeClass: 'priority-medium', color: '#d97706', bg: '#fef3c7' },
  HIGH: { label: 'High Urgency', badgeClass: 'priority-high', color: '#dc2626', bg: '#fee2e2' }
};

export const STATUSES = {
  SUBMITTED: { label: 'Submitted', color: '#2563eb', bg: '#dbeafe', step: 1 },
  UNDER_REVIEW: { label: 'Under Review', color: '#7c3aed', bg: '#ede9fe', step: 2 },
  IN_PROGRESS: { label: 'In Progress', color: '#d97706', bg: '#fef3c7', step: 3 },
  RESOLVED: { label: 'Resolved', color: '#059669', bg: '#d1fae5', step: 4 },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', step: 0 }
};

export const ALLOWED_STATUS_TRANSITIONS = {
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED: [],
  REJECTED: []
};

export const DEPARTMENTS = [
  'Public Works Department (Roads)',
  'Municipal Water Board',
  'Electricity & Power Grid Authority',
  'Solid Waste Management & Sanitation',
  'Drainage & Stormwater Authority',
  'Public Safety & Traffic Directorate',
  'General Municipal Administration'
];
