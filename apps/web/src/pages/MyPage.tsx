

import { NavLink } from "react-router-dom";

export default function MyPage() {
  const isLoggedIn = true;

  const user = {
    name: "Ola Nordmann",
    email: "ola@nordmann.no",
    favorites: ["Besseggen", "Gjendesheim", "Galdhøpiggen"],
  };

  const myTrips = [
    { id: 1, title: "Besseggen", date: "12.08.2024", status: "Fullført" },
    { id: 2, title: "Galdhøpiggen", date: "20.07.2025", status: "Påmeldt" },
    { id: 3, title: "Rondane", date: "15.09.2025", status: "Avlyst" },
  ];

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')`,
        }}
      >
        <div className="w-full max-w-md rounded-xl bg-white bg-opacity-90 p-8 shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">Min Side</h1>
          <p className="text-gray-600 mb-6">
            Du må være logget inn for å se dine turer, favoritter og profilinformasjon.
          </p>
          <NavLink
            to="/login"
            className="inline-block rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 px-6 py-3 font-medium text-white hover:from-emerald-600 hover:to-emerald-800 transition"
          >
            Logg inn
          </NavLink>
          <p className="mt-4 text-gray-600">
            Har du ikke konto?{" "}
            <NavLink to="/signup" className="text-emerald-700 font-medium hover:underline">
              Registrer deg
            </NavLink>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')`,
      }}
    >
      <div className="max-w-5xl mx-auto bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
        {/* Brukerinfo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Velkommen, {user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-gray-600 mt-2">
              Du har {myTrips.filter(t => t.status === "Fullført").length} turer fullført og{" "}
              {myTrips.filter(t => t.status === "Påmeldt").length} turer påmeldt.
            </p>
          </div>
          <button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition">
            Rediger profil
          </button>
        </div>

        {/* Favoritter */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Favoritter</h2>
          {user.favorites.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {user.favorites.map((fav, index) => (
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

        {/* Mine turer */}
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
                    to={`/trip/${trip.id}`}
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
