/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [authTokenType, setAuthTokenType] = useState(localStorage.getItem("authTokenType"));
  const [authUsername, setAuthUsername] = useState(localStorage.getItem("username"));

  const [user, setUser] = useState<IAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const silentRefreshOnBoot = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}user/refresh`, {
          method: "POST",
          credentials: "include", // Automatically sends the HttpOnly cookie
        });

        if (res.ok) {
          const data: AuthResponse = await res.json();

          // 1. Save token to memory
          setAuthToken(data.authToken);
          setAuthUsername(data.user.username);

          // 2. Decode right away to prevent UI flash
          const decoded = jwtDecode<IJwtClaims>(data.authToken);
          setUser({
            id: decoded.sub,
            isAdmin: decoded.is_admin,
            type: decoded.token_type,
          });
        } else {
          setUser(null);
          setAuthToken(null);
        }
      } catch (err) {
        console.error("Silent refresh failed on boot:", err);
        setUser(null);
        setAuthToken(null);
      } finally {
        setIsLoading(false); // Drop loading skeleton unconditionally
      }
    };

    silentRefreshOnBoot();
  }, []); // Empty dependency array ensures this fires EXACTLY once when app mounts

  useEffect(() => {
    if (!authToken) {
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode<IJwtClaims>(authToken);
      setUser({
        id: decoded.sub,
        isAdmin: decoded.is_admin,
        type: decoded.token_type,
      });
    } catch (err) {
      console.error("Token decoding failed mid-session:", err);
      setUser(null);
      setAuthToken(null);
    }
  }, [authToken]); // Runs ONLY when the authToken string actively changes

  // Sync state to LocalStorage
  useEffect(() => {
    if (authToken) localStorage.setItem("authToken", authToken);
    else localStorage.removeItem("authToken");

    if (authTokenType) localStorage.setItem("authTokenType", authTokenType);
    else localStorage.removeItem("authTokenType");

    if (authUsername) localStorage.setItem("authUsername", authUsername);
    else localStorage.removeItem("authUsername");
  }, [authToken, authTokenType, authUsername]);

  const login = (data: any) => {
    setAuthToken(data.authToken);
    setAuthTokenType(data.authTokenType);
    setAuthUsername(data.user.username);
  };

  const logout = async () => {
    try {
      // 1. Tell Axum to drop the database row and expire the browser cookie
      await fetch(`${import.meta.env.VITE_API_BASE_URL}user/logout`, {
        method: "POST",
        credentials: "include", // MANDATORY: Sends cookie to server, receives the eviction notice
      });
    } catch (err) {
      console.error("Server logout synchronization failed:", err);
    } finally {
      setAuthToken(null);
      setUser(null);
      setAuthTokenType(null);
      setAuthUsername(null);
      localStorage.clear();
    }
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const isFormData = options.body instanceof FormData;

    options.credentials = "include";

    // Initialize from existing options.headers if any
    const newHeaders = new Headers(options.headers);

    if (authToken) newHeaders.set("Authorization", `${authTokenType} ${authToken}`);

    if (isFormData) {
      // CRITICAL: You must NOT have a 'Content-Type' header here.
      // If it was accidentally set by a previous operation, remove it.
      newHeaders.delete("Content-Type");
    } else {
      // Only set JSON for non-file requests
      newHeaders.set("Content-Type", "application/json");
    }

    // 4. Clean URL (preventing double slashes)
    const endpoint = url.startsWith("/") ? url.slice(1) : url;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: newHeaders, // fetch accepts a Headers object
    });

    // 2. Handle 401 Unauthorized (Token Expired)
    if (response.status === 401) {
      const refreshResponse = await fetch(`${BASE_URL}user/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        const data: AuthResponse = await refreshResponse.json();

        // 3. Update State (Rotation!)
        setAuthToken(data.authToken);
        setAuthUsername(data.user.username);

        // 4. Retry the original request with the new token
        return fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...newHeaders,
            Authorization: `${authTokenType} ${data.authToken}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        logout(); // Refresh token was invalid/expired
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        authUsername,
        login,
        logout,
        authFetch,
        isLoading,
        user,
      }}
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
