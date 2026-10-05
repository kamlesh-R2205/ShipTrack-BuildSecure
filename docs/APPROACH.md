# Project Approach & Architecture — Build Secure 24

**Team ID:** [Assigned Organizer ID]  
**Project Name:** ShipTrack — Secure Delivery & Logistics Management Platform  
**Team Size:** [2 or 4 Members]  
**Primary Track / Domain:** PS-05: ShipTrack — Delivery & Shipment Management  

---

## 1. Problem Understanding, Scope & Threat Model

### 1.1 Problem Statement & Real-World Motivation
Logistics and shipment platforms are mission-critical services handling high-value physical assets, sensitive consumer PII (home addresses, contact numbers, order contents), and complex multi-stakeholder operational workflows. Traditional logistics applications commonly suffer from severe architectural security vulnerabilities:
- **Broken Object-Level Authorization (BOLA / IDOR):** Attackers or competitor couriers enumerate parcel IDs (`/api/shipments/:id`) to intercept delivery routing and customer personal information.
- **Business Logic State Tampering:** Rogue delivery agents mark packages as "Delivered" without dispatch, or malicious consumers cancel orders mid-route to trigger fraudulent payment reversals.
- **Mass Assignment & Privilege Escalation:** Unsanitized registration endpoints allowing public users to grant themselves dispatcher or administrator privileges.
- **PII Leakage via Public Tracking:** Tracking endpoints returning full names, telephone numbers, and street addresses to unauthenticated callers.

ShipTrack is engineered from the ground up to solve these vulnerabilities on the **server-side**, providing zero-trust operational safety across Customers, Drivers, and Dispatch Administrators.

### 1.2 Target Users & Personas
1. **Customer (Untrusted User):** Can register, dispatch parcels, track their own dispatches, and cancel orders prior to driver pickup. Strictly isolated from all other customers' shipments.
2. **Driver (Semi-Trusted Fleet Operator):** Authenticated courier. Can view assigned deliveries, inspect shipment details, and execute valid state transitions (`ASSIGNED` -> `PICKED_UP` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> `DELIVERED`). Denied access to unassigned parcels, administrative functions, or customer accounts.
3. **Admin / Dispatcher (Trusted Authority):** Full system visibility. Manages driver assignments, reviews system-wide telemetry, inspects real security incident audit logs, and controls platform configuration.

### 1.3 Threat Model & Attack Surface
- **Critical Assets:** User credentials, bcrypt password hashes, JWT session secrets, customer PII, package valuations, delivery route checkpoints, and immutable security audit logs.
- **Potential Attack Vectors:** BOLA/IDOR object enumeration, state machine bypasses, mass assignment escalation, brute-force credential stuffing, cross-driver queue snooping, and PII OSINT scraping.
- **OWASP Top 10 Alignments:**
  - A01: Broken Access Control -> Defended via server-side ABAC and strict user-shipment relationship validation.
  - A02: Cryptographic Failures -> Defended via bcrypt (salt rounds = 12), signed HMAC-SHA256 JWTs, unguessable cryptographically random tracking numbers.
  - A04: Insecure Design -> Defended via deterministic Finite State Machine (FSM) enforcing valid status transitions.
  - A09: Security Logging & Monitoring Failures -> Defended via authentic MongoDB `SecurityLog` telemetry capturing 401s, 403s, and 422s in real-time.

---

## 2. Technical Architecture & Secure System Design

### 2.1 High-Level Architecture Overview
ShipTrack adopts a modular, monolithic MERN architecture designed for rapid 24-hour hackathon execution without operational complexity:
```text
[ Browser / Mobile Client ] 
        │ (HTTPS / REST API)
        ▼
[ Security Edge Middleware ] (Rate Limiting, Helmet Security Headers, Strict CORS)
        │
        ▼
[ Ingress Schema Validation ] (Allowlisting, Type Validation, Mass Assignment Defense)
        │
        ▼
[ Authentication Barrier ] (JWT Verification, Account Lockout, Bcrypt Hashing)
        │
        ▼
[ Dual-Layer Authorization ]
  ├── Layer 1: RBAC (CUSTOMER, DRIVER, ADMIN)
  └── Layer 2: ABAC / Object Ownership (Customer = Owner, Driver = Assigned)
        │
        ▼
[ Finite State Machine (FSM) Engine ] (Status Transition Verification & Checkpoint Logging)
        │
        ▼
[ Persistence Tier ] (MongoDB Mongoose ORM + Immutable SecurityLog Audit Collection)
```

