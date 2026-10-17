import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authorityService } from '../services/authorityService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import { CategoryDistributionChart, StatusDistributionChart } from '../components/SimpleCharts';
import { formatDate } from '../utils/formatters';
import { CATEGORIES, PRIORITIES, STATUSES } from '../utils/constants';
import {
  Building2,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    submitted: 0,
    categoryDistribution: {},
    statusDistribution: {},
  });

  const [complaints, setComplaints] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch statistics and complaints in parallel
      const [statsData, complaintsData] = await Promise.all([
        authorityService.getDashboardStats().catch(() => null),
        authorityService.getAllComplaints({
          page,
          size,
          search: search.trim() || undefined,
          category: category || undefined,
          priority: priority || undefined,
          status: status || undefined,
        }),
      ]);

      if (statsData) {
        setStats(statsData);
      }

      if (complaintsData?.content) {
        setComplaints(complaintsData.content);
        setTotalElements(complaintsData.totalElements || complaintsData.content.length);
        setTotalPages(complaintsData.totalPages || 1);
      } else if (Array.isArray(complaintsData)) {
        setComplaints(complaintsData);
        setTotalElements(complaintsData.length);
        setTotalPages(1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, category, priority, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setPriority('');
    setStatus('');
    setPage(0);
  };

  return (
    <div className="container">
      {/* Top Banner */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
            <Building2 size={16} /> Municipal Authority Command Center
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Civic Complaint Management Console
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Logged in as <strong>{user?.fullName || 'Municipal Officer'}</strong> ({user?.email})
          </p>
        </div>
        <div>
          <button onClick={fetchData} className="btn btn-secondary" title="Refresh dashboard data">
            <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Refresh Live Data
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid-stats">
        <StatCard
          title="Total Registered"
          value={stats.totalComplaints}
          icon={FileText}
          color="#2563eb"
          bg="#eff6ff"
          description="All citizen submissions"
        />
        <StatCard
          title="Under Review"
          value={stats.underReview}
          icon={Clock}
          color="#7c3aed"
          bg="#ede9fe"
          description="Pending department triage"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={AlertCircle}
          color="#d97706"
          bg="#fef3c7"
          description="Ground work ongoing"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="#059669"
          bg="#d1fae5"
          description="Successfully completed"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="#dc2626"
          bg="#fee2e2"
          description="Closed with explanation"
        />
      </div>

      {/* Distribution Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <CategoryDistributionChart data={stats.categoryDistribution || {}} />
        <StatusDistributionChart data={stats.statusDistribution || {}} />
      </div>

      {/* Complaint Search & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Complaint</label>
              <input
                type="text"
                className="form-input"
                placeholder="ID, Title, or Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(0); }}
              >
                <option value="">All Categories</option>
                {Object.keys(CATEGORIES).map((key) => (
                  <option key={key} value={key}>{CATEGORIES[key].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => { setPriority(e.target.value); setPage(0); }}
              >
                <option value="">All Priorities</option>
                {Object.keys(PRIORITIES).map((key) => (
                  <option key={key} value={key}>{PRIORITIES[key].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              >
                <option value="">All Statuses</option>
                {Object.keys(STATUSES).map((key) => (
                  <option key={key} value={key}>{STATUSES[key].label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Search size={14} /> Filter
              </button>
              {(search || category || priority || status) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Complaints Management Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title" style={{ marginBottom: 0 }}>Registered Civic Grievances</h3>
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Total <strong>{totalElements}</strong> items
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner spinner-primary" style={{ width: '36px', height: '36px', margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading complaints backlog...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
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
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              No complaints match the criteria
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Try adjusting or resetting your filter criteria.
            </p>
            {(search || category || priority || status) && (
              <button onClick={handleResetFilters} className="btn btn-secondary">
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Title & Location</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Dept</th>
                    <th>Filed On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((item) => (
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
                      <td style={{ fontSize: '0.8125rem', color: '#475569' }}>
                        {item.department ? (
                          <span>{item.department}</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {formatDate(item.createdAt)}
                      </td>
                      <td>
                        <Link
                          to={`/authority/complaints/${item.id}`}
                          className="btn btn-primary btn-sm"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <Eye size={13} /> Review & Action
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                fontSize: '0.875rem',
                color: '#64748b',
              }}
            >
              <div>
                Showing <strong>{complaints.length}</strong> of <strong>{totalElements}</strong> complaints
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span style={{ padding: '0.375rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>
                  Page {page + 1} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page + 1 >= totalPages}
                  className="btn btn-secondary btn-sm"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
