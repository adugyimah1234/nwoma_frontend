/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuth.ts
import { useState, useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';
import { login as loginService } from '@/services/auth';

interface LoginResponse {
  token: string;
  user: {
    id: string; // ✅ Updated to string for UUID
    role: string;
    // Add other properties if needed
  };
}

export const useAuth = (): AuthContextType & {
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
} => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (username: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data: LoginResponse = await loginService(username, password);
      if (data?.token && data?.user) {
        // Ensure ID is treated as string
        const user = {
          ...data.user,
          id: String(data.user.id)
        };
        await context.login(data.token, user as any);
      } else {
        setError('Login failed: Invalid response.');
        throw new Error('Invalid login response');
      }
    } catch (err: any) {
      // Error handling is managed in axios interceptor for 429/422,
      // but we still catch and throw for local UI state
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    ...context,
    loading,
    error,
    signIn,
  };
};
