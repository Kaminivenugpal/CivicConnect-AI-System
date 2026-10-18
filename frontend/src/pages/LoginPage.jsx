import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { getErrorMessage } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('sessionExpired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.role === 'AUTHORITY') {
        navigate('/authority');
      } else {
        navigate('/citizen');
      }
    }  catch (err) {
  const message = getErrorMessage(err);
  setError(typeof message === 'string' ? message : message?.message || 'Login failed. Please try again.');
} finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoRole) => {
    if (demoRole === 'CITIZEN') {
      setEmail('citizen@example.com');
      setPassword('Citizen@123');
    } else {
      setEmail('admin@civicconnect.gov');
      setPassword('Admin@123');
    }
    setError('');
  };

  return (
    <div className="container" style={{ maxWidth: '460px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.25rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Sign In to CivicConnect
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Access Citizen Dashboard or Municipal Authority Console
          </p>
        </div>

        {sessionExpired && (
          <div className="alert alert-warning" style={{ fontSize: '0.8125rem' }}>
            <AlertCircle size={16} />
            Your session expired. Please sign in again.
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ fontSize: '0.8125rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Demo Fast Fill Buttons */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Autofill:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('CITIZEN')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem' }}
            >
              Fill Citizen
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('AUTHORITY')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', borderColor: '#93c5fd', color: '#1e40af' }}
            >
              Fill Authority
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          New citizen?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: '#2563eb' }}>
            Register citizen account
          </Link>
        </div>
      </div>
    </div>
  );
}
