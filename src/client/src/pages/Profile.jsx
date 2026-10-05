import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SecurityBanner } from '../components/SecurityBanner';

export function Profile() {
  const { user, role, logout } = useAuth();

  return (
    <div className="content-body" style={{ maxWidth: '800px' }}>
      <SecurityBanner />

      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Security Profile & Credentials</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Authenticated identity, access permissions, and session hygiene
          </p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Terminate Session
        </button>
      </div>

      <div className="card mb-6">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          Identity Specifications
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
          <div>
            <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Full Name</span>
            <strong style={{ fontSize: '1.1rem' }}>{user?.name}</strong>
          </div>
          <div>
            <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Primary Email</span>
            <strong className="text-mono">{user?.email}</strong>
          </div>
          <div>
            <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Assigned System Role</span>
            <span className={`role-tag ${role.toLowerCase()}`} style={{ display: 'inline-block', marginTop: '4px' }}>
              {role}
            </span>
          </div>
          <div>
            <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Phone Contact</span>
            <strong>{user?.phone || 'Not Provided'}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', color: '#34d399' }}>
          Active Cryptographic & Security Controls
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span><strong>Password Protection:</strong> Hashed using bcrypt with high work factor (salt rounds = 12).</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span><strong>Cryptographic Tokens:</strong> Signed JWT session token with 24-hour expiration window.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span><strong>Zero Client-Side Trust:</strong> All authorizations re-verified on server during each API call.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span><strong>Security Audit Logging:</strong> Access patterns and blocked attempts logged to MongoDB.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
