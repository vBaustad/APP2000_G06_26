# Ferdigstillingsplan — raskeste vei til levering

Frist: **24.04.2026 kl. 14:00** i Wiseflow (zip med `rapport.pdf`, `video.mp4`, og mappe `app/` med kode).

Oppdatert etter full gjennomgang av oppgavebeskrivelsen.

**Viktig kontekst fra oppgaven:**
> "Det er ikke sikkert at alle gruppene får til å løse alle deler av oppgaven; det er mulig å bestå emnet likevel."

Strategien er derfor:
1. Dekk alle **eksplisitte "SKAL"-krav** (uten disse → stryk-risiko)
2. Dekk så mye som mulig av **"BØR"/sentral funksjonalitet** (påvirker karakter)
3. Det dere ikke rekker → **dokumenteres som bevisst nedprioritering** med begrunnelse i rapporten

---

## 1. EKSPLISITTE SKAL-KRAV (må gjøres, ellers mangler dere minimum)

### 1A. Kode — kritiske mangler

- [ ] **`react-i18next` for flerspråklighet**
  Oppgaven: *"Det er derfor et krav at løsningen skal være flerspråklig. Til dette skal man bruke biblioteket react-i18next."*
  Status nå: biblioteket er ikke installert, ingen oversettelses-filer finnes.
  Minimum: installer `react-i18next` + `i18next`, opprett `nb` og `en` locale-filer, og pakk navbar/forside/turdetaljer med `useTranslation()`. Trenger ikke oversette alt — men infrastrukturen må være der.

- [ ] **`Passport.js` for autentisering**
  Oppgaven: *"Passport.js (eller Auth.js hvis man er villig til selvstudier) skal brukes for autentisering."*
  Status nå: custom JWT-implementasjon.
  To alternativer: (a) bytt til `passport-jwt` (wrap eksisterende JWT-verifikasjon i passport-strategi — ca. 1–2 timer arbeid), eller (b) begrunn avviket tydelig i rapporten. Anbefaler (a) siden det er så lite jobb.

- [ ] **Testbrukere 1–6 med riktige roller**
  Oppgaven: 6 stk. testbrukere med eksplisitte roller.
  - `bruker1@usn.no` → admin
  - `bruker2@usn.no` → turleder
  - `bruker3@usn.no` → hytteeier
  - `bruker4@usn.no` → bruker
  - `bruker5@usn.no` → bruker
  - `bruker6@usn.no` → bruker
  Alle med passord `hemmelig`.
  Status nå: bare bruker1–4, feil roller (bruker1=bruker, bruker2=hytteeier, bruker3=admin, bruker4=annonsør). Fil: `apps/api/prisma/seed.ts`.

- [ ] **"Tilbakestill testdata"-knapp på startsiden**
  Oppgaven: *"Applikasjonen skal ha en knapp på startsiden som gjør det mulig å tilbakestille alle testdata."*
  Trenger: knapp på `Forside.tsx` + API-endepunkt som kjører seed på nytt.

- [ ] **Testdata: 1 fleksibel fellestur (3–5 datoalt., ≥2 hytter) + 1 fast-dato-tur**
  Oppgaven spesifiserer dette eksplisitt for sensur-testing.
  Schema støtter alt — må bare legges inn i seed.

- [ ] **Deploy til webtjener**
  Oppgaven: *"Prosjektgruppen skal sørge for at applikasjonen kjører på en webtjener i hele sensurperioden (inkludert eventuell klagesensur)."*
  Ikke bare localhost.

### 1B. Rapport — må skrives/fylles ut

- [ ] **Vedlegg A: Veiledning til faglærer/sensor** (tom nå)
  URL til deploy, testbrukere + passord, GitHub-repo-navn (`APP2000_G06_26`), hva hver testbruker kan gjøre.

- [ ] **Vedlegg B: Individuelle timelister** (tom nå)
  Tabell med én kolonne per gruppemedlem, én rad per uke + totalrad. Pluss tabell med totaler fordelt på *organisert undervisning, selvstudier, utvikling, rapportskriving, møter/prosjektstyring*.

- [ ] **Kapittel: "Kommentarer til bruk/tilpassing av kode"** (mangler helt)
  Eksplisitt krav. Skal gjøre rede for KI-bruk (Copilot, ChatGPT, Claude osv.) og hva som er eget bidrag. Skal også merkes i kildekoden.

- [ ] **Tittelside med USN-mal**
  Gruppenummer, prosjektnavn, studentnummer + fullt navn på alle, emnekode APP2000, emnenavn, USN, innleveringsdato.

