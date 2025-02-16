import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { JobHeader } from "@/components/job-details/JobHeader";
import { JobSection } from "@/components/job-details/JobSection";
import { JobListSection } from "@/components/job-details/JobListSection";
import { JobRole } from "@/types/job";

type JobRouteParams = {
  jobId: string;
}

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

      const data = rawData as any;

      // Transform career pathway data
      const transformedCareerPathway = {
        ...data.career_pathways,
        description: typeof data.career_pathways.description === 'string'
          ? { content: data.career_pathways.description }
          : typeof data.career_pathways.description === 'object' && 'content' in data.career_pathways.description
            ? data.career_pathways.description
            : { content: JSON.stringify(data.career_pathways.description) },
        requirements: Array.isArray(data.career_pathways.requirements)
          ? data.career_pathways.requirements.map((req: any) =>
              typeof req === 'string' ? { content: req } : req
            )
          : null
      };

      // Transform job role data
      const transformedJob = {
        ...data,
        description: typeof data.description === 'string'
          ? { content: data.description }
          : typeof data.description === 'object' && 'content' in data.description
            ? data.description
            : { content: JSON.stringify(data.description) },
        resources: Array.isArray(data.resources)
          ? data.resources.map((res: any) =>
              typeof res === 'string' ? { content: res } : res
            )
          : null,
        related_jobs: Array.isArray(data.related_jobs)
          ? data.related_jobs.map((rel: any) =>
              typeof rel === 'string' ? { content: rel } : rel
            )
          : null,
        tasks_responsibilities: data.tasks_responsibilities
          ? Object.fromEntries(
              Object.entries(data.tasks_responsibilities).map(([key, value]) => [
                key,
                typeof value === 'string' ? { content: value } : value
              ])
            )
          : null,
        certificates_degrees: data.certificates_degrees
          ? {
              education: Array.isArray(data.certificates_degrees.education)
                ? data.certificates_degrees.education
                : [],
              certificates: Array.isArray(data.certificates_degrees.certificates)
                ? data.certificates_degrees.certificates
                : [],
              experience: Array.isArray(data.certificates_degrees.experience)
                ? data.certificates_degrees.experience
                : []
            }
          : null,
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
