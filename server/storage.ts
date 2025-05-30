import { users, articles, userFavorites, type User, type InsertUser, type Article, type InsertArticle, type UserFavorite, type InsertFavorite } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: { categories: string[]; keywords: string[] }): Promise<void>;

  // Articles
  getArticles(options?: {
    category?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'publishedAt' | 'aiScore';
  }): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleByExternalId(externalId: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  searchArticles(query: string): Promise<Article[]>;

  // Favorites
  getUserFavorites(userId: number): Promise<Article[]>;
  addFavorite(favorite: InsertFavorite): Promise<void>;
  removeFavorite(userId: number, articleId: number): Promise<void>;
  isFavorited(userId: number, articleId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private favorites: Map<string, UserFavorite>; // key: `${userId}-${articleId}`
  private currentUserId: number;
  private currentArticleId: number;
  private currentFavoriteId: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.favorites = new Map();
    this.currentUserId = 1;
    this.currentArticleId = 1;
    this.currentFavoriteId = 1;
    
    // Initialize with some sample articles
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleArticles = [
      {
        externalId: "ai-breakthrough-2024",
        title: "AI Revolution: New Breakthrough in Machine Learning Changes Everything",
        description: "Researchers at Stanford University have developed a new AI model that can understand context better than ever before, potentially revolutionizing how we interact with technology.",
        content: "In a groundbreaking development, Stanford researchers have unveiled a new AI architecture that demonstrates unprecedented contextual understanding capabilities...",
        urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        source: { name: "TechCrunch", id: "techcrunch" },
        category: "technology",
        aiScore: 92,
        aiSummary: "Stanford researchers develop revolutionary AI model with enhanced contextual understanding."
      },
      {
        externalId: "ev-sales-surge",
        title: "Electric Vehicle Sales Surge as Battery Technology Improves",
        description: "Global electric vehicle sales have increased by 45% this quarter, driven by significant improvements in battery life and charging infrastructure.",
        content: "The electric vehicle industry is experiencing unprecedented growth as manufacturers overcome key technological barriers...",
        urlToImage: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        source: { name: "BBC News", id: "bbc-news" },
        category: "business",
        aiScore: 85,
        aiSummary: "Electric vehicle sales jump 45% due to better battery technology and infrastructure."
      },
      {
        externalId: "cancer-breakthrough",
        title: "New Medical Discovery Could Transform Cancer Treatment",
        description: "Scientists have identified a novel protein that could lead to more effective and less invasive cancer treatments, offering hope to millions of patients worldwide.",
        content: "A team of international researchers has made a breakthrough discovery that could revolutionize cancer treatment approaches...",
        urlToImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        source: { name: "Reuters", id: "reuters" },
        category: "health",
        aiScore: 89,
        aiSummary: "Scientists discover novel protein that could revolutionize cancer treatment approaches."
      }
    ];

    for (const article of sampleArticles) {
      await this.createArticle(article);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      preferences: { categories: [], keywords: [] },
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(userId: number, preferences: { categories: string[]; keywords: string[] }): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.preferences = preferences;
      this.users.set(userId, user);
    }
  }

  // Articles
  async getArticles(options: {
    category?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'publishedAt' | 'aiScore';
  } = {}): Promise<Article[]> {
    let result = Array.from(this.articles.values());

    if (options.category && options.category !== 'all') {
      result = result.filter(article => article.category === options.category);
    }

    // Sort
    if (options.sortBy === 'aiScore') {
      result.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    } else {
      result.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    // Pagination
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    return result.slice(offset, offset + limit);
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleByExternalId(externalId: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(article => article.externalId === externalId);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const article: Article = {
      id,
      externalId: insertArticle.externalId || null,
      title: insertArticle.title,
      description: insertArticle.description || null,
      content: insertArticle.content || null,
      urlToImage: insertArticle.urlToImage || null,
      publishedAt: insertArticle.publishedAt || null,
      source: insertArticle.source || null,
      category: insertArticle.category || null,
      aiScore: insertArticle.aiScore || null,
      aiSummary: insertArticle.aiSummary || null,
    };
    this.articles.set(id, article);
    return article;
  }

  async searchArticles(query: string): Promise<Article[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.articles.values()).filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      (article.description && article.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Favorites
  async getUserFavorites(userId: number): Promise<Article[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId);
    
    const articleIds = userFavorites.map(fav => fav.articleId);
    return Array.from(this.articles.values())
      .filter(article => articleIds.includes(article.id));
  }

  async addFavorite(favorite: InsertFavorite): Promise<void> {
    const key = `${favorite.userId}-${favorite.articleId}`;
    if (!this.favorites.has(key)) {
      const id = this.currentFavoriteId++;
      this.favorites.set(key, {
        id,
        userId: favorite.userId,
        articleId: favorite.articleId,
        createdAt: new Date(),
      });
    }
  }

  async removeFavorite(userId: number, articleId: number): Promise<void> {
    const key = `${userId}-${articleId}`;
    this.favorites.delete(key);
  }

  async isFavorited(userId: number, articleId: number): Promise<boolean> {
    const key = `${userId}-${articleId}`;
    return this.favorites.has(key);
  }
}

export const storage = new MemStorage();
