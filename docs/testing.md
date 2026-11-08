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

## Test seznamu členů skupiny

Test služby pro seznam členů skupiny (scénář Tereza/Adam/Klára) také vyžaduje
běžící MongoDB replica set se synchronizovaným schématem. Databáze se bere
z `DATABASE_URL` (jinak z `backend/.env`); testovací data po sobě smaže.

```sh
npm run db:up
node --import tsx --test tests/group-members.test.ts
```

## Test nastavení skupiny a zabezpečení

HTTP testy pro use case _Zobrazit nastavení skupiny + úprava skupiny_ ověřují kompletní bezpečnostní a autorizační pravidla:

- CORS preflight a povolení metody `PATCH`,
- Odmítnutí nepodepsaných cookies a podvržených hlaviček (`x-user-*`) kódem `401 Unauthorized`,
- Odepření přístupu pro nečlena skupiny (`403 Forbidden`),
- Read-only režim pro běžného člena (skrytí e-mailu zakladatele, zákaz `PATCH`),
- Úpravu nastavení vlastníkem a superAdminem,
- Podporu skupin bez vlastníka (`owner: null`).

Spuštění testů:

```sh
npm test
# nebo explicitně:
node --import tsx --test tests/group-settings.test.ts
```

## Kam přidávat testy

- databázové testy patří do `tests/`,
- testy backendových modulů patří k odpovídajícímu modulu,
- API kontrakty se ověřují přes Zod schémata ve `shared/src`,
- frontendové testy patří k testované komponentě nebo feature.

Pokud test vyžaduje MongoDB, musí to být v jeho názvu nebo dokumentaci
zřejmé. Kontroly lint, formátování, typecheck a build databázi nepotřebují.
