# Vývojový workflow

## Běžné příkazy

| Potřeba              | Příkaz                 |
| -------------------- | ---------------------- |
| Celý vývoj           | `npm run dev`          |
| Pouze frontend       | `npm run dev:frontend` |
| Pouze backend        | `npm run dev:backend`  |
| MongoDB up           | `npm run db:up`        |
| MongoDB logy         | `npm run db:logs`      |
| MongoDB down         | `npm run db:down`      |
| Regenerace souborů   | `npm run generate`     |
| Lint                 | `npm run lint`         |
| Formátování          | `npm run format`       |
| Kontrola formátování | `npm run format:check` |
| Typecheck            | `npm run typecheck`    |
| Kompletní ověření    | `npm run verify`       |

Po změně [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)
spusťte `npm run generate`. MongoDB nepoužívá Prisma Migrate; změny již
uložených dat je potřeba řešit podle konkrétní změny modelu.

Po změně `shared/src` spusťte `npm run build:shared`. Při souběžné práci lze
použít:

```sh
npm run dev --workspace shared
```

## Branching a pull requesty

Pracujte ve feature branchi vytvořené z `dev`:

```sh
git checkout dev
git pull
git checkout -b feature/kratky-popis
```

Před otevřením pull requestu spusťte:

```sh
npm run verify
```

U změn databáze spusťte také `npm run test:db` s běžící MongoDB.
Pull request musí zachovat strukturu z
[.github/pull_request_template.md](../.github/pull_request_template.md).

## Pravidla hranic

- Frontend importuje veřejné kontrakty z `@time-tracker/shared`.
- Backend může importovat `@time-tracker/shared` i Prisma typy.
- Frontend nesmí importovat `backend/src` ani Prisma typy.
- `shared` nesmí importovat Express ani `PrismaClient`.
- Databázové změny patří do Prisma schema, API změny do `shared/src`.
