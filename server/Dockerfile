# syntax=docker/dockerfile:1

# ---- base: Node + OpenSSL (required by Prisma's query engine) ----
FROM node:24-slim AS base
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- build: install all deps, compile, then drop dev deps ----
FROM base AS build
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# ---- runtime: only what's needed to run ----
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
RUN mkdir -p prisma/data && chown -R node:node /app
USER node
EXPOSE 3000
# Lets Docker / Compose report the container as healthy only once the API answers.
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Apply pending migrations (creates the SQLite file on first boot), then start.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main"]
