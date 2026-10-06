import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchIncidents = async () => {
    try {
      const res = await api.getIncidents();
      setIncidents(res.data || []);
      if (res.data?.length > 0 && !selectedIncident) {
        setSelectedIncident(res.data[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleUpdateStatus = async (status) => {
    if (!selectedIncident) return;
    try {
      const res = await api.updateIncidentStatus(selectedIncident.incidentId, {
        status,
        actionNote: `Operator updated incident status to ${status}`,
      });
      setSelectedIncident(res.data);
      setActionSuccess(`Incident status updated to ${status}.`);
      fetchIncidents();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleExecuteRemediation = async (actionType) => {
    if (!selectedIncident) return;
    try {
      const res = await api.executeIncidentAction(selectedIncident.incidentId, {
        actionType,
        note: `Security containment action: ${actionType}`,
      });
      setSelectedIncident(res.data);
      setActionSuccess(`Containment action '${actionType}' executed successfully.`);
      fetchIncidents();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Remediation failed.');
    }
  };

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
            SECURITY INCIDENT CENTER & ATTACK CHAINS
          </div>
          <div className="soc-subtitle">
            Correlates multi-stage security telemetry into incident cases with automated containment responses
          </div>
        </div>

        <div className="soc-meta-pills">
          <div className="meta-pill critical">
            <span>ACTIVE INCIDENTS: {incidents.filter((i) => i.status !== 'RESOLVED').length}</span>
          </div>
        </div>
      </div>

      {actionSuccess && <div className="alert alert-success mb-4">{actionSuccess}</div>}
      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Incident List */}
        <div className="card" style={{ padding: '1rem', maxHeight: '720px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            INCIDENT QUEUE ({incidents.length})
          </h3>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : incidents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No incidents on record. Run the Attack Simulator to generate incident cases.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {incidents.map((inc) => {
                const isSelected = selectedIncident?.incidentId === inc.incidentId;
                return (
                  <div
                    key={inc.incidentId}
                    style={{
                      background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-secondary)',
                      border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => setSelectedIncident(inc)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="text-mono" style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '0.8rem' }}>
                        {inc.incidentId}
                      </span>
                      <span
                        className="decision-tag"
                        style={{
                          background: inc.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: inc.severity === 'CRITICAL' ? '#f87171' : '#fbbf24',
                          border: 'none',
                          fontSize: '0.65rem',
                        }}
                      >
                        {inc.severity}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
                      {inc.title}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Actor: {inc.actor?.name || 'Unknown'}</span>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{inc.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Incident Deep Inspection & Remediation */}
        {selectedIncident ? (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="text-mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    {selectedIncident.incidentId}
                  </span>
                  <span className="badge badge-warning">{selectedIncident.status}</span>
                  <span className="meta-pill critical" style={{ fontSize: '0.7rem' }}>
                    RISK SCORE: {selectedIncident.riskScore}/100
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  {selectedIncident.title}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Detected at: {new Date(selectedIncident.detectedAt).toLocaleString()} | Threat: {selectedIncident.threatType}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${selectedIncident.status === 'INVESTIGATING' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => handleUpdateStatus('INVESTIGATING')}
                >
                  Investigating
                </button>
                <button
                  className={`btn btn-sm ${selectedIncident.status === 'CONTAINED' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => handleUpdateStatus('CONTAINED')}
                >
                  Contained
                </button>
                <button
                  className={`btn btn-sm ${selectedIncident.status === 'RESOLVED' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => handleUpdateStatus('RESOLVED')}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Attack Chain Correlated Flow */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Correlated Multi-Step Attack Chain
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedIncident.attackChain?.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid #1e293b',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {step.step}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                          {step.title}
                        </div>
                        <span className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '0.15rem' }}>
                        Type: {step.eventType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target and Policy Violations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#090d16', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Target Asset & Actor
                </div>
                <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>
                  {selectedIncident.affectedShipment?.trackingNumber || 'Multi-Resource Scanning'}
                </div>
                <div className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Actor: {selectedIncident.actor?.name} ({selectedIncident.actor?.role}) | IP: {selectedIncident.actor?.ipAddress}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Policies Violated
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {selectedIncident.policiesViolated?.map((p, i) => (
                    <span key={i} className="meta-pill active" style={{ fontSize: '0.7rem' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Containment Actions */}
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Operational Security Containment Actions
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  onClick={() => handleExecuteRemediation('RESTRICT_ACTOR')}
                >
                  🔒 Restrict Actor & Decay Trust to 10/100
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                  onClick={() => handleExecuteRemediation('INVALIDATE_SESSION')}
                >
                  ⚡ Invalidate Active Bearer Tokens
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleExecuteRemediation('BLOCK_SENSITIVE_OPERATIONS')}
                >
                  🛑 Block Sensitive Operations
                </button>
              </div>

              {selectedIncident.actionsTaken?.length > 0 && (
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>Action History:</strong>
                  {selectedIncident.actionsTaken.map((a, i) => (
                    <div key={i} style={{ marginTop: '0.25rem' }}>
                      ✓ {a.action} by {a.executedBy} at {new Date(a.executedAt).toLocaleTimeString()} {a.note ? `(${a.note})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
            Select an incident from the queue to inspect details and containment actions.
          </div>
        )}
      </div>
    </div>
  );
}
