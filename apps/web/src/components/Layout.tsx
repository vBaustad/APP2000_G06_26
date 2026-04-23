/**
 * Fil: Layout.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Rammedokument som definerer felles sidestruktur
 * og navigasjon for hele applikasjonen.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

/**
 * Fil: Layout.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Layout-komponent som definerer den overordnede strukturen for alle sider.
 */

import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./layout/Footer";

export default function Layout() {
  const location = useLocation();

  const transparentRoutes = ["/"];
  const isTransparent = transparentRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar variant={isTransparent ? "transparent" : "solid"} />

      <main className={isTransparent ? "" : "pt-[116px]"}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}