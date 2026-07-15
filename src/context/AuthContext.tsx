import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { api, getToken, setToken, clearToken, ApiError } from '../lib/api';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, whatsapp: string, language: string, homeChurch?: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (fields: Partial<UserProfile>) => void;
  clearError: () => void;
  clearPendingEmail: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toProfile(u: any): UserProfile {
  return {
    id: u.id,
    name: u.name,
    username: u.username ?? undefined,
    email: u.email,
    phone: u.phone ?? '',
    whatsapp: u.whatsapp ?? '',
    language: u.language ?? 'en',
    role: u.role,
    bio: u.bio ?? '',
    homeChurch: u.homeChurch ?? '',
    joinedDate: u.createdAt ? `Joined ${new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : '',
    avatar: u.avatar && u.avatar.trim() ? u.avatar : '/default-avatar.svg',
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
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

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
      if (err instanceof ApiError && err.status === 403) {
        // Account exists but isn't verified yet — route them to the OTP screen.
        setPendingEmail(email);
        setError('Please verify your email — enter the code we sent you.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not log in. Please try again.');
      }
      throw err;
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, whatsapp: string, language: string, homeChurch?: string) => {
      setError(null);
      try {
        const res = await api.post<{ pendingEmail: string }>('/auth/signup', { name, email, password, whatsapp, language, homeChurch });
        setPendingEmail(res.pendingEmail);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not create your account. Please try again.');
        throw err;
      }
    },
    []
  );

  const verifyOtp = useCallback(async (email: string, code: string) => {
    setError(null);
    try {
      const res = await api.post<{ token: string; user: any }>('/auth/verify-otp', { email, code });
      setToken(res.token);
      setUser(toProfile(res.user));
      setPendingEmail(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not verify that code.');
      throw err;
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    setError(null);
    try {
      await api.post('/auth/resend-otp', { email });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend the code.');
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
  const clearPendingEmail = useCallback(() => setPendingEmail(null), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, pendingEmail, login, signup, verifyOtp, resendOtp, logout, updateUser, clearError, clearPendingEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
