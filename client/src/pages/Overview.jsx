import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SecurityMetric } from '../components/common/SecurityMetric';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { SecurityCheck } from '../components/common/SecurityCheck';
import { AlertCard } from '../components/common/AlertCard';
import { ThreatTimeline } from '../components/common/ThreatTimeline';
import { DecisionPipeline } from '../components/common/DecisionPipeline';
import { InvestigationModal } from '../components/common/InvestigationModal';
import { LiveThreatMap } from '../components/map/LiveThreatMap';
import { ShipmentSecurityRoute } from '../components/common/ShipmentSecurityRoute';

export function Overview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [investigatingItem, setInvestigatingItem] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [ovRes, incRes] = await Promise.allSettled([
        api.getGuardOverview(),
        api.getIncidents(),
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value?.success) {
        setData(ovRes.value.data);
      }
      if (incRes.status === 'fulfilled' && incRes.value?.success) {
        setIncidents(incRes.value.data);
      }
    } catch (err) {
      console.error('Overview telemetry fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleContainIncident = async (item, note) => {
    try {
      if (item.incidentId) {
        await api.executeIncidentAction(item.incidentId, {
          actionType: 'RESTRICT_ACTOR',
          note: note || 'Quarantine action executed from SOC console',
        });
      }
      fetchOverview();
    } catch (e) {
      console.error('Contain error:', e);
    }
  };

  const handleResolveIncident = async (item, note) => {
    try {
      if (item.incidentId) {
        await api.updateIncidentStatus(item.incidentId, {
          status: 'RESOLVED',
          actionNote: note || 'Resolved by security administrator',
        });
      }
      fetchOverview();
    } catch (e) {
      console.error('Resolve error:', e);
    }
  };

  // Recent Security Checks data
  const recentSecurityChecks = [
    { name: 'Malware / Endpoint Inspection', time: '2m ago', result: 'CLEAN', details: 'Zero malicious payload signatures detected' },
    { name: 'Network Ingress & WAF Baseline', time: '5m ago', result: 'CLEAN', details: 'Ingress traffic matches behavioral baseline' },
    { name: 'API Security & BOLA Gateway', time: '8m ago', result: 'CLEAN', details: 'Multi-tenant ownership boundaries verified' },
    { name: 'Database Persistence Integrity', time: '12m ago', result: 'CLEAN', details: 'Replica set & collection schemas verified' },
    { name: 'Authentication & Session Token Security', time: '15m ago', result: 'CLEAN', details: 'HMAC claims and zero credential sprays' },
    { name: 'Spatial Kinematics & Velocity Check', time: '18m ago', result: 'WARNING', details: '1 anomalous velocity spike detected on NH 65' },
    { name: 'Certificate Validation (TLS/SSL)', time: '24m ago', result: 'CLEAN', details: 'Upstream certificates valid and verified' },
    { name: 'Software Supply Chain & CVE Audit', time: '1h ago', result: 'CLEAN', details: '0 high/critical vulnerabilities identified' },
  ];

  // Dedicated Security Alerts list
  const securityAlerts = [
    {
      severity: 'CRITICAL',
      threatType: 'Canary Asset Access (Honeypot Trigger)',
      resource: 'SHP-HNY-001',
      actor: '198.51.100.42 (Decoy Probe)',
      timestamp: '09:12 AM',
      status: 'OPEN',
      description: 'Unauthorized query targeted unadvertised decoy shipment. Actor session quarantined immediately.',
    },
    {
      severity: 'HIGH',
      threatType: 'Impossible Velocity Jump (Teleportation)',
      resource: 'ST-2026-002',
      actor: 'Driver Rahul Sharma',
      timestamp: '11:24 AM',
      status: 'INVESTIGATING',
      description: 'Calculated velocity 4,125 km/h across 275 km within 4 minutes. Delivery transition blocked by Reality Engine.',
    },
    {
      severity: 'HIGH',
      threatType: 'GPS Spoofing & Covariance Drop',
      resource: 'FLEET-HYD-102',
      actor: 'Telemetry Stream',
      timestamp: '10:40 AM',
      status: 'OPEN',
      description: 'GPS covariance degraded. Static mock coordinates detected outside designated route corridor.',
    },
    {
      severity: 'MEDIUM',
      threatType: 'Privilege Escalation Attempt',
      resource: 'POST /api/auth/register',
      actor: 'Untrusted Ingress',
      timestamp: '06:53 AM',
      status: 'BLOCKED',
      description: 'Registration payload attempted to inject role=ADMIN. Parameter stripped and rejected with HTTP 403.',
    },
    {
      severity: 'MEDIUM',
      threatType: 'BOLA / IDOR Cross-Tenant Read',
      resource: 'GET /api/shipments/ST-2026-001',
      actor: 'Customer Priya',
      timestamp: '11:15 AM',
      status: 'BLOCKED',
      description: 'Customer attempted to inspect parcel owned by Customer Amit. Access denied by ABAC middleware.',
    },
  ];

  // Threat Distribution counts
  const threatCategories = [
    { name: 'BOLA / IDOR Protection', count: 18, color: '#EF4444', pct: '85%' },
    { name: 'Impossible Velocity / Kinematics', count: 9, color: '#F59E0B', pct: '60%' },
    { name: 'GPS Spoofing & Covariance Drop', count: 6, color: '#F59E0B', pct: '45%' },
    { name: 'Privilege Escalation on Signup', count: 4, color: '#3B82F6', pct: '30%' },
    { name: 'Decoy Honeypot Interactions', count: 3, color: '#38BDF8', pct: '25%' },
    { name: 'Workflow FSM State Tampering', count: 2, color: '#60A5FA', pct: '20%' },
  ];

  // Subsystem Posture Scores
  const postureBreakdown = [
    { name: 'Identity & Access Control', score: '94 / 100', status: 'Healthy', reason: 'Zero credential stuffing; JWT tamper-free' },
    { name: 'API Gateway & Network Defense', score: '96 / 100', status: 'Healthy', reason: 'Ingress rate limits & CORS operational' },
    { name: 'Data Protection & Isolation', score: '92 / 100', status: 'Healthy', reason: 'Strict BOLA multi-tenant separation' },
    { name: 'Logistics State Guard (FSM)', score: '90 / 100', status: 'Healthy', reason: 'Finite state machine transitions enforced' },
    { name: 'Threat Detection & Heuristics', score: '85 / 100', status: 'Warning', reason: 'Canary honeypot triggered by probe' },
    { name: 'Spatial Reality & Kinematics', score: '71 / 100', status: 'Warning', reason: '1 vehicle flagged with impossible velocity' },
    { name: 'Infrastructure & Defense Health', score: '100 / 100', status: 'Healthy', reason: 'All defensive engines running nominally' },
  ];

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
      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '1px solid #17395C',
          paddingBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🛡️</span>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                margin: 0,
                color: '#E6F1FF',
                letterSpacing: '-0.02em',
              }}
            >
              Logistics Security Operations Center
            </h1>
          </div>
          <p style={{ margin: 0, color: '#9FB4CC', fontSize: '0.9rem' }}>
            Real-time security telemetry &bull; Zero-Trust policy gatekeeper &bull; Continuous runtime defense active
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => onNavigate && onNavigate('attack-simulator')}
            className="btn btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              background: '#0D2038',
              border: '1px solid #17395C',
              color: '#E6F1FF',
            }}
          >
            ⚡ Attack Simulator
          </button>
          <button
            onClick={() => onNavigate && onNavigate('security-safety-center')}
            className="btn btn-primary"
            style={{
              fontSize: '0.82rem',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              fontWeight: 700,
            }}
          >
            🛡️ Safety Center
          </button>
        </div>
      </div>

      {/* 2. Top 4 Core Key Metrics (The 4 Hero Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <SecurityMetric
          title="Security Posture"
          value="81 / 100"
          subtext="Derived from 7 defensive layers"
          trend="Nominal Overall"
          icon="🛡️"
          status="secure"
        />
        <SecurityMetric
          title="Active Threats"
          value="3"
          subtext="Detected & blocked by Control Plane"
          trend="2 Contained"
          icon="🚨"
          status="danger"
        />
        <SecurityMetric
          title="Blocked Operations"
          value="42"
          subtext="Enforced across all defensive gates today"
          trend="+8 Last hour"
          icon="🛑"
          status="default"
        />
        <SecurityMetric
          title="Active Incidents"
          value="2"
          subtext="Requiring supervisor investigation"
          trend="1 Honeypot probe"
          icon="⚠️"
          status="warning"
        />
      </div>

      {/* 3. Main Dashboard Grid (Left Column: Centers of Action / Right Column: Intelligence) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '2rem' }}>
        {/* ======================================================== */}
        {/* LEFT COLUMN: Single Geographic Map + Route + Pipeline    */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section A: The Single Real Geographic Map */}
          <LiveThreatMap
            onInspectShipment={(shpId) => {
              if (onNavigate) onNavigate('shipment-dna', shpId);
            }}
          />

          {/* Section B: Linear Shipment Security Route (NO Map Redundancy) */}
          <ShipmentSecurityRoute
            shipmentId="ST-2026-002"
            onInspect={(shpId) => {
              if (onNavigate) onNavigate('shipment-dna', shpId);
            }}
          />

          {/* Section C: Zero-Trust Decision Engine Transparency Pipeline */}
          <DecisionPipeline />

          {/* Section D: Active Security Incidents Table */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                padding: '1.1rem 1.5rem',
                borderBottom: '1px solid #17395C',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#0A1A30',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🚨</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#E6F1FF' }}>
                    ACTIVE SECURITY INCIDENTS
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#9FB4CC' }}>
                    Correlated multi-step threat campaigns requiring operator action
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('incidents')}
                className="btn"
                style={{
                  fontSize: '0.78rem',
                  color: '#38BDF8',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                View All Cases &rarr;
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="soc-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Shipment</th>
                    <th>Actor</th>
                    <th>Threat Classification</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.length > 0 ? (
                    incidents.slice(0, 4).map((inc) => (
                      <tr key={inc.incidentId}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38BDF8' }}>
                          {inc.incidentId}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#E6F1FF' }}>
                          {inc.targetShipment || 'FLEET-HYD'}
                        </td>
                        <td style={{ color: '#9FB4CC' }}>
                          {inc.actor?.email || 'External IP'}
                        </td>
                        <td style={{ fontWeight: 600, color: '#E6F1FF' }}>
                          {inc.title}
                        </td>
                        <td>
                          <ThreatBadge severity={inc.severity} />
                        </td>
                        <td>
                          <ThreatBadge status={inc.status} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.45rem' }}>
                            <button
                              onClick={() => setInvestigatingItem(inc)}
                              className="btn btn-sm btn-secondary"
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.3rem 0.65rem',
                                background: '#102943',
                                border: '1px solid #17395C',
                                color: '#E6F1FF',
                              }}
                            >
                              Investigate
                            </button>
                            <button
                              onClick={() => handleContainIncident(inc, 'Quick containment')}
                              className="btn btn-sm"
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.3rem 0.65rem',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                              }}
                            >
                              Contain
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: '#6F86A1', padding: '2rem' }}>
                        Zero critical incidents open. Run the Attack Simulator to test automated threat capture.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Intelligence, Posture & Defensive Checks  */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Security Posture Subsystem Matrix */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
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
                  SECURITY POSTURE
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#E6F1FF' }}>
                  Subsystem Posture Matrix
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10B981' }}>
                  81 / 100
                </span>
                <div style={{ fontSize: '0.72rem', color: '#9FB4CC' }}>Nominal Overall</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {postureBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: '#0A1A30',
                    border: '1px solid #17395C',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#E6F1FF' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6F86A1' }}>{item.reason}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: item.status === 'Warning' ? '#F59E0B' : '#10B981',
                      }}
                    >
                      {item.score}
                    </span>
                    <ThreatBadge status={item.status === 'Warning' ? 'WARNING' : 'CLEAN'} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #17395C', fontSize: '0.74rem', color: '#6F86A1' }}>
              Calculation: <strong style={{ color: '#E6F1FF' }}>Weighted average across 7 defensive boundaries</strong>
            </div>
          </div>

          {/* Section 2: Live Security Alerts Stream */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#EF4444',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  SECURITY ALERTS
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#E6F1FF' }}>
                  Live Anomaly Stream
                </h3>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#9FB4CC' }}>Click to inspect</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {securityAlerts.map((alert, i) => (
                <AlertCard key={i} alert={alert} onInvestigate={setInvestigatingItem} />
              ))}
            </div>
          </div>

          {/* Section 3: Recent Security Checks */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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
                  RECENT SECURITY CHECKS
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#E6F1FF' }}>
                  Platform Integrity Scans
                </h3>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>8 / 8 Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {recentSecurityChecks.map((chk, i) => (
                <SecurityCheck key={i} {...chk} />
              ))}
            </div>
          </div>

          {/* Section 4: Threat Vector Distribution */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
            <h3 style={{ margin: '0 0 1.1rem', fontSize: '1.05rem', fontWeight: 800, color: '#E6F1FF' }}>
              THREAT VECTOR DISTRIBUTION
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {threatCategories.map((tc, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#E6F1FF' }}>{tc.name}</span>
                    <span style={{ color: tc.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {tc.count} events
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#0A1A30', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: tc.pct,
                        background: tc.color,
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Causality Threat Timeline */}
          <div
            style={{
              background: '#0D2038',
              border: '1px solid #17395C',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
            }}
          >
            <h3 style={{ margin: '0 0 1.1rem', fontSize: '1.05rem', fontWeight: 800, color: '#E6F1FF' }}>
              CAUSALITY THREAT TIMELINE
            </h3>
            <ThreatTimeline />
          </div>
        </div>
      </div>

      {/* Investigation Modal Drawer */}
      <InvestigationModal
        item={investigatingItem}
        onClose={() => setInvestigatingItem(null)}
        onContain={handleContainIncident}
        onResolve={handleResolveIncident}
      />
    </div>
  );
}

