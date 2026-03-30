/**
 * Fil: Layout.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Rammedokument som definerer felles sidestruktur
 * og navigasjon for hele applikasjonen.
 */

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./layout/Footer";
import Chatbot from "./Chatbot";

export default function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <Chatbot />
    </>
  );
}