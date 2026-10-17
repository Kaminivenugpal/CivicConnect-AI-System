import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  FilePlus,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Truck,
  Droplets,
  Zap,
  Trash2,
  Waves,
  Building2,
  UserCheck,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isAuthority, isCitizen } = useAuth();
  const [trackRefId, setTrackRefId] = useState('');
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackRefId.trim()) {
      navigate(`/complaints/${trackRefId.trim()}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '4.5rem 0 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                color: '#bfdbfe',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}
            >
              <Sparkles size={15} color="#60a5fa" />
              AI-Powered Civic Complaint & Public Infrastructure Portal
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                marginBottom: '1.25rem',
              }}
            >
              Faster Civic Grievance Resolution Through{' '}
              <span style={{ color: '#60a5fa' }}>Intelligent AI Triage</span>
            </h1>

            <p style={{ fontSize: '1.125rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2.25rem' }}>
              Report potholes, water leaks, garbage accumulation, or street lighting failures.
              Our built-in AI classifier identifies the municipal department and assesses priority instantly, connecting you directly to local authorities.
            </p>

            {/* Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {isAuthenticated ? (
                <Link
                  to={isAuthority ? '/authority' : '/citizen'}
                  className="btn btn-primary"
                  style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}
                >
                  Go to {isAuthority ? 'Authority Console' : 'Citizen Dashboard'} <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/submit"
                    className="btn btn-primary"
                    style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}
                  >
                    <FilePlus size={18} /> File a Civic Complaint
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-secondary"
                    style={{ padding: '0.875rem 1.5rem', fontSize: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <Building2 size={18} /> Authority Portal
                  </Link>
                </>
              )}
            </div>

            {/* Public Complaint Tracking Bar */}
            <form
              onSubmit={handleTrackSubmit}
              style={{
                maxWidth: '540px',
                margin: '0 auto',
                display: 'flex',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                padding: '6px',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.75rem', color: '#64748b' }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Enter Complaint Reference ID (e.g. CC-2026-0001)"
                value={trackRefId}
                onChange={(e) => setTrackRefId(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                  color: '#0f172a',
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem' }}>
                Track Status
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Demo Credentials Callout */}
      <section style={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #dbeafe', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#1e40af' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <UserCheck size={16} /> Quick Demo Logins:
          </div>
          <div>
            <strong>Citizen:</strong> citizen@example.com / <code>Citizen@123</code>
          </div>
          <div>
            <strong>Authority:</strong> admin@civicconnect.gov / <code>Admin@123</code>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              How CivicConnect AI Works
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Transparent 3-step civic resolution designed for citizen accountability and municipal speed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <FilePlus size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                1. Report with Evidence
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
                Submit issue title, area location, description, and upload photographic evidence directly from your phone or PC.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#ede9fe',
                  color: '#7c3aed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                2. AI Priority & Category Analysis
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
                Our backend NLP classifier detects the civic category (Roads, Drainage, Electricity) and assigns severity (High, Medium, Low).
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#d1fae5',
                  color: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                3. Authority Resolution & Audit
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
                Municipal officers review the complaint, assign responsible departments, post official notes, and resolve the grievance with full audit history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Civic Categories Grid */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              Supported Civic Categories
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Connecting civic complaints directly to specialized municipal departments
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {[
              { title: 'Roads & Potholes', icon: Truck, color: '#4f46e5', desc: 'Asphalt damage, cave-ins, and missing pavers' },
              { title: 'Water Supply', icon: Droplets, color: '#0284c7', desc: 'Main line burst, low pressure, contamination' },
              { title: 'Electricity & Lights', icon: Zap, color: '#d97706', desc: 'Streetlights out, exposed cables, pole damage' },
              { title: 'Garbage & Sanitation', icon: Trash2, color: '#059669', desc: 'Dumping piles, uncollected bins, cleaning' },
              { title: 'Drainage & Sewage', icon: Waves, color: '#0d9488', desc: 'Clogged manholes, overflow, stagnant water' },
            ].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.375rem', color: '#1e293b' }}>
                    {cat.title}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
