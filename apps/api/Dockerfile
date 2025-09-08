FROM oven/bun:1.2.21-slim AS base

FROM base AS builder
WORKDIR /app
RUN bun i -g turbo@^2
COPY . .

RUN turbo prune api --docker

FROM base AS installer

WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN bun install

COPY --from=builder /app/out/full/ .
RUN bun run build



FROM debian:stable-slim
RUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=installer /app/apps/api/dist ./dist
ENTRYPOINT ["/usr/bin/tini", "--", "./dist/app"]
EXPOSE 8000