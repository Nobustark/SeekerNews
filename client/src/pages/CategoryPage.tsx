import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@shared/schema";

export default function CategoryPage() {
  const params = useParams();
  const category = params.category;
  
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const categoryArticles = articles?.filter(article => {
    const articleCategory = getCategoryFromTitle(article.title);
    return articleCategory.toLowerCase() === category?.toLowerCase();
  }) || [];

  function getCategoryFromTitle(title: string): string {
    if (title.includes("tech") || title.includes("AI") || title.includes("cyber")) return "Tech";
    if (title.includes("health") || title.includes("medical")) return "Health";
    if (title.includes("sport") || title.includes("Olympic")) return "Sports";
    if (title.includes("business") || title.includes("economic")) return "Business";
    if (title.includes("environment") || title.includes("climate")) return "Environment";
    return "Breaking";
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Tech": return "bg-red-600";
      case "Health": return "bg-red-500";
      case "Sports": return "bg-red-700";
      case "Business": return "bg-red-800";
      case "Environment": return "bg-red-500";
      default: return "bg-red-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Badge className={`${getCategoryColor(category || '')} text-white px-4 py-2 text-lg font-bold mr-4`}>
              {category?.toUpperCase()}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-800">
              {category} News
            </h1>
          </div>
          <p className="text-gray-600">
            Latest news and updates in {category?.toLowerCase()}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : categoryArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No articles found in {category}
            </h2>
            <p className="text-gray-500">
              Check back later for new content in this category.
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}