### 1C. Video (30 min totalt, skal inn i zip)

- [ ] Del 1 (maks 10 min): Demonstrer all funksjonalitet — alle gruppemedlemmer bidrar
- [ ] Del 2 (maks 5 min): Teknisk gjennomgang — DB, backend, frontend
- [ ] Del 3 (maks 3 min hver): Individuelle bidrag
- [ ] Videoen er reserveløsning hvis deploy krasjer — dekk derfor ALL viktig funksjonalitet

---

## 2. SENTRAL FUNKSJONALITET FRA OPPGAVEN (høy verdi, påvirker karakter)

Disse er eksplisitte "SKAL" eller sterk "BØR" i oppgaven. Gjør så mange som mulig — det dere hopper over må begrunnes som bevisst nedprioritering i rapport-seksjon "Prosessbeskrivelse".

### 2A. Høyest prioritet (mest synlig for sensor + dekker testscenario)

- [ ] **Overlappende bindende påmeldinger-sjekk**
  Oppgaven: *"En person kan ikke legge inn flere overlappende og bindende påmeldinger."* + testscenario.
  Status: ingen sjekk i `POST /api/turer/:id/pameld`.

- [ ] **Hytteeier-flyt: varsel + bekrefte sengeplasser**
  Oppgaven + testscenario: *"Hytteeier: Motta varsel om ny relevant tur og meld inn antall sengeplasser (ikke-bindende)"* og senere bekrefte ved låsing.
  Status: `tur_dato_hytte` med status finnes, men ingen varsel-system eller UI for hytteeier.
  Minimum: side "forespørsler til mine hytter" + in-app toast eller liste-varsel.

- [ ] **Turleder: bytt fleksibel → fast dato, trigger varsling**
  Oppgaven + testscenario.
  Status: usikker om dette er ferdig — verifiser flyt.

- [ ] **Anmeldelser og stjerner**
  Oppgaven: *"Brukere skal kunne legge inn anmeldelser og gi stjerner til turer og overnattingssteder."*
  Status: DB-modellene finnes (`tur_rating`, `hytte_rating`, `tur_kommentar`, `hytte_kommentar`), men ingen API eller UI. Ca. 1 dags arbeid å aktivere det som er halvveis gjort.

- [ ] **GPX-filopplasting ved oppretting av tur**
  Oppgaven: *"Registrering av turruter skal kunne gjøres på to måter: enten ved at man 'tegner' ruten manuelt i kartet, eller ved at man laster opp en GPX-fil."*
  Status: eksport finnes, import mangler. Schema har `tursti_kilde = gpx_upload`. Parsing av GPX til `tursti_punkt` er forholdsvis rett fram.

### 2B. Kart-funksjonalitet (oppgaven vektlegger kart tungt)

- [ ] **Visuell skille i kart mellom turtyper**
  Oppgaven: *"naturlig å skille visuelt mellom turer med og uten fast startdato, og mellom turer med og uten ledige plasser"*.
  Status: ingen visuell distinksjon. Minimum: ulike markør-farger/ikoner.

- [ ] **Filtrere kart på tid** (uke/periode)
  Oppgaven: *"begrense kartvisningen i 'tid' (vis kun turer som starter i uke 30)"*.
  Status: kun aktivitetsfilter finnes.

- [ ] **GPS "min posisjon" på kartet**
  Oppgaven: *"Det skal være mulig å bruke kartløsningen til navigering når man er på tur ved bruk av GPS på mobilen. Man skal kunne følge med på hvor man er i forhold til en planlagt turrute."*
  Status: `navigator.geolocation` brukes ikke.
  Minimum: "Vis min posisjon"-knapp som plasserer en markør. Polering kan spares.

- [ ] **Filtrering av hytter på betjent/ubetjent, pris, fasiliteter**
  Oppgaven spesifiserer dette.
  Status: feltene finnes i schema, men filtrering i UI/API er begrenset.


### 2C. Integrasjoner

- [ ] **Ekte værmeldings-API (Yr / MET.no)**
  Oppgaven: *"Sanntids værprognoser for en lokasjon kan hentes fra Yr."* + *"Løsningen bør derfor være integrert med et værmeldings-API for å vise værforhold på ulike turmål på forskjellige tidspunkter."*
  Status: bare `weatherMock.ts`.
  MET.no locationforecast er gratis og krever bare User-Agent-header — ca. 2–4 timer å bytte ut mock-en.

### 2D. Annonseportal-polering

