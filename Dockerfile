FROM node:22-slim

# Install Chromium for whatsapp-web.js and build tools for native modules
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    python3 make g++ \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root and workspace package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies using workspaces
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install

COPY . .

# Environment variables for puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create non-root user and set ownership
RUN groupadd --gid 1001 volta && \
    useradd --uid 1001 --gid volta --shell /bin/sh --create-home volta && \
    mkdir -p /app/.wwebjs_auth && \
    chown -R volta:volta /app

USER volta

EXPOSE 3000

# We use the root to run workspaces
CMD ["pnpm", "run", "dev"]
