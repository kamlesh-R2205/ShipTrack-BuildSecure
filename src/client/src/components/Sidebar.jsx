import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ currentPage, onNavigate }) {
  const { role } = useAuth();

  const navItems = [];

  if (role === 'CUSTOMER') {
    navItems.push(
      { key: 'customer-dashboard', label: 'Overview', icon: '📊' },
      { key: 'create-shipment', label: 'New Shipment', icon: '📦' },
      { key: 'my-shipments', label: 'My Shipments', icon: '🚚' },
      { key: 'public-track', label: 'Track Parcel', icon: '🔍' },
      { key: 'profile', label: 'Security Profile', icon: '🛡️' }
    );
  } else if (role === 'DRIVER') {
    navItems.push(
      { key: 'driver-dashboard', label: 'Delivery Queue', icon: '📋' },
      { key: 'public-track', label: 'Track Parcel', icon: '🔍' },
      { key: 'profile', label: 'Driver Profile', icon: '🛡️' }
    );
  } else if (role === 'ADMIN') {
    navItems.push(
      { key: 'admin-dashboard', label: 'System Control', icon: '⚡' },
      { key: 'admin-shipments', label: 'Shipment Registry', icon: '📦' },
      { key: 'admin-users', label: 'User Directory', icon: '👥' },
      { key: 'admin-security', label: 'Security Audit Logs', icon: '🔒' },
      { key: 'public-track', label: 'Public Tracking', icon: '🔍' },
      { key: 'profile', label: 'Admin Profile', icon: '🛡️' }
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {role} Workspace
        </span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.key}
            className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div>ShipTrack Engine v1.0</div>
        <div style={{ color: '#10b981', marginTop: '4px' }}>● Server Defense Active</div>
      </div>
    </aside>
  );
}
