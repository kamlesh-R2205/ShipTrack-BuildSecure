import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function RiskEngine() {
  const [engineData, setEngineData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Interactive Live Workbench State
  const [activeSignals, setActiveSignals] = useState({
    bola: false,
    honeypot: false,
    velocity: false,
    fsm: false,
    locationTrust: false,
    driverSegregation: false,
    tokenExpired: false,
    rateLimit: false,
  });

  const availableSignals = [
    { key: 'honeypot', name: 'Decoy Honeypot Resource Query', points: 50, category: 'HONEYPOT', policy: 'POL-HNY-006' },
    { key: 'bola', name: 'Resource Ownership Mismatch (BOLA/IDOR)', points: 35, category: 'RESOURCE', policy: 'POL-IDOR-002' },
    { key: 'driverSegregation', name: 'Cross-Driver Fleet Segregation Breach', points: 30, category: 'RESOURCE', policy: 'POL-RBAC-007' },
    { key: 'velocity', name: 'Impossible Velocity (>140 km/h teleportation)', points: 25, category: 'REALITY', policy: 'POL-VEL-005' },
    { key: 'fsm', name: 'State Machine Workflow Tampering / Skip', points: 25, category: 'WORKFLOW', policy: 'POL-FSM-003' },
    { key: 'locationTrust', name: 'Degraded Location Trust (<40/100)', points: 20, category: 'REALITY', policy: 'POL-SPOOF-004' },
    { key: 'rateLimit', name: 'Sequential Enumeration / Burst Probing', points: 20, category: 'BEHAVIOR', policy: 'POL-ROUTE-008' },
    { key: 'tokenExpired', name: 'Identity Privilege / Token Expiry Anomaly', points: 15, category: 'IDENTITY', policy: 'POL-AUTH-001' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getRiskEngine();
        if (res.success) {
          setEngineData(res.data);
        }
      } catch (err) {
        console.error('Failed to load risk engine data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleSignal = (key) => {
    setActiveSignals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate live composite score
  const computedScore = Math.min(
    100,
    availableSignals.reduce((total, sig) => (activeSignals[sig.key] ? total + sig.points : total), 0)
  );

  let computedDecision = 'ALLOW';
  let decisionClass = 'pill-allow';
  let severityLevel = 'LOW';
  let severityColor = '#10b981';

  if (computedScore >= 80) {
    computedDecision = 'BLOCK';
    decisionClass = 'pill-block';
    severityLevel = 'CRITICAL';
    severityColor = '#ef4444';
  } else if (computedScore >= 60) {
    computedDecision = 'STEP_UP';
    decisionClass = 'pill-stepup';
    severityLevel = 'HIGH';
    severityColor = '#f97316';
  } else if (computedScore >= 30) {
    computedDecision = 'MONITOR';
    decisionClass = 'pill-monitor';
    severityLevel = 'MEDIUM';
    severityColor = '#f59e0b';
  }

  const triggeredPolicies = availableSignals
    .filter((sig) => activeSignals[sig.key])
    .map((sig) => `${sig.policy} (+${sig.points})`);

  return (
    <div className="overview-container" style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚙️</span> Explainable Risk Decision Engine
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
          Multi-domain deterministic risk scoring framework. Replaces opaque AI with auditable mathematical points.
        </p>
      </div>

      {/* Top Section: Live Interactive Workbench */}
      <div className="soc-card" style={{ marginBottom: '1.5rem', background: '#0b1120', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interactive Sandbox
            </span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0 0', color: '#f8fafc' }}>
              Dynamic Risk Evaluation Workbench
            </h2>
          </div>
          <button
            className="btn"
            onClick={() => setActiveSignals({ bola: false, honeypot: false, velocity: false, fsm: false, locationTrust: false, driverSegregation: false, tokenExpired: false, rateLimit: false })}
            style={{ fontSize: '0.75rem', background: '#1e293b', color: '#cbd5e1', padding: '0.3rem 0.6rem', border: '1px solid #334155', borderRadius: '4px' }}
          >
            Reset Simulator
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
          {/* Signal Toggles */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Select Simulated Anomalies to Evaluate:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {availableSignals.map((sig) => {
                const isActive = activeSignals[sig.key];
                return (
                  <div
                    key={sig.key}
                    onClick={() => toggleSignal(sig.key)}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '4px',
                      background: isActive ? 'rgba(59, 130, 246, 0.15)' : '#090d16',
                      border: `1px solid ${isActive ? '#3b82f6' : '#1e293b'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#f8fafc' : '#94a3b8' }}>
                        {sig.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {sig.policy} &bull; {sig.category}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: isActive ? '#38bdf8' : '#475569',
                      }}
                    >
                      +{sig.points}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Computed Decision Output */}
          <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Composite Risk Output
                </span>
                <span className={`decision-pill ${decisionClass}`} style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                  {computedDecision}
                </span>
              </div>

              {/* Gauge Score Bar */}
              <div style={{ margin: '1.25rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: severityColor }}>
                    {computedScore}
                    <span style={{ fontSize: '1rem', color: '#64748b' }}> / 100</span>
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: severityColor }}>
                    {severityLevel} RISK
                  </span>
                </div>
                <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${computedScore}%`,
                      background: severityColor,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Explainability Log */}
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>
                  Explainability Trace:
                </div>
                {triggeredPolicies.length === 0 ? (
                  <div style={{ color: '#10b981', fontStyle: 'italic', fontSize: '0.7rem' }}>
                    Zero anomalies detected. Request cleared for unconditional execution.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {triggeredPolicies.map((tp, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                        }}
                      >
                        {tp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Advice */}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b', fontSize: '0.7rem', color: '#64748b' }}>
              Enforcement Mode: <strong style={{ color: '#e2e8f0' }}>Zero-Trust Live Gatekeeper</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Matrix & Static Config */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Decision Boundaries */}
        <div className="soc-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#f1f5f9' }}>
            Decision Action Boundaries
          </h3>
          <table className="soc-table" style={{ width: '100%', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th>Score Range</th>
                <th>Classification</th>
                <th>Enforced Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span style={{ fontFamily: 'var(--font-mono)', color: '#10b981', fontWeight: 700 }}>0 - 29</span></td>
                <td>LOW RISK</td>
                <td><span className="decision-pill pill-allow" style={{ fontSize: '0.65rem' }}>ALLOW</span></td>
              </tr>
              <tr>
                <td><span style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 700 }}>30 - 59</span></td>
                <td>MEDIUM RISK</td>
                <td><span className="decision-pill pill-monitor" style={{ fontSize: '0.65rem' }}>MONITOR</span></td>
              </tr>
              <tr>
                <td><span style={{ fontFamily: 'var(--font-mono)', color: '#f97316', fontWeight: 700 }}>60 - 79</span></td>
                <td>HIGH RISK</td>
                <td><span className="decision-pill pill-stepup" style={{ fontSize: '0.65rem' }}>STEP_UP</span></td>
              </tr>
              <tr>
                <td><span style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 700 }}>80 - 100</span></td>
                <td>CRITICAL RISK</td>
                <td><span className="decision-pill pill-block" style={{ fontSize: '0.65rem' }}>BLOCK</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signal Definitions */}
        <div className="soc-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#f1f5f9' }}>
            Domain Penalty Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#090d16', borderRadius: '4px' }}>
              <span style={{ color: '#e2e8f0' }}>Decoy / Honeypot Traps</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 700 }}>+50 Pts (Immediate Critical Trigger)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#090d16', borderRadius: '4px' }}>
              <span style={{ color: '#e2e8f0' }}>Resource Access (BOLA / IDOR)</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#f97316', fontWeight: 700 }}>+35 Pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#090d16', borderRadius: '4px' }}>
              <span style={{ color: '#e2e8f0' }}>Driver Fleet Segregation Breach</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#f97316', fontWeight: 700 }}>+30 Pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#090d16', borderRadius: '4px' }}>
              <span style={{ color: '#e2e8f0' }}>Reality Engine (Velocity &gt; 140km/h)</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 700 }}>+25 Pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#090d16', borderRadius: '4px' }}>
              <span style={{ color: '#e2e8f0' }}>Workflow State Machine Tampering</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 700 }}>+25 Pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
