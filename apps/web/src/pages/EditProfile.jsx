import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const isLoggedIn = true; // Simulerer innlogget status

  // Dummy info lagret i state for redigering
  const [formData, setFormData] = useState({
    name: "Ola Nordmann",
    email: "ola@nordmann.no",
    phone: "987 65 432",
    favorites: "Besseggen, Gjendesheim, Galdhøpiggen", // Behandler dette som en streng for enkel redigering
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Her ville du vanligvis sendt data til backend API
    console.log("Lagrer data:", formData);
    alert("Profilen er oppdatert!");
    navigate("/mypage"); // Sender brukeren tilbake til min side
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')` }}>
        <p>Du må logge inn.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8 bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')`,
      }}
    >
      <div className="w-full max-w-2xl bg-white bg-opacity-95 rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Rediger Profil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Navn */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Fullt navn
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* E-post */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-postadresse
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefonnummer
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* Favoritter */}
          <div>
            <label htmlFor="favorites" className="block text-sm font-medium text-gray-700 mb-1">
              Favoritter (separer med komma)
            </label>
            <textarea
              name="favorites"
              id="favorites"
              rows="3"
              value={formData.favorites}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              placeholder="F.eks: Besseggen, Galdhøpiggen..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Skriv inn navnene på dine favorittsteder.
            </p>
          </div>

          {/* Knapper */}
          <div className="flex items-center gap-4 mt-8 pt-4 border-t">
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
            >
              Lagre endringer
            </button>
            
            <NavLink
              to="/mypage"
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              Avbryt
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}   