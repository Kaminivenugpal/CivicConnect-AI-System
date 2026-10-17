import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import { formatDate, truncateText } from '../utils/formatters';
import {
  FilePlus,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  ArrowRight,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch stats and recent complaints
      const [statsRes, complaintsRes] = await Promise.all([
        complaintService.getCitizenDashboardStats().catch(() => null),
        complaintService.getMyComplaints({ page: 0, size: 5 }),
      ]);

      if (statsRes) {
        setStats(statsRes);
      } else if (complaintsRes?.content) {
        // Compute from complaints if stats endpoint fallback
        const content = complaintsRes.content;
        const total = complaintsRes.totalElements || content.length;
        const pending = content.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
        const inProgress = content.filter((c) => c.status === 'IN_PROGRESS').length;
        const resolved = content.filter((c) => c.status === 'RESOLVED').length;
        setStats({ total, pending, inProgress, resolved });
      }

      setRecentComplaints(complaintsRes?.content || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="container">
      {/* Header Banner */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Welcome back, {user?.fullName || 'Citizen'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Track the status of your civic complaints and report new municipal issues.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-sm"
            title="Refresh dashboard"
          >
            <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Refresh
          </button>
          <Link to="/submit" className="btn btn-primary">
            <FilePlus size={16} /> File New Complaint
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid-stats">
        <StatCard
          title="Total Complaints"
          value={stats.total}
          icon={FileText}
          color="#2563eb"
          bg="#eff6ff"
          description="All reports filed by you"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="#7c3aed"
          bg="#ede9fe"
          description="Submitted & Under Review"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={AlertCircle}
          color="#d97706"
          bg="#fef3c7"
          description="Currently being serviced"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="#059669"
          bg="#d1fae5"
          description="Successfully completed"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 className="card-title">Recent Complaints</h3>
            <p className="card-subtitle" style={{ marginBottom: 0 }}>
              Your latest submitted civic reports
            </p>
          </div>
          <Link to="/my-complaints" className="btn btn-secondary btn-sm">
            View All My Complaints <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="spinner spinner-primary" style={{ width: '36px', height: '36px', margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading recent complaints...</p>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <FolderOpen size={28} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              No complaints filed yet
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Notice a pothole, leaking pipe, or broken streetlight? Report it now and our AI will prioritize it for local authorities.
            </p>
            <Link to="/submit" className="btn btn-primary">
              <FilePlus size={16} /> File Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e40af' }}>
                        {item.referenceId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {item.location || 'Location not specified'}
                      </div>
                    </td>
                    <td>
                      <CategoryBadge category={item.category} />
                    </td>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td>
                      <Link to={`/complaints/${item.referenceId || item.id}`} className="btn btn-secondary btn-sm">
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
