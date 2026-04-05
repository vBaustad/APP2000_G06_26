/**
 * Fil: MyPage.tsx
 * Utvikler: Parasto Jamshidi
 * Beskrivelse: Denne siden viser brukerens personlige informasjon, inkludert profil,
 * favoritter og turer. Innholdet vises kun dersom brukeren er logget inn.
 * Hvis ikke, blir brukeren sendt til innloggingssiden.
 */

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

type User = {
  _id?: string;
  id?: string;
  email: string;
};

type Trip = {
  id: number;
  title: string;
  date: string;
  status: string;
};

export default function MyPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const favorites = ["Besseggen", "Gjendesheim", "Galdhøpiggen"];

  const myTrips: Trip[] = [
    { id: 1, title: "Besseggen", date: "12.08.2024", status: "Fullført" },
    { id: 2, title: "Galdhøpiggen", date: "20.07.2025", status: "Påmeldt" },
    { id: 3, title: "Rondane", date: "15.09.2025", status: "Avlyst" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchMe() {
      try {
        const res = await fetch("http://localhost:4000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Feil ved henting av bruker:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Laster profil...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen px-4 py-8 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')",
      }}
    >
      <div className="max-w-5xl mx-auto bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Velkommen!</h1>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-gray-600 mt-2">
              Du har {myTrips.filter((t) => t.status === "Fullført").length} turer fullført og{" "}
              {myTrips.filter((t) => t.status === "Påmeldt").length} turer påmeldt.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <NavLink
              to="/editprofile"
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition text-center"
            >
              Rediger profil
            </NavLink>

            <NavLink
              to="/create-trip"
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white px-4 py-2 rounded-lg font-medium transition text-center"
            >
              Opprett tur
            </NavLink>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Favoritter</h2>
          {favorites.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {favorites.map((fav, index) => (
                <li
                  key={index}
                  className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-medium hover:bg-emerald-200 cursor-pointer transition"
                >
                  {fav}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Ingen favoritter ennå.</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Mine turer</h2>
          <ul className="space-y-3">
            {myTrips.map((trip) => (
              <li
                key={trip.id}
                className="p-4 border rounded-lg flex justify-between items-center hover:shadow-lg transition cursor-pointer"
              >
                <div>
                  <p className="font-medium text-lg">{trip.title}</p>
                  <p className="text-gray-500 text-sm">Dato: {trip.date}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      trip.status === "Fullført"
                        ? "bg-green-100 text-green-800"
                        : trip.status === "Påmeldt"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {trip.status}
                  </span>

                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm transition">
                    Sett som fullført
                  </button>

                  <NavLink
                    to={`/tours/${trip.id}`}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm transition"
                  >
                    Detaljer
                  </NavLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}