# Project Approach & Architecture — Build Secure 24

**Team ID:** [Assigned Organizer ID]  
**Project Name:** ShipTrack Guard — Security Control Plane for Logistics Operations  
**Team Size:** [2 or 4 Members]  
**Primary Track / Domain:** PS-05: ShipTrack — Delivery & Shipment Management (Cybersecurity & Defensive Engineering)  

---

## 1. Executive Summary & New Product Direction

ShipTrack Guard transforms conventional logistics software from a passive parcel tracker into an **active runtime security control plane**. 

In physical logistics and supply chains, **"an authenticated request is not necessarily a legitimate request."** A stolen driver JWT can issue a "Delivered" scan from 300 km away; a competitor customer account can iterate sequential parcel IDs (BOLA/IDOR); a rogue actor can probe decoy tracking numbers; or an operator can attempt illegal state transitions across shipment lifecycles.

ShipTrack Guard sits as a zero-trust defensive evaluation layer between untrusted clients and core logistics data, inspecting every transaction across **Identity, Resource, Relationship, Workflow, Reality, and Behavior** before granting execution.

---

## 2. Threat Model & Defensive Attack Surface

### 2.1 Logistics Attack Surface
1. **Broken Object-Level Authorization (BOLA / IDOR):** Attackers or competitor couriers enumerate parcel IDs (`/api/shipments/:id`) to intercept delivery routing and customer personal information.
2. **Business Logic & Workflow Tampering:** Couriers attempting to jump state machine boundaries (e.g. marking `CREATED` directly as `DELIVERED` without assignment or transit).
3. **GPS Spoofing & Impossible Velocity Teleportation:** Malicious drivers or compromised devices submitting synthetic location updates indicating speeds exceeding 140 km/h between check-ins.
4. **Decoy / Honeypot Trapping:** Automated or human attackers scraping or probing unadvertised high-value dummy tracking numbers (`SHP-HNY-001`).
5. **Driver Fleet Segregation Breach:** Cross-driver unauthorized delivery interception where Driver B attempts to manipulate packages assigned exclusively to Driver A.
6. **PII Leakage via Public Tracking:** Tracking endpoints returning full names, telephone numbers, and street addresses to unauthenticated callers.

### 2.2 OWASP Top 10 & Defensive Mitigations
- **A01: Broken Access Control** &rarr; Enforced via Server-Side ABAC and Relationship Graphs.
- **A02: Cryptographic Failures** &rarr; Enforced via salted bcrypt hashes, signed HMAC-SHA256 JWTs, and tamper-resistant tracking IDs.
- **A04: Insecure Design** &rarr; Enforced via Deterministic Finite State Machine (FSM) and 9-Stage Explainable Pipeline.
- **A08: Software and Data Integrity Failures** &rarr; Enforced via Spatial Reality Engine with Haversine velocity calculations and 5-factor location trust.
- **A09: Security Logging & Monitoring Failures** &rarr; Enforced via Flight Recorder Black Box with correlated attack chain incidents.

---

## 3. Technical Architecture & Defense Engine

### 3.1 High-Level Architecture Overview
```text
[ Browser / Fleet Mobile Device ]
        │  (HTTP / REST API)
        ▼
[ Security Edge Middleware ] (Rate Limiting, Helmet Headers, Strict CORS)
        │
        ▼
[ Ingress Schema Validation ] (Allowlisting, Type Validation, Mass Assignment Defense)
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│               SHIPTRACK GUARD CONTROL PLANE LAYER                      │
│                                                                        │
│  [ Stage 1: Identity & Token State ] (JWT, Revocation, Session Decay)  │
│  [ Stage 2: Resource Ownership ] (BOLA / IDOR Isolation)               │
│  [ Stage 3: Relationship Verification ] (Driver Assignment & Hubs)     │
│  [ Stage 4: Workflow FSM Engine ] (Allowed Transitions Only)           │
│  [ Stage 5: Reality Engine ] (Haversine Velocity & 5-Factor Location)  │
│  [ Stage 6: Decoy & Honeypot Detection ] (Canary Tripwire Triggers)    │
│  [ Stage 7: Behavioral Heuristics ] (Rapid Bursts & Replay Detection)  │
│                                                                        │
│  [ Central Decision Engine ]                                           │
│  Composite Risk Score (0 - 100) & Explainable Signal Breakdown         │
│  ├── 0  - 29: ALLOW                                                    │
│  ├── 30 - 59: MONITOR                                                  │
│  ├── 60 - 79: STEP_UP                                                  │
│  └── 80 - 100: BLOCK + DISPATCH INCIDENT                               │
└────────────────────────────────────────────────────────────────────────┘
        │
        ├── (Violation / High Risk) ──► [ Incident Center + Adaptive Trust Decay ]
        │                                             │
        ▼ (Cleared)                                   ▼
[ Core Logistics Controller ]                 [ Flight Recorder Black Box ]
        │                                     (Immutable Audit Ledger)
        ▼
[ MongoDB Database Tier ]
```

