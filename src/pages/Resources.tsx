
import { Card } from "@/components/ui/card";
import { BookOpen, FileText, Video, Users } from "lucide-react";

const Resources = () => {
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          SustainWDN™ Resources
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-primary-600 mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Learning Materials</h3>
            <p className="text-gray-600 mb-4">
              Access comprehensive guides and tutorials for sustainable career development.
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-primary-600 mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Career Templates</h3>
            <p className="text-gray-600 mb-4">
              Download resume templates and career planning documents.
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-primary-600 mb-4">
              <Video className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Video Training</h3>
            <p className="text-gray-600 mb-4">
              Watch expert-led sessions on sustainable career paths.
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-primary-600 mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Forum</h3>
            <p className="text-gray-600 mb-4">
              Connect with other professionals in sustainable careers.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Resources;
