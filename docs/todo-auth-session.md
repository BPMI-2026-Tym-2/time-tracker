# TODO: načítání session a role na frontendu

Tento dokument popisuje, co je potřeba udělat, aby aplikace správně fungovala
s autentizací a rolemi. Zatím je to v jiném pull requestu (layout aplikace).

## 1. Načtení session v layoutu aplikace

- V `frontend/src/app/layout.tsx` (nebo layoutu chráněné části) načíst session přes
  `authClient.useSession()` / `authClient.getSession()`.
- Výsledek předat přes context nebo provider (např. `SessionProvider`), aby
  ho mohly číst stránky.
- Zobrazit loading stav, dokud session není načtená.

## 2. Předání role do `/users`

- `frontend/src/app/users/page.tsx` má dočasně `viewerRole="owner"`.
- Po načtení session nahradit za skutečnou globální roli (`session.user.role`).
- Typ `UserListViewerRole` (`frontend/src/components/features/users/types.ts`) sjednotit
  s `GlobalRole` z `@time-tracker/shared`.

## 3. Stránka `/users` pro admina

- Stránka má být dostupná jen pro globální roli `admin`.
- Frontend `proxy.ts` kontroluje jen existenci session cookie. Role se kontroluje
  v layoutu/stránce a skutečná autorizace je na backendu.
- Na backendu přidat endpoint pro seznam uživatelů chráněný `requireRole('admin')`.

## 4. Přístup owner k `/{organizationId}/users`

- Nová route na frontendu, např. `frontend/src/app/[organizationId]/users/page.tsx`.
- Data z endpointu `GET /api/organizations/:organizationId/members`, který je už
  chráněný `requireOrganizationRole('owner', 'member')`.
- Pro owner povolit e-maily (`includeEmail` se už řídí `request.organization.role`).
- Rozhodnout, zda má `member` vidět seznam bez e-mailů (aktuální backend ho povoluje).

## 5. Ověření před nasazením

- Ověřit, že `proxy.ts` nezablokuje statické soubory (matcher je omezen na `/` a `/users`).
- Ověřit cookie názvy Better Auth (`better-auth.session_token`, `__Secure-` varianta).
- Otestovat chování při expirované session (backend 401, frontend přesměrování na `/login`).
