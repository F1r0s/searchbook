import { isFeature, type FeatureId } from "./featureList";

// Optional features kept in local storage for client app
const STORAGE_KEY = 'booksearch_features';

export async function getFeatures(_userId?: string): Promise<FeatureId[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter(isFeature) : [];
  } catch {
    return [];
  }
}

export async function setFeature(_userId: string, id: FeatureId, on: boolean): Promise<FeatureId[]> {
  try {
    const current = await getFeatures();
    const updated = on ? Array.from(new Set([...current, id])) : current.filter((f) => f !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.filter(isFeature);
  } catch {
    return [];
  }
}
