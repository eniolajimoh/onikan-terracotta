FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install --no-install-recommends -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci

COPY prisma ./prisma
COPY server ./server
RUN npm run db:generate

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/client/package.json ./client/package.json
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/src ./server/src
COPY --from=build /app/prisma ./prisma

USER node
EXPOSE 4000
CMD ["node", "server/src/index.js"]
