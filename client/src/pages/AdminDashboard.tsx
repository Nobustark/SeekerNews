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
function ArticleManagement() {
  const { data: articles, isLoading } = useQuery<Article[]>({ queryKey: ["/api/admin/articles"] });
  // ... (deleteArticleMutation and handleDeleteArticle logic remains the same)

  if (isLoading) return <div>Loading articles...</div>;

  return (
    <Card>
      <CardHeader className="border-b"><div className="flex justify-between items-center"><CardTitle className="flex items-center"><BookOpen className="w-5 h-5 mr-2" />Article Management</CardTitle><Link href="/admin/articles/new"><Button><Plus className="w-4 h-4 mr-2" />New Article</Button></Link></div></CardHeader>
      <CardContent className="p-0">
        {/* ... The entire articles table JSX remains the same as before ... */}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null); // Use 'any' for now to include role
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        const adminData = await response.json();
        setAdmin(adminData);
      } catch (error) {
        setLocation("/admin");
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    // ... (logout logic remains the same)
  };

  if (!admin) return <div>Loading...</div>; // Simple loading state

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center"><Shield className="w-8 h-8 text-red-600 mr-3" /><h1 className="text-2xl font-bold text-gray-800">TheSeeker Admin</h1></div>
            <div className="flex items-center space-x-4"><span className="text-gray-600">Welcome, {admin.name}</span><Button onClick={handleLogout} variant="outline" size="sm"><LogOut className="w-4 h-4 mr-2" />Logout</Button></div>
          </div>
        </div>
      </div>

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