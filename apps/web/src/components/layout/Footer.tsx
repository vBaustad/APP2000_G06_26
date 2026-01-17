/**
 * Fil: Footer.tsx
 * Utvikler: Ramona Cretulescu
 *
 * Beskrivelse: Footer-komponent for hovedsiden som inneholder logoen, kontaktinformasjon, ikoner for sosiale medier, og navigasjonslenker i videre utvikling.
 * - Inneholder: logo/intro, kontaktinfo, navigasjonslenker, sosiale medier og juridiske lenker.
 * Logoen er satt opp i bildefilen utopia-footer-logo.png.
 */

import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    /** Bakgrunnsfarge: #17331C (grønn) og ikoner: hvitt for kontrast */
    <footer className="mt-16 bg-[#17331C] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Logo + intro + kontaktinfo */}
          <div className="space-y-4">

            {/* Logo-bilde) */}
            <img src={"/logos/utopia-footer-logo.png"}
              alt="Utopia - Turistforeningen i Utopia"
              className="h-12 w-auto object-contain"/>

            {/* Kort beskrivelse */}
            <p className="text-sm leading-6 text-white/90">
              Siden 2026 har vi jobbet for at alle skal kunne oppleve norsk natur.
              Utopia tilbyr turer, kart og overnatting for alle typer friluftsentusiaster.
            </p>

            {/* Kontaktlinjer med ikoner */}
            <div className="space-y-2 text-sm text-white/90">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-white" />
                <span> +47 00 000 000 (man - fre 09-17)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-white" />
                <span>post@utopia.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-white" />
                <span> Utopiaveien 1, 0123 Utopia</span>
              </div>
            </div>
          </div>

          {/* Planlegg tur */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Planlegg tur
            </h3>
            <ul className="space-y-3 text-sm text-white/90">
              <li>
                <Link className="hover:underline" to="/trips">
                  Finn turrute
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/map">
                  Interaktivt kart
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/cabins">
                  Book hytte
                </Link>
              </li>
            </ul>
          </div>

          {/* Informasjon */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Informasjon
            </h3>
            <ul className="space-y-3 text-sm text-white/90">
              <li>
                <Link className="hover:underline" to="/weather">
                  Værvarsling
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/safety">
                  Sikkerhet på tur
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/reports">
                  Turrapporter
                </Link>
              </li>
            </ul>
          </div>

          {/* Om Utopia */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Om Utopia
            </h3>
            <ul className="space-y-3 text-sm text-white/90">
              <li>
                <Link className="hover:underline" to="/about">
                  Om organisasjonen
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/jobs">
                  Jobb hos oss
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Skillelinje */}
        <div className="my-10 h-px w-full bg-white/20" />

        {/* Sosiale medier: */}
        <div className="flex justify-center gap-4">
          <a
            href="#"
            aria-label="Facebook"
            className="rounded-lg bg-white/10 p-3 hover:bg-white/20"
          >
            <Facebook className="h-5 w-5 text-white" />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="rounded-lg bg-white/10 p-3 hover:bg-white/20"
          >
            <Instagram className="h-5 w-5 text-white" />
          </a>
          <a
            href="#"
            aria-label="YouTube"
            className="rounded-lg bg-white/10 p-3 hover:bg-white/20"
          >
            <Youtube className="h-5 w-5 text-white" />
          </a>
        </div>

        {/* Nederste linje: */}
        <div className="mt-10 flex flex-col gap-4 text-sm text-white/90 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Turistforeningen i Utopia</p>

          <div className="flex gap-6">
            <Link className="hover:underline" to="/privacy">
              Personvern
            </Link>
            <Link className="hover:underline" to="/terms">
              Vilkår
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
