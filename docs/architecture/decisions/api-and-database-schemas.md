# ADR: Oddělení API a databázových schémat

## Stav

Přijato

## Kontext

Databázový model a API kontrakt mají odlišné odpovědnosti. Databáze potřebuje
řešit například indexy, výchozí hodnoty, relace a mapování na MongoDB. API
potřebuje řešit veřejné requesty, response a skrytí interních polí.

Použití Prisma-generated modelu jako veřejného API kontraktu by svázalo frontend
s interní strukturou databáze.

## Rozhodnutí

- `backend/prisma/schema.prisma` je jediný zdroj pravdy pro databázi.
- `shared/src/schemas` je jediný zdroj pravdy pro veřejné API kontrakty.
- Backend používá mappery mezi Prisma záznamy a API response.
- Prisma-generated typy zůstávají pouze v backendu.
- Shared package nesmí záviset na Prisma ani Express.

## Důsledky

- Databázi lze měnit bez automatické změny API.
- Request a response mohou mít jiný tvar než databázový model.
- Některé typy se definují odděleně.
- Backend musí při změně response aktualizovat mapper i shared schema.
