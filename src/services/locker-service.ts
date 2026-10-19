/**
 * Locker Service — Manages OGAds CPA Locker state, 10-hour unlock persistence,
 * offer fetching, and verification polling.
 */

export interface CpaOffer {
  id: number | string;
  name: string;
  description: string;
  image: string;
  link: string;
  payout: number | string;
  boosted: boolean;
  badge?: string;
}

const UNLOCK_STORAGE_KEY_PREFIX = 'searchbook_unlocked_';
const UNLOCK_DURATION_MS = 10 * 60 * 60 * 1000; // 10 Hours

export const LockerService = {
  /**
   * Check if a specific book (or global site access) is unlocked for this visitor
   */
  isUnlocked(bookId?: string): boolean {
    if (typeof window === 'undefined') return false;

    // Check global unlock first
    const globalRaw = localStorage.getItem(`${UNLOCK_STORAGE_KEY_PREFIX}global`);
    if (globalRaw) {
      try {
        const { expiresAt } = JSON.parse(globalRaw);
        if (Date.now() < expiresAt) return true;
      } catch {
        // ignore parsing error
      }
    }

    if (!bookId) return false;

    // Check book-specific unlock
    const bookRaw = localStorage.getItem(`${UNLOCK_STORAGE_KEY_PREFIX}${bookId}`);
    if (bookRaw) {
      try {
        const { expiresAt } = JSON.parse(bookRaw);
        if (Date.now() < expiresAt) return true;
      } catch {
        // ignore parsing error
      }
    }

    return false;
  },

  /**
   * Save a 10-hour verified unlock for a book and/or global access
   */
  setUnlocked(bookId?: string): void {
    if (typeof window === 'undefined') return;
    const expiresAt = Date.now() + UNLOCK_DURATION_MS;
    const payload = JSON.stringify({ unlockedAt: Date.now(), expiresAt });

    // Store global and book-level access
    localStorage.setItem(`${UNLOCK_STORAGE_KEY_PREFIX}global`, payload);
    if (bookId) {
      localStorage.setItem(`${UNLOCK_STORAGE_KEY_PREFIX}${bookId}`, payload);
    }
  },

  /**
   * Fetch live offers via the backend proxy
   */
  async fetchOffers(): Promise<{ offers: CpaOffer[]; userIp: string }> {
    try {
      const res = await fetch('/api/offers');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        offers: data.offers || [],
        userIp: data.userIp || '',
      };
    } catch (err) {
      console.warn('[Locker] Failed to fetch offers via proxy, returning fallback:', err);
      return { offers: [], userIp: '' };
    }
  },

  /**
   * Verify completion status from the backend
   */
  async checkCompletion(userIp?: string): Promise<{ completed: boolean; count: number }> {
    try {
      const q = userIp ? `?ip=${encodeURIComponent(userIp)}` : '';
      const res = await fetch(`/api/check${q}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        completed: Boolean(data.completed),
        count: Number(data.count || 0),
      };
    } catch (err) {
      console.warn('[Locker] Check failed:', err);
      return { completed: false, count: 0 };
    }
  },
};
