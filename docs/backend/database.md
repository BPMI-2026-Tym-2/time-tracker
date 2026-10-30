# Databáze

## MongoDB

Lokální MongoDB běží přes Docker Compose jako replica set `rs0`. Replica set
je nutný pro Prisma transakce.

```sh
npm run db:up
npm run db:logs
npm run db:down
```

## Prisma

Databázové schema je v
[backend/prisma/schema.prisma](../../backend/prisma/schema.prisma). Po jeho
změně spusťte:

```sh
npm run generate
```

Prisma Client i generované Prisma/Zod typy zůstávají backend-only. Generované
soubory v `backend/src/generated` se neupravují ručně.

MongoDB nepoužívá Prisma Migrate. Změny uložených dat je potřeba řešit
samostatně podle konkrétního transformačního skriptu nebo jiného migračního
postupu.

## Aktuální model

Schema aktuálně obsahuje model `Task`:

- `id`,
- `title`,
- volitelný `description`,
- `createdAt`.

API response není přímo Prisma model. Převod zajišťuje
`backend/src/modules/tasks/task.mapper.ts`.

### Skupiny

- `Group` – `id`, `name`, `createdAt`, `updatedAt`.
- `GroupMember` – členství uživatele ve skupině: `groupId`, `userId`,
  `role` (`"member"` nebo `"owner"` = zakladatel) a `joinedAt`. Dvojice
  `groupId` + `userId` je unikátní.
- `User.role` – aplikační role `"user"` (výchozí) nebo `"superAdmin"`.

Při smazání skupiny nebo uživatele se příslušná členství smažou automaticky
(`onDelete: Cascade`). Zakladatele ze skupiny může odebrat jen super admin;
smazání zakladatele má smazat celou skupinu. To Prisma relace sama neumí,
takže to musí udělat kód, který uživatele maže (v transakci: nejdřív skupiny,
kde je `owner`, potom uživatele).
