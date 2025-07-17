import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Eye, LogOut, Shield, FileText, Clock, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Article, Admin } from "@shared/schema";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("/api/auth/me");
        setAdmin(response);
      } catch (error) {
        setLocation("/admin");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setLocation]);

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
    enabled: !!admin,
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/articles/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: "Article Deleted",
        description: "The article has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/admin");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteArticle = (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access the admin dashboard.
            <Link href="/admin" className="ml-2 text-red-600 hover:underline">
              Login here
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">RedNews Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {admin.name}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Total Articles</p>
                  <p className="text-3xl font-bold">{articles?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Published</p>
                  <p className="text-3xl font-bold">
                    {articles?.filter(a => a.published).length || 0}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Drafts</p>
                  <p className="text-3xl font-bold">
                    {articles?.filter(a => !a.published).length || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Management */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-red-600" />
                Article Management
              </CardTitle>
              <Link href="/admin/articles/new">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {articlesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading articles...</p>
              </div>
            ) : !articles || articles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No articles yet</p>
                <p>Create your first article to get started.</p>
                <Link href="/admin/articles/new" className="mt-4 inline-block">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Article
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {article.excerpt ? article.excerpt.slice(0, 100) + "..." : "No excerpt"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={article.published ? "default" : "secondary"}
                            className={article.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {article.published ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(article.createdAt!).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/articles/${article.slug}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/articles/${article.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}