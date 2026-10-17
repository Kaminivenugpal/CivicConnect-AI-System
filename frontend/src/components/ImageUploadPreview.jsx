import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function ImageUploadPreview({ onFileSelected, previewUrl, clearFile, error }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [internalError, setInternalError] = useState('');

  const validateAndHandleFile = (file) => {
    setInternalError('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setInternalError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setInternalError('File is too large. Maximum allowed image size is 5MB.');
      return;
    }

    onFileSelected(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        Complaint Evidence Photo
        <span className="form-help" style={{ display: 'inline', marginLeft: '6px', fontWeight: 400 }}>
          (Optional, max 5MB - JPEG, PNG, WebP)
        </span>
      </label>

      {previewUrl ? (
        <div
          style={{
            position: 'relative',
            border: '2px solid #cbd5e1',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            maxWidth: '420px',
            maxHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={previewUrl}
            alt="Complaint Preview"
            style={{ width: '100%', height: '240px', objectFit: 'cover' }}
          />
          <button
            type="button"
            onClick={clearFile}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Remove photo"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? '#2563eb' : '#cbd5e1'}`,
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <UploadCloud size={24} />
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#334155' }}>
            Click to upload evidence photo or drag & drop here
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
            Clear photos help municipal teams verify and resolve problems faster
          </div>
        </div>
      )}

      {(internalError || error) && (
        <div className="form-error" style={{ marginTop: '0.5rem' }}>
          <AlertCircle size={14} />
          {internalError || error}
        </div>
      )}
    </div>
  );
}
