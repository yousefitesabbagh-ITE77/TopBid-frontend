import { createContext, useEffect, useMemo, useState } from "react";
import {
  getStoredToken,
  clearToken,
  fetchMe,
  loginUser,
  logoutUser,
  registerUser,
  verifyOtpUser,
  resendOtpCode,
} from "../lib/auth";
import { UNAUTHORIZED_EVENT } from "../lib/api";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function handleUnauthorized() {
      clearToken();
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

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
      } catch {
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
    const { response } = await registerUser(payload);

    return {
      response,
      didLogin: false,
    };
  }

  async function verifyOtp(payload) {
    const { token: newToken, user: verifiedUser } = await verifyOtpUser(payload);

    setToken(newToken);

    if (verifiedUser) {
      setUser(verifiedUser);
    }

    try {
      const currentUser = await fetchMe();
      setUser(currentUser);
      return currentUser;
    } catch {
      return verifiedUser;
    }
  }

  async function resendOtp(email) {
    return resendOtpCode(email);
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
      verifyOtp,
      resendOtp,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };