
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Banknote, Fish, Wind, Cpu, Droplet, LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

// Map string icon names to Lucide components
const iconMap: { [key: string]: LucideIcon } = {
  Fish,
  Wind,
  Banknote,
  Cpu,
  Droplet,
};

type JobLevel = "entry" | "mid" | "advanced";

interface CareerPathway {
  id: string;
  title: string;
  description: string;
  level: JobLevel;
  icon: string;
}

interface JobRole {
  id: string;
  pathway_id: string;
  title: string;
  description: string;
  level: JobLevel;
  tasks: string[] | null;
  education: string[] | null;
  salary: string | null;
}

const Explore = () => {
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);

  const { data: pathways, isLoading: isLoadingPathways } = useQuery({
    queryKey: ["career-pathways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_pathways")
        .select("*");
      if (error) throw error;
      return data as CareerPathway[];
    },
  });

  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["job-roles", selectedPathway, selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from("job_roles")
        .select(`
          *,
          career_pathways (*)
        `);
      
      if (selectedPathway) {
        query = query.eq('pathway_id', selectedPathway);
      }
      if (selectedLevel) {
        query = query.eq('level', selectedLevel);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as JobRole[];
    },
    enabled: true,
  });

  const levels: Array<{ id: JobLevel; label: string }> = [
    { id: 'entry', label: 'Entry Level' },
    { id: 'mid', label: 'Mid Level' },
    { id: 'advanced', label: 'Advanced' }
  ];

  if (isLoadingPathways || isLoadingJobs) {
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

        {/* Career Pathways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pathways?.map((pathway) => {
            const IconComponent = iconMap[pathway.icon];
            const pathwayJobs = jobs?.filter(job => job.pathway_id === pathway.id) || [];
            return (
              <Card key={pathway.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  {IconComponent && <IconComponent className="h-8 w-8 text-primary-600" />}
                  <h3 className="text-xl font-semibold">{pathway.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{pathway.description}</p>
                <div className="space-y-4">
                  {pathwayJobs.map((job) => (
                    <div key={job.id} className="border-t pt-4">
                      <h4 className="font-medium text-lg mb-2">{job.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                      <p className="text-sm text-primary-600">
                        {job.level.charAt(0).toUpperCase() + job.level.slice(1)} Level
                      </p>
                      {job.salary && (
                        <p className="text-sm text-gray-600 mt-1">
                          Salary: {job.salary}
                        </p>
                      )}
                      <Link to={`/explore/${job.id}`}>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Explore;
