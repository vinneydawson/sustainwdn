
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { JobHeader } from "@/components/job-details/JobHeader";
import { JobSection } from "@/components/job-details/JobSection";
import { JobListSection } from "@/components/job-details/JobListSection";
import { JobRole } from "@/types/job";
import { Json } from "@/integrations/supabase/types";

type JobRouteParams = {
  jobId: string;
}

interface CertificatesDegrees {
  education: string[];
  certificates: string[];
  experience: string[];
}

const isValidCertificatesDegrees = (value: Json | null): value is CertificatesDegrees => {
  if (!value || typeof value !== 'object') return false;
  const certDegrees = value as Record<string, unknown>;
  return (
    Array.isArray(certDegrees.education) &&
    Array.isArray(certDegrees.certificates) &&
    Array.isArray(certDegrees.experience)
  );
};

const JobDetails = () => {
  const { jobId } = useParams<JobRouteParams>();
  const navigate = useNavigate();

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job-role", jobId],
    queryFn: async () => {
      const { data: rawData, error } = await supabase
        .from("job_roles")
        .select(`
          *,
          career_pathways (*)
        `)
        .eq("id", jobId)
        .maybeSingle();
      
      if (error) throw error;
      if (!rawData) return null;

      // Transform career pathway data
      const transformedCareerPathway = rawData.career_pathways ? {
        ...rawData.career_pathways,
        description: typeof rawData.career_pathways.description === 'string'
          ? { content: rawData.career_pathways.description }
          : typeof rawData.career_pathways.description === 'object' && 'content' in rawData.career_pathways.description
            ? rawData.career_pathways.description
            : { content: JSON.stringify(rawData.career_pathways.description) },
        requirements: Array.isArray(rawData.career_pathways.requirements)
          ? rawData.career_pathways.requirements.map((req: any) =>
              typeof req === 'string' ? { content: req } : req
            )
          : null
      } : null;

      // Transform job role data
      const transformedJob = {
        ...rawData,
        description: typeof rawData.description === 'string'
          ? { content: rawData.description }
          : typeof rawData.description === 'object' && 'content' in rawData.description
            ? rawData.description
            : { content: JSON.stringify(rawData.description) },
        resources: Array.isArray(rawData.resources)
          ? rawData.resources.map((res: any) =>
              typeof res === 'string' ? { content: res } : res
            )
          : null,
        related_jobs: Array.isArray(rawData.related_jobs)
          ? rawData.related_jobs.map((rel: any) =>
              typeof rel === 'string' ? { content: rel } : rel
            )
          : null,
        tasks_responsibilities: rawData.tasks_responsibilities
          ? Object.fromEntries(
              Object.entries(rawData.tasks_responsibilities).map(([key, value]) => [
                key,
                typeof value === 'string' ? { content: value } : value
              ])
            )
          : null,
        certificates_degrees: isValidCertificatesDegrees(rawData.certificates_degrees)
          ? rawData.certificates_degrees
          : { education: [], certificates: [], experience: [] },
        career_pathways: transformedCareerPathway
      };

      return transformedJob as JobRole;
    },
    enabled: !!jobId,
  });

  if (isLoadingJob) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <Button variant="default" onClick={() => navigate("/explore")}>
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const tasks = job.tasks_responsibilities ? Object.values(job.tasks_responsibilities).map(t => t.content) : [];
  const education = job.certificates_degrees?.education || [];
  const certificates = job.certificates_degrees?.certificates || [];
  const experience = job.certificates_degrees?.experience || [];
  const resources = job.resources?.map(r => r.content) || [];
  const relatedJobs = job.related_jobs?.map(r => r.content) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <JobHeader job={job} />
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            <JobSection title="Overview">
              <p className="text-gray-600">{job.description.content}</p>
            </JobSection>

            <JobListSection title="Tasks + Responsibilities" items={tasks} />
            <JobListSection title="Education" items={education} />
            <JobListSection title="Certificates & Degrees" items={certificates} />
            <JobListSection title="Work Experience" items={experience} />

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

            <JobListSection title="Resources" items={resources} />
            <JobListSection title="Related Jobs" items={relatedJobs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
