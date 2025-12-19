/**
 * Fil: SignupPage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Registreringsside (placeholder) med e-post, passord og bekreft passord.
 */


import { useState } from "react";
import { NavLink } from "react-router-dom";


export default function SignupPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        console.log({ email, password, confirmPassword });
    }

    const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500";
    const buttonClass = "w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 transition";

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
                <header className="mb-6 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Registrer</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Opprett en konto for å melde deg på turer og lagre favoritter
                        </p>                                
                </header>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">E-post</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            placeholder="navn@eksempel.no"
                            autoComplete="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Passord</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Bekreft Passord</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>
                    <button type="submit" className={buttonClass}>
                        Registrer deg
                    </button>
                </form>   
            </div>
        </div>
    );
}