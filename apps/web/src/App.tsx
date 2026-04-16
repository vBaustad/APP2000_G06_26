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
import EditProfile from "./pages/EditProfile";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CreateTripPage from "./pages/CreateTripPage";
import CreateAnnonsorPage from "./pages/CreateAnnonsorPage";
import FlexibleTripDetailsPage from "./pages/FlexibleTripDetailsPage";
import FastGroupTripDetailsPage from "./pages/FastGroupTripDetailsPage";
import AnnonsorPage from "./pages/annonsor";



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
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/create-trip" element={<CreateTripPage />} />
          <Route path="/create-annonsor" element={<CreateAnnonsorPage />} />
          <Route path="/flexible-trip-demo" element={<FlexibleTripDetailsPage />} />
          <Route path="/fast-group-trip-demo" element={<FastGroupTripDetailsPage />} />
          <Route path="/annonsor" element={<AnnonsorPage />} />

        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}