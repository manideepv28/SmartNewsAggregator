import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ArticleCard from "@/components/article-card";
import ArticleModal from "@/components/article-modal";
import AuthModal from "@/components/auth-modal";
import FavoritesModal from "@/components/favorites-modal";
import AIRecommendations from "@/components/ai-recommendations";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchNews, refreshNews, searchNews } from "@/lib/news-api";
import { getCurrentUser } from "@/lib/auth";
import { NewsArticle, NewsFilters } from "@/types/news";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [filters, setFilters] = useState<NewsFilters>({
    category: 'all',
    filter: 'all',
    sortBy: 'publishedAt',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: newsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/news', filters.category, filters.search, filters.sortBy, currentPage],
    queryFn: async () => {
      if (filters.search) {
        return searchNews(filters.search, { sortBy: filters.sortBy, page: currentPage });
      }
      return fetchNews({ 
        category: filters.category, 
        page: currentPage, 
        sortBy: filters.sortBy 
      });
    },
  });

  // Filter articles based on current filter
  const getFilteredArticles = () => {
    if (!newsData?.articles) return [];
    
    let filtered = [...newsData.articles];
    
    switch (filters.filter) {
      case 'trending':
        filtered = filtered.filter(article => (article.aiScore || 0) > 80);
        break;
      case 'recent':
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(article => 
          new Date(article.publishedAt) > last24Hours
        );
        break;
      case 'saved':
        // This will be handled by favorites modal
        filtered = [];
        break;
    }
    
    return filtered;
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: 'all' | 'trending' | 'recent' | 'saved') => {
    if (filter === 'saved') {
      setShowFavoritesModal(true);
      return;
    }
    setFilters(prev => ({ ...prev, filter }));
    setCurrentPage(1);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: 'publishedAt' | 'aiScore' | 'relevancy') => {
    setFilters(prev => ({ ...prev, sortBy }));
    setCurrentPage(1);
  };

  const handleRefreshNews = async () => {
    try {
      await refreshNews(filters.category === 'all' ? 'general' : filters.category);
      refetch();
    } catch (error) {
      console.error('Failed to refresh news:', error);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleUserChange = (user: any) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const filteredArticles = getFilteredArticles();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation
        currentUser={currentUser}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        onAuthClick={() => setShowAuthModal(true)}
        onFavoritesClick={() => setShowFavoritesModal(true)}
        currentCategory={filters.category}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* AI Recommendations Section */}
        {currentUser && (
          <AIRecommendations 
            userId={currentUser.id} 
            onArticleClick={setSelectedArticle}
          />
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-slate-600 mr-2">Filter by:</span>
            {(['all', 'trending', 'recent', 'saved'] as const).map((filter) => (
              <button
                key={filter}
                className={`filter-chip ${filters.filter === filter ? 'active' : ''}`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Sort:</span>
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishedAt">Latest</SelectItem>
                  <SelectItem value="aiScore">Popular</SelectItem>
                  <SelectItem value="relevancy">Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRefreshNews} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-slate-600">Loading latest news...</span>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <i className="fas fa-newspaper text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500">No articles found matching your criteria.</p>
            </div>
          ) : (
            filteredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                currentUser={currentUser}
                onClick={() => setSelectedArticle(article)}
              />
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredArticles.length > 0 && newsData?.totalResults && filteredArticles.length < newsData.totalResults && (
          <div className="text-center mt-8">
            <Button onClick={handleLoadMore}>
              Load More Articles
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          currentUser={currentUser}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onUserChange={handleUserChange}
        />
      )}

      {showFavoritesModal && (
        <FavoritesModal
          currentUser={currentUser}
          onClose={() => setShowFavoritesModal(false)}
          onArticleClick={setSelectedArticle}
          onAuthRequired={() => {
            setShowFavoritesModal(false);
            setShowAuthModal(true);
          }}
        />
      )}
    </div>
  );
}
