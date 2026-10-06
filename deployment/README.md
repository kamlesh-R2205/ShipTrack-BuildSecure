# Deployment Documentation — Build Secure 24

## Project: ShipTrack Guard
**Defensive Logistics Security Control Plane**

---

## 1. Live Deployment Architecture Overview

ShipTrack Guard is engineered as a decoupled, defense-in-depth full-stack platform:
- **Frontend / SOC Console**: React 18 SPA built with Vite, styled with custom enterprise CSS, and deployable to **Vercel** (with native SPA rewrites via `vercel.json`) or served statically by Express.
- **Backend / Security Control Plane**: Express 4.x running on Node.js 20+, deployable to **Render** (via `render.yaml`), Railway, or any container environment via the provided multi-stage `Dockerfile`.
- **Database**: MongoDB 7.x / MongoDB Atlas with resilient connection failover (`MONGODB_URI` / `MONGO_URI`).

---

## 2. Live Deployment Configuration & References

- **Frontend Hosting Platform:** Vercel (or Render / Docker static bundle)
- **Backend Hosting Platform:** Render (or Railway / Docker container)
- **GitHub Repository:** https://github.com/kamlesh-R2205/ShipTrack-BuildSecure.git
- **Production Health Probes:**
  - `GET /health` -> `{ status: "UP", service: "ShipTrack Guard Control Plane", database: "CONNECTED", ... }`
  - `GET /api/health` -> System health status for reverse proxies and uptime monitoring
- **Evaluation Access Accounts (Pre-seeded Demo Personas):**
  - **Admin / SOC Analyst:** `admin@shiptrack.local` / `AdminPass123!` (Full Control Plane access)
  - **Driver Persona:** `driver@shiptrack.local` / `DriverPass123!` (Driver dispatch & telematics)
  - **Customer Persona:** `customer@shiptrack.local` / `CustomerPass123!` (Parcel tracking & verification)

---

## 3. Required Environment Variables

| Variable Name | Environment | Description | Required | Example Value |
|---|---|---|---|---|
| `NODE_ENV` | Backend | Runtime mode | Yes | `production` |
| `PORT` | Backend | Port Express listens on (auto-bound to `0.0.0.0`) | Yes | `5000` |
| `MONGODB_URI` / `MONGO_URI` | Backend | MongoDB connection string (Atlas or hosted) | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/shiptrack?retryWrites=true&w=majority` |
| `JWT_SECRET` | Backend | Cryptographic key for signing HS256 tokens | Yes | *(Random 64+ char hex string)* |
| `JWT_EXPIRES_IN` | Backend | Token validity duration | No | `24h` (default) |
| `CLIENT_URL` | Backend | Allowed origin for CORS whitelist | Yes | `https://shiptrack-guard.vercel.app` |
| `VITE_API_URL` | Frontend | Backend base URL for API requests | Yes | `https://shiptrack-guard-backend.onrender.com/api` |

---

## 4. Deployment Instructions

### Option A: Cloud Deployment (Vercel + Render)

#### Step 1: Deploy Backend to Render
1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect the GitHub repository: `https://github.com/kamlesh-R2205/ShipTrack-BuildSecure.git`.
4. Configure service parameters:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
5. Under **Environment Variables**, provide:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A cryptographically random secret*
   - `CLIENT_URL`: *Your Vercel URL (e.g. `https://shiptrack-guard.vercel.app`)*
6. Click **Deploy Web Service**. Note your Render URL (e.g. `https://shiptrack-guard-backend.onrender.com`).

#### Step 2: Deploy Frontend to Vercel
1. Sign in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import GitHub repository: `https://github.com/kamlesh-R2205/ShipTrack-BuildSecure.git`.
4. Vercel automatically detects `vercel.json`:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. In **Environment Variables**, configure:
   - `VITE_API_URL`: `https://shiptrack-guard-backend.onrender.com/api`
6. Click **Deploy**. Vercel will build and assign your production domain.

---

### Option B: Self-Contained Production Docker Container

ShipTrack Guard includes a production multi-stage `Dockerfile` that builds the frontend and bundles it directly into the Express backend:

```bash
# 1. Build the production container image
docker build -t shiptrack-guard:latest .

# 2. Run the container with environment variables
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/shiptrack?retryWrites=true&w=majority" \
  -e JWT_SECRET="your_secure_random_production_secret" \
  -e CLIENT_URL="http://localhost:5000" \
  --name shiptrack-guard-app \
  shiptrack-guard:latest

# 3. Verify health
curl http://localhost:5000/health
```

---

## 5. Verification & Health Probes

Once deployed, verify operational readiness with the following checks:

1. **Backend Health Check:**
   ```bash
   curl -i https://<your-backend-url>/health
   # Expected: HTTP 200 OK
   # { "status": "UP", "service": "ShipTrack Guard Control Plane", "database": "CONNECTED", ... }
   ```

2. **Frontend Security Headers Check:**
   ```bash
   curl -i https://<your-backend-url>/health
   # Verify headers:
   # X-Content-Type-Options: nosniff
   # X-Frame-Options: DENY
   # X-XSS-Protection: 1; mode=block
   # Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

3. **Database Seed (Initial Setup):**
   ```bash
   npm run seed
   # Seeds the demo administrative accounts and baseline shipments with cryptographic hash chains.
   ```
