# Time Tracker

Time Tracker je webová aplikace pro evidenci úkolů a času stráveného jejich
řešením. Repozitář je rozdělený na frontend, backend a sdílený balíček
API kontraktů.

## Rychlý start

Požadavky:

- Node.js 22.x
- npm 10+
- Docker s Docker Compose

```sh
npm ci
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev
```

Po spuštění:

- frontend: <http://localhost:3000>
- backend: <http://localhost:3001>
- MongoDB: `127.0.0.1:27017`

## Nejčastější příkazy

| Potřeba                   | Příkaz                 |
| ------------------------- | ---------------------- |
| Celý vývoj                | `npm run dev`          |
| Pouze frontend            | `npm run dev:frontend` |
| Pouze backend             | `npm run dev:backend`  |
| Spuštění databáze         | `npm run db:up`        |
| Generování a build shared | `npm run generate`     |
| Kontrola projektu         | `npm run verify`       |
| Databázový test           | `npm run test:db`      |

## Workspace balíčky

- [`frontend/`](./frontend/) – Next.js aplikace a uživatelské rozhraní
- [`backend/`](./backend/) – Express API, aplikační logika a Prisma
- [`shared/`](./shared/) – Zod API schémata a typy sdílené mezi FE a BE
- [`tests/`](./tests/) – integrační a databázové testy

## Dokumentace

Podrobná dokumentace je v [`docs/`](./docs/):

- [Dokumentace projektu](./docs/README.md)
- [Instalace a rychlý start](./docs/getting-started.md)
- [Vývojový workflow](./docs/development.md)
- [Testování](./docs/testing.md)
- [Slovníček pojmů](./docs/glossary.md)
- [Architektura](./docs/architecture/overview.md)
- [Backend](./docs/backend/README.md)
- [Frontend](./docs/frontend/README.md)
- [Shared package](./docs/shared/README.md)
