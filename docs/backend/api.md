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

## Organizace (skupiny)

### `DELETE /api/organizations/:organizationId`

Odstraní organizaci přihlášeného vlastníka. Request neobsahuje body.
Při úspěchu vrací `204 No Content` bez response body.

Controller validuje `organizationId` pomocí existujícího shared schématu.
Service volá `auth.api.deleteOrganization` s hlavičkami původního requestu.
Better Auth ověřuje session a oprávnění `organization:delete` podle členství
v dané organizaci. Toto oprávnění má v konfiguraci organizací pouze role
`owner`; globální aplikační role vlastníka nenahrazuje.

Better Auth odstraní organizaci, její členství a pozvánky v transakci
(`transaction: true` v Prisma adapteru). MongoDB musí běžet jako replica set.
Pokud byla organizace aktivní v session volajícího, Better Auth tuto aktivní
organizaci zruší. Zrušení aktivní organizace probíhá před mazací transakcí;
při chybě může být nutné skupinu znovu vybrat, její data ale zůstanou zachována.

Chyby používají tvar `{ "error": "..." }`:

- `401` – uživatel není přihlášen,
- `403` – člen organizace nemá oprávnění k odstranění,
- `400` – uživatel není členem organizace nebo organizace neexistuje
  (včetně opakovaného odstranění); zachováváme chování Better Auth,
- `500` – technická chyba: `Odstranění skupiny se nezdařilo. Zkuste to prosím znovu`.

Datový model zatím neobsahuje skupinové aktivity ani sdílení osobních aktivit.
Mazání aktivit proto není součástí této implementace. Stávající tasky ani
uživatelské účty se nemažou. Při zavedení aktivit je nutné doplnit mazání
skupinových aktivit a vazeb sdílení se zachováním osobních aktivit jejich
vlastníkům a zajistit atomické provedení společně s odstraněním organizace.

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
