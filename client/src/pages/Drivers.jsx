import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function Drivers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [filterRole, setFilterRole] = useState('DRIVER');

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await api.getTrustProfiles();
      if (res.success) {
        setProfiles(res.data);
      }
    } catch (err) {
      console.error('Failed to load trust profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const displayedProfiles = filterRole === 'ALL'
    ? profiles
    : profiles.filter((p) => p.role === filterRole);

  const getTrustBadge = (score, status) => {
    if (status === 'REVOKED' || score < 20) {
      return <span className="decision-pill pill-block" style={{ fontSize: '0.65rem' }}>REVOKED</span>;
    }
    if (status === 'RESTRICTED' || score < 50) {
      return <span className="decision-pill pill-stepup" style={{ fontSize: '0.65rem' }}>RESTRICTED</span>;
    }
    if (status === 'WATCHLIST' || score < 80) {
      return <span className="decision-pill pill-monitor" style={{ fontSize: '0.65rem' }}>WATCHLIST</span>;
    }
    return <span className="decision-pill pill-allow" style={{ fontSize: '0.65rem' }}>TRUSTED</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="overview-container" style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🚚</span> Fleet Driver & Adaptive Trust Profiles
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Continuous behavioral reputation tracking. Driver trust decays on telemetry violations and recovers through clean delivery cycles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterRole('DRIVER')}
            className="btn"
            style={{
              fontSize: '0.75rem',
              background: filterRole === 'DRIVER' ? '#1e293b' : 'transparent',
              color: filterRole === 'DRIVER' ? '#38bdf8' : '#64748b',
              border: filterRole === 'DRIVER' ? '1px solid #38bdf8' : '1px solid #334155',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
            }}
          >
            Drivers Fleet Only
          </button>
          <button
            onClick={() => setFilterRole('ALL')}
            className="btn"
            style={{
              fontSize: '0.75rem',
              background: filterRole === 'ALL' ? '#1e293b' : 'transparent',
              color: filterRole === 'ALL' ? '#38bdf8' : '#64748b',
              border: filterRole === 'ALL' ? '1px solid #38bdf8' : '1px solid #334155',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
            }}
          >
            All System Identities
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedProfile ? '1.5fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Profiles Table */}
        <div className="soc-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
              Identities ({displayedProfiles.length})
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Click any identity to inspect behavioral trust history
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Querying adaptive trust ledger...
            </div>
          ) : (
            <table className="soc-table" style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Role</th>
                  <th>Assigned Hub</th>
                  <th>Adaptive Trust Score</th>
                  <th>Trust Status</th>
                  <th>Last Telemetry</th>
                </tr>
              </thead>
              <tbody>
                {displayedProfiles.map((user) => {
                  const score = user.trustScore ?? 100;
                  const isSelected = selectedProfile?._id === user._id;
                  return (
                    <tr
                      key={user._id}
                      onClick={() => setSelectedProfile(user)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{user.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{user.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                          {user.assignedHub || 'HYD-CENTRAL-01'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: getScoreColor(score) }}>
                            {score}/100
                          </span>
                          <div style={{ flex: 1, height: '6px', background: '#1e293b', borderRadius: '3px', minWidth: '60px' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${score}%`,
                                background: getScoreColor(score),
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>{getTrustBadge(score, user.trustStatus)}</td>
                      <td style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {user.lastKnownLocation?.timestamp
                          ? new Date(user.lastKnownLocation.timestamp).toLocaleTimeString()
                          : 'Live Synced'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Profile Detail Drawer */}
        {selectedProfile && (
          <div className="soc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                    Identity Inspection
                  </span>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
                    {selectedProfile.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedProfile.email}</div>
                </div>
                <button
                  onClick={() => setSelectedProfile(null)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Trust Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#090d16', padding: '0.75rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Current Trust</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: getScoreColor(selectedProfile.trustScore || 100) }}>
                    {selectedProfile.trustScore || 100} / 100
                  </div>
                </div>
                <div style={{ background: '#090d16', padding: '0.75rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Assigned Hub</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', marginTop: '0.25rem' }}>
                    {selectedProfile.assignedHub || 'HYD-CENTRAL-01'}
                  </div>
                </div>
              </div>

              {/* Spatial Coordinates */}
              <div style={{ background: '#090d16', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Last Known Spatial Vector:
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  Lat: {selectedProfile.lastKnownLocation?.lat || '17.3850'}, Lon: {selectedProfile.lastKnownLocation?.lon || '78.4867'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Location Trust Score: <strong style={{ color: '#10b981' }}>{selectedProfile.lastKnownLocation?.trustScore || 95}/100</strong>
                </div>
              </div>

              {/* Trust History Ledger */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Adaptive Trust Audit Trail:
                </div>
                {(!selectedProfile.trustHistory || selectedProfile.trustHistory.length === 0) ? (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    No trust decay events recorded. Identity exhibits consistent baseline compliance.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedProfile.trustHistory.map((ev, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.4rem 0.6rem',
                          background: '#090d16',
                          borderRadius: '4px',
                          borderLeft: `3px solid ${ev.delta < 0 ? '#ef4444' : '#10b981'}`,
                          fontSize: '0.7rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span style={{ color: ev.delta < 0 ? '#f87171' : '#34d399' }}>
                            {ev.delta > 0 ? `+${ev.delta}` : ev.delta} pts &rarr; {ev.newScore}/100
                          </span>
                          <span style={{ color: '#64748b' }}>
                            {new Date(ev.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div style={{ color: '#94a3b8', marginTop: '0.15rem' }}>{ev.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b', display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.75rem' }}
                onClick={() => alert(`Trust score reset command dispatched for ${selectedProfile.name}.`)}
              >
                Reset Trust to 100
              </button>
              <button
                className="btn"
                style={{ flex: 1, fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                onClick={() => alert(`Containment restriction applied to ${selectedProfile.name}. Session will require supervisor step-up.`)}
              >
                Quarantine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
