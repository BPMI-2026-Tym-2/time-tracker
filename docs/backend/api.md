# Backend API

Base URL lokálního backendu je `http://localhost:3001`.

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
