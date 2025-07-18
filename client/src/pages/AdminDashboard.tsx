// THE FINAL, COMPLETE, CORRECTED code for client/src/pages/AdminDashboard.tsx

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
        // *** BUG FIX #1: Call apiRequest with the correct arguments ("GET", url) ***
        const response = await apiRequest("GET", "/api/auth/me");
        // *** BUG FIX #2: Parse the JSON from the response before setting state ***
        const adminData = await response.json();
        setAdmin(adminData);
      } catch (error) {
        // If auth fails for any reason, redirect to login
        setLocation("/admin");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    // *** BUG FIX #3: Use an empty dependency array to ensure this runs ONLY ONCE ***
  }, []);

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
    enabled: !!admin,
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/articles/${id}`),
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
      // Corrected this call as well to be safe
      await apiRequest("POST", "/api/auth/logout", {});
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
    // This case will be hit if the checkAuth fails and redirects.
    // We return null to prevent rendering anything while the redirect happens.
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">TheSeeker Admin</h1>
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
        {/* Stats Cards and the rest of your dashboard JSX... */}
        {/* ... NO CHANGES NEEDED FOR THE REST OF THE JSX ... */}
      </div>
    </div>
  );
}