### 3.2 Key Subsystems

#### 1. Spatial Reality Engine (`server/services/realityEngine.js`)
- Validates the physical plausibility of GPS coordinates.
- Uses the **Haversine formula** to calculate true spherical distance:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
- Evaluates calculated velocity against realistic physical road constraints ($v > 120\text{ km/h}$ flagged, $v > 140\text{ km/h}$ blocked as impossible teleportation).
- Generates an explainable **5-Factor Location Trust Score (0-100)**:
  1. GPS Accuracy & Covariance (weight: 20%)
  2. Kinematic Movement Pattern (weight: 25%)
  3. Route Corridor Consistency (weight: 20%)
  4. Proximity to Registered Hubs (weight: 20%)
  5. Sensor Historical Stability (weight: 15%)

#### 2. Explainable Risk Decision Engine (`server/services/securityDecisionEngine.js`)
- Completely eliminates opaque "black box" claims by computing an exact mathematical score:
  - `Decoy Honeypot Query`: $+50$ points
  - `BOLA / IDOR Ownership Mismatch`: $+35$ points
  - `Cross-Driver Segregation Breach`: $+30$ points
  - `Impossible Velocity (>140 km/h)`: $+25$ points
  - `State Machine Workflow Tampering`: $+25$ points
  - `Degraded Location Trust (<40)`: $+20$ points
  - `Sequential Probing / Burst Frequency`: $+20$ points
  - `Identity Anomaly / Token Expiry`: $+15$ points
- Determines an enforceable decision: `ALLOW`, `MONITOR`, `STEP_UP`, or `BLOCK`.

#### 3. Flight Recorder Black Box (`server/models/SecurityLog.js`)
- Immutable, append-only security ledger capturing:
  `timestamp`, `actor`, `resource`, `action`, `decision`, `riskScore`, `policiesTriggered`, `reasons`, `locationData`, `trustImpact`, `evidence`.

#### 4. Adaptive Trust Decay & Recovery
- All drivers and users maintain a dynamic trust score (0 - 100).
- Trust drops immediately when telemetry anomalies or unauthorized queries are detected.
- Trust recovers incrementally after continuous valid, on-time delivery cycles.

#### 5. Canary Decoys / Honeypots (`SHP-HNY-001`, `SHP-HNY-002`)
- Seeded into the database without active operational delivery legs.
- Any unauthorized enumeration or access attempt instantly trips canary defenses, creates a `CRITICAL` incident, and collapses the actor's trust score.

#### 6. Correlated Incident Center & Attack Simulator
- Multi-step attacks are correlated into high-level incidents (e.g. `INC-2026-0001`).
- Contains a built-in 10-Scenario Attack Simulator with a 9-step visual pipeline to demonstrate real-time defense to hackathon judges.

---

## 4. Implementation Milestones & Verification Timeline

