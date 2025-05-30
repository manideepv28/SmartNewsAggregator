import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Heart, User, Newspaper } from "lucide-react";
import { NEWS_CATEGORIES } from "@/types/news";
import { getFavoriteIds } from "@/lib/auth";

interface NavigationProps {
  currentUser: any;
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
  onAuthClick: () => void;
  onFavoritesClick: () => void;
}

export default function Navigation({
  currentUser,
  currentCategory,
  onCategoryChange,
  onSearch,
  onAuthClick,
  onFavoritesClick,
}: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const favoriteIds = getFavoriteIds();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Newspaper className="text-2xl text-primary mr-3" />
              <h1 className="text-xl font-bold text-slate-900">NewsAI</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              {NEWS_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  className={`nav-tab ${currentCategory === category.id ? 'active' : ''}`}
                  onClick={() => onCategoryChange(category.id)}
                >
                  <i className={`${category.icon} mr-2`}></i>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            </form>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onFavoritesClick}
                className="relative p-2 text-slate-600 hover:text-red-500"
              >
                <Heart className="h-5 w-5" />
                {favoriteIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoriteIds.length}
                  </span>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onAuthClick}
                className="flex items-center space-x-2"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block text-sm font-medium">
                  {currentUser ? currentUser.email.split('@')[0] : 'Guest'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
