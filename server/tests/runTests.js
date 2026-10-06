/**
 * ShipTrack Automated Core & Defensive Security Verification Suite
 * Tests:
 * 1. Authentication (Register, Login, Bad Login, Protected Route)
 * 2. Customer Isolation & BOLA/IDOR Defense (Customer A cannot access Customer B's shipment)
 * 3. Driver Segregation (Driver 1 cannot operate on Driver 2's delivery queue)
 * 4. Role-Based Access Control (Driver/Customer cannot call Admin routes)
 * 5. Finite State Machine Lifecycle (Valid transitions work, invalid jumps rejected)
 * 6. Input Validation (Malformed bodies, invalid ObjectIds, role escalation blocked)
 */

const http = require('http');
const mongoose = require('mongoose');
const { app, connectDatabase } = require('../index');
const { seedDatabase } = require('../utils/seed');

let server;
let baseUrl;

// Test state tokens and IDs
let adminToken = '';
let customer1Token = '';
let customer2Token = '';
let driver1Token = '';
let driver2Token = '';

let customer1ShipmentId = '';
let customer2ShipmentId = '';

let passedTests = 0;
let failedTests = 0;

function logTest(testName, passed, details = '') {
  if (passed) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  return { status: res.status, data };
}

async function runAllTests() {
  console.log('\n============================================================');
  console.log('   SHIPTRACK DEFENSIVE VERIFICATION & TEST SUITE');
  console.log('============================================================\n');

  try {
    // 1. Ensure DB connected & seeded
    await seedDatabase();
    await connectDatabase();

    // 2. Start ephemeral test server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[TEST_SERVER] Running on ${baseUrl}\n`);

    // ==========================================
    // SUITE 1: AUTHENTICATION & PRIVILEGE ESCALATION
    // ==========================================
    console.log('--- 1. AUTHENTICATION & ROLE FOUNDATION ---');

    // 1.1 Valid Customer Registration
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'New Test Customer',
        email: 'newcustomer@test.com',
        password: 'Password@1234',
        role: 'CUSTOMER',
        phone: '+91-9988776655',
      },
    });
    logTest('User registration succeeds (201 Created)', regRes.status === 201 && regRes.data?.token);

    // 1.2 Privilege Escalation Blocked (Cannot register as ADMIN)
    const privEscRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Attacker Admin Attempt',
        email: 'attacker@evil.com',
        password: 'Password@1234',
        role: 'ADMIN',
      },
    });
    logTest('Privilege Escalation during registration is blocked (403 Forbidden)', privEscRes.status === 403);

    // 1.3 Valid Login for seeded accounts
    const loginAdmin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@shiptrack.io', password: 'Admin@Secure2026!' },
    });
    adminToken = loginAdmin.data?.token;
    logTest('Admin login succeeds (200 OK)', loginAdmin.status === 200 && !!adminToken);

    const loginC1 = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'customer1@shiptrack.io', password: 'Customer1@Secure2026!' },
    });
    customer1Token = loginC1.data?.token;
    logTest('Customer 1 login succeeds (200 OK)', loginC1.status === 200 && !!customer1Token);

    const loginC2 = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'customer2@shiptrack.io', password: 'Customer2@Secure2026!' },
    });
    customer2Token = loginC2.data?.token;
    logTest('Customer 2 login succeeds (200 OK)', loginC2.status === 200 && !!customer2Token);

    const loginD1 = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'driver1@shiptrack.io', password: 'Driver1@Secure2026!' },
    });
    driver1Token = loginD1.data?.token;
    logTest('Driver 1 login succeeds (200 OK)', loginD1.status === 200 && !!driver1Token);

    const loginD2 = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'driver2@shiptrack.io', password: 'Driver2@Secure2026!' },
    });
    driver2Token = loginD2.data?.token;
    logTest('Driver 2 login succeeds (200 OK)', loginD2.status === 200 && !!driver2Token);

    // 1.4 Invalid credentials rejected
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@shiptrack.io', password: 'WrongPassword!' },
    });
    logTest('Invalid login password is rejected (401 Unauthorized)', badLogin.status === 401);

    // 1.5 Protected route without token rejected
    const noAuth = await request('/api/auth/me');
    logTest('Unauthenticated access to protected route rejected (401 Unauthorized)', noAuth.status === 401);

    // 1.6 Protected route with token succeeds
    const authMe = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    logTest('Authenticated user profile retrieved (200 OK)', authMe.status === 200 && authMe.data?.user?.email === 'customer1@shiptrack.io');

    // ==========================================
    // SUITE 2: CUSTOMER OPERATIONS & BOLA/IDOR DEFENSE
    // ==========================================
    console.log('\n--- 2. CUSTOMER DOMAIN & OBJECT-LEVEL ACCESS CONTROL (IDOR DEFENSE) ---');

    // 2.1 Customer 1 creates a new shipment
    const createShipmentRes = await request('/api/shipments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer1Token}` },
      body: {
        senderDetails: {
          name: 'Sneha Reddy',
          phone: '+91-9876543213',
          address: 'Plot 42, Hitec City',
          city: 'Hyderabad',
          postalCode: '500081',
        },
        receiverDetails: {
          name: 'Deepak Sharma',
          phone: '+91-9876543299',
          address: '7th Avenue, Anna Nagar',
          city: 'Chennai',
          postalCode: '600040',
        },
        packageDetails: {
          weightKg: 3.2,
          description: 'Hardware tokens & documentation',
          isFragile: true,
          declaredValue: 15000,
        },
      },
    });
    customer1ShipmentId = createShipmentRes.data?.shipment?._id;
    logTest('Customer creates new shipment (201 Created)', createShipmentRes.status === 201 && !!customer1ShipmentId);

    // 2.2 Customer 1 lists shipments (only sees own)
    const c1List = await request('/api/shipments', {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const c1AllOwn = c1List.data?.shipments?.every((s) => s.sender._id === authMe.data.user.id || s.sender === authMe.data.user.id);
    logTest("Customer 1 shipment list strictly filtered to own parcels", c1List.status === 200 && c1AllOwn);

    // 2.3 Customer 2 gets their own shipments to get a target ID
    const c2List = await request('/api/shipments', {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    customer2ShipmentId = c2List.data?.shipments?.[0]?._id;
    logTest('Customer 2 lists own shipments successfully', c2List.status === 200 && !!customer2ShipmentId);

    // 2.4 BOLA / IDOR ATTACK: Customer 1 tries to access Customer 2's shipment
    const idorAttempt = await request(`/api/shipments/${customer2ShipmentId}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    logTest('BOLA/IDOR DEFENSE: Customer 1 denied access to Customer 2 shipment (403 Forbidden)', idorAttempt.status === 403);

    // 2.5 Customer 1 accesses own shipment details
    const ownShipmentRes = await request(`/api/shipments/${customer1ShipmentId}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    logTest('Customer 1 successfully accesses own shipment details (200 OK)', ownShipmentRes.status === 200);

    // ==========================================
    // SUITE 3: DRIVER ACCESS CONTROL & WORKFLOW
    // ==========================================
    console.log('\n--- 3. DRIVER ACCESS CONTROL & RESTRICTIONS ---');

    // 3.1 Driver 1 views assigned dashboard
    const d1Dash = await request('/api/drivers/dashboard', {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    logTest('Driver 1 dashboard metrics load (200 OK)', d1Dash.status === 200 && typeof d1Dash.data?.stats?.activeAssigned === 'number');

    // 3.2 Driver 1 attempts to access Customer 2's unassigned shipment
    const d1CrossAccess = await request(`/api/shipments/${customer2ShipmentId}`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    logTest('DRIVER SEGREGATION: Driver 1 denied access to unassigned shipment (403 Forbidden)', d1CrossAccess.status === 403);

    // 3.3 Driver 1 attempts to call Admin API
    const d1AdminAttempt = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    logTest('RBAC DEFENSE: Driver denied access to Admin dashboard (403 Forbidden)', d1AdminAttempt.status === 403);

    // ==========================================
    // SUITE 4: ADMIN OPERATIONS & DISPATCH CONTROL
    // ==========================================
    console.log('\n--- 4. ADMIN DASHBOARD & DISPATCH MANAGEMENT ---');

    // 4.1 Admin dashboard
    const adminDash = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    logTest('Admin dashboard loads system-wide operational metrics (200 OK)', adminDash.status === 200 && adminDash.data?.metrics?.totalShipments > 0);

    // 4.2 Admin assigns Driver 1 to Customer 2's unassigned shipment
    const assignRes = await request('/api/admin/assign', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        shipmentId: customer2ShipmentId,
        driverId: loginD1.data.user.id,
        note: 'Assigned by dispatch admin',
      },
    });
    logTest('Admin assigns driver to shipment (200 OK, transitions to ASSIGNED)', assignRes.status === 200 && assignRes.data?.shipment?.status === 'ASSIGNED');

    // 4.3 Now Driver 1 CAN legitimately access Customer 2's shipment because it was assigned to them
    const d1NowAssigned = await request(`/api/shipments/${customer2ShipmentId}`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    logTest('Driver 1 can access shipment once formally assigned (200 OK)', d1NowAssigned.status === 200);

    // 4.4 Driver 2 STILL cannot access that shipment
    const d2StillBlocked = await request(`/api/shipments/${customer2ShipmentId}`, {
      headers: { Authorization: `Bearer ${driver2Token}` },
    });
    logTest('Driver 2 still denied access to Driver 1 assignment (403 Forbidden)', d2StillBlocked.status === 403);

    // ==========================================
    // SUITE 5: FINITE STATE MACHINE (FSM) LIFECYCLE
    // ==========================================
    console.log('\n--- 5. FINITE STATE MACHINE (FSM) LIFECYCLE VALIDATION ---');

    // 5.1 ILLEGAL STATE JUMP: Driver 1 tries to jump directly from ASSIGNED to DELIVERED
    const illegalJump = await request(`/api/shipments/${customer2ShipmentId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${driver1Token}` },
      body: { targetStatus: 'DELIVERED', note: 'Attempting invalid state jump' },
    });
    logTest('FSM DEFENSE: Invalid state jump ASSIGNED -> DELIVERED rejected (422 Unprocessable Entity)', illegalJump.status === 422);

    // 5.2 VALID TRANSITION: Driver 1 transitions ASSIGNED -> PICKED_UP
    const step1 = await request(`/api/shipments/${customer2ShipmentId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${driver1Token}` },
      body: { targetStatus: 'PICKED_UP', note: 'Package picked up from warehouse' },
    });
    logTest('FSM SUCCESS: Valid transition ASSIGNED -> PICKED_UP succeeds (200 OK)', step1.status === 200 && step1.data?.shipment?.status === 'PICKED_UP');

    // 5.3 VALID TRANSITION: Driver 1 transitions PICKED_UP -> IN_TRANSIT
    const step2 = await request(`/api/shipments/${customer2ShipmentId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${driver1Token}` },
      body: { targetStatus: 'IN_TRANSIT', note: 'Package moving between transit hubs' },
    });
    logTest('FSM SUCCESS: Valid transition PICKED_UP -> IN_TRANSIT succeeds (200 OK)', step2.status === 200 && step2.data?.shipment?.status === 'IN_TRANSIT');

    // 5.4 VALID TRANSITION: Driver 1 transitions IN_TRANSIT -> OUT_FOR_DELIVERY
    const step3 = await request(`/api/shipments/${customer2ShipmentId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${driver1Token}` },
      body: { targetStatus: 'OUT_FOR_DELIVERY', note: 'Courier out for final mile delivery' },
    });
    logTest('FSM SUCCESS: Valid transition IN_TRANSIT -> OUT_FOR_DELIVERY succeeds (200 OK)', step3.status === 200 && step3.data?.shipment?.status === 'OUT_FOR_DELIVERY');

    // 5.5 VALID TRANSITION: Driver 1 transitions OUT_FOR_DELIVERY -> DELIVERED
    const step4 = await request(`/api/shipments/${customer2ShipmentId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${driver1Token}` },
      body: { targetStatus: 'DELIVERED', note: 'Delivered and signed by recipient' },
    });
    logTest('FSM SUCCESS: Valid transition OUT_FOR_DELIVERY -> DELIVERED succeeds (200 OK)', step4.status === 200 && step4.data?.shipment?.status === 'DELIVERED');

    // 5.6 TERMINAL STATE DEFENSE: Cannot transition once DELIVERED
    const stepAfterDelivered = await request(`/api/shipments/${customer2ShipmentId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${driver1Token}` },
      body: { targetStatus: 'IN_TRANSIT', note: 'Attempting resurrect delivered package' },
    });
    logTest('FSM DEFENSE: Re-opening DELIVERED shipment rejected (422 Unprocessable Entity)', stepAfterDelivered.status === 422);

    // ==========================================
    // SUITE 6: VALIDATION & SECURITY AUDIT TELEMETRY
    // ==========================================
    console.log('\n--- 6. INPUT VALIDATION & REAL AUDIT TELEMETRY ---');

    // 6.1 Malformed MongoDB ObjectId in URL
    const badIdRes = await request('/api/shipments/invalid-hex-id-1234', {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    logTest('Malformed ObjectId rejected with 400 Bad Request', badIdRes.status === 400);

    // 6.2 Malformed shipment creation body
    const badBodyRes = await request('/api/shipments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer1Token}` },
      body: { senderDetails: {} },
    });
    logTest('Incomplete shipment body rejected with 400 Bad Request', badBodyRes.status === 400);

    // 6.3 Public Tracking masks sensitive PII
    const trackNum = step4.data?.shipment?.trackingNumber;
    const pubTrack = await request(`/api/shipments/tracking/${trackNum}`);
    const isMasked = pubTrack.data?.data?.receiverNameMasked?.includes('*');
    logTest('Public tracking masks PII recipient data', pubTrack.status === 200 && isMasked);

    // 6.4 Authentic Security Audit Logs show real recorded events
    const auditLogsRes = await request('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const hasBolaLog = auditLogsRes.data?.logs?.some((l) => l.eventType === 'FORBIDDEN_RESOURCE_ACCESS');
    const hasFsmLog = auditLogsRes.data?.logs?.some((l) => l.eventType === 'INVALID_STATE_TRANSITION');
    logTest('Authentic Security Audit Trail records real BOLA and FSM attacks', auditLogsRes.status === 200 && hasBolaLog && hasFsmLog);

    // ==========================================
    // SUITE 7: SHIPTRACK GUARD CONTROL PLANE & REALITY ENGINE
    // ==========================================
    console.log('\n--- 7. SHIPTRACK GUARD CONTROL PLANE & REALITY ENGINE ---');

    // 7.1 Overview Telemetry Endpoint
    const overviewRes = await request('/api/guard/overview');
    logTest(
      'Security Control Center Overview loads metrics and threat distribution',
      overviewRes.status === 200 &&
        overviewRes.data?.data?.metrics?.riskScore != null &&
        overviewRes.data?.data?.threatDistribution != null
    );

    // 7.2 Reality Engine: Impossible Movement Evaluation
    const realityEvalRes = await request('/api/guard/reality-engine/evaluate', {
      method: 'POST',
      body: {
        previousLocation: { lat: 17.385, lng: 78.4867, name: 'Hyderabad Central Hub', timestamp: new Date(Date.now() - 4 * 60000) },
        currentLocation: { lat: 16.5062, lng: 80.648, name: 'Vijayawada DC', timestamp: new Date() },
        targetState: 'DELIVERED',
        expectedDestination: { lat: 16.5062, lng: 80.648, name: 'Vijayawada DC' },
      },
    });
    const hasSpeedAnomaly = realityEvalRes.data?.data?.anomalies?.some((a) => a.code === 'IMPOSSIBLE_MOVEMENT');
    logTest(
      'Reality Engine detects impossible movement (275km in 4 mins) & flags anomaly',
      realityEvalRes.status === 200 && hasSpeedAnomaly && realityEvalRes.data?.data?.isRealistic === false
    );

    // 7.3 Reality Engine: 5-Factor Location Trust Score
    const locScore = realityEvalRes.data?.data?.locationTrustScore;
    const hasBreakdown = realityEvalRes.data?.data?.scoreBreakdown?.gpsAccuracy != null;
    logTest(
      'Reality Engine calculates explainable 5-Factor Location Trust Score',
      typeof locScore === 'number' && hasBreakdown
    );

    // 7.4 Attack Simulator: Execute BOLA Attack Scenario
    const attackSimRes = await request('/api/guard/attack-simulator/run', {
      method: 'POST',
      body: { scenarioId: 'BOLA_IDOR' },
    });
    const hasPipeline = attackSimRes.data?.data?.pipelineSteps?.length === 9;
    logTest(
      'Attack Simulator executes BOLA attack through 9-step explainable pipeline',
      attackSimRes.status === 200 && attackSimRes.data?.data?.decision === 'BLOCK' && hasPipeline
    );

    // 7.5 Attack Simulator: Honeypot Decoy Trap Trigger
    const honeypotSimRes = await request('/api/guard/attack-simulator/run', {
      method: 'POST',
      body: { scenarioId: 'HONEYPOT_SHIPMENT_ACCESS' },
    });
    logTest(
      'Attack Simulator detects Honeypot Access and creates critical incident',
      honeypotSimRes.status === 200 &&
        honeypotSimRes.data?.data?.decision === 'BLOCK' &&
        honeypotSimRes.data?.data?.riskScore >= 90
    );

    // 7.6 Flight Recorder: Searchable Audit Black Box
    const flightRecorderRes = await request('/api/guard/flight-recorder?limit=10');
    logTest(
      'Security Flight Recorder returns structured events with decisions and risk',
      flightRecorderRes.status === 200 && flightRecorderRes.data?.data?.logs?.length > 0
    );

    // 7.7 Security Policies Engine
    const policiesRes = await request('/api/guard/policies');
    logTest(
      'Policy Engine serves active enforcement rules and categories',
      policiesRes.status === 200 && policiesRes.data?.data?.length >= 8
    );

    // 7.8 Security Graph: Entity-Relationship Visualization Data
    const graphRes = await request('/api/guard/security-graph');
    logTest(
      'Security Graph generates multi-entity topology with suspicious link detection',
      graphRes.status === 200 && graphRes.data?.data?.nodes?.length > 0 && graphRes.data?.data?.links?.length > 0
    );

    // 7.9 Shipment DNA: Operational Pattern & Route Deviations
    const dnaShipmentId = step4.data?.shipment?._id;
    const dnaRes = await request(`/api/guard/shipment-dna/${dnaShipmentId}`);
    logTest(
      'Shipment DNA endpoint retrieves expected lifecycle and route checkpoints',
      dnaRes.status === 200 && dnaRes.data?.data?.dna?.expectedRoute != null
    );

    // 7.10 Incident Center: Incident retrieval & lifecycle status
    const incidentsRes = await request('/api/guard/incidents');
    logTest(
      'Security Incident Center lists correlated threat cases with attack chains',
      incidentsRes.status === 200 && incidentsRes.data?.data?.length > 0
    );

    console.log('\n============================================================');
    console.log(`   TEST EXECUTION COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('============================================================\n');

    server.close();
    await mongoose.disconnect();

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('[TEST_RUNNER_FATAL_ERROR]', err);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runAllTests();
