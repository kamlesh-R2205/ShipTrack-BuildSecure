import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function SecurityGraph({ onNavigate }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    async function loadGraph() {
      try {
        const res = await api.getSecurityGraph();
        setGraphData(res.data);
        if (res.data?.nodes?.length > 0) {
          setSelectedNode(res.data.nodes[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load Security Graph topology.');
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, []);

  if (loading && !graphData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Generating Entity-Relationship Topology...
      </div>
    );
  }

  const nodes = graphData?.nodes || [];
  const links = graphData?.links || [];
  const summary = graphData?.summary || {};
  const insights = graphData?.insights || [];

  // Helper colors for node types
  const getNodeColor = (node) => {
    if (node.status === 'COMPROMISED' || node.status === 'HIGH_RISK') return '#ef4444';
    if (node.type === 'HUB') return '#3b82f6';
    if (node.type === 'DRIVER') return '#06b6d4';
    if (node.type === 'CUSTOMER') return '#10b981';
    if (node.type === 'HONEYPOT') return '#a855f7';
    if (node.type === 'DEVICE') return '#eab308';
    return '#94a3b8';
  };

  return (
    <div className="soc-content">
      {/* Header */}
      <div className="soc-header">
        <div>
          <div className="soc-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            LOGISTICS SECURITY TOPOLOGY GRAPH
          </div>
          <div className="soc-subtitle">
            Maps multi-entity relationships between users, devices, dispatch hubs, and parcels to detect cross-tenant traversal
          </div>
        </div>

        <div className="soc-meta-pills">
          <div className="meta-pill active">
            <span>NODES: {summary.totalNodes}</span>
          </div>
          <div className="meta-pill critical">
            <span>SUSPICIOUS EDGES: {summary.suspiciousLinks}</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {/* Main Graph Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* SVG Graph Canvas */}
        <div className="graph-stage" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(9, 13, 22, 0.8)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #1e293b', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click nodes to inspect entity posture and threat connections
          </div>

          <svg width="100%" height="100%" viewBox="0 0 800 520">
            {/* Render Links */}
            {links.map((link, idx) => {
              // Layout math for demo positioning
              const srcIdx = nodes.findIndex((n) => n.id === link.source);
              const tgtIdx = nodes.findIndex((n) => n.id === link.target);

              const x1 = 150 + ((srcIdx * 95) % 600);
              const y1 = 100 + ((srcIdx * 70) % 360);
              const x2 = 150 + ((tgtIdx * 95) % 600);
              const y2 = 100 + ((tgtIdx * 70) % 360);

              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={link.isSuspicious ? '#ef4444' : '#23324d'}
                    strokeWidth={link.isSuspicious ? 2.5 : 1}
                    strokeDasharray={link.isSuspicious ? '4 3' : 'none'}
                  />
                  {link.isSuspicious && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 6}
                      fill="#f87171"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node, idx) => {
              const x = 150 + ((idx * 95) % 600);
              const y = 100 + ((idx * 70) % 360);
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node);

              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(node)}
                >
                  <circle
                    r={isSelected ? 18 : 14}
                    fill={color}
                    fillOpacity={0.25}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  <circle r={6} fill={color} />
                  <text
                    y={28}
                    fill="#f8fafc"
                    fontSize="10"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {node.label?.slice(0, 16)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Entity Inspector Pane */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              ENTITY SECURITY INSPECTOR
            </h3>

            {selectedNode ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    className="meta-pill"
                    style={{
                      background: `${getNodeColor(selectedNode)}22`,
                      color: getNodeColor(selectedNode),
                      border: `1px solid ${getNodeColor(selectedNode)}`,
                    }}
                  >
                    {selectedNode.type}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: selectedNode.status === 'COMPROMISED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: selectedNode.status === 'COMPROMISED' ? '#f87171' : '#34d399',
                    }}
                  >
                    {selectedNode.status}
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                  {selectedNode.label}
                </div>
                <div className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  ID: {selectedNode.id}
                </div>

                <div style={{ background: '#090d16', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #1e293b', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Attributes:</div>
                  <pre className="text-mono" style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    {JSON.stringify(selectedNode.details, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Select a node to inspect attributes.
              </div>
            )}
          </div>

          {/* Graph Legend */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #1e293b', fontSize: '0.75rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LEGEND</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
                <span>Hub Node</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }}></span>
                <span>Driver</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                <span>Customer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                <span>Compromised</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }}></span>
                <span>Honeypot</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Correlation Insights */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
        CORRELATION INSIGHTS & SUSPICIOUS RELATIONSHIP EDGES
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {insights.map((ins, i) => (
          <div key={i} className="card" style={{ borderLeft: `4px solid ${ins.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}` }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
              {ins.title}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {ins.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
