### Clone prosjektet

  Åpne terminalen i VS Code og naviger til mappen der du vil ha prosjektet:

  ```bash
  git clone https://github.com/vBaustad/APP2000_G06_26.git
  cd APP2000_G06_26

  Installer avhengigheter (vi bruker pnpm):

  pnpm install

  ▎ Har du ikke pnpm fra før? Installer med npm install -g pnpm (eller se https://pnpm.io/installation).

  ---
  Prosjektstruktur (Monorepo)

  Dette prosjektet er et monorepo, som betyr at både frontend og backend ligger i samme repository.

  - Frontend: apps/web (React + Vite)
  - Backend: apps/api (Express / REST API + Prisma)

  ---
  Miljøvariabler (.env)

  Før du kan kjøre backend trenger du en .env-fil. Spør en i gruppa om innholdet.

  - apps/api/.env – inneholder bl.a. DATABASE_URL (mot den delte cloud-databasen) og JWT-secret.
  - apps/web/.env – frontend-variabler (f.eks. VITE_API_URL).

  .env-filene skal aldri committes.

  ---
  Prisma-klienten

  Backend bruker Prisma. Første gang du setter opp prosjektet – og hver gang noen endrer apps/api/prisma/schema.prisma –
   må du generere Prisma-klienten:

  pnpm --filter @app2000/api exec prisma generate

  Databasen er delt i skyen, så du trenger ikke å kjøre prisma db push eller seed selv med mindre du blir bedt om det.

  ---
  Bygg prosjektet

  For å sjekke at prosjektet bygger uten feil, kan du kjøre fra root:

  pnpm build

  Dette bygger både frontend og backend.

  Du kan også bygge kun én del:

  pnpm build:web
  pnpm build:api

  ---
  Kjør prosjektet lokalt

  For utvikling, start prosjektet fra root:

  pnpm dev

  Frontend er da tilgjengelig på:

  http://localhost:5173

  (Backend starter samtidig i bakgrunnen.)

  Alternativt kan frontend og backend kjøres i hver sin terminal ved å cd inn i respektive mapper og kjøre pnpm dev der.

  ---
  Git – arbeidsflyt

  Vi bruker feature branches og pull requests.

  1. Hent nyeste endringer fra main:

  git pull origin main

  2. Lag en ny branch:

  git switch -c feature/branch-navn

  Eksempel:

  feature/create-navbar

  3. Når du er ferdig med endringene:

  git add .
  git commit -m "Kort beskrivelse av hva som er gjort"

  4. Push branchen til GitHub:

  git push origin feature/branch-navn

  5. Opprett Pull Request på GitHub for å slå endringene inn i main.

  Etter at du har pullet main

  Hvis noen har endret schema.prisma eller lagt til pakker, kjør:

  pnpm install
  pnpm --filter @app2000/api exec prisma generate

  ---
  📝 Viktige retningslinjer

  - Ikke push direkte til main
  - Én feature per branch
  - Test at prosjektet bygger før du lager PR (pnpm build)
  - Skriv tydelige commit-meldinger
  - .env-filer skal aldri committes
