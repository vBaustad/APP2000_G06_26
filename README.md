### Clone prosjektet

Åpne terminalen i VS Code og naviger til mappen der du vil ha prosjektet:

```bash
git clone https://github.com/vBaustad/APP2000_G06_26.git
cd APP2000_G06_26
```

Installer avhengigheter:

```bash
npm install
```

---

## Prosjektstruktur (Monorepo)

Dette prosjektet er et **monorepo**, som betyr at både frontend og backend ligger i samme repository.

* **Frontend:** `apps/web` (React + Vite)
* **Backend:** `apps/api` (Express / REST API)

---

## Bygg prosjektet

For å sjekke at prosjektet bygger uten feil, kan du kjøre fra **root**:

```bash
npm run build
```

Dette bygger **både frontend og backend**.

Du kan også bygge kun én del:

```bash
npm run build:web
npm run build:api
```

Alternativt kan du `cd` inn i `apps/web` eller `apps/api` og kjøre:

```bash
npm run build
```

---

## Kjør prosjektet lokalt

For utvikling, start prosjektet fra **root**:

```bash
npm run dev
```

Frontend er da tilgjengelig på:

```
http://localhost:5173
```

(Backend starter samtidig i bakgrunnen.)

Alternativt kan frontend og backend kjøres i **hver sin terminal** ved å `cd` inn i respektive mapper.

---

## Git – arbeidsflyt

Vi bruker feature branches og pull requests.

1. Hent nyeste endringer fra `main`:

```bash
git pull origin main
```

2. Lag en ny branch:

```bash
git switch -c feature/branch-navn
```

Eksempel:

```bash
feature/create-navbar
```

3. Når du er ferdig med endringene:

```bash
git add .
git commit -m "Kort beskrivelse av hva som er gjort"
```

4. Push branchen til GitHub:

```bash
git push origin feature/branch-navn
```

5. Opprett **Pull Request** på GitHub for å slå endringene inn i `main`.

---

## 📝 Viktige retningslinjer

* Ikke push direkte til `main`
* Én feature per branch
* Test at prosjektet bygger før du lager PR (`npm run build`)
* Skriv tydelige commit-meldinger
