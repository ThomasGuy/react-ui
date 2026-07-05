// /* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect, useRef } from 'react';
import { IAuthUser, ILogin, ILoginResponse, IUser } from '../utils/types';
import { AuthContext } from '../context/AuthContext';

interface IJwtClaims {
  sub: string;
  exp: number;
  token_type: 'Access' | 'Refresh';
  is_admin: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All auth states are now strictly in memory
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authTokenType, setAuthTokenType] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<IAuthUser | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Refs to handle request queueing during concurrent background token refreshes
  const isRefreshingRef = useRef<boolean>(false);
  const refreshSubscribersRef = useRef<((token: string, type: string) => void)[]>([]);

  // Process queued-up requests once token rotation succeeds
  const onTokenRefreshed = (newToken: string, newType: string) => {
    refreshSubscribersRef.current.forEach((callback) => callback(newToken, newType));
    refreshSubscribersRef.current = [];
  };

  // Helper to cleanly wipe in-memory auth states
  const clearAuthSession = () => {
    setAuthToken(null);
    setAuthTokenType(null);
    setUserData(null);
    setCurrentUser(null);
  };

  // Execute Silent Refresh ON BOOT - Single source of truth check
  useEffect(() => {
    const silentRefreshOnBoot = async () => {
      try {
        // console.log('📡 Sending refresh fetch request...');
        const response = await fetch(`${BASE_URL}/user/refresh`, {
          method: 'POST',
          credentials: 'include', // Essential for cookie transmission
        });

        if (response.ok) {
          const newLoginData = (await response.json()) as ILoginResponse;
          login(newLoginData);
        } else {
          clearAuthSession(); // Graceful public fallback
        }
      } catch (err) {
        console.error('Silent refresh failed on boot:', err);
        clearAuthSession();
      } finally {
        setIsInitializing(false); // Unconditionally drop UI skeleton
      }
    };

    silentRefreshOnBoot();
  }, []);

  const login = (newLoginData: ILoginResponse) => {
    const data: ILogin = {
      ...newLoginData,
      user: {
        ...newLoginData.user,
        emailVerifiedAt: newLoginData.user.emailVerifiedAt
          ? new Date(newLoginData.user.emailVerifiedAt)
          : null,
        lastLoginAt: newLoginData.user.lastLoginAt ? new Date(newLoginData.user.lastLoginAt) : null,
        createdAt: new Date(newLoginData.user.createdAt),
        updatedAt: new Date(newLoginData.user.updatedAt),
      },
    };
    setAuthToken(data.authToken);
    setAuthTokenType(data.authTokenType);
    setUserData(data.user);

    const decoded = jwtDecode<IJwtClaims>(data.authToken);
    setCurrentUser({
      id: decoded.sub,
      isAdmin: decoded.is_admin,
      type: decoded.token_type, // 'access' or 'refresh'
    });
  };

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/user/logout`, {
        method: 'POST',
        credentials: 'include', // Tells Axum to drop database session row & expire cookie
      });
    } catch (err) {
      console.error('Server logout synchronization failed:', err);
    } finally {
      clearAuthSession();
    }
  };

  // -------------- AuthFetch --------------------------
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    options.credentials = 'include';
    const isFormData = options.body instanceof FormData;
    const newHeaders = new Headers(options.headers);
    const endpoint = url.startsWith('/') ? url : '/' + url;

    // Let's create local mutable copies of your tokens so we can update them instantly
    let activeToken = authToken;
    let activeType = authTokenType;

    // 🚀 1. THE LOOK-AHEAD PROACTIVE GUARD
    if (activeToken) {
      try {
        const decoded = jwtDecode<IJwtClaims>(activeToken);
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);

        // Check if the token is valid but has less than 60 seconds left of life
        if (decoded.exp - currentTimeInSeconds < 45) {
          if (!isRefreshingRef.current) {
            isRefreshingRef.current = true;

            try {
              const refreshResponse = await fetch(`${BASE_URL}/user/refresh`, {
                method: 'POST',
                credentials: 'include',
              });

              if (refreshResponse.ok) {
                const data: ILoginResponse = await refreshResponse.json();
                login(data);
                isRefreshingRef.current = false;
                onTokenRefreshed(data.authToken, data.authTokenType);

                // 💡 CRITICAL FOR THE ACTIVE SCOPE: Overwrite our local execution variables
                // with the fresh token strings right now so this fetch request uses them!
                activeToken = data.authToken;
                activeType = data.authTokenType;
              } else {
                isRefreshingRef.current = false;
                clearAuthSession();
              }
            } catch {
              isRefreshingRef.current = false;
              clearAuthSession();
            }
          } else {
            // If another concurrent request already triggered a refresh, wait in line for it
            await new Promise<void>((resolve) => {
              refreshSubscribersRef.current.push(() => resolve());
            });
          }
        }
      } catch (e) {
        console.error('JWT look-ahead check parsing failed:', e);
      }
    }

    // Dynamic current token snapshot check
    if (activeToken && activeType) {
      newHeaders.set('Authorization', `${authTokenType} ${authToken}`);
    }

    if (isFormData) {
      newHeaders.delete('Content-Type'); // Let browser inject boundary strings
    } else {
      newHeaders.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers: newHeaders });

    // Handle 401 Unauthorized (Access Token Expired)
    if (response.status === 401) {
      if (!isRefreshingRef.current) {
        isRefreshingRef.current = true;

        try {
          const refreshResponse = await fetch(`${BASE_URL}/user/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            const data: ILoginResponse = await refreshResponse.json();
            login(data);
            isRefreshingRef.current = false;
            onTokenRefreshed(data.authToken, data.authTokenType);

            // Retry original request
            newHeaders.set('Authorization', `${data.authTokenType} ${data.authToken}`);
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
          newHeaders.set('Authorization', `${newType} ${newToken}`);
          resolve(fetch(`${BASE_URL}${endpoint}`, { ...options, headers: newHeaders }));
        });
      });
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        authTokenType,
        userData,
        setUserData,
        login,
        logout,
        authFetch,
        isInitializing,
        currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
