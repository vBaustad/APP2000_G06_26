/**
 * Fil: Navbar.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse:
 * Navigasjonskomponent som viser hovedmenyen og tilpasser utseende basert på side.
 */

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

type NavbarVariant = "transparent" | "solid";
type NavbarProps = { variant?: NavbarVariant };

export default function Navbar({ variant = "solid" }: NavbarProps) {
  const { t, i18n } = useTranslation("navbar");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isTransparent = variant === "transparent";
  const showDarkStyle = isTransparent && !scrolled;
  const isLoggedIn = !!user;
  const isHytteeier = user?.roller?.includes("hytteeier") ?? false;
  const isAnnonsor = user?.roller?.includes("annonsor") ?? false;
  const isAdmin = user?.roller?.includes("admin") ?? false;
  const isTurleder = user?.roller?.includes("turleder") ?? false;

  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const isNorwegian = currentLang?.startsWith("nb") ?? true;
  const nextLang = isNorwegian ? "en" : "nb";
  const langLabel = isNorwegian ? t("languageEn") : t("languageNo");
  const langTitle = isNorwegian ? t("switchToEnglish") : t("switchToNorwegian");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const topBarClass =
    "fixed top-0 left-0 z-[11000] flex h-8 w-full items-center justify-center border-b border-gray-200 bg-white px-4 text-center text-[12px] font-medium text-gray-700";

  const headerClass = `fixed left-0 right-0 top-8 z-[10990] border-b transition-all duration-300 ${
    showDarkStyle
      ? "border-white/10 bg-[#17331C]/86 text-white backdrop-blur-md"
      : "border-gray-200 bg-white/96 text-gray-900 shadow-sm backdrop-blur"
  }`;

  const linkClass = ({ isActive }: { isActive: boolean }) => {
    const base =
      "relative text-[15px] font-semibold transition-colors duration-200 after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:rounded-full after:transition-all after:duration-200";

    if (showDarkStyle) {
      return `${base} ${
        isActive
          ? "text-white after:w-full after:bg-white"
          : "text-white/85 hover:text-white after:w-0 after:bg-white"
      }`;
    }

    return `${base} ${
      isActive
        ? "text-[#17331C] after:w-full after:bg-[#17331C]"
        : "text-gray-700 hover:text-[#17331C] after:w-0 after:bg-[#17331C]"
    }`;
  };

  const loginButtonClass = showDarkStyle
    ? "inline-flex items-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
    : "inline-flex items-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50";

  const registerButtonClass =
    "inline-flex items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500";

  const languageButtonClass = showDarkStyle
    ? "inline-flex items-center rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
    : "inline-flex items-center rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-700 transition hover:border-[#17331C] hover:text-[#17331C]";

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) => {
    const base = "block rounded-lg px-3 py-2.5 text-sm font-medium transition";

    if (showDarkStyle) {
      return `${base} ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/90 hover:bg-white/10 hover:text-white"
      }`;
    }

    return `${base} ${
      isActive
        ? "bg-gray-100 text-[#17331C]"
        : "text-gray-700 hover:bg-gray-100 hover:text-[#17331C]"
    }`;
  };

  const mobilePanelClass = showDarkStyle
    ? "border-t border-white/10 bg-[#17331C]/95 text-white backdrop-blur-md"
    : "border-t border-gray-200 bg-white text-gray-900 shadow-sm";

  return (
    <>
      <div className={topBarClass}>{t("banner")}</div>

      <header className={headerClass}>
        <nav className="mx-auto flex h-[84px] max-w-7xl items-center justify-between px-5 md:px-8">
          <NavLink to="/" aria-label={t("home")} className="flex items-center">
            <img
              src="/logos/utopia-logo.png"
              alt={t("logoAlt")}
              className={showDarkStyle ? "h-[56px] w-auto object-contain brightness-0 invert md:h-[68px]" : "h-[56px] w-auto object-contain md:h-[68px]"}
            />
          </NavLink>

          <div className="hidden items-center gap-10 lg:flex">
            <ul className="flex items-center gap-10">
              <li>
                <NavLink to="/" className={linkClass}>
                  {t("home")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/kart" className={linkClass}>
                  {t("map")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/turer" className={linkClass}>
                  {t("tours")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/hytter" className={linkClass}>
                  {t("cabins")}
                </NavLink>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => i18n.changeLanguage(nextLang)}
              className={languageButtonClass}
              title={langTitle}
              aria-label={langTitle}
            >
              {langLabel}
            </button>

            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <NavLink to="/logg-inn" className={loginButtonClass}>
                  {t("login")}
                </NavLink>
                <NavLink to="/registrer" className={registerButtonClass}>
                  {t("register")}
                </NavLink>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className={registerButtonClass}
                >
                  {t("profile")}
                  <span className="ml-1 text-xs">▾</span>
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 z-[10000] mt-3 w-52 rounded-xl border border-gray-200 bg-white p-2 text-sm text-gray-900 shadow-xl"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <NavLink
                      to="/min-side"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                    >
                      {t("mySide")}
                    </NavLink>
                    <NavLink
                      to="/meldinger"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                    >
                      {t("messages")}
                    </NavLink>
                    {isTurleder && (
                      <NavLink
                        to="/mine-turer-leder"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                      >
                        {t("myTourLeader")}
                      </NavLink>
                    )}
                    {isHytteeier && (
                      <NavLink
                        to="/mine-hytter"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                      >
                        {t("myCabins")}
                      </NavLink>
                    )}
                    {isAnnonsor && (
                      <NavLink
                        to="/annonsor"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                      >
                        {t("advertiser")}
                      </NavLink>
                    )}
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                      >
                        {t("admin")}
                      </NavLink>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate("/logget-ut");
                      }}
                      className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`rounded-lg p-2 transition lg:hidden ${
              showDarkStyle
                ? "text-white hover:bg-white/10"
                : "text-gray-800 hover:bg-gray-100"
            }`}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className={`lg:hidden ${mobilePanelClass}`}>
            <div className="mx-auto max-w-7xl px-5 py-4 md:px-6">
              <div className="space-y-2">
                <NavLink to="/" className={mobileLinkClass}>
                  {t("home")}
                </NavLink>
                <NavLink to="/kart" className={mobileLinkClass}>
                  {t("map")}
                </NavLink>
                <NavLink to="/turer" className={mobileLinkClass}>
                  {t("tours")}
                </NavLink>
                <NavLink to="/hytter" className={mobileLinkClass}>
                  {t("cabins")}
                </NavLink>

                <button
                  type="button"
                  onClick={() => i18n.changeLanguage(nextLang)}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-100"
                >
                  {langLabel}
                </button>

                {!isLoggedIn ? (
                  <>
                    <NavLink to="/logg-inn" className={mobileLinkClass}>
                      {t("login")}
                    </NavLink>
                    <NavLink to="/registrer" className={mobileLinkClass}>
                      {t("register")}
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/min-side" className={mobileLinkClass}>
                      {t("mySide")}
                    </NavLink>
                    <NavLink to="/meldinger" className={mobileLinkClass}>
                      {t("messages")}
                    </NavLink>
                    {isTurleder && (
                      <NavLink to="/mine-turer-leder" className={mobileLinkClass}>
                        {t("myTourLeader")}
                      </NavLink>
                    )}
                    {isHytteeier && (
                      <NavLink to="/mine-hytter" className={mobileLinkClass}>
                        {t("myCabins")}
                      </NavLink>
                    )}
                    {isAnnonsor && (
                      <NavLink to="/annonsor" className={mobileLinkClass}>
                        {t("advertiser")}
                      </NavLink>
                    )}
                    {isAdmin && (
                      <NavLink to="/admin" className={mobileLinkClass}>
                        {t("admin")}
                      </NavLink>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate("/logget-ut");
                      }}
                      className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        showDarkStyle
                          ? "text-red-200 hover:bg-white/10 hover:text-red-100"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                    >
                      {t("logout")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
