
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PathwayJobsSkeleton } from "@/components/pathway-jobs/PathwayJobsSkeleton";
import { PathwayJobCard } from "@/components/pathway-jobs/PathwayJobCard";
import { PathwayJobsFilter } from "@/components/pathway-jobs/PathwayJobsFilter";
import type { JobRole, CareerPathway } from "@/types/job";
import type { Json } from "@/integrations/supabase/types";

type JobLevel = "entry" | "mid" | "advanced";

const transformJsonToContent = (value: any): { content: string } => {
  if (typeof value === 'string') {
    return { content: value };
  }
  if (typeof value === 'object' && value !== null && 'content' in value) {
    return { content: String(value.content) };
  }
  return { content: JSON.stringify(value) };
};

const isValidCertificatesDegrees = (value: Json): value is {
  education?: string[];
  certificates?: string[];
  experience?: string[];
} => {
  return typeof value === 'object' && value !== null;
};

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
      
      return {
        ...data,
        description: transformJsonToContent(data.description),
        requirements: Array.isArray(data.requirements)
          ? data.requirements.map(req => transformJsonToContent(req))
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
        .eq("pathway_id", pathwayId)
        .order('display_order', { ascending: true });
      
      if (selectedLevel) {
        query = query.eq("level", selectedLevel);
      }
      
      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(job => ({
        ...job,
        description: transformJsonToContent(job.description),
        resources: Array.isArray(job.resources)
          ? job.resources.map(res => transformJsonToContent(res))
          : null,
        related_jobs: Array.isArray(job.related_jobs)
          ? job.related_jobs.map(rel => transformJsonToContent(rel))
          : null,
        tasks_responsibilities: job.tasks_responsibilities 
          ? Object.fromEntries(
              Object.entries(job.tasks_responsibilities as Record<string, Json>).map(([key, value]) => [
                key,
                typeof value === 'string' ? { content: value } : value
              ])
            )
          : null,
        certificates_degrees: isValidCertificatesDegrees(job.certificates_degrees)
          ? {
              education: Array.isArray(job.certificates_degrees.education)
                ? job.certificates_degrees.education
                : [],
              certificates: Array.isArray(job.certificates_degrees.certificates)
                ? job.certificates_degrees.certificates
                : [],
              experience: Array.isArray(job.certificates_degrees.experience)
                ? job.certificates_degrees.experience
                : []
            }
          : null
      })) as JobRole[];
    },
    enabled: !!pathwayId,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoadingPathway || isLoadingJobs) {
    return <PathwayJobsSkeleton />;
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

        <PathwayJobsFilter 
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <PathwayJobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PathwayJobs;
