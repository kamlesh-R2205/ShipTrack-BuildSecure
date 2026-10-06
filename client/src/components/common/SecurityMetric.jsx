import React from 'react';

export function SecurityMetric({ title, value, subtext, trend, icon, status = 'default' }) {
  const statusColors = {
    default: { text: '#38BDF8', border: '#17395C', bg: '#0D2038', accent: '#3B82F6' },
    secure: { text: '#10B981', border: 'rgba(16, 185, 129, 0.35)', bg: '#0D2038', accent: '#10B981' },
    warning: { text: '#F59E0B', border: 'rgba(245, 158, 11, 0.35)', bg: '#0D2038', accent: '#F59E0B' },
    danger: { text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)', bg: '#0D2038', accent: '#EF4444' },
  };

  const style = statusColors[status] || statusColors.default;

  return (
    <div
      className="metric-card"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        minHeight: '160px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#9FB4CC',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      </div>

      <div style={{ margin: '0.75rem 0 0.35rem' }}>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: style.text,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #17395C',
        }}
      >
        <span style={{ fontSize: '0.78rem', color: '#6F86A1' }}>{subtext}</span>
        {trend && (
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: trend.startsWith('+') ? '#10B981' : '#F59E0B',
              background: 'rgba(23, 57, 92, 0.6)',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

