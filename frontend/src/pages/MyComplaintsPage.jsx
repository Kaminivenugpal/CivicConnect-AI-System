import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import { formatDate } from '../utils/formatters';
import { CATEGORIES, PRIORITIES, STATUSES } from '../utils/constants';
import {
  Search,
  Filter,
  FilePlus,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export default function MyComplaintsPage() {
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

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size,
        search: search.trim() || undefined,
        category: category || undefined,
        priority: priority || undefined,
        status: status || undefined,
      };

      const data = await complaintService.getMyComplaints(params);
      if (data?.content) {
        setComplaints(data.content);
        setTotalElements(data.totalElements || data.content.length);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setComplaints(data);
        setTotalElements(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, category, priority, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
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
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            My Civic Complaints
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage and track all grievance reports submitted under your account
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchComplaints} className="btn btn-secondary btn-sm" title="Refresh">
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            {/* Search Input */}
            <div style={{ gridColumn: 'span 1' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Search by Title or ID</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pothole or CC-2026..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
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

            {/* Priority Filter */}
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

            {/* Status Filter */}
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

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Search size={14} /> Search
              </button>
              {(search || category || priority || status) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary"
                  title="Clear all filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Complaints List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
            <div className="spinner spinner-primary" style={{ width: '36px', height: '36px', margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Fetching complaints...</p>
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
              No complaints found
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              {search || category || priority || status
                ? 'No complaints matched your search filter criteria. Try resetting the filters.'
                : 'You have not submitted any complaints yet. Report an issue in your area now.'}
            </p>
            {search || category || priority || status ? (
              <button onClick={handleResetFilters} className="btn btn-secondary">
                Reset Filters
              </button>
            ) : (
              <Link to="/submit" className="btn btn-primary">
                <FilePlus size={16} /> File a Complaint
              </Link>
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
                    <th>Submitted</th>
                    <th>Last Updated</th>
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
                      <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {formatDate(item.createdAt)}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {formatDate(item.updatedAt || item.createdAt)}
                      </td>
                      <td>
                        <Link
                          to={`/complaints/${item.referenceId || item.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
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
