import React from 'react';

export function SecurityBanner() {
  return (
    <div className="security-banner">
      <div className="security-badge-active">
        <span className="pulse-dot"></span>
        <span>DEFENSIVE LOGISTICS ENGINE ENFORCED SERVER-SIDE</span>
      </div>
      <div style={{ color: 'var(--text-muted)', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
        <span>✓ Object-Level RBAC</span>
        <span>✓ Finite State Machine</span>
        <span>✓ Immutable Audit Trail</span>
      </div>
    </div>
  );
}
