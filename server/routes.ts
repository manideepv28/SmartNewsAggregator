import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertFavoriteSchema } from "@shared/schema";
import { analyzeArticle, generateRecommendations } from "./ai";

// Mock news data for local development
const MOCK_NEWS_DATA = [
  {
    source: { id: "techcrunch", name: "TechCrunch" },
    author: "Sarah Perez",
    title: "AI Revolution: New Breakthrough in Machine Learning Changes Everything",
    description: "Researchers at Stanford University have developed a new AI model that can understand context better than ever before, potentially revolutionizing how we interact with technology.",
    url: "https://techcrunch.com/ai-breakthrough-2024",
    urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    content: "In a groundbreaking development, Stanford researchers have unveiled a new AI architecture that demonstrates unprecedented contextual understanding capabilities..."
  },
  {
    source: { id: "bbc-news", name: "BBC News" },
    author: "Technology Reporter",
    title: "Electric Vehicle Sales Surge as Battery Technology Improves",
    description: "Global electric vehicle sales have increased by 45% this quarter, driven by significant improvements in battery life and charging infrastructure.",
    url: "https://bbc.com/news/ev-sales-surge",
    urlToImage: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    content: "The electric vehicle industry is experiencing unprecedented growth as manufacturers overcome key technological barriers..."
  },
  {
    source: { id: "reuters", name: "Reuters" },
    author: "Health Correspondent",
    title: "New Medical Discovery Could Transform Cancer Treatment",
    description: "Scientists have identified a novel protein that could lead to more effective and less invasive cancer treatments, offering hope to millions of patients worldwide.",
    url: "https://reuters.com/health/cancer-breakthrough",
    urlToImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    content: "A team of international researchers has made a breakthrough discovery that could revolutionize cancer treatment approaches..."
  },
  {
    source: { id: "espn", name: "ESPN" },
    author: "Sports Editor",
    title: "Olympic Records Shattered in Swimming Championships",
    description: "Multiple world records were broken at the international swimming championships, with athletes pushing the boundaries of human performance.",
    url: "https://espn.com/swimming-records-broken",
    urlToImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    content: "The swimming world witnessed history in the making as several Olympic records were shattered during the championship finals..."
  },
  {
    source: { id: "the-verge", name: "The Verge" },
    author: "Tech Writer",
    title: "Quantum Computing Reaches New Milestone with 1000-Qubit Processor",
    description: "A major technology company has announced the development of a 1000-qubit quantum processor, marking a significant step toward practical quantum computing.",
    url: "https://theverge.com/quantum-computing-milestone",
    urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    content: "The quantum computing industry has reached a major milestone with the announcement of a revolutionary 1000-qubit processor..."
  },
  {
    source: { id: "cnn", name: "CNN" },
    author: "Business Reporter",
    title: "Global Markets React to New Trade Agreement",
    description: "International markets are showing positive responses to the newly signed trade agreement between major economic powers, with tech stocks leading the gains.",
    url: "https://cnn.com/business/trade-agreement-markets",
    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    content: "Global financial markets are experiencing significant movement following the announcement of a comprehensive trade agreement..."
  },
  {
    source: { id: "nature", name: "Nature" },
    author: "Science Correspondent",
    title: "Climate Scientists Discover New Method to Capture Carbon",
    description: "Researchers have developed an innovative technique that could capture carbon dioxide from the atmosphere more efficiently than existing methods.",
    url: "https://nature.com/carbon-capture-breakthrough",
    urlToImage: "https://images.unsplash.com/photo-1569163139061-de7e8d43c5fe?w=800",
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    content: "In a promising development for climate change mitigation, scientists have unveiled a new carbon capture technology..."
  },
  {
    source: { id: "entertainment-weekly", name: "Entertainment Weekly" },
    author: "Entertainment Reporter",
    title: "Streaming Wars Heat Up with New Platform Launches",
    description: "The competition in the streaming industry intensifies as new platforms enter the market with exclusive content and innovative features.",
    url: "https://ew.com/streaming-wars-update",
    urlToImage: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    content: "The entertainment landscape continues to evolve rapidly as streaming services compete for viewer attention with unprecedented content offerings..."
  }
];

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

interface NewsAPIArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