- [ ] **Redaktør-rolle for godkjenning av annonser**
  Oppgaven: *"Ansvarlig redaktør for turnettstedet må godkjenne både annonsør og selve annonsene før de blir publisert."*
  Status: admin-rollen dekker dette. To alternativer:
  - (a) Legg til `redaktor` som egen rolle-enum og flytt annonse-godkjenning dit
  - (b) Forklar i rapporten at admin-rollen har redaktør-ansvaret (billigste løsning)

---

## 3. FJERN FRA RAPPORT (ikke krav, ikke i kode — ren rapport-fiksjon)

Dette er ikke i oppgavebeskrivelsen og ikke i koden. Rapporten har likevel skrevet om det som om det er levert. **Fjern eller omformuler** — ellers kan sensor teste noe som ikke finnes.

- [ ] **Flora- og fauna-info på kartet** (ikke nevnt i oppgaven)
- [ ] **Turutstyr til salg/leie — marketplace** (ikke nevnt i oppgaven)
- [ ] **Artikler om natur og miljøvern** (ikke nevnt i oppgaven)
- [ ] **Rapportere hindringer underveis** ("flom, travelt") (ikke nevnt i oppgaven)
- [ ] **Kurs og arrangementer som eget system** (ikke nevnt i oppgaven — oppgaven snakker bare om "turer")
- [ ] **Tofaktorautentisering** (ikke nevnt i oppgaven)
- [ ] **GDPR: slette konto + laste ned persondata** (ikke nevnt i oppgaven — generell GDPR-compliance holder)
- [ ] **Varsel ved mistenkelig aktivitet** (ikke nevnt i oppgaven)
- [ ] **Daglig sikkerhetskopi** (ikke nevnt i oppgaven)
- [ ] **"500 samtidige brukere / 99 % oppetid"** (ikke målt/testet, nedskalér forventningen)
- [ ] **Redaktør som separat rolle i UML-diagrammet** (hvis dere velger løsning 2E (b), fjern redaktøren fra UML eller skriv at admin = redaktør)

---

## 4. RETTELSER I RAPPORT (faktafeil)

- [ ] **Filnavn-tabellen, Ramona** — erstatt engelske navn med norske
  - `LandingPage.tsx` → `Forside.tsx`
  - `ExplorePage.tsx` → `Utforsk.tsx`
  - `ContactPage.tsx` → `Kontakt.tsx`
  - `CreateTripPage.tsx` → `OpprettTur.tsx`
  - `FlexibleTripDetailsPage.tsx` / `FastGroupTripDetailsPage.ts` → `TurDetaljer.tsx` (én side)

- [ ] **Filnavn-tabellen, Parasto** — erstatt engelske navn med norske
  - `Edit Profile.jsx` → `RedigerProfil.tsx`
  - `MyPage.tsx` → `MinSide.tsx`
  - `loggetOut.jsx` → `LoggetUt.tsx`
  - `SignupPage.tsx` → `Registrer.tsx`
  - `navbar.tsx` → `Navbar.tsx`
  - `routs/userRoutes.ts` → `routes/brukerRoutes.ts`

- [ ] **Filnavn-tabellen, Vebjørn og Synne** — tomme rader, må fylles ut.

- [ ] **Testbruker-beskrivelse** — rapporten sier bruker1/2/3, oppgaven krever 6.

- [ ] **Manglende individuelle refleksjoner** — Vebjørn og Aleksandra står oppført men tomme. Synne og Aurora ser ut til å mangle også.

- [ ] **Sprint 3-leveranse "integrere vær-API"** — hvis dere implementerer ekte Yr-integrasjon (2D), kan det stå. Hvis ikke, omformuler til "mock-værdata som plassholder for vær-API".

---

## 5. MANGLENDE RAPPORT-SEKSJONER

Malen i oppgaven krever disse kapitlene — sjekk at alt er på plass:

| Kapittel | Status |
|---|---|
| Tittelside med USN-mal | ⚠️ Mangler, må lages |
| Introduksjon | ✅ Har |
| Prosjektplan | ✅ Har |
| Roller og arbeidsoppgaver (inkl. filnavn-tabell max 1 side) | ⚠️ Tabell ufullstendig og utdatert |
| Krav | ✅ Har, men beskriver mye som ikke er implementert (se seksjon 3) |
| Arkitektur og design | ⚠️ Mangler ER-diagram, klassediagram, utplasseringsdiagram |
| Testplan | ⚠️ Plan finnes, men mangler *resultat av testingen* |
| Prosessbeskrivelse | ⚠️ Mangler avvik plan/faktisk timeforbruk + krav-oppfyllelse-gjennomgang |
| Diskusjon og refleksjon | ⚠️ Flere individuelle refleksjoner mangler |
| **Kommentarer til bruk/tilpassing av kode** | ❌ **Mangler helt** (eksplisitt krav) |
| Litteraturliste (APA 7) | ✅ Har, men tynn |
| Vedlegg A (veiledning) | ❌ Tom |
| Vedlegg B (timelister) | ❌ Tom |
| Vedlegg C (gjesteforelesninger) | ✅ Har kort |

