/**
 * Fil: Layout.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Rammedokument som definerer felles sidestruktur
 * og navigasjon for hele applikasjonen.
 */

import { NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
    const location = useLocation();

    // hvilke ruter skal ha transparent navbar?
    const transparentRoutes = ["/"];
    const isTransparent = transparentRoutes.includes(location.pathname);
    return(
        <div className="min-h-screen bg-gray-100 text-gray-900">            
            <Navbar variant={isTransparent ? "transparent" : "solid"} />
            <Outlet />            
        </div>
    );
}