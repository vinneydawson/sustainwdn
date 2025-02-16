
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

type JobLevel = "entry" | "mid" | "advanced";

interface CareerPathway {
  id: string;
  title: string;
  description: string;
  level: JobLevel;
  salary_range: string | null;
  requirements: string[] | null;
  skills: string[] | null;
  icon: string;
}

const Explore = () => {
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | null>(null);

  const { data: careerPaths, isLoading } = useQuery({
    queryKey: ["career-paths", selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from("career_pathways")
        .select("*");
      
      if (selectedLevel) {
        query = query.eq('level', selectedLevel);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CareerPathway[];
    },
  });

  const levels: Array<{ id: JobLevel; label: string }> = [
    { id: 'entry', label: 'Entry Level' },
    { id: 'mid', label: 'Mid Level' },
    { id: 'advanced', label: 'Advanced' }
  ];

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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Explore Sustainable Pathways
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover career opportunities in sustainability and clean energy
        </p>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={selectedLevel === null ? "default" : "outline"}
            onClick={() => setSelectedLevel(null)}
          >
            All Levels
          </Button>
          {levels.map((level) => (
            <Button
              key={level.id}
              variant={selectedLevel === level.id ? "default" : "outline"}
              onClick={() => setSelectedLevel(level.id)}
            >
              {level.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <p className="text-gray-600 mb-4">{path.description}</p>
                {path.salary_range && (
                  <p className="text-sm text-primary-600 mb-2">
                    Salary Range: {path.salary_range}
                  </p>
                )}
                {path.requirements && path.requirements.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-semibold mb-1">Requirements:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {path.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {path.skills && path.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Key Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Explore;
