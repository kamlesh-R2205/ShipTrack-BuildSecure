import React, { useState } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { TimelineStepper } from '../components/TimelineStepper';

export function Landing({ onNavigate }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setTrackingResult(null);

    try {
      const res = await api.trackPublic(trackingNumber.trim());
      setTrackingResult(res.data);
    } catch (err) {
      setError(err.message || 'Tracking number not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-body" style={{ maxWidth: '1000px', paddingTop: '3rem' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '6px 14px', background: 'var(--accent-blue-light)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '9999px', color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          <span>🛡️</span> BUILD SECURE 24 LOGISTICS PLATFORM
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
          Defensive Logistics & <br />
          <span style={{ color: 'var(--accent-blue)' }}>Cryptographic Tracking</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
          Zero-trust delivery management engineered with server-enforced access controls, Finite State Machine integrity, and automated security audit telemetry.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('login')}>
            Access Platform Console
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('register')}>
            Register as Customer / Driver
          </button>
        </div>
      </div>

      {/* Public Tracking Input Box */}
      <div className="card mb-6" style={{ maxWidth: '750px', margin: '0 auto 3rem auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          Public Shipment Tracking
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          Look up delivery status with automated PII privacy protection
        </p>

        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-input text-mono"
            style={{ fontSize: '1rem', textTransform: 'uppercase' }}
            placeholder="Enter Tracking ID (e.g. ST-2026-F89A-24E1)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '140px' }}>
            {loading ? 'Searching...' : 'Track Parcel'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', marginTop: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Tracking Result Panel */}
      {trackingResult && (
        <div className="card mb-6" style={{ maxWidth: '850px', margin: '0 auto', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
          <div className="flex-between mb-4">
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tracking Number</div>
              <div className="text-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                {trackingResult.trackingNumber}
              </div>
            </div>
            <StatusBadge status={trackingResult.status} />
          </div>

          <TimelineStepper currentStatus={trackingResult.status} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', margin: '1.5rem 0' }}>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Origin City</span>
              <strong>{trackingResult.originCity}</strong>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Destination</span>
              <strong>{trackingResult.destinationCity}</strong>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Masked Recipient</span>
              <strong className="text-mono" style={{ color: '#60a5fa' }}>{trackingResult.receiverNameMasked}</strong>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Weight</span>
              <strong>{trackingResult.weightKg} kg</strong>
            </div>
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Checkpoint Milestones
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Location</th>
                  <th>Note</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {trackingResult.statusHistory?.map((h, i) => (
                  <tr key={i}>
                    <td><StatusBadge status={h.status} /></td>
                    <td>{h.location || 'Hub'}</td>
                    <td>{h.note || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(h.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
