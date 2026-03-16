FROM node:25-alpine

RUN npm install -g pnpm@10.32.1

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared

RUN pnpm install --frozen-lockfile

CMD ["pnpm", "--filter", "@shortener/db", "migrate:prod"]
