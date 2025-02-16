
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface JobRole {
  id: string;
  pathway_id: string;
  title: string;
  description: {
    content: string;
  };
  level: string;
  certificates_degrees: {
    education?: string[];
    certificates?: string[];
    experience?: string[];
  } | null;
  tasks_responsibilities: Record<string, { content: string }> | null;
  licenses: string[] | null;
  job_projections: string[] | null;
  resources: { content: string; }[] | null;
  related_jobs: { content: string; }[] | null;
  salary: string | null;
  projections: string | null;
  career_pathways: CareerPathway;
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

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job-role", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_roles")
        .select(`
          *,
          career_pathways (*)
        `)
        .eq("id", jobId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      // Transform career pathway data
      const transformedCareerPathway = {
        ...data.career_pathways,
        description: typeof data.career_pathways.description === 'string'
          ? { content: data.career_pathways.description }
          : data.career_pathways.description,
        requirements: Array.isArray(data.career_pathways.requirements)
          ? data.career_pathways.requirements.map(req =>
              typeof req === 'string' ? { content: req } : req
            )
          : null
      };

      // Transform job role data
      return {
        ...data,
        description: typeof data.description === 'string'
          ? { content: data.description }
          : data.description,
        resources: Array.isArray(data.resources)
          ? data.resources.map(res =>
              typeof res === 'string' ? { content: res } : res
            )
          : null,
        related_jobs: Array.isArray(data.related_jobs)
          ? data.related_jobs.map(rel =>
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
        career_pathways: transformedCareerPathway
      } as JobRole;
    },
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
        <Link 
          to={`/explore/pathway/${job.pathway_id}`} 
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {job.career_pathways.title}
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <p className="text-lg text-primary-600 mb-6">
            {job.level.charAt(0).toUpperCase() + job.level.slice(1)} Level Position
          </p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600">{job.description.content}</p>
            </section>

            {tasks.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tasks + Responsibilities</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {tasks.map((task: string, index) => (
                    <li key={index} className="text-gray-600">{task}</li>
                  ))}
                </ul>
              </section>
            )}

            {education.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Education</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {education.map((edu: string, index: number) => (
                    <li key={index} className="text-gray-600">{edu}</li>
                  ))}
                </ul>
              </section>
            )}

            {certificates.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Certificates & Degrees</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {certificates.map((cert: string, index: number) => (
                    <li key={index} className="text-gray-600">{cert}</li>
                  ))}
                </ul>
              </section>
            )}

            {experience.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Work Experience</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {experience.map((exp: string, index: number) => (
                    <li key={index} className="text-gray-600">{exp}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.salary && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Salary</h2>
                <p className="text-gray-600">{job.salary}</p>
              </section>
            )}

            {job.projections && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Job Projections</h2>
                <p className="text-gray-600">{job.projections}</p>
              </section>
            )}

            {resources.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resources</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {resources.map((resource, index) => (
                    <li key={index} className="text-gray-600">{resource}</li>
                  ))}
                </ul>
              </section>
            )}

            {relatedJobs.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Related Jobs</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {relatedJobs.map((relatedJob, index) => (
                    <li key={index} className="text-gray-600">{relatedJob}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
