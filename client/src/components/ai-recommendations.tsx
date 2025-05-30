import { useQuery } from "@tanstack/react-query";
import { Bot, Sparkles } from "lucide-react";
import { NewsArticle } from "@/types/news";
import { getRecommendations } from "@/lib/news-api";
import ArticleCard from "./article-card";
import { getCurrentUser } from "@/lib/auth";

interface AIRecommendationsProps {
  userId: number;
  onArticleClick: (article: NewsArticle) => void;
}

export default function AIRecommendations({ userId, onArticleClick }: AIRecommendationsProps) {
  const currentUser = getCurrentUser();

  const { data: recommendationsData, isLoading } = useQuery({
    queryKey: ['/api/recommendations', userId],
    queryFn: () => getRecommendations(userId),
    enabled: !!userId,
  });

  if (!currentUser || isLoading) {
    return null;
  }

  const recommendations = recommendationsData?.recommendations || [];

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center mb-4">
          <Bot className="text-2xl mr-3" />
          <h2 className="text-xl font-semibold">AI Curated for You</h2>
          <Sparkles className="ml-2 h-5 w-5" />
        </div>
        <p className="text-blue-100">
          Based on your reading preferences and interests
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.slice(0, 3).map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            currentUser={currentUser}
            onClick={() => onArticleClick(article)}
          />
        ))}
      </div>
    </div>
  );
}
