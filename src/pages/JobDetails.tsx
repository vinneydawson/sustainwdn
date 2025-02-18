
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { JobHeader } from "@/components/job-details/JobHeader";
import { JobSection } from "@/components/job-details/JobSection";
import { JobListSection } from "@/components/job-details/JobListSection";
import { JobRole } from "@/types/job";
import { Json } from "@/integrations/supabase/types";

type JobRouteParams = {
  jobId: string;
}

interface TasksResponsibilities {
  [key: string]: {
    content: string;
  };
}

interface CertificatesDegreesData {
  education: string[];
  certificates: string[];
  experience: string[];
  [key: string]: Json;
}

const transformContent = (value: any): { content: string } => {
  if (typeof value === 'string') {
    return { content: value };
  }
  if (typeof value === 'object' && value !== null && 'content' in value) {
    return value as { content: string };
  }
  return { content: String(value) };
};

const parseTasksList = (tasks: TasksResponsibilities | null): string[] => {
  if (!tasks) return [];
  if (typeof tasks === 'object') {
    return Object.values(tasks).map(task => 
      typeof task === 'string' ? task : task.content
    );
  }
  return [];
};

const parseArrayContent = (arr: any[] | null): string[] => {
  if (!arr) return [];
  return arr.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && 'content' in item) return item.content;
    return String(item);
  }).filter(Boolean);
};

const JobDetails = () => {
  const { jobId } = useParams<JobRouteParams>();
  const navigate = useNavigate();

  const { data: job, isLoading: isLoadingJob, error } = useQuery({
    queryKey: ["job-role", jobId],
    queryFn: async () => {
      if (!jobId) {
        console.error("No jobId provided");
        return null;
      }

      const { data: rawData, error: fetchError } = await supabase
        .from("job_roles")
        .select(`
          *,
          career_pathways (*)
        `)
        .eq('id', jobId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!rawData) return null;

      // Transform tasks into an array of strings
      const tasksContent = parseTasksList(rawData.tasks_responsibilities as TasksResponsibilities);

      // Transform certificates and degrees
      const certDegrees = rawData.certificates_degrees || {
        education: [],
        certificates: [],
        experience: []
      };

      const transformedJob = {
        ...rawData,
        description: transformContent(rawData.description),
        tasks_responsibilities: tasksContent,
        certificates_degrees: {
          education: Array.isArray(certDegrees.education) ? certDegrees.education : [],
          certificates: Array.isArray(certDegrees.certificates) ? certDegrees.certificates : [],
          experience: Array.isArray(certDegrees.experience) ? certDegrees.experience : []
        },
        resources: parseArrayContent(rawData.resources as any[]),
        related_jobs: parseArrayContent(rawData.related_jobs as any[]),
        career_pathways: rawData.career_pathways ? {
          ...rawData.career_pathways,
          description: transformContent(rawData.career_pathways.description),
          requirements: Array.isArray(rawData.career_pathways.requirements) 
            ? rawData.career_pathways.requirements.map(req => transformContent(req))
            : []
        } : null
      };

      return transformedJob;
    },
  });

  if (isLoadingJob) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Job</h1>
          <p className="text-gray-600 mb-4">There was an error loading the job details. Please try again.</p>
          <Button variant="default" onClick={() => navigate("/explore")}>
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4 py-12">
          <Link to="/explore" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Career Pathways
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-4">The job you're looking for could not be found.</p>
          <Button variant="default" onClick={() => navigate("/explore")}>
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <div className="container mx-auto px-4 py-12">
        <Link to="/explore" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Career Pathways
        </Link>
        
        <JobHeader job={job} />
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            <JobSection title="Overview">
              <p className="text-gray-600">{job.description.content}</p>
            </JobSection>

            {Array.isArray(job.tasks_responsibilities) && job.tasks_responsibilities.length > 0 && (
              <JobListSection title="Tasks + Responsibilities" items={job.tasks_responsibilities} />
            )}
            
            {job.certificates_degrees?.education?.length > 0 && (
              <JobListSection title="Education" items={job.certificates_degrees.education} />
            )}
            
            {job.certificates_degrees?.certificates?.length > 0 && (
              <JobListSection title="Certificates & Degrees" items={job.certificates_degrees.certificates} />
            )}
            
            {job.certificates_degrees?.experience?.length > 0 && (
              <JobListSection title="Work Experience" items={job.certificates_degrees.experience} />
            )}

            {job.salary && (
              <JobSection title="Salary">
                <p className="text-gray-600">{job.salary}</p>
              </JobSection>
            )}

            {job.projections && (
              <JobSection title="Job Projections">
                <p className="text-gray-600">{job.projections}</p>
              </JobSection>
            )}

            {job.resources?.length > 0 && (
              <JobListSection title="Resources" items={job.resources} />
            )}
            
            {job.related_jobs?.length > 0 && (
              <JobListSection title="Related Jobs" items={job.related_jobs} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
