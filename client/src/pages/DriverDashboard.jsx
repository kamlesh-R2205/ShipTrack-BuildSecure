import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SecurityBanner } from '../components/SecurityBanner';

export function DriverDashboard({ onNavigate, onSelectShipment }) {
  const [stats, setStats] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function loadDriverData() {
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
        setError(err.message || 'Failed to load driver dashboard.');
      } finally {
        setLoading(false);
      }
    }
    loadDriverData();
  }, []);

  const filteredShipments = shipments.filter((s) => {
    if (filter === 'ACTIVE') {
      return ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status);
    }
    if (filter === 'OUT') {
      return s.status === 'OUT_FOR_DELIVERY';
    }
    if (filter === 'DELIVERED') {
      return s.status === 'DELIVERED';
    }
    return true;
  });

  return (
    <div className="content-body">
      <SecurityBanner />

      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Fleet Driver Console</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Assigned parcel dispatch queues and delivery verification
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Driver Operational Metrics */}
      <div className="grid-stats">
        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Active Assigned</span>
            <div className="stat-icon">📋</div>
          </div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>{loading ? '...' : stats?.activeAssigned || 0}</div>
          <div className="stat-subtext">Parcels in your queue</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Out For Delivery</span>
            <div className="stat-icon">🚚</div>
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{loading ? '...' : stats?.outForDelivery || 0}</div>
          <div className="stat-subtext">Final-mile dispatch today</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Delivered Today</span>
            <div className="stat-icon">⚡</div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>{loading ? '...' : stats?.deliveredToday || 0}</div>
          <div className="stat-subtext">Completed today</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Total Completed</span>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-value">{loading ? '...' : stats?.totalCompleted || 0}</div>
          <div className="stat-subtext">Lifetime verified deliveries</div>
        </div>
      </div>

      {/* Queue Filter Bar */}
      <div className="card mb-6" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('ALL')}
        >
          All Assigned ({shipments.length})
        </button>
        <button
          className={`btn btn-sm ${filter === 'ACTIVE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('ACTIVE')}
        >
          Active Deliveries
        </button>
        <button
          className={`btn btn-sm ${filter === 'OUT' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('OUT')}
        >
          Out For Delivery
        </button>
        <button
          className={`btn btn-sm ${filter === 'DELIVERED' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('DELIVERED')}
        >
          Completed Archive
        </button>
      </div>

      {/* Deliveries List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading your assigned deliveries...
          </div>
        ) : filteredShipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No packages in this queue filter.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Recipient & Address</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Est. Arrival</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => (
                  <tr key={s._id}>
                    <td className="text-mono" style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                      {s.trackingNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.receiverDetails?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {s.receiverDetails?.address}
                      </div>
                    </td>
                    <td>{s.receiverDetails?.city}</td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {s.estimatedDeliveryDate ? new Date(s.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          onSelectShipment(s._id);
                          onNavigate('shipment-details');
                        }}
                      >
                        Inspect & Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
