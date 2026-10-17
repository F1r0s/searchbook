import { useState, useEffect, useCallback } from 'react';
import { AdminAuth } from '../lib/auth';

export interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

export function useAdminAuth(): AdminAuthState {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate existing session token on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = AdminAuth.getClientSession();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token
      const secret = (import.meta as any).env?.VITE_ADMIN_SECRET_KEY || 'bookplate-secure-owner-session-secret';
      const isValid = await AdminAuth.verifySessionToken(token, secret);
      setIsAuthenticated(isValid);
      if (!isValid) {
        AdminAuth.clearClientSession();
      }
      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setError(null);

    // Check rate limit
    const { isLocked, waitMinutes } = AdminAuth.checkRateLimit();
    if (isLocked) {
      setError(`Too many failed attempts. Security lockout active for ${waitMinutes} more minute(s).`);
      return false;
    }

    if (!password.trim()) {
      setError('Please enter your administrative access key.');
      return false;
    }

    // Expected credentials derived from environment variables
    const configuredPassword = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin';
    const secret = (import.meta as any).env?.VITE_ADMIN_SECRET_KEY || 'bookplate-secure-owner-session-secret';

    const isMatch = password.trim() === configuredPassword.trim();

    if (!isMatch) {
      AdminAuth.recordFailedAttempt();
      const updatedLimit = AdminAuth.checkRateLimit();
      if (updatedLimit.isLocked) {
        setError(`Access denied. Too many failed attempts: locked for ${updatedLimit.waitMinutes} minutes.`);
      } else {
        setError('Invalid administrative password. Unauthorized access is recorded.');
      }
      return false;
    }

    AdminAuth.clearRateLimit();
    const token = await AdminAuth.createSessionToken(secret);
    AdminAuth.saveClientSession(token);
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    AdminAuth.clearClientSession();
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}