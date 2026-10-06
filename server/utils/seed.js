require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const SecurityLog = require('../models/SecurityLog');
const SecurityIncident = require('../models/SecurityIncident');
const SecurityPolicy = require('../models/SecurityPolicy');
const { ROLES, SHIPMENT_STATUS, DEFAULT_POLICIES, INCIDENT_SEVERITY, INCIDENT_STATUS, HONEYPOT_IDS } = require('../config/constants');
const { generateTrackingNumber } = require('./trackingGenerator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shiptrack';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] Connected to MongoDB.');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Shipment.deleteMany({}),
      SecurityLog.deleteMany({}),
      SecurityIncident.deleteMany({}),
      SecurityPolicy.deleteMany({}),
    ]);
    console.log('[SEED] Cleared previous database collections.');

    // 1. Create Core Users with Adaptive Trust Profiles
    const admin = await User.create({
      name: 'Security Admin',
      email: 'admin@shiptrack.io',
      password: 'Admin@Secure2026!',
      role: ROLES.ADMIN,
      phone: '+91-9876543210',
      trustScore: 100,
      trustStatus: 'NORMAL',
      assignedHub: 'HYD-CENTRAL-01',
      lastKnownLocation: {
        lat: 17.385,
        lng: 78.4867,
        name: 'Hyderabad Central SOC',
        deviceId: 'SOC-CONSOLE-01',
      },
    });

    const driver1 = await User.create({
      name: 'Ravi Kumar (Express Fleet)',
      email: 'driver1@shiptrack.io',
      password: 'Driver1@Secure2026!',
      role: ROLES.DRIVER,
      phone: '+91-9876543211',
      trustScore: 88,
      trustStatus: 'NORMAL',
      assignedHub: 'HYD-CENTRAL-01',
      lastKnownLocation: {
        lat: 17.385,
        lng: 78.4867,
        name: 'Hyderabad Central Hub',
        deviceId: 'DEV-TEL-01',
      },
      trustHistory: [
        {
          timestamp: new Date(Date.now() - 86400000),
          delta: -12,
          newScore: 88,
          reason: 'Mild sensor GPS fluctuation in tunnel zone',
        },
      ],
    });

    const driver2 = await User.create({
      name: 'Anil Sharma (Cargo Fleet)',
      email: 'driver2@shiptrack.io',
      password: 'Driver2@Secure2026!',
      role: ROLES.DRIVER,
      phone: '+91-9876543212',
      trustScore: 42,
      trustStatus: 'STEP_UP',
      assignedHub: 'SUR-TRANSIT-02',
      lastKnownLocation: {
        lat: 17.1439,
        lng: 79.6239,
        name: 'Suryapet Transit Hub',
        deviceId: 'DEV-TEL-02',
      },
      trustHistory: [
        {
          timestamp: new Date(Date.now() - 3600000 * 5),
          delta: -25,
          newScore: 42,
          reason: 'Repeated unauthorized shipment query & cross-route scan',
        },
      ],
    });

    const customer1 = await User.create({
      name: 'Sneha Reddy',
      email: 'customer1@shiptrack.io',
      password: 'Customer1@Secure2026!',
      role: ROLES.CUSTOMER,
      phone: '+91-9876543213',
      trustScore: 95,
      trustStatus: 'NORMAL',
    });

    const customer2 = await User.create({
      name: 'Vikram Mehta (Compromised Persona)',
      email: 'customer2@shiptrack.io',
      password: 'Customer2@Secure2026!',
      role: ROLES.CUSTOMER,
      phone: '+91-9876543214',
      trustScore: 25,
      trustStatus: 'RESTRICTED',
      trustHistory: [
        {
          timestamp: new Date(Date.now() - 3600000 * 2),
          delta: -35,
          newScore: 25,
          reason: 'BOLA object-level traversal attack against Customer 1 orders',
        },
      ],
    });

    console.log('[SEED] Created 1 Admin, 2 Drivers, and 2 Customers with adaptive trust models.');

    // 2. Create Security Policies
    await SecurityPolicy.insertMany(DEFAULT_POLICIES);
    console.log('[SEED] Initialized 8 active ShipTrack Guard Security Policies.');

    // 3. Create Operational Shipments with Shipment DNA
    const shipment1 = await Shipment.create({
      trackingNumber: generateTrackingNumber(),
      sender: customer1._id,
      assignedDriver: driver1._id,
      senderDetails: {
        name: customer1.name,
        phone: customer1.phone,
        address: 'Plot 42, Hitec City',
        city: 'Hyderabad',
        postalCode: '500081',
      },
      receiverDetails: {
        name: 'Pooja Varma',
        phone: '+91-9123456780',
        address: 'B-104, Indiranagar',
        city: 'Bengaluru',
        postalCode: '560038',
      },
      packageDetails: {
        weightKg: 2.5,
        description: 'Encrypted Hardware Security Module (HSM)',
        isFragile: true,
        declaredValue: 45000,
        dimensions: { lengthCm: 25, widthCm: 15, heightCm: 10 },
      },
      status: SHIPMENT_STATUS.ASSIGNED,
      statusHistory: [
        {
          status: SHIPMENT_STATUS.CREATED,
          changedBy: customer1._id,
          changedByRole: ROLES.CUSTOMER,
          timestamp: new Date(Date.now() - 3600000 * 4),
          note: 'Shipment created online by verified sender.',
          location: 'Hyderabad',
        },
        {
          status: SHIPMENT_STATUS.ASSIGNED,
          changedBy: admin._id,
          changedByRole: ROLES.ADMIN,
          timestamp: new Date(Date.now() - 3600000 * 2),
          note: `Dispatched to driver ${driver1.name}`,
          location: 'Hyderabad Central Hub',
        },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2),
      securityStatus: 'HEALTHY',
      riskScore: 12,
      dna: {
        expectedRoute: ['Hyderabad Central Hub', 'Kurnool Transit Hub', 'Bengaluru DC', 'Indiranagar Delivery Station'],
        actualRoute: [
          {
            checkpoint: 'ORIGIN_DISPATCH',
            timestamp: new Date(Date.now() - 3600000 * 2),
            location: 'Hyderabad Central Hub',
            lat: 17.385,
            lng: 78.4867,
            verified: true,
          },
        ],
        expectedTransitHours: 14,
        workflowDeviations: [],
        locationTrustScore: 96,
        deviceFingerprints: ['DEV-TEL-01'],
        accessLogsCount: 6,
      },
    });

    const shipment2 = await Shipment.create({
      trackingNumber: generateTrackingNumber(),
      sender: customer2._id,
      assignedDriver: null,
      senderDetails: {
        name: customer2.name,
        phone: customer2.phone,
        address: 'Flat 302, Jubilee Hills',
        city: 'Hyderabad',
        postalCode: '500033',
      },
      receiverDetails: {
        name: 'Arjun Das',
        phone: '+91-9234567890',
        address: 'Tower 4, Bandra Kurla Complex',
        city: 'Mumbai',
        postalCode: '400051',
      },
      packageDetails: {
        weightKg: 5.0,
        description: 'Industrial Rack Accessories',
        isFragile: false,
        declaredValue: 12000,
        dimensions: { lengthCm: 50, widthCm: 30, heightCm: 20 },
      },
      status: SHIPMENT_STATUS.CREATED,
      statusHistory: [
        {
          status: SHIPMENT_STATUS.CREATED,
          changedBy: customer2._id,
          changedByRole: ROLES.CUSTOMER,
          timestamp: new Date(Date.now() - 3600000 * 1),
          note: 'Awaiting hub dispatch.',
          location: 'Hyderabad',
        },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 3),
      securityStatus: 'SUSPICIOUS',
      riskScore: 48,
      dna: {
        expectedRoute: ['Hyderabad Central Hub', 'Solapur Station', 'Pune Hub', 'Mumbai BKC Delivery Station'],
        actualRoute: [],
        expectedTransitHours: 18,
        workflowDeviations: [],
        locationTrustScore: 78,
        deviceFingerprints: ['WEB-CHROME-UNTRUSTED'],
        accessLogsCount: 22,
      },
    });

    const shipment3 = await Shipment.create({
      trackingNumber: generateTrackingNumber(),
      sender: customer1._id,
      assignedDriver: driver2._id,
      senderDetails: {
        name: customer1.name,
        phone: customer1.phone,
        address: 'Gachibowli Tech Enclave',
        city: 'Hyderabad',
        postalCode: '500032',
      },
      receiverDetails: {
        name: 'Kavita Nair',
        phone: '+91-9345678901',
        address: 'MG Road',
        city: 'Vijayawada',
        postalCode: '520010',
      },
      packageDetails: {
        weightKg: 1.2,
        description: 'Biometric Smart Cards',
        isFragile: true,
        declaredValue: 25000,
      },
      status: SHIPMENT_STATUS.IN_TRANSIT,
      statusHistory: [
        {
          status: SHIPMENT_STATUS.CREATED,
          changedBy: customer1._id,
          changedByRole: ROLES.CUSTOMER,
          timestamp: new Date(Date.now() - 86400000 * 2),
          note: 'Created by sender',
          location: 'Hyderabad',
        },
        {
          status: SHIPMENT_STATUS.ASSIGNED,
          changedBy: admin._id,
          changedByRole: ROLES.ADMIN,
          timestamp: new Date(Date.now() - 86400000),
          note: 'Assigned to driver 2',
          location: 'Dispatch Hub',
        },
        {
          status: SHIPMENT_STATUS.PICKED_UP,
          changedBy: driver2._id,
          changedByRole: ROLES.DRIVER,
          timestamp: new Date(Date.now() - 3600000 * 12),
          note: 'Picked up from sender facility',
          location: 'Hyderabad Central Hub',
        },
        {
          status: SHIPMENT_STATUS.IN_TRANSIT,
          changedBy: driver2._id,
          changedByRole: ROLES.DRIVER,
          timestamp: new Date(Date.now() - 3600000 * 6),
          note: 'En route along NH65 corridor',
          location: 'Suryapet Transit Hub',
        },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 86400000),
      securityStatus: 'HIGH_RISK',
      riskScore: 78,
      dna: {
        expectedRoute: ['Hyderabad Central Hub', 'Suryapet Transit Hub', 'Vijayawada DC', 'MG Road Delivery Station'],
        actualRoute: [
          { checkpoint: 'PICKUP', timestamp: new Date(Date.now() - 3600000 * 12), location: 'Hyderabad Central Hub', lat: 17.385, lng: 78.4867, verified: true },
          { checkpoint: 'TRANSIT_CHECK', timestamp: new Date(Date.now() - 3600000 * 6), location: 'Suryapet Transit Hub', lat: 17.1439, lng: 79.6239, verified: true },
        ],
        expectedTransitHours: 6,
        workflowDeviations: [
          {
            type: 'GPS_ANOMALY',
            detectedAt: new Date(Date.now() - 3600000 * 1),
            expected: 'Suryapet corridor (NH65)',
            actual: 'Warangal off-route deviation (95 km jump in 8 mins)',
            severity: 'HIGH',
          },
        ],
        locationTrustScore: 38,
        deviceFingerprints: ['DEV-TEL-02', 'EMULATOR-DEV-MOCK'],
        accessLogsCount: 45,
      },
    });

    // 4. Create Honeypot Decoy Shipments
    const honeypot1 = await Shipment.create({
      trackingNumber: HONEYPOT_IDS[0],
      sender: admin._id,
      assignedDriver: null,
      senderDetails: {
        name: 'Ministry of Defence Procurement (DECOY)',
        phone: '+91-9999900001',
        address: 'South Block, Central Secretariat',
        city: 'New Delhi',
        postalCode: '110011',
      },
      receiverDetails: {
        name: 'Strategic Tech Reserve (DECOY)',
        phone: '+91-9999900002',
        address: 'High Security Enclave',
        city: 'Hyderabad',
        postalCode: '500001',
      },
      packageDetails: {
        weightKg: 10.0,
        description: 'DECOY HONEYPOT: High-Value Cryptographic Hardware',
        isFragile: true,
        declaredValue: 1500000,
      },
      status: SHIPMENT_STATUS.CREATED,
      isHoneypot: true,
      securityStatus: 'CRITICAL',
      riskScore: 100,
      dna: {
        expectedRoute: ['DO_NOT_DISPATCH', 'DECOY_CATALOG_TRAP'],
        actualRoute: [],
        expectedTransitHours: 0,
        workflowDeviations: [{ type: 'HONEYPOT_CATALOG_TRAP', detectedAt: new Date(), expected: 'NEVER_QUERIED', actual: 'PROBED_BY_ADVERSARY', severity: 'CRITICAL' }],
        locationTrustScore: 0,
        deviceFingerprints: ['RECON-SCANNER-01'],
        accessLogsCount: 14,
      },
    });

    console.log(`[SEED] Created 3 active shipments + 1 Decoy Honeypot (${HONEYPOT_IDS[0]}).`);

    // 5. Seed Realistic Flight Recorder Logs
    await SecurityLog.create([
      {
        eventType: 'BOLA_ATTEMPT',
        severity: 'HIGH',
        userId: customer2._id,
        actorName: customer2.name,
        actorEmail: customer2.email,
        userRole: customer2.role,
        resource: `/api/shipments/${shipment1._id}`,
        action: 'GET_SHIPMENT_DETAILS',
        decision: 'BLOCK',
        riskScore: 88,
        reasons: [
          '+35 Resource ownership mismatch (BOLA / IDOR cross-tenant access violation)',
          '+25 Probing foreign customer asset without authorization',
          '+15 Degraded actor trust score (25/100)',
        ],
        policiesTriggered: ['RESOURCE_OWNER_REQUIRED', 'SENSITIVE_ACTION_TRUST_THRESHOLD'],
        shipmentId: shipment1._id,
        trackingNumber: shipment1.trackingNumber,
        ipAddress: '198.51.100.77',
        userAgent: 'PostmanRuntime/7.32.3',
        trustImpact: { previousTrust: 40, newTrust: 25, delta: -15 },
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        eventType: 'IMPOSSIBLE_MOVEMENT',
        severity: 'CRITICAL',
        userId: driver2._id,
        actorName: driver2.name,
        actorEmail: driver2.email,
        userRole: driver2.role,
        resource: `/api/shipments/${shipment3._id}/status`,
        action: 'UPDATE_STATUS_TO_DELIVERED',
        decision: 'BLOCK',
        riskScore: 92,
        reasons: [
          '+25 Reality anomaly: calculated speed 4,125 km/h (275 km in 4 mins)',
          '+20 Driver location inconsistent with delivery destination geofence',
          '+25 Low location trust score (38/100)',
        ],
        policiesTriggered: ['IMPOSSIBLE_MOVEMENT_DETECTION', 'DELIVERY_LOCATION_REQUIRED'],
        shipmentId: shipment3._id,
        trackingNumber: shipment3.trackingNumber,
        previousState: 'IN_TRANSIT',
        requestedState: 'DELIVERED',
        locationData: {
          lat: 16.5062,
          lng: 80.648,
          hub: 'Vijayawada DC',
          distanceKm: 275,
          speedKmH: 4125,
          confidenceScore: 38,
        },
        ipAddress: '203.0.113.19',
        trustImpact: { previousTrust: 62, newTrust: 42, delta: -20 },
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        eventType: 'HONEYPOT_TRIGGER',
        severity: 'CRITICAL',
        userId: customer2._id,
        actorName: customer2.name,
        actorEmail: customer2.email,
        userRole: customer2.role,
        resource: `/api/shipments/${HONEYPOT_IDS[0]}`,
        action: 'GET_HONEYPOT_SHIPMENT',
        decision: 'BLOCK',
        riskScore: 98,
        reasons: [
          '+50 Honeypot decoy resource accessed (unauthorized enumeration probe)',
          '+25 Reconnaissance anomaly: zero operational justification',
          '+20 Zero-trust breach',
        ],
        policiesTriggered: ['HONEYPOT_ACCESS_BLOCK'],
        shipmentId: honeypot1._id,
        trackingNumber: HONEYPOT_IDS[0],
        ipAddress: '198.51.100.77',
        trustImpact: { previousTrust: 25, newTrust: 10, delta: -15 },
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        eventType: 'AUTH_SUCCESS',
        severity: 'INFO',
        userId: admin._id,
        actorName: admin.name,
        actorEmail: admin.email,
        userRole: admin.role,
        resource: '/api/admin/metrics',
        action: 'INSPECT_SECURITY_POSTURE',
        decision: 'ALLOW',
        riskScore: 5,
        reasons: ['All identity, role, and MFA verification checks passed.'],
        policiesTriggered: [],
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 600000),
      },
    ]);

    // 6. Seed Realistic Security Incident with Attack Chain
    await SecurityIncident.create({
      incidentId: 'INC-2026-0001',
      title: 'Decoy Honeypot Reconnaissance & Lateral Traversal',
      severity: INCIDENT_SEVERITY.CRITICAL,
      threatType: 'HONEYPOT_BREACH',
      status: INCIDENT_STATUS.OPEN,
      actor: {
        userId: customer2._id,
        name: customer2.name,
        email: customer2.email,
        role: customer2.role,
        ipAddress: '198.51.100.77',
      },
      affectedShipment: {
        shipmentId: honeypot1._id,
        trackingNumber: HONEYPOT_IDS[0],
      },
      attackChain: [
        {
          step: 1,
          title: 'Sequential ID Enumeration Probe',
          eventType: 'ENUMERATION_DETECTED',
          timestamp: new Date(Date.now() - 3600000 * 3),
          evidence: { probeRange: 'SHP-2000 through SHP-2050', rate: '22 reqs/min' },
        },
        {
          step: 2,
          title: 'BOLA Cross-Tenant Data Access Attempt',
          eventType: 'BOLA_ATTEMPT',
          timestamp: new Date(Date.now() - 3600000 * 2),
          evidence: { targetShipment: shipment1.trackingNumber, violation: 'Foreign customer ID' },
        },
        {
          step: 3,
          title: 'Decoy Honeypot Trap Triggered',
          eventType: 'HONEYPOT_TRIGGER',
          timestamp: new Date(Date.now() - 1800000),
          evidence: { honeypotId: HONEYPOT_IDS[0], riskScore: 98 },
        },
        {
          step: 4,
          title: 'Automatic Security Control Plane Lockdown',
          eventType: 'POLICY_BLOCK',
          timestamp: new Date(Date.now() - 1790000),
          evidence: { action: 'RESTRICT_ACTOR_AND_ISOLATE_SESSION', trustScore: 25 },
        },
      ],
      riskScore: 98,
      policiesViolated: ['HONEYPOT_ACCESS_BLOCK', 'RESOURCE_OWNER_REQUIRED', 'SENSITIVE_ACTION_TRUST_THRESHOLD'],
      recommendedAction: 'IMMEDIATELY_ISOLATE_ACTOR_AND_INVALIDATE_TOKENS',
      actionsTaken: [
        {
          action: 'AUTOMATIC_TRUST_DECAY',
          executedAt: new Date(Date.now() - 1790000),
          executedBy: 'SYSTEM_AUTOPILOT',
          note: 'Trust decayed to 25/100; flagged RESTRICTED.',
        },
      ],
      evidence: {
        reconIp: '198.51.100.77',
        honeypotId: HONEYPOT_IDS[0],
      },
    });

    console.log('[SEED] Seeded Flight Recorder logs and correlated Incident INC-2026-0001.');
    console.log('--- SAMPLE ACCOUNTS FOR SHIPTRACK GUARD ---');
    console.log('ADMIN:     admin@shiptrack.io     / Admin@Secure2026!');
    console.log('DRIVER 1:  driver1@shiptrack.io   / Driver1@Secure2026!');
    console.log('DRIVER 2:  driver2@shiptrack.io   / Driver2@Secure2026!');
    console.log('CUSTOMER 1: customer1@shiptrack.io / Customer1@Secure2026!');
    console.log('CUSTOMER 2: customer2@shiptrack.io / Customer2@Secure2026!');
    console.log('-------------------------------------------');

    await mongoose.disconnect();
    console.log('[SEED] Completed successfully.');
  } catch (err) {
    console.error('[SEED_ERROR]', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
