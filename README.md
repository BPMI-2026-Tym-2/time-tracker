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
| Husky          | Lokální kontroly při commitu a pushi        |

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

- Node.js 22 a npm 10 nebo novější (`nvm use`, pokud používáte nvm)
- Docker s Docker Compose

Závislosti nainstalujte z rootu repozitáře:

```sh
npm install
```

Backend používá proměnné prostředí definované v
[`backend/.env.example`](./backend/.env.example). Frontend používá
[`frontend/.env.example`](./frontend/.env.example). Pro lokální vývoj
zkopírujte backendový soubor do `.env` a frontendový do `.env.local`.
Backend a Prisma používají `dotenv`, který standardně načítá `.env`:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Závislosti nainstalujte z rootu repozitáře:

```sh
npm ci
```

Instalace vygeneruje Prisma client a sdílená schémata, přeloží `shared`
a aktivuje Husky hooky. Tyto příkazy spouštějte z kořene repozitáře.

MongoDB spuštěná přes repozitářový Compose soubor je dostupná na
`mongodb://127.0.0.1:27017/time_tracker?replicaSet=rs0&directConnection=true`.
Compose při prvním spuštění inicializuje jednouzlový replica set `rs0` a čeká,
až je uzel připravený přijímat zápisy. Replica set je nutný pro Prisma transakce.
`directConnection=true` umožní připojení z hostu i z kontejneru bez překladu
interního hostname `mongodb`. Tento stack je určený pro lokální vývoj a ověření
kontejnerů; databáze nemá zapnutou autentizaci.

## Spuštění aplikace

### Frontendový tým

Po společné instalaci z rootu spusťte pouze frontend:

```sh
npm run dev:frontend
```

