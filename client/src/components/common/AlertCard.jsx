import React from 'react';
import { ThreatBadge } from './ThreatBadge';

export function AlertCard({ alert, onInvestigate }) {
  const { severity, threatType, resource, timestamp, status, description, actor } = alert;

  const severityBorder = {
    CRITICAL: '#EF4444',
    HIGH: '#F59E0B',
    MEDIUM: '#F59E0B',
    LOW: '#3B82F6',
  }[severity] || '#64748B';

  return (
    <div
      onClick={() => onInvestigate && onInvestigate(alert)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.95rem 1.15rem',
        background: '#0A1A30',
        border: '1px solid #17395C',
        borderLeft: `4px solid ${severityBorder}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#102943')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#0A1A30')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ThreatBadge severity={severity} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E6F1FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {threatType}
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#9FB4CC' }}>
          Target: <strong style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{resource}</strong>
          {actor && <span> &bull; Actor: {actor}</span>}
          {description && <span> &bull; {description}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0, marginLeft: '1rem' }}>
        <span style={{ fontSize: '0.74rem', color: '#6F86A1', fontFamily: 'var(--font-mono)' }}>
          {timestamp}
        </span>
        <ThreatBadge status={status} />
        <span style={{ fontSize: '0.85rem', color: '#38BDF8', fontWeight: 700 }}>&rarr;</span>
      </div>
    </div>
  );
}

