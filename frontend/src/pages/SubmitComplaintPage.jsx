import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import ImageUploadPreview from '../components/ImageUploadPreview';
import CategoryBadge from '../components/CategoryBadge';
import PriorityBadge from '../components/PriorityBadge';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { formatConfidence } from '../utils/formatters';
import {
  FilePlus,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export default function SubmitComplaintPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // AI Prediction state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  // Run AI Analysis on Title + Description
  const handleAnalyzeWithAI = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      setError('Please provide at least a title or description for AI analysis.');
      return;
    }

    setAiAnalyzing(true);
    setError('');
    try {
      const result = await complaintService.analyzeComplaint(formData.title, formData.description);
      setAiPrediction(result);
      // Pre-select predicted values
      setSelectedCategory(result.predictedCategory);
      setSelectedPriority(result.predictedPriority);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Complaint title is mandatory.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Complaint description is mandatory.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location / Area is mandatory to assist municipal inspection.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('location', formData.location.trim());

      // If user had AI prediction or customized
      if (selectedCategory) {
        data.append('category', selectedCategory);
      }
      if (selectedPriority) {
        data.append('priority', selectedPriority);
      }

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const response = await complaintService.submitComplaint(data);
      const refId = response.referenceId || response.id;
      navigate(`/complaints/${refId}?submitted=true`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '840px' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <FilePlus size={18} /> Public Civic Grievance Form
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            File a New Civic Complaint
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Provide accurate details and photo evidence. Our AI system will classify the issue and route it to the responsible municipal department.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Complaint Title <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Dangerous deep pothole near Metro station entrance"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <span className="form-help">Keep it concise and descriptive.</span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Describe the problem, severity, duration, hazards, and surrounding landmarks..."
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              Location / Area / Landmark <span className="required">*</span>
            </label>
            <input
              type="text"
              name="location"
              className="form-input"
              placeholder="e.g. Corner of 5th Cross & Outer Ring Road, Ward 24"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Photo Evidence Upload */}
          <ImageUploadPreview
            previewUrl={previewUrl}
            onFileSelected={handleFileSelected}
            clearFile={handleClearFile}
          />

          {/* AI Analysis Trigger & Preview Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              margin: '1.5rem 0',
            }}
          >
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#2563eb" />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                  AI Civic Classification & Priority Prediction
                </span>
              </div>
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={aiAnalyzing || (!formData.title.trim() && !formData.description.trim())}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#93c5fd', color: '#1e40af', backgroundColor: '#eff6ff' }}
              >
                {aiAnalyzing ? (
                  <span className="spinner spinner-primary" style={{ width: '14px', height: '14px' }} />
                ) : (
                  <Sparkles size={14} />
                )}
                {aiPrediction ? 'Re-Analyze with AI' : 'Analyze Text with AI'}
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
              Our baseline NLP engine examines your complaint text to suggest the most appropriate municipal department and urgency level.
            </p>

            {aiPrediction ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      PREDICTED CATEGORY:
                    </span>
                    <CategoryBadge category={aiPrediction.predictedCategory} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      PREDICTED PRIORITY:
                    </span>
                    <PriorityBadge priority={aiPrediction.predictedPriority} />
                  </div>
                  {aiPrediction.confidenceScore !== undefined && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        CONFIDENCE:
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
                        {formatConfidence(aiPrediction.confidenceScore)}
                      </span>
                    </div>
                  )}
                </div>

                {aiPrediction.explanation && (
                  <div style={{ fontSize: '0.8125rem', color: '#334155', backgroundColor: '#f1f5f9', padding: '0.625rem', borderRadius: '6px' }}>
                    <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#2563eb' }} />
                    <strong>Classifier Explanation:</strong> {aiPrediction.explanation}
                  </div>
                )}

                {/* Allow citizen to review or adjust if needed */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                      Confirm or Adjust Category:
                    </label>
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {Object.keys(CATEGORIES).map((key) => (
                        <option key={key} value={key}>
                          {CATEGORIES[key].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                      Confirm or Adjust Priority:
                    </label>
                    <select
                      className="form-select"
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                    >
                      {Object.keys(PRIORITIES).map((key) => (
                        <option key={key} value={key}>
                          {PRIORITIES[key].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.75rem', color: '#94a3b8', fontSize: '0.8125rem', fontStyle: 'italic' }}>
                Type your title and description above, then click &ldquo;Analyze Text with AI&rdquo; or simply submit to let the server classify automatically.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/citizen')}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" /> Submitting Report...
                </>
              ) : (
                <>
                  Submit Complaint <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
