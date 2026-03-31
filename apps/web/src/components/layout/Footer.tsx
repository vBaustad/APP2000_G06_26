/**
 * Fil: Footer.tsx
 * Utvikler: Ramona Cretulescu
 *
 * Beskrivelse:
 * Footer-komponent for nettsiden som viser logo, kort prosjektbeskrivelse,
 * sentrale navigasjonslenker, kontaktinformasjon, sosiale medier og juridiske
 * lenker. Komponenten er tilpasset løsningens hovedinnhold og oppgavens fokus
 * på turer, kart, hytter, vær og turplanlegging.
 */

import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#17331C] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo + kort info */}
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
                <Link className="transition hover:text-white hover:underline" to="/explore">
                  Utforsker
                </Link>
              </li>

              <li>
                <Link className="transition hover:text-white hover:underline" to="/my-page">
                  Mine turer
                </Link>
              </li>

              <li>
                <Link className="transition hover:text-white hover:underline" to="/map">
                  Kart
                </Link>
              </li>

              <li>
                <Link className="transition hover:text-white hover:underline" to="/tour-routes">
                  Turforslag
                </Link>
              </li>

              <li>
                <Link className="transition hover:text-white hover:underline" to="/mycabins">
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
                <Link className="transition hover:text-white hover:underline" to="/weather">
                  Vær og forhold
                </Link>
              </li>

              <li>
                <Link className="transition hover:text-white hover:underline" to="/safety">
                  Sikkerhet
                </Link>
              </li>

              <li>
                <Link className="transition hover:text-white hover:underline" to="/explore">
                  Fellesturer
                </Link>
              </li>

              <li>
                <Link className="transition hover:text-white hover:underline" to="/about">
                  Om prosjektet
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt oss */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Kontakt oss
            </h3>

            <div className="space-y-4 text-sm text-white/90">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <span>+47 00 000 000 (man–fre 09–17)</span>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <span>post@utopia.com</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Utopiaveien 1, 0123 Utopia</span>
              </div>
            </div>

            <div className="mt-6">
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
              <Link className="transition hover:text-white hover:underline" to="/privacy">
                Personvern
              </Link>
              <Link className="transition hover:text-white hover:underline" to="/terms">
                Vilkår
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}