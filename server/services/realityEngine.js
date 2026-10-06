/**
 * ShipTrack Guard — Reality Engine
 * Evaluates whether logistics operations make physical, spatial, and temporal sense.
 * 
 * "We don't prove GPS spoofing. We detect location integrity anomalies."
 */

// Canonical logistics hubs with geocoordinates
const LOGISTICS_HUBS = {
  'HYD-CENTRAL-01': {
    name: 'Hyderabad Central Hub',
    city: 'Hyderabad',
    lat: 17.3850,
    lng: 78.4867,
    radiusKm: 15,
  },
  'SUR-TRANSIT-02': {
    name: 'Suryapet Transit Hub',
    city: 'Suryapet',
    lat: 17.1439,
    lng: 79.6239,
    radiusKm: 10,
  },
  'VIJ-DC-03': {
    name: 'Vijayawada Distribution Center',
    city: 'Vijayawada',
    lat: 16.5062,
    lng: 80.6480,
    radiusKm: 12,
  },
  'WAR-DEPOT-04': {
    name: 'Warangal Depot',
    city: 'Warangal',
    lat: 17.9689,
    lng: 79.5941,
    radiusKm: 10,
  },
  'GUN-DELIVERY-05': {
    name: 'Guntur Delivery Station',
    city: 'Guntur',
    lat: 16.3067,
    lng: 80.4365,
    radiusKm: 10,
  },
};

/**
 * Calculate Great-Circle Distance using Haversine formula (km)
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate 5-Factor Location Trust Score (0 - 100)
 */
function calculateLocationTrustScore({
  speedKmH,
  distanceKm,
  minutesElapsed,
  isHubProximity,
  reportedAccuracyMeters = 15,
  isDestinationProximity = true,
}) {
  // Factor 1: GPS Accuracy (0-20)
  let gpsAccuracyScore = 20;
  if (reportedAccuracyMeters > 50) gpsAccuracyScore = 12;
  if (reportedAccuracyMeters > 200) gpsAccuracyScore = 5;
  if (reportedAccuracyMeters <= 0.5) gpsAccuracyScore = 8; // Impossibly perfect sensor precision is suspicious

  // Factor 2: Movement Pattern (0-20)
  let movementPatternScore = 20;
  if (speedKmH > 100) movementPatternScore = 12;
  if (speedKmH > 140) movementPatternScore = 4;
  if (speedKmH > 300) movementPatternScore = 0; // Supersonic

  // Factor 3: Route Consistency (0-20)
  let routeConsistencyScore = 20;
  if (distanceKm > 100 && minutesElapsed < 30) routeConsistencyScore = 5;
  if (distanceKm > 200 && minutesElapsed < 15) routeConsistencyScore = 0;

  // Factor 4: Shipment & Hub Proximity (0-20)
  let proximityScore = isDestinationProximity ? 20 : 8;
  if (!isHubProximity && !isDestinationProximity) proximityScore = 4;

  // Factor 5: Historical Stability (0-20)
  let historicalScore = 18;
  if (speedKmH > 120 || (distanceKm > 50 && minutesElapsed < 10)) {
    historicalScore = 4;
  }

  const total =
    gpsAccuracyScore +
    movementPatternScore +
    routeConsistencyScore +
    proximityScore +
    historicalScore;

  return {
    total: Math.max(5, Math.min(100, total)),
    breakdown: {
      gpsAccuracy: `${gpsAccuracyScore}/20`,
      movementPattern: `${movementPatternScore}/20`,
      routeConsistency: `${routeConsistencyScore}/20`,
      shipmentProximity: `${proximityScore}/20`,
      historicalPattern: `${historicalScore}/20`,
    },
  };
}

/**
 * Evaluate Spatial and Temporal Reality of a Movement Event
 */
