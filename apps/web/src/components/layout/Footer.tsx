/**
 * Fil: Footer.tsx
 * Utvikler: Ramona Cretulescu
 *
 * Beskrivelse:
 * Footer-komponent for nettsiden som viser logo, kort prosjektbeskrivelse,
 * navigasjonslenker, kontaktinformasjon og juridiske lenker.
 * Personvern og vilkår vises som modaler over siden.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import LegalModal from "./LegalModal";

export default function Footer() {
  const { t } = useTranslation("footer");
  const [openModal, setOpenModal] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="mt-16 bg-[#17331C] text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Logo + intro */}
            <div className="space-y-5">
              <Link to="/" aria-label={t("logoLinkAria")}>
                <img
                  src="/logos/utopia-footer-logo.png"
                  alt={t("logoAlt")}
                  className="h-12 w-auto object-contain"
                />
              </Link>

              <p className="max-w-xs text-sm leading-8 text-white/90">
                {t("intro")}
              </p>

              <p className="text-sm text-white/70">{t("studentProject")}</p>
            </div>

            {/* Innhold */}
            <div>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                {t("sections.content")}
              </h3>

              <ul className="space-y-4 text-sm text-white/90">
                <li>
                  <Link
                    to="/"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.home")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/turer"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.tours")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/kart"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.map")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/hytter"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.cabins")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/min-side"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.myPage")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Konto */}
            <div>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                {t("sections.account")}
              </h3>

              <ul className="space-y-4 text-sm text-white/90">
                <li>
                  <Link
                    to="/logg-inn"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.login")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/registrer"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.register")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/om-oss"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.about")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kontakt */}
            <div>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                {t("sections.contact")}
              </h3>

              <ul className="space-y-4 text-sm text-white/90">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
                  <a
                    href="mailto:post@utopia.com"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("contact.email")}
                  </a>
                </li>
                <li>
                  <Link
                    to="/kontakt"
                    className="transition hover:text-white hover:underline"
                  >
                    {t("links.contactPage")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Nederste linje */}
          <div className="mt-12 border-t border-white/15 pt-6">
            <div className="flex flex-col gap-3 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
              <p>{t("copyright")}</p>

              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setOpenModal("privacy")}
                  className="transition hover:text-white hover:underline"
                >
                  {t("privacy")}
                </button>

                <button
                  type="button"
                  onClick={() => setOpenModal("terms")}
                  className="transition hover:text-white hover:underline"
                >
                  {t("terms")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {openModal === "privacy" && (
        <LegalModal
          title={t("privacyModal.title")}
          updatedAt={t("legal.updatedAt")}
          buttonText={t("legal.close")}
          onClose={() => setOpenModal(null)}
        >
          <p>
            <Trans
              i18nKey="privacyModal.intro"
              ns="footer"
              components={[<strong key="0" />]}
            />
          </p>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {t("privacyModal.s1Title")}
            </h3>
            <p>{t("privacyModal.s1Body")}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {t("privacyModal.s2Title")}
            </h3>
            <p>{t("privacyModal.s2Body")}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {t("privacyModal.s3Title")}
            </h3>
            <p>{t("privacyModal.s3Body")}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {t("privacyModal.s4Title")}
            </h3>
            <p>{t("privacyModal.s4Body")}</p>
          </div>
        </LegalModal>
      )}

      {openModal === "terms" && (
        <LegalModal
          title={t("termsModal.title")}
          updatedAt={t("legal.updatedAt")}
          buttonText={t("legal.understood")}
          onClose={() => setOpenModal(null)}
        >
          <p>
            <Trans
              i18nKey="termsModal.intro"
              ns="footer"
              components={[<strong key="0" />]}
            />
          </p>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {t("termsModal.s1Title")}
            </h3>
            <p>{t("termsModal.s1Body")}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {t("termsModal.s2Title")}
            </h3>
            <p>{t("termsModal.s2Body")}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {t("termsModal.s3Title")}
            </h3>
            <p>{t("termsModal.s3Body")}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {t("termsModal.s4Title")}
            </h3>
            <p>{t("termsModal.s4Body")}</p>
          </div>
        </LegalModal>
      )}
    </>
  );
}
