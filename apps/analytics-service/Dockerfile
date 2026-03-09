FROM node:25-alpine3.22 AS builder

RUN yarn global add pnpm@latest

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/analytics-service ./apps/analytics-service

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @shortener/analytics-service build

FROM node:25-alpine3.22 AS runner

RUN yarn global add pnpm@latest

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/turbo.json ./
COPY --from=builder /app/apps/analytics-service ./apps/analytics-service
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3003

CMD ["pnpm", "--filter", "@shortener/analytics-service", "dev"]
