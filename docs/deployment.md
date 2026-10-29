# Deployment

## Produkční Docker Compose

Lokální produkční build a spuštění celého stacku:

```sh
npm run compose:build
npm run compose:up
```

Služby budou dostupné na:

- frontend: <http://localhost:3000>
- backend: <http://localhost:3001>

Stack zastavíte:

```sh
npm run compose:down
```

Produkční Compose používá MongoDB, backend a frontend v oddělených
kontejnerech. Backend a frontend konfigurace jsou definované v
[compose.yml](../compose.yml).

## Lokální backend po buildu

```sh
npm run start --workspace backend
```

Před spuštěním musí proběhnout `npm run build` a musí být dostupná databáze.

## Poznámky

Produkční nasazení mimo Docker Compose zatím není v repozitáři standardizované.
Konkrétní cloudové proměnné a migrace je potřeba doplnit podle cílové
infrastruktury.
