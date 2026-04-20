/**
 * Fil: Footer.tsx
 * Utvikler: Ramona Cretulescu
 *
 * Beskrivelse:
 * Footer-komponent for nettsiden som viser logo, kort prosjektbeskrivelse,
 * navigasjonslenker, kontaktinformasjon, sosiale medier og juridiske lenker.
 * Personvern og vilkår vises som modaler over siden.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import LegalModal from "./LegalModal";

export default function Footer() {
  const [openModal, setOpenModal] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="mt-16 bg-[#17331C] text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Logo + intro */}
            <div className="space-y-5">
              <img
                src="/logos/utopia-footer-logo.png"
                alt="Utopia"
                className="h-12 w-auto object-contain"
              />

              <p className="max-w-xs text-sm leading-8 text-white/90">
                Utopia gjør det enklere å utforske turer, kart og hytter på ett
                sted, med inspirasjon og nyttig informasjon for turplanlegging.
              </p>

              <p className="text-sm text-white/70">Studentprosjekt ved USN.</p>
            </div>

            {/* Innhold */}
            <div>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                Innhold
              </h3>

              <ul className="space-y-4 text-sm text-white/90">
                <li>
                  <Link
                    to="/turer"
                    className="transition hover:text-white hover:underline"
                  >
                    Utforsker
                  </Link>
                </li>
                <li>
                  <Link
                    to="/min-side"
                    className="transition hover:text-white hover:underline"
                  >
                    Mine turer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/kart"
                    className="transition hover:text-white hover:underline"
                  >
                    Kart
                  </Link>
                </li>
                <li>
                  <Link
                    to="/turer"
                    className="transition hover:text-white hover:underline"
                  >
                    Turforslag
                  </Link>
                </li>
                <li>
                  <Link
                    to="/hytter"
                    className="transition hover:text-white hover:underline"
                  >
                    Hytter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Informasjon */}
            <div>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                Informasjon
              </h3>

              <ul className="space-y-4 text-sm text-white/90">
                <li>
                  <Link
                    to="/kart"
                    className="transition hover:text-white hover:underline"
                  >
                    Vær og forhold
                  </Link>
                </li>
                <li>
                  <Link
                    to="/turer"
                    className="transition hover:text-white hover:underline"
                  >
                    Fellesturer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/turer"
                    className="transition hover:text-white hover:underline"
                  >
                    Turaktiviteter
                  </Link>
                </li>
                <li>
                  <Link
                    to="/om-oss"
                    className="transition hover:text-white hover:underline"
                  >
                    Om prosjektet
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kontakt */}
            <div>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                Kontakt
              </h3>

              <ul className="space-y-4 text-sm text-white/90">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
                  <span>+47 00 000 000 (man–fre 09–17)</span>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
                  <span>post@utopia.com</span>
                </li>

                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
                  <span>Utopiaveien 1, 0123 Utopia</span>
                </li>

                <li>
                  <Link
                    to="/kontakt"
                    className="transition hover:text-white hover:underline"
                  >
                    Kontaktside
                  </Link>
                </li>
              </ul>

              <div className="mt-8">
                <p className="mb-3 text-sm font-medium text-white/80">Følg oss</p>

                <div className="flex gap-3">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>

                  <a
                    href="#"
                    aria-label="Instagram"
                    className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>

                  <a
                    href="#"
                    aria-label="YouTube"
                    className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Nederste linje */}
          <div className="mt-12 border-t border-white/15 pt-6">
            <div className="flex flex-col gap-3 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
              <p>© 2026 Utopia</p>

              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setOpenModal("privacy")}
                  className="transition hover:text-white hover:underline"
                >
                  Personvern
                </button>

                <button
                  type="button"
                  onClick={() => setOpenModal("terms")}
                  className="transition hover:text-white hover:underline"
                >
                  Vilkår
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {openModal === "privacy" && (
        <LegalModal
          title="Personvernerklæring"
          updatedAt="31.3.2026"
          buttonText="Lukk"
          onClose={() => setOpenModal(null)}
        >
          <p>
            Utopia er utviklet som et <strong>studentprosjekt</strong> ved
            Universitetet i Sørøst-Norge (USN). Informasjonen som registreres i
            løsningen brukes bare for å demonstrere hvordan applikasjonen
            fungerer i undervisningssammenheng.
          </p>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              1. Hvilke opplysninger kan bli lagret?
            </h3>
            <p>
              Løsningen kan lagre informasjon som du selv oppretter eller fyller
              inn, for eksempel brukerprofil, turer, aktiviteter og annet
              innhold som er relevant for bruk av applikasjonen.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              2. Hva brukes opplysningene til?
            </h3>
            <p>
              Opplysningene brukes bare for å vise og teste funksjoner i
              systemet. De deles ikke som del av kommersiell drift, og de brukes
              ikke til markedsføring eller videreformidling.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              3. Hvor lenge blir data lagret?
            </h3>
            <p>
              Data som er lagt inn i løsningen er ment for prosjektperioden og
              kan bli fjernet når skoleprosjektet avsluttes eller når det ikke
              lenger er behov for å beholde dem.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              4. Kontakt og sletting
            </h3>
            <p>
              Dersom du ønsker at innhold eller brukerdata skal fjernes, kan du
              ta kontakt med studentgruppen som står bak prosjektet.
            </p>
          </div>
        </LegalModal>
      )}

      {openModal === "terms" && (
        <LegalModal
          title="Vilkår for bruk"
          updatedAt="31.3.2026"
          buttonText="Jeg forstår"
          onClose={() => setOpenModal(null)}
        >
          <p>
            Ved bruk av Utopia aksepterer du at løsningen er et
            <strong> studentprosjekt</strong> utviklet som del av undervisning
            ved USN. Tjenesten er laget for læring, demonstrasjon og testing.
          </p>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              1. Bruk av løsningen
            </h3>
            <p>
              Applikasjonen skal brukes på en forsvarlig måte. Innhold og
              funksjoner er laget for å vise hvordan en turplattform kan bygges
              opp, og ikke som en ferdig kommersiell tjeneste.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              2. Begrenset ansvar
            </h3>
            <p>
              Studentgruppen gir ingen garanti for at løsningen alltid er
              tilgjengelig eller feilfri. Brukere bør derfor unngå å lagre
              sensitiv eller kritisk informasjon i systemet.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              3. God brukskikk
            </h3>
            <p>
              Det er ikke tillatt å prøve å skade løsningen, omgå sikkerhet,
              laste opp upassende innhold eller bruke tjenesten på en måte som
              kan påvirke andre brukere negativt.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              4. Endringer
            </h3>
            <p>
              Innhold, funksjoner og tekst kan bli justert underveis i
              prosjektet som del av videre utvikling og testing.
            </p>
          </div>
        </LegalModal>
      )}
    </>
  );
}