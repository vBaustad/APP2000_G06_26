/**
 * Fil: MyPage.tsx
 * Utvikler: Parasto Jamshidi (Oppdatert for MariaDB/Prisma)
 * Beskrivelse: Viser ekte brukerdata, favoritter og turer fra databasen.
 */

import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Finn tokenet som ble lagret ved innlogging
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return; // Hvis ingen token, er brukeren ikke logget inn
    }

    // 2. Hent data fra API-et du lagde i Steg 1 & 2
   fetch(`${import.meta.env.VITE_API_URL}/api/bruker/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Kunne ikke hente profil");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Vis en laste-skjerm mens vi venter på databasen
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Laster din profil...</div>;
  }

  // Hvis brukeren ikke er logget inn (ingen token eller feil i fetch)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')" }}>
        <div className="w-full max-w-md rounded-xl bg-white bg-opacity-90 p-8 shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">Min Side</h1>
          <p className="text-gray-600 mb-6">Du må være logget inn for å se dine turer og favoritter.</p>
          <NavLink to="/login" className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white">
            Logg inn
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')" }}>
      
      <div className="max-w-5xl mx-auto bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
        
        {/* Brukerinfo fra MariaDB */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Velkommen, {user.fornavn} {user.etternavn}</h1>
            <p className="text-gray-500">{user.epost}</p>
            <p className="text-gray-600 mt-2">
              Du har {user.tur_pamelding?.filter((t: any) => t.status === "Fullført").length || 0} turer fullført og{" "}
              {user.tur_pamelding?.filter((t: any) => t.status === "pending").length || 0} turer påmeldt.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <NavLink to="/editprofile" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
              Rediger profil
            </NavLink>
            <NavLink to="/create-trip" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">
              Opprett tur
            </NavLink>
          </div>
        </div>

        {/* Favoritter - Her henter vi navn via tursti-relasjonen */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Favoritter</h2>
          <ul className="flex flex-wrap gap-2">
            {user.favoritt?.map((fav: any) => (
              <li key={fav.tursti_id} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-medium">
                {fav.tursti.navn}
              </li>
            ))}
            {user.favoritt?.length === 0 && <p className="text-gray-500">Ingen favoritter ennå.</p>}
          </ul>
        </div>

        {/* Mine turer - Henter data gjennom tur_pamelding -> tur_dato -> tur */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Mine turer</h2>
          <ul className="space-y-3">
            {user.tur_pamelding?.map((pamelding: any) => (
              <li key={pamelding.id} className="p-4 border rounded-lg flex justify-between items-center bg-white">
                <div>
                  <p className="font-medium text-lg">{pamelding.tur_dato.tur.tittel}</p>
                  <p className="text-gray-500 text-sm">
                    Start: {new Date(pamelding.tur_dato.start_at).toLocaleDateString("no-NO")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pamelding.status === "pending" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}>
                    {pamelding.status === "pending" ? "Påmeldt" : pamelding.status}
                  </span>
                  <button className="bg-yellow-400 text-white px-3 py-1 rounded-lg text-sm">Sett som fullført</button>
                  <NavLink to={`/tours/${pamelding.tur_dato.tur_id}`} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm">
                    Detaljer
                  </NavLink>
                </div>
              </li>
            ))}
            {user.tur_pamelding?.length === 0 && <p className="text-gray-500">Du er ikke påmeldt noen turer.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}