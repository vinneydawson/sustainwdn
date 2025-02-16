
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Target, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { FileUploadSection } from "@/components/dashboard/FileUploadSection";
import { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth?signup=false');
        return;
      }
      setUser(user);
    };

    getUser();
  }, [navigate]);

  if (!user) return null;

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full">
            <ProfileSection user={user} />
          </div>
          <div className="w-full">
            <FileUploadSection user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
