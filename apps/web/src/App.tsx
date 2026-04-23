/**
 * Fil: App.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse: Hovedkomponenten for applikasjonen som håndterer ruting og
 * hvilke sider som vises basert på URL.
 */

import { Routes, Route } from "react-router-dom";
import IkkeFunnet from "./pages/IkkeFunnet";
import Forside from "./pages/Forside";
import LoggInn from "./pages/LoggInn";
import Layout from "./components/Layout";
import Turer from "./pages/Turer";
import Kart from "./pages/Kart";
import MinSide from "./pages/MinSide";
import Registrer from "./pages/Registrer";
import MineHytter from "./pages/MineHytter";
import TurDetaljer from "./pages/TurDetaljer";
import RedigerProfil from "./pages/RedigerProfil";
import OmOss from "./pages/OmOss";
import Kontakt from "./pages/Kontakt";
import OpprettTur from "./pages/OpprettTur";
import RedigerTur from "./pages/RedigerTur";
import OpprettAnnonsor from "./pages/OpprettAnnonsor";
import Annonsor from "./pages/Annonsor";
import LoggetUt from "./pages/LoggetUt";
import Admin from "./pages/Admin";
import Hytter from "./pages/Hytter";
import HytteDetaljer from "./pages/HytteDetaljer";
import MineTurerLeder from "./pages/MineTurerLeder";
import Meldinger from "./pages/Meldinger";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Forside />} />
          <Route path="/logg-inn" element={<LoggInn />} />
          <Route path="/registrer" element={<Registrer />} />
          <Route path="/turer" element={<Turer />} />
          <Route path="/turer/:id" element={<TurDetaljer />} />
          <Route path="/turer/:id/rediger" element={<RedigerTur />} />
          <Route path="/kart" element={<Kart />} />
          <Route path="/min-side" element={<MinSide />} />
          <Route path="/meldinger" element={<Meldinger />} />
          <Route path="/mine-hytter" element={<MineHytter />} />
          <Route path="/mine-turer-leder" element={<MineTurerLeder />} />
          <Route path="/hytter" element={<Hytter />} />
          <Route path="/hytter/:id" element={<HytteDetaljer />} />
          <Route path="/rediger-profil" element={<RedigerProfil />} />
          <Route path="/om-oss" element={<OmOss />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/opprett-tur" element={<OpprettTur />} />
          <Route path="/opprett-annonsor" element={<OpprettAnnonsor />} />
          <Route path="/annonsor" element={<Annonsor />} />
          <Route path="/logget-ut" element={<LoggetUt />} />
          <Route path="/admin" element={<Admin />} />

        </Route>

        <Route path="*" element={<IkkeFunnet />} />
      </Routes>
    </div>
  );
}
