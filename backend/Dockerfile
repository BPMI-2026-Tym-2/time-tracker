FROM node:22-slim AS build

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY shared/package.json shared/package.json
RUN npm ci --ignore-scripts

COPY . .
RUN npm run generate
RUN npm run build:shared
RUN npm run build --workspace backend

FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY shared/package.json shared/package.json
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/shared/dist shared/dist
COPY --from=build /app/node_modules/.prisma node_modules/.prisma

EXPOSE 3001
CMD ["node", "backend/dist/server.js"]
