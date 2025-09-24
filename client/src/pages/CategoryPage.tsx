import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard"; // We are reusing the corrected card
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Article } from "@shared/schema";

export default function CategoryPage() {
  const { category } = useParams();

  const { data: allArticles, isLoading } = useQuery<Article[]>({
    queryKey: ["public-articles"], // Use a consistent key for all public articles
    queryFn: () => fetch("/api/articles").then((res) => res.json()),
  });

  // Filter articles based on the URL parameter. This is much cleaner now.
  const categoryArticles = allArticles?.filter(
    (article) => article.category.toLowerCase() === category?.toLowerCase()
  ) || [];

  const capitalizedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-gray-800">
            {capitalizedCategory}
          </h1>
          <p className="text-gray-600 mt-2">
            Showing all articles in the "{capitalizedCategory}" category.
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : categoryArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-600">No articles found in this category.</h2>
            <p className="text-gray-500">Check back later for new content.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}