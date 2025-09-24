import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import type { Article } from "@shared/schema";

export default function HomePage() {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["public-articles"],
    queryFn: () => fetch("/api/articles").then(res => res.json()),
  });

  if (error) {
    return <div>Error loading articles...</div>;
  }

  // --- NEW, SIMPLIFIED LOGIC ---
  const featuredArticle = articles?.[0];
  // All other articles will go into this list
  const otherArticles = articles?.slice(1) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-700">No articles published yet.</h2>
            <p className="text-gray-500 mt-2">Check back soon for the latest news!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Article Section */}
            {featuredArticle && (
              <section>
                <Card className="overflow-hidden shadow-lg border-l-4 border-red-600">
                  {featuredArticle.imageUrl && (
                     <img src={featuredArticle.imageUrl} alt={featuredArticle.title} className="w-full h-64 object-cover" />
                  )}
                  <CardContent className="p-6">
                    <Link href={`/articles/${featuredArticle.slug}`}>
                      <a className="block group">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">
                          {featuredArticle.title}
                        </h1>
                        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                          {featuredArticle.excerpt || `${featuredArticle.content.substring(0, 200)}...`}
                        </p>
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                          Read Full Story <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </Link>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Latest News Section - Displays all other articles */}
            {otherArticles.length > 0 && (
              <section>
                <div className="flex items-center mb-6 border-b pb-4">
                  <FileText className="w-6 h-6 text-red-600 mr-3" />
                  <h2 className="text-3xl font-bold text-gray-800">Latest News</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}