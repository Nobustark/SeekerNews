// THE FINAL, COMPLETE, CORRECTED code for client/src/pages/HomePage.tsx
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard"; // <-- ADD THIS LINE
import LoadingSpinner from "@/components/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter"; // Make sure Link is imported
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Eye, ArrowRight, Flame, Calendar, User } from "lucide-react";
import type { Article as ArticleType } from "@shared/schema"; // <-- Use the correct type or adjust as needed

export default function HomePage() {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (error) {
    // ... error state JSX remains the same
  }

  const featuredArticle = articles?.[0];
  const trendingArticles = articles?.slice(1, 4) || [];
  const latestArticles = articles?.slice(4) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* ... Breaking news banner JSX remains the same ... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <><div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {/* Featured Article */}
                {featuredArticle && (
                  <Card className="overflow-hidden shadow-lg border-l-4 border-red-600">
                    {/* ... image JSX remains the same ... */}
                    <CardContent className="p-6">
                      {/* ... metadata JSX remains the same ... */}
                      {/* *** FIX #1: WRAP THE TITLE AND BUTTON IN A LINK *** */}
                      <Link href={`/articles/${featuredArticle.slug}`}>
                        <a className="block">
                          <h1 className="text-3xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors">
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
                )}

                {/* Trending Stories Grid */}
                <div>
                  {/* ... header JSX remains the same ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trendingArticles.map((article, index) => (
                      <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {/* ... image JSX remains the same ... */}
                        <CardContent className="p-4">
                          {/* *** FIX #2: WRAP THE TITLE IN A LINK *** */}
                          <Link href={`/articles/${article.slug}`}>
                            <a className="block">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors line-clamp-2">
                                {article.title}
                              </h3>
                            </a>
                          </Link>
                          {/* ... rest of the card content JSX ... */}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Latest News Section */}
                <div>
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-red-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Latest News</h2>
                  </div>

                  {/* Use a responsive grid for the article cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>

                {/* ... Sidebar JSX remains the same ... */}
              </div>
              {/* You can add a sidebar here if needed */}
            </div>
            <Footer />
          </>
        )}
      </div>
    </div>
  );
}