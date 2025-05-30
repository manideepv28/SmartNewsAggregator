import { apiRequest } from "./queryClient";
import { NewsArticle } from "@/types/news";

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
}

export async function fetchNews(options: {
  category?: string;
  page?: number;
  search?: string;
  sortBy?: string;
} = {}): Promise<NewsResponse> {
  const params = new URLSearchParams();
  
  if (options.category && options.category !== 'all') {
    params.set('category', options.category);
  }
  if (options.page) {
    params.set('page', options.page.toString());
  }
  if (options.search) {
    params.set('search', options.search);
  }
  if (options.sortBy) {
    params.set('sortBy', options.sortBy);
  }

  const url = `/api/news${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await apiRequest('GET', url);
  return response.json();
}

export async function refreshNews(category = 'general'): Promise<NewsResponse> {
  const response = await apiRequest('GET', `/api/news/refresh?category=${category}`);
  return response.json();
}

export async function searchNews(query: string, options: {
  sortBy?: string;
  page?: number;
} = {}): Promise<NewsResponse> {
  const params = new URLSearchParams({ q: query });
  
  if (options.sortBy) {
    params.set('sortBy', options.sortBy);
  }
  if (options.page) {
    params.set('page', options.page.toString());
  }

  const response = await apiRequest('GET', `/api/news/search?${params.toString()}`);
  return response.json();
}

export async function getRecommendations(userId: number): Promise<{ recommendations: NewsArticle[] }> {
  const response = await apiRequest('GET', `/api/recommendations/${userId}`);
  return response.json();
}

export async function updateUserPreferences(userId: number, preferences: {
  categories: string[];
  keywords: string[];
}): Promise<void> {
  await apiRequest('PUT', `/api/users/${userId}/preferences`, preferences);
}

export async function getUserFavorites(userId: number): Promise<{ favorites: NewsArticle[] }> {
  const response = await apiRequest('GET', `/api/favorites/${userId}`);
  return response.json();
}

export async function addToFavorites(userId: number, articleId: number): Promise<void> {
  await apiRequest('POST', '/api/favorites', { userId, articleId });
}

export async function removeFromFavorites(userId: number, articleId: number): Promise<void> {
  await apiRequest('DELETE', `/api/favorites/${userId}/${articleId}`);
}

export async function checkFavoriteStatus(userId: number, articleId: number): Promise<{ isFavorited: boolean }> {
  const response = await apiRequest('GET', `/api/favorites/${userId}/${articleId}/check`);
  return response.json();
}

export async function loginUser(email: string, password: string): Promise<{ user: any }> {
  const response = await apiRequest('POST', '/api/auth/login', { email, password });
  return response.json();
}

export async function registerUser(email: string, password: string): Promise<{ user: any }> {
  const response = await apiRequest('POST', '/api/auth/register', { email, password });
  return response.json();
}
