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

## Environment konfigurace

Povinné environment proměnné se načítají pomocí helperu `requiredEnv` z
`backend/src/config/env.ts`. Helper odstraní okolní mezery a při chybějící nebo
prázdné hodnotě vyhodí explicitní chybu.

Při přidávání konfigurace, která bez environment proměnné nemůže bezpečně
fungovat, se má použít `requiredEnv` místo přímého čtení `process.env`.

Volitelné proměnné s definovanou výchozí hodnotou, například `PORT` nebo
`CORS_ORIGIN`, zůstávají zpracované v konfiguraci vlastním validačním helperem
nebo fallbackem.
