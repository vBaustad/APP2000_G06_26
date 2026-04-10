/**
 * Fil: Navbar.tsx
 * Utvikler(e): Vebjørn Baustad, Alex, Ramona Cretulescu
 * Beskrivelse: Navigasjonskomponent som viser hovedmenyen og tilpasser
 * utseende basert på side (transparent eller solid bakgrunn). Viser forskjellige navbar meny items basert på om bruker er logget inn og hvilken rolle de har.
 */

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type NavbarVariant = "transparent" | "solid";
type NavbarProps = { variant?: NavbarVariant };

export default function Navbar({ variant = "solid" }: NavbarProps) {
  const isTransparent = variant === "transparent";

  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const isHytteeier = user?.roller?.includes("hytteeier");
  const [profileOpen, setProfileOpen] = useState(false);

  const topBarClass = isTransparent
    ? "absolute top-0 left-0 z-[10000] w-full bg-[#17331C]/95 py-2 text-center text-sm font-medium text-white/90 backdrop-blur"
    : "relative z-[10000] w-full bg-[#17331C] py-2 text-center text-sm font-medium text-white/90";

  const headerClass = isTransparent
    ? "absolute top-8 left-0 z-[9999] w-full bg-gradient-to-b from-black/40 to-transparent text-white"
    : "relative z-[9999] w-full border-b border-gray-200 bg-white/95 text-gray-900 shadow-sm backdrop-blur";

  const navClass = "mx-auto flex max-w-7xl items-center justify-between px-6 py-4";

  const logoClass = isTransparent
    ? "h-16 w-auto object-contain md:h-20 brightness-0 invert drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)]"
    : "h-16 w-auto object-contain md:h-20";

  const linkBase = "transition font-medium";
  const linkClass = ({ isActive }: { isActive: boolean }) => {
    if (isTransparent) {
      return `${linkBase} ${
        isActive ? "text-white" : "text-white/80 hover:text-white"
      }`;
    }
    return `${linkBase} ${
      isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
    }`;
  };

  const profileButtonClass = isTransparent
    ? "flex items-center gap-2 rounded-md border border-white/50 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/30"
    : "flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500";

  const dropdownLinkClass =
    "block rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-100";

  return (
    <>
      <div className={topBarClass}>
        Dette er et skoleprosjekt ved USN og ikke en ekte nettside.
      </div>

      <header className={headerClass}>
        <nav className={navClass}>
          <NavLink
            to="/"
            className="flex items-center transition-transform duration-200 hover:scale-105"
          >
            <img
              src="/logos/utopia-logo.png"
              alt="Utopia logo"
              className={logoClass}
            />
          </NavLink>

          <ul className="hidden items-center gap-8 font-medium md:flex">
            <li>
              <NavLink to="/" className={linkClass}>
                Hjem
              </NavLink>
            </li>
            <li>
              <NavLink to="/map" className={linkClass}>
                Kart
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore" className={linkClass}>
                Utforsker
              </NavLink>
            </li>
           <li>
            <NavLink to="/annonsor" className={linkClass}>
             Annonsør
            </NavLink>
            </li>

            {!isLoggedIn ? (
              <>
                <li>
                  <NavLink to="/login" className={linkClass}>
                    Logg inn
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/signup" className={linkClass}>
                    Registrer
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="relative z-40">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className={profileButtonClass}
                >
                  Profil
                  <span className="text-xs">▾</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-[10000] mt-3 w-48 rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-xl">
                    <NavLink
                      to="/me"
                      className={dropdownLinkClass}
                      onClick={() => setProfileOpen(false)}
                    >
                      Min side
                    </NavLink>

                    {isHytteeier && (
                      <NavLink
                        to="/mycabins"
                        className={dropdownLinkClass}
                        onClick={() => setProfileOpen(false)}
                      >
                        Mine hytter
                      </NavLink>
                    )}

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                      Logg ut
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  );
}