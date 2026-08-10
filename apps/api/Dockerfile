FROM oven/bun:1.3.1-slim AS base

ENV PORT=8000
ENV NODE_ENV=development
ENV BETTER_AUTH_SECRET=
ENV BETTER_AUTH_URL=http://localhost:5173
ENV DATABASE_URL=postgresql://user:password@localhost:5432/caritasdb
ENV VALKEY_URL=valkey://default:your_valkey_password@localhost:6379/0
ENV GOOGLE_CLIENT_ID=
ENV GOOGLE_CLIENT_SECRET=
ENV SMTP_HOST=smtp.gmail.com
ENV SMTP_PORT=587
ENV SMTP_USER=your_email@gmail.com
ENV SMTP_APP_PASSWORD=your_app_password
ENV CLOUDFLARE_TURNSTILE_SECRET_KEY=

FROM base AS builder
WORKDIR /app
RUN bun i -g turbo@^2
COPY . .

RUN turbo prune api --docker

FROM base AS installer
RUN apt-get update && apt-get install -y g++ make python3 && rm -rf /var/lib/apt/lists/*

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