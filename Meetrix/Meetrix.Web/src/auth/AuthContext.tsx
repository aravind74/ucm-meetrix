import React, { createContext, useContext, useEffect, useState } from "react";
import type { LoginResponse } from "../models/LoginResponse";

type AuthState = {
  token: string | null;
  userId: number | null;
  email: string | null;
  fullName: string | null;
  role: string | null;
  isDifferentlyAbled: boolean | null;
};

type AuthContextValue = {
  auth: AuthState;
  isReady: boolean;
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
    role: null,
    isDifferentlyAbled: null,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthState;
        setAuth(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("meetrix_token");
      }
    }

    setIsReady(true);
  }, []);

  const login = (data: LoginResponse) => {
    const newAuth: AuthState = {
      token: data.token,
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      isDifferentlyAbled: data.isDifferentlyAbled,
    };

    setAuth(newAuth);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));
    localStorage.setItem("meetrix_token", data.token);
  };

  const logout = () => {
    setAuth({
      token: null,
      userId: null,
      email: null,
      fullName: null,
      role: null,
      isDifferentlyAbled: null,
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("meetrix_token");
  };

  return (
    <AuthContext.Provider value={{ auth, isReady, login, logout }}>
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