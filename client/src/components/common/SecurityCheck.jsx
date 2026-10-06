import React from 'react';
import { ThreatBadge } from './ThreatBadge';

export function SecurityCheck({ name, time, status, result, details }) {
  const resultColor =
    result === 'CLEAN' ? '#10B981' : result === 'WARNING' ? '#F59E0B' : '#EF4444';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1rem',
        background: '#0A1A30',
        border: '1px solid #17395C',
        borderRadius: '8px',
        fontSize: '0.82rem',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#102943')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#0A1A30')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: resultColor,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontWeight: 600, color: '#E6F1FF' }}>{name}</div>
          <div style={{ fontSize: '0.74rem', color: '#6F86A1' }}>
            {details || 'Automated defensive check'} &bull; {time}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ThreatBadge status={result || status} />
      </div>
    </div>
  );
}

