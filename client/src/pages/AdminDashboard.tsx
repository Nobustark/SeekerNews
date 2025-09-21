// THE NEW, UPGRADED, MULTI-USER code for client/src/pages/AdminDashboard.tsx

import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, LogOut, Shield, FileText, BookOpen, Users, UserCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Article, User } from "@shared/schema";

// This is a new sub-component for the user management table
function UserManagement() {
  const { data: users, isLoading } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveUserMutation = useMutation({
    mutationFn: (uid: string) => apiRequest("PUT", `/api/admin/users/${uid}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User Approved", description: "The user can now post articles." });
    },
    onError: () => {
      toast({ title: "Approval Failed", variant: "destructive" });
    },
  });

  if (isLoading) return <div>Loading users...</div>;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2" />User Management</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.firebaseUid}>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4"><Badge variant={user.role === 'admin' ? 'default' : user.role === 'author' ? 'secondary' : 'outline'}>{user.role}</Badge></td>
                  <td className="px-6 py-4">
                    {user.role === 'pending' && (
                      <Button size="sm" onClick={() => approveUserMutation.mutate(user.firebaseUid)} disabled={approveUserMutation.isPending}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// This is the existing component for the articles table
// This is the existing component for the articles table
function ArticleManagement() {
  const { data: articles, isLoading } = useQuery<Article[]>({ 
    queryKey: ["/api/admin/articles"] 
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({ title: "Article Deleted", description: "The article has been successfully removed." });
    },
    onError: () => {
      toast({ title: "Deletion Failed", variant: "destructive" });
    },
  });

  const handleDeleteArticle = (id: number) => {
    if (window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      deleteArticleMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading articles...</div>;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center"><BookOpen className="w-5 h-5 mr-2" />Article Management</CardTitle>
          <Link href="/admin/articles/new">
            <Button><Plus className="w-4 h-4 mr-2" />New Article</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles && articles.length > 0 ? (
                articles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{article.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={article.published ? "default" : "secondary"}>
                        {article.published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setLocation(`/articles/${article.slug}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setLocation(`/admin/articles/${article.id}/edit`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteArticle(article.id)} disabled={deleteArticleMutation.isPending}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    You haven't created any articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="articles" className="w-full">
          <TabsList>
            <TabsTrigger value="articles">Article Management</TabsTrigger>
            {/* Show User Management tab only if the logged-in user is a super-admin */}
            {admin.role === 'admin' && (
              <TabsTrigger value="users">User Management</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="articles" className="mt-4">
            <ArticleManagement />
          </TabsContent>
          {admin.role === 'admin' && (
            <TabsContent value="users" className="mt-4">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}