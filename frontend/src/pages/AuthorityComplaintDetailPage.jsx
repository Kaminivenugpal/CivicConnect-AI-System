import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authorityService } from '../services/authorityService';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import TimelineTracker from '../components/TimelineTracker';
import { formatDate, formatConfidence } from '../utils/formatters';
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  ALLOWED_STATUS_TRANSITIONS,
  DEPARTMENTS,
} from '../utils/constants';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  User,
  Sliders,
  CheckSquare,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export default function AuthorityComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Status update form
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Department assignment form
  const [assignedDept, setAssignedDept] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Reclassification form
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [reclassReason, setReclassReason] = useState('');
  const [reclassifying, setReclassifying] = useState(false);

  // New official remark
  const [standaloneRemark, setStandaloneRemark] = useState('');
  const [addingRemark, setAddingRemark] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
      setAssignedDept(data.department || '');
      setAssignedOfficer(data.assignedOfficer || '');
      setNewCategory(data.category || '');
      setNewPriority(data.priority || '');

      const histData = await complaintService.getComplaintHistory(id).catch(() => []);
      setHistory(histData || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Handle status update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      setError('Please select a target status.');
      return;
    }
    if (selectedStatus === 'REJECTED' && !statusRemarks.trim()) {
      setError('A mandatory explanation note is required when rejecting a complaint.');
      return;
    }

    setStatusUpdating(true);
    setError('');
    setSuccessMsg('');
    try {
      await authorityService.updateStatus(complaint.id, selectedStatus, statusRemarks.trim());
      setSuccessMsg(`Status updated to ${selectedStatus} successfully.`);
      setSelectedStatus('');
      setStatusRemarks('');
      await fetchDetails();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle assignment submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignedDept) {
      setError('Please select a department to assign.');
      return;
    }

    setAssigning(true);
    setError('');
    setSuccessMsg('');
    try {
      await authorityService.assignDepartment(complaint.id, assignedDept, assignedOfficer.trim());
      setSuccessMsg('Department assignment saved successfully.');
      await fetchDetails();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  // Handle classification update
  const handleReclassifySubmit = async (e) => {
    e.preventDefault();
    setReclassifying(true);
    setError('');
    setSuccessMsg('');
    try {
      await authorityService.updateClassification(
        complaint.id,
        newCategory,
        newPriority,
        reclassReason.trim()
      );
      setSuccessMsg('Category and priority updated successfully.');
      setReclassReason('');
      await fetchDetails();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReclassifying(false);
    }
  };

  // Handle standalone remark submit
  const handleAddRemarkSubmit = async (e) => {
    e.preventDefault();
    if (!standaloneRemark.trim()) return;

    setAddingRemark(true);
    setError('');
    setSuccessMsg('');
    try {
      await authorityService.addRemark(complaint.id, standaloneRemark.trim());
      setSuccessMsg('Official remark logged to complaint record.');
      setStandaloneRemark('');
      await fetchDetails();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddingRemark(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner spinner-primary" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b' }}>Loading complaint for authority review...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: '#dc2626' }}>Complaint not found.</p>
        <Link to="/authority" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Authority Dashboard
        </Link>
      </div>
    );
  }

  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[complaint.status] || [];

  const imageUrl = complaint.imageUrl
    ? (complaint.imageUrl.startsWith('http') || complaint.imageUrl.startsWith('/api')
        ? complaint.imageUrl
        : `/api/complaints/images/${complaint.imageUrl.replace(/^\/api\/complaints\/images\//, '')}`)
    : null;

  return (
    <div className="container" style={{ maxWidth: '1080px' }}>
      {/* Top Bar */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/authority" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Authority Console
        </Link>
        <button onClick={fetchDetails} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle size={18} />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Grid: Left Column Complaint Details / Right Column Authority Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Complaint Details & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e40af', backgroundColor: '#eff6ff', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                {complaint.referenceId}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <CategoryBadge category={complaint.category} />
            </div>

            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              {complaint.title}
            </h1>

            <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="#64748b" /> <strong>Location:</strong> {complaint.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} color="#64748b" /> <strong>Reported On:</strong> {formatDate(complaint.createdAt)}
              </div>
              {complaint.citizenName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} color="#64748b" /> <strong>Citizen:</strong> {complaint.citizenName} ({complaint.citizenEmail || 'Email withheld'})
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.375rem' }}>
                Description
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#334155', backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                {complaint.description}
              </p>
            </div>

            {/* Photo Evidence */}
            {imageUrl && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <ImageIcon size={15} /> Uploaded Photo Evidence
                </h4>
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#0f172a' }}>
                  <img
                    src={imageUrl}
                    alt="Complaint Evidence"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            {/* AI Analysis Summary */}
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Sparkles size={16} color="#2563eb" />
                <strong style={{ fontSize: '0.875rem', color: '#1e40af' }}>AI Classifier Findings</strong>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
                Predicted: <strong>{complaint.category}</strong> with <strong>{complaint.priority}</strong> priority.
                {complaint.aiConfidenceScore && (
                  <span style={{ marginLeft: '6px', color: '#059669', fontWeight: 600 }}>
                    ({formatConfidence(complaint.aiConfidenceScore)} confidence)
                  </span>
                )}
                {complaint.aiExplanation && (
                  <p style={{ marginTop: '0.375rem', fontStyle: 'italic', color: '#1e3a8a' }}>
                    &ldquo;{complaint.aiExplanation}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="card">
            <h3 className="card-title">Audit Trail & History</h3>
            <TimelineTracker currentStatus={complaint.status} history={history} />
          </div>
        </div>

        {/* Right Column: Municipal Management Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action 1: Status Workflow Transition */}
          <div className="card" style={{ borderTop: '4px solid #2563eb' }}>
            <h3 className="card-title" style={{ fontSize: '1.125rem' }}>
              Update Resolution Status
            </h3>
            <p className="card-subtitle">
              Current status is <StatusBadge status={complaint.status} />
            </p>

            {allowedNextStatuses.length === 0 ? (
              <div className="alert alert-info" style={{ fontSize: '0.8125rem' }}>
                This complaint is in terminal status (<strong>{complaint.status}</strong>) and cannot be transitioned further.
              </div>
            ) : (
              <form onSubmit={handleStatusSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    Allowed Target Status <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Next Status --</option>
                    {allowedNextStatuses.map((st) => (
                      <option key={st} value={st}>
                        {STATUSES[st]?.label || st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Official Remarks / Transition Reason
                    {selectedStatus === 'REJECTED' && <span className="required"> * (Mandatory for rejection)</span>}
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide details regarding the status change, dispatch notes, or reason for rejection..."
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    rows={3}
                    required={selectedStatus === 'REJECTED'}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={statusUpdating || !selectedStatus}
                >
                  {statusUpdating ? <span className="spinner" /> : <><CheckSquare size={16} /> Confirm Status Transition</>}
                </button>
              </form>
            )}
          </div>

          {/* Action 2: Department Assignment */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.125rem' }}>
              Assign Department & Officer
            </h3>
            <p className="card-subtitle">Direct the complaint to the field operational team</p>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                  required
                >
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Officer / Desk</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Officer R. Sharma, Ward 24 Division"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled={assigning}
              >
                {assigning ? <span className="spinner spinner-primary" /> : 'Save Assignment'}
              </button>
            </form>
          </div>

          {/* Action 3: Reclassify Category / Priority */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.125rem' }}>
              Review AI Classification
            </h3>
            <p className="card-subtitle">Adjust category or priority if justified upon inspection</p>

            <form onSubmit={handleReclassifySubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {Object.keys(CATEGORIES).map((key) => (
                    <option key={key} value={key}>{CATEGORIES[key].label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  {Object.keys(PRIORITIES).map((key) => (
                    <option key={key} value={key}>{PRIORITIES[key].label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reclassification Rationale</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Reason for changing AI classification..."
                  value={reclassReason}
                  onChange={(e) => setReclassReason(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled={reclassifying}
              >
                {reclassifying ? <span className="spinner spinner-primary" /> : 'Update Classification'}
              </button>
            </form>
          </div>

          {/* Action 4: Add Official Remark */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.125rem' }}>
              Post Official Remark
            </h3>
            <p className="card-subtitle">Log an internal or citizen-facing update to the audit trail</p>

            <form onSubmit={handleAddRemarkSubmit}>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  placeholder="Type an official remark or update note..."
                  value={standaloneRemark}
                  onChange={(e) => setStandaloneRemark(e.target.value)}
                  rows={2}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled={addingRemark || !standaloneRemark.trim()}
              >
                {addingRemark ? <span className="spinner spinner-primary" /> : <><Send size={14} /> Add Official Remark</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