function evaluateMovement({
  previousLocation = { lat: 17.385, lng: 78.4867, name: 'Hyderabad Central Hub', timestamp: new Date(Date.now() - 3600000) },
  currentLocation = { lat: 16.5062, lng: 80.648, name: 'Vijayawada DC', timestamp: new Date() },
  targetState = 'DELIVERED',
  expectedDestination = { lat: 16.5062, lng: 80.648, name: 'Vijayawada DC' },
}) {
  const prevTime = new Date(previousLocation.timestamp).getTime();
  const currTime = new Date(currentLocation.timestamp).getTime();
  const msElapsed = Math.max(1000, currTime - prevTime);
  const minutesElapsed = Math.round(msElapsed / 60000 * 10) / 10;
  const hoursElapsed = msElapsed / 3600000;

  const distanceKm = calculateHaversineDistance(
    previousLocation.lat,
    previousLocation.lng,
    currentLocation.lat,
    currentLocation.lng
  );

  const speedKmH = Math.round(distanceKm / Math.max(0.001, hoursElapsed));

  // Check destination proximity
  const distToDestinationKm = calculateHaversineDistance(
    currentLocation.lat,
    currentLocation.lng,
    expectedDestination.lat,
    expectedDestination.lng
  );
  const isDestinationProximity = distToDestinationKm <= 25;

  // Calculate location trust
  const trustEvaluation = calculateLocationTrustScore({
    speedKmH,
    distanceKm,
    minutesElapsed,
    isHubProximity: distanceKm < 15,
    isDestinationProximity,
  });

  const anomalies = [];

  // Anomaly 1: Impossible Speed / Movement
  if (speedKmH > 140 && distanceKm > 10) {
    anomalies.push({
      code: 'IMPOSSIBLE_MOVEMENT',
      severity: 'CRITICAL',
      message: `Impossible movement detected: ${distanceKm} km traversed in ${minutesElapsed} minutes (calculated speed: ${speedKmH} km/h). Commercial limit is 120 km/h.`,
    });
  }

  // Anomaly 2: Instantaneous Teleportation
  if (distanceKm > 150 && minutesElapsed < 10) {
    anomalies.push({
      code: 'INSTANT_LOCATION_JUMP',
      severity: 'CRITICAL',
      message: `Extreme spatial jump of ${distanceKm} km in under 10 minutes.`,
    });
  }

  // Anomaly 3: Delivery Location Inconsistency
  if (targetState === 'DELIVERED' && !isDestinationProximity) {
    anomalies.push({
      code: 'DELIVERY_LOCATION_MISMATCH',
      severity: 'HIGH',
      message: `Driver attempted to mark package DELIVERED at ${currentLocation.name || 'unverified coordinates'}, which is ${distToDestinationKm} km away from declared destination.`,
    });
  }

  // Map risk and recommended response
  let riskLevel = 'LOW';
  let recommendedAction = 'ALLOW';

  if (trustEvaluation.total < 40 || anomalies.some((a) => a.severity === 'CRITICAL')) {
    riskLevel = 'CRITICAL';
    recommendedAction = 'BLOCK_AND_CREATE_INCIDENT';
  } else if (trustEvaluation.total < 60 || anomalies.some((a) => a.severity === 'HIGH')) {
    riskLevel = 'HIGH';
    recommendedAction = 'BLOCK_SENSITIVE_OPERATION';
  } else if (trustEvaluation.total < 80) {
    riskLevel = 'MEDIUM';
    recommendedAction = 'STEP_UP_VERIFICATION';
  }

  return {
    distanceKm,
    minutesElapsed,
    calculatedSpeedKmH: speedKmH,
    locationTrustScore: trustEvaluation.total,
    scoreBreakdown: trustEvaluation.breakdown,
    anomalies,
    isRealistic: anomalies.length === 0 && trustEvaluation.total >= 70,
    riskLevel,
    recommendedAction,
    possibleReasons: [
      'GPS spoofing or mock location provider',
      'Stolen driver credentials used on secondary device',
      'Device or sensor telemetry corruption',
      'Proxy/VPN location jumping',
    ],
  };
}

module.exports = {
  LOGISTICS_HUBS,
  calculateHaversineDistance,
  calculateLocationTrustScore,
  evaluateMovement,
};
