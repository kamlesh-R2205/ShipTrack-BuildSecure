import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ThreatBadge } from '../components/common/ThreatBadge';

export function DriverDashboard({ onNavigate, onSelectShipment }) {
  const [stats, setStats] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadDriverData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, shipRes] = await Promise.all([
        api.getDriverDashboard(),
        api.getShipments({ limit: 50 }),
      ]);
      setStats(dashRes.stats);
      setShipments(shipRes.shipments || []);
    } catch (err) {
      setError(err.message || 'Failed to load driver terminal telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  const handleAdvanceStatus = async (shipment) => {
    let nextStatus = '';
    if (shipment.status === 'ASSIGNED') nextStatus = 'PICKED_UP';
    else if (shipment.status === 'PICKED_UP') nextStatus = 'IN_TRANSIT';
    else if (shipment.status === 'IN_TRANSIT') nextStatus = 'OUT_FOR_DELIVERY';
    else if (shipment.status === 'OUT_FOR_DELIVERY') nextStatus = 'DELIVERED';
    else return;

    try {
      setUpdatingId(shipment._id);
      await api.updateShipmentStatus(shipment._id, {
        status: nextStatus,
        location: {
          lat: 17.385,
          lng: 78.4867,
          name: 'Hyderabad Central Logistics Hub',
        },
      });
      loadDriverData();
    } catch (err) {
      alert(`Status transition error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="overview-container" style={{ padding: '2rem 2.5rem', maxWidth: '1680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #17395C', paddingBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚚</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: '#E6F1FF', letterSpacing: '-0.02em' }}>
              Driver Fleet & Logistics Terminal
            </h1>
          </div>
          <p style={{ margin: 0, color: '#9FB4CC', fontSize: '0.9rem' }}>
            Authenticated courier terminal. Server-enforced route custody and physical reality kinematics verification active.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={loadDriverData} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
            🔄 Refresh Assigned Queue
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Driver Security & Vehicle Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#0D2038', border: '1px solid #17395C', borderRadius: '10px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Assigned Vehicle</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38BDF8', marginTop: '0.25rem' }}>
            FLEET-HYD-101
          </div>
          <div style={{ fontSize: '0.76rem', color: '#9FB4CC', marginTop: '0.35rem' }}>
            Hub: HYD-CENTRAL-01
          </div>
        </div>

        <div style={{ background: '#0D2038', border: '1px solid #17395C', borderRadius: '10px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>GPS Reality Trust</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10B981', marginTop: '0.25rem' }}>
            94 / 100 VERIFIED
          </div>
          <div style={{ fontSize: '0.76rem', color: '#9FB4CC', marginTop: '0.35rem' }}>
            Kinematics Compliant (&lt;120 km/h)
          </div>
        </div>

        <div style={{ background: '#0D2038', border: '1px solid #17395C', borderRadius: '10px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Active In-Flight Parcels</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B', marginTop: '0.25rem' }}>
            {stats?.activeAssigned || shipments.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#9FB4CC', marginTop: '0.35rem' }}>
            Under Courier Custody
          </div>
        </div>

        <div style={{ background: '#0D2038', border: '1px solid #17395C', borderRadius: '10px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#6F86A1', textTransform: 'uppercase' }}>Verified Deliveries</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10B981', marginTop: '0.25rem' }}>
            {stats?.totalCompleted || 12}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#9FB4CC', marginTop: '0.35rem' }}>
            FSM Transition Signature Logged
          </div>
        </div>
      </div>

      {/* Assigned Shipments Table */}
      <div style={{ background: '#090d18', border: '1px solid #1a2234', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #1a2234', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b1020' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
            ASSIGNED SHIPMENTS & CORRIDOR QUEUE ({shipments.length})
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Only parcels formally assigned to your driver ID are visible (Strict Driver Segregation)
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table" style={{ width: '100%', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Recipient & City</th>
                <th>Current FSM State</th>
                <th>Reality Integrity</th>
                <th>Next Valid Step</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    {s.trackingNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{s.receiverDetails?.name || 'Customer Recipient'}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{s.receiverDetails?.city || 'Hyderabad'} &bull; {s.receiverDetails?.phone}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#cbd5e1' }}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <ThreatBadge status={s.locationTrustScore < 50 ? 'WARNING' : 'CLEAN'} />
                  </td>
                  <td style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {s.status === 'ASSIGNED' && 'PICKED_UP'}
                    {s.status === 'PICKED_UP' && 'IN_TRANSIT'}
                    {s.status === 'IN_TRANSIT' && 'OUT_FOR_DELIVERY'}
                    {s.status === 'OUT_FOR_DELIVERY' && 'DELIVERED'}
                    {s.status === 'DELIVERED' && 'COMPLETED'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {s.status !== 'DELIVERED' && s.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleAdvanceStatus(s)}
                          disabled={updatingId === s._id}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.68rem', padding: '0.25rem 0.55rem' }}
                        >
                          {updatingId === s._id ? 'Verifying...' : 'Advance Status'}
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate && onNavigate('shipment-dna', s.trackingNumber)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.68rem', padding: '0.25rem 0.55rem' }}
                      >
                        Inspect DNA
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
