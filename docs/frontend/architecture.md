# Frontendová architektura

Frontend používá Next.js App Router:

```text
frontend/src/app/
    └── routy, layouty a stránky

frontend/src/components/
├── ui/
│   └── obecné znovupoužitelné UI komponenty
├── features/
│   └── komponenty konkrétních funkcí
└── layout/
    └── header, navigace a layout aplikace

frontend/src/lib/
├── api/
│   └── komunikace s backendem
├── formatters/
│   └── formátování dat pro zobrazení
└── utils.ts
    └── obecné frontendové utility

frontend/src/hooks/
    └── znovupoužitelná React logika

frontend/src/types/
    └── frontend-only typy
```

Komponenty dodané shadcn/ui patří do `frontend/src/components/ui`. Feature
komponenty patří do samostatných podsložek podle funkce, například:

```text
frontend/src/components/features/tasks/
```

Stránky v `app/` mají řešit routing a skládání obrazovky. Vizuální a
znovupoužitelné části patří do `components/`. Komunikace s backendem patří do
`lib/api`, nikoliv přímo do obecných UI komponent.

API kontrakty se importují z `@time-tracker/shared`. Frontend nemá importovat
Prisma typy ani soubory z `backend/src`.

Složky `hooks`, `lib/api`, `lib/formatters`, `types`, `components/features` a
`components/layout` jsou připravené pro další vývoj. Prázdné složky samy o sobě
neobsahují implementaci.

API klient zatím není v repozitáři implementovaný. Při jeho přidání by měl
používat `NEXT_PUBLIC_API_URL` a response schémata ze shared balíčku.
