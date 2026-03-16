FROM node:25-alpine3.22 AS builder

RUN yarn global add pnpm@latest

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/management-service ./apps/management-service

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @shortener/management-service build

FROM node:25-alpine3.22 AS runner

RUN yarn global add pnpm@latest

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/turbo.json ./
COPY --from=builder /app/apps/management-service ./apps/management-service
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3004

CMD ["pnpm", "--filter", "@shortener/management-service", "dev"]
