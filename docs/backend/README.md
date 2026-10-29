# Backend

Backend je Express aplikace s Prisma přístupem k MongoDB. Zdrojový kód je
rozdělený podle feature modulů a uvnitř modulu podle odpovědnosti.

- [Architektura backendu](./architecture.md)
- [API reference](./api.md)
- [Databáze](./database.md)

Vstupní body:

- `backend/src/app.ts` skládá Express aplikaci,
- `backend/src/server.ts` spouští HTTP server,
- `backend/src/index.ts` exportuje aplikaci pro import a testy.
