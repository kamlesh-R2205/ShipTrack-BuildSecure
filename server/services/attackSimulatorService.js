const SecurityDecisionEngine = require('./securityDecisionEngine');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const { ROLES, SHIPMENT_STATUS, HONEYPOT_IDS } = require('../config/constants');

const ATTACK_SCENARIOS = [
  {
    id: 'BOLA_IDOR',
    name: 'BOLA / IDOR Cross-Customer Attack',
    category: 'RESOURCE_SECURITY',
    description: 'An authenticated customer alters the shipment ID in the URL to intercept another customer\'s parcel and confidential PII.',
    defaultActor: { name: 'Customer Priya (Attacker)', role: ROLES.CUSTOMER, email: 'customer2@shiptrack.io' },
    target: 'Shipment SHP-2048 (Owned by Customer Rahul)',
  },
  {
    id: 'PRIVILEGE_ESCALATION',
    name: 'Privilege Escalation via Role Injection',
    category: 'IDENTITY_SECURITY',
    description: 'A standard customer injects elevated role attributes into requests attempting to access dispatcher command centers.',
    defaultActor: { name: 'Untrusted Customer', role: ROLES.CUSTOMER, email: 'customer1@shiptrack.io' },
    target: 'Admin Command Center /api/admin/metrics',
  },
  {
    id: 'SHIPMENT_ENUMERATION',
    name: 'Automated Resource Enumeration & Probing',
    category: 'BEHAVIORAL_SECURITY',
    description: 'An adversary executes rapid sequential ID sweeps against the API searching for active shipments.',
    defaultActor: { name: 'Reconnaissance Bot', role: ROLES.CUSTOMER, email: 'bot-probe@darkmesh.io' },
    target: 'Consecutive /api/shipments/SHP-2001..2050',
  },
  {
    id: 'WORKFLOW_MANIPULATION',
    name: 'Workflow State Machine Bypass',
    category: 'WORKFLOW_SECURITY',
    description: 'A courier attempts an illegal status leap from ASSIGNED directly to DELIVERED without physical transit or pickup checkpoints.',
    defaultActor: { name: 'Driver Rajesh', role: ROLES.DRIVER, email: 'driver1@shiptrack.io' },
    target: 'FSM Bypass: ASSIGNED -> DELIVERED',
  },
  {
    id: 'MASS_ASSIGNMENT',
    name: 'Mass Assignment Field Injection',
    category: 'RESOURCE_SECURITY',
    description: 'Client submits unauthorized fields (assignedDriver, isHoneypot, securityStatus) in parcel creation payload.',
    defaultActor: { name: 'Malicious Sender', role: ROLES.CUSTOMER, email: 'customer2@shiptrack.io' },
    target: 'PUT /api/shipments/SHP-1001 with { assignedDriver, status }',
  },
  {
    id: 'GPS_INTEGRITY_ANOMALY',
    name: 'GPS Telemetry & Sensor Integrity Anomaly',
    category: 'REALITY_SECURITY',
    description: 'Courier submits mock provider coordinates with 0.001m accuracy and mismatched tower telemetry.',
    defaultActor: { name: 'Driver Suresh', role: ROLES.DRIVER, email: 'driver2@shiptrack.io' },
    target: 'Fake GPS Mock Provider Ingress',
  },
  {
    id: 'IMPOSSIBLE_MOVEMENT',
    name: 'Supersonic Impossible Movement',
    category: 'REALITY_SECURITY',
    description: 'Courier records pickup at Hyderabad Hub and marks delivery in Vijayawada (275 km) 4 minutes later (speed > 4000 km/h).',
    defaultActor: { name: 'Driver Rajesh', role: ROLES.DRIVER, email: 'driver1@shiptrack.io' },
    target: 'Hyderabad -> Vijayawada in 4 mins',
  },
  {
    id: 'SUSPICIOUS_ACCOUNT_ACTIVITY',
    name: 'Suspicious Account Activity & Brute Force',
    category: 'IDENTITY_SECURITY',
    description: 'Multiple failed password attempts followed by sudden API scraping from a new IP address.',
    defaultActor: { name: 'Compromised Driver Account', role: ROLES.DRIVER, email: 'driver1@shiptrack.io' },
    target: 'Credential stuffing attack followed by queue enumeration',
  },
  {
    id: 'UNAUTHORIZED_DRIVER_ACCESS',
    name: 'Cross-Driver Fleet Segregation Breach',
    category: 'RESOURCE_SECURITY',
    description: 'Driver A attempts to inspect or mark deliveries assigned exclusively to Driver B.',
    defaultActor: { name: 'Driver Suresh (Driver 2)', role: ROLES.DRIVER, email: 'driver2@shiptrack.io' },
    target: 'Driver 1 Route Package SHP-1002',
  },
  {
    id: 'HONEYPOT_SHIPMENT_ACCESS',
    name: 'Honeypot Decoy Shipment Trigger',
    category: 'HONEYPOT_SECURITY',
    description: 'An attacker attempts to query or track a decoy honeypot parcel (SHP-HNY-001) seeded to trap unauthorized enumeration.',
    defaultActor: { name: 'OSINT Crawler', role: ROLES.CUSTOMER, email: 'crawler@external-scanner.org' },
    target: 'Decoy Trap: SHP-HNY-001',
  },
];

