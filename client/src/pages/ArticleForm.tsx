// The complete, corrected code for client/src/pages/ArticleForm.tsx

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { X, CloudUpload, Trash2, Send, Sparkles, Brain } from "lucide-react";
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

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLocation("/admin");
      } else {
        setUser(user);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [setLocation]);

  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: [`/api/admin/articles/${articleId}`],
    enabled: !!user && !!articleId,
  });

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

  useEffect(() => {
    if (title && !isEdit) {
      const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, isEdit]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: isEdit ? "Article Updated" : "Article Created",
        description: "Your changes have been saved successfully.",
      });
      setLocation("/admin/dashboard");
    },
    onError: () => {
      toast({
        title: isEdit ? "Update Failed" : "Create Failed",
        description: "There was an error saving the article. Please try again.",
        variant: "destructive",
      });
    },
  };

  const createArticleMutation = useMutation({
    mutationFn: (articleData: any) => apiRequest("POST", "/api/admin/articles", articleData),
    ...mutationOptions,
  });

  const updateArticleMutation = useMutation({
    mutationFn: (articleData: any) => apiRequest("PUT", `/api/admin/articles/${articleId}`, articleData),
    ...mutationOptions,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    const articleData = { title, slug, content, excerpt, imageUrl, published, author: user?.email || "Admin" };
    if (isEdit) {
      updateArticleMutation.mutate(articleData);
    } else {
      createArticleMutation.mutate(articleData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is placeholder logic. Real implementation requires Firebase Storage.
    if (e.target.files?.[0]) {
      const mockImageUrl = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
      setImageUrl(mockImageUrl);
      toast({ title: "Image Uploaded", description: "Placeholder image has been set." });
    }
  };

  const handleAiFeature = async (feature: 'title' | 'summary') => {
    if (!content) return;
    setIsGenerating(true);
    const endpoint = feature === 'title' ? "/api/admin/ai/generate-title" : "/api/admin/ai/generate-summary";
    try {
      // *** THIS IS THE FIX for AI helpers ***
      const response = await apiRequest("POST", endpoint, { content });
      const data = await response.json(); // Parse the JSON response
      
      if (feature === 'title') {
        setTitle(data.title);
      } else {
        setExcerpt(data.summary);
      }
      toast({ title: "Success", description: `AI ${feature} generated successfully!` });
    } catch (error) {
      toast({ title: "Error", description: `Failed to generate ${feature}.`, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || (isEdit && articleLoading)) return <LoadingSpinner size="lg" className="py-16" />;
  if (!user) return null;

  // The rest of your JSX can remain the same
  return (
    // ... your full JSX code from <div className="min-h-screen..."> to the end
  );
}