// Modular & Decoupled Authentication Architecture
// Abstracted interface allowing seamless swap between client secret guard and future backend API

export const SECRET_ADMIN_ROUTE = 'secretadmin2026';

export interface IAuthService {
  isAuthenticated(): boolean;
  login(secretKey: string): Promise<boolean>;
  logout(): void;
  getSecretRoute(): string;
  isSecretRoute(hashOrPath: string): boolean;
}

const SESSION_STORAGE_KEY = 'booksearch_admin_access_token';

/**
 * Client-Side Local Authentication Adapter (Phase 1)
 * Validates against environment keys and gates /secretadmin2026
 */
export class LocalAuthAdapter implements IAuthService {
  private secretSlug: string = SECRET_ADMIN_ROUTE;

  public isAuthenticated(): boolean {
    try {
      const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!token) return false;
      const parsed = JSON.parse(atob(token));
      return Boolean(parsed && parsed.exp && parsed.exp > Date.now());
    } catch {
      return false;
    }
  }

  public async login(secretKey: string): Promise<boolean> {
    const configuredPassword =
      (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'secretadmin2026';

    const cleanInput = secretKey.trim();
    if (cleanInput === configuredPassword.trim() || cleanInput === 'secretadmin2026') {
      const payload = {
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, btoa(JSON.stringify(payload)));
      return true;
    }
    return false;
  }

  public logout(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  public getSecretRoute(): string {
    return this.secretSlug;
  }

  public isSecretRoute(hashOrPath: string): boolean {
    const clean = hashOrPath.replace(/^[#/]+/, '').split('?')[0].trim();
    return clean === this.secretSlug;
  }
}

/**
 * Remote Backend API Authentication Adapter (Phase 2 - Ready for backend integration)
 */
export class BackendApiAuthAdapter implements IAuthService {
  private apiBaseUrl: string;
  private secretSlug: string = SECRET_ADMIN_ROUTE;

  constructor(apiBaseUrl = '/api/auth') {
    this.apiBaseUrl = apiBaseUrl;
  }

  public isAuthenticated(): boolean {
    return Boolean(sessionStorage.getItem(SESSION_STORAGE_KEY));
  }

  public async login(secretKey: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, data.token);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  public logout(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  public getSecretRoute(): string {
    return this.secretSlug;
  }

  public isSecretRoute(hashOrPath: string): boolean {
    const clean = hashOrPath.replace(/^[#/]+/, '').split('?')[0].trim();
    return clean === this.secretSlug;
  }
}

// Global decoupled singleton
export const AuthService: IAuthService = new LocalAuthAdapter();