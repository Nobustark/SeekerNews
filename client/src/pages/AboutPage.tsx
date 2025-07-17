import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Globe, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-red-600 text-white p-4 rounded-full">
              <span className="text-2xl font-bold">R</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About TheSeeker</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted source for breaking news and in-depth analysis. We deliver accurate, 
            timely, and comprehensive coverage of the stories that matter most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-t-4 border-red-600">
            <CardContent className="p-6">
              <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
              <p className="text-gray-600">Professional journalists and editors committed to quality reporting</p>
            </CardContent>
          </Card>

          <Card className="text-center border-t-4 border-red-600">
            <CardContent className="p-6">
              <Globe className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Coverage</h3>
              <p className="text-gray-600">Comprehensive news from around the world, 24/7</p>
            </CardContent>
          </Card>

          <Card className="text-center border-t-4 border-red-600">
            <CardContent className="p-6">
              <Zap className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Breaking News</h3>
              <p className="text-gray-600">Real-time updates on developing stories and events</p>
            </CardContent>
          </Card>

          <Card className="text-center border-t-4 border-red-600">
            <CardContent className="p-6">
              <Award className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trusted Source</h3>
              <p className="text-gray-600">Accurate, fact-checked reporting you can rely on</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              TheSeeker is dedicated to providing accurate, unbiased, and timely news coverage that keeps 
              our readers informed about the world around them. We believe in the power of journalism 
              to educate, inspire, and drive positive change.
            </p>
            <p className="text-gray-600">
              Our team of experienced journalists and editors work around the clock to bring you the 
              most important stories from technology, health, sports, business, and environmental news.
            </p>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Values</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Badge className="bg-red-600 text-white mr-3 mt-1">1</Badge>
                <div>
                  <h3 className="font-semibold text-gray-800">Accuracy</h3>
                  <p className="text-gray-600">Every story is fact-checked and verified before publication</p>
                </div>
              </div>
              <div className="flex items-start">
                <Badge className="bg-red-600 text-white mr-3 mt-1">2</Badge>
                <div>
                  <h3 className="font-semibold text-gray-800">Transparency</h3>
                  <p className="text-gray-600">We clearly source our information and correct any errors</p>
                </div>
              </div>
              <div className="flex items-start">
                <Badge className="bg-red-600 text-white mr-3 mt-1">3</Badge>
                <div>
                  <h3 className="font-semibold text-gray-800">Independence</h3>
                  <p className="text-gray-600">Our editorial decisions are free from external influence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}