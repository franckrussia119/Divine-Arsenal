import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { api, getToken, setToken, clearToken, ApiError } from '../lib/api';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, homeChurch?: string) => Promise<void>;
  logout: () => void;
  updateUser: (fields: Partial<UserProfile>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// The API returns raw DB fields; adapt them to the frontend's UserProfile shape.
function toProfile(u: any): UserProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? '',
    role: u.role,
    bio: u.bio ?? '',
    homeChurch: u.homeChurch ?? '',
    joinedDate: u.createdAt ? `Joined ${new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : '',
    avatar: u.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=150&h=150',
    streak: u.streak ?? 0,
    coursesCount: u.coursesCount ?? 0,
    lessonsCount: u.lessonsCount ?? 0,
    certificatesCount: u.certificatesCount ?? 0,
    prayersCount: u.prayersCount ?? 0,
    plan: u.plan ?? 'Free Access',
    planPrice: u.planPrice ?? '$0/mo',
    renewsDate: u.renewsDate ?? '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: any }>('/auth/me')
      .then((res) => setUser(toProfile(res.user)))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.post<{ token: string; user: any }>('/auth/login', { email, password });
      setToken(res.token);
      setUser(toProfile(res.user));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not log in. Please try again.');
      throw err;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, homeChurch?: string) => {
    setError(null);
    try {
      const res = await api.post<{ token: string; user: any }>('/auth/signup', { name, email, password, homeChurch });
      setToken(res.token);
      setUser(toProfile(res.user));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create your account. Please try again.');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((fields: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...fields } : prev));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
