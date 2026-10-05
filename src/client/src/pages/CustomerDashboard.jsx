import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SecurityBanner } from '../components/SecurityBanner';

export function CustomerDashboard({ onNavigate, onSelectShipment }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getShipments({ limit: 10 });
        setShipments(res.shipments || []);
      } catch (err) {
        setError(err.message || 'Failed to load shipment records.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const total = shipments.length;
  const active = shipments.filter((s) => ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)).length;
  const delivered = shipments.filter((s) => s.status === 'DELIVERED').length;
  const inTransit = shipments.filter((s) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)).length;

  return (
    <div className="content-body">
      <SecurityBanner />

      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Customer Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitor and track your authorized delivery dispatches
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('my-shipments')}>
            View All Shipments
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('create-shipment')}>
            + Create New Shipment
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Operational Metrics */}
      <div className="grid-stats">
        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Total Shipments</span>
            <div className="stat-icon">📦</div>
          </div>
          <div className="stat-value">{loading ? '...' : total}</div>
          <div className="stat-subtext">Lifetime parcels created</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Active Dispatches</span>
            <div className="stat-icon">🚚</div>
          </div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>{loading ? '...' : active}</div>
          <div className="stat-subtext">Currently in pipeline</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Out / In Transit</span>
            <div className="stat-icon">⚡</div>
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{loading ? '...' : inTransit}</div>
          <div className="stat-subtext">On route to destination</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Delivered</span>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>{loading ? '...' : delivered}</div>
          <div className="stat-subtext">Completed deliveries</div>
        </div>
      </div>

      {/* Recent Shipments List */}
      <div className="card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Recent Dispatches</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing up to 10 latest parcels
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading shipments...
          </div>
        ) : shipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>No shipments created yet.</p>
            <button className="btn btn-primary btn-sm mt-4" onClick={() => onNavigate('create-shipment')}>
              Book Your First Shipment
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Destination</th>
                  <th>Receiver</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id}>
                    <td className="text-mono" style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                      {s.trackingNumber}
                    </td>
                    <td>{s.receiverDetails?.city}, {s.receiverDetails?.postalCode}</td>
                    <td>{s.receiverDetails?.name}</td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          onSelectShipment(s._id);
                          onNavigate('shipment-details');
                        }}
                      >
                        Inspect
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
