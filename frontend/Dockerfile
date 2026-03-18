FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json shared/
COPY frontend/package.json frontend/

RUN pnpm install --frozen-lockfile

COPY shared/ shared/
COPY frontend/ frontend/

RUN pnpm -F @frostleaf/shared build

EXPOSE 5173

CMD ["pnpm", "-F", "@frostleaf/frontend", "dev", "--", "--host"]
