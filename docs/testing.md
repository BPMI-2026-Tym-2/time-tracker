# Testování

## Kontroly celého repozitáře

```sh
npm run lint
npm run format:check
npm run typecheck
npm run build
```

Všechny tyto kontroly lze spustit najednou:

```sh
npm run verify
```

## Databázový test

Databázový integrační test vyžaduje běžící MongoDB replica set:

```sh
npm run db:up
npm run test:db
```

Test vytvoří task v transakci, načte ho, ověří jeho hodnoty a následně ho
smaže. Jinou databázi lze zadat přes `TEST_DATABASE_URL`.

## Kam přidávat testy

- databázové testy patří do `tests/`,
- testy backendových modulů patří k odpovídajícímu modulu,
- API kontrakty se ověřují přes Zod schémata ve `shared/src`,
- frontendové testy patří k testované komponentě nebo feature.

Pokud test vyžaduje MongoDB, musí to být v jeho názvu nebo dokumentaci
zřejmé. Kontroly lint, formátování, typecheck a build databázi nepotřebují.
