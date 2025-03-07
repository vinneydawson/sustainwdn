
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
    return value as { content: string };
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
  });

  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ["pathway-jobs", pathwayId, selectedLevel],
    queryFn: async () => {
      console.log("Fetching jobs for pathway:", pathwayId, "with level:", selectedLevel);
      
      let query = supabase
        .from("job_roles")
        .select(`
          *,
          career_pathways (*)
        `)
        .eq("pathway_id", pathwayId)
        .order('display_order', { ascending: true });
      
      if (selectedLevel) {
        query = query.eq("level", selectedLevel);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }

      console.log("Raw jobs data:", data);

      const transformedJobs = (data || []).map(job => ({
        ...job,
        description: transformJsonToContent(job.description),
        resources: Array.isArray(job.resources)
          ? job.resources.map(res => transformJsonToContent(res))
          : [],
        related_jobs: Array.isArray(job.related_jobs)
          ? job.related_jobs.map(rel => transformJsonToContent(rel))
          : [],
        tasks_responsibilities: job.tasks_responsibilities 
          ? Object.fromEntries(
              Object.entries(job.tasks_responsibilities as Record<string, any>).map(([key, value]) => [
                key,
                transformJsonToContent(value)
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
          : { education: [], certificates: [], experience: [] },
        career_pathways: job.career_pathways ? {
          ...job.career_pathways,
          description: transformJsonToContent(job.career_pathways.description),
          requirements: Array.isArray(job.career_pathways.requirements)
            ? job.career_pathways.requirements.map(req => transformJsonToContent(req))
            : null
        } : null
      })) as JobRole[];

      console.log("Transformed jobs data:", transformedJobs);
      return transformedJobs;
    },
    enabled: !!pathwayId,
  });

  if (isLoadingPathway || isLoadingJobs) {
    return <PathwayJobsSkeleton />;
  }

  if (!pathway) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Pathway not found</h1>
          <Link to="/explore" className="text-primary-600 hover:text-primary-700">
            Return to Explore
          </Link>
        </div>
      </div>
    );
  }

  console.log("Rendering jobs:", jobs);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <PathwayJobCard key={job.id} job={job} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No jobs found for this pathway{selectedLevel ? ` at ${selectedLevel} level` : ''}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathwayJobs;
