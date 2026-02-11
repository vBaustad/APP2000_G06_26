/**
 * Fil: App.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
 * Beskrivelse: Hovedkomponenten for applikasjonen som håndterer ruting og
 * hvilke sider som vises basert på URL.
 */


import { Routes, Route } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import ExplorePage from "./pages/ExplorePage";
import MapPage from "./pages/MapPage";
import MyPage from "./pages/MyPage";
import SignupPage from "./pages/SignupPage";
import MyCabinsPage from "./pages/MyCabinsPage";
import TourDetailsPage from "./pages/TourDetailsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/me" element={<MyPage />} />
          <Route path="/mycabins" element={<MyCabinsPage />} />

          {/* Detaljside for tur */}
          <Route path="/tours/:id" element={<TourDetailsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