| Milestone / Phase | Time Window | Key Objectives & Deliverables | Security Verification | Status |
|---|---|---|---|---|
| **Phase 1: Foundation & Core Functionality** | 0h – 6h | MERN architecture scaffold, RBAC, BOLA/IDOR protection, FSM state machine, customer & driver dashboards | Automated tests (32/32 tests passing) | `Completed` |
| **Phase 2: ShipTrack Guard Control Plane** | 6h – 14h | Reality Engine, 5-Factor Location Trust, Decision Engine, Flight Recorder, Adaptive Trust, Policies | Reality engine & spatial tests | `Completed` |
| **Phase 3: Attack-Defense Verification & SOC UI** | 14h – 18h | 10-Scenario Attack Simulator, Honeypot detection, Security Graph, Incident Center, SOC dark theme UI | Full regression suite (42/42 tests passing) | `Completed` |
| **Phase 4: Cloud Deployment & Freeze** | 18h – 24h | Production Vite bundle compilation, deployment guides, frozen commit SHA in `metadata/submission.yaml` | Live URL verification & freeze | `Ready for Review` |

---

## 5. Architecture Decision Records (ADRs)

### ADR-001: Server-Side Object-Level Authorization & BOLA/IDOR Defense
- **Status:** Accepted
- **Decision:** Dedicated `authorizeShipmentAccess` middleware executed before all resource operations. Customers can only view/mutate their own shipments (`sender === user._id`); drivers can only access their formally assigned shipments (`assignedDriver === user._id`); administrators have universal oversight.

### ADR-002: Deterministic Finite State Machine (FSM) Lifecycle Control
- **Status:** Accepted
- **Decision:** Delivery transitions strictly governed by an immutable state map (`CREATED` &rarr; `ASSIGNED` &rarr; `PICKED_UP` &rarr; `IN_TRANSIT` &rarr; `OUT_FOR_DELIVERY` &rarr; `DELIVERED`). Direct state jumps or modifying terminal shipments are rejected with HTTP 422 and logged as security anomalies.

### ADR-003: Haversine Spatial Reality Engine & 5-Factor Kinematic Trust
- **Status:** Accepted
- **Decision:** Replace client-supplied location trust with server-computed Haversine velocity. Updates exceeding 140 km/h or possessing degraded 5-factor location scores are penalized or blocked.

### ADR-004: Explainable Decision Scoring over Opaque Machine Learning
- **Status:** Accepted
- **Decision:** Implement a deterministic, points-based risk engine (+15 to +50 per signal). Guarantees 100% auditability and explainability during hackathon demonstrations without non-deterministic LLM hallucinations or latency bottlenecks.

### ADR-005: Canary Decoy Trapping for Credential & Enumeration Detection
- **Status:** Accepted
- **Decision:** Embed unadvertised honeypot shipments (`SHP-HNY-001`) into the persistent database. Any read/write targeting decoy records triggers an immediate CRITICAL incident and revokes the actor's trust status.

### ADR-006: Premium Logistics Security Operations Center UI & Information Hierarchy
- **Status:** Accepted
- **Decision:** Shift from a generic cybersecurity dashboard to a dedicated Logistics Security Operations Center (SOC) adhering to a 6-level cognitive hierarchy: Level 1 (What is happening right now?) &rarr; Level 2 (What is at risk?) &rarr; Level 3 (Which shipment/vehicle is affected?) &rarr; Level 4 (Why is it dangerous?) &rarr; Level 5 (What action was taken?) &rarr; Level 6 (Can the operator investigate and respond?). Incorporates an interactive Live Threat Map, 7-layer Safety & Security Center, transparent 6-stage decision pipeline, and direct root routing at `http://localhost:5173`.

### ADR-007: Enterprise Blue Visual Hierarchy, Linear Causality Routing & Progressive Disclosure
- **Status:** Accepted
- **Decision:** Overhaul the visual interface into a calm, spacious enterprise platform utilizing a deep-blue dominant palette (`#050B16`, `#071426`, `#0A1A30`, `#0D2038`, `#17395C`) with semantic status indicators (Green `#10B981`, Amber `#F59E0B`, Red `#EF4444`) restricted strictly to real operational state. Eliminate redundant geographic visuals by establishing a single real geographical map (`LiveThreatMap`) paired with a dedicated linear operational causality progression (`ShipmentSecurityRoute`). Implement progressive disclosure drawers across the Safety Center, Flight Recorder, Attack Simulator, and Shipment DNA to maximize readability, maintain generous spacing (card padding $\ge 24\text{px}$, section gaps $32\text{px}-40\text{px}$), and eliminate visual clutter.

