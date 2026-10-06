# ==============================================================================
# Multi-stage production Docker build for ShipTrack Guard Control Plane
# ==============================================================================

# Stage 1: Build client frontend assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Minimal production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy pre-compiled Vite frontend bundle
COPY --from=builder /app/dist ./dist

# Copy backend application
COPY server ./server

# Non-root user for defensive execution
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server/index.js"]
