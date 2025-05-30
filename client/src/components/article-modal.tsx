import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Heart } from "lucide-react";
import { NewsArticle } from "@/types/news";
import { isFavorited, addFavoriteId, removeFavoriteId } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ArticleModalProps {
  article: NewsArticle;
  currentUser: any;
  onClose: () => void;
}

export default function ArticleModal({ article, currentUser, onClose }: ArticleModalProps) {
  const [isArticleFavorited, setIsArticleFavorited] = useState(isFavorited(article.id));
  const { toast } = useToast();

  const handleFavoriteToggle = () => {
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

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="overflow-y-auto max-h-[90vh]">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {article.urlToImage && (
              <img 
                src={article.urlToImage} 
                alt={article.title} 
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
                }}
              />
            )}
          </div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {article.source.name}
                </span>
                <span className="text-sm text-slate-400">
                  {getTimeAgo(article.publishedAt)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteToggle}
                className={`${isArticleFavorited ? 'text-red-500' : 'text-slate-400'} hover:text-red-500`}
              >
                <Heart className={`h-5 w-5 ${isArticleFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {article.title}
            </h1>
            
            {article.description && (
              <p className="text-lg text-slate-600 mb-6">
                {article.description}
              </p>
            )}
            
            {article.aiSummary && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">
                  🤖 AI Summary
                </h3>
                <p className="text-purple-800">
                  {article.aiSummary}
                </p>
              </div>
            )}
            
            <div className="prose max-w-none">
              <p className="text-slate-700 leading-relaxed">
                {article.content || article.description || "Full article content not available. Click the source link to read the complete article."}
              </p>
            </div>
            
            {article.externalId && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <Button asChild>
                  <a 
                    href={article.externalId} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center"
                  >
                    Read Full Article at {article.source.name}
                    <i className="fas fa-external-link-alt ml-2"></i>
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
