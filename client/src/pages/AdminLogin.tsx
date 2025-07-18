// The COMPLETE AND CORRECTED code for client/src/pages/adminlogin.tsx

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerWithFirebase, loginWithFirebase } from "@/components/auth"; // We only need these now
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiRequest("GET", "/api/auth/me");
        setLocation("/admin/dashboard");
      } catch (error) {
        // Not authenticated
      }
    };
    checkAuth();
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authFn = isRegistering ? registerWithFirebase : loginWithFirebase;
      const { user } = await authFn(email, password);

      if (!user) {
        throw new Error("Authentication failed, user not found.");
      }

      const token = await user.getIdToken();

      await fetch('/api/auth/session-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast({
        title: isRegistering ? "Registration Successful" : "Login Successful",
        description: "Welcome to the admin dashboard!",
      });

      setLocation("/admin/dashboard");
    } catch (error: any) {
      console.error("Firebase Auth error:", error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="bg-white rounded-xl shadow-lg border-t-4 border-red-600">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-600 text-white p-3 rounded-full">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              {isRegistering ? "Create Admin Account" : "Admin Login"}
            </CardTitle>
            <p className="text-gray-600">
              {isRegistering ? "Register for TheSeeker admin access" : "Access TheSeeker admin dashboard"}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  "Processing..."
                ) : isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                {isRegistering ? "Already have an account? Sign in" : "Need an admin account? Register here"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}