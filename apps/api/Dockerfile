FROM oven/bun:1.2.21-slim AS base

ENV PORT=8000
ENV NODE_ENV=development
ENV BETTER_AUTH_SECRET=XwvWrNKewzE0NTdhiGhplUosqjqaU1WC
ENV BETTER_AUTH_URL=http://localhost:5173
ENV DATABASE_URL=postgresql://user:password@localhost:5432/caritasdb
ENV VALKEY_URL=valkey://default:your_valkey_password@localhost:6379/0
ENV GOOGLE_CLIENT_ID=381831022349-oc421cd5jg888jnlces6lvnkmq0brkp3.apps.googleusercontent.com
ENV GOOGLE_CLIENT_SECRET=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
ENV GOOGLE_SMTP_TOKEN=kfmyyhljnsobllkg

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