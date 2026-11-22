# Backend API

Base URL lokálního backendu je `http://localhost:3001`.

## Záznamník

- `GET /api/users/activities` vrací aktivity uložené ve vlastním záznamníku přihlášeného uživatele.
- `GET /api/organizations/:organizationId/activities` vrací aktivity uložené ve skupině i aktivity s ní sdílené. Přístup má zakladatel nebo člen vybrané skupiny.

Oba endpointy přijímají volitelné parametry:

- `from` a `to` jsou časové hranice v ISO 8601 s časovou zónou. Vrací se aktivity, které zasahují do zadaného období. Pokud jsou zadané obě hranice, musí být `from` menší než `to`.
- `categoryId` a `tagId` lze zadat opakovaně. Aktivita musí odpovídat alespoň jedné vybrané kategorii a alespoň jednomu vybranému štítku, pokud jsou oba filtry zadané.

Odpověď `200` obsahuje `items` s aktivitami seřazenými od nejdřívějšího začátku. Každá aktivita má `id`, `name`, `startedAt`, `endedAt`, `categoryIds` a `tagIds`. Příznak `hasActivities` označuje, zda záznamník obsahuje nějaké aktivity bez ohledu na zvolené období a filtry. Při prázdném záznamníku vrací API `{"items":[],"hasActivities":false}`.

## Tasks

### `POST /tasks`

Vytvoří nový task.

Request body:

```json
{
  "title": "Implement login",
  "description": "Add authentication flow"
}
```

`title` je povinný, po oříznutí musí mít 1 až 200 znaků. `description` je
volitelný a může mít nejvýše 5000 znaků.

Response `201`:

```json
{
  "id": "generated-id",
  "title": "Implement login",
  "description": "Add authentication flow",
  "createdAt": "2026-10-29T12:00:00.000Z"
}
```

### `GET /tasks/:id`

Načte task podle ID.

Response `200` používá stejný tvar jako response z `POST /tasks`.

## Chyby

Chyby jsou vracené ve tvaru:

```json
{
  "error": "Task not found"
}
```

- `400` – nevalidní vstup,
- `404` – požadovaný task neexistuje,
- `500` – neočekávaná chyba serveru.

Nevalidní requesty ověřované přes Zod vrací `400` a obsahují popis problémů
v poli `details`.

Endpointy users a auth jsou ve struktuře připravené, ale jejich API zatím není
implementované.
