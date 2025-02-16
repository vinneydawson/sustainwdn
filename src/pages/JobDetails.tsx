
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface JobRole {
  id: string;
  pathway_id: string;
  title: string;
  description: string;
  level: string;
  tasks: string[] | null;
  education: string[] | null;
  certificates: string[] | null;
  experience: string[] | null;
  salary: string | null;
  projections: string | null;
  resources: string[] | null;
  related_jobs: string[] | null;
  career_pathways: CareerPathway;
}

interface CareerPathway {
  id: string;
  title: string;
  description: string;
  level: string;
  icon: string;
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
      return data as JobRole;
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
              <p className="text-gray-600">{job.description}</p>
            </section>

            {job.tasks && job.tasks.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tasks + Responsibilities</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {job.tasks.map((task, index) => (
                    <li key={index} className="text-gray-600">{task}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.education && job.education.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Education</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {job.education.map((edu, index) => (
                    <li key={index} className="text-gray-600">{edu}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.certificates && job.certificates.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Certificates & Degrees</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {job.certificates.map((cert, index) => (
                    <li key={index} className="text-gray-600">{cert}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.experience && job.experience.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Work Experience</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {job.experience.map((exp, index) => (
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

            {job.resources && job.resources.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resources</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {job.resources.map((resource, index) => (
                    <li key={index} className="text-gray-600">{resource}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.related_jobs && job.related_jobs.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Related Jobs</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {job.related_jobs.map((relatedJob, index) => (
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
