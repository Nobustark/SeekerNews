import { Link } from "wouter";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@shared/schema";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategory = () => {
    // Simple category detection based on title keywords
    const title = article.title.toLowerCase();
    if (title.includes("tech") || title.includes("ai") || title.includes("digital")) return "Tech";
    if (title.includes("health") || title.includes("medical")) return "Health";
    if (title.includes("sport") || title.includes("championship")) return "Sports";
    if (title.includes("business") || title.includes("market") || title.includes("economic")) return "Business";
    if (title.includes("environment") || title.includes("climate")) return "Environment";
    return "Breaking";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Tech": return "bg-blue-600";
      case "Health": return "bg-green-600";
      case "Sports": return "bg-orange-600";
      case "Business": return "bg-purple-600";
      case "Environment": return "bg-emerald-600";
      default: return "bg-red-600";
    }
  };

  const category = getCategory();

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={article.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
          alt={article.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(category)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
            {category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formatDate(article.createdAt!)}</span>
          <span className="mx-2">•</span>
          <span>5 min read</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors cursor-pointer">
          <Link href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4">
          {article.excerpt || `${article.content.substring(0, 150)}...`}
        </p>
        <Link href={`/article/${article.slug}`}>
          <span className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer">
            Read More <ArrowRight className="w-4 h-4 ml-2" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
