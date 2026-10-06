import React from 'react';
import { ThreatBadge } from './ThreatBadge';

export function ThreatTimeline({ events = [] }) {
  // Fallback realistic timeline events if none provided
  const displayEvents = events.length > 0 ? events : [
    {
      time: '11:24',
      title: 'BOLA / IDOR Cross-Customer Query',
      severity: 'CRITICAL',
      affected: 'SHP-2026-002',
      actor: 'Customer Priya (Unauthorized)',
      reason: 'Attempted to enumerate and read shipment owned by another tenant.',
      action: 'BLOCKED & LOGGED',
      actionColor: '#EF4444',
    },
    {
      time: '10:47',
      title: 'Legitimate Hub Ingestion Scan',
      severity: 'LOW',
      affected: 'ST-2026-001',
      actor: 'Driver Ravi Kumar',
      reason: 'Physical barcode verification at Hyderabad Central Logistics Hub.',
      action: 'ALLOWED (FSM VALID)',
      actionColor: '#10B981',
    },
    {
      time: '09:36',
      title: 'Impossible Movement Velocity Spike',
      severity: 'HIGH',
      affected: 'FLEET-TEL-02',
      actor: 'Driver Rahul Sharma',
      reason: 'Teleportation jump of 275 km detected within 4 minutes (Speed > 140 km/h).',
      action: 'STEP-UP & TRUST DECAY',
      actionColor: '#F59E0B',
    },
    {
      time: '08:12',
      title: 'Driver Authentication & Session Grant',
      severity: 'LOW',
      affected: 'DRIVER-PORTAL',
      actor: 'Driver Ravi Kumar',
      reason: 'Valid credential challenge and HMAC JWT generation.',
      action: 'SESSION AUTHORIZED',
      actionColor: '#10B981',
    },
    {
      time: '06:53',
      title: 'Privilege Escalation on Registration',
      severity: 'MEDIUM',
      affected: 'AUTH-REGISTER',
      actor: 'Anonymous Ingress (198.51.100.42)',
      reason: 'Injected admin role parameter in public customer signup payload.',
      action: 'BLOCKED (HTTP 403)',
      actionColor: '#EF4444',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem' }}>
      {/* Vertical timeline guide */}
      <div
        style={{
          position: 'absolute',
          left: '6px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          background: 'linear-gradient(to bottom, #3B82F6, #17395C)',
        }}
      />

      {displayEvents.map((ev, idx) => (
        <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {/* Node dot */}
          <div
            style={{
              position: 'absolute',
              left: '-1.85rem',
              top: '5px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background:
                ev.severity === 'CRITICAL'
                  ? '#EF4444'
                  : ev.severity === 'HIGH'
                  ? '#F59E0B'
                  : ev.severity === 'MEDIUM'
                  ? '#F59E0B'
                  : '#10B981',
              border: '2px solid #0D2038',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#9FB4CC', fontWeight: 700 }}>
                {ev.time}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E6F1FF' }}>
                {ev.title}
              </span>
            </div>
            <ThreatBadge severity={ev.severity} />
          </div>

          <div style={{ fontSize: '0.78rem', color: '#9FB4CC', lineHeight: 1.4 }}>
            <span>Target: <strong style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{ev.affected}</strong></span>
            {ev.actor && <span> &bull; Actor: {ev.actor}</span>}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#6F86A1', lineHeight: 1.35 }}>
            {ev.reason}
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: ev.actionColor || '#38BDF8', fontFamily: 'var(--font-mono)' }}>
            System Action: {ev.action}
          </div>
        </div>
      ))}
    </div>
  );
}