class AttackSimulatorService {
  static getScenarios() {
    return ATTACK_SCENARIOS;
  }

  static async executeAttack(scenarioId, options = {}) {
    const scenario = ATTACK_SCENARIOS.find((s) => s.id === scenarioId) || ATTACK_SCENARIOS[0];

    // Find actual or mock models to ground the simulation
    let actor = null;
    let targetShipment = null;

    if (scenarioId === 'BOLA_IDOR') {
      // Find two customers and a shipment owned by customer 1
      const customers = await User.find({ role: ROLES.CUSTOMER });
      actor = customers[1] || { _id: '6ac37a012345678901234567', name: 'Customer Priya (Attacker)', role: ROLES.CUSTOMER, email: 'customer2@shiptrack.io', trustScore: 75 };
      targetShipment = await Shipment.findOne({ isHoneypot: false }).populate('sender');
      if (!targetShipment) {
        targetShipment = {
          _id: '6ac37b987654321098765432',
          trackingNumber: 'SHP-2048',
          sender: '6ac37a012345678901234599', // Different customer
          status: SHIPMENT_STATUS.IN_TRANSIT,
        };
      }
    } else if (scenarioId === 'IMPOSSIBLE_MOVEMENT') {
      actor = (await User.findOne({ role: ROLES.DRIVER })) || { _id: '6ac37drv1234567890123456', name: 'Driver Rajesh', role: ROLES.DRIVER, email: 'driver1@shiptrack.io', trustScore: 85 };
      targetShipment = await Shipment.findOne({ isHoneypot: false });
    } else if (scenarioId === 'HONEYPOT_SHIPMENT_ACCESS') {
      actor = (await User.findOne({ role: ROLES.CUSTOMER })) || { _id: '6ac37hny1234567890123456', name: 'OSINT Reconnaissance Bot', role: ROLES.CUSTOMER, email: 'probe@darkmesh.io', trustScore: 60 };
      targetShipment = await Shipment.findOne({ isHoneypot: true }) || {
        _id: '6ac37hny9999999999999999',
        trackingNumber: HONEYPOT_IDS[0],
        isHoneypot: true,
      };
    } else {
      actor = (await User.findOne({ role: scenario.defaultActor.role })) || scenario.defaultActor;
      targetShipment = await Shipment.findOne({ isHoneypot: false });
    }

    // Prepare evaluation payload
    const evalPayload = {
      actor,
      action: scenarioId,
      resource: `/api/shipments/${targetShipment?.trackingNumber || 'SHP-TARGET'}`,
      shipment: targetShipment,
      targetTrackingNumber: scenarioId === 'HONEYPOT_SHIPMENT_ACCESS' ? HONEYPOT_IDS[0] : targetShipment?.trackingNumber,
      forcedScenario: scenarioId,
      ipAddress: options.ipAddress || '198.51.100.42',
      userAgent: 'Mozilla/5.0 (Kali Linux; SecurityScanner/3.4)',
    };

    if (scenarioId === 'WORKFLOW_MANIPULATION') {
      evalPayload.currentState = SHIPMENT_STATUS.ASSIGNED;
      evalPayload.requestedState = SHIPMENT_STATUS.DELIVERED;
    }

    if (scenarioId === 'IMPOSSIBLE_MOVEMENT') {
      evalPayload.previousLocation = {
        lat: 17.385,
        lng: 78.4867,
        name: 'Hyderabad Central Hub',
        timestamp: new Date(Date.now() - 4 * 60000), // 4 minutes ago
      };
      evalPayload.location = {
        lat: 16.5062,
        lng: 80.648,
        name: 'Vijayawada DC',
        timestamp: new Date(),
      };
      evalPayload.requestedState = SHIPMENT_STATUS.DELIVERED;
    }

    if (scenarioId === 'SHIPMENT_ENUMERATION') {
      evalPayload.probingCount = 18;
    }

    // Run through central Security Decision Engine
    const decisionResult = await SecurityDecisionEngine.evaluate(evalPayload);

    // Structure the Explainable Decision Pipeline
    const pipelineSteps = [
      {
        step: 1,
        phase: 'REQUEST_INGRESS',
        status: 'PASSED',
        detail: `Ingress request received: ${evalPayload.action} on ${evalPayload.resource}`,
        meta: { ip: evalPayload.ipAddress, agent: evalPayload.userAgent },
      },
      {
        step: 2,
        phase: 'IDENTITY_SECURITY',
        status: actor ? 'PASSED' : 'ANONYMOUS',
        detail: `Actor authenticated as ${actor?.name || 'Anonymous'} (${actor?.role || 'NONE'}), Trust: ${actor?.trustScore || 100}/100`,
        meta: { email: actor?.email, trustStatus: actor?.trustStatus || 'NORMAL' },
      },
      {
        step: 3,
        phase: 'RESOURCE_SECURITY',
        status: scenarioId === 'BOLA_IDOR' || scenarioId === 'HONEYPOT_SHIPMENT_ACCESS' || scenarioId === 'UNAUTHORIZED_DRIVER_ACCESS' ? 'FAILED' : 'PASSED',
        detail: scenarioId === 'HONEYPOT_SHIPMENT_ACCESS'
          ? 'TRAP TRIGGERED: Decoy honeypot shipment queried'
          : scenarioId === 'BOLA_IDOR'
          ? 'BOLA ALERT: Requester does not own requested parcel ID'
          : 'Resource exists in active catalog',
        meta: { resource: evalPayload.resource },
      },
      {
        step: 4,
        phase: 'RELATIONSHIP_SECURITY',
        status: scenarioId === 'UNAUTHORIZED_DRIVER_ACCESS' || scenarioId === 'BOLA_IDOR' ? 'FAILED' : 'PASSED',
        detail: scenarioId === 'UNAUTHORIZED_DRIVER_ACCESS'
          ? 'Cross-driver relationship mismatch: courier is not assigned to parcel'
          : 'Tenant relationship checked',
      },
      {
        step: 5,
        phase: 'WORKFLOW_SECURITY',
        status: scenarioId === 'WORKFLOW_MANIPULATION' ? 'FAILED' : 'PASSED',
        detail: scenarioId === 'WORKFLOW_MANIPULATION'
          ? 'FSM State Violation: Illegal transition from ASSIGNED to DELIVERED'
          : 'FSM progression rules compliant',
      },
      {
        step: 6,
        phase: 'REALITY_SECURITY',
        status: scenarioId === 'IMPOSSIBLE_MOVEMENT' || scenarioId === 'GPS_INTEGRITY_ANOMALY' ? 'FAILED' : 'PASSED',
        detail: scenarioId === 'IMPOSSIBLE_MOVEMENT'
          ? 'IMPOSSIBLE MOVEMENT: 275 km traversed in 4 mins (speed: 4,125 km/h)'
          : 'Spatial geofence and velocity realistic',
      },
      {
        step: 7,
        phase: 'BEHAVIORAL_SECURITY',
        status: scenarioId === 'SHIPMENT_ENUMERATION' ? 'FAILED' : 'PASSED',
        detail: scenarioId === 'SHIPMENT_ENUMERATION'
          ? 'Scanning pattern: 18 consecutive lookup probes in 60 seconds'
          : 'Request cadence within normal distribution',
      },
      {
        step: 8,
        phase: 'RISK_ENGINE',
        status: decisionResult.riskScore >= 60 ? 'HIGH_RISK' : 'MODERATE_RISK',
        detail: `Aggregated Explainable Risk Score: ${decisionResult.riskScore}/100`,
        meta: { reasons: decisionResult.reasons },
      },
      {
        step: 9,
        phase: 'CONTROL_DECISION',
        status: decisionResult.decision,
        detail: `Decision: ${decisionResult.decision}. Policies Triggered: [${decisionResult.policiesTriggered.join(', ')}]`,
        meta: {
          flightRecorderId: decisionResult.flightRecorderId,
          incidentId: decisionResult.incidentId,
          trustImpact: decisionResult.trustImpact,
        },
      },
    ];

    return {
      scenario,
      actor: {
        id: actor?._id,
        name: actor?.name,
        role: actor?.role,
        email: actor?.email,
        trustScore: actor?.trustScore,
      },
      decision: decisionResult.decision,
      riskScore: decisionResult.riskScore,
      reasons: decisionResult.reasons,
      policiesTriggered: decisionResult.policiesTriggered,
      trustImpact: decisionResult.trustImpact,
      flightRecorderId: decisionResult.flightRecorderId,
      incidentId: decisionResult.incidentId,
      pipelineSteps,
      executedAt: new Date(),
    };
  }
}

module.exports = AttackSimulatorService;
