const {
  SECURITY_EVENT_TYPES,
  GUARD_DECISIONS,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  HONEYPOT_IDS,
} = require('../config/constants');
const SecurityLog = require('../models/SecurityLog');
const SecurityIncident = require('../models/SecurityIncident');
const SecurityPolicy = require('../models/SecurityPolicy');
const User = require('../models/User');
const { evaluateMovement } = require('./realityEngine');

class SecurityDecisionEngine {
  /**
   * Main Evaluation Pipeline:
   * REQUEST -> IDENTITY -> RESOURCE -> RELATIONSHIP -> WORKFLOW -> LOCATION -> BEHAVIOR -> RISK ENGINE -> DECISION
   */
  static async evaluate({
    actor = null, // User mongoose doc or plain object { _id, role, name, email, trustScore }
    action = 'READ_SHIPMENT',
    resource = '/api/shipments',
    shipment = null, // Shipment doc if applicable
    targetTrackingNumber = null,
    currentState = null,
    requestedState = null,
    location = null, // { lat, lng, name, timestamp }
    previousLocation = null,
    device = 'DEV-TEL-01',
    ipAddress = '127.0.0.1',
    userAgent = 'ShipTrack-ControlPlane/2.0',
    probingCount = 0,
    forcedScenario = null, // For attack simulator
  }) {
    let riskScore = 0;
    const reasons = [];
    const policiesTriggered = [];
    let decision = GUARD_DECISIONS.ALLOW;
    let eventType = SECURITY_EVENT_TYPES.AUTH_SUCCESS;
    let severity = 'INFO';
    let incidentRequired = false;
    let trustDecay = 0;

    const actorId = actor?._id?.toString() || null;
    const actorRole = actor?.role || 'ANONYMOUS';
    const actorEmail = actor?.email || 'anonymous@probe.net';
    const actorName = actor?.name || 'Anonymous User';
    const currentTrust = actor?.trustScore != null ? actor.trustScore : 100;

    // Check Honeypot Access (Immediate Critical Incident)
    const isHoneypotAccess =
      forcedScenario === 'HONEYPOT_ACCESS' ||
      shipment?.isHoneypot === true ||
      HONEYPOT_IDS.includes(targetTrackingNumber) ||
      (typeof resource === 'string' && HONEYPOT_IDS.some((h) => resource.includes(h)));

    if (isHoneypotAccess) {
      riskScore += 95;
      reasons.push('+50 Honeypot decoy resource accessed (unauthorized enumeration probe)');
      reasons.push('+25 Reconnaissance anomaly: zero operational justification');
      reasons.push('+20 Zero-trust breach');
      policiesTriggered.push('HONEYPOT_ACCESS_BLOCK');
      policiesTriggered.push('SENSITIVE_ACTION_TRUST_THRESHOLD');
      eventType = SECURITY_EVENT_TYPES.HONEYPOT_TRIGGER;
      severity = INCIDENT_SEVERITY.CRITICAL;
      decision = GUARD_DECISIONS.BLOCK;
      incidentRequired = true;
      trustDecay = 35;
    }

    // Check Identity & Trust Decay Threshold
    if (currentTrust < 40 && !isHoneypotAccess) {
      riskScore += 20;
      reasons.push(`+20 Degraded actor trust score (${currentTrust}/100)`);
      policiesTriggered.push('SENSITIVE_ACTION_TRUST_THRESHOLD');
      if (currentTrust < 20) {
        decision = GUARD_DECISIONS.BLOCK;
        severity = INCIDENT_SEVERITY.HIGH;
        reasons.push('+15 Severely degraded trust boundary violation');
      } else {
        decision = GUARD_DECISIONS.STEP_UP;
      }
    }

    // Check Resource Security & Ownership (BOLA / IDOR Defense)
    if (shipment && actor && !isHoneypotAccess) {
      const isOwner = shipment.sender?.toString() === actorId || shipment.sender?._id?.toString() === actorId;
      const isAssignedDriver =
        shipment.assignedDriver?.toString() === actorId ||
        shipment.assignedDriver?._id?.toString() === actorId;
      const isAdmin = actorRole === 'ADMIN';

      if (actorRole === 'CUSTOMER' && !isOwner) {
        riskScore += 40;
        reasons.push('+35 Resource ownership mismatch (BOLA / IDOR cross-tenant access violation)');
        reasons.push('+5 Unauthorized customer parcel access');
        policiesTriggered.push('RESOURCE_OWNER_REQUIRED');
        eventType = SECURITY_EVENT_TYPES.BOLA_ATTEMPT;
        severity = INCIDENT_SEVERITY.HIGH;
        decision = GUARD_DECISIONS.BLOCK;
        trustDecay = Math.max(trustDecay, 15);
      } else if (actorRole === 'DRIVER' && !isAssignedDriver && !isAdmin) {
        riskScore += 35;
        reasons.push('+30 Driver unassigned fleet isolation policy violation');
        reasons.push('+5 Segregation of duty breach');
        policiesTriggered.push('DRIVER_ASSIGNMENT_REQUIRED');
        eventType = SECURITY_EVENT_TYPES.BOLA_ATTEMPT;
        severity = INCIDENT_SEVERITY.HIGH;
        decision = GUARD_DECISIONS.BLOCK;
        trustDecay = Math.max(trustDecay, 15);
      }
    }

    // Check Workflow Security & FSM Lifecycle State Machine
    if (currentState && requestedState && !isHoneypotAccess) {
      const { ALLOWED_TRANSITIONS } = require('../config/constants');
      const validNextStates = ALLOWED_TRANSITIONS[currentState] || [];
      if (!validNextStates.includes(requestedState)) {
        riskScore += 30;
        reasons.push(`+25 Workflow deviation: illegal status leap from ${currentState} to ${requestedState}`);
        reasons.push('+5 State machine tampering attempt');
        policiesTriggered.push('VALID_WORKFLOW_TRANSITION');
        eventType = SECURITY_EVENT_TYPES.WORKFLOW_VIOLATION;
        severity = INCIDENT_SEVERITY.HIGH;
        decision = GUARD_DECISIONS.BLOCK;
        trustDecay = Math.max(trustDecay, 10);
      }
    }

    // Check Reality Engine & Location Integrity
    let realityEval = null;
    if (location && previousLocation && !isHoneypotAccess) {
      realityEval = evaluateMovement({
        previousLocation,
        currentLocation: location,
        targetState: requestedState || currentState,
      });

      if (!realityEval.isRealistic) {
        riskScore += 35;
        reasons.push(`+25 Reality anomaly: calculated speed ${realityEval.calculatedSpeedKmH} km/h (${realityEval.distanceKm} km in ${realityEval.minutesElapsed} mins)`);
        reasons.push(`+10 Low location trust score (${realityEval.locationTrustScore}/100)`);
        policiesTriggered.push('IMPOSSIBLE_MOVEMENT_DETECTION');
        eventType = SECURITY_EVENT_TYPES.IMPOSSIBLE_MOVEMENT;
        severity = INCIDENT_SEVERITY.CRITICAL;
        decision = GUARD_DECISIONS.BLOCK;
        incidentRequired = true;
        trustDecay = Math.max(trustDecay, 20);
      }
    }

    // Check Enumeration & Probing Behavior
    if (probingCount > 4 && !isHoneypotAccess) {
      riskScore += 25;
      reasons.push(`+20 Rapid resource scanning: ${probingCount} probes in 60s`);
      policiesTriggered.push('ENUMERATION_THRESHOLD');
      eventType = SECURITY_EVENT_TYPES.ENUMERATION_DETECTED;
      severity = INCIDENT_SEVERITY.HIGH;
      decision = decision === GUARD_DECISIONS.BLOCK ? GUARD_DECISIONS.BLOCK : GUARD_DECISIONS.STEP_UP;
      trustDecay = Math.max(trustDecay, 25);
    }

    // Final Risk Score Clamping
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Decision Logic based on Score
    if (riskScore >= 80) {
      decision = GUARD_DECISIONS.BLOCK;
      incidentRequired = true;
      if (severity !== INCIDENT_SEVERITY.CRITICAL) severity = INCIDENT_SEVERITY.CRITICAL;
    } else if (riskScore >= 60) {
      decision = GUARD_DECISIONS.BLOCK;
      if (severity === 'INFO') severity = INCIDENT_SEVERITY.HIGH;
    } else if (riskScore >= 35) {
      decision = GUARD_DECISIONS.STEP_UP;
      if (severity === 'INFO') severity = INCIDENT_SEVERITY.MEDIUM;
    } else {
      decision = GUARD_DECISIONS.ALLOW;
      reasons.push('All identity, resource, workflow, and reality verification checks passed.');
    }

    // Calculate new trust score
    const newTrustScore = Math.max(0, currentTrust - trustDecay);

    // Apply trust decay to User document if actor exists in DB
    if (actorId && trustDecay > 0) {
      try {
        await User.findByIdAndUpdate(actorId, {
          $set: {
            trustScore: newTrustScore,
            trustStatus:
              newTrustScore < 20
                ? 'BLOCKED'
                : newTrustScore < 40
                ? 'RESTRICTED'
                : newTrustScore < 60
                ? 'STEP_UP'
                : 'NORMAL',
            isHoneypotTriggered: isHoneypotAccess ? true : undefined,
          },
          $push: {
            trustHistory: {
              delta: -trustDecay,
              newScore: newTrustScore,
              reason: reasons[0] || 'Security violation',
              timestamp: new Date(),
            },
          },
        });
      } catch (err) {
        console.error('[TRUST_DECAY_ERROR]', err.message);
      }
    }

    // Record Security Policy Enforcement Counts
    if (policiesTriggered.length > 0) {
      SecurityPolicy.updateMany(
        { name: { $in: policiesTriggered } },
        { $inc: { enforcementCount: 1 }, $set: { lastTriggered: new Date() } }
      ).catch(() => {});
    }

    // Create Immutable Flight Recorder Event
    let flightRecorderLog = null;
    try {
      flightRecorderLog = await SecurityLog.create({
        eventType,
        severity,
        userId: actorId,
        actorName,
        actorEmail,
        userRole: actorRole,
        resource: typeof resource === 'string' ? resource : '/api/resource',
        action,
        decision,
        riskScore,
        reasons,
        policiesTriggered,
        shipmentId: shipment?._id || null,
        trackingNumber: shipment?.trackingNumber || targetTrackingNumber || null,
        previousState: currentState,
        requestedState,
        locationData: {
          lat: location?.lat || null,
          lng: location?.lng || null,
          hub: location?.name || null,
          distanceKm: realityEval?.distanceKm || 0,
          speedKmH: realityEval?.calculatedSpeedKmH || 0,
          confidenceScore: realityEval?.locationTrustScore || 100,
        },
        trustImpact: {
          previousTrust: currentTrust,
          newTrust: newTrustScore,
          delta: -trustDecay,
        },
        ipAddress,
        userAgent,
        evidence: {
          realityEvaluation: realityEval,
          probingCount,
          isHoneypotAccess,
        },
        details: {
          reasons,
        },
      });
    } catch (logErr) {
      console.error('[FLIGHT_RECORDER_ERROR]', logErr.message);
    }

    // Automatic Incident Creation on Critical Threat or Honeypot Breach
    let incident = null;
    if (incidentRequired) {
      try {
        const incCount = await SecurityIncident.countDocuments();
        const incidentId = `INC-${new Date().getFullYear()}-${String(incCount + 101).padStart(4, '0')}`;
        const threatTitle = isHoneypotAccess
          ? 'Critical Decoy Honeypot Breach Detected'
          : realityEval && !realityEval.isRealistic
          ? 'Spatial Reality Anomaly & Impossible Movement'
          : `High-Risk ${eventType.replace(/_/g, ' ')} Incident`;

        incident = await SecurityIncident.create({
          incidentId,
          title: threatTitle,
          severity,
          threatType: eventType,
          status: INCIDENT_STATUS.OPEN,
          actor: {
            userId: actorId,
            name: actorName,
            email: actorEmail,
            role: actorRole,
            ipAddress,
          },
          affectedShipment: {
            shipmentId: shipment?._id || null,
            trackingNumber: shipment?.trackingNumber || targetTrackingNumber || null,
          },
          attackChain: [
            {
              step: 1,
              title: 'Reconnaissance / Ingress Attempt',
              eventType: 'AUTH_EVALUATION',
              timestamp: new Date(Date.now() - 120000),
              evidence: { actorRole, ipAddress },
            },
            {
              step: 2,
              title: `${eventType} Execution`,
              eventType,
              timestamp: new Date(),
              evidence: { reasons, riskScore, policiesTriggered },
            },
            {
              step: 3,
              title: 'Automatic Security Control Plane Enforcement',
              eventType: 'POLICY_BLOCK',
              timestamp: new Date(),
              evidence: { decision, trustImpact: { previousTrust: currentTrust, newTrust: newTrustScore } },
            },
          ],
          riskScore,
          policiesViolated: policiesTriggered,
          recommendedAction:
            riskScore > 90
              ? 'IMMEDIATELY_ISOLATE_ACTOR_AND_INVALIDATE_TOKENS'
              : 'STEP_UP_VERIFICATION_AND_RESTRICT_DISPATCH',
          evidence: {
            flightRecorderId: flightRecorderLog?._id,
            reasons,
            locationData: location,
          },
        });
      } catch (incErr) {
        console.error('[INCIDENT_CREATION_ERROR]', incErr.message);
      }
    }

    return {
      decision,
      riskScore,
      reasons,
      policiesTriggered,
      trustImpact: {
        previousTrust: currentTrust,
        newTrust: newTrustScore,
        delta: -trustDecay,
      },
      flightRecorderId: flightRecorderLog?._id || null,
      incidentId: incident?.incidentId || null,
      incidentRequired,
    };
  }
}

module.exports = SecurityDecisionEngine;
