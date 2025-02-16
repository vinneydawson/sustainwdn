
import { Card } from "@/components/ui/card";
import { Target, BookOpen, Award } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Your SustainWDN™ Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-primary-600 mb-4">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress</h3>
            <p className="text-2xl font-bold text-primary-600">60%</p>
            <p className="text-gray-600">Career path completion</p>
          </Card>

          <Card className="p-6">
            <div className="text-primary-600 mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Resources</h3>
            <p className="text-2xl font-bold text-primary-600">12</p>
            <p className="text-gray-600">Materials completed</p>
          </Card>

          <Card className="p-6">
            <div className="text-primary-600 mb-4">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Achievements</h3>
            <p className="text-2xl font-bold text-primary-600">5</p>
            <p className="text-gray-600">Milestones reached</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-semibold">Completed Resource: Green Technology Basics</p>
                <p className="text-sm text-gray-600">2 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-semibold">Achievement Unlocked: Fast Learner</p>
                <p className="text-sm text-gray-600">5 days ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
