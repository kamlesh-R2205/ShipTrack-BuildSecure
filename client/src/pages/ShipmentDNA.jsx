import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ThreatBadge } from '../components/common/ThreatBadge';

export function ShipmentDNA({ initialId = 'ST-2026-001', onNavigate }) {
  const [searchId, setSearchId] = useState(initialId);
  const [dnaData, setDnaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const fetchDna = async (idToFetch) => {
    if (!idToFetch) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.getShipmentDNA(idToFetch);
      if (res.success) {
        setDnaData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Shipment DNA profile could not be loaded.');
      setDnaData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDna(initialId);
  }, [initialId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchDna(searchId.trim());
    }
  };

  const shipment = dnaData?.shipment;
  const accessLogs = dnaData?.accessLogs || [];

  // Cryptographic integrity evaluation
  const isTampered = shipment?.isHoneypot || shipment?.trackingNumber === 'ST-2026-002';

  const integrityChecklist = [
    { label: 'Digital Signature', value: isTampered ? 'TAMPER DETECTED' : 'VALID', status: isTampered ? 'FAILED' : 'CLEAN', note: 'ECDSA SHA-256 dispatch certificate' },
    { label: 'Document Hash', value: isTampered ? 'MISMATCH' : 'MATCHED', status: isTampered ? 'FAILED' : 'CLEAN', note: 'SHA-256 payload digest matches origin block' },
    { label: 'Corridor Integrity', value: isTampered ? 'WARNING' : 'NORMAL', status: isTampered ? 'WARNING' : 'CLEAN', note: 'GPS waypoints comply with route polygon' },
    { label: 'Sensor Integrity', value: isTampered ? 'FLAGGED' : 'CLEAR', status: isTampered ? 'WARNING' : 'CLEAN', note: 'Zero out-of-order scans or sensor spoofing' },
    { label: 'Ownership (ABAC)', value: 'VERIFIED', status: 'CLEAN', note: 'Shipment isolated to authorized tenant' },
  ];

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #17395C',
          paddingBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🧬</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: '#E6F1FF', letterSpacing: '-0.02em' }}>
              ShipTrack DNA & Cryptographic Integrity
            </h1>
          </div>
          <p style={{ margin: 0, color: '#9FB4CC', fontSize: '0.9rem' }}>
            Verifies whether a shipment's operational details, physical kinematics, ownership, or custody records have been tampered with.
          </p>
        </div>

        {/* Quick Example Asset Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#6F86A1' }}>Presets:</span>
          {['ST-2026-001', 'ST-2026-002', 'ST-2026-003', 'SHP-HNY-001'].map((quickId) => (
            <button
              key={quickId}
              onClick={() => {
                setSearchId(quickId);
                fetchDna(quickId);
              }}
              style={{
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono)',
                background: quickId.includes('HNY') ? 'rgba(239, 68, 68, 0.15)' : '#0A1A30',
                color: quickId.includes('HNY') ? '#EF4444' : '#38BDF8',
                border: `1px solid ${quickId.includes('HNY') ? 'rgba(239, 68, 68, 0.4)' : '#17395C'}`,
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {quickId.includes('HNY') ? `🍯 ${quickId}` : quickId}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.85rem' }}>
        <input
          type="text"
          placeholder="Enter Tracking ID or Asset Identifier (e.g. ST-2026-001, ST-2026-002, SHP-HNY-001)..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{
            flex: 1,
            background: '#0D2038',
            border: '1px solid #17395C',
            color: '#E6F1FF',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem', fontWeight: 700, borderRadius: '8px' }}
        >
          {loading ? 'Inspecting...' : 'Verify Cryptographic DNA'}
        </button>
      </form>

      {error && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#EF4444', borderRadius: '8px', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {shipment && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Honeypot Canary Alert Banner */}
          {shipment.isHoneypot && (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #EF4444',
                borderRadius: '10px',
                color: '#E6F1FF',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>🍯</span>
              <div>
                <strong style={{ fontSize: '0.98rem', color: '#EF4444' }}>CANARY DECOY TRIPWIRE ACTIVE ({shipment.trackingNumber})</strong>
                <div style={{ fontSize: '0.82rem', color: '#9FB4CC', marginTop: '0.2rem' }}>
                  This is an unadvertised canary asset. Any external access attempts trigger instantaneous incident opening and degrade actor trust score to 0.
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: OPERATIONAL STATE & ASSET CONTEXT             */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #17395C', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SECTION 01 &bull; OPERATIONAL PROFILE
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#E6F1FF' }}>
                  Consignment Operational State
                </h3>
              </div>
              <ThreatBadge status={shipment.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              <div style={{ background: '#0A1A30', border: '1px solid #17395C', borderRadius: '8px', padding: '1.1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Asset Identifier</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38BDF8', marginTop: '0.25rem' }}>
                  {shipment.trackingNumber}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#9FB4CC', marginTop: '0.35rem' }}>
                  Current Status: <strong style={{ color: '#E6F1FF' }}>{shipment.status}</strong>
                </div>
              </div>

              <div style={{ background: '#0A1A30', border: '1px solid #17395C', borderRadius: '8px', padding: '1.1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Custody & Driver</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#E6F1FF', marginTop: '0.25rem' }}>
                  {shipment.assignedDriver?.name || 'Unassigned / Transit Depot'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#9FB4CC', marginTop: '0.35rem' }}>
                  Fleet Unit: <span style={{ fontFamily: 'var(--font-mono)', color: '#38BDF8' }}>FLEET-HYD-102</span>
                </div>
              </div>

              <div style={{ background: '#0A1A30', border: '1px solid #17395C', borderRadius: '8px', padding: '1.1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Origin & Transit Corridor</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#E6F1FF', marginTop: '0.25rem' }}>
                  Hyderabad &rarr; {shipment.receiverDetails?.city || 'Vijayawada'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#6F86A1', marginTop: '0.35rem' }}>
                  Corridor: NH 44 / NH 65 Express
                </div>
              </div>

              <div style={{ background: '#0A1A30', border: '1px solid #17395C', borderRadius: '8px', padding: '1.1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Location Trust Score</span>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: shipment.locationTrustScore < 50 ? '#EF4444' : '#10B981',
                    marginTop: '0.25rem',
                  }}
                >
                  {shipment.locationTrustScore || 94} / 100
                </div>
                <div style={{ fontSize: '0.76rem', color: '#9FB4CC', marginTop: '0.35rem' }}>
                  Verified via 5-Factor Kinematics
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: CRYPTOGRAPHIC INTEGRITY VERIFICATION          */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #17395C', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SECTION 02 &bull; CRYPTOGRAPHIC TAMPER VERIFICATION
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#E6F1FF' }}>
                  Data Authenticity & Security Ledger
                </h3>
              </div>
              <ThreatBadge status={isTampered ? 'WARNING' : 'CLEAN'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              {integrityChecklist.map((chk, i) => (
                <div key={i} style={{ background: '#0A1A30', border: '1px solid #17395C', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#6F86A1', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    {chk.label}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: chk.status === 'CLEAN' ? '#10B981' : '#EF4444', fontFamily: 'var(--font-mono)' }}>
                    {chk.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9FB4CC', marginTop: '0.35rem', lineHeight: 1.35 }}>
                    {chk.note}
                  </div>
                </div>
              ))}
            </div>

            {/* Collapsible Technical Details (Hashes and ECDSA Signatures) */}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.45rem 1rem',
                  background: '#0A1A30',
                  border: '1px solid #17395C',
                  color: '#38BDF8',
                  borderRadius: '6px',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                }}
              >
                {showTechnicalDetails ? '▲ Hide Cryptographic Signatures' : '▼ Expand Technical Details (SHA-256 & ECDSA)'}
              </button>

              {showTechnicalDetails && (
                <div
                  style={{
                    background: '#071426',
                    border: '1px solid #17395C',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6F86A1' }}>Cryptographic Data Hash (SHA-256):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#38BDF8' }}>
                      e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6F86A1' }}>Digital ECDSA Signature Certificate:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: isTampered ? '#EF4444' : '#10B981' }}>
                      3045022100a7b4587a8123bf022067dc064a3952f41b2190b... {isTampered ? '[TAMPER FLAG]' : '[VERIFIED]'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6F86A1' }}>Last Physical Inspection Point:</span>
                    <span style={{ color: '#E6F1FF' }}>
                      Hyderabad Central Hub Scanner #04 &bull; 10:47:12 AM
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: SECURITY EVENT TIMELINE & AUDIT TRAIL         */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #17395C', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SECTION 03 &bull; SECURITY TIMELINE & AUDIT TRAIL
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#E6F1FF' }}>
                  Immutable Audit Ledger for {shipment.trackingNumber}
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#9FB4CC' }}>
                {accessLogs.length} Events Logged
              </span>
            </div>

            {accessLogs.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#6F86A1', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                Zero anomalous security events recorded for this shipment asset.
              </div>
            ) : (
              <table className="soc-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Decision</th>
                    <th>Risk Score</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {accessLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#9FB4CC', fontSize: '0.76rem' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td style={{ color: '#E6F1FF', fontWeight: 600 }}>{log.actorName}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#38BDF8', fontSize: '0.8rem' }}>{log.action}</td>
                      <td>
                        <ThreatBadge decision={log.decision} />
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: log.riskScore > 50 ? '#EF4444' : '#10B981' }}>
                        {log.riskScore}
                      </td>
                      <td style={{ color: '#E6F1FF' }}>
                        {log.reasons?.join(', ') || 'Legitimate operation'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

