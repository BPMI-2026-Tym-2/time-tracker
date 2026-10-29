# Instalace a rychlý start

## Požadavky

- Node.js 22.x
- npm 10 nebo novější
- Docker s Docker Compose

## Instalace

Spusťte příkazy z kořene repozitáře:

```sh
npm ci
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

`npm ci` vygeneruje Prisma Client, backendové generované soubory a přeloží
balíček `@time-tracker/shared`.

## Spuštění celého vývoje

```sh
npm run dev
```

Tento příkaz spustí MongoDB v Dockeru, backend, frontend a průběžný překlad
shared balíčku.

| Služba   | Adresa                      |
| -------- | --------------------------- |
| Frontend | <http://localhost:3000>     |
| Backend  | <http://localhost:3001>     |
| MongoDB  | `mongodb://127.0.0.1:27017` |

## Samostatné spuštění

Frontend:

```sh
npm run dev:frontend
```

Backend s databází:

```sh
npm run db:up
npm run generate
npm run dev:backend
```

Databázi zastavíte příkazem:

```sh
npm run db:down
```

## Environment

Backend používá [backend/.env.example](../backend/.env.example):

- `PORT` – port HTTP serveru,
- `DATABASE_URL` – MongoDB connection string,
- `CORS_ORIGIN` – povolený frontend origin.

Frontend používá [frontend/.env.example](../frontend/.env.example):

- `NEXT_PUBLIC_API_URL` – URL backendového API dostupná v prohlížeči.
