import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { TimelineStepper } from '../components/TimelineStepper';

export function ShipmentDetails({ shipmentId, onNavigate }) {
  const { user, role } = useAuth();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [transitionNote, setTransitionNote] = useState('');
  const [transitionLocation, setTransitionLocation] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getShipmentById(shipmentId);
      setShipment(res.shipment);
    } catch (err) {
      setError(err.message || 'Access Denied or Shipment Not Found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shipmentId) fetchDetails();
  }, [shipmentId]);

  const handleStatusTransition = async (targetStatus) => {
    setActionLoading(true);
    setActionMessage('');
    setError('');

    try {
      const res = await api.updateShipmentStatus(shipmentId, {
        targetStatus,
        note: transitionNote,
        location: transitionLocation,
      });
      setShipment(res.shipment);
      setActionMessage(`✓ Success: ${res.message}`);
      setTransitionNote('');
      setTransitionLocation('');
    } catch (err) {
      setError(err.message || 'State transition rejected by server.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-body" style={{ textAlign: 'center', padding: '5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Querying authorized shipment record...</p>
      </div>
    );
  }

  if (error && !shipment) {
    return (
      <div className="content-body" style={{ maxWidth: '700px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem', border: '1px solid #ef4444' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
          <h2 style={{ color: '#f87171', marginBottom: '0.5rem' }}>Access Denied (403 Forbidden)</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            ShipTrack Server-Side Authorization Barrier: You are not authorized to inspect this shipment identifier. This security event has been logged to the immutable audit database.
          </p>
          <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Determine permitted next actions for Driver
  const currentStatus = shipment.status;
  const isDriverAssigned =
    role === 'DRIVER' &&
    shipment.assignedDriver &&
    (shipment.assignedDriver._id === user.id || shipment.assignedDriver === user.id);

  return (
    <div className="content-body" style={{ maxWidth: '1000px' }}>
      <div className="flex-between mb-4">
        <div>
          <button className="btn btn-secondary btn-sm mb-2" onClick={() => onNavigate('dashboard')}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>Parcel:</span>
            <span className="text-mono" style={{ color: 'var(--accent-blue)' }}>{shipment.trackingNumber}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Dispatched on {new Date(shipment.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <StatusBadge status={shipment.status} />
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#34d399', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {actionMessage}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Visual Lifecycle Stepper */}
      <div className="card mb-6">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Controlled Lifecycle Progression (FSM)
        </h3>
        <TimelineStepper currentStatus={shipment.status} />
      </div>

      {/* Driver State Transition Actions Panel */}
      {isDriverAssigned && currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED' && (
        <div className="card mb-6" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.5rem' }}>
            🚚 Driver Delivery Control
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Perform authorized state transitions for this assigned package:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Checkpoint Note (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Scanned at regional depot"
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Current Checkpoint Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hitec City Hub, Hyderabad"
                value={transitionLocation}
                onChange={(e) => setTransitionLocation(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {currentStatus === 'ASSIGNED' && (
              <button
                className="btn btn-primary"
                onClick={() => handleStatusTransition('PICKED_UP')}
                disabled={actionLoading}
              >
                Mark as Picked Up
              </button>
            )}

            {currentStatus === 'PICKED_UP' && (
              <button
                className="btn btn-primary"
                onClick={() => handleStatusTransition('IN_TRANSIT')}
                disabled={actionLoading}
              >
                Depart on Transit Line
              </button>
            )}

            {currentStatus === 'IN_TRANSIT' && (
              <button
                className="btn btn-primary"
                onClick={() => handleStatusTransition('OUT_FOR_DELIVERY')}
                disabled={actionLoading}
              >
                Out for Final Delivery
              </button>
            )}

            {currentStatus === 'OUT_FOR_DELIVERY' && (
              <button
                className="btn btn-primary"
                style={{ background: '#10b981' }}
                onClick={() => handleStatusTransition('DELIVERED')}
                disabled={actionLoading}
              >
                Confirm Recipient Delivery
              </button>
            )}
          </div>
        </div>
      )}

      {/* Customer Cancellation Option */}
      {role === 'CUSTOMER' && currentStatus === 'CREATED' && (
        <div className="card mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Cancel Shipment</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Permitted only while parcel is in CREATED status before driver pickup.
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleStatusTransition('CANCELLED')}
            disabled={actionLoading}
          >
            Cancel Dispatch
          </button>
        </div>
      )}

      {/* Shipment Details 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Origin & Destination */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Routing Locations</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origin</div>
            <div style={{ fontWeight: 600 }}>{shipment.senderDetails?.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {shipment.senderDetails?.address}, {shipment.senderDetails?.city} {shipment.senderDetails?.postalCode}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tel: {shipment.senderDetails?.phone}</div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination</div>
            <div style={{ fontWeight: 600 }}>{shipment.receiverDetails?.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {shipment.receiverDetails?.address}, {shipment.receiverDetails?.city} {shipment.receiverDetails?.postalCode}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tel: {shipment.receiverDetails?.phone}</div>
          </div>
        </div>

        {/* Package & Operational Specs */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Package Specifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Weight</span>
              <strong>{shipment.packageDetails?.weightKg} kg</strong>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Declared Value</span>
              <strong>₹ {shipment.packageDetails?.declaredValue || 0}</strong>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Fragile Goods</span>
              <strong>{shipment.packageDetails?.isFragile ? '⚠️ Yes' : 'No'}</strong>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Assigned Driver</span>
              <strong style={{ color: shipment.assignedDriver ? '#60a5fa' : 'var(--text-muted)' }}>
                {shipment.assignedDriver ? shipment.assignedDriver.name : 'Pending Assignment'}
              </strong>
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Description</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {shipment.packageDetails?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Status History & Audit Log */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Cryptographic Lifecycle Audit Log
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transition Status</th>
                <th>Operator Role</th>
                <th>Location</th>
                <th>Audit Note</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {shipment.statusHistory?.map((h, i) => (
                <tr key={i}>
                  <td>
                    <StatusBadge status={h.status} />
                  </td>
                  <td>
                    <span className="text-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                      {h.changedByRole}
                    </span>
                  </td>
                  <td>{h.location || '—'}</td>
                  <td>{h.note || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(h.timestamp).toLocaleString()}
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
