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

## Test odstranění organizace (skupiny)

Integrační test prochází HTTP endpoint, skutečnou session a oprávnění Better
Auth i Prisma transakci v MongoDB replica setu:

```sh
npm run db:up
node --import tsx --test tests/organization-delete.test.ts
```

Používá samostatnou databázi `time_tracker_organization_delete_test` na lokálním
MongoDB. Jinou testovací databázi lze zadat přes `TEST_DATABASE_URL`.
Test vytvoří vlastní uživatele a session, organizace, členství, pozvánky a
nesouvisející task; po dokončení svá data smaže.

Ověřuje odstranění vlastníkem, zamítnutí nepřihlášeného uživatele, běžného
člena, nečlena a globálního administrátora bez členství; dále neexistující
organizaci, opakované odstranění, zachování nesouvisejících dat, odebrání
přístupu původním členům a rollback při simulované chybě databáze s možností
opakovat požadavek.

## Kam přidávat testy

- databázové testy patří do `tests/`,
- testy backendových modulů patří k odpovídajícímu modulu,
- API kontrakty se ověřují přes Zod schémata ve `shared/src`,
- frontendové testy patří k testované komponentě nebo feature.

Pokud test vyžaduje MongoDB, musí to být v jeho názvu nebo dokumentaci
zřejmé. Kontroly lint, formátování, typecheck a build databázi nepotřebují.
