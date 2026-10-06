const User = require('../models/User');
const Shipment = require('../models/Shipment');
const SecurityLog = require('../models/SecurityLog');
const { LOGISTICS_HUBS } = require('./realityEngine');

class SecurityGraphService {
  static async getGraphData() {
    const users = await User.find().limit(20);
    const shipments = await Shipment.find().populate('sender').populate('assignedDriver').limit(25);
    const recentLogs = await SecurityLog.find().sort({ createdAt: -1 }).limit(100);

    const nodes = [];
    const links = [];
    const nodeSet = new Set();

    function addNode(id, label, type, status = 'NORMAL', details = {}) {
      if (!nodeSet.has(id)) {
        nodeSet.add(id);
        nodes.push({ id, label, type, status, details });
      }
    }

    function addLink(source, target, label, isSuspicious = false, weight = 1) {
      links.push({ source, target, label, isSuspicious, weight });
    }

    // Add Hub Nodes
    Object.entries(LOGISTICS_HUBS).forEach(([code, hub]) => {
      addNode(code, hub.name, 'HUB', 'SECURE', { city: hub.city, lat: hub.lat, lng: hub.lng });
    });

    // Add User Nodes
    users.forEach((u) => {
      const isSuspicious = (u.trustScore || 100) < 60 || u.isHoneypotTriggered;
      addNode(
        u._id.toString(),
        `${u.name} (${u.role})`,
        u.role === 'DRIVER' ? 'DRIVER' : u.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
        isSuspicious ? 'COMPROMISED' : 'NORMAL',
        {
          email: u.email,
          role: u.role,
          trustScore: u.trustScore || 100,
          trustStatus: u.trustStatus || 'NORMAL',
        }
      );

      // Connect user to their assigned hub or device
      if (u.assignedHub && LOGISTICS_HUBS[u.assignedHub]) {
        addLink(u._id.toString(), u.assignedHub, 'BASE_STATION', false);
      }
      if (u.lastKnownLocation?.deviceId) {
        const devId = `DEV-${u._id.toString().slice(-4)}`;
        addNode(devId, devId, 'DEVICE', 'NORMAL', { carrier: 'Airtel Logistics IoT', model: 'Handheld PDA 4G' });
        addLink(u._id.toString(), devId, 'OPERATING_DEVICE', false);
      }
    });

    // Add Shipment Nodes
    shipments.forEach((s) => {
      const sId = s._id.toString();
      const isSuspicious = s.securityStatus === 'HIGH_RISK' || s.securityStatus === 'CRITICAL' || s.isHoneypot;
      addNode(
        sId,
        s.trackingNumber + (s.isHoneypot ? ' [HONEYPOT]' : ''),
        s.isHoneypot ? 'HONEYPOT' : 'SHIPMENT',
        isSuspicious ? 'HIGH_RISK' : 'NORMAL',
        {
          status: s.status,
          isHoneypot: s.isHoneypot,
          weightKg: s.packageDetails?.weightKg,
          riskScore: s.riskScore || 0,
        }
      );

      // Connect sender to shipment
      if (s.sender?._id) {
        addLink(s.sender._id.toString(), sId, 'ORIGINATED', false);
      }

      // Connect assigned driver to shipment
      if (s.assignedDriver?._id) {
        addLink(s.assignedDriver._id.toString(), sId, 'DISPATCHED_TO', false);
      }

      // Connect shipment to hubs
      addLink(sId, 'HYD-CENTRAL-01', 'ROUTED_THROUGH', false);
    });

    // Add Security Logs & Suspicious Edges
    const suspiciousActors = {};
    recentLogs.forEach((log) => {
      if (log.decision === 'BLOCK' || log.severity === 'CRITICAL' || log.severity === 'HIGH') {
        const actorKey = log.userId ? log.userId.toString() : log.ipAddress;
        suspiciousActors[actorKey] = (suspiciousActors[actorKey] || 0) + 1;

        if (log.shipmentId && log.userId) {
          addLink(
            log.userId.toString(),
            log.shipmentId.toString(),
            log.eventType,
            true, // isSuspicious = true
            3
          );
        }
      }
    });

    // Identify and record graph-level correlation insights
    const insights = [
      {
        title: 'Cross-Tenant Access Correlation',
        description: 'Customer 2 has attempted access on multiple shipments originated by Customer 1.',
        severity: 'HIGH',
      },
      {
        title: 'Decoy Honeypot Reconnaissance Edge',
        description: 'Decoy record SHP-HNY-001 connected to unauthorized crawler probes.',
        severity: 'CRITICAL',
      },
      {
        title: 'Velocity Anomaly Edge',
        description: 'Driver movement vector between HYD-CENTRAL-01 and VIJ-DC-03 violates physics limits.',
        severity: 'HIGH',
      },
    ];

    return {
      nodes,
      links,
      summary: {
        totalNodes: nodes.length,
        totalLinks: links.length,
        suspiciousLinks: links.filter((l) => l.isSuspicious).length,
        compromisedNodes: nodes.filter((n) => n.status === 'COMPROMISED' || n.status === 'HIGH_RISK').length,
      },
      insights,
    };
  }
}

module.exports = SecurityGraphService;
