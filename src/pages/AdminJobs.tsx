
import { useState } from "react";
import { Briefcase, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { JobsTable } from "@/components/admin/JobsTable";
import { JobDialog } from "@/components/admin/JobDialog";
import { usePathways } from "@/hooks/use-pathways";
import { useJobs } from "@/hooks/use-jobs";
import type { JobRole } from "@/types/job";

const AdminJobs = () => {
  const [selectedJob, setSelectedJob] = useState<JobRole | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  
  const { jobs, isLoading, createJob, updateJob, deleteJob, reorderJobs } = useJobs();
  const { pathways } = usePathways();

  const handleEdit = (job: JobRole) => {
    setSelectedJob(job);
    setJobDialogOpen(true);
  };

  const handleDelete = (job: JobRole) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedJob) {
      deleteJob.mutate(selectedJob.id);
      setDeleteDialogOpen(false);
      setSelectedJob(null);
    }
  };

  const handleReorder = (reorderedJobs: JobRole[]) => {
    reorderJobs.mutate(reorderedJobs);
  };

  const handleJobSubmit = (data: any) => {
    if (selectedJob) {
      updateJob.mutate({ ...data, id: selectedJob.id });
    } else {
      createJob.mutate(data);
    }
    setJobDialogOpen(false);
    setSelectedJob(null);
  };

  // Group jobs by pathway
  const groupedJobs = jobs?.reduce((acc, job) => {
    const pathwayId = job.pathway_id;
    if (!pathwayId) return acc; // Skip jobs with no pathway_id
    if (!acc[pathwayId]) {
      acc[pathwayId] = [];
    }
    acc[pathwayId].push(job);
    return acc;
  }, {} as Record<string, JobRole[]>) || {};

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center mb-4">
            <Link to="/admin">
              <Button variant="ghost" className="mr-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary-600" />
              <h1 className="text-4xl font-bold text-gray-900">Job Roles</h1>
            </div>
            <Button 
              variant="default" 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => {
                setSelectedJob(null);
                setJobDialogOpen(true);
              }}
            >
              Add Job Role
            </Button>
          </div>

          {isLoading ? (
            <div>Loading jobs...</div>
          ) : (
            <div className="space-y-8">
              {pathways?.map((pathway) => {
                const pathwayJobs = groupedJobs[pathway.id] || [];
                if (pathwayJobs.length === 0) return null;

                return (
                  <Card key={pathway.id} className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">{pathway.title}</h2>
                    <JobsTable
                      jobs={pathwayJobs}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReorder={handleReorder}
                    />
                  </Card>
                );
              })}
            </div>
          )}

          <JobDialog 
            open={jobDialogOpen}
            onOpenChange={setJobDialogOpen}
            onSubmit={handleJobSubmit}
            initialData={selectedJob || undefined}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  job role and remove it from all related pages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminJobs;
