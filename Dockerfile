FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
RUN corepack enable && pnpm install

COPY . .
RUN pnpm db:generate
RUN pnpm build

CMD ["pnpm", "start"]
