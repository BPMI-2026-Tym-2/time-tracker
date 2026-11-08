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

## Funkční modul: Nastavení skupiny (Group Settings)

Implementace use casu **Zobrazit nastavení skupiny + úprava skupiny** podle BUC a FeaTHer wireframu.

### Umístění a routy

- Routa: `/groups/[groupId]/settings`
- Entrypoint stránky: `frontend/src/app/groups/[groupId]/settings/page.tsx`
- Hlavní komponenta: `frontend/src/components/features/groups/group-settings-page.tsx`

### Architektura komponent

Komponenty pro nastavení skupiny jsou dekomponovány do přehledných modulů v `frontend/src/components/features/groups/settings/`:

- `BasicInfoCard` – název skupiny, popisek, volba ikony/loga a viditelnosti (veřejná/soukromá).
- `CategoriesCard` – správa a výběr kategorie skupiny s možností vytvoření nové kategorie.
- `RolesCard` – přepínače oprávnění pro administrátory skupiny (přidělování rolí, odebírání členů).
- `MembersCard` – seznam členů skupiny, jejich role, odznaky a tlačítko pro vygenerování pozvánkového kódu.
- `BackgroundCard` – vizuální přizpůsobení a výběr modrého barevného schématu.
- `SettingsSidebar` – postranní panel s rychlou navigací mezi sekcemi a zobrazením administrátora.
- `SettingsDialogs` – modální dialogy pro potvrzení akcí (odebrání člena, zkopírování pozvánkového kódu, odstranění skupiny).
- `SettingsStatusScreens` – stavové obrazovky pro načítání (skeleton), odepření přístupu (HTTP 403), chybu sítě a potvrzení smazání skupiny.
- `OdstraneniSkupiny` (`components/features/OdstraneniSkupiny.tsx`) – dedikovaná komponenta pro odstranění skupiny (Tok A4).

### State Management a komunikace s API

- **API klient (`frontend/src/lib/api/groups.ts`)**:
  - `fetchGroupSettings(groupId)` – volá `GET /groups/:groupId/settings` s podporou credentials.
  - `updateGroupSettings(groupId, payload)` – volá `PATCH /groups/:groupId/settings`.
  - `fetchGroupMembers(groupId)` – volá `GET /groups/:groupId/members`.
- **Custom Hook (`frontend/src/hooks/use-group-settings.ts`)**:
  - Zapouzdřuje React Query dotazy a mutace pro načítání a aktualizaci nastavení.
  - Provádí automatickou invalidaci cache po úspěšném uložení.
- **Prevence Lost Updates**:
  - Formulář sleduje výchozí stav a kalkuluje diff (`diffPayload`).
  - Do `PATCH` požadavku se odesílají pouze skutečně upravené atributy.
  - Tlačítko _Uložit_ je neaktivní, pokud ve formuláři neproběhla žádná změna.

### Pokrytí alternativních toků (BUC)

- **A1: Zrušení úprav**: Tlačítko _Zrušit_ na spodní liště vrátí formulář do původního stavu načteného ze serveru.
- **A2: Neoprávněný přístup**: Při pokusu nečlena o přístup (HTTP 403) se zobrazí zabezpečená obrazovka `SettingsAccessDeniedScreen`.
- **A3: Chyba při ukládání**: Při selhání sítě nebo serveru se zobrazí chybová hláška s možností akci opakovat.
- **A4: Odstranění skupiny**: Po potvrzení v modálním dialogu se zobrazí potvrzovací obrazovka `GroupDeletedScreen` s toast notifikací.
