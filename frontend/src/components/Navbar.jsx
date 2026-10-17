import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  FilePlus,
  LayoutDashboard,
  ListFilter,
  LogOut,
  User,
  Menu,
  X,
  Building2,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAuthority, isCitizen, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderBottom: '2px solid #1e3a8a',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Brand / Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} />
          </div>
          <span>
            Civic<span style={{ color: '#60a5fa' }}>Connect</span>{' '}
            <span style={{ fontSize: '0.75rem', backgroundColor: '#1e3a8a', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Portal
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', gap: '1.5rem', alignItems: 'center' }} className="desktop-nav">
          <Link to="/" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Home</Link>

          {isCitizen && (
            <>
              <Link to="/citizen" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/submit" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FilePlus size={16} /> File Complaint
              </Link>
              <Link to="/my-complaints" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ListFilter size={16} /> My Complaints
              </Link>
            </>
          )}

          {isAuthority && (
            <Link to="/authority" style={{ color: '#93c5fd', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={16} /> Authority Console
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', borderLeft: '1px solid #334155', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  {user?.fullName || user?.email}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    color: isAuthority ? '#fbbf24' : '#60a5fa',
                  }}
                >
                  {isAuthority ? 'Municipal Officer' : 'Verified Citizen'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: '#1e293b', color: '#f1f5f9', borderColor: '#475569' }}
                title="Sign out"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: '#475569' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'block',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ backgroundColor: '#1e293b', borderTop: '1px solid #334155', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '0.5rem 0' }}>Home</Link>
          {isCitizen && (
            <>
              <Link to="/citizen" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '0.5rem 0' }}>Citizen Dashboard</Link>
              <Link to="/submit" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '0.5rem 0' }}>File Complaint</Link>
              <Link to="/my-complaints" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '0.5rem 0' }}>My Complaints</Link>
            </>
          )}
          {isAuthority && (
            <Link to="/authority" onClick={() => setMobileMenuOpen(false)} style={{ color: '#93c5fd', padding: '0.5rem 0', fontWeight: 600 }}>Authority Console</Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              <LogOut size={14} /> Sign Out ({user?.fullName || user?.email})
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Register</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
