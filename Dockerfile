FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Chromium for whatsapp-web.js and system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    python3 make g++ \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Dependencies Stage
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile

# Development Stage (default for local docker compose)
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .

RUN groupadd --gid 1001 volta && \
    useradd --uid 1001 --gid volta --shell /bin/sh --create-home volta && \
    mkdir -p /app/backend/.wwebjs_auth && \
    chown -R volta:volta /app

USER volta
EXPOSE 3000 3001
CMD ["pnpm", "run", "dev"]

# Builder Stage for Production
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .

ARG DATABASE_URL
ARG API_KEY
ARG BACKEND_JWT_SECRET
ARG LOPD_HMAC_SECRET

RUN pnpm --filter backend prisma:generate
RUN pnpm --filter frontend build

# Runner Stage for Production
FROM base AS runner
ENV NODE_ENV=production

RUN groupadd --gid 1001 volta && \
    useradd --uid 1001 --gid volta --shell /bin/sh --create-home volta && \
    mkdir -p /app/backend/.wwebjs_auth && \
    chown -R volta:volta /app

COPY --chown=volta:volta . .
COPY --from=builder --chown=volta:volta /app /app

USER volta
EXPOSE 3000 3001
CMD ["pnpm", "start"]
