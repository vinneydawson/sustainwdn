
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Wind, Sun, Cpu, LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Map string icon names to Lucide components
const iconMap: { [key: string]: LucideIcon } = {
  Leaf,
  Wind,
  Sun,
  Cpu,
};

interface CareerPathway {
  id: string;
  title: string;
  description: string;
  level: string;
  salary_range: string | null;
  requirements: string[] | null;
  skills: string[] | null;
  icon: string;
}

const Explore = () => {
  const { data: careerPaths, isLoading } = useQuery({
    queryKey: ["career-paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_pathways")
        .select("*");
      
      if (error) throw error;
      return data as CareerPathway[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Explore Sustainable Careers
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {careerPaths?.map((path) => {
            const IconComponent = iconMap[path.icon];
            return (
              <Card key={path.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-primary-600 mb-4">
                  {IconComponent && <IconComponent className="h-8 w-8" />}
                </div>
                <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                <p className="text-sm text-primary-600 mb-2">
                  {path.level.charAt(0).toUpperCase() + path.level.slice(1)} Level
                </p>
                <p className="text-gray-600 mb-2">{path.description}</p>
                {path.salary_range && (
                  <p className="text-sm text-primary-600">
                    Salary Range: {path.salary_range}
                  </p>
                )}
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
