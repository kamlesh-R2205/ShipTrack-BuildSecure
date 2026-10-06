import React from 'react';
import { ThreatBadge } from './ThreatBadge';

export function DecisionPipeline({ evaluation }) {
  // Default evaluation if not passed
  const evalData = evaluation || {
    request: 'PATCH /api/shipments/ST-2026-002/status',
    decision: 'BLOCK',
    riskScore: 85,
    latency: '14ms',
    pipeline: [
      { name: 'AUTH', pass: true, latency: '2ms', desc: 'Valid JWT session' },
      { name: 'IDENTITY TRUST', pass: true, latency: '1ms', desc: 'Trust score 88/100' },
      { name: 'RESOURCE AUTH', pass: false, latency: '3ms', desc: 'Driver not assigned to parcel' },
      { name: 'LOCATION TRUST', pass: false, latency: '4ms', desc: 'Velocity jump 180 km/h' },
      { name: 'BEHAVIOR', pass: true, latency: '1ms', desc: 'Normal burst rate' },
      { name: 'POLICY CHECK', pass: false, latency: '2ms', desc: 'Violates POL-RBAC-007, POL-VEL-005' },
    ],
    reasons: [
      'Resource belongs to another driver / unassigned queue (Cross-custody violation)',
      'Impossible velocity jump detected (180 km/h > 140 km/h threshold limit)',
      'Security policy POL-RBAC-007 triggered (+30 risk points)',
      'Security policy POL-VEL-005 triggered (+25 risk points)',
    ],
  };

  return (
    <div
      style={{
        background: '#0D2038',
        border: '1px solid #17395C',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          borderBottom: '1px solid #17395C',
          paddingBottom: '0.85rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.74rem',
              color: '#38BDF8',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            TRANSPARENT DEFENSE GATE
          </span>
          <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#E6F1FF' }}>
            Zero-Trust Decision Pipeline
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#9FB4CC', fontFamily: 'var(--font-mono)' }}>
            Pipeline Latency: <strong style={{ color: '#38BDF8' }}>{evalData.latency}</strong>
          </span>
          <ThreatBadge decision={evalData.decision} />
        </div>
      </div>

      {/* Visual Pipeline Steps */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${evalData.pipeline.length}, 1fr)`,
          gap: '0.65rem',
          marginBottom: '1.25rem',
        }}
      >
        {evalData.pipeline.map((stage, i) => (
          <div
            key={i}
            style={{
              padding: '0.85rem 0.65rem',
              background: stage.pass ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${stage.pass ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
              borderRadius: '8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '84px',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: stage.pass ? '#10B981' : '#EF4444' }}>
              {stage.name}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0' }}>
              {stage.pass ? '✓' : '✕'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9FB4CC', fontFamily: 'var(--font-mono)' }}>
              {stage.latency}
            </div>
          </div>
        ))}
      </div>

      {/* Causality Explanation */}
      <div
        style={{
          background: '#071426',
          border: '1px solid #17395C',
          borderRadius: '8px',
          padding: '1.1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E6F1FF' }}>
            Why was this operation {evalData.decision === 'BLOCK' ? 'BLOCKED' : evalData.decision}?
          </span>
          <span style={{ fontSize: '0.78rem', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            Calculated Risk Score: {evalData.riskScore} / 100
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {evalData.reasons.map((r, idx) => (
            <div key={idx} style={{ fontSize: '0.78rem', color: '#9FB4CC', display: 'flex', alignItems: 'center', gap: '0.5rem', lineHeight: 1.4 }}>
              <span style={{ color: '#EF4444', fontSize: '0.9rem' }}>&bull;</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

