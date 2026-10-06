import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = async (loginEmail, loginPass) => {
    setError('');
    setLoading(true);

    try {
      const user = await login(loginEmail, loginPass);
      // For ShipTrack Guard, all users can access the Guard Control Center, or route by role
      if (user.role === 'ADMIN') onNavigate('overview');
      else if (user.role === 'DRIVER') onNavigate('driver-dashboard');
      else onNavigate('customer-dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const demoAccounts = [
    {
      role: 'ADMIN',
      label: '🛡️ SOC Administrator',
      sub: 'Full Control Plane & Incidents',
      email: 'admin@shiptrack.io',
      pass: 'Admin@Secure2026!',
      color: '#3b82f6',
    },
    {
      role: 'DRIVER 1',
      label: '🚚 Driver 1 (Standard Fleet)',
      sub: 'Trust 88/100, Compliant GPS',
      email: 'driver1@shiptrack.io',
      pass: 'Driver1@Secure2026!',
      color: '#10b981',
    },
    {
      role: 'DRIVER 2',
      label: '⚠️ Driver 2 (Anomalous Route)',
      sub: 'Trust 55/100, Teleport Jump Trigger',
      email: 'driver2@shiptrack.io',
      pass: 'Driver2@Secure2026!',
      color: '#f59e0b',
    },
    {
      role: 'CUSTOMER 1',
      label: '📦 Customer 1 (Fleet Dispatch)',
      sub: 'ST-2026-001 & ST-2026-002 Owner',
      email: 'customer1@shiptrack.io',
      pass: 'Customer1@Secure2026!',
      color: '#8b5cf6',
    },
    {
      role: 'CUSTOMER 2',
      label: '🔒 Customer 2 (BOLA Isolated)',
      sub: 'Cannot read Customer 1 Parcels',
      email: 'customer2@shiptrack.io',
      pass: 'Customer2@Secure2026!',
      color: '#06b6d4',
    },
  ];

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b13', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
        
        {/* Brand Console Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', color: '#38bdf8', marginBottom: '0.75rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '0.04em' }}>
            SHIPTRACK GUARD
          </h1>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700, marginTop: '0.2rem', letterSpacing: '0.08em' }}>
            DEFENSIVE OPERATIONS CONSOLE
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.35rem' }}>
            Detect. Evaluate. Prevent. Continuous runtime security for logistics operations.
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#f87171', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* 1-Click Demo Evaluation Profiles */}
        <div style={{ marginBottom: '1.5rem', background: '#090d16', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            ⚡ Hackathon Evaluation Quick-Access:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem' }}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.pass);
                  executeLogin(acc.email, acc.pass);
                }}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.8rem',
                  background: '#0b1120',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = acc.color)}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{acc.label}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{acc.sub}</div>
                </div>
                <span style={{ fontSize: '0.65rem', color: acc.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  1-CLICK LOGIN &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Operative Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@shiptrack.io"
              style={{ background: '#090d16', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '0.85rem' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Security Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ background: '#090d16', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '0.85rem' }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Verifying Credentials...' : 'Authenticate Into Control Plane'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
          Need new operative access?{' '}
          <span style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('register')}>
            Register Credentials
          </span>
        </div>
      </div>
    </div>
  );
}
