/**
 * Fil: AuthContext.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Håndterer innloggingsstatus og brukerdata i frontend ved hjelp av Context API.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = {
  id: number;
  epost: string;
  roller: string[];
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type BrukerMeResponse = {
  id: number;
  epost: string;
  roller?: string[];
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    const raw = localStorage.getItem("token");
    return raw || null;
  });

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", t);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Ved mount: verifiser at lagret token fortsatt er gyldig mot backend.
  // Hvis serveren svarer 401 (f.eks. etter reset av testdata) rydder vi
  // auth-state så UI ikke fortsetter å vise "innlogget"-tilstand feilaktig.
  useEffect(() => {
    if (!token) return;
    let active = true;

    fetch(`${import.meta.env.VITE_API_URL}/api/bruker/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!active) return;
        if (res.status === 401 || res.status === 403) {
          logout();
          return;
        }
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as BrukerMeResponse | null;
        if (!data || typeof data.id !== "number") return;
        const fresh: User = {
          id: data.id,
          epost: data.epost,
          roller: Array.isArray(data.roller) ? data.roller : [],
        };
        setUser(fresh);
        localStorage.setItem("user", JSON.stringify(fresh));
      })
      .catch(() => {
        // Nettverksfeil: ikke rør lokal state — brukeren kan fortsatt være
        // innlogget, bare offline/server nede.
      });

    return () => {
      active = false;
    };
    // Kjører én gang ved app-start. Token-endring via login()/logout()
    // oppdaterer state direkte uten re-verifisering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
