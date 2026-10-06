import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterDomain, setFilterDomain] = useState('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.getPolicies();
      if (res.success) {
        setPolicies(res.data);
      }
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleToggleStatus = async (policyId, currentStatus) => {
    const nextStatus = currentStatus === 'ENFORCING' ? 'MONITORING' : currentStatus === 'MONITORING' ? 'DISABLED' : 'ENFORCING';
    try {
      setUpdatingId(policyId);
      const res = await api.updatePolicyStatus(policyId, { status: nextStatus });
      if (res.success) {
        setPolicies((prev) =>
          prev.map((p) => (p.policyId === policyId ? res.data : p))
        );
        setFeedbackMsg(`Policy ${policyId} updated to ${nextStatus}`);
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      alert(`Failed to update policy: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const domains = ['ALL', 'IDENTITY', 'RESOURCE', 'WORKFLOW', 'REALITY', 'DECOY'];
  const filteredPolicies = filterDomain === 'ALL'
    ? policies
    : policies.filter((p) => p.domain === filterDomain);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ENFORCING':
        return <span className="decision-pill pill-block" style={{ fontSize: '0.7rem' }}>ENFORCING (BLOCK)</span>;
      case 'MONITORING':
        return <span className="decision-pill pill-monitor" style={{ fontSize: '0.7rem' }}>MONITORING ONLY</span>;
      case 'DISABLED':
        return <span className="decision-pill" style={{ background: '#334155', color: '#94a3b8', fontSize: '0.7rem' }}>DISABLED</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>CRITICAL</span>;
      case 'HIGH':
        return <span style={{ color: '#f97316', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>HIGH</span>;
      case 'MEDIUM':
        return <span style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>MEDIUM</span>;
      default:
        return <span style={{ color: '#3b82f6', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>LOW</span>;
    }
  };

  return (
    <div className="overview-container" style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📜</span> Security Policy Rulebook
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Declarative security guardrails evaluated on every operational and API transaction.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {feedbackMsg && (
            <span style={{ fontSize: '0.8rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
              ✓ {feedbackMsg}
            </span>
          )}
          <button className="btn btn-secondary" onClick={fetchPolicies} disabled={loading} style={{ fontSize: '0.8rem' }}>
            🔄 Refresh Rules
          </button>
        </div>
      </div>

      {/* Domain Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
        {domains.map((dom) => (
          <button
            key={dom}
            onClick={() => setFilterDomain(dom)}
            className="btn"
            style={{
              fontSize: '0.75rem',
              fontWeight: filterDomain === dom ? 700 : 500,
              background: filterDomain === dom ? '#1e293b' : 'transparent',
              color: filterDomain === dom ? '#38bdf8' : '#64748b',
              border: filterDomain === dom ? '1px solid #38bdf8' : '1px solid transparent',
              borderRadius: '4px',
              padding: '0.35rem 0.75rem',
            }}
          >
            {dom} {dom !== 'ALL' && `(${policies.filter(p => p.domain === dom).length})`}
          </button>
        ))}
      </div>

      {/* Policy Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading active policy rulebook...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {filteredPolicies.map((policy) => (
            <div
              key={policy.policyId}
              className="soc-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${
                  policy.status === 'ENFORCING'
                    ? '#3b82f6'
                    : policy.status === 'MONITORING'
                    ? '#f59e0b'
                    : '#475569'
                }`,
              }}
            >
              <div>
                {/* Policy Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {policy.policyId}
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
                      {policy.name}
                    </h3>
                  </div>
                  <div>{getStatusBadge(policy.status)}</div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 1rem' }}>
                  {policy.description}
                </p>

                {/* Metadata Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#090d16', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Domain</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>{policy.domain}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Severity</span>
                    {getSeverityBadge(policy.severity)}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Default Action</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>{policy.action}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Total Triggers</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#f43f5e', fontWeight: 700 }}>
                      {policy.triggerCount || 0} times
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Mode: <strong style={{ color: '#cbd5e1' }}>{policy.status}</strong>
                </span>
                <button
                  className="btn"
                  onClick={() => handleToggleStatus(policy.policyId, policy.status)}
                  disabled={updatingId === policy.policyId}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.3rem 0.6rem',
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {updatingId === policy.policyId ? 'Saving...' : 'Switch Mode'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
