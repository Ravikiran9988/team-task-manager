import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setAuthStorage,
} from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setAuthStorage({ token: data.token, user: data.user });
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => api.register(payload);

  const logout = () => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
