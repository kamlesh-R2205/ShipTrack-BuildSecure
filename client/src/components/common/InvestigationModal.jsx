import React, { useState } from 'react';
import { ThreatBadge } from './ThreatBadge';

export function InvestigationModal({ item, onClose, onContain, onResolve }) {
  const [actionNote, setActionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleAction = async (actionType) => {
    setIsSubmitting(true);
    try {
      if (actionType === 'CONTAIN' && onContain) {
        await onContain(item, actionNote);
      } else if (actionType === 'RESOLVE' && onResolve) {
        await onResolve(item, actionNote);
      }
      onClose();
    } catch (err) {
      alert(`Action error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#0a0f1d',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0e1526',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🛡️</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SECURITY INVESTIGATION & TELEMETRY
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.2rem 0 0', color: '#f8fafc' }}>
                {item.title || item.threatType || item.incidentId || 'Incident Inspection'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Key Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Severity Level</div>
              <div style={{ marginTop: '0.35rem' }}>
                <ThreatBadge severity={item.severity || 'HIGH'} />
              </div>
            </div>
            <div style={{ background: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Status</div>
              <div style={{ marginTop: '0.35rem' }}>
                <ThreatBadge status={item.status || 'OPEN'} />
              </div>
            </div>
            <div style={{ background: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Affected Asset</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {item.resource || item.shipment?.trackingNumber || item.targetShipment || 'LOGISTICS ASSET'}
              </div>
            </div>
          </div>

          {/* Forensic Evidence & Details */}
          <div style={{ background: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Forensic Evidence & Root Cause
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {item.description || item.reason || item.details || 'Suspicious access pattern flagged by runtime Zero-Trust decision engine.'}
            </p>

            {item.evidence && (
              <pre
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: '#040711',
                  border: '1px solid #1a2234',
                  borderRadius: '6px',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto',
                }}
              >
                {typeof item.evidence === 'string' ? item.evidence : JSON.stringify(item.evidence, null, 2)}
              </pre>
            )}
          </div>

          {/* Containment Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
              Operator Remediation Note
            </label>
            <input
              type="text"
              placeholder="e.g. Session invalidated, courier notified, GPS recalculation verified..."
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: '#070a13',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.8rem',
              }}
            />
          </div>
        </div>

        {/* Action Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #1e293b',
            background: '#0e1526',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={onClose}
            className="btn"
            style={{ fontSize: '0.78rem', background: '#1e293b', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px' }}
          >
            Close
          </button>
          <button
            onClick={() => handleAction('CONTAIN')}
            disabled={isSubmitting}
            className="btn"
            style={{
              fontSize: '0.78rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
            }}
          >
            {isSubmitting ? 'Applying...' : 'Quarantine / Contain'}
          </button>
          <button
            onClick={() => handleAction('RESOLVE')}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 700 }}
          >
            {isSubmitting ? 'Resolving...' : 'Mark Resolved'}
          </button>
        </div>
      </div>
    </div>
  );
}
