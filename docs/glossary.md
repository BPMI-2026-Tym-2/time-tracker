# Slovníček pojmů

Tento slovníček vysvětluje pojmy a zkratky používané v dokumentaci a ve
zdrojovém kódu projektu.

## API

**API (Application Programming Interface)** je způsob, kterým spolu mohou
komunikovat různé části aplikace. V tomto projektu frontend posílá HTTP
požadavky backendu a backend vrací odpovědi ve formátu JSON.

Příklad:

```text
Frontend → GET /tasks/123 → Backend
Frontend ← JSON odpověď    ← Backend
```

## API kontrakt

API kontrakt je dohoda o tom:

- jaké endpointy existují,
- jaká data se posílají,
- jaký tvar mají odpovědi,
- jaké chyby může API vrátit.

V projektu jsou veřejné API kontrakty definované ve `shared/src/schemas`.

## API endpoint

Endpoint je konkrétní adresa a HTTP metoda, přes kterou lze použít určitou
funkci API.

Příklady:

```text
POST /tasks
GET  /tasks/:id
```

`POST /tasks` vytváří task. `GET /tasks/:id` načítá task podle jeho ID.

## App Router

App Router je způsob routování v Next.js. Struktura složek v
`frontend/src/app` určuje, jaké stránky a URL frontend poskytuje.

## Backend

Backend je část aplikace, která běží na serveru. V tomto projektu přijímá HTTP
požadavky, provádí business logiku, komunikuje s databází a vrací odpovědi
frontendu.

## Business logika

Business logika jsou pravidla aplikace. Nejde pouze o načtení nebo uložení dat,
ale o rozhodnutí, co se má stát.

Příklad:

- ověřit, že task existuje,
- odmítnout prázdný název,
- ověřit oprávnění uživatele,
- rozhodnout, zda lze task upravit.

## Controller

Controller zpracovává HTTP požadavek a připravuje HTTP odpověď. Získává data z
requestu, zavolá service a odešle výsledek klientovi.

Controller by neměl obsahovat databázové dotazy ani rozsáhlou business logiku.

## CORS

CORS (Cross-Origin Resource Sharing) je bezpečnostní pravidlo pro požadavky
mezi různými originy, například mezi frontendem na portu `3000` a backendem na
portu `3001`.

Backend pomocí CORS hlaviček určuje, ze kterých originů smí frontend API
volat.

## Databáze

Databáze je místo, kde se trvale ukládají data aplikace. Tento projekt používá
MongoDB.

## DTO

DTO (Data Transfer Object) je objekt určený pro přenos dat mezi částmi
aplikace. API request a response typy jsou praktickým příkladem DTO.

DTO nemusí odpovídat databázovému modelu.

## Environment proměnná

Environment proměnná je hodnota předaná aplikaci z prostředí, ve kterém běží.
Používá se například pro port, URL databáze nebo URL backendu.

Příklady:

