'use client';

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User } from '@/types/models/user';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '@/lib/api/user-management/auth';
import { LoginRequest } from '@/types/requestdto/auth';
import { getUserFromToken, isTokenExpired } from '@/lib/utils/jwtHandler';
import { getCookie, setCookie, clearAuthCookies, setSecureAuthCookie } from '@/lib/utils/cookieUtils';
import { OpenAPI } from '@/lib/api-client/route-management';
import { unsubscribeUserFromPush } from '@/lib/push/registerServiceWorker';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure OpenAPI token function
  const configureApiToken = () => {
    OpenAPI.TOKEN = async () => {
      const token = getCookie('access_token');
      return token || '';
    };
  };

  // Clear API token
  const clearApiToken = () => {
    OpenAPI.TOKEN = undefined;
  };

  // Check authentication status
  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Get token from cookie
      const token = getCookie('access_token');

      if (!token) {
        // No token found, user is not authenticated
        setUser(null);
        setIsAuthenticated(false);
        clearApiToken();
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, attempting refresh...');

        // Try to refresh token
        const refreshToken = getCookie('refresh_token');
        if (refreshToken) {
          try {
            // Call refresh endpoint
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (response.ok) {
              const authData = await response.json();

              // Set new tokens in cookies
              setSecureAuthCookie('access_token', authData.access_token, authData.expires_in);
              setSecureAuthCookie('refresh_token', authData.refresh_token, 30 * 24 * 60 * 60); // 30 days

              // Configure API client with new token
              configureApiToken();

              // Extract and set user data
              const userFromToken = getUserFromToken(authData.access_token);
              if (userFromToken) {
                const userData: User = {
                  id: userFromToken.id,
                  email: userFromToken.email,
                  user_role: userFromToken.role,
                  email_verified: userFromToken.emailVerified,
                };
                setUser(userData);
                setIsAuthenticated(true);
                return;
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        // Refresh failed, clear cookies and redirect
        clearAuthCookies(['access_token', 'refresh_token']);
        clearApiToken();
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Token is valid, configure API client
      configureApiToken();

      // Extract user info
      const userFromToken = getUserFromToken(token);
      if (userFromToken) {
        setUser({
          id: userFromToken.id,
          email: userFromToken.email,
          user_role: userFromToken.role,
          email_verified: userFromToken.emailVerified,
        });
        setIsAuthenticated(true);
      } else {
        // Invalid token payload
        clearAuthCookies(['access_token', 'refresh_token']);
        clearApiToken();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthCookies(['access_token', 'refresh_token']);
      clearApiToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);

      // Use the API helper function to get auth response
      const authResponse = await apiLogin(credentials);

      // Set tokens in cookies with proper security settings
      setSecureAuthCookie('access_token', authResponse.access_token, authResponse.expires_in);
      setSecureAuthCookie('refresh_token', authResponse.refresh_token, 30 * 24 * 60 * 60); // 30 days

      // Configure API client with new token
      configureApiToken();

      // Extract user data from response
      const userData: User = {
        id: authResponse.user.id,
        email: authResponse.user.email,
        user_role: authResponse.user.user_metadata.user_role,
        email_verified: authResponse.user.user_metadata.email_verified,
        last_sign_in_at: authResponse.user.last_sign_in_at,
        created_at: authResponse.user.created_at,
        updated_at: authResponse.user.updated_at,
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any potentially set cookies on login failure
      clearAuthCookies(['access_token', 'refresh_token']);
      clearApiToken();
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Get auth token before clearing
      const authToken = getCookie('access_token');

      // Unsubscribe from push notifications
      if (authToken) {
        await unsubscribeUserFromPush(authToken);
      }

      // Use the API helper function
      await apiLogout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear client-side state and cookies regardless of API call result
      setUser(null);
      setIsAuthenticated(false);

      // Clear all auth-related cookies
      clearAuthCookies(['access_token', 'refresh_token']);

      // Clear API token
      clearApiToken();

      setIsLoading(false);

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};