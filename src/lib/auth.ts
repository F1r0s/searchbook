// Hardened Single-Owner Authentication Utilities
// Uses Web Crypto API (supported natively in Node.js 18+ and browsers) with zero external dependencies

const SESSION_STORAGE_KEY = 'bookplate_admin_session';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// In-memory rate limiter for failed login attempts
interface RateLimitRecord {
  count: number;
  lockedUntil: number;
}
const rateLimitMap: Record<string, RateLimitRecord> = {};

export class AdminAuth {
  /**
   * Hashes a password using PBKDF2-SHA256
   */
  public static async hashPassword(password: string, salt = 'bookplate_salt'): Promise<string> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    const hashArray = Array.from(new Uint8Array(derivedBits));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
  }

  /**
   * Checks if an IP or client identifier is currently rate-limited
   */
  public static checkRateLimit(clientId = 'default'): { isLocked: boolean; waitMinutes: number } {
    const now = Date.now();
    const record = rateLimitMap[clientId];
    if (record && record.lockedUntil > now) {
      const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return { isLocked: true, waitMinutes };
    }
    if (record && record.lockedUntil <= now) {
      delete rateLimitMap[clientId];
    }
    return { isLocked: false, waitMinutes: 0 };
  }

  /**
   * Records a failed login attempt
   */
  public static recordFailedAttempt(clientId = 'default'): void {
    const now = Date.now();
    const record = rateLimitMap[clientId] || { count: 0, lockedUntil: 0 };
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MINUTES * 60 * 1000;
    }
    rateLimitMap[clientId] = record;
  }

  /**
   * Clears rate limit upon successful login
   */
  public static clearRateLimit(clientId = 'default'): void {
    delete rateLimitMap[clientId];
  }

  /**
   * Creates a signed administrative session token
   */
  public static async createSessionToken(secret: string): Promise<string> {
    const payload = JSON.stringify({
      role: 'owner',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    const encodedPayload = btoa(payload);
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret || 'bookplate-default-fallback-secret-key-32chars'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(encodedPayload));
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return `${encodedPayload}.${signatureBase64}`;
  }

  /**
   * Verifies an administrative session token
   */
  public static async verifySessionToken(token: string, secret: string): Promise<boolean> {
    if (!token || !token.includes('.')) return false;
    try {
      const [encodedPayload, signatureBase64] = token.split('.');
      const payload = JSON.parse(atob(encodedPayload));
      if (!payload.expiresAt || payload.expiresAt < Date.now()) {
        return false;
      }
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret || 'bookplate-default-fallback-secret-key-32chars'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));
      return await crypto.subtle.verify('HMAC', key, signatureBytes, enc.encode(encodedPayload));
    } catch {
      return false;
    }
  }

  /**
   * Session storage handlers for the client-side app
   */
  public static saveClientSession(token: string): void {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    } catch {
      // fallback
    }
  }

  public static getClientSession(): string | null {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  public static clearClientSession(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // fallback
    }
  }
}