```text
PORT=3001
DATABASE_URL=...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Citlivé hodnoty se nemají ukládat přímo do zdrojového kódu.

## Express

Express je Node.js framework používaný pro tvorbu HTTP serverů a API.
Umožňuje definovat routes, middleware a error handlery.

## Frontend

Frontend je část aplikace, kterou vidí a používá uživatel v prohlížeči. V
tomto projektu je vytvořený pomocí Next.js a Reactu.

## HTTP metoda

HTTP metoda říká, jakou operaci chce klient provést:

| Metoda   | Typické použití    |
| -------- | ------------------ |
| `GET`    | načtení dat        |
| `POST`   | vytvoření dat      |
| `PUT`    | úplná změna dat    |
| `PATCH`  | částečná změna dat |
| `DELETE` | odstranění dat     |

## JSON

JSON je textový formát pro výměnu strukturovaných dat. API v tomto projektu
používá JSON pro requesty a response.

```json
{
  "title": "Implement login"
}
```

## Mapper

Mapper převádí data z jednoho tvaru do jiného. V backendu převádí například
Prisma databázový záznam na veřejný API response.

```text
Prisma Task → task.mapper.ts → TaskResponse
```

Mapper pomáhá zabránit tomu, aby se interní databázová pole omylem poslala
klientovi.

## Middleware

Middleware je funkce, která se spustí během zpracování HTTP požadavku, předtím
než požadavek dorazí do controlleru nebo než se odešle odpověď.

V projektu middleware například:

- zpracovává JSON body,
- nastavuje CORS hlavičky,
- předává chyby error handleru.

## MongoDB

MongoDB je databáze, která ukládá data ve formátu dokumentů podobných JSON.
V projektu je spuštěná lokálně přes Docker Compose.

## MongoDB replica set

Replica set je MongoDB konfigurace, ve které databáze běží jako skupina uzlů.
V lokálním projektu se používá jednouzlový replica set `rs0`, protože Prisma
ho potřebuje pro transakce.

## Next.js

Next.js je framework postavený na Reactu. V tomto projektu zajišťuje frontend,
routování, build a vývojový server.

## Prisma

Prisma je nástroj, který umožňuje backendu komunikovat s databází pomocí
TypeScriptu. Prisma schema popisuje databázové modely a Prisma Client poskytuje
typované dotazy.

Databázové schema je v `backend/prisma/schema.prisma`.

## Prisma Client

Prisma Client je vygenerovaná TypeScript knihovna, pomocí které backend provádí
dotazy do databáze.

Příklad:

```ts
prisma.task.findUnique({
  where: { id },
});
```

## Repository

Repository je vrstva, která komunikuje s databází. Obsahuje databázové dotazy,
ale neměla by obsahovat HTTP logiku.

Typický tok je:

```text
controller → service → repository → Prisma
```

## Request

Request je požadavek, který klient posílá serveru. Může obsahovat například
HTTP metodu, URL, hlavičky, parametry a JSON body.

## Response

Response je odpověď serveru na request. Obsahuje například HTTP status,
hlavičky a JSON data.

## Route

Route spojuje HTTP metodu a URL s konkrétním handlerem.

Příklad:

```ts
taskRouter.get('/:id', getTaskController);
```

## Service

Service obsahuje aplikační nebo business logiku. Obvykle koordinuje validaci,
repository a další služby.

Service by neměla znát detaily HTTP requestu ani response.

## Shared package

Shared package je workspace balíček `@time-tracker/shared`, který mohou
importovat frontend i backend.

Obsahuje veřejné API kontrakty, například Zod schémata. Neměl by obsahovat
Prisma Client, Express ani backendovou business logiku.

## TypeScript typ

TypeScript typ popisuje, jaký tvar mají data v kódu. Pomáhá odhalit chyby ještě
před spuštěním aplikace.

## Typecheck

Typecheck je kontrola TypeScript typů bez spuštění aplikace. V projektu se
spouští pomocí `npm run typecheck`.

## Workspace

Workspace je samostatný balíček uvnitř jednoho repozitáře. Tento projekt má
workspaces `frontend`, `backend` a `shared`, které lze spravovat společně z
rootu.

## Zod

Zod je knihovna pro validaci dat za běhu aplikace. Umožňuje ověřit, že data
z requestu nebo response mají očekávaný tvar.

Zod zároveň umí z validačního schématu odvodit TypeScript typ pomocí
`z.infer`.

## Databázové schema vs. API schema

Databázové schema popisuje, jak se data ukládají do databáze. V projektu je
zdrojem pravdy `backend/prisma/schema.prisma`.

API schema popisuje, co API přijímá a vrací. V projektu je zdrojem pravdy
`shared/src/schemas`.

Tyto dvě věci nemusí být stejné. Mapper mezi nimi zajišťuje bezpečný převod.

## ADR

ADR (Architecture Decision Record) je krátký dokument popisující důležité
architektonické rozhodnutí, jeho důvod a důsledky.

ADR dokumenty jsou v `docs/architecture/decisions`.
