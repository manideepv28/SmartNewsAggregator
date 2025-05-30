import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Bot } from "lucide-react";
import { NewsArticle } from "@/types/news";
import { isFavorited, addFavoriteId, removeFavoriteId } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ArticleCardProps {
  article: NewsArticle;
  currentUser: any;
  onClick: () => void;
}

export default function ArticleCard({ article, currentUser, onClick }: ArticleCardProps) {
  const [isArticleFavorited, setIsArticleFavorited] = useState(isFavorited(article.id));
  const { toast } = useToast();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save articles.",
        variant: "destructive",
      });
      return;
    }

    if (isArticleFavorited) {
      removeFavoriteId(article.id);
      setIsArticleFavorited(false);
      toast({
        title: "Article Removed",
        description: "Article removed from your saved list.",
      });
    } else {
      addFavoriteId(article.id);
      setIsArticleFavorited(true);
      toast({
        title: "Article Saved",
        description: "Article added to your saved list.",
      });
    }
  };

  const getTimeAgo = (dateString: string | Date) => {
    const now = new Date();
    const publishDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const isAIRecommended = (article.aiScore || 0) > 85;

  return (
    <div className="article-card relative" onClick={onClick}>
      {isAIRecommended && (
        <div className="ai-badge">
          <Bot className="w-3 h-3 mr-1 inline" />
          AI Pick
        </div>
      )}
      
      {article.urlToImage && (
        <img 
          src={article.urlToImage} 
          alt={article.title} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
          }}
        />
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {article.source.name}
          </span>
          <span className="text-xs text-slate-400">
            {getTimeAgo(article.publishedAt)}
          </span>
        </div>
        
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
          {article.title}
        </h3>
        
        {article.description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-3">
            {article.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-blue-700 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Read More
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteToggle}
            className={`p-1 ${isArticleFavorited ? 'text-red-500' : 'text-slate-400'} hover:text-red-500`}
          >
            <Heart className={`h-4 w-4 ${isArticleFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