async function fetchNewsFromAPI(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<NewsAPIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredArticles = [...MOCK_NEWS_DATA];
  
  // Filter by category if specified
  if (params.category && params.category !== 'general') {
    const categoryKeywords: Record<string, string[]> = {
      technology: ['AI', 'tech', 'quantum', 'computing', 'electric'],
      business: ['markets', 'trade', 'economy', 'financial'],
      science: ['medical', 'discovery', 'research', 'climate', 'scientists'],
      sports: ['olympic', 'swimming', 'championship', 'records'],
      entertainment: ['streaming', 'platform', 'content'],
      health: ['medical', 'cancer', 'treatment', 'health']
    };
    
    const keywords = categoryKeywords[params.category] || [];
    if (keywords.length > 0) {
      filteredArticles = filteredArticles.filter(article =>
        keywords.some(keyword =>
          article.title.toLowerCase().includes(keyword.toLowerCase()) ||
          article.description?.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }
  }
  
  // Filter by search query if specified
  if (params.q) {
    const query = params.q.toLowerCase();
    filteredArticles = filteredArticles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.description?.toLowerCase().includes(query)
    );
  }
  
  return {
    status: "ok",
    totalResults: filteredArticles.length,
    articles: filteredArticles
  };
}

async function processAndStoreArticles(newsArticles: NewsAPIArticle[]) {
  const processedArticles = [];

  for (const newsArticle of newsArticles) {
    if (!newsArticle.title || !newsArticle.description) continue;

    // Check if article already exists
    const existingArticle = await storage.getArticleByExternalId(newsArticle.url);
    if (existingArticle) {
      processedArticles.push(existingArticle);
      continue;
    }

    // Analyze with AI
    const analysis = await analyzeArticle(
      newsArticle.title,
      newsArticle.description,
      newsArticle.content || undefined
    );

    // Determine category
    const category = analysis.categories.length > 0 ? analysis.categories[0] : 'general';

    // Create article
    const article = await storage.createArticle({
      externalId: newsArticle.url,
      title: newsArticle.title,
      description: newsArticle.description,
      content: newsArticle.content,
      urlToImage: newsArticle.urlToImage,
      publishedAt: new Date(newsArticle.publishedAt),
      source: { name: newsArticle.source.name, id: newsArticle.source.id },
      category,
      aiScore: analysis.score,
      aiSummary: analysis.summary,
    });

    processedArticles.push(article);
  }

  return processedArticles;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const { category, page = "1", search, sortBy = "publishedAt" } = req.query;
      const pageNum = parseInt(page as string);
      const limit = 20;
      const offset = (pageNum - 1) * limit;

      if (search) {
        const articles = await storage.searchArticles(search as string);
        return res.json({ articles, totalResults: articles.length });
      }

      const articles = await storage.getArticles({
        category: category as string,
        limit,
        offset,
        sortBy: sortBy as 'publishedAt' | 'aiScore',
      });

      res.json({ articles, totalResults: articles.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/news/refresh", async (req, res) => {
    try {
      const { category = "general" } = req.query;
      
      // Fetch fresh news from API
      const newsData = await fetchNewsFromAPI("top-headlines", {
        category: category as string,
        country: "us",
      });

      // Process and store articles
      const articles = await processAndStoreArticles(newsData.articles);
      
      res.json({ articles, totalResults: articles.length });
    } catch (error) {
      console.error("News refresh failed:", error);
      res.status(500).json({ message: "Failed to refresh news" });
    }
  });

  app.get("/api/news/search", async (req, res) => {
    try {
      const { q, sortBy = "publishedAt", page = "1" } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: "Search query required" });
      }

      // Try local search first
      let articles = await storage.searchArticles(q as string);
      
      // If no local results, fetch from News API
      if (articles.length === 0) {
        const newsData = await fetchNewsFromAPI("everything", {
          q: q as string,
          sortBy: sortBy as string,
          page: page as string,
        });

        articles = await processAndStoreArticles(newsData.articles);
      }

      res.json({ articles, totalResults: articles.length });
    } catch (error) {
      console.error("News search failed:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // AI recommendations
  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get recent articles
      const allArticles = await storage.getArticles({ limit: 50 });
      
      // Generate AI recommendations
      const recommendedIds = await generateRecommendations(
        user.preferences || { categories: [], keywords: [] },
        allArticles.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description || '',
          category: a.category,
          aiScore: a.aiScore,
        }))
      );

      // Get recommended articles
      const recommendations = [];
      for (const id of recommendedIds) {
        const article = await storage.getArticleById(id);
        if (article) recommendations.push(article);
      }

      res.json({ recommendations });
    } catch (error) {
      console.error("Recommendations failed:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // User preferences
  app.put("/api/users/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { categories, keywords } = req.body;

      await storage.updateUserPreferences(userId, { categories, keywords });
      res.json({ message: "Preferences updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Favorites
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getUserFavorites(userId);
      res.json({ favorites });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      await storage.addFavorite(validatedData);
      res.json({ message: "Article favorited successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to favorite article" });
    }
  });

  app.delete("/api/favorites/:userId/:articleId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const articleId = parseInt(req.params.articleId);
      
      await storage.removeFavorite(userId, articleId);
      res.json({ message: "Article unfavorited successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfavorite article" });
    }
  });

  app.get("/api/favorites/:userId/:articleId/check", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const articleId = parseInt(req.params.articleId);
      
      const isFavorited = await storage.isFavorited(userId, articleId);
      res.json({ isFavorited });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
