import React, { useState } from 'react';
import { ThreatBadge } from '../components/common/ThreatBadge';

export function SecuritySafetyCenter() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedDomainAnalysis, setSelectedDomainAnalysis] = useState(null);
  const [expandedDomainId, setExpandedDomainId] = useState('LOCATION'); // Default expanded to the flagged warning domain

  const securityDomains = [
    {
      id: 'IDENTITY',
      title: 'A. Identity & Access Security',
      subtitle: 'Authentication gates, token cryptography, and credential hygiene',
      score: '94 / 100',
      status: 'SECURE',
      icon: '👤',
      summary: '6 defensive controls verified. Multi-factor session hashing and rate limiting active. 0 active credential stuffing attacks.',
      items: [
        { name: 'HMAC-SHA256 JWT Signature Validation', status: 'SECURE', note: 'Tamper-evident claims with strict 24h expiration' },
        { name: 'Role-Based Access Control (RBAC)', status: 'SECURE', note: 'Customer, Driver, and Admin operational boundaries active' },
        { name: 'Privilege Escalation Gatekeeper', status: 'SECURE', note: 'Blocked parameter injection on registration payloads' },
        { name: 'Adaptive Session Trust Integrity', status: 'WARNING', note: '1 session under observation for telemetry velocity jump' },
        { name: 'Brute-Force & Lockout Defenses', status: 'SECURE', note: 'Progressive backoff active after 5 failed password attempts' },
        { name: 'Bcrypt Password Hashing (Salt Rounds = 12)', status: 'SECURE', note: 'Zero plaintext passwords stored in database' },
      ],
    },
    {
      id: 'API',
      title: 'B. API & Network Gateway Security',
      subtitle: 'Ingress traffic inspection, BOLA protection, and schema validation',
      score: '96 / 100',
      status: 'SECURE',
      icon: '🌐',
      metrics: {
        inspected: '14,820',
        blocked: '42',
        suspicious: '7',
        rateLimits: '12',
      },
      summary: 'Strict BOLA/IDOR object authorization enforced on all endpoints. CORS origin restricted. Ingress payload bounds capped at 100kb.',
      items: [
        { name: 'BOLA / IDOR Defense Middleware', status: 'SECURE', note: 'Server-side object ownership authorization enforced' },
        { name: 'Defensive Ingress Rate Limiting', status: 'SECURE', note: '200 req / 15 min per IP baseline limit active' },
        { name: 'Schema Allowlisting & Mass Assignment Guard', status: 'SECURE', note: 'Strict JSON payload boundary checks on mutations' },
        { name: 'Strict CORS & Security Headers (Helmet)', status: 'SECURE', note: 'HSTS, X-Content-Type-Options & Frameguard active' },
        { name: 'Defensive Payload Size Constraints (100kb)', status: 'SECURE', note: 'Prevents memory exhaustion & denial-of-service' },
      ],
    },
    {
      id: 'DATA',
      title: 'C. Data Protection & Cryptographic Integrity',
      subtitle: 'Multi-tenant isolation, cryptographic seals, and PII masking',
      score: '92 / 100',
      status: 'SECURE',
      icon: '🔒',
      summary: 'Cross-tenant access physically blocked at MongoDB query layer. Recipient phone numbers and street addresses masked in public responses.',
      items: [
        { name: 'Customer Data Isolation / Multi-Tenant Separation', status: 'SECURE', note: 'Cross-tenant read/write physically blocked' },
        { name: 'Public Tracking PII Masking', status: 'SECURE', note: 'Recipient phone numbers and full street names obfuscated' },
        { name: 'Document Hash Verification & Digital Signatures', status: 'SECURE', note: 'SHA-256 state transition digest verified' },
        { name: 'Immutable Audit Trail (Flight Recorder)', status: 'SECURE', note: 'Append-only ledger of all decisions and anomalies' },
        { name: 'MongoDB Connection String & Secret Shielding', status: 'SECURE', note: 'Zero credentials exposed in client application bundle' },
      ],
    },
    {
      id: 'LOGISTICS',
      title: 'D. Logistics & Workflow State Guard',
      subtitle: 'Finite State Machine transition locks and custody validation',
      score: '88 / 100',
      status: 'SECURE',
      icon: '📦',
      summary: 'Out-of-order shipment status jumps rejected with HTTP 422. Terminal DELIVERED state permanently locked against rollback.',
      items: [
        { name: 'Deterministic Finite State Machine (FSM)', status: 'SECURE', note: 'Illegal state jumps (e.g. CREATED -> DELIVERED) blocked' },
        { name: 'Terminal State Immutable Lockdown', status: 'SECURE', note: 'Delivered parcels cannot be re-opened or rolled back' },
        { name: 'Driver-to-Shipment Custody Verification', status: 'SECURE', note: 'Couriers can only update assigned parcels' },
        { name: 'Dispatcher Segregation Protocol', status: 'SECURE', note: 'Fleet assignments restricted to authenticated dispatchers' },
        { name: 'Proof-of-Delivery Cryptographic Checkpoint', status: 'WARNING', note: '1 delivery pending secondary OTP handshake' },
      ],
    },
    {
      id: 'LOCATION',
      title: 'E. Spatial Reality & Kinematics Security',
      subtitle: 'Haversine velocity verification, corridor geofencing, and sensor covariance',
      score: '71 / 100',
      status: 'WARNING',
      icon: '📍',
      summary: 'Flagged 1 active velocity anomaly: 275 km traveled in 4.0 minutes (calculated speed > 140 km/h). Location covariance indicates mock coordinates.',
      items: [
        { name: 'Haversine Spherical Distance Velocity Solver', status: 'WARNING', note: 'Flagged 275 km / 4 min teleportation anomaly on ST-2026-002' },
        { name: '5-Factor Location Trust Model', status: 'WARNING', note: 'Fleet telemetry trust score averaged at 71/100' },
        { name: 'Corridor Geofencing & Depot Proximity', status: 'SECURE', note: 'NH 44 and NH 65 route polygons active' },
        { name: 'GPS Sensor Covariance & Tamper Detection', status: 'SECURE', note: 'Detects mock locations and static GPS spoofers' },
      ],
    },
    {
      id: 'BEHAVIOR',
      title: 'F. Behavioral Heuristics & Canary Traps',
      subtitle: 'Decoy honeypots, sequential ID scraping detection, and trust scoring',
      score: '84 / 100',
      status: 'WARNING',
      icon: '🍯',
      summary: '1 decoy canary asset triggered by external scanner. Threat actor IP quarantined in ingress rate limiter.',
      items: [
        { name: 'Planted Honeypot Decoys (SHP-HNY-001, SHP-HNY-002)', status: 'WARNING', note: '1 canary tripwire triggered by external scan' },
        { name: 'Sequential Tracking ID Enumeration Detector', status: 'SECURE', note: 'Detects burst scraping of parcel numbers' },
        { name: 'Dynamic Adaptive Trust Scoring (0-100)', status: 'SECURE', note: 'Trust decays on infractions and recovers on clean runs' },
        { name: 'Rogue Courier Anomaly Identification', status: 'SECURE', note: 'Unusual out-of-order check-ins penalized' },
      ],
    },
    {
      id: 'INFRASTRUCTURE',
      title: 'G. Infrastructure & Defense Health',
      subtitle: 'Microservice connectivity, database replication, and runtime uptime',
      score: '100 / 100',
      status: 'SECURE',
      icon: '💻',
      summary: 'All 5 core backend defense microservices operating with nominal latency (<15ms). MongoDB connected with verified replica state.',
      items: [
        { name: 'Security Decision Engine Core', status: 'SECURE', note: 'Operational (Pipeline latency 14ms)' },
        { name: 'Spatial Reality Kinematics Service', status: 'SECURE', note: 'Operational (Haversine solver active)' },
        { name: 'MongoDB Database Persistence', status: 'SECURE', note: 'Connected @ 127.0.0.1:27017' },
        { name: 'Express API Server (Port 5000)', status: 'SECURE', note: 'Operational with active security middleware' },
        { name: 'Vite Frontend SPA (Port 5173)', status: 'SECURE', note: 'Serving compiled SOC interface' },
      ],
    },
  ];

  const displayedDomains = activeTab === 'ALL'
    ? securityDomains
    : securityDomains.filter((d) => d.id === activeTab);

  return (
    <div
      className="overview-container"
      style={{
        padding: '2rem 2.5rem',
        maxWidth: '1680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #17395C',
          paddingBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: '#E6F1FF', letterSpacing: '-0.02em' }}>
              Defensive Safety & Architecture Center
            </h1>
          </div>
          <p style={{ margin: 0, color: '#9FB4CC', fontSize: '0.9rem' }}>
            Full-spectrum defense posture verifying the complete logistics lifecycle across Identity, API, Data, Logistics, Location, Behavior, and Infrastructure.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#9FB4CC' }}>Overall Posture:</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10B981' }}>
            81 / 100
          </span>
        </div>
      </div>

      {/* Domain Navigation Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('ALL')}
          style={{
            fontSize: '0.82rem',
            padding: '0.45rem 1rem',
            borderRadius: '6px',
            border: activeTab === 'ALL' ? '1px solid #38BDF8' : '1px solid #17395C',
            background: activeTab === 'ALL' ? 'rgba(56, 189, 248, 0.15)' : '#0D2038',
            color: activeTab === 'ALL' ? '#38BDF8' : '#9FB4CC',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          All 7 Protection Layers
        </button>
        {securityDomains.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveTab(d.id)}
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: activeTab === d.id ? '1px solid #38BDF8' : '1px solid #17395C',
              background: activeTab === d.id ? 'rgba(56, 189, 248, 0.15)' : '#0D2038',
              color: activeTab === d.id ? '#38BDF8' : '#9FB4CC',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {d.icon} {d.title.split('.')[1].trim().split('&')[0]}
          </button>
        ))}
      </div>

      {/* Vertical List of Domains with Progressive Disclosure */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {displayedDomains.map((dom) => {
          const isExpanded = expandedDomainId === dom.id;

          return (
            <div
              key={dom.id}
              style={{
                background: '#0D2038',
                border: `1px solid ${dom.status === 'WARNING' ? 'rgba(245, 158, 11, 0.4)' : '#17395C'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Domain Summary Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{dom.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#E6F1FF' }}>
                        {dom.title}
                      </h3>
                      <ThreatBadge status={dom.status} />
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#9FB4CC' }}>
                      {dom.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Posture Score</div>
                    <div
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: dom.score.includes('71') ? '#F59E0B' : '#10B981',
                      }}
                    >
                      {dom.score}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedDomainId(isExpanded ? null : dom.id)}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '6px',
                      background: isExpanded ? '#102943' : '#0A1A30',
                      border: '1px solid #17395C',
                      color: '#E6F1FF',
                      fontWeight: 600,
                    }}
                  >
                    {isExpanded ? '▲ Hide Rules' : '▼ View Analysis'}
                  </button>
                </div>
              </div>

              {/* High-Level Posture Summary Description */}
              <div
                style={{
                  background: '#0A1A30',
                  border: '1px solid #17395C',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  fontSize: '0.85rem',
                  color: '#9FB4CC',
                  lineHeight: 1.5,
                }}
              >
                {dom.summary}
              </div>

              {/* API Metrics Bar (if applicable) */}
              {dom.metrics && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    background: '#071426',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #17395C',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Inspected Calls</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38BDF8' }}>{dom.metrics.inspected}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Blocked Ingress</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#EF4444' }}>{dom.metrics.blocked}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Suspicious Probes</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>{dom.metrics.suspicious}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Rate Limiting Events</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#60A5FA' }}>{dom.metrics.rateLimits}</div>
                  </div>
                </div>
              )}

              {/* Progressive Disclosure Checklist (Revealed when Expanded) */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #17395C',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Enforced Security Controls ({dom.items.length})
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '0.65rem' }}>
                    {dom.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.85rem 1rem',
                          background: '#071426',
                          border: '1px solid #17395C',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#E6F1FF' }}>{item.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#6F86A1', marginTop: '0.15rem' }}>{item.note}</div>
                        </div>
                        <ThreatBadge status={item.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

