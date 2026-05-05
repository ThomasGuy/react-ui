/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useState, useEffect } from "react";
import { IAuthUser } from "./types";

interface AuthContextType {
  authToken: string | null;
  refreshToken: string | null;
  // username: string | null;
  // userId: string | null;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [authTokenType, setAuthTokenType] = useState(
    localStorage.getItem("authTokenType"),
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken"),
  );
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  const [user, setUser] = useState<IAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true

  useEffect(() => {
    const initAuth = async () => {
      // Force a  delay to see the UI Skeleton isLoading
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (authToken) {
        try {
          const decoded = jwtDecode<IJwtClaims>(authToken);
          setUser({
            id: decoded.sub,
            isAdmin: decoded.is_admin, // Matches your Rust struct
            type: decoded.token_type, // 'Access' or 'Refresh'
          });
        } catch (err) {
          console.error("Token decode failed", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false); // stoploading regardless of outcome
    };

    initAuth();
  }, [authToken]);

  // Sync state to LocalStorage
  useEffect(() => {
    if (authToken) localStorage.setItem("authToken", authToken);
    else localStorage.removeItem("authToken");

    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    else localStorage.removeItem("refreshToken");

    if (authTokenType) localStorage.setItem("authTokenType", authTokenType);
    else localStorage.removeItem("authTokenType");

    if (username) localStorage.setItem("username", username);
    else localStorage.removeItem("username");

    if (userId) localStorage.setItem("userId", userId);
    else localStorage.removeItem("userId");
  }, [authToken, authTokenType, refreshToken, username, userId]);

  const login = (data: any) => {
    setAuthToken(data.authToken);
    setAuthTokenType(data.authTokenType);
    setRefreshToken(data.refresh_token);
    setUsername(data.user.username);
    setUserId(data.user.id);
  };

  const logout = () => {
    setAuthToken(null);
    setAuthTokenType(null);
    setRefreshToken(null);
    setUsername(null);
    setUserId(null);
    localStorage.clear();
  };

  const authFetch = async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const isFormData = options.body instanceof FormData;

    // Initialize from existing options.headers if any
    const newHeaders = new Headers(options.headers);

    if (authToken)
      newHeaders.set("Authorization", `${authTokenType} ${authToken}`);

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
    if (response.status === 401 && refreshToken) {
      const refreshResponse = await fetch(`${BASE_URL}user/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();

        // 3. Update State (Rotation!)
        setAuthToken(data.authToken);
        setRefreshToken(data.refresh_token);

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
        refreshToken,
        // username,
        // userId,
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
