// THE FINAL, COMPLETE, CORRECTED code for client/src/pages/ArticlePage.tsx

import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Bookmark, Twitter, Facebook, Linkedin } from "lucide-react";
import type { Article } from "@shared/schema";

export default function ArticlePage() {
  // *** THIS IS THE FINAL FIX: The path now matches App.tsx ("articles" plural) ***
  const [match, params] = useRoute("/articles/:slug");
  const slug = params?.slug;

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/articles/${slug}`],
    enabled: !!slug,
  });

  if (error || !article && !isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been moved.</p>
            <Link href="/">
              <Button variant="default">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSpinner size="lg" className="py-16" />
        </div>
        <Footer />
      </div>
    );
  }
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getCategory = () => {
    const title = article.title.toLowerCase();
    if (title.includes("tech") || title.includes("ai")) return "Tech";
    if (title.includes("health")) return "Health";
    if (title.includes("sport")) return "Sports";
    if (title.includes("business")) return "Business";
    if (title.includes("climate")) return "Environment";
    return "Breaking";
  };

  const category = getCategory();
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Tech": return "bg-blue-600";
      case "Health": return "bg-green-600";
      case "Sports": return "bg-orange-600";
      case "Business": return "bg-purple-600";
      case "Environment": return "bg-emerald-600";
      default: return "bg-red-600";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/">
              <span className="text-blue-600 hover:text-blue-800 transition-colors flex items-center cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </span>
            </Link>
          </div>
          <div className="mb-6">
            <span className={`${getCategoryColor(category)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
              {category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">{article.title}</h1>
          <div className="flex items-center text-gray-600 mb-8">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(article.createdAt!)}</span>
            <span className="mx-3">•</span>
            <span>5 min read</span>
            <span className="mx-3">•</span>
            <span>By {article.author}</span>
          </div>
        </header>
        {article.imageUrl && (
          <div className="mb-8">
            <img src={article.imageUrl} alt={article.title} className="w-full h-64 md:h-96 object-cover rounded-xl" />
          </div>
        )}
        <div className="prose prose-lg max-w-none">
          <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">{article.content}</div>
        </div>
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Share this article:</span>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} className="text-blue-600 hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer"><Twitter className="w-5 h-5" /></a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} className="text-blue-600 hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer"><Facebook className="w-5 h-5" /></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} className="text-blue-600 hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer"><Linkedin className="w-5 h-5" /></a>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700"><Bookmark className="w-4 h-4 mr-2" />Save Article</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}