
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type JobLevel = "entry" | "mid" | "advanced";

interface JobRole {
  id: string;
  pathway_id: string;
  title: string;
  description: string;
  level: JobLevel;
  salary: string | null;
}

interface CareerPathway {
  id: string;
  title: string;
  description: string;
  level: string;
  icon: string;
}

const PathwayJobs = () => {
  const { pathwayId } = useParams();
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | null>(null);

  const { data: pathway } = useQuery({
    queryKey: ["career-pathway", pathwayId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_pathways")
        .select("*")
        .eq("id", pathwayId)
        .single();
      if (error) throw error;
      return data as CareerPathway;
    },
  });

  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["pathway-jobs", pathwayId, selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from("job_roles")
        .select("*")
        .eq("pathway_id", pathwayId);
      
      if (selectedLevel) {
        query = query.eq("level", selectedLevel);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as JobRole[];
    },
  });

  const levels: Array<{ id: JobLevel; label: string }> = [
    { id: 'entry', label: 'Entry Level' },
    { id: 'mid', label: 'Mid Level' },
    { id: 'advanced', label: 'Advanced' }
  ];

  if (isLoadingJobs) {
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
        <Link to="/explore" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Career Pathways
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {pathway?.title}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {pathway?.description}
        </p>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={selectedLevel === null ? "outline" : "outline"}
            onClick={() => setSelectedLevel(null)}
            className={selectedLevel === null ? "bg-[#7E69AB] text-white hover:bg-[#7E69AB]/90" : ""}
          >
            All Levels
          </Button>
          {levels.map((level) => (
            <Button
              key={level.id}
              variant={selectedLevel === level.id ? "outline" : "outline"}
              onClick={() => setSelectedLevel(level.id)}
              className={selectedLevel === level.id ? "bg-[#7E69AB] text-white hover:bg-[#7E69AB]/90" : ""}
            >
              {level.label}
            </Button>
          ))}
        </div>

        {/* Job Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">{job.title}</h3>
              <p className="text-gray-600 mb-4">{job.description}</p>
              <p className="text-sm text-primary-600 mb-4">
                {job.level.charAt(0).toUpperCase() + job.level.slice(1)} Level
              </p>
              {job.salary && (
                <p className="text-sm text-gray-600 mb-4">
                  Salary: {job.salary}
                </p>
              )}
              <Link to={`/explore/job/${job.id}`}>
                <Button size="sm" className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                  View Job Details
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PathwayJobs;
