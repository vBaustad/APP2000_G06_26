import { NavLink } from "react-router-dom";

export default function LoggedOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="text-emerald-600 text-6xl mb-4 text-center">✓</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Du er nå logget ut</h1>
        <p className="text-gray-600 mb-8">
          Takk for besøket i Utopia! Håper vi sees snart igjen for nye turer.
        </p>
        <NavLink 
          to="/login" 
          className="block w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          Logg inn igjen
        </NavLink>
        <NavLink 
          to="/" 
          className="block mt-4 text-emerald-700 hover:underline"
        >
          Tilbake til forsiden
        </NavLink>
      </div>
    </div>
  );
}