### 2.2 Data Flow & Component Interaction
1. **Request Ingress:** Request hits Express rate limiter (200 req / 15 min) and security headers middleware.
2. **Authentication:** `requireAuth` validates JWT token signature and attaches sanitized `req.user`.
3. **Authorization:** `requireRole` verifies RBAC permissions; `authorizeShipmentAccess` fetches the resource, performs object-level tenant checking, and rejects cross-tenant access with HTTP 403.
4. **State Machine Execution:** `transitionShipmentStatus` evaluates `ALLOWED_TRANSITIONS[currentStatus]` before mutating status.
5. **Security Telemetry:** Every authorization rejection or state jump violation triggers asynchronous event logging to `SecurityLog`.

### 2.3 Technology Stack Rationale
- **Backend Framework: Express.js (Node.js 24)** — High-performance, asynchronous I/O, mature security middleware ecosystem.
- **Frontend / Client: React 18 + Vite** — High-speed development, responsive component hierarchy, seamless live client-side routing.
- **Database: MongoDB (Mongoose 8)** — High-throughput document store with native schema validation and rich aggregation pipelines.
- **Authentication & Cryptography: Bcrypt.js & JsonWebToken** — Industry-standard salted password hashing and tamper-evident claims.

---

## 3. Implementation Milestones & 24-Hour Timeline

| Milestone / Phase | Time Window | Key Objectives & Deliverables | Security Verification | Status |
|---|---|---|---|---|
| **Phase 1: Foundation & Core Functionality** | 0h – 6h | MERN architecture scaffold, RBAC, BOLA/IDOR protection, FSM state machine, complete responsive UI | Automated test suite (32/32 tests passing) | `Completed` |
| **Phase 2: Security Hardening & Defenses** | 6h – 14h | Advanced rate limiting, CSRF tokens, input sanitization, proof-of-delivery upload security | SAST scans & penetration scenarios | `Planned` |
| **Phase 3: Attack-Defense Verification** | 14h – 18h | Explicit automated exploit test runners verifying live blocked attacks | Regression suite & judge demo prep | `Planned` |
| **Phase 4: Cloud Deployment & Freeze** | 18h – 24h | Live cloud deployment (Render/Railway), deployment records, commit SHA freeze | Live URL verification & freeze | `Planned` |

---

## 4. Architecture Decision Records (ADRs)

### ADR-001: Server-Side Object-Level Authorization & BOLA/IDOR Defense
- **Status:** Accepted
- **Context:** Shipment management APIs typically expose resource identifiers in URL parameters (`/api/shipments/:id`). If authorization checks only verify that the user is logged in, any authenticated user can iterate IDs to access other users' shipments.
- **Decision:** Implement dedicated `authorizeShipmentAccess` middleware executed before all resource operations. 
  - If `role === 'ADMIN'`: Permit access.
  - If `role === 'CUSTOMER'`: Enforce `shipment.sender === req.user._id`.
  - If `role === 'DRIVER'`: Enforce `shipment.assignedDriver === req.user._id`.
  - Violations immediately terminate with HTTP 403 and trigger `FORBIDDEN_RESOURCE_ACCESS` security telemetry.
- **Trade-offs:** Adds one database lookup prior to route handler, which is mitigated by attaching `req.shipment` directly to avoid redundant queries.

### ADR-002: Deterministic Finite State Machine (FSM) for Shipment Lifecycle
- **Status:** Accepted
- **Context:** Couriers and customers may attempt out-of-order or unauthorized status updates (e.g. marking `CREATED` directly to `DELIVERED`, or cancelling parcels while in transit).
- **Decision:** Model the entire shipment lifecycle via a strict state machine matrix in `src/server/config/constants.js`. All status mutations must pass `transitionShipmentStatus` validation. Invalid jumps return HTTP 422 Unprocessable Entity and log `INVALID_STATE_TRANSITION`.
- **Trade-offs:** Prevents ad-hoc status overrides; administrative overrides require explicit auditable reassignments.

---

## 5. Engineering Journal & Real-Time Decision Log

### 2026-10-05 Entry 1: Phase 1 Foundation & Core Architecture Launch
- **Focus:** Complete project scaffold, MERN stack integration, server-side defensive authorization, FSM lifecycle engine, responsive SaaS UI, and automated test suite.
- **Deliverables:**
  - 32 automated verification tests authored and passing with 100% success rate.
  - Zero client-side security trust: BOLA/IDOR, RBAC, mass assignment, and invalid state transitions strictly blocked on server.
  - Frontend built and compiled cleanly with Vite.
