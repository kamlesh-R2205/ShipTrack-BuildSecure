const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('shiptrack_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Network request failed.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Shipments
  createShipment: (payload) => request('/shipments', { method: 'POST', body: payload }),
  getShipments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/shipments${query ? `?${query}` : ''}`);
  },
  getShipmentById: (id) => request(`/shipments/${id}`),
  updateShipmentStatus: (id, payload) =>
    request(`/shipments/${id}/status`, { method: 'PATCH', body: payload }),
  trackPublic: (trackingNumber) => request(`/shipments/tracking/${trackingNumber}`),

  // Drivers
  getDriverDashboard: () => request('/drivers/dashboard'),
  getDriverList: () => request('/drivers/list'),

  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  assignDriver: (payload) => request('/admin/assign', { method: 'POST', body: payload }),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  // Security telemetry
  getSecurityEvents: () => request('/security/events'),
  getHealth: () => request('/security/health'),
};
