FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json shared/
COPY backend/package.json backend/

RUN pnpm install --frozen-lockfile

COPY shared/ shared/
COPY backend/ backend/

RUN pnpm -F @frostleaf/shared build
RUN pnpm -F @frostleaf/backend build

EXPOSE 3000

CMD ["node", "backend/dist/index.js"]
