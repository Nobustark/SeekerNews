import { Link } from "wouter";
import { Calendar, User, ArrowRight } from "lucide-react";
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

  const getCategoryColor = (category: string) => {
    // You can customize colors here if you wish
    return "bg-red-600";
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {/* --- CORRECTED LINK USAGE --- */}
      <Link href={`/articles/${article.slug}`}>
        <a className="block">
          <div className="relative">
            <img 
              src={article.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
              alt={article.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className={`${getCategoryColor(article.category)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                {article.category}
              </Badge>
            </div>
          </div>
        </a>
      </Link>
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <User className="w-4 h-4 mr-2" />
          <span>{article.author}</span>
          <span className="mx-2">•</span>
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formatDate(article.createdAt)}</span>
        </div>
        
        {/* --- CORRECTED LINK USAGE --- */}
        <Link href={`/articles/${article.slug}`}>
          <a className="block">
            <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-red-600 transition-colors">
              {article.title}
            </h3>
          </a>
        </Link>

        <p className="text-gray-600 mb-4 flex-1">
          {article.excerpt || `${article.content.substring(0, 150)}...`}
        </p>

        {/* --- CORRECTED LINK USAGE --- */}
        <Link href={`/articles/${article.slug}`}>
          <a className="inline-flex items-center text-red-600 hover:text-red-800 font-semibold transition-colors">
            Read More <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Link>
      </CardContent>
    </Card>
  );
}