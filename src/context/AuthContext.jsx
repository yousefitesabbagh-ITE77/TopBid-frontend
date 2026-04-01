import { createContext, useEffect, useMemo, useState } from "react";
import {
  getStoredToken,
  clearToken,
  fetchMe,
  loginUser,
  logoutUser,
  registerUser,
} from "../lib/auth";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrapAuth() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await fetchMe();
        setUser(currentUser);
        setToken(storedToken);
      } catch (error) {
        clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapAuth();
  }, []);

  async function login(credentials) {
    const { token: newToken, user: loginUserData } = await loginUser(credentials);

    setToken(newToken);

    if (loginUserData) {
      setUser(loginUserData);
    }

    try {
      const currentUser = await fetchMe();
      setUser(currentUser);
      return currentUser;
    } catch {
      return loginUserData;
    }
  }

  async function register(payload) {
    const { token: newToken, user: registerUserData, response } = await registerUser(payload);

    if (newToken) {
      setToken(newToken);
    }

    if (registerUserData) {
      setUser(registerUserData);
    }

    if (newToken) {
      try {
        const currentUser = await fetchMe();
        setUser(currentUser);
      } catch {
        // لا شيء، يكفي المستخدم الموجود إن وُجد
      }
    }

    return {
      response,
      didLogin: Boolean(newToken),
    };
  }

  async function logout() {
    await logoutUser();
    setToken(null);
    setUser(null);
  }

  async function refreshProfile() {
    const currentUser = await fetchMe();
    setUser(currentUser);
    return currentUser;
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };