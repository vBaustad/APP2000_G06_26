/**
 * Fil: App.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
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
import OpprettAnnonsor from "./pages/OpprettAnnonsor";
import FleksibelTur from "./pages/FleksibelTur";
import FastGruppeTur from "./pages/FastGruppeTur";
import Annonsor from "./pages/Annonsor";
import LoggetUt from "./pages/LoggetUt";
import Admin from "./pages/Admin";
import Hytter from "./pages/Hytter";


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
          <Route path="/kart" element={<Kart />} />
          <Route path="/min-side" element={<MinSide />} />
          <Route path="/mine-hytter" element={<MineHytter />} />
          <Route path="/hytter" element={<Hytter />} />
          <Route path="/rediger-profil" element={<RedigerProfil />} />
          <Route path="/om-oss" element={<OmOss />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/opprett-tur" element={<OpprettTur />} />
          <Route path="/opprett-annonsor" element={<OpprettAnnonsor />} />
          <Route path="/fleksibel-tur" element={<FleksibelTur />} />
          <Route path="/fast-gruppe-tur" element={<FastGruppeTur />} />
          <Route path="/annonsor" element={<Annonsor />} />
          <Route path="/logget-ut" element={<LoggetUt />} />
          <Route path="/admin" element={<Admin />} />

        </Route>

        <Route path="*" element={<IkkeFunnet />} />
      </Routes>
    </div>
  );
}
