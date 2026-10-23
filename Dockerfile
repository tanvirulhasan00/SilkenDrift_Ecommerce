# ==============================================================================
# SilkenDrift E-Commerce — Production Multi-Stage Dockerfile
# Optimized for Node.js 20 LTS & React Router v7 SPA/SSR Server
# ==============================================================================

# --- Stage 1: Build Dependencies & Compile Assets ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package manifests and lockfile
COPY package.json package-lock.json ./

# Install exact dependencies
RUN npm ci

# Copy application source code
COPY . .

# Run type check and production build
RUN npm run build

# --- Stage 2: Minimal Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package manifests and production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application assets from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/database ./database
COPY --from=builder /app/public ./public 2>/dev/null || true

# Non-root user for enhanced container security
USER node

EXPOSE 3000

# Start via React Router built-in production serve
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npx", "react-router-serve", "./build/server/index.js"]
