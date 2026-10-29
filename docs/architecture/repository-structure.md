# Struktura repozitáře

```text
.
├── backend/       # Express API a Prisma
├── frontend/      # Next.js aplikace
├── shared/        # API kontrakty FE/BE
├── tests/         # integrační a databázové testy
├── docs/          # projektová dokumentace
└── compose.yml    # lokální MongoDB a produkční stack
```

## Backend

```text
backend/src/
├── config/        # runtime konfigurace
├── db/            # Prisma client a databázová infrastruktura
├── modules/       # feature moduly
├── shared/        # backendová infrastruktura
└── ...
```

Feature modul má odpovědnosti rozdělené takto:

| Soubor            | Odpovědnost                   |
| ----------------- | ----------------------------- |
| `*.routes.ts`     | URL, HTTP metoda a middleware |
| `*.controller.ts` | HTTP request a response       |
| `*.service.ts`    | business logika a orchestrace |
| `*.repository.ts` | databázové dotazy             |
| `*.mapper.ts`     | DB model → API response       |
| `*.schemas.ts`    | lokální validační schémata    |
| `*.types.ts`      | interní typy feature          |

## Shared package

```text
shared/src/
├── schemas/       # Zod request/response schémata
└── index.ts       # veřejný export balíčku
```

Generovaný Prisma/Zod výstup je v `backend/src/generated` a do shared
balíčku se neexportuje.

## Frontend

```text
frontend/src/
├── app/                    # Next.js routy, stránky a layouty
├── components/
│   ├── ui/                 # obecné UI komponenty
│   ├── features/           # komponenty konkrétních funkcí
│   │   └── tasks/          # task komponenty
│   └── layout/             # společné rozložení aplikace
├── hooks/                  # znovupoužitelné React hooky
├── lib/
│   ├── api/                # komunikace s backendem
│   ├── formatters/         # formátování dat
│   └── utils.ts            # obecné utility
└── types/                  # frontend-only typy
```

Frontendové API volání patří do `lib/api`. Obecné UI komponenty v `components/ui`
nemají znát konkrétní doménu, například tasky nebo auth. Feature komponenty
patří do podsložek `components/features` podle funkce.
