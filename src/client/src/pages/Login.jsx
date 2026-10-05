import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') onNavigate('admin-dashboard');
      else if (user.role === 'DRIVER') onNavigate('driver-dashboard');
      else onNavigate('customer-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'var(--accent-blue-light)', borderRadius: '12px', color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>SHIPTRACK PORTAL</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Defensive logistics and supply chain command
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@shiptrack.io"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('register')}>
            Register here
          </span>
        </div>

        {/* Demo Accounts Quick-Fill for Evaluators / Judges */}
        <div className="demo-account-box">
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            ⚡ Hackathon Evaluation Quick-Fill:
          </div>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('admin@shiptrack.io', 'Admin@Secure2026!')}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('driver1@shiptrack.io', 'Driver1@Secure2026!')}
            >
              Driver 1
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('customer1@shiptrack.io', 'Customer1@Secure2026!')}
            >
              Customer 1
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('customer2@shiptrack.io', 'Customer2@Secure2026!')}
            >
              Customer 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
