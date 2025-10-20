ARG VITE_API_URL=https://caritas.dev.fabzio.ip-ddns.com
ARG VITE_GOOGLE_CLIENT_ID=381831022349-oc421cd5jg888jnlces6lvnkmq0brkp3.apps.googleusercontent.com
ARG VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAAB3NCsVLdXRV7O1H
FROM oven/bun:1.3-slim AS base
FROM base AS builder
WORKDIR /app
RUN bun i -g turbo@^2
COPY . .

RUN turbo prune frontend --docker

FROM base AS installer
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_CLOUDFLARE_TURNSTILE_SITE_KEY

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=${VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}

RUN apt-get update && apt-get install -y g++ make python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN bun install
COPY --from=builder /app/out/full/ .

RUN bun run build --filter=frontend

FROM nginx:stable-alpine
COPY --from=installer /app/apps/frontend/dist /usr/share/nginx/html
COPY --from=installer /app/apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
