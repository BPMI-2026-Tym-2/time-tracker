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

## Sdílená backendová infrastruktura

`backend/src/shared` obsahuje obecné backendové části, například:

- `AppError` a centrální error handler,
- async handler pro Express,
- CORS middleware,
- response helpery.
