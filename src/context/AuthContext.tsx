import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '../router/RouterContext';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  rollNo?: string;
  provider?: 'password' | 'google';
}

interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  login: (email: string, password?: string) => Promise<AuthResult>;
  loginWithGoogle: (fallbackRole?: UserRole) => Promise<AuthResult>;
  signup: (data: { name: string; email: string; password?: string; role?: UserRole; rollNo?: string }) => Promise<AuthResult>;
  signupWithGoogle: (role?: UserRole) => Promise<AuthResult>;
  logout: () => void;
}

const TOKEN_KEY = 'jobgraph_access_token';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  student_id?: string | null;
  roll_no?: string | null;
  provider?: 'password' | 'google';
};

function mapApiUser(value: ApiUser): AuthUser {
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    role: value.role,
    studentId: value.student_id || undefined,
    rollNo: value.roll_no || undefined,
    provider: value.provider || 'password',
  };
}

async function readApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const detail = body?.detail ?? body?.error ?? body?.message;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg || 'Invalid input').join(' ');
    if (detail && typeof detail.message === 'string') return detail.message;
  } catch {
    // Use the status-based message below when the response isn't JSON.
  }
  if (response.status === 401) return 'Invalid email or password.';
  if (response.status === 409 || response.status === 400) return 'The request could not be completed. Check your details and try again.';
  if (response.status >= 500) return 'The server is temporarily unavailable. Please try again.';
  return `Request failed (${response.status}). Please try again.`;
}

async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Remove obsolete client-side account caches from the previous demo implementation.
    localStorage.removeItem('jobgraph_auth_user');
    localStorage.removeItem('jobgraph_registered_users');
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        if (!cancelled) setIsRestoringSession(false);
        return;
      }

      try {
        const response = await apiRequest('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Session expired');
        const data = await response.json();
        if (!data?.success || !data?.user) throw new Error('Invalid session response');
        if (!cancelled) setUser(mapApiUser(data.user as ApiUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsRestoringSession(false);
      }
    };
    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  const authenticate = async (path: '/api/auth/login' | '/api/auth/signup', payload: Record<string, unknown>): Promise<AuthResult> => {
    try {
      const response = await apiRequest(path, { method: 'POST', body: JSON.stringify(payload) });
      if (!response.ok) return { success: false, error: await readApiError(response) };
      const data = await response.json();
      if (!data?.success || !data?.user || !data?.token) {
        return { success: false, error: 'The server returned an incomplete authentication response.' };
      }
      const authenticatedUser = mapApiUser(data.user as ApiUser);
      localStorage.setItem(TOKEN_KEY, data.token as string);
      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch {
      return { success: false, error: 'Cannot reach the JobGraph API. Ensure the Python backend is running and try again.' };
    }
  };

  const login = (email: string, password?: string): Promise<AuthResult> => authenticate('/api/auth/login', {
    email: email.trim().toLowerCase(),
    password: password || '',
  });

  const signup = (data: { name: string; email: string; password?: string; role?: UserRole; rollNo?: string }): Promise<AuthResult> => authenticate('/api/auth/signup', {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password || '',
    rollNo: data.rollNo?.trim() || undefined,
  });

  // Google buttons remain in the existing UI, but no identity is trusted until a real
  // Google ID-token flow is configured and verified by the backend.
  const googleUnavailable = async (): Promise<AuthResult> => ({
    success: false,
    error: 'Google sign-in is not configured yet. Please use email and password.',
  });

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isRestoringSession,
      login,
      signup,
      loginWithGoogle: googleUnavailable,
      signupWithGoogle: googleUnavailable,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
