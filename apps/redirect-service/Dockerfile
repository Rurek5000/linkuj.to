FROM node:25-alpine3.22 AS builder

RUN yarn global add pnpm@latest

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
<<<<<<<< HEAD:apps/url-service/Dockerfile
COPY apps/url-service ./apps/url-service
========
COPY apps/redirect-service ./apps/redirect-service
>>>>>>>> origin/main:apps/redirect-service/Dockerfile

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @shortener/shared build
RUN pnpm --filter @shortener/db build
<<<<<<<< HEAD:apps/url-service/Dockerfile
RUN pnpm --filter @shortener/url-service build
========
RUN pnpm --filter @shortener/redis build
RUN pnpm --filter @shortener/redirect-service build
>>>>>>>> origin/main:apps/redirect-service/Dockerfile

FROM node:25-alpine3.22 AS runner

RUN yarn global add pnpm@latest

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/turbo.json ./
<<<<<<<< HEAD:apps/url-service/Dockerfile
COPY --from=builder /app/apps/url-service ./apps/url-service
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["pnpm", "--filter", "@shortener/url-service", "dev"]
========
COPY --from=builder /app/apps/redirect-service ./apps/redirect-service
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3002

CMD ["pnpm", "--filter", "@shortener/redirect-service", "dev"]
>>>>>>>> origin/main:apps/redirect-service/Dockerfile
