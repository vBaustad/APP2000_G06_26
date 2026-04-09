/**
 * Fil: MyPage.tsx
 * Utvikler: Parasto Jamshidi
 * Beskrivelse: Denne siden viser brukerens personlige informasjon, inkludert profil,
 * favoritter og turer. Innholdet vises kun dersom brukeren er logget inn.
 * Hvis ikke, blir brukeren sendt til innloggingssiden.
 */

import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

type User = {
  _id?: string;
  id?: string;
  email: string;
};

type TripStatus = "Fullført" | "Påmeldt" | "Avlyst";

type Trip = {
  id: string;
  registrationId: string;
  title: string;
  date: string;
  status: TripStatus;
};

type RegistrationResponse = {
  _id: string;
  selectedDate: string;
  status: "påmeldt" | "avmeldt";
  tourId?: {
    _id?: string;
    id?: string;
    title?: string;
  } | null;
};

type FilterType = "Alle" | TripStatus;

export default function MyPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("Alle");

  const favorites = ["Besseggen", "Gjendesheim", "Galdhøpiggen"];

  const [myTrips, setMyTrips] = useState<Trip[]>([]);

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

        const data = (await res.json()) as User;
        setUser(data);

        const registrationsRes = await fetch("http://localhost:4000/registrations/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!registrationsRes.ok) {
          throw new Error("Kunne ikke hente påmeldinger");
        }

        const registrations = (await registrationsRes.json()) as RegistrationResponse[];

        const trips: Trip[] = registrations.map((registration) => ({
          id: String(registration.tourId?._id ?? registration.tourId?.id ?? registration._id),
          registrationId: registration._id,
          title: registration.tourId?.title ?? "Ukjent tur",
          date: new Date(registration.selectedDate).toLocaleDateString("nb-NO"),
          status: registration.status === "avmeldt" ? "Avlyst" : "Påmeldt",
        }));

        setMyTrips(trips);
      } catch (error) {
        console.error("Feil ved henting av bruker:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [navigate]);

  function markAsCompleted(tripId: string) {
    setMyTrips((previousTrips) =>
      previousTrips.map((trip) =>
        trip.id === tripId ? { ...trip, status: "Fullført" } : trip
      )
    );
  }

  async function cancelTrip(registrationId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/registrations/${registrationId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Kunne ikke melde av tur");
      }

      setMyTrips((previousTrips) =>
        previousTrips.map((trip) =>
          trip.registrationId === registrationId ? { ...trip, status: "Avlyst" } : trip
        )
      );
    } catch (error) {
      console.error("Feil ved avmelding:", error);
    }
  }

  const completedTrips = myTrips.filter((trip) => trip.status === "Fullført").length;
  const joinedTrips = myTrips.filter((trip) => trip.status === "Påmeldt").length;
  const cancelledTrips = myTrips.filter((trip) => trip.status === "Avlyst").length;

  const filteredTrips = useMemo(() => {
    if (selectedFilter === "Alle") {
      return myTrips;
    }
    return myTrips.filter((trip) => trip.status === selectedFilter);
  }, [selectedFilter, myTrips]);

  function getStatusClasses(status: TripStatus) {
    if (status === "Fullført") {
      return "bg-green-100 text-green-800 border border-green-200";
    }

    if (status === "Påmeldt") {
      return "bg-blue-100 text-blue-800 border border-blue-200";
    }

    return "bg-red-100 text-red-800 border border-red-200";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-lg font-medium text-slate-700">Laster profil...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center px-4 py-8"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1470&q=80')",
      }}
    >
      <div className="mx-auto max-w-6xl rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur-sm md:p-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
              Min side
            </p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Velkommen tilbake!</h1>
            <p className="mt-2 text-base text-slate-500">{user.email}</p>
            <p className="mt-3 text-slate-600">
              Du har {completedTrips} turer fullført og {joinedTrips} turer påmeldt.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <NavLink
              to="/editprofile"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-3 text-center font-semibold text-white shadow-md transition hover:scale-[1.02] hover:from-blue-600 hover:to-blue-800"
            >
              Rediger profil
            </NavLink>

            <NavLink
              to="/create-trip"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-5 py-3 text-center font-semibold text-white shadow-md transition hover:scale-[1.02] hover:from-emerald-600 hover:to-emerald-800"
            >
              Opprett tur
            </NavLink>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-green-700">Fullførte turer</p>
            <p className="mt-2 text-3xl font-bold text-green-900">{completedTrips}</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">Påmeldte turer</p>
            <p className="mt-2 text-3xl font-bold text-blue-900">{joinedTrips}</p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">Avlyste turer</p>
            <p className="mt-2 text-3xl font-bold text-red-900">{cancelledTrips}</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-slate-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Favoritter</h2>
            <p className="text-sm text-slate-500">{favorites.length} lagrede favoritter</p>
          </div>

          {favorites.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {favorites.map((fav, index) => (
                <li key={index}>
                  <button
                    className="rounded-full bg-emerald-100 px-4 py-2 font-medium text-emerald-800 transition hover:bg-emerald-200"
                    type="button"
                  >
                    {fav}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Ingen favoritter ennå.</p>
          )}
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Mine turer</h2>

            <div className="flex flex-wrap gap-2">
              {(["Alle", "Fullført", "Påmeldt", "Avlyst"] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedFilter === filter
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredTrips.length > 0 ? (
            <ul className="space-y-4">
              {filteredTrips.map((trip) => (
                <li
                  key={trip.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{trip.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">Dato: {trip.date}</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>

                      {trip.status === "Påmeldt" && (
                        <>
                          <button
                            type="button"
                            onClick={() => markAsCompleted(trip.id)}
                            className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-500"
                          >
                            Sett som fullført
                          </button>

                          <button
                            type="button"
                            onClick={() => cancelTrip(trip.registrationId)}
                            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                          >
                            Meld av
                          </button>
                        </>
                      )}

                      <NavLink
                        to={`/tours/${trip.id}`}
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Detaljer
                      </NavLink>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-lg font-medium text-slate-700">Ingen turer funnet</p>
              <p className="mt-2 text-sm text-slate-500">
                Prøv et annet filter eller opprett en ny tur.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
