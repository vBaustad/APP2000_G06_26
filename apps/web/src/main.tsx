/**
 * Fil: main.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
 * Beskrivelse: Inngangspunkt for React-applikasjonen som initialiserer
 * appen og renderer rot-komponenten.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);