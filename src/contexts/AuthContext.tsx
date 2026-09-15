/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// contexts/AuthContext.tsx
'use client';
import { createContext, useState, useEffect, type ReactNode, useContext, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, updateUser, type UpdateUserPayload } from '@/services/users';
import api from '@/lib/axios';

interface User {
  phone_number?: string;
  id: string; // UUID String
  full_name?: string;
  email: string;
  username: string;
  role_id: string;
  role: string;
  school_id?: string | null;
  garrison_id?: string | null;
  garrison_name?: string | null;
  school_name?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: (showMessage?: boolean) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUserProfile: (data: UpdateUserPayload) => Promise<void>;
  isAdmin: boolean;
}

export type { AuthContextType };

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isInitialMount = useRef(true);

  const logout = useCallback(async (showMessage = true) => {
    // Optimistically clear local state first to stop loops
    const currentToken = token || localStorage.getItem('authToken');

    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];

    try {
      // Background server-side session invalidation
      if (currentToken) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${currentToken}` },
          // Don't trigger interceptors for this cleanup call
          _noAuthRedirect: true
        } as any);
      }
    } catch (error) {
      console.warn('Backend logout failed or session already expired');
    } finally {
      if (showMessage) {
        console.log('User session terminated');
      }
      router.replace('/login');
    }
  }, [token, router]);

  // Unified Response Interceptor for Authentication
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Skip if explicitly marked to ignore auth redirects
        if (originalRequest?._noAuthRedirect) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
          console.warn('Session invalid, logging out...');
          await logout(false);
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(responseInterceptor);
  }, [logout]);

  const validateToken = useCallback(async (tokenToValidate: string): Promise<User | null> => {
    try {
      // Note: axios.ts interceptor unwraps the success envelope
      const response = await api.get('/auth/validate', {
        headers: { Authorization: `Bearer ${tokenToValidate}` },
        _noAuthRedirect: true // Prevent validation error from triggering global logout prematurely
      } as any);
      return response.data;
    } catch (error: any) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Background validation and refresh
          const freshUser = await validateToken(storedToken);

          if (freshUser) {
            setToken(storedToken);
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [validateToken]);

  const login = async (newToken: string, fullUser: User) => {
    setToken(newToken);
    setUser(fullUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(fullUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    // Clear any previous loading state
    setIsLoading(false);

    // Professional Redirect based on role
    const userRole = (fullUser.role || '').toLowerCase().replace(/_/g, '');
    if (userRole === 'superadmin') {
      router.replace('/super-admin');
    } else if (userRole === 'garrisondirector') {
      router.replace('/garrison-director');
    } else {
      router.replace('/');
    }
  };

  const updateUserProfile = async (data: UpdateUserPayload) => {
    if (!user?.id) throw new Error('No authenticated user');

    try {
      const updatedUser = await updateUser(user.id, data);
      setUser(updatedUser as any);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      throw error;
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = !!(user?.role && ['admin', 'super_admin', 'garrison_director'].includes(user.role.toLowerCase()));

  const value: AuthContextType = { 
    user, 
    token, 
    login, 
    logout,
    isLoading,
    isAuthenticated, 
    updateUserProfile,
    isAdmin
  };

  // Prevent flicker during initial session restoration
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

