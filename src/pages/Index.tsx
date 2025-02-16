
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, BookOpen, Target } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to SustainWDN™
            <span className="block text-primary-600 mt-2">Your Future in Sustainable Careers</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join SustainWDN™'s community of forward-thinking professionals and discover meaningful career paths that shape a sustainable future.
          </p>
          <Link to="/explore">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 rounded-lg text-lg shadow-lg transition-all hover:shadow-xl">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 backdrop-blur-sm bg-white/50 border border-gray-100 shadow-lg hover:shadow-xl transition-all">
            <div className="text-primary-600 mb-4">
              <Leaf className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2">SustainWDN™ Pathways</h3>
            <p className="text-gray-600">
              Explore curated career paths that contribute to environmental sustainability and social responsibility.
            </p>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-white/50 border border-gray-100 shadow-lg hover:shadow-xl transition-all">
            <div className="text-primary-600 mb-4">
              <BookOpen className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-600">
              Access SustainWDN™'s comprehensive resources and structured learning paths tailored to your goals.
            </p>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-white/50 border border-gray-100 shadow-lg hover:shadow-xl transition-all">
            <div className="text-primary-600 mb-4">
              <Target className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">
              Monitor your SustainWDN™ journey with interactive tools and meaningful milestones.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto backdrop-blur-sm bg-white/50 p-8 rounded-2xl border border-gray-100 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Join SustainWDN™ Today</h2>
          <p className="text-gray-600 mb-6">
            Be part of the growing SustainWDN™ community shaping the future of sustainable careers.
          </p>
          <Link to="/auth?signup=true">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-lg">
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
