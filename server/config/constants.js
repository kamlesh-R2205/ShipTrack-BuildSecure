const ROLES = {
  CUSTOMER: 'CUSTOMER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
};

const SHIPMENT_STATUS = {
  CREATED: 'CREATED',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// Strict Finite State Machine transition rules
const ALLOWED_TRANSITIONS = {
  [SHIPMENT_STATUS.CREATED]: [SHIPMENT_STATUS.ASSIGNED, SHIPMENT_STATUS.CANCELLED],
  [SHIPMENT_STATUS.ASSIGNED]: [SHIPMENT_STATUS.PICKED_UP, SHIPMENT_STATUS.CANCELLED],
  [SHIPMENT_STATUS.PICKED_UP]: [SHIPMENT_STATUS.IN_TRANSIT],
  [SHIPMENT_STATUS.IN_TRANSIT]: [SHIPMENT_STATUS.OUT_FOR_DELIVERY],
  [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: [SHIPMENT_STATUS.DELIVERED],
  [SHIPMENT_STATUS.DELIVERED]: [],
  [SHIPMENT_STATUS.CANCELLED]: [],
};

// Permissions required for specific status transitions
const STATUS_TRANSITION_PERMISSIONS = {
  [SHIPMENT_STATUS.ASSIGNED]: [ROLES.ADMIN],
  [SHIPMENT_STATUS.CANCELLED]: [ROLES.ADMIN, ROLES.CUSTOMER],
  [SHIPMENT_STATUS.PICKED_UP]: [ROLES.DRIVER, ROLES.ADMIN],
  [SHIPMENT_STATUS.IN_TRANSIT]: [ROLES.DRIVER, ROLES.ADMIN],
  [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: [ROLES.DRIVER, ROLES.ADMIN],
  [SHIPMENT_STATUS.DELIVERED]: [ROLES.DRIVER, ROLES.ADMIN],
};

// ShipTrack Guard Security Event Types
const SECURITY_EVENT_TYPES = {
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  BOLA_ATTEMPT: 'BOLA_ATTEMPT',
  PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
  WORKFLOW_VIOLATION: 'WORKFLOW_VIOLATION',
  MASS_ASSIGNMENT_ATTEMPT: 'MASS_ASSIGNMENT_ATTEMPT',
  ENUMERATION_DETECTED: 'ENUMERATION_DETECTED',
  LOCATION_ANOMALY: 'LOCATION_ANOMALY',
  IMPOSSIBLE_MOVEMENT: 'IMPOSSIBLE_MOVEMENT',
  HONEYPOT_TRIGGER: 'HONEYPOT_TRIGGER',
  TRUST_DEGRADATION: 'TRUST_DEGRADATION',
  ACCOUNT_ANOMALY: 'ACCOUNT_ANOMALY',
  POLICY_BLOCK: 'POLICY_BLOCK',
  POLICY_ALLOW: 'POLICY_ALLOW',
};

// Guard Decision States
const GUARD_DECISIONS = {
  ALLOW: 'ALLOW',
  MONITOR: 'MONITOR',
  STEP_UP: 'STEP_UP',
  BLOCK: 'BLOCK',
};

// Security Incident Severity
const INCIDENT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

// Security Incident Status
const INCIDENT_STATUS = {
  OPEN: 'OPEN',
  INVESTIGATING: 'INVESTIGATING',
  CONTAINED: 'CONTAINED',
  RESOLVED: 'RESOLVED',
};

// Reality Engine Physical Limits
const REALITY_LIMITS = {
  MAX_SPEED_KMH: 120, // Ground commercial delivery vehicle limit
  MAX_INSTANT_JUMP_KM: 5, // Instantaneous GPS fluctuation threshold
  MIN_TIME_WINDOW_MINS: 2, // Minimum time interval to evaluate speed
  CONFIDENCE_THRESHOLD: 65, // Location trust score acceptable limit
};

// Standard Honeypot Identifiers
const HONEYPOT_IDS = ['SHP-HNY-001', 'SHP-HNY-002', 'SHP-HNY-003'];

// Predefined Security Policies
const DEFAULT_POLICIES = [
  {
    policyId: 'POL-001',
    name: 'DRIVER_ASSIGNMENT_REQUIRED',
    category: 'RESOURCE_SECURITY',
    status: 'ENFORCING',
    severity: INCIDENT_SEVERITY.HIGH,
    description: 'Drivers can only access or modify shipments formally assigned to their fleet ID.',
    trigger: 'Driver requests /api/shipments/:id where assignedDriver != driverId',
    responseAction: 'BLOCK_REQUEST_AND_AUDIT',
  },
  {
    policyId: 'POL-002',
    name: 'RESOURCE_OWNER_REQUIRED',
    category: 'IDENTITY_SECURITY',
    status: 'ENFORCING',
    severity: INCIDENT_SEVERITY.HIGH,
    description: 'Customers can only query, track, or cancel parcels originated by their account.',
    trigger: 'Customer requests /api/shipments/:id where sender != customerId',
    responseAction: 'BLOCK_AND_DECAY_TRUST',
  },
  {
    policyId: 'POL-003',
    name: 'VALID_WORKFLOW_TRANSITION',
    category: 'WORKFLOW_SECURITY',
    status: 'ENFORCING',
    severity: INCIDENT_SEVERITY.HIGH,
    description: 'Enforces strict unidirectional status progression according to the logistics FSM.',
    trigger: 'Status transition not found in FSM graph (e.g. ASSIGNED -> DELIVERED directly)',
    responseAction: 'BLOCK_AND_TRIGGER_FSM_ALERT',
  },
  {
    policyId: 'POL-004',
    name: 'DELIVERY_LOCATION_REQUIRED',
    category: 'REALITY_SECURITY',
    status: 'ENFORCING',
    severity: INCIDENT_SEVERITY.HIGH,
    description: 'Driver must be physically verified within delivery geofence when marking DELIVERED.',
    trigger: 'Status changed to DELIVERED when location trust score < 60',
    responseAction: 'REQUIRE_STEP_UP_VERIFICATION',
  },
  {
    policyId: 'POL-005',
    name: 'IMPOSSIBLE_MOVEMENT_DETECTION',
    category: 'REALITY_SECURITY',
    status: 'ENFORCING',
    severity: INCIDENT_SEVERITY.CRITICAL,
    description: 'Calculates physical speed between subsequent checkpoints. Flags supersonic or unphysical telemetry.',
    trigger: 'Calculated speed > 120 km/h or impossible travel time between hubs',
    responseAction: 'BLOCK_OPERATION_AND_CREATE_INCIDENT',
  },
  {
    policyId: 'POL-006',
    name: 'HONEYPOT_ACCESS_BLOCK',
    category: 'HONEYPOT_SECURITY',
    status: 'ENFORCING',
    severity: INCIDENT_SEVERITY.CRITICAL,
    description: 'Instantly alerts on any query to decoy shipment numbers (e.g. SHP-HNY-001).',
    trigger: 'Any request targeting honeypot shipment identifiers',
    responseAction: 'ISOLATE_ACTOR_AND_DISPATCH_INCIDENT',
  },
  {
    policyId: 'POL-007',
    name: 'ENUMERATION_THRESHOLD',
    category: 'BEHAVIORAL_SECURITY',
    status: 'ENFORCING',
    severity: INCIDENT_SEVERITY.HIGH,
    description: 'Detects rapid sequential probing of shipment IDs or unowned tracking numbers.',
    trigger: '> 5 unauthorized or invalid resource probes within 60 seconds',
    responseAction: 'RATE_LIMIT_AND_INCREASE_RISK',
  },
  {
    policyId: 'POL-008',
    name: 'SENSITIVE_ACTION_TRUST_THRESHOLD',
    category: 'ADAPTIVE_TRUST',
    status: 'ENFORCING',
    severity: INCIDENT_SEVERITY.MEDIUM,
    description: 'Degrades actor trust upon suspicious actions; blocks high-privilege operations if trust < 40.',
    trigger: 'Actor trust score falls below operational threshold',
    responseAction: 'RESTRICT_SENSITIVE_ACTIONS',
  },
];

module.exports = {
  ROLES,
  SHIPMENT_STATUS,
  ALLOWED_TRANSITIONS,
  STATUS_TRANSITION_PERMISSIONS,
  SECURITY_EVENT_TYPES,
  GUARD_DECISIONS,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  REALITY_LIMITS,
  HONEYPOT_IDS,
  DEFAULT_POLICIES,
};
