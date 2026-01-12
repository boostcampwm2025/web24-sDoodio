FROM node:24-slim AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
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
COPY --from=builder /app/apps/backend/package.json /app/apps/backend/package.json
COPY --from=builder /app/apps/backend/dist /app/apps/backend/dist

EXPOSE 3000

WORKDIR /app/apps/backend

CMD ["node", "dist/main"]
