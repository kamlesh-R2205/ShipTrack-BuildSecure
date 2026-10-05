import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SecurityBanner } from '../components/SecurityBanner';

export function AdminDashboard({ onNavigate, onSelectShipment, initialTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [metrics, setMetrics] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Assign Driver Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, shipRes, driverRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getShipments({ limit: 100 }),
        api.getDriverList(),
      ]);
      setMetrics(dashRes.metrics);
      setShipments(shipRes.shipments || []);
      setDrivers(driverRes.drivers || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrative console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers({ limit: 100 });
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await api.getAuditLogs({ limit: 100 });
      setAuditLogs(res.logs || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'security') loadAuditLogs();
  }, [activeTab]);

  const openAssignModal = (shipment) => {
    setSelectedShipment(shipment);
    setSelectedDriverId(shipment.assignedDriver?._id || '');
    setAssignmentNote('');
    setAssignModalOpen(true);
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) return;

    setAssigning(true);
    setActionMessage('');
    setError('');

    try {
      const res = await api.assignDriver({
        shipmentId: selectedShipment._id,
        driverId: selectedDriverId,
        note: assignmentNote,
      });
      setActionMessage(`✓ ${res.message}`);
      setAssignModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to assign driver.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="content-body">
      <SecurityBanner />

      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Logistics & Security Command</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            System-wide operational controls, driver dispatch, and server telemetry
          </p>
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

      {/* Global Administrative Metrics */}
      <div className="grid-stats">
        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Total Shipments</span>
            <div className="stat-icon">📦</div>
          </div>
          <div className="stat-value">{loading ? '...' : metrics?.totalShipments || 0}</div>
          <div className="stat-subtext">All dispatches registered</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Active In Transit</span>
            <div className="stat-icon">🚚</div>
          </div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>{loading ? '...' : metrics?.activeShipments || 0}</div>
          <div className="stat-subtext">Pipeline in motion</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Unassigned Parcels</span>
            <div className="stat-icon">⚠️</div>
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{loading ? '...' : metrics?.pendingAssignments || 0}</div>
          <div className="stat-subtext">Awaiting driver assignment</div>
        </div>

        <div className="card card-hover">
          <div className="stat-header">
            <span className="stat-label">Active Drivers</span>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>{loading ? '...' : metrics?.activeDrivers || 0}</div>
          <div className="stat-subtext">Fleet personnel online</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card mb-6" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          Shipment Registry & Dispatch ({shipments.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          User & Fleet Directory
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security Audit Logs
        </button>
      </div>

      {/* Tab 1: Shipment Registry & Dispatch */}
      {activeTab === 'overview' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Sender</th>
                  <th>Recipient & Destination</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id}>
                    <td className="text-mono" style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                      {s.trackingNumber}
                    </td>
                    <td>{s.sender?.name || s.senderDetails?.name}</td>
                    <td>
                      <div>{s.receiverDetails?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {s.receiverDetails?.city}, {s.receiverDetails?.postalCode}
                      </div>
                    </td>
                    <td>
                      {s.assignedDriver ? (
                        <span style={{ color: '#60a5fa', fontWeight: 500 }}>
                          {s.assignedDriver.name}
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                          ⚠️ Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            onSelectShipment(s._id);
                            onNavigate('shipment-details');
                          }}
                        >
                          View
                        </button>
                        {s.status !== 'DELIVERED' && s.status !== 'CANCELLED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openAssignModal(s)}
                          >
                            {s.assignedDriver ? 'Reassign' : 'Assign'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: User Directory */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Failed Logins</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td className="text-mono">{u.email}</td>
                    <td>
                      <span className={`role-tag ${u.role.toLowerCase()}`}>{u.role}</span>
                    </td>
                    <td>{u.phone || '—'}</td>
                    <td style={{ color: u.failedLoginAttempts > 0 ? '#f87171' : 'var(--text-muted)' }}>
                      {u.failedLoginAttempts || 0}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Audit Logs */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(30, 41, 59, 0.4)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
              Authentic Security Telemetry & Access Control Logs
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time audit log of access events, blocked BOLA/IDOR attempts, and invalid lifecycle jumps.
            </p>
          </div>
          {auditLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No security anomalies or access violations recorded yet.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event Type</th>
                    <th>Severity</th>
                    <th>User / Role</th>
                    <th>Resource Target</th>
                    <th>Action</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="text-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: log.eventType.includes('FORBIDDEN') || log.eventType.includes('INVALID') ? '#f87171' : '#60a5fa' }}>
                        {log.eventType}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: log.severity === 'HIGH' || log.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: log.severity === 'HIGH' ? '#f87171' : 'var(--text-secondary)' }}>
                          {log.severity}
                        </span>
                      </td>
                      <td>
                        <div>{log.userId?.name || 'Anonymous'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.userRole}</div>
                      </td>
                      <td className="text-mono" style={{ fontSize: '0.8rem' }}>{log.resource}</td>
                      <td className="text-mono" style={{ fontSize: '0.8rem' }}>{log.action}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Driver Assignment Modal */}
      {assignModalOpen && selectedShipment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Assign Driver Dispatch
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Assign an authorized fleet courier to parcel{' '}
              <strong className="text-mono" style={{ color: 'var(--accent-blue)' }}>
                {selectedShipment.trackingNumber}
              </strong>
            </p>

            <form onSubmit={handleAssignDriver}>
              <div className="form-group">
                <label className="form-label">Select Active Fleet Driver</label>
                <select
                  className="form-select"
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dispatch Instructions / Note</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Assigned to express morning route"
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={assigning}>
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
