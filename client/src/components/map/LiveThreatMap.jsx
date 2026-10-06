import React, { useState } from 'react';
import { ThreatBadge } from '../common/ThreatBadge';

export function LiveThreatMap({ onInspectShipment }) {
  const [mapLayer, setMapLayer] = useState('MAP'); // 'MAP' | 'SATELLITE'
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'THREATS' | 'VEHICLES' | 'ROUTES'
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Logistics Hubs
  const hubs = [
    { id: 'HUB-HYD-01', name: 'Hyderabad Central Logistics', x: 420, y: 220, type: 'HUB', status: 'HEALTHY' },
    { id: 'HUB-SEC-02', name: 'Secunderabad Transit Depot', x: 450, y: 190, type: 'DEPOT', status: 'HEALTHY' },
    { id: 'HUB-VIJ-03', name: 'Vijayawada Regional Port', x: 680, y: 310, type: 'PORT', status: 'ALERT' },
    { id: 'HUB-BLR-04', name: 'Bangalore South Hub', x: 380, y: 440, type: 'HUB', status: 'HEALTHY' },
  ];

  // Logistics Shipments & Vehicles with routes and threat status
  const shipments = [
    {
      id: 'ST-2026-001',
      vehicleId: 'FLEET-HYD-101',
      driver: 'Ravi Kumar',
      currentLocation: 'NH 44, Hyderabad Outskirts (17.385, 78.486)',
      status: 'VERIFIED',
      routeColor: '#10b981', // GREEN (healthy/verified)
      state: 'IN_TRANSIT',
      threatType: 'NONE',
      riskScore: 12,
      path: 'M 420 220 L 450 190',
      x: 440,
      y: 200,
      detectionTime: 'Live (10:47 AM)',
      reason: 'GPS telemetry matches route corridor. Speed 64 km/h.',
      action: 'Unconditional Pass. Continuous telemetry stream active.',
    },
    {
      id: 'ST-2026-002',
      vehicleId: 'FLEET-HYD-102',
      driver: 'Rahul Sharma',
      currentLocation: 'NH 65 Corridor (17.120, 79.620)',
      status: 'THREAT',
      routeColor: '#ef4444', // RED (threat route)
      state: 'OUT_FOR_DELIVERY',
      threatType: 'IMPOSSIBLE_MOVEMENT',
      riskScore: 88,
      path: 'M 450 190 Q 560 210 680 310',
      x: 580,
      y: 245,
      detectionTime: '11:24 AM (3 mins ago)',
      reason: 'Teleportation jump of 275 km detected in 4 minutes (Speed > 140 km/h).',
      action: 'Delivery scan blocked. Supervisor step-up authorization required.',
    },
    {
      id: 'ST-2026-003',
      vehicleId: 'FLEET-BLR-204',
      driver: 'Vikram Singh',
      currentLocation: 'Kurnool Transit Bypass',
      status: 'WARNING',
      routeColor: '#f59e0b', // ORANGE (deviation)
      state: 'IN_TRANSIT',
      threatType: 'ROUTE_DEVIATION',
      riskScore: 48,
      path: 'M 420 220 L 400 330 L 380 440',
      x: 395,
      y: 350,
      detectionTime: '10:15 AM',
      reason: 'Vehicle deviated 18 km west from designated corridor polygon.',
      action: 'Monitoring active. High-frequency ping rate engaged.',
    },
    {
      id: 'SHP-HNY-001',
      vehicleId: 'DECOY-TRAP-01',
      driver: 'Unassigned (Canary)',
      currentLocation: 'Secunderabad Dummy Depot (Tripwire)',
      status: 'CRITICAL',
      routeColor: '#ef4444', // RED (threat)
      state: 'CANARY_DECOY',
      threatType: 'HONEYPOT_TRIGGER',
      riskScore: 98,
      path: '',
      x: 470,
      y: 175,
      detectionTime: '09:12 AM',
      reason: 'Unauthorized external query probed unadvertised canary asset.',
      action: 'Actor session restricted. IP quarantined in ingress rate limiter.',
    },
  ];

  const filteredShipments = shipments.filter((s) => {
    if (activeFilter === 'THREATS') return s.status === 'THREAT' || s.status === 'CRITICAL';
    if (activeFilter === 'VEHICLES') return s.vehicleId !== 'DECOY-TRAP-01';
    if (activeFilter === 'ROUTES') return s.path !== '';
    return true;
  });

  return (
    <div
      style={{
        background: '#0D2038',
        border: '1px solid #17395C',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Map Control Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🗺️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#E6F1FF', letterSpacing: '0.02em' }}>
              LIVE SHIPMENT & THREAT MAP
            </h3>
            <span style={{ fontSize: '0.76rem', color: '#9FB4CC' }}>
              Real-time corridor telemetry, GPS kinematics & geofenced threat boundaries
            </span>
          </div>
        </div>

        {/* Layer & Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Layer Toggle */}
          <div style={{ display: 'flex', background: '#071426', border: '1px solid #17395C', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setMapLayer('MAP')}
              style={{
                fontSize: '0.74rem',
                padding: '0.3rem 0.65rem',
                border: 'none',
                borderRadius: '4px',
                background: mapLayer === 'MAP' ? '#17395C' : 'transparent',
                color: mapLayer === 'MAP' ? '#38BDF8' : '#9FB4CC',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Vector Map
            </button>
            <button
              onClick={() => setMapLayer('SATELLITE')}
              style={{
                fontSize: '0.74rem',
                padding: '0.3rem 0.65rem',
                border: 'none',
                borderRadius: '4px',
                background: mapLayer === 'SATELLITE' ? '#17395C' : 'transparent',
                color: mapLayer === 'SATELLITE' ? '#38BDF8' : '#9FB4CC',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Satellite Grid
            </button>
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['ALL', 'THREATS', 'VEHICLES', 'ROUTES'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  fontSize: '0.74rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  border: activeFilter === f ? '1px solid #38BDF8' : '1px solid #17395C',
                  background: activeFilter === f ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: activeFilter === f ? '#38BDF8' : '#9FB4CC',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div style={{ position: 'relative', height: '380px', background: mapLayer === 'SATELLITE' ? '#050B16' : '#071426', overflow: 'hidden' }}>
        <svg
          viewBox="0 0 900 500"
          style={{ width: '100%', height: '100%', display: 'block' }}
          onClick={() => setSelectedEntity(null)}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#101827" strokeWidth="0.8" />
            </pattern>
            {/* Pulse Glow Filters */}
            <filter id="glow-threat" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-healthy" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Map Grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Simulated Geographic Land Outlines */}
          <path
            d="M 120 80 Q 280 60 480 90 T 780 120 Q 820 260 760 380 T 520 460 Q 340 450 220 380 Z"
            fill={mapLayer === 'SATELLITE' ? '#080d1a' : '#080c18'}
            stroke="#172133"
            strokeWidth="1.2"
          />

          {/* Hub-to-Hub Corridor Corridors (Baseline) */}
          <path d="M 420 220 L 450 190" stroke="#1a2538" strokeWidth="3" strokeDasharray="4,4" />
          <path d="M 450 190 Q 560 210 680 310" stroke="#1a2538" strokeWidth="3" strokeDasharray="4,4" />
          <path d="M 420 220 L 400 330 L 380 440" stroke="#1a2538" strokeWidth="3" strokeDasharray="4,4" />

          {/* Active Routes */}
          {filteredShipments.map((s) => {
            if (!s.path) return null;
            return (
              <g key={`route-${s.id}`}>
                <path
                  d={s.path}
                  fill="none"
                  stroke={s.routeColor}
                  strokeWidth={s.status === 'THREAT' ? '3' : '2'}
                  strokeDasharray={s.status === 'WARNING' ? '6,4' : 'none'}
                  filter={s.status === 'THREAT' ? 'url(#glow-threat)' : 'none'}
                  opacity={0.85}
                />
              </g>
            );
          })}

          {/* Hub Nodes */}
          {hubs.map((hub) => (
            <g key={hub.id} transform={`translate(${hub.x}, ${hub.y})`}>
              <circle r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <circle r="2.5" fill="#38bdf8" />
              <text x="12" y="4" fill="#94a3b8" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600">
                {hub.name.split(' ')[0]} ({hub.type})
              </text>
            </g>
          ))}

          {/* Moving Vehicle / Threat Markers */}
          {filteredShipments.map((s) => (
            <g
              key={`marker-${s.id}`}
              transform={`translate(${s.x}, ${s.y})`}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntity(s);
              }}
            >
              {/* Threat Pulse Animation Ring */}
              {s.status === 'THREAT' || s.status === 'CRITICAL' ? (
                <>
                  <circle r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="7;18;7" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle r="8" fill="#ef4444" filter="url(#glow-threat)" />
                </>
              ) : s.status === 'WARNING' ? (
                <circle r="7" fill="#f59e0b" />
              ) : (
                <circle r="7" fill="#10b981" filter="url(#glow-healthy)" />
              )}

              <circle r="3" fill="#ffffff" />

              {/* Entity Label */}
              <rect x="12" y="-14" width="75" height="18" rx="3" fill="#090d18" stroke="#1e293b" strokeWidth="0.8" />
              <text x="16" y="-2" fill="#f1f5f9" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700">
                {s.id}
              </text>
            </g>
          ))}
        </svg>

        {/* Map Legend Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(9, 13, 24, 0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid #1a2234',
            borderRadius: '6px',
            padding: '0.45rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            fontSize: '0.67rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span>Verified Route</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            <span>Deviation Warning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            <span>Active Threat</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', border: '1px solid #38bdf8', borderRadius: '50%' }} />
            <span>Logistics Hub</span>
          </div>
        </div>

        {/* Selected Entity Compact Inspection Panel */}
        {selectedEntity && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '320px',
              background: '#0A1A30',
              border: `1px solid ${selectedEntity.status === 'THREAT' || selectedEntity.status === 'CRITICAL' ? '#EF4444' : '#17395C'}`,
              borderRadius: '10px',
              padding: '1.25rem',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.75)',
              fontSize: '0.78rem',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {selectedEntity.id}
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#E6F1FF', marginTop: '0.15rem' }}>
                  {selectedEntity.vehicleId}
                </div>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                style={{ background: 'transparent', border: 'none', color: '#9FB4CC', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6F86A1' }}>Risk Score:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: selectedEntity.riskScore > 50 ? '#EF4444' : '#10B981' }}>
                  {selectedEntity.riskScore} / 100
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6F86A1' }}>Threat Classification:</span>
                <ThreatBadge severity={selectedEntity.status === 'THREAT' ? 'HIGH' : selectedEntity.status === 'CRITICAL' ? 'CRITICAL' : 'LOW'} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6F86A1' }}>Detected:</span>
                <span style={{ color: '#E6F1FF' }}>{selectedEntity.detectionTime}</span>
              </div>
            </div>

            <div style={{ background: '#071426', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.85rem', border: '1px solid #17395C' }}>
              <span style={{ color: '#9FB4CC', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Causality Reason:</span>
              <span style={{ color: '#E6F1FF', lineHeight: 1.4 }}>{selectedEntity.reason}</span>
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ color: '#9FB4CC', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>Recommended Action:</span>
              <span style={{ color: '#38BDF8', fontWeight: 600 }}>{selectedEntity.action}</span>
            </div>

            <button
              onClick={() => onInspectShipment && onInspectShipment(selectedEntity.id)}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.78rem', padding: '0.55rem', borderRadius: '6px', fontWeight: 700 }}
            >
              Open Shipment DNA Profile &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
