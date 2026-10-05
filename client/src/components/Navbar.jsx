import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ onNavigate, currentPage }) {
  const { user, logout, role } = useAuth();

  return (
    <header className="top-navbar">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>SHIPTRACK</span>
        <span className="brand-badge">SECURE PLATFORM</span>
      </div>

      <div className="nav-user">
        {user ? (
          <>
            <span className={`role-tag ${role.toLowerCase()}`}>
              {role}
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={logout}>
              Sign Out
            </button>
          </>
        ) : (
          <div className="gap-2" style={{ display: 'flex' }}>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('login')}>
              Sign In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('register')}>
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
