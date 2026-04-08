import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";
import { setupApiInterceptors } from "../services/apiClient";

export const AuthContext = createContext(null);
const ACCESS_TOKEN_KEY = "infoportal_access_token";
const USER_KEY = "infoportal_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(ACCESS_TOKEN_KEY) || null
  );
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((nextUser, nextAccessToken) => {
    setUser(nextUser);
    setAccessToken(nextAccessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const response = await authService.refresh();
    const nextToken = response.data?.data?.accessToken;
    const nextUser = response.data?.data?.user;

    if (!nextToken || !nextUser) {
      throw new Error("Refresh response is invalid");
    }

    persistSession(nextUser, nextToken);
    return nextToken;
  }, [persistSession]);

  const login = useCallback(
    async (payload) => {
      const response = await authService.login(payload);
      const nextUser = response.data?.data?.user;
      const nextToken = response.data?.data?.accessToken;
      persistSession(nextUser, nextToken);
      return nextUser;
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    const cleanupInterceptors = setupApiInterceptors({
      getAccessToken: () => accessToken,
      refreshAccessToken,
      onTokenUpdate: (nextToken) => {
        setAccessToken(nextToken);
        localStorage.setItem(ACCESS_TOKEN_KEY, nextToken);
      },
      onUnauthorized: clearSession,
    });

    return cleanupInterceptors;
  }, [accessToken, clearSession, refreshAccessToken]);

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        if (!accessToken || !user) {
          await refreshAccessToken();
        }
      } catch (error) {
        // Demo mode: Show dashboard without backend
        const demoUser = {
          id: 1,
          email: "demo@infoportal.com",
          displayName: "Demo User",
        };
        const demoToken = "demo_token_for_showcase";
        persistSession(demoUser, demoToken);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapAuth();
  }, [accessToken, clearSession, refreshAccessToken, user, persistSession]);

  const isAuthenticated = Boolean(accessToken && user);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshAccessToken,
    }),
    [user, accessToken, isLoading, isAuthenticated, login, logout, refreshAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
