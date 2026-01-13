FROM node:24-slim AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY apps/backend apps/backend
COPY packages/shared packages/shared

RUN pnpm -F @web24/shared build
RUN pnpm -F @web24/backend build

FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/apps/backend /app/apps/backend

# Ensure directories are accessible when running as non-root.
RUN chown -R node:node /app/node_modules /app/packages/shared /app/apps/backend \
  && chmod -R u=rwX,go=rX /app/node_modules /app/packages/shared /app/apps/backend

EXPOSE 3000

WORKDIR /app/apps/backend

USER node

CMD ["node", "dist/main"]