---

## 6. Rekkefølge — raskeste vei

Med ~1 uke igjen og en gruppe på 7: parallelliser.

### Dag 1–2 — kode-blockers
1. `seed.ts`: 6 testbrukere + riktige roller + fleksibel/fast testtur (2–3 timer)
2. Tilbakestill-testdata-knapp + endepunkt (2–3 timer)
3. Overlappende-påmelding-sjekk (1–2 timer)
4. Passport.js-wrap (1–2 timer) — eller begrunn avvik

### Dag 2–4 — parallelliserbare oppgaver (delegér)
5. **react-i18next** oppsett + oversetting av synlige strenger (1 person, 1 dag)
6. **Hytteeier-varsel-flyt** + side for forespørsler (1 person, 1 dag)
7. **GPX-import** i OpprettTur (1 person, 0,5 dag)
8. **Anmeldelser/stjerner API + UI** (1 person, 1 dag — modellene finnes)
9. **Ekte Yr-integrasjon** (1 person, 0,5 dag)
10. **Kartfilter på tid + visuell skille + "min posisjon"** (1 person, 1 dag)
11. **Deploy** (Vercel for web + Railway/Render for API + DB — 1 person, 0,5 dag)

### Dag 4–6 — rapport
12. Rett MariaDB→MySQL og filnavn-tabellen
13. Fjern/nedskaler urealiserte funksjoner (seksjon 3)
14. Fyll ut Vedlegg A, Vedlegg B
15. Skriv KI-bruk-kapittelet
16. Skriv testresultater, prosess-avvik, krav-oppfyllelse
17. Fyll ut manglende individuelle refleksjoner
18. Legg inn ER-diagram og bruksmønster-diagram

### Dag 6–7 — video + innlevering
19. Spill inn video (del 1 demo, del 2 teknisk, del 3 individuelt)
20. Pakk zip: `rapport.pdf`, `video.mp4`, mappe `app/` (uten `node_modules`, bildefiler, tredjepartskode)
21. Last opp i Wiseflow med navn `gruppe06.zip`

---

## 7. Hva som IKKE trenger bekymring

Allerede på plass og dekker kravene:
- React + Vite + Tailwind + TypeScript ✓
- Express + REST API ✓
- MySQL + Prisma ✓
- CRUD på turer, hytter, favoritter, påmeldinger ✓
- Leaflet-kart ✓
- Tegne sti i kart (klikke punkter i `OpprettTur`) ✓
- Høydedata på sti-punkter ✓
- Roller (admin, bruker, hytteeier, turleder, annonsør) ✓
- Påmeldingsflyt med pending/binding/freed/locked ✓
- Fleksibel tur med flere datoer og hytter (schema + API) ✓
- Rabatt til tidlig påmeldte (`rabatt_prosent` på `tur_dato`) ✓
- Hytte betjent/ubetjent-felt, pris, fasiliteter ✓
- Annonse-kategorier + keywords ✓
- bcrypt passord-hashing ✓
- "Skoleprosjekt ved USN"-banner i navbar ✓
- Utvikler-navn i filheadere ✓
- GitHub-repo med historikk ✓
- Prisma beskytter mot SQL injection ✓
- GPX-eksport (import gjenstår) ✓
- Undersider for overnattingssteder (`/hytter/:id`) ✓

---

## 8. Bevisst nedprioritering (dokumenteres i rapporten)

Hvis dere ikke rekker alt over, er dette ok å dokumentere som nedprioritert — men **må nevnes eksplisitt i "Prosessbeskrivelse"**:

- Chat og meldingssystem (DB-modeller er på plass, UI/API gjenstår)
- Bildedeling i chat med godkjenning
- Polering av mobil-GPS for sanntidsnavigering (grunnleggende "min posisjon" holder)
- Turmål som egen entitet (dekkes av tur + tursti)

Oppgaven sier eksplisitt: *"Det er ikke sikkert at alle gruppene får til å løse alle deler av oppgaven; det er mulig å bestå emnet likevel."* — men det må være bevisste valg, ikke utelatelser som dere ikke har forklart.
