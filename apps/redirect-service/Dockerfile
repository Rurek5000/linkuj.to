FROM node:25-alpine AS builder

RUN npm install -g pnpm@10.32.1

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/redirect-service ./apps/redirect-service

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @shortener/shared build
RUN pnpm --filter @shortener/db build
RUN pnpm --filter @shortener/redis build
RUN pnpm --filter @shortener/redirect-service build

RUN CI=true pnpm prune --prod

FROM node:25-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/redirect-service/dist ./apps/redirect-service/dist
COPY --from=builder /app/apps/redirect-service/package.json ./apps/redirect-service/package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/redirect-service/node_modules ./apps/redirect-service/node_modules

EXPOSE 3002

CMD ["node", "apps/redirect-service/dist/index.js"]
