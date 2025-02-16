
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { JobRole } from "@/types/job";

interface PathwayJobCardProps {
  job: JobRole;
}

export const PathwayJobCard = ({ job }: PathwayJobCardProps) => {
  return (
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
  );
};
