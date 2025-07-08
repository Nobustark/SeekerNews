import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-red-600 text-white p-2 rounded-lg mr-3">
                <span className="text-xl font-bold">R</span>
              </div>
              <h3 className="text-2xl font-bold">RedNews</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted source for breaking news and in-depth analysis. Stay informed with the latest updates from around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Breaking News</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Technology</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Sports</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Business</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                contact@newshub.com
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                New York, NY 10001
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 NewsHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
