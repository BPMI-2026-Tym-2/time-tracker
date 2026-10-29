# Architektonický přehled

## Hlavní části

```text
Frontend (Next.js)
        │ HTTP
        ▼
Backend (Express)
        │ service → repository
        ▼
Prisma → MongoDB
```

Balíček `@time-tracker/shared` obsahuje veřejné API kontrakty, které mohou
importovat frontend i backend.

## Backendový tok

```text
route
  ↓
controller
  ↓
service
  ↓
repository
  ↓
Prisma
  ↓
mapper
  ↓
API response
```

U tasků je tento tok implementovaný pro `POST /tasks` a `GET /tasks/:id`.

## Zdroje pravdy

```text
backend/prisma/schema.prisma
    = databázový model

shared/src/schemas/
    = veřejné request/response kontrakty API
```

Prisma model není automaticky veřejným API modelem. Mapper explicitně převádí
databázový záznam na response typ.

## Importní hranice

```text
frontend → @time-tracker/shared
backend  → @time-tracker/shared
backend  → Prisma

frontend ✕ backend/src
frontend ✕ Prisma
shared   ✕ Express
shared   ✕ PrismaClient
```
