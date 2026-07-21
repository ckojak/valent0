FROM oven/bun:1.2.20 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install

FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS prod
ENV NODE_ENV=production
COPY --from=build /app .
EXPOSE 3000
CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "3000"]
