
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { JobRole } from "@/types/job";

interface JobHeaderProps {
  job: JobRole;
}

export const JobHeader = ({ job }: JobHeaderProps) => {
  return (
    <>
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
      </div>
    </>
  );
};
