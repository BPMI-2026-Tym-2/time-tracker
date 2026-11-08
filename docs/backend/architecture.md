# Backendová architektura

## Vrstvy

```text
route
  ↓
controller
  ↓
service
  ↓
repository
  ↓
Prisma
```

- Routes definují endpointy.
- Controllers převádějí HTTP vstupy a výstupy.
- Services obsahují business logiku.
- Repositories obsahují Prisma dotazy.
- Mappery převádějí databázové záznamy na API response.
- Veřejná request a response schémata jsou v `shared/src/schemas`.

## Namespaced API konvence

Backendové moduly a sdílená Zod schémata používají namespaced API,
označované také jako object-based module/service pattern.

Související funkce jsou seskupené pod jedním objektovým namespace místo
samostatných exportů:

```ts
groupService.listMembers(...);
groupRepository.findMembers(...);
groupMapper.toGroupMemberResponse(...);
group.listMembersQuery.parse(request.query);
```

Tento přístup zlepšuje orientaci v kódu, omezuje kolize názvů a jasně ukazuje,
ke kterému modulu daná funkce nebo schema patří.

Např. v group modulu jsou runtime objekty pojmenované podle vrstvy:

- groupService – business logika,
- groupRepository – databázové dotazy,
- groupMapper – převod databázových záznamů na API response,
- groupController – HTTP controllery,
- groupSchema – sdílená Zod schémata.

TypeScript typy zůstávají exportované samostatně, protože jde o compile-time kontrakty:

```ts
import type { GroupRole, ListGroupMembersResponse } from '@time-tracker/shared';
```

Runtime schémata a odvozené typy jsou definované společně v shared/src/schemas/group.schema.ts.

## Task modul

Aktuálně jsou implementované:

- `POST /tasks` – vytvoření tasku,
- `GET /tasks/:id` – načtení tasku podle ID.

Požadavek se validuje přes schema ze shared balíčku, service zavolá
repository, mapper připraví API response a response se ověří response schema.

## Group modul – Nastavení a správa skupiny

Modul implementuje use case **Zobrazit nastavení skupiny + úprava skupiny** podle BUC specifikace:

- `GET /groups/:groupId/settings` – načtení nastavení skupiny, oprávnění přihlášeného uživatele a citlivých informací dle role.
- `PATCH /groups/:groupId/settings` – parciální aktualizace názvu, popisu, kategorie, barevného tématu a loga.

### Tok zpracování požadavku

```text
HTTP Request
    │
    ▼
groupRouter (backend/src/modules/groups/group.routes.ts)
    │
    ▼
groupController (validace vstupních Zod schémat: getSettingsParams, updateSettingsBody)
    │
    ▼
groupService (ověření Better Auth session, kontrola členství a RBAC oprávnění)
    │
    ▼
groupRepository (dotaz do MongoDB přes Prisma Client: findGroupSettingsById, updateGroupSettings)
    │
    ▼
groupMapper (toGroupSettingsResponse: sanitizace dat podle role - např. skrytí e-mailu pro běžné členy)
    │
    ▼
HTTP Response (validováno přes Zod groupSettingsResponse)
```

### Bezpečnost a řízení přístupu (RBAC)

- Autentizace je navázána na podepsané Better Auth session cookies (`auth.api.getSession`).
- Podvržené hlavičky (např. `x-user-id`) jsou ignorovány.
- Uživatel, který není členem dané skupiny, obdrží `403 Forbidden` (aniž by se prozradily citlivé údaje).
- Pouze uživatel s rolí `owner` (vlastník skupiny) nebo globální `superAdmin` může volat `PATCH` a spravovat pozvánkový kód či vidět e-mail vlastníka. Běžný člen (`member`) má nastavení v režimu read-only.

## Sdílená backendová infrastruktura

`backend/src/shared` obsahuje obecné backendové části, například:

- `AppError` a centrální error handler,
- async handler pro Express,
- CORS middleware,
- response helpery.

## Environment konfigurace

Povinné environment proměnné se načítají pomocí helperu `requiredEnv` z
`backend/src/config/env.ts`. Helper odstraní okolní mezery a při chybějící nebo
prázdné hodnotě vyhodí explicitní chybu.

Při přidávání konfigurace, která bez environment proměnné nemůže bezpečně
fungovat, se má použít `requiredEnv` místo přímého čtení `process.env`.

Volitelné proměnné s definovanou výchozí hodnotou, například `PORT` nebo
`CORS_ORIGIN`, zůstávají zpracované v konfiguraci vlastním validačním helperem
nebo fallbackem.
