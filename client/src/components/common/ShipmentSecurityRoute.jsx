import React, { useState } from 'react';
import { ThreatBadge } from './ThreatBadge';

export function ShipmentSecurityRoute({ shipmentId = 'ST-2026-002', onInspect }) {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(3); // Default to anomaly step

  const checkpoints = [
    {
      id: 0,
      stage: 'ORIGIN HUB',
      location: 'Hyderabad Central Logistics',
      time: '08:30 AM',
      operator: 'Dispatcher K. Verma',
      gate: 'Ingestion Scan & QR Verification',
      policy: 'POL-FSM-001 (Valid Initial State)',
      status: 'VERIFIED',
      telemetry: { speed: '0 km/h', coords: '17.3850° N, 78.4867° E', covariance: '0.02 (Nominal)', tamperSeal: 'Intact (SHA-256)' },
      summary: 'Package ingested at origin depot. Cryptographic parcel hash signed with ECDSA key.',
    },
    {
      id: 1,
      stage: 'DRIVER CUSTODY',
      location: 'Secunderabad Depot Gate 2',
      time: '09:15 AM',
      operator: 'Driver Rahul Sharma',
      gate: 'Custody Handshake & Route Lock',
      policy: 'POL-RBAC-004 (Driver Assignment Check)',
      status: 'VERIFIED',
      telemetry: { speed: '12 km/h', coords: '17.4399° N, 78.4983° E', covariance: '0.04 (Nominal)', tamperSeal: 'Locked to Fleet-HYD-102' },
      summary: 'Custody assigned to driver Rahul Sharma. Designated corridor NH-65 polygon bound to shipment.',
    },
    {
      id: 2,
      stage: 'TRANSIT DISPATCH',
      location: 'NH 65 Ingress Checkpoint',
      time: '10:00 AM',
      operator: 'Automated Telemetry Stream',
      gate: 'FSM Status Update (IN_TRANSIT)',
      policy: 'POL-FSM-002 (Sequential Transition)',
      status: 'VERIFIED',
      telemetry: { speed: '58 km/h', coords: '17.3100° N, 78.8200° E', covariance: '0.03 (Nominal)', tamperSeal: 'Heartbeat Verified' },
      summary: 'Continuous GPS telemetry stream active. Vehicle moving within designated highway corridor.',
    },
    {
      id: 3,
      stage: 'KINEMATICS ANOMALY',
      location: 'NH 65 Outskirts -> Vijayawada',
      time: '11:20 AM',
      operator: 'Reality Kinematics Engine',
      gate: 'Spherical Haversine Velocity Gate',
      policy: 'POL-VEL-005 (Max Kinematic Velocity)',
      status: 'ANOMALY',
      telemetry: { speed: '4,125 km/h (Anomaly)', coords: '16.5062° N, 80.6480° E', covariance: '0.89 (Degraded / Mock)', tamperSeal: 'Telemetry Alert' },
      summary: 'Impossible physical displacement: 275 km traveled in 4.0 minutes (calculated velocity > 140 km/h limit). Location covariance indicates mock coordinates.',
    },
    {
      id: 4,
      stage: 'DESTINATION HOLD',
      location: 'Vijayawada Regional Depot',
      time: '11:24 AM',
      operator: 'Zero-Trust Policy Gatekeeper',
      gate: 'Proof of Delivery Authorization',
      policy: 'POL-GATE-009 (Tamper Quarantine)',
      status: 'BLOCKED',
      telemetry: { speed: '0 km/h', coords: '16.5062° N, 80.6480° E', covariance: 'Locked by Supervisor', tamperSeal: 'Quarantine Flagged' },
      summary: 'Delivery status transition rejected (HTTP 422). Incident INC-2026-002 dispatched for supervisor investigation. Driver session restricted.',
    },
  ];

  const current = checkpoints[selectedCheckpoint] || checkpoints[3];

  return (
    <div
      style={{
        background: '#0D2038',
        border: '1px solid #17395C',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Route Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #17395C', paddingBottom: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#E6F1FF', letterSpacing: '0.02em' }}>
              SHIPMENT SECURITY ROUTE (OPERATIONAL CAUSALITY TIMELINE)
            </h3>
          </div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#9FB4CC' }}>
            Step-by-step physical and cryptographic custody progression for consignment <strong style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{shipmentId}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#6F86A1' }}>Linear Route Audit:</span>
          <ThreatBadge status="ANOMALY_BLOCKED" />
        </div>
      </div>

      {/* Horizontal Causality Route Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', position: 'relative' }}>
        {checkpoints.map((cp, idx) => {
          const isSelected = selectedCheckpoint === cp.id;
          const isBlocked = cp.status === 'BLOCKED';
          const isAnomaly = cp.status === 'ANOMALY';
          const isVerified = cp.status === 'VERIFIED';

          const accentColor = isBlocked ? '#EF4444' : isAnomaly ? '#F59E0B' : '#10B981';
          const bgCard = isSelected ? '#102943' : '#0A1A30';

          return (
            <div
              key={cp.id}
              onClick={() => setSelectedCheckpoint(cp.id)}
              style={{
                background: bgCard,
                border: isSelected ? `2px solid ${accentColor}` : '1px solid #17395C',
                borderRadius: '8px',
                padding: '0.85rem 0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#6F86A1', fontWeight: 700 }}>
                    STEP 0{idx + 1}
                  </span>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: accentColor,
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#E6F1FF', marginBottom: '0.2rem' }}>
                  {cp.stage}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9FB4CC', lineHeight: 1.3 }}>
                  {cp.location}
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.45rem', borderTop: '1px solid #17395C', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#9FB4CC' }}>
                  {cp.time}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: accentColor }}>
                  {cp.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Checkpoint Telemetry & Defense Gate Detail Drawer */}
      <div
        style={{
          background: '#0A1A30',
          border: '1px solid #17395C',
          borderRadius: '8px',
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '1.25rem',
        }}
      >
        {/* Left: Summary and Defense Evaluation */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CHECKPOINT {selectedCheckpoint + 1} DEFENSE EVALUATION
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6F86A1' }}>&bull; {current.gate}</span>
          </div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#E6F1FF' }}>
            {current.stage} &mdash; {current.location}
          </h4>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#9FB4CC', lineHeight: 1.5 }}>
            {current.summary}
          </p>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#6F86A1' }}>
              Enforced Policy: <strong style={{ color: '#E6F1FF' }}>{current.policy}</strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6F86A1' }}>
              Actor: <strong style={{ color: '#E6F1FF' }}>{current.operator}</strong>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Kinematics Box */}
        <div style={{ background: '#071426', border: '1px solid #17395C', borderRadius: '6px', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9FB4CC', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Telemetry Sensor Readings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6F86A1' }}>Recorded Speed:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: current.telemetry.speed.includes('Anomaly') ? '#EF4444' : '#E6F1FF' }}>
                {current.telemetry.speed}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6F86A1' }}>GPS Coordinates:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#9FB4CC' }}>
                {current.telemetry.coords}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6F86A1' }}>Covariance / Jitter:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: current.telemetry.covariance.includes('Degraded') ? '#F59E0B' : '#10B981' }}>
                {current.telemetry.covariance}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6F86A1' }}>Tamper Integrity:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: current.telemetry.tamperSeal.includes('Alert') || current.telemetry.tamperSeal.includes('Quarantine') ? '#EF4444' : '#10B981' }}>
                {current.telemetry.tamperSeal}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

