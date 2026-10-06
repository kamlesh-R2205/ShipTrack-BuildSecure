import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ThreatBadge } from '../components/common/ThreatBadge';

export function AttackSimulator({ onNavigate }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadScenarios() {
      try {
        const res = await api.getAttackScenarios();
        setScenarios(res.data || []);
        if (res.data?.length > 0) {
          setSelectedScenario(res.data[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attack scenarios.');
      }
    }
    loadScenarios();
  }, []);

  const handleExecuteAttack = async (scenario) => {
    setSelectedScenario(scenario);
    setIsExecuting(true);
    setError('');
    try {
      const res = await api.runAttackSimulation(scenario.id);
      setSimulationResult(res.data);
    } catch (err) {
      setError(err.message || 'Attack simulation failed.');
    } finally {
      setIsExecuting(false);
    }
  };

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
      {/* Header */}
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
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: '#E6F1FF', letterSpacing: '-0.02em' }}>
              Security Attack Simulator & Decision Pipeline
            </h1>
          </div>
          <p style={{ margin: 0, color: '#9FB4CC', fontSize: '0.9rem' }}>
            Simulate real-world logistics cyberattacks and inspect the 9-stage zero-trust decision pipeline in real time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.45rem 0.95rem',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '6px',
              color: '#F59E0B',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            ACTIVE SIMULATION SUITE (10 SCENARIOS)
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* 2-Column Spacious Grid: Left Scenarios Directory, Right Evaluation Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* ======================================================== */}
        {/* LEFT COLUMN: Attack Scenarios Directory                  */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E6F1FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Attack Vector ({scenarios.length})
            </span>
            <span style={{ fontSize: '0.74rem', color: '#6F86A1' }}>Click to execute</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {scenarios.map((sc) => {
              const isSelected = selectedScenario?.id === sc.id;

              return (
                <div
                  key={sc.id}
                  onClick={() => handleExecuteAttack(sc)}
                  style={{
                    background: isSelected ? '#102943' : '#0D2038',
                    border: `1px solid ${isSelected ? '#38BDF8' : '#17395C'}`,
                    borderRadius: '10px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#38BDF8',
                        background: '#0A1A30',
                        border: '1px solid #17395C',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {sc.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#6F86A1' }}>
                      SCENARIO #{sc.id}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#E6F1FF' }}>
                      {sc.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#9FB4CC', lineHeight: 1.4 }}>
                      {sc.description}
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#071426',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      border: '1px solid #17395C',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ color: '#6F86A1' }}>Target: </span>
                      <strong style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{sc.target}</strong>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={isExecuting && isSelected}
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '4px' }}
                    >
                      {isExecuting && isSelected ? 'Simulating...' : 'Test Vector →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Live Runtime Evaluation & Decision Flow    */}
        {/* ======================================================== */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {simulationResult ? (
            <div
              style={{
                background: '#0D2038',
                border: '1px solid #17395C',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Result Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #17395C',
                  paddingBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#38BDF8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'block',
                      marginBottom: '0.2rem',
                    }}
                  >
                    LIVE RUNTIME EVALUATION RESULT
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#E6F1FF' }}>
                    {simulationResult.scenario?.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <ThreatBadge decision={simulationResult.decision} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: simulationResult.riskScore > 50 ? '#EF4444' : '#10B981',
                      background: '#0A1A30',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #17395C',
                    }}
                  >
                    RISK: {simulationResult.riskScore} / 100
                  </span>
                </div>
              </div>

              {/* 9-Stage Zero-Trust Decision Pipeline */}
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#9FB4CC',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '0.65rem',
                  }}
                >
                  9-Stage Zero-Trust Gate Evaluation
                </span>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.6rem',
                  }}
                >
                  {simulationResult.pipelineSteps?.map((step, idx) => {
                    const isFailed = step.status === 'FAILED' || step.status === 'BLOCK';
                    const color = isFailed ? '#EF4444' : '#10B981';

                    return (
                      <div
                        key={idx}
                        style={{
                          background: isFailed ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          border: `1px solid ${isFailed ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`,
                          borderRadius: '8px',
                          padding: '0.75rem 0.5rem',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '80px',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#6F86A1' }}>
                          STEP 0{step.step}
                        </div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#E6F1FF', margin: '0.2rem 0' }}>
                          {step.phase}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color }}>
                          {step.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explainable Decision Breakdown */}
              <div
                style={{
                  background: '#071426',
                  border: '1px solid #17395C',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9FB4CC', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Explainable Risk Analysis
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {simulationResult.reasons?.map((r, i) => (
                      <div key={i} style={{ color: '#EF4444', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
                        <span>⚠️</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ paddingTop: '0.85rem', borderTop: '1px solid #17395C' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9FB4CC', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Triggered Policies Enforced
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {simulationResult.policiesTriggered?.map((pol, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.55rem',
                          background: '#0A1A30',
                          border: '1px solid #17395C',
                          borderRadius: '4px',
                          color: '#38BDF8',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                        }}
                      >
                        {pol}
                      </span>
                    ))}
                  </div>
                </div>

                {simulationResult.incidentId && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ color: '#EF4444', fontWeight: 700 }}>🚨 Incident Opened: </span>
                      <strong style={{ color: '#E6F1FF', fontFamily: 'var(--font-mono)' }}>
                        {simulationResult.incidentId}
                      </strong>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                      onClick={() => onNavigate && onNavigate('incidents')}
                    >
                      View in SOC Center &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#0D2038',
                border: '1px solid #17395C',
                borderRadius: '12px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
              }}
            >
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🛡️</span>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#E6F1FF' }}>
                Zero-Trust Evaluation Ready
              </h3>
              <p style={{ margin: 0, color: '#9FB4CC', fontSize: '0.88rem', maxWidth: '420px', marginInline: 'auto', lineHeight: 1.5 }}>
                Select an attack scenario from the left to simulate active intrusion, BOLA bypass, impossible velocity jumps, or honeypot tripwires against the live control plane.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

