import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ currentPage, onNavigate }) {
  const { role } = useAuth();

  const securityNav = [
    { key: 'overview', label: 'SOC Overview', icon: '🛡️', badge: null },
    { key: 'threat-monitor', label: 'Threat Monitor', icon: '📡', badge: 'LIVE' },
    { key: 'security-safety-center', label: 'Safety Center', icon: '🔒', badge: '7 LAYERS' },
    { key: 'flight-recorder', label: 'Flight Recorder', icon: '📼', badge: null },
    { key: 'risk-engine', label: 'Risk Engine', icon: '⚙️', badge: null },
    { key: 'attack-simulator', label: 'Attack Simulator', icon: '⚡', badge: 'DEMO' },
    { key: 'reality-engine', label: 'Reality Engine', icon: '📍', badge: 'GPS' },
    { key: 'security-graph', label: 'Security Graph', icon: '🕸️', badge: null },
    { key: 'incidents', label: 'Incidents', icon: '🚨', badge: 'ACTIVE' },
    { key: 'policies', label: 'Security Policies', icon: '📜', badge: '8' },
  ];

  const operationsNav = [
    { key: 'shipments', label: 'Shipment Operations', icon: '📦' },
    { key: 'shipment-dna', label: 'Shipment DNA', icon: '🧬' },
    { key: 'drivers', label: 'Driver Fleet & Trust', icon: '🚚' },
    { key: 'system-health', label: 'System Health', icon: '💻' },
  ];

  if (role === 'CUSTOMER') {
    operationsNav.unshift(
      { key: 'create-shipment', label: 'Dispatch Parcel', icon: '➕' }
    );
  }

  return (
    <aside
      className="sidebar"
      style={{
        width: '240px',
        background: '#0A1A30',
        borderRight: '1px solid #17395C',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid #17395C',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#0D2038',
        }}
      >
        <div style={{ display: 'flex', padding: '6px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.4">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#E6F1FF', letterSpacing: '0.04em' }}>
            SHIPTRACK <span style={{ color: '#38BDF8' }}>GUARD</span>
          </div>
          <div style={{ fontSize: '0.64rem', color: '#6F86A1', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Logistics Control Plane
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ padding: '0.35rem 0.6rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, color: '#6F86A1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Security Intelligence
        </div>
        {securityNav.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <div
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.4)' : 'transparent'}`,
                color: isActive ? '#E6F1FF' : '#9FB4CC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#102943';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1rem', opacity: isActive ? 1 : 0.85 }}>{item.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    background:
                      item.badge === 'LIVE'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : item.badge === 'ACTIVE'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(56, 189, 248, 0.15)',
                    color:
                      item.badge === 'LIVE'
                        ? '#10B981'
                        : item.badge === 'ACTIVE'
                        ? '#EF4444'
                        : '#38BDF8',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}

        <div style={{ padding: '1rem 0.6rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, color: '#6F86A1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Operations & Assets
        </div>
        {operationsNav.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <div
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.4)' : 'transparent'}`,
                color: isActive ? '#E6F1FF' : '#9FB4CC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#102943';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1rem', opacity: isActive ? 1 : 0.85 }}>{item.icon}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Bottom Telemetry Health Status */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #17395C',
          background: '#071426',
          fontSize: '0.72rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6F86A1' }}>SYSTEM STATUS</span>
          <span style={{ color: '#10B981', fontWeight: 700 }}>● RUNTIME ACTIVE</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6F86A1' }}>API (PORT 5000)</span>
          <span style={{ color: '#E6F1FF', fontFamily: 'var(--font-mono)' }}>200 OK (14ms)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6F86A1' }}>DATABASE</span>
          <span style={{ color: '#E6F1FF', fontFamily: 'var(--font-mono)' }}>MONGODB CONNECTED</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6F86A1' }}>CONTROL PLANE</span>
          <span style={{ color: '#38BDF8', fontWeight: 700 }}>ZERO-TRUST GATE</span>
        </div>
      </div>
    </aside>
  );
}

