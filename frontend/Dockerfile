FROM node:22-slim AS build

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY shared/package.json shared/package.json
RUN npm ci --ignore-scripts

COPY . .
RUN npm run generate
RUN npm run build:shared
RUN npm run build --workspace frontend

FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static ./frontend/.next/static
COPY --from=build /app/frontend/public ./frontend/public

EXPOSE 3000
CMD ["node", "frontend/server.js"]
