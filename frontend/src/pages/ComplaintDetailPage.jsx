import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import TimelineTracker from '../components/TimelineTracker';
import { formatDate, formatConfidence } from '../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const justSubmitted = queryParams.get('submitted') === 'true';

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);

      // Fetch history audit trail
      try {
        const histData = await complaintService.getComplaintHistory(id);
        setHistory(histData || []);
      } catch {
        // Fallback to complaint.statusHistory if embedded
        setHistory(data.statusHistory || []);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner spinner-primary" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b' }}>Loading complaint tracking details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container" style={{ maxWidth: '600px', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>
            Complaint Not Found
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
            {error || `No complaint matches reference or ID: "${id}". Please verify the complaint ID.`}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
            <Link to="/my-complaints" className="btn btn-primary">
              View My Complaints
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = complaint.imageUrl
    ? (complaint.imageUrl.startsWith('http') || complaint.imageUrl.startsWith('/api')
        ? complaint.imageUrl
        : `/api/complaints/images/${complaint.imageUrl.replace(/^\/api\/complaints\/images\//, '')}`)
    : null;

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      {/* Back button and share */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <Link to="/my-complaints" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Complaints
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchDetails} className="btn btn-secondary btn-sm" title="Refresh status">
            <RefreshCw size={14} /> Refresh Status
          </button>
          <button onClick={handleCopyLink} className="btn btn-secondary btn-sm">
            <Share2 size={14} /> {copied ? 'Link Copied!' : 'Share Reference'}
          </button>
        </div>
      </div>

      {justSubmitted && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <div>
            <strong>Complaint Submitted Successfully!</strong> Your grievance has been registered with reference ID <strong>{complaint.referenceId}</strong>. You can bookmark or track this page anytime.
          </div>
        </div>
      )}

      {/* Main Details Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.125rem', fontFamily: 'monospace', fontWeight: 800, color: '#1e40af', backgroundColor: '#eff6ff', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                {complaint.referenceId}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
              {complaint.title}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <CategoryBadge category={complaint.category} />
          </div>
        </div>

        {/* Metadata info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
            <MapPin size={16} color="#64748b" />
            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
              <strong style={{ color: '#0f172a' }}>{complaint.location || 'Not specified'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
            <Calendar size={16} color="#64748b" />
            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Submitted On</span>
              <strong style={{ color: '#0f172a' }}>{formatDate(complaint.createdAt)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
            <Building size={16} color="#64748b" />
            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Department</span>
              <strong style={{ color: '#0f172a' }}>{complaint.department || 'Under Review by Dispatch'}</strong>
            </div>
          </div>
        </div>

        {/* Complaint Description */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Grievance Description
          </h3>
          <p style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {complaint.description}
          </p>
        </div>

        {/* Image Evidence (if available) */}
        {imageUrl && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} /> Photographic Evidence
            </h3>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', maxWidth: '520px', backgroundColor: '#0f172a' }}>
              <img
                src={imageUrl}
                alt="Complaint evidence"
                style={{ width: '100%', maxHeight: '360px', objectFit: 'contain', display: 'block' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div style="padding: 1.5rem; color: #94a3b8; text-align: center; font-size: 0.875rem;">Evidence photo not available or access restricted.</div>';
                }}
              />
            </div>
          </div>
        )}

        {/* AI Analysis Summary */}
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={18} color="#2563eb" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1e40af' }}>
              AI Smart Triage Analysis
            </h3>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.5 }}>
            <p>
              Complaint was analyzed by the CivicConnect NLP classifier upon submission:
            </p>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span><strong>Category Match:</strong> {complaint.category}</span>
              <span><strong>Priority Urgency:</strong> {complaint.priority}</span>
              {complaint.aiConfidenceScore && (
                <span><strong>Confidence Score:</strong> {formatConfidence(complaint.aiConfidenceScore)}</span>
              )}
            </div>
            {complaint.aiExplanation && (
              <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#1e3a8a' }}>
                &ldquo;{complaint.aiExplanation}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Official Status History and Timeline */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            Resolution Progress & Authority Audit
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Real-time status updates and official municipal officer remarks
          </p>

          <TimelineTracker
            currentStatus={complaint.status}
            history={history}
          />
        </div>
      </div>
    </div>
  );
}
