# Time Tracker

## Introduction

Time Tracker je webová aplikace pro evidenci úkolů a času stráveného jejich
řešením. Repozitář je rozdělený na frontend, backend a sdílený workspace
balíček. MongoDB běží lokálně v Dockeru a backend k ní přistupuje přes Prisma.

## Použité technologie

| Technologie    | Použití                                     |
| -------------- | ------------------------------------------- |
| Next.js        | Frontendová aplikace a routing              |
| React          | Tvorba uživatelského rozhraní               |
| TypeScript     | Typová kontrola napříč celým repozitářem    |
| Tailwind CSS   | Stylování frontendu                         |
| Node.js        | Runtime pro frontend tooling a backend      |
| Express        | HTTP API backendu                           |
| MongoDB        | Perzistentní úložiště dat                   |
| Docker Compose | Lokální spuštění MongoDB                    |
| Prisma         | Datový model a přístup backendu k MongoDB   |
| Zod            | Validace dat a sdílené typy                 |
| ESLint         | Statická kontrola JavaScriptu a TypeScriptu |
| Prettier       | Formátování zdrojových souborů              |

## Struktura projektu

```text
.
├── backend/                 # Express API a Prisma konfigurace
│   ├── prisma/              # Datový model MongoDB
│   ├── scripts/             # Pomocné skripty pro backend tooling
│   └── src/                 # Zdrojový kód backendu
├── frontend/                # Next.js aplikace
│   ├── public/              # Veřejné statické soubory
│   └── src/                 # Stránky, layouty a komponenty
├── shared/                  # Typy a validační schémata sdílená FE/BE
├── compose.yml              # MongoDB služba pro lokální vývoj
├── eslint.config.mjs        # Repository-wide ESLint konfigurace
├── .prettierrc.json         # Repository-wide Prettier konfigurace
├── tsconfig.base.json       # Sdílené TypeScript nastavení
└── package.json             # Root workspace a společné příkazy
```

## Požadavky

Pro lokální vývoj je potřeba:

- Node.js a npm
- Docker s Docker Compose

Závislosti nainstalujte z rootu repozitáře:

```sh
npm install
```

Backend používá proměnné prostředí definované v
[`backend/.env.example`](./backend/.env.example). Frontend používá
[`frontend/.env.example`](./frontend/.env.example). Pro lokální vývoj
zkopírujte tyto soubory do `.env.local`:

```sh
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local
```

MongoDB spuštěná přes repozitářový Compose soubor je dostupná na
`mongodb://localhost:27017`.

## Spuštění aplikace

### Celá aplikace

Nejjednodušší způsob spustí MongoDB v Dockeru a frontend i backend v
development režimu:

```sh
npm run dev
```

Po spuštění budou služby dostupné na:

