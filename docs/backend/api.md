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

## Skupiny

### `GET /groups/:groupId/settings`

Načte kompletní nastavení a metadata skupiny pro přihlášeného uživatele. (K dispozici je také alias `GET /groups/:groupId`.)

#### Autentizace a oprávnění

- Vyžaduje platnou Better Auth session cookie.
- **Nečlen skupiny**: obdrží `403 Forbidden`.
- **Běžný člen (`member`)**: obdrží nastavení v režimu pouze pro čtení (`permissions.canEdit = false`), e-mail vlastníka je skrytý.
- **Vlastník (`owner`) nebo `superAdmin`**: obdrží plná oprávnění (`permissions.canEdit = true`, `permissions.canDelete = true`, plný e-mail vlastníka i pozvánkový kód).

#### Parametry URL

- `groupId` (UUID) – identifikátor skupiny.

Response `200`:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Vývojový tým FeaTHer",
  "description": "Hlavní skupina pro vývoj a sledování času",
  "category": "Vývoj",
  "color": "#3B82F6",
  "logo": "code",
  "visibility": "private",
  "createdAt": "2026-11-01T10:00:00.000Z",
  "updatedAt": "2026-11-05T14:30:00.000Z",
  "invitationCode": "FEATHER-2026",
  "owner": {
    "id": "user-uuid-1",
    "name": "Jan",
    "surname": "Gergel",
    "email": "jan.gergel@example.com"
  },
  "membersCount": 8,
  "currentUserRole": "owner",
  "permissions": {
    "canEdit": true,
    "canDelete": true,
    "canManageMembers": true,
    "canLeaveGroup": false
  }
}
```

### `PATCH /groups/:groupId/settings`

Aktualizuje nastavení a vizuální styl skupiny (podporuje parciální update – posílají se pouze změněná pole).

#### Autentizace a oprávnění

- Vyžaduje přihlášeného uživatele.
- Právo provádět úpravy má pouze **vlastník skupiny (`owner`)** nebo globální **`superAdmin`**.
- Běžný člen (`member`) nebo nečlen obdrží `403 Forbidden`.

#### Parametry URL

- `groupId` (UUID) – identifikátor skupiny.

Request body (všechna pole jsou volitelná):

```json
{
  "name": "Nový název skupiny",
  "description": "Aktualizovaný popisek skupiny",
  "category": "Management",
  "color": "#1D4ED8",
  "logo": "briefcase",
  "visibility": "private",
  "invitationCode": "NEWCODE-123"
}
```

Response `200`:

- Vrací kompletní aktualizovaný objekt `GroupSettingsResponse` (stejná struktura jako u `GET /groups/:groupId/settings`).

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
