/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { IAuthUser, IUserResponse } from "./types";

interface AuthContextType {
  authToken: string | null;
  authUsername: string | null;
  login: (data: any) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  isLoading: boolean;
  user: IAuthUser | null;
}

interface IJwtClaims {
  sub: string;
  exp: number;
  token_type: "Access" | "Refresh";
  is_admin: boolean;
}

interface AuthResponse {
  authToken: string;
  authTokenType: string;
  user: IUserResponse;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All auth states are now strictly in memory
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authTokenType, setAuthTokenType] = useState<string | null>(null);
  const [authUsername, setAuthUsername] = useState<string | null>(null);
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refs to handle request queueing during concurrent background token refreshes
  const isRefreshingRef = useRef<boolean>(false);
  const refreshSubscribersRef = useRef<((token: string, type: string) => void)[]>([]);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Process queued-up requests once token rotation succeeds
  const onTokenRefreshed = (newToken: string, newType: string) => {
    refreshSubscribersRef.current.forEach((callback) => callback(newToken, newType));
    refreshSubscribersRef.current = [];
  };

  // Helper to cleanly wipe in-memory auth states
  const clearAuthSession = () => {
    setAuthToken(null);
    setAuthTokenType(null);
    setAuthUsername(null);
    setUser(null);
  };

  // Execute Silent Refresh ON BOOT - Single source of truth check
  useEffect(() => {
    const silentRefreshOnBoot = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/refresh`, {
          method: "POST",
          credentials: "include", // Essential for cookie transmission
        });

        if (res.ok) {
          const data: AuthResponse = await res.json();
          setAuthToken(data.authToken);
          setAuthTokenType(data.authTokenType);
          setAuthUsername(data.user.username);

          const decoded = jwtDecode<IJwtClaims>(data.authToken);
          setUser({
            id: decoded.sub,
            isAdmin: decoded.is_admin,
            type: decoded.token_type,
          });
        } else {
          clearAuthSession(); // Graceful public fallback
        }
      } catch (err) {
        console.error("Silent refresh failed on boot:", err);
        clearAuthSession();
      } finally {
        setIsLoading(false); // Unconditionally drop UI skeleton
      }
    };

    silentRefreshOnBoot();
  }, []);

  const login = (data: any) => {
    setAuthToken(data.authToken);
    setAuthTokenType(data.authTokenType);
    setAuthUsername(data.user.username);

    const decoded = jwtDecode<IJwtClaims>(data.authToken);
    setUser({
      id: decoded.sub,
      isAdmin: decoded.is_admin,
      type: decoded.token_type,
    });
  };

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/user/logout`, {
        method: "POST",
        credentials: "include", // Tells Axum to drop database session row & expire cookie
      });
    } catch (err) {
      console.error("Server logout synchronization failed:", err);
    } finally {
      clearAuthSession();
    }
  };

  // -------------- AuthFetch --------------------------

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    options.credentials = "include";
    const isFormData = options.body instanceof FormData;
    const newHeaders = new Headers(options.headers);

    // Dynamic current token snapshot check
    if (authToken && authTokenType) {
      newHeaders.set("Authorization", `${authTokenType} ${authToken}`);
    }

    if (isFormData) {
      newHeaders.delete("Content-Type"); // Let browser inject boundary strings
    } else {
      newHeaders.set("Content-Type", "application/json");
    }

    const endpoint = url.startsWith("/") ? url : "/" + url;
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers: newHeaders });

    // Handle 401 Unauthorized (Access Token Expired)
    if (response.status === 401) {
      if (!isRefreshingRef.current) {
        isRefreshingRef.current = true;

        try {
          const refreshResponse = await fetch(`${BASE_URL}/user/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (refreshResponse.ok) {
            const data: AuthResponse = await refreshResponse.json();

            // Sync fresh memory states
            setAuthToken(data.authToken);
            setAuthUsername(data.user.username);
            isRefreshingRef.current = false;

            onTokenRefreshed(data.authToken, data.authTokenType);

            // Retry original request
            newHeaders.set("Authorization", `${data.authTokenType} ${data.authToken}`);
            return fetch(`${BASE_URL}${endpoint}`, { ...options, headers: newHeaders });
          } else {
            isRefreshingRef.current = false;
            clearAuthSession();
            return response;
          }
        } catch {
          isRefreshingRef.current = false;
          clearAuthSession();
          return response;
        }
      }

      // Concurrent request interception queueing
      return new Promise<Response>((resolve) => {
        refreshSubscribersRef.current.push((newToken: string, newType: string) => {
          newHeaders.set("Authorization", `${newType} ${newToken}`);
          resolve(fetch(`${BASE_URL}${endpoint}`, { ...options, headers: newHeaders }));
        });
      });
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{ authToken, authUsername, login, logout, authFetch, isLoading, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
