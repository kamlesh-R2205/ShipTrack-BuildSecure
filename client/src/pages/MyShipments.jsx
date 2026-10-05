import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export function MyShipments({ onNavigate, onSelectShipment }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getShipments(params);
      setShipments(res.shipments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch shipments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShipments();
  };

  return (
    <div className="content-body">
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Shipment Registry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            All dispatches registered under your authenticated account
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('create-shipment')}>
          + New Shipment
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6" style={{ padding: '1rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Tracking ID, Receiver, City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading your dispatches...
        </div>
      ) : shipments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No matching shipments found.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Destination</th>
                  <th>Receiver</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th>Created Date</th>
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
                    <td>{s.packageDetails?.weightKg} kg</td>
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
        </div>
      )}
    </div>
  );
}
