/**
 * Fil: Navbar.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Navigasjonskomponent som viser hovedmenyen og tilpasser
 * utseende basert på side (transparent eller solid bakgrunn). Viser forskjellige navbar meny items basert på om bruker er logget inn og hvilken rolle de har.
 */

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type NavbarVariant = "transparent" | "solid";
type NavbarProps = { variant?: NavbarVariant; };

export default function Navbar({ variant = "solid" }: NavbarProps) {
    const isTransparent = variant === "transparent";

    const { user, logout } = useAuth();
    const isLoggedIn = !!user;
    const isHytteeier = user?.roller?.includes("hytteeier");
    console.log("NAV user:", user);
    const [profileOpen, setProfileOpen] = useState(false);

    const headerClass = isTransparent
        ? "absolute top-0 left-0 w-full z-[9999] bg-transparent text-white"
        : "relative w-full z-[9999] bg-white/90 backdrop-blur border-b border-gray-200 text-gray-900";

    const linkBase = "transition font-medium";
    const linkClass = ({ isActive }: { isActive: boolean }) => {
        if (isTransparent) {
        return `${linkBase} ${isActive ? "text-white" : "text-white/80 hover:text-white"}`;
        }
        return `${linkBase} ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`;
    };
    const profileButtonClass = isTransparent
        ? "flex items-center gap-2 rounded-md border border-white/50 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur hover:bg-white/30"
        : "flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500";

    const dropdownLinkClass = "block rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-100";
    return(
        <>        
            <header className={headerClass}>
                <nav className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
                    {/* Logo */}
                    <NavLink
                    to="/"
                    className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
                    <div className="h-8 w-8 rounded-md bg-emerald-600 text-white flex items-center justify-center font-semibold cursor-pointer transition-colors duration-200 hover:bg-emerald-500">
                        TUR
                    </div>
                    </NavLink>
                    <ul className="hidden md:flex items-center gap-8 font-medium">
                        <li><NavLink to="/" className={linkClass}>Hjem</NavLink></li>
                        <li><NavLink to="/map" className={linkClass}>Kart</NavLink></li>
                        <li><NavLink to="/explore" className={linkClass}>Utforsker</NavLink></li>                       

                        {!isLoggedIn ? (
                            <>
                            <li><NavLink to="/login" className={linkClass}>Logg inn</NavLink></li>
                            <li><NavLink to="/signup" className={linkClass}>Registrer</NavLink></li>
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
                                    <div className="absolute right-0 mt-3 w-48 rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-xl z-[10000]">
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
