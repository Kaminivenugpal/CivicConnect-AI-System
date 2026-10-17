import React from 'react';
import { Shield, PhoneCall, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderTop: '1px solid #1e293b', marginTop: '4rem', padding: '3rem 0 1.5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Column 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.75rem' }}>
              <Shield size={20} color="#3b82f6" />
              <span>CivicConnect AI</span>
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: '#94a3b8' }}>
              Empowering citizens and municipal departments with intelligent civic complaint analysis, automated priority routing, and transparent status tracking.
            </p>
          </div>

          {/* Column 2: Public Civic Categories */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Civic Services
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Roads & Pothole Repairs</li>
              <li>Water Supply & Pipeline Leakages</li>
              <li>Streetlight & Electrical Grid Failures</li>
              <li>Solid Waste & Public Sanitation</li>
              <li>Drainage & Stormwater Maintenance</li>
            </ul>
          </div>

          {/* Column 3: Contact & Municipal Helpline */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Municipal Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneCall size={14} color="#60a5fa" />
                <span>Civic Helpline: 1800-CIVIC-CONNECT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="#60a5fa" />
                <span>support@civicconnect.gov</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="#60a5fa" />
                <span>Municipal Corporation Headquarters</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
          <div>
            &copy; {new Date().getFullYear()} CivicConnect AI Portal. Developed for Public Infrastructure & Civic Transparency.
          </div>
          <div>
            <span>Version 1.0.0 (Production Ready)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