UI běží na [http://localhost:3000](http://localhost:3000) a změny načítá Next.js
automaticky. Pro práci na samotném UI není potřeba spouštět Docker ani backend.
Pro funkce používající skutečné API musí běžet backend a jeho databáze.
`NEXT_PUBLIC_API_URL` ve `frontend/.env.local` musí odpovídat adrese tohoto
backendu. Pokud endpoint ještě není hotový, může FE tým pracovat s dočasnými
testovacími daty podle domluveného API kontraktu; automatické mockování API
zatím v repozitáři není připravené.

### Backendový tým

Z rootu spusťte databázi, obnovte generované soubory a spusťte backend:

```sh
npm run db:up
npm run generate
npm run dev:backend
```

Backend běží na [http://localhost:3001](http://localhost:3001) a změny restartují
server přes `tsx watch`. Frontend není potřeba spouštět; endpointy lze ověřovat
HTTP klientem a testy. Na samotném `/` je zatím očekávaná odpověď `404`, protože
aplikační endpointy ještě nejsou implementované.

Databázový základ ověříte přes `npm run test:db`. Pokud testujete volání z jiného
frontendu než `http://localhost:3000`, upravte `CORS_ORIGIN` v `backend/.env`.

### Změny sdíleného balíčku

Při samostatném vývoji obou týmů po změně sdíleného kódu spusťte
`npm run build:shared`, nebo v dalším terminálu zapněte průběžný překlad:

```sh
npm run dev --workspace shared
```

Po změně Prisma schématu spusťte `npm run generate`. Stejný příkaz použijte
po přepnutí větve nebo stažení změn, které upravují datový model.

### Společné integrační ověření

Pro práci na propojení FE a BE spusťte MongoDB v Dockeru a obě aplikace lokálně
jedním příkazem:

```sh
npm run dev
```

Po spuštění budou služby dostupné na:

- frontend: [http://localhost:3000](http://localhost:3000)
- backend API: [http://localhost:3001](http://localhost:3001)

Frontend tedy otevřete v prohlížeči na portu `3000`; backend poskytuje API na
portu `3001`.
Tento režim spouští frontend a backend lokálně na hostu a MongoDB v Dockeru.
Současně sleduje a kompiluje změny sdíleného balíčku `shared`.
Při startu také obnoví Prisma client a sdílená schémata podle aktuální větve.
Změny frontendu se projeví přes Next.js, změny backendu restartují server přes
`tsx watch`. Ukončení pomocí `Ctrl+C` zastaví vývojové procesy, MongoDB zůstane
běžet. Pokud ji už nepotřebujete, spusťte `npm run db:down`.

### Samostatné spuštění databáze

```sh
npm run db:up
npm run db:logs
npm run db:down
```

Data MongoDB jsou uložená v Docker volume `mongodb-data`, takže se při běžném
`db:down` nesmažou.

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

Build celého projektu včetně generování sdílených souborů:

```sh
npm run build
```

Pokud potřebujete přeložit jen jednu aplikaci, nejdříve obnovte sdílené soubory:

```sh
npm run generate
npm run build --workspace frontend
npm run build --workspace backend
```

Produkční frontend spouštějte přes Docker Compose výše, který připraví
standalone server včetně statických souborů. Samotný backend lze po buildu
spustit lokálně:

```sh
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

Po čisté instalaci `npm ci` se automaticky spustí `postinstall`, který
vygeneruje Prisma/Zod soubory do `shared/generated` a připraví shared balíček.
Při Docker buildu se generování spouští také v Dockerfile.

Po změně Prisma schématu spusťte `npm run generate`. Příkaz zároveň přeloží
sdílený balíček, ze kterého frontend a backend importují typy a schémata.

Připravenost databáze a kompatibilitu Prisma/Zod ověříte:

```sh
npm run db:up
npm run test:db
```

Kontrola vytvoří, načte a smaže dočasný úkol v jedné transakci. Stejná kontrola
běží v CI. Standardně používá lokální Compose databázi; jinou testovací databázi
lze zadat přes `TEST_DATABASE_URL`. `npm run verify` spustí lint, formátování,
typecheck a build bez požadavku na běžící databázi.

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

3. Při prvním spuštění připravte env soubory a spusťte `npm ci` podle části
   [Požadavky](#požadavky). `npm ci` zopakujte po změně `package-lock.json`;
   nemusíte jej spouštět při každém startu vývoje.
4. Podle svého týmu spusťte [frontend](#frontendový-tým) nebo
   [backend](#backendový-tým). Pro integrační ověření použijte `npm run dev`.
   U úkolu zasahujícího FE i BE si nejdříve domluvte API kontrakt podle části
   [Spolupráce FE a BE](#spolupráce-fe-a-be).
5. Před commitem opravte formátování a připravte související soubory:

   ```sh
   npm run format
   git add <soubory-zmeny>
   git commit -m "feat: add task creation form"
   ```

   Pre-commit hook automaticky ověří lint a formátování. Pokud kontrola selže,
   opravte chyby, znovu přidejte opravené soubory do stage a commit zopakujte.

6. U změn Prisma/sdílených schémat nebo práce s databází spusťte také
   `npm run test:db` s běžící lokální databází. Přidejte a spusťte funkční testy
   odpovídající implementované změně.
7. Pushněte větev a otevřete pull request do `dev`:

   ```sh
   git push -u origin feature/kratky-popis
   ```

   Pre-push hook automaticky spustí `npm run verify`: lint, formátování,
   typecheck a produkční build obou aplikací. Kontrolu lze stejným příkazem
   spustit i ručně. Počítejte s tím, že push čeká na dokončení buildu.

### Spolupráce FE a BE

Týmy mohou implementovat své části v samostatných feature větvích a pull
requestech do `dev`. Před rozdělením navazující práce si domluvte metodu a URL
endpointu, vstupní data, tvar odpovědi, chybové stavy a formát dat přenášených
přes JSON. Databázový model sám o sobě není API kontrakt.

Společné typy a validační schémata pro API udržujte v `shared` a změny kontraktu
koordinujte mezi oběma týmy. Pokud FE práce závisí na konkrétním backendovém PR,
uveďte tuto závislost v popisu PR a před dokončením funkce ověřte obě části
společně proti skutečnému API. Tato koordinace nemění pravidla review níže.

### Kde provádět změny

- **Frontend:** stránky a UI patří do `frontend/src`. Adresa API pro prohlížeč
  je připravená v `frontend/.env.local` jako `NEXT_PUBLIC_API_URL`; její použití
  při volání endpointů je součástí implementace frontendu.
- **shad/cn komponenty:** Projekt používá shad/cn. Komponenty shad/cn jsou ve
  složce `frontend/src/components/ui` a neupravují se. Vlastní komponenty,
  které je využívají, vytvářejte ve složce `frontend/src/components/features` nebo `frontend/src/components/layout`.
- **Backend:** endpointy a aplikační logika patří do `backend/src`.
- **Sdílený kód:** ručně psané typy a validační schémata patří do `shared`.
  Obě aplikace je importují z `@time-tracker/shared`.
- **Datový model:** upravujte `backend/prisma/schema.prisma` a potom spusťte
  `npm run generate`. Soubory v `shared/generated`, `shared/dist` a Prisma
  client neupravujte ručně ani necommitujte.

Pokud změna datového modelu vyžaduje promítnutí schématu nebo indexů do lokální
MongoDB, s běžící databází spusťte:

```sh
npm exec --workspace backend -- prisma db push --skip-generate
npm run generate
```

MongoDB nepoužívá Prisma Migrate. Změny již uložených dat je potřeba řešit
samostatně podle konkrétní změny modelu.

### Husky a CI

Hooky se instalují automaticky přes `npm ci` a kontrolují celý pracovní strom,
nejen soubory ve stage. Neprovádějí automatické opravy ani staging souborů.
Lokální commit i push proto může zablokovat i nedokončená změna v jiné části
repozitáře.

CI zopakuje lint, formátování, typecheck a build a navíc spustí MongoDB
a databázový integrační test. Ten není součástí pre-push hooku, takže samotný
push nepotřebuje běžící Docker daemon. Build frontendu ale může potřebovat
přístup k síti kvůli načtení Google Fonts.

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
- Před otevřením pull requestu musí projít `npm run verify` a relevantní testy.
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
DATABASE_URL="mongodb://127.0.0.1:27017/time_tracker?replicaSet=rs0&directConnection=true"
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
npm ci
```

Pokud problém přetrvává, ověřte verzi Node.js a npm a zkontrolujte, že příkaz
spouštíte z rootu repozitáře.

### Prisma client nebo sdílené typy nejsou aktuální

Po změně Prisma schématu znovu vygenerujte Prisma client a sdílená validační
schémata:

```sh
npm run generate
```

### Audit závislostí Prisma

`npm audit` aktuálně hlásí zranitelnost `deepmerge-ts` přes vývojovou závislost
Prisma CLI. Automaticky navrhovaný major upgrade nelze bez ověření použít:
projekt používá Prisma 6.19 kvůli podpoře MongoDB. Aktualizaci Prisma CLI,
`@prisma/client` a Nix enginů provádějte společně a ověřte pomocí `npm run test:db`.
Viz [podpora MongoDB v Prisma](https://www.prisma.io/docs/orm/overview/databases/mongodb).
