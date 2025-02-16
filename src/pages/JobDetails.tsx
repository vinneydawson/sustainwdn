
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
  task_1: {
    content: string;
  };
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
  return { content: JSON.stringify(value) };
};

const parseTasksList = (tasks: string): string[] => {
  return tasks.split('\n').filter(task => task.trim().length > 0);
};

const isCertificatesDegrees = (value: Json | null): value is CertificatesDegreesData => {
  if (!value || typeof value !== 'object') return false;
  const certDegrees = value as any;
  return (
    Array.isArray(certDegrees.education) &&
    Array.isArray(certDegrees.certificates) &&
    Array.isArray(certDegrees.experience)
  );
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

      console.log("Fetching job with ID:", jobId);
      
      try {
        const { data: rawData, error: fetchError } = await supabase
          .from("job_roles")
          .select(`
            *,
            career_pathways (*)
          `)
          .eq('id', jobId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching job:", fetchError);
          throw fetchError;
        }

        if (!rawData) {
          console.log("No job found with ID:", jobId);
          return null;
        }

        console.log("Raw job data:", rawData);

        // Transform career pathway data
        const transformedCareerPathway = rawData.career_pathways ? {
          ...rawData.career_pathways,
          description: transformContent(rawData.career_pathways.description),
          requirements: Array.isArray(rawData.career_pathways.requirements)
            ? rawData.career_pathways.requirements.map(req => transformContent(req))
            : null
        } : null;

        // Get tasks from task_1 content and split into array
        const tasksResponsibilities = rawData.tasks_responsibilities as TasksResponsibilities;
        const tasksContent = tasksResponsibilities?.task_1?.content || '';
        const tasksList = parseTasksList(tasksContent);

        // Transform job role data
        const transformedJob = {
          ...rawData,
          description: transformContent(rawData.description),
          resources: Array.isArray(rawData.resources)
            ? rawData.resources.map(res => transformContent(res))
            : [],
          related_jobs: Array.isArray(rawData.related_jobs)
            ? rawData.related_jobs.map(rel => transformContent(rel))
            : [],
          tasks_responsibilities: tasksList.reduce((acc, task, index) => {
            acc[`task_${index + 1}`] = { content: task };
            return acc;
          }, {} as Record<string, { content: string }>),
          certificates_degrees: isCertificatesDegrees(rawData.certificates_degrees) ? {
            education: rawData.certificates_degrees.education,
            certificates: rawData.certificates_degrees.certificates.map(cert => {
              const [text] = cert.split('|');
              return text;
            }),
            experience: rawData.certificates_degrees.experience
          } : {
            education: [],
            certificates: [],
            experience: []
          },
          career_pathways: transformedCareerPathway
        };

        console.log("Transformed job data:", transformedJob);
        return transformedJob as JobRole;
      } catch (error) {
        console.error("Error in job query:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
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

  if (error) {
    console.error("Query error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
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
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
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

  const tasks = job.tasks_responsibilities ? Object.values(job.tasks_responsibilities).map(t => t.content) : [];
  const education = job.certificates_degrees?.education || [];
  const certificates = job.certificates_degrees?.certificates || [];
  const experience = job.certificates_degrees?.experience || [];
  const resources = job.resources?.map(r => r.content) || [];
  const relatedJobs = job.related_jobs?.map(r => r.content) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
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

            {tasks.length > 0 && (
              <JobListSection title="Tasks + Responsibilities" items={tasks} />
            )}
            
            {education.length > 0 && (
              <JobListSection title="Education" items={education} />
            )}
            
            {certificates.length > 0 && (
              <JobListSection title="Certificates & Degrees" items={certificates} />
            )}
            
            {experience.length > 0 && (
              <JobListSection title="Work Experience" items={experience} />
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

            {resources.length > 0 && (
              <JobListSection title="Resources" items={resources} />
            )}
            
            {relatedJobs.length > 0 && (
              <JobListSection title="Related Jobs" items={relatedJobs} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
