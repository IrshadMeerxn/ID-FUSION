import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { IDFusionRole } from "../api";
import { login as apiLogin } from "../api";

const SESSION_KEY = "idfusion_session";

interface Session {
  isLoggedIn: boolean;
  role: IDFusionRole | null;
  username: string;
}

interface AuthContextValue extends Session {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>({ isLoggedIn: false, role: null, username: "" });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Session;
        if (stored.isLoggedIn && stored.role) setSession(stored);
      }
    } catch { /* ig
nore */ }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await apiLogin(username, password);
      const newSession: Session = { isLoggedIn: true, role: result.role, username: result.username };
      setSession(newSession);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setSession({ isLoggedIn: false, role: null, username: "" });
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ ...session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
