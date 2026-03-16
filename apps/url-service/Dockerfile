FROM node:25-alpine AS builder

RUN npm install -g pnpm@10.32.1

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/url-service ./apps/url-service

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @shortener/shared build
RUN pnpm --filter @shortener/db build
RUN pnpm --filter @shortener/url-service build


FROM node:25-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/url-service/dist ./apps/url-service/dist
COPY --from=builder /app/apps/url-service/package.json ./apps/url-service/package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/url-service/node_modules ./apps/url-service/node_modules

EXPOSE 3001

CMD ["node", "apps/url-service/dist/index.js"]
