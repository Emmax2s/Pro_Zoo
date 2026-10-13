import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");
const TOKEN_KEY = "pro-zoo-admin-token";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  enclosureId: string | null;
  isActive: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(data: Partial<AuthUser> & { is_active?: boolean }): AuthUser {
  return {
    id: Number(data.id),
    username: data.username || "",
    email: data.email || "",
    name: data.name || data.username || "",
    role: data.role || "superadmin",
    enclosureId: data.enclosureId ?? null,
    isActive: data.isActive ?? data.is_active ?? true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error("session");
        return response.json();
      })
      .then((data) => setUser(normalizeUser(data.user)))
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "No se pudo iniciar sesión.");
    if (!data.token || !data.user) throw new Error("Respuesta inválida del servidor.");

    sessionStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(normalizeUser(data.user));
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout, token }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
