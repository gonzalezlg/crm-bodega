import { createContext, useMemo, useState } from 'react';
import { loginRequest } from '../services/auth.service';

const AUTH_STORAGE_KEY = 'crm_bodega_auth';

export const AuthContext = createContext(null);

function getInitialSession() {
  const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return { accessToken: null, user: null };
  }

  try {
    const session = JSON.parse(storedSession);

    if (session?.accessToken && session?.user) {
      return {
        accessToken: session.accessToken,
        user: session.user,
      };
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return { accessToken: null, user: null };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getInitialSession);
  const { accessToken, user } = session;

  function saveSession(nextSession) {
    if (nextSession.accessToken && nextSession.user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    setSession(nextSession);
  }

  async function login(credentials) {
    const session = await loginRequest(credentials);
    const nextSession = {
      accessToken: session.accessToken,
      user: session.user,
    };

    saveSession(nextSession);

    return nextSession;
  }

  function logout() {
    saveSession({ accessToken: null, user: null });
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      login,
      logout,
    }),
    [accessToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
