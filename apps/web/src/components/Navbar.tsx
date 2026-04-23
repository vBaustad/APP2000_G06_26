/**
 * Fil: Navbar.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse:
 * Navigasjonskomponent som viser hovedmenyen og tilpasser utseende basert på side.
 */

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type NavbarVariant = "transparent" | "solid";
type NavbarProps = { variant?: NavbarVariant };

export default function Navbar({ variant = "solid" }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isTransparent = variant === "transparent";
  const showDarkStyle = isTransparent && !scrolled;
  const isLoggedIn = !!user;

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
      <div className={topBarClass}>
        Dette er et skoleprosjekt ved USN og ikke en ekte nettside.
      </div>

      <header className={headerClass}>
        <nav className="mx-auto flex h-[84px] max-w-7xl items-center justify-between px-5 md:px-8">
          <NavLink to="/" aria-label="Gå til forsiden" className="flex items-center">
            <img
              src="/logos/utopia-logo.png"
              alt="Utopia logo"
              className={showDarkStyle ? "h-[56px] w-auto object-contain brightness-0 invert md:h-[68px]" : "h-[56px] w-auto object-contain md:h-[68px]"}
            />
          </NavLink>

          <div className="hidden items-center gap-10 lg:flex">
            <ul className="flex items-center gap-10">
              <li>
                <NavLink to="/" className={linkClass}>
                  Forside
                </NavLink>
              </li>
              <li>
                <NavLink to="/kart" className={linkClass}>
                  Kart
                </NavLink>
              </li>
              <li>
                <NavLink to="/turer" className={linkClass}>
                  Turer
                </NavLink>
              </li>
              <li>
                <NavLink to="/hytter" className={linkClass}>
                  Hytter
                </NavLink>
              </li>
            </ul>

            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <NavLink to="/logg-inn" className={loginButtonClass}>
                  Logg inn
                </NavLink>
                <NavLink to="/registrer" className={registerButtonClass}>
                  Registrer
                </NavLink>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink to="/min-side" className={loginButtonClass}>
                  Min side
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/logget-ut");
                  }}
                  className={registerButtonClass}
                >
                  Logg ut
                </button>
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
            aria-label={mobileOpen ? "Lukk meny" : "Åpne meny"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className={`lg:hidden ${mobilePanelClass}`}>
            <div className="mx-auto max-w-7xl px-5 py-4 md:px-6">
              <div className="space-y-2">
                <NavLink to="/" className={mobileLinkClass}>
                  Forside
                </NavLink>
                <NavLink to="/kart" className={mobileLinkClass}>
                  Kart
                </NavLink>
                <NavLink to="/turer" className={mobileLinkClass}>
                  Turer
                </NavLink>
                <NavLink to="/hytter" className={mobileLinkClass}>
                  Hytter
                </NavLink>

                {!isLoggedIn ? (
                  <>
                    <NavLink to="/logg-inn" className={mobileLinkClass}>
                      Logg inn
                    </NavLink>
                    <NavLink to="/registrer" className={mobileLinkClass}>
                      Registrer
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/min-side" className={mobileLinkClass}>
                      Min side
                    </NavLink>
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
                      Logg ut
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