- frontend: [http://localhost:3000](http://localhost:3000)
- backend API: [http://localhost:3001](http://localhost:3001)

Frontend tedy otevřete v prohlížeči na portu `3000`; backend poskytuje API na
portu `3001`.
Tento režim spouští frontend a backend lokálně na hostu a MongoDB v Dockeru.

### Samostatné spuštění databáze

```sh
npm run db:up
npm run db:logs
npm run db:down
```

Data MongoDB jsou uložená v Docker volume `mongodb-data`, takže se při běžném
`db:down` nesmažou.

### Samostatné spuštění frontendu a backendu

Databázi nejdříve spusťte pomocí `npm run db:up`. Poté lze jednotlivé části
spustit samostatně:

```sh
npm run dev:frontend
npm run dev:backend
```

Alternativně lze použít workspace příkazy přímo:

```sh
npm run dev --workspace frontend
npm run dev --workspace backend
```

### Build a produkční režim

Pro lokální Docker build a spuštění celého kontejnerizovaného stacku použijte:

```sh
npm run compose:build
npm run compose:up
```

Kontejnerizovaný frontend bude na [http://localhost:3000](http://localhost:3000)
a backend na [http://localhost:3001](http://localhost:3001). Stack zastavíte
příkazem:

```sh
npm run compose:down
```

Build jednotlivých workspace balíčků:

```sh
npm run build --workspace frontend
npm run build --workspace backend
```

Produkční servery se spouštějí po úspěšném buildu:

```sh
npm run start --workspace frontend
npm run start --workspace backend
```

## Repository tooling

Sdílené nastavení lintování, formátování a TypeScriptu je uložené v rootu:

- [`eslint.config.mjs`](./eslint.config.mjs) obsahuje společná ESLint pravidla
  a frontendová pravidla pro Next.js.
- [`.prettierrc.json`](./.prettierrc.json) a
  [`.prettierignore`](./.prettierignore) řídí formátování celého repozitáře.
- [`tsconfig.base.json`](./tsconfig.base.json) obsahuje společné TypeScript
  volby. Lokální `tsconfig.json` soubory definují pouze nastavení specifická
  pro runtime nebo framework.

Kontroly spusťte z rootu:

```sh
npm run lint
npm run format
npm run format:check
npm run typecheck
```

Po čisté instalaci `npm install` se automaticky spustí `postinstall`, který
vygeneruje Prisma/Zod soubory do `shared/generated` a připraví shared balíček.
Při Docker buildu se generování spouští také v Dockerfile.

## Vývojový workflow

### Práce na úkolu

1. Aktualizujte lokální větev `dev`:

   ```sh
   git checkout dev
   git pull
   ```

2. Vytvořte feature branch z aktuální větve `dev`:

   ```sh
   git checkout -b feature/kratky-popis
   ```

3. Nainstalujte závislosti a spusťte aplikaci podle části
   [Spuštění aplikace](#spuštění-aplikace).
4. Průběžně implementujte změnu a ověřujte ji lokálně.
5. Před vytvořením pull requestu spusťte všechny kontroly:

   ```sh
   npm run lint
   npm run format:check
   npm run typecheck
   ```

   Pokud projekt obsahuje testy, spusťte také příslušný testovací příkaz.

### Pull request a review

- Pull request se vytváří z feature branche do `dev`.
- Jeden pull request může obsahovat více commitů.
- Pull request musí schválit alespoň jeden člen každého týmu:
  backend, frontend a analytici.
- Popis pull requestu musí obsahovat:
  - odkaz na odpovídající položku v backlogu ve Sprintmanovi,
  - popis provedené změny,
  - způsob ověření změny,
  - screenshot nebo stručný popis dopadu na UI u relevantních frontendových
    změn.
- Do `main` se změny mergují z `dev` při týdenním publikování aplikace. Tento
  proces se běžného vývoje feature obvykle netýká.

## Contribution guidelines

- Pracujte pouze ve vlastní feature branch vytvořené z `dev`.
- Udržujte změny tematicky omezené a neprovádějte nesouvisející refaktoring.
- Preferujte existující strukturu workspace a sdílenou konfiguraci v rootu.
- Pro commity používejte [Conventional Commits](https://www.conventionalcommits.org/):

  ```text
  feat: add task creation form
  fix: handle unavailable database
  docs: update local setup
  refactor: extract task validation
  test: cover task creation
  chore: update dependencies
  ```

- Commit message pište v imperativu a udržujte ji stručnou. Jeden commit by měl
  ideálně popisovat jednu logickou změnu.
- Před otevřením pull requestu ověřte lint, formátování, typecheck a testy.
- Pull request musí mít popis, Sprintman backlog odkaz a informace o ověření.
- Změny mergeujte do `dev` až po požadovaných schváleních.

## Troubleshooting

### Port 27017 je obsazený

MongoDB se spouští na portu `27017`. Zkontrolujte, zda port nepoužívá jiný
kontejner nebo lokální MongoDB instance:

```sh
docker ps
docker compose ps
```

Ukončení MongoDB spuštěné přes tento repozitář:

```sh
npm run db:down
```

### MongoDB se nespustí

Ověřte, že běží Docker a že je Compose konfigurace validní:

```sh
docker info
docker compose config
```

Logy databáze zobrazíte příkazem:

```sh
npm run db:logs
```

### Backend se nepřipojí k databázi

Zkontrolujte, že běží MongoDB a že `backend/.env` obsahuje správnou hodnotu
`DATABASE_URL`, například:

```dotenv
DATABASE_URL="mongodb://localhost:27017/time-tracker"
```

Po změně environment proměnných backend restartujte.

### Frontend nebo backend používá obsazený port

Frontend standardně běží na portu `3000` a backend na portu `3001`. Zkontrolujte
procesy nebo spusťte službu s jiným portem:

```sh
lsof -i :3000
lsof -i :3001
```

Backend port lze nastavit pomocí `PORT`. Frontend port lze předat příkazu
Next.js, například:

```sh
npm run dev --workspace frontend -- -p 3002
```

### Chybí nebo jsou zastaralé závislosti

Z rootu přeinstalujte závislosti:

```sh
npm install
```

Pokud problém přetrvává, ověřte verzi Node.js a npm a zkontrolujte, že příkaz
spouštíte z rootu repozitáře.

### Prisma client nebo sdílené typy nejsou aktuální

Po změně Prisma schématu znovu vygenerujte Prisma client a sdílená validační
schémata:

```sh
npm run prisma:generate --workspace backend
```
