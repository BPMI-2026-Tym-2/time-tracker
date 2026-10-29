# Shared package

`@time-tracker/shared` je workspace balíček pro veřejné kontrakty mezi
frontendem a backendem.

```text
shared/src/
├── schemas/       # Zod request/response schémata
└── index.ts       # veřejný export
```

## Pravidla

Shared package může používat Zod, ale nesmí záviset na:

- `PrismaClient`,
- Prisma-generated databázových modelech,
- Expressu,
- backendové business logice.

Databázové schema je v `backend/prisma/schema.prisma`. API schema je ve
`shared/src/schemas`. Typy se odvozují ze Zod schémat pomocí `z.infer`.

Po změně shared balíčku spusťte:

```sh
npm run build:shared
```

Při vývoji lze použít watch režim:

```sh
npm run dev --workspace shared
```
