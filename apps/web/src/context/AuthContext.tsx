/**
 * Fil: AuthContext.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Håndterer innloggingsstatus og brukerdata i frontend ved hjelp av Context API.
 */

import { createContext, useContext, useMemo, useState } from "react";

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
console.log("AuthProvider user state:", user);
console.log("AuthProvider localStorage user:", localStorage.getItem("user"));

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

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
