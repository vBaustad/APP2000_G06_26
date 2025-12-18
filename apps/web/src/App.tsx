import { BrowserRouter, Routes, Route } from "react-router-dom"
import NotFoundPage from "./pages/NotFoundPage"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import Layout from "./components/Layout"
import ExplorePage from "./pages/ExplorePage"
import MapPage from "./pages/MapPage"
import MyPage from "./pages/MyPage"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/me" element={<MyPage />} />
          </Route>
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

