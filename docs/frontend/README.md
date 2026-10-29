# Frontend

Frontend je Next.js aplikace s App Routerem.

Zdrojový kód je v `frontend/src`:

- `src/app` – stránky, layouty a routy Next.js,
- `src/components/ui` – obecné UI komponenty,
- `src/components/features` – komponenty konkrétních funkcí,
- `src/components/layout` – společné rozložení aplikace,
- `src/hooks` – znovupoužitelné React hooky,
- `src/lib/api` – komunikace s backendem,
- `src/lib/formatters` – formátování dat pro zobrazení,
- `src/types` – frontendové typy, které nejsou součástí API kontraktu.

Lokální vývoj:

```sh
npm run dev:frontend
```

Frontend běží na <http://localhost:3000>. URL backendu se nastavuje přes
`NEXT_PUBLIC_API_URL` v `frontend/.env.local`.

Další informace:

- [Frontendová architektura](./architecture.md)
