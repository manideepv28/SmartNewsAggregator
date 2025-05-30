import { User } from "@/types/news";

const AUTH_STORAGE_KEY = 'newsai_user';
const PREFERENCES_STORAGE_KEY = 'newsai_preferences';
const FAVORITES_STORAGE_KEY = 'newsai_favorites';

export function getCurrentUser(): User | null {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getUserPreferences() {
  try {
    const prefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return prefs ? JSON.parse(prefs) : { categories: [], keywords: [] };
  } catch {
    return { categories: [], keywords: [] };
  }
}

export function setUserPreferences(preferences: { categories: string[]; keywords: string[] }) {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

export function getFavoriteIds(): number[] {
  try {
    const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
}

export function setFavoriteIds(favoriteIds: number[]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
}

export function addFavoriteId(articleId: number) {
  const favorites = getFavoriteIds();
  if (!favorites.includes(articleId)) {
    favorites.push(articleId);
    setFavoriteIds(favorites);
  }
}

export function removeFavoriteId(articleId: number) {
  const favorites = getFavoriteIds();
  const filtered = favorites.filter(id => id !== articleId);
  setFavoriteIds(filtered);
}

export function isFavorited(articleId: number): boolean {
  return getFavoriteIds().includes(articleId);
}
