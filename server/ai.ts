export interface ArticleAnalysis {
  score: number; // 0-100 relevance score
  summary: string;
  categories: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export async function analyzeArticle(title: string, description: string, content?: string): Promise<ArticleAnalysis> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock analysis based on article content
  const text = [title, description, content].filter(Boolean).join(' ').toLowerCase();
  
  // Calculate mock AI score based on keywords
  let score = 60; // Base score
  
  // High-impact keywords increase score
  const highImpactKeywords = ['breakthrough', 'revolutionary', 'discovers', 'milestone', 'record', 'first', 'new'];
  const foundHighImpact = highImpactKeywords.filter(keyword => text.includes(keyword)).length;
  score += foundHighImpact * 10;
  
  // Technology articles tend to score higher
  if (text.includes('ai') || text.includes('technology') || text.includes('quantum')) {
    score += 15;
  }
  
  // Ensure score is within bounds
  score = Math.max(40, Math.min(95, score));
  
  // Determine categories based on keywords
  const categories = [];
  if (text.includes('ai') || text.includes('tech') || text.includes('quantum') || text.includes('computing')) {
    categories.push('technology');
  }
  if (text.includes('market') || text.includes('trade') || text.includes('business') || text.includes('economy')) {
    categories.push('business');
  }
  if (text.includes('medical') || text.includes('health') || text.includes('cancer') || text.includes('treatment')) {
    categories.push('health');
  }
  if (text.includes('climate') || text.includes('research') || text.includes('discovery') || text.includes('scientists')) {
    categories.push('science');
  }
  if (text.includes('olympic') || text.includes('sport') || text.includes('championship') || text.includes('record')) {
    categories.push('sports');
  }
  if (text.includes('streaming') || text.includes('entertainment') || text.includes('movie') || text.includes('music')) {
    categories.push('entertainment');
  }
  
  // Default to general if no specific category found
  if (categories.length === 0) {
    categories.push('general');
  }
  
  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  const positiveWords = ['breakthrough', 'success', 'improvement', 'surge', 'growth', 'milestone'];
  const negativeWords = ['crisis', 'decline', 'threat', 'problem', 'concern', 'risk'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  }
  
  // Generate summary
  const summary = description ? 
    description.split('.').slice(0, 2).join('.') + '.' : 
    title;
  
  return {
    score,
    summary,
    categories,
    sentiment
  };
}

export async function generateRecommendations(
  userPreferences: { categories: string[]; keywords: string[] },
  articles: Array<{ id: number; title: string; description: string; category?: string | null; aiScore?: number | null }>
): Promise<number[]> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock recommendation algorithm based on user preferences
  const scoredArticles = articles.map(article => {
    let relevanceScore = article.aiScore || 50;
    
    // Boost score for preferred categories
    if (userPreferences.categories.length > 0 && article.category) {
      if (userPreferences.categories.includes(article.category)) {
        relevanceScore += 20;
      }
    }
    
    // Boost score for keyword matches
    if (userPreferences.keywords.length > 0) {
      const articleText = `${article.title} ${article.description}`.toLowerCase();
      const keywordMatches = userPreferences.keywords.filter(keyword => 
        articleText.includes(keyword.toLowerCase())
      ).length;
      relevanceScore += keywordMatches * 15;
    }
    
    // Add some randomness for variety
    relevanceScore += Math.random() * 10;
    
    return {
      id: article.id,
      score: relevanceScore
    };
  });
  
  // Sort by relevance score and return top 10 IDs
  return scoredArticles
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(a => a.id);
}
