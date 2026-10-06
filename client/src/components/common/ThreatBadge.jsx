import React from 'react';

export function ThreatBadge({ severity, status, decision }) {
  const badgeVal = (severity || status || decision || 'UNKNOWN').toUpperCase();

  const badgeMap = {
    CRITICAL: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)', color: '#f87171' },
    HIGH: { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.35)', color: '#fb923c' },
    MEDIUM: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24' },
    LOW: { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.35)', color: '#60a5fa' },
    BLOCK: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' },
    BLOCKED: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' },
    ALLOW: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#34d399' },
    ALLOWED: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#34d399' },
    MONITOR: { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.35)', color: '#22d3ee' },
    STEP_UP: { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)', color: '#a78bfa' },
    OPEN: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)', color: '#f87171' },
    INVESTIGATING: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24' },
    CONTAINED: { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.35)', color: '#60a5fa' },
    RESOLVED: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#34d399' },
    CLEAN: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#34d399' },
    WARNING: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24' },
    FAILED: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' },
  };

  const style = badgeMap[badgeVal] || { bg: '#1e293b', border: '#334155', color: '#94a3b8' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '4px',
        fontSize: '0.67rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
      }}
    >
      {badgeVal}
    </span>
  );
}
