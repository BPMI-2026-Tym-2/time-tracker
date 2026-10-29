# Backend API

Base URL lokálního backendu je `http://localhost:3001`.

## Auth

Autentizace běží přes Better Auth pod prefixem `/auth`.

### `POST /auth/sign-in/email`

Přihlášení uživatele e-mailem a heslem.

Request body:

```json
{
  "email": "user@example.com",
  "password": "secretpassword"
}
```

Při úspěchu vrátí `200`, data uživatele a nastaví session cookie.

### `POST /auth/sign-out`

Odhlásí uživatele a zneplatní session.

### `GET /auth/get-session`

Vrátí aktuální session a data přihlášeného uživatele. Pokud uživatel není přihlášený, vrací `null`.

## Users

### `GET /users/me`

Vrátí profil aktuálně přihlášeného uživatele. Vyžaduje platnou session, jinak vrací `401`.

Response `200`:

```json
{
  "id": "generated-id",
  "name": "Jan",
  "surname": "Novák",
  "email": "user@example.com",
  "profileImageUrl": null,
  "createdAt": "2026-10-29T12:00:00.000Z"
}
```

### `GET /users/:id`

Načte profil uživatele podle jeho ID. Vyžaduje přihlášení (`401`), při neexistenci vrací `404`.

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
- `401` – neautorizovaný přístup,
- `404` – požadovaný záznam neexistuje,
- `500` – neočekávaná chyba serveru.

Nevalidní requesty ověřované přes Zod vrací `400` a obsahují popis problémů
v poli `details`.
