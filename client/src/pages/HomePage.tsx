import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Eye, ArrowRight, Flame, Calendar, User } from "lucide-react";
import type { Article } from "@shared/schema";

export default function HomePage() {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Failed to load articles</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const featuredArticle = articles?.[0];
  const trendingArticles = articles?.slice(1, 4) || [];
  const latestArticles = articles?.slice(4) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Breaking News Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Flame className="w-5 h-5 mr-2 animate-pulse" />
            <span className="text-sm font-medium">LIVE: Breaking news updates from around the world</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
              {/* Featured Article */}
              {featuredArticle && (
                <Card className="overflow-hidden shadow-lg border-l-4 border-red-600">
                  <div className="relative">
                    <img 
                      src={featuredArticle.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                      alt={featuredArticle.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600 text-white px-3 py-1 rounded-full font-bold">
                        FEATURED
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(featuredArticle.createdAt!).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <User className="w-4 h-4 mr-1" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors cursor-pointer">
                      {featuredArticle.title}
                    </h1>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {featuredArticle.excerpt || `${featuredArticle.content.substring(0, 200)}...`}
                    </p>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Read Full Story <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Trending Stories Grid */}
              <div>
                <div className="flex items-center mb-6">
                  <TrendingUp className="w-6 h-6 text-red-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Trending Stories</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trendingArticles.map((article, index) => (
                    <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={article.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"}
                          alt={article.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-red-600 text-white px-2 py-1 text-xs font-bold">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors cursor-pointer line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {article.excerpt || `${article.content.substring(0, 100)}...`}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(article.createdAt!).toLocaleDateString()}</span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {Math.floor(Math.random() * 1000) + 100} views
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Latest News Section */}
              <div>
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-red-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
                </div>
                <div className="space-y-4">
                  {latestArticles.map((article) => (
                    <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={article.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80"}
                          alt={article.title}
                          className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-red-600 transition-colors cursor-pointer">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {article.excerpt || `${article.content.substring(0, 120)}...`}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{new Date(article.createdAt!).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>{article.author}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Stats */}
              <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Articles</span>
                    <span className="text-2xl font-bold text-red-600">{articles?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Breaking News</span>
                    <span className="text-2xl font-bold text-red-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Live Updates</span>
                    <span className="text-2xl font-bold text-red-600">12</span>
                  </div>
                </div>
              </Card>

              {/* Popular Categories */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Categories</h3>
                <div className="space-y-3">
                  {[
                    { name: "Breaking News", count: 15, color: "bg-red-600" },
                    { name: "Technology", count: 12, color: "bg-blue-600" },
                    { name: "World News", count: 8, color: "bg-green-600" },
                    { name: "Sports", count: 6, color: "bg-orange-600" },
                    { name: "Business", count: 4, color: "bg-purple-600" }
                  ].map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${category.color} mr-3`}></div>
                        <span className="text-gray-700">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Newsletter Signup */}
              <Card className="p-6 bg-gradient-to-br from-gray-900 to-red-900 text-white">
                <h3 className="text-lg font-bold mb-3">Stay Updated</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get the latest news delivered to your inbox every morning.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-red-400"
                  />
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Subscribe Now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
