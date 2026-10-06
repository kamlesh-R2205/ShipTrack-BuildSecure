import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function ThreatMonitor({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchThreatData = async () => {
    try {
      const res = await api.getThreatMonitor();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load threat monitor telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatData();
    const interval = setInterval(fetchThreatData, 8000); // Live poll
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading Live Threat Telemetry...
      </div>
    );
  }

  const recentBlocks = data?.recentBlocks || [];
  const activeIncidents = data?.activeIncidents || [];
  const degradedActors = data?.degradedActors || [];

  return (
    <div className="soc-content">
      {/* Header */}
      <div className="soc-header">
        <div>
          <div className="soc-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            LIVE THREAT MONITOR & CORRELATION FEED
          </div>
          <div className="soc-subtitle">
            Continuous threat stream detecting brute force, BOLA enumeration, and spatial manipulation
          </div>
        </div>

        <div className="soc-meta-pills">
          <div className="meta-pill critical">
            <span className="pulse-dot" style={{ background: '#ef4444' }}></span>
            <span>THREAT STATE: {data?.threatLevel || 'MODERATE'}</span>
          </div>
          <div className="meta-pill">
            <span>DEMO SECURITY TELEMETRY</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {/* Threat Summary Grid */}
      <div className="stats-grid mb-6">
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-label">BLOCKED REQUESTS (REAL-TIME)</div>
          <div className="stat-value" style={{ color: '#f87171' }}>{recentBlocks.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Intercepted by Security Control Plane</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label">DEGRADED TRUST ACTORS</div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>{degradedActors.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trust Score &lt; 80/100</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="stat-label">ACTIVE THREAT CHAINS</div>
          <div className="stat-value" style={{ color: '#a78bfa' }}>{activeIncidents.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correlated Multi-Vector Ingress</div>
        </div>
      </div>

      {/* Live Block Feed and Suspicious Actors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Blocked Requests Stream */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            INTERCEPTED THREAT TELEMETRY FEED
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {recentBlocks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active threats blocked recently.
              </div>
            ) : (
              recentBlocks.map((b) => (
                <div
                  key={b._id}
                  style={{
                    background: '#090d16',
                    border: '1px solid #1e293b',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`decision-tag ${b.decision}`}>{b.decision}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{b.eventType}</span>
                    </div>
                    <span className="meta-pill critical" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                      RISK {b.riskScore}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Actor: <strong style={{ color: '#f8fafc' }}>{b.actorName}</strong> ({b.userRole})
                  </div>

                  {b.reasons && b.reasons[0] && (
                    <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.25rem' }}>
                      ↳ {b.reasons[0]}
                    </div>
                  )}

                  <div className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Target: {b.resource} | {new Date(b.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Degraded Actors Directory */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            SUSPICIOUS & DEGRADED TRUST ACTORS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {degradedActors.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                All actor trust scores are within normal parameters (80+).
              </div>
            ) : (
              degradedActors.map((u) => (
                <div
                  key={u._id}
                  style={{
                    background: '#090d16',
                    border: '1px solid #1e293b',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                      <div className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {u.email} ({u.role})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        className="text-mono"
                        style={{
                          fontWeight: 800,
                          fontSize: '1.25rem',
                          color: u.trustScore < 40 ? '#f87171' : '#fbbf24',
                        }}
                      >
                        {u.trustScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/100</span>
                      </div>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                        {u.trustStatus || 'RESTRICTED'}
                      </span>
                    </div>
                  </div>

                  {u.trustHistory?.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.4rem', borderTop: '1px dashed #1e293b', paddingTop: '0.4rem' }}>
                      Recent Decay: {u.trustHistory[u.trustHistory.length - 1]?.reason} ({u.trustHistory[u.trustHistory.length - 1]?.delta} pts)
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
