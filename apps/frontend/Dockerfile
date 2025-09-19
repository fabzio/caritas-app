FROM oven/bun:1.2.21-slim AS base

ARG VITE_API_URL=http://localhost/api/v1
ARG VITE_GOOGLE_CLIENT_ID=381831022349-oc421cd5jg888jnlces6lvnkmq0brkp3.apps.googleusercontent.com

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

FROM base AS builder
WORKDIR /app
RUN bun i -g turbo@^2
COPY . .

RUN turbo prune frontend --docker

FROM base AS installer
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
