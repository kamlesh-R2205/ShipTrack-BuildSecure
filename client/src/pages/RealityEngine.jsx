import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function RealityEngine() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Movement Evaluation State
  const [originHub, setOriginHub] = useState('HYD-CENTRAL-01');
  const [destHub, setDestHub] = useState('VIJ-DC-03');
  const [minutesElapsed, setMinutesElapsed] = useState(4); // Default to impossible 4 mins
  const [targetState, setTargetState] = useState('DELIVERED');
  const [reportedAccuracy, setReportedAccuracy] = useState(15);
  const [evalResult, setEvalResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    async function loadRealityData() {
      try {
        const res = await api.getRealityEngine();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load Reality Engine telemetry.');
      } finally {
        setLoading(false);
      }
    }
    loadRealityData();
  }, []);

  const handleEvaluate = async () => {
    if (!data?.hubs) return;
    const origin = data.hubs[originHub];
    const destination = data.hubs[destHub];

    setIsEvaluating(true);
    try {
      const now = new Date();
      const past = new Date(now.getTime() - minutesElapsed * 60000);

      const res = await api.evaluateReality({
        previousLocation: {
          lat: origin.lat,
          lng: origin.lng,
          name: origin.name,
          timestamp: past,
        },
        currentLocation: {
          lat: destination.lat,
          lng: destination.lng,
          name: destination.name,
          timestamp: now,
          reportedAccuracyMeters: reportedAccuracy,
        },
        targetState,
        expectedDestination: {
          lat: destination.lat,
          lng: destination.lng,
          name: destination.name,
        },
      });

      setEvalResult(res.data);
    } catch (err) {
      setError(err.message || 'Evaluation failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Initializing Reality Engine & Geofencing Model...
      </div>
    );
  }

  const hubs = data?.hubs || {};
  const activeDrivers = data?.activeDrivers || [];

  return (
    <div className="soc-content">
      {/* Header */}
      <div className="soc-header">
        <div>
          <div className="soc-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            REALITY ENGINE & LOCATION INTEGRITY
          </div>
          <div className="soc-subtitle">
            Validates whether logistics operations make physical, spatial, and temporal sense using Haversine velocity modeling
          </div>
        </div>

        <div className="soc-meta-pills">
          <div className="meta-pill active">
            <span>PHYSICS CONSTRAINTS ACTIVE</span>
          </div>
          <div className="meta-pill">
            <span>COMMERCIAL LIMIT: 120 KM/H</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {/* Interactive Spatial Reality Simulator */}
      <div className="card mb-6" style={{ border: '1px solid #06b6d4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              INTERACTIVE SPATIAL MOVEMENT EVALUATOR
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Simulate courier checkpoint transitions and test impossible movement detection live
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleEvaluate} disabled={isEvaluating}>
            {isEvaluating ? 'Calculating Physics...' : '⚡ Run Reality Evaluation'}
          </button>
        </div>

        {/* Input Parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Departure Checkpoint (Location A)</label>
            <select className="form-select" value={originHub} onChange={(e) => setOriginHub(e.target.value)}>
              {Object.entries(hubs).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({v.city})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reported Checkpoint (Location B)</label>
            <select className="form-select" value={destHub} onChange={(e) => setDestHub(e.target.value)}>
              {Object.entries(hubs).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({v.city})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Time Elapsed (Minutes)</label>
            <input
              type="number"
              className="form-input"
              value={minutesElapsed}
              onChange={(e) => setMinutesElapsed(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Try 4 mins (Impossible) vs 240 mins (Realistic)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target State Transition</label>
            <select className="form-select" value={targetState} onChange={(e) => setTargetState(e.target.value)}>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="DELIVERED">DELIVERED (Requires Geofence)</option>
            </select>
          </div>
        </div>

        {/* Reality Result Output */}
        {evalResult && (
          <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div className="reality-vector-box" style={{ background: 'transparent', padding: 0, border: 'none' }}>
              <div className="location-point">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origin Checkpoint</span>
                <span className="location-point-name">{hubs[originHub]?.name}</span>
                <span className="location-point-coords">{hubs[originHub]?.lat}, {hubs[originHub]?.lng}</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem' }}>➔</span>
                <div className="text-mono" style={{ fontSize: '0.8rem', color: '#60a5fa' }}>{evalResult.minutesElapsed} mins</div>
              </div>

              <div className="location-point">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination Checkpoint</span>
                <span className="location-point-name">{hubs[destHub]?.name}</span>
                <span className="location-point-coords">{hubs[destHub]?.lat}, {hubs[destHub]?.lng}</span>
              </div>

              <div className="vector-stat">
                <div className="vector-stat-lbl">DISTANCE</div>
                <div className="vector-stat-val">{evalResult.distanceKm} km</div>
              </div>

              <div className="vector-stat">
                <div className="vector-stat-lbl">CALCULATED SPEED</div>
                <div className={`vector-stat-val ${evalResult.calculatedSpeedKmH > 140 ? 'anomaly' : ''}`}>
                  {evalResult.calculatedSpeedKmH.toLocaleString()} km/h
                </div>
              </div>

              <div className="vector-stat">
                <div className="vector-stat-lbl">LOCATION TRUST</div>
                <div className="vector-stat-val" style={{ color: evalResult.locationTrustScore < 40 ? '#f87171' : evalResult.locationTrustScore < 70 ? '#fbbf24' : '#34d399' }}>
                  {evalResult.locationTrustScore} <span style={{ fontSize: '0.9rem' }}>/100</span>
                </div>
              </div>
            </div>

            {/* Anomalies List */}
            {evalResult.anomalies?.length > 0 ? (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🚨</span> LOCATION INTEGRITY ANOMALIES DETECTED
                </div>
                {evalResult.anomalies.map((a, i) => (
                  <div key={i} style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    • <strong>[{a.code}]</strong>: {a.message}
                  </div>
                ))}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Possible Root Causes: GPS spoofing, mock provider apps, stolen credentials, or sensor corruption.
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.85rem' }}>
                ✓ Spatial Movement Validated: Velocity and route checkpoints satisfy physical delivery constraints.
              </div>
            )}

            {/* 5-Factor Score Breakdown */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                5-Factor Location Trust Breakdown
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(evalResult.scoreBreakdown || {}).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {k.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="text-mono" style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hub Geofence Topology */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        MONITORED LOGISTICS HUB TOPOLOGY
      </h3>
      <div className="stats-grid">
        {Object.entries(hubs).map(([code, hub]) => (
          <div key={code} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="text-mono" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{code}</span>
              <span className="meta-pill active" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>GEOFENCE ACTIVE</span>
            </div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>{hub.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{hub.city} Division</div>
            <div className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Coords: {hub.lat}, {hub.lng} | Safe Radius: {hub.radiusKm} km
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
