/**
 * Fil: MyPage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Placeholder-side for "Min side".
 * Viser melding om at brukeren må være logget inn for å få tilgang.
 */

import { NavLink } from "react-router-dom";

export default function MyPage(){
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow text-center">
                <header className="mb-6 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Min Side</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Krever innlogging
                        </p>
                        <p className="mt-4 text-sm text-gray-600">
                            Du må være logget inn for å se dine turer, favoritter og profilinformasjon.
                        </p>                                   
                </header>
                <NavLink
                    to="/login"
                    className="inline-block mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition"
                    >
                    Logg inn
                </NavLink>
                <p className="mt-4 text-sm text-gray-600">
                    Har du ikke konto?{" "}
                    <NavLink to="/signup" className="font-medium text-emerald-700 hover:underline">
                        Registrer deg
                    </NavLink>
                </p>
            </div>
        </div>
    );
}