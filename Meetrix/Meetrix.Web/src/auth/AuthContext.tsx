import React, { createContext, useContext, useState, useEffect } from "react";
import type { LoginResponse } from "../models/LoginResponse";

type AuthState = {
  token: string | null;
  userId: number | null;
  email: string | null;
  fullName: string | null;
};

type AuthContextValue = {
  auth: AuthState;
  login: (data: LoginResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "meetrix_auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    userId: null,
    email: null,
    fullName: null,
  });

  // Load from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthState;
        setAuth(parsed);
      } catch {
        // ignore corrupted data
      }
    }
  }, []);

  const login = (data: LoginResponse) => {
    const newAuth: AuthState = {
      token: data.token,
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
    };
    setAuth(newAuth);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));

    // Also store token separately for axios interceptor
    localStorage.setItem("meetrix_token", data.token);
  };

  const logout = () => {
    setAuth({
      token: null,
      userId: null,
      email: null,
      fullName: null,
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("meetrix_token");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
