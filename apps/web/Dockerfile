FROM node:20-bookworm-slim AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate && pnpm install
COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start"]
