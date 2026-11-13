import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, setUser: () => { }, loading: true, isAuthenticated: false,
  refreshUser: async () => { }, logout: async () => { },
});

const STORAGE_KEY = "fswg_user";
const TOKEN_KEY = "fswg_token";

function persistBearerToken(token: unknown) {
  if (typeof token === "string" && token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* private mode */
    }
  }
}

/** Never persist JWT inside the user blob (XSS would steal it twice). */
function stripSecrets(u: User | null): User | null {
  if (!u) return null;
  const { token, ...rest } = u as User & { token?: string };
  // Keep Bearer fallback in sync whenever a token-bearing payload arrives
  persistBearerToken(token);
  return rest as User;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasInitializedRef = useRef(false);

  const setUser: React.Dispatch<React.SetStateAction<User | null>> = useCallback(
    (action) => {
      setUserState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        return stripSecrets(next);
      });
    },
    [],
  );

  // Persist sanitized user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripSecrets(user)));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/users/profile");
      // Profile now returns token for cross-origin Bearer fallback (Messages, etc.)
      persistBearerToken(data?.token);
      setUserState(stripSecrets(data.user));
    } catch {
      setUserState(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  // Restore UX shell from cache, then always re-validate role/session with the server
  useEffect(() => {
    const initAuth = async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      try {
        const savedUser = localStorage.getItem(STORAGE_KEY);
        if (savedUser) {
          try {
            setUserState(stripSecrets(JSON.parse(savedUser)));
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch { }
    finally {
      setUserState(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated: !!user, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
