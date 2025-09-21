import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { X, CloudUpload, Trash2, Send, Sparkles, Brain } from "lucide-react";
import type { Article } from "@shared/schema";
import { categories } from "@shared/schema"; // Ensure this is imported

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ArticleForm = () => {
  const [isEditMatch, params] = useRoute("/admin/articles/:id/edit");
  const isEdit = isEditMatch && params?.id !== undefined;
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
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<Article['category']>("Breaking");
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Auth and initial author setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setLocation("/admin");
      } else {
        setUser(currentUser);
        // Set author only if it hasn't been set by an existing article yet
        if (!isEdit) {
            setAuthor(currentUser.displayName || currentUser.email || "Admin");
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [setLocation, isEdit]);

  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: [`admin-article-${articleId}`],
    queryFn: () => apiRequest("GET", `/api/admin/articles/${articleId}`).then(res => res.json()),
    enabled: !!user && !!articleId,
  });

  // Populate form for editing
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setContent(article.content);
      setExcerpt(article.excerpt || "");
      setImageUrl(article.imageUrl || "");
      setPublished(article.published);
      setAuthor(article.author);
      setCategory(article.category);
    }
  }, [article]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !isEdit) {
      const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, isEdit]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles-list"] });
      toast({
        title: isEdit ? "Article Updated" : "Article Created",
        description: "Your changes have been saved successfully.",
      });
      setLocation("/admin/dashboard");
    },
    onError: (err: any) => {
      toast({
        title: isEdit ? "Update Failed" : "Create Failed",
        description: err.message || "There was an error saving the article. Please try again.",
        variant: "destructive",
      });
    },
  };

  const createArticleMutation = useMutation({
    mutationFn: (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => apiRequest("POST", "/api/admin/articles", articleData),
    ...mutationOptions,
  });

  const updateArticleMutation = useMutation({
    mutationFn: (articleData: Partial<Article>) => apiRequest("PUT", `/api/admin/articles/${articleId}`, articleData),
    ...mutationOptions,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !author || !category) {
        toast({ title: "Missing Fields", description: "Please fill out all required fields.", variant: "destructive" });
        return;
    };

    let finalSlug = slug;
    if (!isEdit) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    const articleData = { title, slug: finalSlug, content, excerpt, imageUrl, published, author, category };

    if (isEdit) {
      updateArticleMutation.mutate(articleData);
    } else {
      createArticleMutation.mutate(articleData);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast({ title: "Image Upload Error", description: "Cloudinary is not configured.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    toast({ title: "Uploading Image...", description: "Please wait." });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST", body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setImageUrl(data.secure_url);
      toast({ title: "Image Upload Successful", description: "The image is now linked to your article." });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({ title: "Image Upload Failed", description: "There was an error uploading your image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAiFeature = async (feature: 'title' | 'summary') => {
    if (!content) return;
    setIsGenerating(true);
    const endpoint = feature === 'title' ? "/api/admin/ai/generate-title" : "/api/admin/ai/generate-summary";
    try {
      const response = await apiRequest("POST", endpoint, { content });
      const data = await response.json();
      if (feature === 'title') setTitle(data.title); else setExcerpt(data.summary);
      toast({ title: "Success", description: `AI ${feature} generated successfully!` });
    } catch (error) {
      toast({ title: "Error", description: `Failed to generate ${feature}.`, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || (isEdit && articleLoading)) return <LoadingSpinner size="lg" className="py-16" />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Article" : "Create New Article"}</h1>
            <Button variant="ghost" onClick={() => setLocation("/admin/dashboard")} className="text-gray-600 hover:text-gray-800"><X className="w-5 h-5" /></Button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white rounded-xl shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- NEW FORM LAYOUT --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Article Title *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleAiFeature('title')} disabled={!content || isGenerating} className="text-purple-600 border-purple-600 hover:bg-purple-50"><Brain className="w-4 h-4 mr-1" />{isGenerating ? "Generating..." : "AI Title"}</Button>
                    </div>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter article title" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">URL Slug</Label>
                    <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Auto-generated from title" className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="author" className="text-sm font-semibold text-gray-700">Author Name *</Label>
                    <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Enter author's name" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category *</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as Article['category'])}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-semibold text-gray-700">Article Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <input type="file" id="image" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                  {imageUrl ? (
                    <div className="space-y-4">
                      <img src={imageUrl} alt="Article preview" className="max-w-full h-48 object-cover rounded-lg mx-auto" />
                      <Button type="button" variant="outline" onClick={() => setImageUrl("")} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 mr-2" />Remove Image</Button>
                    </div>
                  ) : (
                    <div className="cursor-pointer" onClick={() => document.getElementById('image')?.click()}>
                      <CloudUpload className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                      {isUploading ? <p className="text-gray-600">Uploading...</p> : <p className="text-gray-600">Click to upload an image</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-700">Article Excerpt</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAiFeature('summary')} disabled={!content || isGenerating} className="text-purple-600 border-purple-600 hover:bg-purple-50"><Sparkles className="w-4 h-4 mr-1" />{isGenerating ? "Generating..." : "AI Summary"}</Button>
                </div>
                <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary of the article (optional)" rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-semibold text-gray-700">Article Content *</Label>
                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your article content here..." rows={15} required />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <Label htmlFor="published" className="text-sm text-gray-700">Publish article immediately</Label>
              </div>

              <div className="flex items-center justify-end pt-6 space-x-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/admin/dashboard")}>Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold" disabled={createArticleMutation.isPending || updateArticleMutation.isPending}>
                  {createArticleMutation.isPending || updateArticleMutation.isPending ? "Saving..." : <><Send className="w-4 h-4 mr-2" />{isEdit ? "Update Article" : "Publish Article"}</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
export default ArticleForm;