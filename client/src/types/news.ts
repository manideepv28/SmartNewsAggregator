export interface NewsArticle {
  id: number;
  externalId?: string;
  title: string;
  description: string | null;
  content: string | null;
  urlToImage: string | null;
  publishedAt: Date | string;
  source: {
    name: string;
    id?: string | null;
  };
  category?: string;
  aiScore?: number;
  aiSummary?: string;
}

export interface User {
  id: number;
  email: string;
  preferences?: {
    categories: string[];
    keywords: string[];
  };
  createdAt: Date;
}

export interface NewsFilters {
  category: string;
  filter: 'all' | 'trending' | 'recent' | 'saved';
  sortBy: 'publishedAt' | 'aiScore' | 'relevancy';
  search: string;
}

export const NEWS_CATEGORIES = [
  { id: 'all', name: 'Home', icon: 'fas fa-home' },
  { id: 'technology', name: 'Technology', icon: 'fas fa-microchip' },
  { id: 'business', name: 'Business', icon: 'fas fa-chart-line' },
  { id: 'science', name: 'Science', icon: 'fas fa-flask' },
  { id: 'sports', name: 'Sports', icon: 'fas fa-futbol' },
  { id: 'entertainment', name: 'Entertainment', icon: 'fas fa-film' },
  { id: 'health', name: 'Health', icon: 'fas fa-heartbeat' },
];
