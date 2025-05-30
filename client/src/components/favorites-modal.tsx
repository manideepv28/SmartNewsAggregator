import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { NewsArticle } from "@/types/news";
import { getUserFavorites } from "@/lib/news-api";
import { getFavoriteIds, removeFavoriteId } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface FavoritesModalProps {
  currentUser: any;
  onClose: () => void;
  onArticleClick: (article: NewsArticle) => void;
  onAuthRequired: () => void;
}

export default function FavoritesModal({ 
  currentUser, 
  onClose, 
  onArticleClick, 
  onAuthRequired 
}: FavoritesModalProps) {
  const { toast } = useToast();
  const favoriteIds = getFavoriteIds();

  const { data: favoritesData, isLoading } = useQuery({
    queryKey: ['/api/favorites', currentUser?.id],
    queryFn: () => currentUser ? getUserFavorites(currentUser.id) : Promise.resolve({ favorites: [] }),
    enabled: !!currentUser,
  });

  if (!currentUser) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-500" />
              Saved Articles
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8">
            <Heart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">Please log in to view your saved articles.</p>
            <Button onClick={onAuthRequired}>
              Login / Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleRemoveFavorite = (articleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavoriteId(articleId);
    toast({
      title: "Article Removed",
      description: "Article removed from your saved list.",
    });
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

  const favorites = favoritesData?.favorites || [];

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-red-500" />
            Saved Articles
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading your saved articles...</p>
            </div>
          ) : favoriteIds.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500">No saved articles yet.</p>
              <p className="text-sm text-slate-400 mt-2">
                Click the heart icon on any article to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => {
                    onArticleClick(article);
                    onClose();
                  }}
                >
                  {article.urlToImage && (
                    <img 
                      src={article.urlToImage} 
                      alt={article.title} 
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
                      }}
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 mb-1 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {article.source.name} • {getTimeAgo(article.publishedAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleRemoveFavorite(article.id, e)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
