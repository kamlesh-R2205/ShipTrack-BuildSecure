// Determine API Base URL:
// 1. If VITE_API_URL is provided in environment variables, use it.
// 2. Otherwise default to relative '/api' (handled by Vite proxy in dev, or same-origin in production).
const rawBase = import.meta.env?.VITE_API_URL || '/api';
const API_BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

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

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (netErr) {
    // Resilient fallback for local development if Vite proxy is bypassed or inactive
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (API_BASE === '/api' && isLocalhost) {
      try {
        console.warn(`[API] Relative '${API_BASE}' unreachable. Retrying direct fallback 'http://localhost:5000/api${endpoint}'...`);
        response = await fetch(`http://localhost:5000/api${endpoint}`, config);
      } catch (fallbackErr) {
        throw new Error(
          'Network request failed: Could not connect to backend server at http://localhost:5000. Ensure the server is started with npm start.'
        );
      }
    } else {
      throw new Error(`Network request failed: ${netErr.message}`);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    throw new Error(`Server returned invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed.');
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

  // Shipments (Legacy & Core Operations)
  createShipment: (payload) => request('/shipments', { method: 'POST', body: payload }),
  getShipments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/shipments${query ? `?${query}` : ''}`);
  },
  getShipmentById: (id) => request(`/shipments/${id}`),
  updateShipmentStatus: (id, payload) =>
    request(`/shipments/${id}/status`, { method: 'PATCH', body: payload }),
  trackPublic: (trackingNumber) => request(`/shipments/tracking/${trackingNumber}`),

  // Drivers & Admin
  getDriverDashboard: () => request('/drivers/dashboard'),
  getDriverList: () => request('/drivers/list'),
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

  // ==========================================
  // SHIPTRACK GUARD CONTROL PLANE ENDPOINTS
  // ==========================================
  getGuardOverview: () => request('/guard/overview'),
  getThreatMonitor: () => request('/guard/threat-monitor'),
  getFlightRecorder: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/guard/flight-recorder${query ? `?${query}` : ''}`);
  },
  getRealityEngine: () => request('/guard/reality-engine'),
  evaluateReality: (payload) =>
    request('/guard/reality-engine/evaluate', { method: 'POST', body: payload }),
  getIncidents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/guard/incidents${query ? `?${query}` : ''}`);
  },
  getIncidentById: (id) => request(`/guard/incidents/${id}`),
  updateIncidentStatus: (id, payload) =>
    request(`/guard/incidents/${id}/status`, { method: 'PATCH', body: payload }),
  executeIncidentAction: (id, payload) =>
    request(`/guard/incidents/${id}/actions`, { method: 'POST', body: payload }),
  getPolicies: () => request('/guard/policies'),
  updatePolicyStatus: (id, payload) =>
    request(`/guard/policies/${id}`, { method: 'PATCH', body: payload }),
  getSecurityGraph: () => request('/guard/security-graph'),
  getRiskEngine: () => request('/guard/risk-engine'),
  getShipmentDNA: (id) => request(`/guard/shipment-dna/${id}`),
  getAttackScenarios: () => request('/guard/attack-simulator/scenarios'),
  runAttackSimulation: (scenarioId) =>
    request('/guard/attack-simulator/run', { method: 'POST', body: { scenarioId } }),
  globalSearch: (q) => request(`/guard/search?q=${encodeURIComponent(q)}`),
  getTrustProfiles: () => request('/guard/trust-profiles'),
};
