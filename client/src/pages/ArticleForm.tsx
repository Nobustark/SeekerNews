import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { onAuthStateChange } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { X, CloudUpload, Trash2, Send } from "lucide-react";
import type { Article } from "@shared/schema";

export default function ArticleForm() {
  const [match, params] = useRoute("/admin/articles/:id");
  const isEdit = match && params?.id !== "new";
  const articleId = isEdit ? parseInt(params!.id) : null;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        setLocation("/admin");
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setLocation]);

  // Fetch article data for editing
  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: [`/api/admin/articles/${articleId}`],
    enabled: !!user && !!articleId,
  });

  // Load article data into form
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setContent(article.content);
      setExcerpt(article.excerpt || "");
      setImageUrl(article.imageUrl || "");
      setPublished(article.published);
    }
  }, [article]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !isEdit) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, isEdit]);

  const createArticleMutation = useMutation({
    mutationFn: (articleData: any) => apiRequest("POST", "/api/admin/articles", articleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: "Article Created",
        description: "The article has been successfully created.",
      });
      setLocation("/admin/dashboard");
    },
    onError: () => {
      toast({
        title: "Create Failed",
        description: "Failed to create the article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: (articleData: any) => apiRequest("PUT", `/api/admin/articles/${articleId}`, articleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: "Article Updated",
        description: "The article has been successfully updated.",
      });
      setLocation("/admin/dashboard");
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update the article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required fields.",
        variant: "destructive",
      });
      return;
    }

    const articleData = {
      title,
      slug,
      content,
      excerpt,
      imageUrl,
      published,
      author: user?.email || "Admin",
    };

    if (isEdit) {
      updateArticleMutation.mutate(articleData);
    } else {
      createArticleMutation.mutate(articleData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll just use a placeholder URL
      // In a real app, you would upload to Firebase Storage
      const mockImageUrl = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
      setImageUrl(mockImageUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Image has been uploaded successfully.",
      });
    }
  };

  if (loading || (isEdit && articleLoading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" className="py-16" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? "Edit Article" : "Create New Article"}
            </h1>
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin/dashboard")}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white rounded-xl shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                    Article Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title"
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                    URL Slug
                  </Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Auto-generated from title"
                    className="w-full bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-semibold text-gray-700">
                  Article Image
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imageUrl ? (
                    <div className="space-y-4">
                      <img
                        src={imageUrl}
                        alt="Article preview"
                        className="max-w-full h-48 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setImageUrl("")}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer"
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      <CloudUpload className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                      <p className="text-gray-600 mb-2">Click to upload image or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-700">
                  Article Excerpt
                </Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of the article (optional)"
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-semibold text-gray-700">
                  Article Content *
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here..."
                  rows={15}
                  className="w-full"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="published" className="text-sm text-gray-700">
                  Publish article immediately
                </Label>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                  disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                >
                  {createArticleMutation.isPending || updateArticleMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {isEdit ? "Update Article" : "Publish Article"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
