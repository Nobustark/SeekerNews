import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Search, Menu, Bell, User, Flame, Globe, Zap, Briefcase, TrendingUp, Heart, Play, Atom, Landmark } from "lucide-react";
import { useState } from "react";
import { categories as importedCategories } from "@shared/schema"; // Import the source of truth

// Helper object to map category names to icons and colors
const categoryStyles: { [key: string]: { icon: React.ElementType; color: string } } = {
  Breaking: { icon: Flame, color: "text-red-600" },
  World: { icon: Globe, color: "text-blue-600" },
  Tech: { icon: Zap, color: "text-purple-600" },
  Business: { icon: Briefcase, color: "text-green-600" },
  Sports: { icon: TrendingUp, color: "text-orange-600" },
  Health: { icon: Heart, color: "text-pink-600" },
  Entertainment: { icon: Play, color: "text-indigo-600" },
  // Add new categories here to give them an icon
  Science: { icon: Atom, color: "text-teal-600" },
  Politics: { icon: Landmark, color: "text-gray-700" },
  // A default for any categories not listed above
  Default: { icon: Flame, color: "text-gray-500" },
};

export default function Navigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Now we create the menu items dynamically
  const categoryMenuItems = importedCategories.map(name => {
    const style = categoryStyles[name] || categoryStyles.Default;
    return {
      name,
      ...style,
      href: `/category/${name.toLowerCase()}`
    };
  });

  return (
    <>
      {/* Top Header */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Flame className="w-4 h-4 mr-1" />
                BREAKING: Latest news updates every hour
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Tuesday, January 8, 2025</span>
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-lg border-b-2 border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="bg-red-600 text-white p-2 rounded-lg mr-3">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">TheSeeker</h1>
                    <p className="text-xs text-gray-500 -mt-1">Seek Expose Empower</p>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/">
                <span className={`text-gray-700 hover:text-red-600 transition-colors cursor-pointer font-medium ${location === '/' ? 'text-red-600 font-semibold' : ''}`}>
                  Home
                </span>
              </Link>
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search news..." 
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
              </div>
              <Link href="/admin">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <Button 
                variant="ghost" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Menu (NOW DYNAMIC) */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-6 overflow-x-auto">
                {categoryMenuItems.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link key={category.name} href={category.href}>
                      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white transition-colors cursor-pointer whitespace-nowrap">
                        <Icon className={`w-4 h-4 ${category.color}`} />
                        <span className="text-sm font-medium text-gray-700 hover:text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="hidden lg:flex items-center text-xs text-gray-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending Now
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu (NOW DYNAMIC) */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <Link href="/">
                <div className="block px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                  Home
                </div>
              </Link>
              <div className="space-y-2">
                {categoryMenuItems.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link key={category.name} href={category.href}>
                      <div className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                        <Icon className={`w-4 h-4 ${category.color}`} />
                        <span>{category.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link href="/admin">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}