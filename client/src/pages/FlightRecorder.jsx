import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ThreatBadge } from '../components/common/ThreatBadge';

export function FlightRecorder() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [decisionFilter, setDecisionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [shipmentFilter, setShipmentFilter] = useState('');

  // Selected Log Drawer
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await api.getFlightRecorder({
        decision: decisionFilter || undefined,
        severity: severityFilter || undefined,
        actor: actorFilter || undefined,
        shipment: shipmentFilter || undefined,
        page: targetPage,
        limit: 15,
      });
      setLogs(res.data?.logs || []);
      setTotal(res.data?.total || 0);
      setPage(targetPage);
    } catch (err) {
      setError(err.message || 'Failed to fetch flight recorder logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [decisionFilter, severityFilter]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div
      className="overview-container"
      style={{
        padding: '2rem 2.5rem',
        maxWidth: '1680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #17395C',
          paddingBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📼</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: '#E6F1FF', letterSpacing: '-0.02em' }}>
              Security Flight Recorder (Audit Black Box)
            </h1>
          </div>
          <p style={{ margin: 0, color: '#9FB4CC', fontSize: '0.9rem' }}>
            Cryptographically structured, immutable audit log capturing every evaluated operation, telemetry check, and policy decision.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.45rem 0.95rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '6px',
              color: '#10B981',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            IMMUTABLE EVIDENCE LOG
          </div>
          <div
            style={{
              padding: '0.45rem 0.95rem',
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '6px',
              color: '#38BDF8',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            TOTAL EVENTS: {total}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter Bar with Spacious Enterprise Controls */}
      <div
        style={{
          background: '#0D2038',
          border: '1px solid #17395C',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
        }}
      >
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by Actor name or email..."
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              style={{
                fontSize: '0.85rem',
                background: '#0A1A30',
                border: '1px solid #17395C',
                color: '#E6F1FF',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                width: '100%',
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by Shipment or Tracking..."
              value={shipmentFilter}
              onChange={(e) => setShipmentFilter(e.target.value)}
              style={{
                fontSize: '0.85rem',
                background: '#0A1A30',
                border: '1px solid #17395C',
                color: '#E6F1FF',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                width: '100%',
              }}
            />
          </div>

          <div style={{ width: '150px' }}>
            <select
              className="form-select"
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              style={{
                fontSize: '0.85rem',
                background: '#0A1A30',
                border: '1px solid #17395C',
                color: '#E6F1FF',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                width: '100%',
              }}
            >
              <option value="">All Decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="BLOCK">BLOCK</option>
              <option value="STEP_UP">STEP_UP</option>
              <option value="MONITOR">MONITOR</option>
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                fontSize: '0.85rem',
                background: '#0A1A30',
                border: '1px solid #17395C',
                color: '#E6F1FF',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                width: '100%',
              }}
            >
              <option value="">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700 }}
          >
            Filter Logs
          </button>
        </form>
      </div>

      {/* Flight Recorder Events Table */}
      <div
        style={{
          background: '#0D2038',
          border: '1px solid #17395C',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Decision</th>
                <th>Actor</th>
                <th>Action & Target</th>
                <th>Risk Score</th>
                <th>Triggered Policies</th>
                <th>Raw Event</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#6F86A1' }}>
                    Loading Flight Recorder Telemetry...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#6F86A1' }}>
                    No events match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className="text-mono" style={{ fontSize: '0.78rem', color: '#9FB4CC' }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                      <div style={{ fontSize: '0.7rem', color: '#6F86A1' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <ThreatBadge decision={log.decision} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#E6F1FF' }}>{log.actorName || 'Anonymous'}</div>
                      <div className="text-mono" style={{ fontSize: '0.74rem', color: '#6F86A1' }}>
                        {log.userRole} &bull; {log.ipAddress}
                      </div>
                    </td>
                    <td>
                      <div className="text-mono" style={{ fontWeight: 600, color: '#38BDF8', fontSize: '0.82rem' }}>
                        {log.action}
                      </div>
                      <div className="text-mono" style={{ fontSize: '0.76rem', color: '#9FB4CC' }}>
                        {log.resource}
                      </div>
                    </td>
                    <td>
                      <span
                        className="text-mono"
                        style={{
                          fontWeight: 800,
                          color: log.riskScore > 60 ? '#EF4444' : log.riskScore > 35 ? '#F59E0B' : '#10B981',
                        }}
                      >
                        {log.riskScore}
                        <span style={{ fontSize: '0.7rem', color: '#6F86A1' }}> / 100</span>
                      </span>
                    </td>
                    <td>
                      {log.policiesTriggered?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {log.policiesTriggered.map((pol, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.45rem',
                                background: '#0A1A30',
                                border: '1px solid #17395C',
                                borderRadius: '4px',
                                color: '#9FB4CC',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {pol}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: '#6F86A1' }}>Baseline Rules</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn btn-sm btn-secondary"
                        style={{
                          fontSize: '0.74rem',
                          padding: '0.35rem 0.75rem',
                          background: '#102943',
                          border: '1px solid #17395C',
                          color: '#E6F1FF',
                          borderRadius: '6px',
                        }}
                      >
                        View Raw Event
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #17395C',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#0A1A30',
            fontSize: '0.82rem',
            color: '#9FB4CC',
          }}
        >
          <div>
            Showing Page <strong style={{ color: '#E6F1FF' }}>{page}</strong> of{' '}
            <strong style={{ color: '#E6F1FF' }}>{Math.ceil(total / 15) || 1}</strong> ({total} total ledger entries)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => fetchLogs(page - 1)}
              style={{
                fontSize: '0.75rem',
                background: '#102943',
                border: '1px solid #17395C',
                color: '#E6F1FF',
              }}
            >
              ← Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={logs.length < 15}
              onClick={() => fetchLogs(page + 1)}
              style={{
                fontSize: '0.75rem',
                background: '#102943',
                border: '1px solid #17395C',
                color: '#E6F1FF',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Selected Log Inspector Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '720px',
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #17395C',
                paddingBottom: '0.85rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#38BDF8',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginRight: '0.65rem',
                  }}
                >
                  AUDIT BLACK BOX EVENT
                </span>
                <span className="text-mono" style={{ fontSize: '0.78rem', color: '#9FB4CC' }}>
                  ID: {selectedLog._id}
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedLog(null)}
                style={{ background: '#102943', border: '1px solid #17395C', color: '#E6F1FF' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: '#6F86A1', fontSize: '0.74rem', textTransform: 'uppercase' }}>ACTOR IDENTITY:</div>
                <div style={{ fontWeight: 700, color: '#E6F1FF', marginTop: '0.2rem' }}>
                  {selectedLog.actorName} ({selectedLog.userRole})
                </div>
                <div className="text-mono" style={{ fontSize: '0.76rem', color: '#9FB4CC' }}>
                  {selectedLog.actorEmail} &bull; {selectedLog.ipAddress}
                </div>
              </div>

              <div>
                <div style={{ color: '#6F86A1', fontSize: '0.74rem', textTransform: 'uppercase' }}>DECISION & RISK:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem' }}>
                  <ThreatBadge decision={selectedLog.decision} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: selectedLog.riskScore > 50 ? '#EF4444' : '#10B981' }}>
                    RISK: {selectedLog.riskScore} / 100
                  </span>
                </div>
              </div>

              <div>
                <div style={{ color: '#6F86A1', fontSize: '0.74rem', textTransform: 'uppercase' }}>ACTION / ENDPOINT:</div>
                <div className="text-mono" style={{ color: '#38BDF8', fontWeight: 600, marginTop: '0.2rem' }}>
                  {selectedLog.action}
                </div>
                <div className="text-mono" style={{ fontSize: '0.76rem', color: '#9FB4CC' }}>
                  {selectedLog.resource}
                </div>
              </div>

              <div>
                <div style={{ color: '#6F86A1', fontSize: '0.74rem', textTransform: 'uppercase' }}>TARGET SHIPMENT:</div>
                <div className="text-mono" style={{ fontWeight: 700, color: '#E6F1FF', marginTop: '0.2rem' }}>
                  {selectedLog.trackingNumber || 'N/A (Platform Ingress Probe)'}
                </div>
              </div>
            </div>

            {/* Evaluation Reasons */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#9FB4CC', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Zero-Trust Evaluation Reasons
              </div>
              <div style={{ background: '#071426', padding: '1rem', borderRadius: '8px', border: '1px solid #17395C' }}>
                {selectedLog.reasons?.map((r, i) => (
                  <div key={i} style={{ color: '#EF4444', fontSize: '0.82rem', marginBottom: '0.35rem', display: 'flex', gap: '0.5rem' }}>
                    <span>&bull;</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Evidence Payload */}
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#9FB4CC', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Raw Audit Evidence Payload (JSON)
              </div>
              <pre
                className="text-mono"
                style={{
                  background: '#050B16',
                  border: '1px solid #17395C',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  color: '#9FB4CC',
                  lineHeight: 1.45,
                }}
              >
                {JSON.stringify(
                  {
                    eventType: selectedLog.eventType,
                    severity: selectedLog.severity,
                    locationData: selectedLog.locationData,
                    trustImpact: selectedLog.trustImpact,
                    evidence: selectedLog.evidence,
                    ipAddress: selectedLog.ipAddress,
                    userAgent: selectedLog.userAgent,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

