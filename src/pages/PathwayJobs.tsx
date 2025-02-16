
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type JobLevel = "entry" | "mid" | "advanced";

interface JobRole {
  id: string;
  pathway_id: string;
  title: string;
  description: {
    content: string;
  };
  level: string;
  salary: string | null;
  certificates_degrees: any | null;
  tasks_responsibilities: any | null;
  licenses: string[] | null;
  job_projections: string[] | null;
  resources: { content: string; }[] | null;
  related_jobs: { content: string; }[] | null;
  projections: string | null;
}

interface CareerPathway {
  id: string;
  title: string;
  description: {
    content: string;
  };
  icon: string;
  created_at: string;
  updated_at: string;
  requirements: { content: string; }[] | null;
  salary_range: string | null;
  skills: string[] | null;
}

const PathwayJobs = () => {
  const { pathwayId } = useParams<{ pathwayId: string }>();
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | null>(null);

  const { data: pathway, isLoading: isLoadingPathway } = useQuery({
    queryKey: ["career-pathway", pathwayId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_pathways")
        .select("*")
        .eq("id", pathwayId)
        .single();
      
      if (error) throw error;
      
      // Transform the data to match our interface
      return {
        ...data,
        description: {
          content: typeof data.description === 'string' 
            ? data.description 
            : typeof data.description === 'object' && data.description !== null
              ? 'content' in data.description
                ? (data.description as { content: string }).content
                : JSON.stringify(data.description)
              : String(data.description)
        },
        requirements: Array.isArray(data.requirements)
          ? data.requirements.map(req =>
              typeof req === 'string' ? { content: req } : req
            )
          : null
      } as CareerPathway;
    },
    enabled: !!pathwayId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
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

      // Transform the data to match our interface
      return (data || []).map(job => ({
        ...job,
        description: {
          content: typeof job.description === 'string'
            ? job.description
            : typeof job.description === 'object' && job.description !== null
              ? 'content' in job.description
                ? (job.description as { content: string }).content
                : JSON.stringify(job.description)
              : String(job.description)
        },
        resources: Array.isArray(job.resources)
          ? job.resources.map(res =>
              typeof res === 'string' ? { content: res } : res
            )
          : null,
        related_jobs: Array.isArray(job.related_jobs)
          ? job.related_jobs.map(rel =>
              typeof rel === 'string' ? { content: rel } : rel
            )
          : null
      })) as JobRole[];
    },
    enabled: !!pathwayId,
    staleTime: 1000 * 60 * 5,
  });

  const levels: Array<{ id: JobLevel; label: string }> = [
    { id: 'entry', label: 'Entry Level' },
    { id: 'mid', label: 'Mid Level' },
    { id: 'advanced', label: 'Advanced' }
  ];

  if (isLoadingPathway || isLoadingJobs) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-full max-w-2xl bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Pathway not found</h1>
          <Link to="/explore" className="text-primary-600 hover:text-primary-700">
            Return to Explore
          </Link>
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
          {pathway.title}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {pathway.description.content}
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={selectedLevel === null ? "outline" : "outline"}
            onClick={() => setSelectedLevel(null)}
            className={selectedLevel === null ? "bg-gray-200 font-medium border-gray-300 hover:bg-gray-300" : ""}
          >
            All Levels
          </Button>
          {levels.map((level) => (
            <Button
              key={level.id}
              variant={selectedLevel === level.id ? "outline" : "outline"}
              onClick={() => setSelectedLevel(level.id)}
              className={selectedLevel === level.id ? "bg-gray-200 font-medium border-gray-300 hover:bg-gray-300" : ""}
            >
              {level.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">{job.title}</h3>
              <p className="text-gray-600 mb-4 text-left">{job.description.content}</p>
              <p className="text-sm text-primary-600 mb-4 text-left">
                {job.level.charAt(0).toUpperCase() + job.level.slice(1)} Level
              </p>
              {job.salary && (
                <p className="text-sm text-gray-600 mb-4 text-left">
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
