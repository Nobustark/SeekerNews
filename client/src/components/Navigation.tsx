import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-800 cursor-pointer">NewsHub</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <span className={`text-gray-600 hover:text-gray-800 transition-colors cursor-pointer ${location === '/' ? 'font-semibold' : ''}`}>
                Home
              </span>
            </Link>
            <Link href="/admin">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
